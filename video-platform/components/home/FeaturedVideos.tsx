'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { CarouselRow } from './CarouselRow';
import { Thumb } from './Thumb';
import { featuredVideos } from '@/lib/home-data';

/**
 * (F) Short-form video thumbnails (click → Discover/TikTok feed), each with
 * linkable products listed below that route to the product/business.
 */
export function FeaturedVideos() {
  return (
    <CarouselRow title="Featured in videos">
      {featuredVideos.map((v) => (
        <div key={v.id} className="w-[180px] shrink-0 sm:w-[200px]">
          <Link href={v.href} className="group/vid relative block overflow-hidden rounded-2xl">
            <Thumb
              src={v.thumbnail}
              label={v.businessName}
              alt={v.title}
              className="aspect-[9/14] rounded-2xl"
              imgClassName="h-full w-full object-cover transition duration-500 group-hover/vid:scale-105"
            />
            <span className="absolute inset-0 bg-black/30" />
            <span className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-black shadow">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="absolute bottom-2 left-2 right-2 text-white">
              <span className="block truncate text-sm font-semibold">{v.title}</span>
              <span className="block truncate text-xs text-white">{v.businessName} · {v.views} views</span>
            </span>
          </Link>

          {/* Linkable products under the video */}
          <div className="mt-2 flex flex-col gap-1.5">
            {v.products.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 transition hover:border-[#f97316] dark:border-gray-700 dark:bg-gray-900"
              >
                <Thumb src={p.image} label={p.title} alt={p.title} className="h-8 w-8 shrink-0 rounded-lg" imgClassName="h-full w-full object-cover" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-black dark:text-white">{p.title}</span>
                <span className="text-xs font-bold text-black dark:text-white">${p.price.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </CarouselRow>
  );
}
