import { supabase } from './client';

export type SearchMode = 'videos' | 'businesses';

export interface SearchFilters {
  query?: string;
  category?: 'food' | 'retail' | 'services';
  minRating?: number;
  maxDistance?: number; // in km
  priceMin?: number;
  priceMax?: number;
  latitude?: number;
  longitude?: number;
  // New filter fields
  cuisineType?: string;
  formality?: string;
  specialType?: string;
  dietary?: string[];
  features?: string[];
  amenities?: string[];
  payment?: string[];
  tags?: string[];
  openNow?: boolean;
}

/**
 * Semantic keyword mapping for food search
 * Maps common search terms to related terms for broader matching
 */
const SEMANTIC_MAP: Record<string, string[]> = {
  // Noodle-related
  noodle: ['pho', 'ramen', 'spaghetti', 'pasta', 'udon', 'soba', 'lo mein', 'chow mein', 'pad thai', 'laksa', 'noodle'],
  pho: ['pho', 'noodle', 'vietnamese', 'soup'],
  ramen: ['ramen', 'noodle', 'japanese', 'soup'],
  pasta: ['pasta', 'spaghetti', 'fettuccine', 'penne', 'linguine', 'italian', 'noodle'],
  spaghetti: ['spaghetti', 'pasta', 'italian', 'noodle'],
  udon: ['udon', 'noodle', 'japanese', 'soup'],
  // Rice-related
  rice: ['rice', 'fried rice', 'biryani', 'risotto', 'sushi', 'poke', 'bibimbap'],
  sushi: ['sushi', 'sashimi', 'japanese', 'rice', 'maki', 'nigiri'],
  // Bread/baked
  bread: ['bread', 'bakery', 'baguette', 'sourdough', 'croissant', 'pastry'],
  pizza: ['pizza', 'italian', 'flatbread', 'calzone'],
  burger: ['burger', 'hamburger', 'cheeseburger', 'fast food', 'american'],
  // Drinks
  coffee: ['coffee', 'espresso', 'latte', 'cappuccino', 'cafe', 'mocha', 'americano'],
  tea: ['tea', 'boba', 'bubble tea', 'matcha', 'chai', 'bbt'],
  boba: ['boba', 'bubble tea', 'bbt', 'tea', 'milk tea', 'taro'],
  // Cuisine
  chinese: ['chinese', 'dim sum', 'dumpling', 'wonton', 'szechuan', 'cantonese'],
  japanese: ['japanese', 'sushi', 'ramen', 'udon', 'tempura', 'teriyaki', 'izakaya'],
  korean: ['korean', 'bbq', 'bibimbap', 'kimchi', 'bulgogi', 'tteokbokki'],
  mexican: ['mexican', 'taco', 'burrito', 'quesadilla', 'enchilada', 'salsa'],
  italian: ['italian', 'pasta', 'pizza', 'risotto', 'gelato', 'tiramisu'],
  indian: ['indian', 'curry', 'naan', 'biryani', 'tandoori', 'masala'],
  thai: ['thai', 'pad thai', 'curry', 'tom yum', 'satay', 'green curry'],
  vietnamese: ['vietnamese', 'pho', 'banh mi', 'spring roll', 'bun'],
  // General
  dessert: ['dessert', 'cake', 'ice cream', 'pastry', 'gelato', 'pie', 'cookie', 'brownie'],
  breakfast: ['breakfast', 'brunch', 'pancake', 'waffle', 'eggs', 'bacon', 'toast'],
  seafood: ['seafood', 'fish', 'shrimp', 'lobster', 'crab', 'oyster', 'salmon'],
  steak: ['steak', 'beef', 'ribeye', 'filet', 'grill', 'bbq'],
  salad: ['salad', 'healthy', 'greens', 'bowl', 'vegan'],
  soup: ['soup', 'pho', 'ramen', 'chowder', 'stew', 'broth', 'bisque'],
  sandwich: ['sandwich', 'sub', 'wrap', 'panini', 'deli', 'hoagie'],
  taco: ['taco', 'mexican', 'burrito', 'quesadilla', 'taqueria'],
  curry: ['curry', 'indian', 'thai', 'japanese curry', 'masala'],
  dumpling: ['dumpling', 'gyoza', 'wonton', 'momo', 'pierogi', 'chinese'],
  bbq: ['bbq', 'barbecue', 'grill', 'smoked', 'ribs', 'brisket'],
  vegan: ['vegan', 'plant-based', 'vegetarian', 'healthy', 'salad'],
  halal: ['halal', 'mediterranean', 'middle eastern', 'kebab'],
  brunch: ['brunch', 'breakfast', 'mimosa', 'benedict', 'french toast'],
};

