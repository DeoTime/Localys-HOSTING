'use client';

import { CarouselRow } from './CarouselRow';
import { BusinessCard } from './BusinessCard';
import { useHomeData } from './HomeData';
import type { LocalBusiness } from '@/lib/supabase/featured';

/**
 * A carousel of real business cards. `select` chooses/orders which businesses
 * to show. Renders nothing while loading or when empty.
 */
export function BusinessesRow({
  title,
  seeAllHref,
  select = (b) => b,
  list: listProp,
}: {
  title: string;
  seeAllHref?: string;
  select?: (businesses: LocalBusiness[]) => LocalBusiness[];
  list?: LocalBusiness[]; // pre-composed (themed/deduped) businesses from useHomeFeed
}) {
  const { businesses, loading } = useHomeData();
  const list = listProp ?? select(businesses);
  if (loading || list.length === 0) return null;
  return (
    <CarouselRow title={title} seeAllHref={seeAllHref}>
      {list.map((b, i) => <BusinessCard key={`${b.id}-${i}`} business={b} />)}
    </CarouselRow>
  );
}
