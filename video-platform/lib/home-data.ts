/**
 * Seeded PLACEHOLDER data for the Walmart-style Home feed.
 *
 * Every visual item carries an optional `image` field. When it's missing the UI
 * falls back to an `emoji` (and a soft gradient), so real photos can be swapped
 * in later by simply setting `image: '/landing/your-photo.jpg'` (or any URL) on
 * the relevant entry — no component changes required.
 */

export interface Review {
  rating: number; // 0–5 (can be fractional)
  count: number; // number of reviews
}

/** The core card model used everywhere (deals, trending, ranked lists, …). */
export interface Product {
  id: string;
  title: string; // short name / headline
  description: string; // one-line description shown under the price
  businessId: string;
  businessName: string;
  price: number; // current (discounted) price
  originalPrice?: number; // struck-through original when discounted
  discountPct?: number; // e.g. 30 → "30% off" badge
  image?: string; // real photo path/URL — swap in later
  emoji: string; // placeholder shown when image is missing
  rating: number; // 0–5
  reviewCount: number;
  href: string; // where the card links to
}

export interface Business {
  id: string;
  name: string;
  image?: string;
  emoji: string;
  category: string;
  rating: number;
  reviewCount: number;
  href: string;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  image?: string;
  href: string;
}

export interface VideoCard {
  id: string;
  title: string;
  businessName: string;
  thumbnail?: string; // real thumbnail — swap in later
  emoji: string;
  views: string; // pre-formatted, e.g. "12.4k"
  href: string; // navigates to the Discover (TikTok) feed
  products: { id: string; title: string; price: number; emoji: string; href: string }[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  current: number;
  goal: number;
  reward: number; // coins
  emoji: string;
}

export interface RankedList {
  id: string;
  title: string;
  items: Product[];
}

export interface DealTile {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  image?: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/* A — Top deals mosaic (marquee strip)                                */
/* ------------------------------------------------------------------ */
export const dealTiles: DealTile[] = [
  { id: 'd1', title: 'Bakery deals', subtitle: 'Up to 30% off', emoji: '🥐', href: '/home' },
  { id: 'd2', title: 'Café faves', subtitle: 'Buy 1 get 1', emoji: '☕', href: '/home' },
  { id: 'd3', title: 'Fresh flowers', subtitle: 'Save 25%', emoji: '💐', href: '/home' },
  { id: 'd4', title: 'Taco Tuesday', subtitle: '2 for $9', emoji: '🌮', href: '/home' },
  { id: 'd5', title: 'HVAC tune-up', subtitle: '$49 special', emoji: '🛠️', href: '/home' },
  { id: 'd6', title: 'Sweet treats', subtitle: 'Up to 40% off', emoji: '🧁', href: '/home' },
  { id: 'd7', title: 'Local roast', subtitle: 'Free refill', emoji: '🫘', href: '/home' },
  { id: 'd8', title: 'Bookstore', subtitle: '15% off picks', emoji: '📚', href: '/home' },
];

/* ------------------------------------------------------------------ */
/* A — Challenges                                                      */
/* ------------------------------------------------------------------ */
export const dailyChallenges: Challenge[] = [
  { id: 'c1', title: 'Visit 3 local businesses', description: 'Check in today to earn coins', current: 1, goal: 3, reward: 50, emoji: '📍' },
  { id: 'c2', title: 'Like 5 videos', description: 'Support local creators', current: 3, goal: 5, reward: 20, emoji: '❤️' },
];

export const monthlyChallenges: Challenge[] = [
  { id: 'm1', title: 'Try 10 new spots', description: 'Explore your neighbourhood', current: 4, goal: 10, reward: 300, emoji: '🗺️' },
  { id: 'm2', title: 'Spend at 8 businesses', description: 'Keep it local all month', current: 5, goal: 8, reward: 250, emoji: '🪙' },
];

/* ------------------------------------------------------------------ */
/* B / E / G — Product carousels                                       */
/* ------------------------------------------------------------------ */
export const dealsAndMore: Product[] = [
  { id: 'p1', title: 'Sourdough Loaf', description: 'Ana’s Pastry — baked fresh daily', businessId: 'b1', businessName: 'Ana’s Pastry', price: 5.6, originalPrice: 8, discountPct: 30, emoji: '🍞', rating: 4.8, reviewCount: 214, href: '/profile/b1' },
  { id: 'p2', title: 'Cold Brew 16oz', description: 'Align Coffee — single origin', businessId: 'b2', businessName: 'Align Coffee', price: 3.75, originalPrice: 5, discountPct: 25, emoji: '🧋', rating: 4.7, reviewCount: 158, href: '/profile/b2' },
  { id: 'p3', title: 'Spring Bouquet', description: 'Bloom & Co — seasonal mix', businessId: 'b3', businessName: 'Bloom & Co', price: 18, originalPrice: 24, discountPct: 25, emoji: '💐', rating: 4.9, reviewCount: 92, href: '/profile/b3' },
  { id: 'p4', title: 'Birria Tacos (3)', description: 'El Sabor — slow-braised beef', businessId: 'b4', businessName: 'El Sabor', price: 9, originalPrice: 12, discountPct: 25, emoji: '🌮', rating: 4.8, reviewCount: 331, href: '/profile/b4' },
  { id: 'p5', title: 'Furnace Tune-up', description: 'Arnold HVAC — 21-point check', businessId: 'b5', businessName: 'Arnold HVAC', price: 49, originalPrice: 89, discountPct: 45, emoji: '🛠️', rating: 4.6, reviewCount: 76, href: '/profile/b5' },
  { id: 'p6', title: 'Matcha Croissant', description: 'Ana’s Pastry — limited batch', businessId: 'b1', businessName: 'Ana’s Pastry', price: 4.2, originalPrice: 6, discountPct: 30, emoji: '🥐', rating: 4.7, reviewCount: 119, href: '/profile/b1' },
];

export const trendingArea: Product[] = [
  { id: 't1', title: 'Smash Burger', description: 'Burger Bros — double patty', businessId: 'b6', businessName: 'Burger Bros', price: 11.5, emoji: '🍔', rating: 4.9, reviewCount: 402, href: '/profile/b6' },
  { id: 't2', title: 'Catering Platter', description: 'Fresh Catering — serves 10', businessId: 'b7', businessName: 'Fresh Catering', price: 89, originalPrice: 110, discountPct: 19, emoji: '🍽️', rating: 4.8, reviewCount: 64, href: '/profile/b7' },
  { id: 't3', title: 'Lawn Care Visit', description: 'Green Acres — full service', businessId: 'b8', businessName: 'Green Acres', price: 60, emoji: '🌿', rating: 4.7, reviewCount: 88, href: '/profile/b8' },
  { id: 't4', title: 'Used Classics Set', description: 'Corner Bookstore — 3 titles', businessId: 'b9', businessName: 'Corner Bookstore', price: 15, originalPrice: 20, discountPct: 25, emoji: '📚', rating: 4.9, reviewCount: 51, href: '/profile/b9' },
  { id: 't5', title: 'Print Bundle', description: 'Advanced Printing — 100 flyers', businessId: 'b10', businessName: 'Advanced Printing', price: 39, originalPrice: 55, discountPct: 29, emoji: '🖨️', rating: 4.6, reviewCount: 47, href: '/profile/b10' },
  { id: 't6', title: 'Iced Latte', description: 'Align Coffee — oat milk', businessId: 'b2', businessName: 'Align Coffee', price: 4.5, emoji: '☕', rating: 4.7, reviewCount: 173, href: '/profile/b2' },
];

export const otherBusinesses: Product[] = [
  { id: 'o1', title: 'Vegan Bowl', description: 'Acuvega — protein packed', businessId: 'b11', businessName: 'Acuvega', price: 12.5, originalPrice: 15, discountPct: 16, emoji: '🥗', rating: 4.8, reviewCount: 96, href: '/profile/b11' },
  { id: 'o2', title: 'Pet Grooming', description: 'Paws & Co — full groom', businessId: 'b12', businessName: 'Paws & Co', price: 45, emoji: '🐾', rating: 4.9, reviewCount: 142, href: '/profile/b12' },
  { id: 'o3', title: 'Yoga Drop-in', description: 'Still Studio — 60 min', businessId: 'b13', businessName: 'Still Studio', price: 18, originalPrice: 22, discountPct: 18, emoji: '🧘', rating: 4.9, reviewCount: 210, href: '/profile/b13' },
  { id: 'o4', title: 'Pizza Slice x2', description: 'Nonna’s — wood fired', businessId: 'b14', businessName: 'Nonna’s', price: 7, emoji: '🍕', rating: 4.7, reviewCount: 288, href: '/profile/b14' },
  { id: 'o5', title: 'Haircut', description: 'Fade Lab — skin fade', businessId: 'b15', businessName: 'Fade Lab', price: 30, originalPrice: 40, discountPct: 25, emoji: '💈', rating: 4.8, reviewCount: 134, href: '/profile/b15' },
];

/* ------------------------------------------------------------------ */
/* D — Shop by department                                              */
/* ------------------------------------------------------------------ */
export const categories: Category[] = [
  { id: 'cat1', label: 'Restaurants', emoji: '🍽️', href: '/feed' },
  { id: 'cat2', label: 'Bakery', emoji: '🥐', href: '/feed' },
  { id: 'cat3', label: 'Café', emoji: '☕', href: '/feed' },
  { id: 'cat4', label: 'HVAC', emoji: '🛠️', href: '/feed' },
  { id: 'cat5', label: 'Plumbing', emoji: '🔧', href: '/feed' },
  { id: 'cat6', label: 'Flowers', emoji: '💐', href: '/feed' },
  { id: 'cat7', label: 'Beauty', emoji: '💈', href: '/feed' },
  { id: 'cat8', label: 'Grocery', emoji: '🛒', href: '/feed' },
  { id: 'cat9', label: 'Fitness', emoji: '🧘', href: '/feed' },
  { id: 'cat10', label: 'Books', emoji: '📚', href: '/feed' },
];

/* ------------------------------------------------------------------ */
/* F — Featured videos (click → Discover feed)                         */
/* ------------------------------------------------------------------ */
export const featuredVideos: VideoCard[] = [
  {
    id: 'v1', title: 'Inside Ana’s 5am bake', businessName: 'Ana’s Pastry', emoji: '🥐', views: '12.4k', href: '/feed',
    products: [
      { id: 'vp1', title: 'Croissant', price: 4.2, emoji: '🥐', href: '/profile/b1' },
      { id: 'vp2', title: 'Sourdough', price: 5.6, emoji: '🍞', href: '/profile/b1' },
    ],
  },
  {
    id: 'v2', title: 'Pour-over masterclass', businessName: 'Align Coffee', emoji: '☕', views: '8.1k', href: '/feed',
    products: [
      { id: 'vp3', title: 'Cold Brew', price: 3.75, emoji: '🧋', href: '/profile/b2' },
      { id: 'vp4', title: 'Beans 250g', price: 14, emoji: '🫘', href: '/profile/b2' },
    ],
  },
  {
    id: 'v3', title: 'Birria, slow & low', businessName: 'El Sabor', emoji: '🌮', views: '23.7k', href: '/feed',
    products: [
      { id: 'vp5', title: 'Birria Tacos', price: 9, emoji: '🌮', href: '/profile/b4' },
      { id: 'vp6', title: 'Consommé', price: 3, emoji: '🍲', href: '/profile/b4' },
    ],
  },
  {
    id: 'v4', title: 'Spring arrangements', businessName: 'Bloom & Co', emoji: '💐', views: '5.6k', href: '/feed',
    products: [
      { id: 'vp7', title: 'Bouquet', price: 18, emoji: '💐', href: '/profile/b3' },
      { id: 'vp8', title: 'Single stem', price: 4, emoji: '🌷', href: '/profile/b3' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* H — Ranked lists (repeatable pattern)                               */
/* ------------------------------------------------------------------ */
export const rankedLists: RankedList[] = [
  { id: 'r1', title: 'Top selling restaurants', items: [dealsAndMore[3], trendingArea[0], otherBusinesses[3], trendingArea[1], otherBusinesses[0]] },
  { id: 'r2', title: 'Highest rated services', items: [dealsAndMore[4], otherBusinesses[1], otherBusinesses[2], trendingArea[2], otherBusinesses[4]] },
  { id: 'r3', title: 'Grab nearest options for cheap', items: [dealsAndMore[1], otherBusinesses[3], dealsAndMore[5], trendingArea[5], dealsAndMore[0]] },
];