/**
 * Expand a search query using semantic keyword mapping
 */
export function expandSearchQuery(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  const terms = new Set<string>([normalizedQuery]);

  // Check each word in the query against the semantic map
  const words = normalizedQuery.split(/\s+/);
  for (const word of words) {
    const related = SEMANTIC_MAP[word];
    if (related) {
      related.forEach((term) => terms.add(term));
    }
  }

  return Array.from(terms);
}

/**
 * AI-assisted search abstraction layer
 * This can be extended to call actual AI services (e.g., DeepSeek)
 */
export async function aiAssistedSearch(filters: SearchFilters) {
  // For now, this is a clean abstraction that can be extended
  // When AI is connected, this function will:
  // 1. Send query to AI service
  // 2. Get interpreted intent (keywords, location, category)
  // 3. Rank results by relevance
  // 4. Return enhanced search results

  // Placeholder: Return filters as-is for now
  return filters;
}

/**
 * Search videos with semantic expansion
 */
export async function searchVideos(filters: SearchFilters) {
  const interpretedFilters = await aiAssistedSearch(filters);

  let query = supabase
    .from('videos')
    .select('*');

  // Apply text search with semantic expansion
  if (interpretedFilters.query) {
    const expandedTerms = expandSearchQuery(interpretedFilters.query);
    // Build OR filter for all semantic terms
    const orFilters = expandedTerms.map((term) => `caption.ilike.%${term}%`).join(',');
    query = query.or(orFilters);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Search query error:', error);
    return { data: [], error };
  }

  // Now fetch related data for each video
  const results = await Promise.all(
    (data || []).map(async (video: any) => {
      let enrichedVideo = { ...video };

      if (video.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, full_name, profile_picture_url')
          .eq('id', video.user_id)
          .single();
        if (profile) {
          enrichedVideo.profiles = profile;
        }
      }

      if (video.business_id) {
        try {
          const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', video.business_id);

          if (!businessError && businesses && businesses.length > 0) {
            const business = businesses[0];
            enrichedVideo.businesses = {
              id: business.id,
              business_name: business.business_name,
              category: business.category,
              profile_picture_url: business.profile_picture_url,
              latitude: business.latitude,
              longitude: business.longitude,
              average_rating: business.average_rating,
              total_reviews: business.total_reviews,
              price_range_min: business.price_range_min,
              price_range_max: business.price_range_max,
            };
          }
        } catch (err) {
          console.error(`Exception fetching business ${video.business_id}:`, err);
        }
      }

      return enrichedVideo;
    })
  );

  // Apply client-side filters
  let filteredResults = results;

  if (interpretedFilters.category) {
    filteredResults = filteredResults.filter((video) => {
      if (video.businesses?.category) {
        return video.businesses.category === interpretedFilters.category;
      }
      return false;
    });
  }

  if (interpretedFilters.minRating) {
    filteredResults = filteredResults.filter((video) => {
      return video.businesses?.average_rating && video.businesses.average_rating >= interpretedFilters.minRating!;
    });
  }

  if (interpretedFilters.priceMin !== undefined || interpretedFilters.priceMax !== undefined) {
    filteredResults = filteredResults.filter((video) => {
      if (!video.businesses) return false;
      const minPrice = video.businesses.price_range_min || 0;
      const maxPrice = video.businesses.price_range_max || 1000;
      const filterMin = interpretedFilters.priceMin || 0;
      const filterMax = interpretedFilters.priceMax || 1000;
      return !(maxPrice < filterMin || minPrice > filterMax);
    });
  }

  const rankedResults = rankSearchResults(filteredResults, interpretedFilters);
  return { data: rankedResults, error: null };
}

