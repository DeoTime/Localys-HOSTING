'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Thumb } from './Thumb';
import { Stars } from './Stars';
import type { LocalBusiness } from '@/lib/supabase/featured';
import { useStoreDistance } from '@/lib/utils/useStoreDistance';

/**
 * A business-focused card (real seeded business): photo, name, department, and
 * a from-price derived from its cheapest menu item. Links to the real profile.
 */
export function BusinessCard({ business }: { business: LocalBusiness }) {
  const fromPrice = business.products.length
    ? business.products.slice().sort((a, b) => a.price - b.price)[0].price
    : null;
  const { label: distanceLabel, etaLabel } = useStoreDistance(business.address);

  return (
    <Link
      href={business.href}
      className="group/card flex w-[170px] shrink-0 flex-col sm:w-[200px]"
    >
      <div className="relative block overflow-hidden rounded-2xl">
        <Thumb
          src={business.image}
          label={business.name}
          alt={business.name}
          className="aspect-square rounded-2xl"
          imgClassName="h-full w-full object-cover transition duration-500 group-hover/card:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-black shadow-sm backdrop-blur dark:bg-gray-900/80 dark:text-white">
          {business.category}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <span className="line-clamp-1 text-sm font-semibold text-black group-hover/card:underline dark:text-white">
          {business.name}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {business.products.length} item{business.products.length === 1 ? '' : 's'}
          {fromPrice != null ? ` · from $${fromPrice.toFixed(2)}` : ''}
        </span>
        {business.reviewCount > 0 ? (
          <Stars rating={business.rating} reviewCount={business.reviewCount} />
        ) : (
          <span className="text-xs font-medium text-[#f97316]">New</span>
        )}
        {distanceLabel && (
          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            <MapPin className="h-3 w-3 shrink-0 text-[#f97316]" />
            {distanceLabel}
            {etaLabel ? <span className="text-gray-400">· {etaLabel}</span> : null}
          </span>
        )}
      </div>
    </Link>
  );
}