/**
 * Search businesses directly with semantic expansion and advanced filters
 */
export async function searchBusinesses(filters: SearchFilters) {
  const interpretedFilters = await aiAssistedSearch(filters);

  let query = supabase
    .from('businesses')
    .select('*');

  // Apply text search with semantic expansion
  if (interpretedFilters.query) {
    const expandedTerms = expandSearchQuery(interpretedFilters.query);
    const orFilters = expandedTerms
      .map((term) => `business_name.ilike.%${term}%`)
      .join(',');
    query = query.or(orFilters);
  }

  // Apply category filter at DB level
  if (interpretedFilters.category) {
    query = query.eq('category', interpretedFilters.category);
  }

  // Apply rating filter at DB level
  if (interpretedFilters.minRating) {
    query = query.gte('average_rating', interpretedFilters.minRating);
  }

  const { data, error } = await query
    .order('average_rating', { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) {
    console.error('Business search error:', error);
    return { data: [], error };
  }

  let filteredResults = data || [];

  // Apply price range filter client-side
  if (interpretedFilters.priceMin !== undefined || interpretedFilters.priceMax !== undefined) {
    filteredResults = filteredResults.filter((biz: any) => {
      const minPrice = biz.price_range_min || 0;
      const maxPrice = biz.price_range_max || 1000;
      const filterMin = interpretedFilters.priceMin || 0;
      const filterMax = interpretedFilters.priceMax || 1000;
      return !(maxPrice < filterMin || minPrice > filterMax);
    });
  }

  // Apply distance filter client-side if user location available
  if (
    interpretedFilters.maxDistance &&
    interpretedFilters.latitude !== undefined &&
    interpretedFilters.longitude !== undefined
  ) {
    filteredResults = filteredResults.filter((biz: any) => {
      if (!biz.latitude || !biz.longitude) return true;
      const dist = haversineDistance(
        interpretedFilters.latitude!,
        interpretedFilters.longitude!,
        biz.latitude,
        biz.longitude
      );
      return dist <= interpretedFilters.maxDistance!;
    });
  }

  // Rank results
  const rankedResults = rankBusinessResults(filteredResults, interpretedFilters);
  return { data: rankedResults, error: null };
}

/**
 * Calculate distance between two lat/lng points using Haversine formula
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Rank video search results by relevance
 */
function rankSearchResults(results: any[], filters: SearchFilters) {
  return results.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.businesses?.average_rating) scoreA += a.businesses.average_rating * 10;
    if (b.businesses?.average_rating) scoreB += b.businesses.average_rating * 10;

    if (a.created_at) scoreA += new Date(a.created_at).getTime() / 1000000;
    if (b.created_at) scoreB += new Date(b.created_at).getTime() / 1000000;

    return scoreB - scoreA;
  });
}

/**
 * Rank business search results by relevance
 */
function rankBusinessResults(results: any[], filters: SearchFilters) {
  return results.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Boost by rating
    if (a.average_rating) scoreA += a.average_rating * 20;
    if (b.average_rating) scoreB += b.average_rating * 20;

    // Boost by review count
    if (a.total_reviews) scoreA += Math.min(a.total_reviews, 50);
    if (b.total_reviews) scoreB += Math.min(b.total_reviews, 50);

    // If user location available, boost closer results
    if (filters.latitude && filters.longitude) {
      if (a.latitude && a.longitude) {
        const distA = haversineDistance(filters.latitude, filters.longitude, a.latitude, a.longitude);
        scoreA += Math.max(0, 50 - distA);
      }
      if (b.latitude && b.longitude) {
        const distB = haversineDistance(filters.latitude, filters.longitude, b.latitude, b.longitude);
        scoreB += Math.max(0, 50 - distB);
      }
    }

    return scoreB - scoreA;
  });
}
