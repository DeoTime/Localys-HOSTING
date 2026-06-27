'use client';

/**
 * StorePrimitives.tsx — small, presentational building blocks reused across the
 * store page: a fault-tolerant item image (with a neutral placeholder) and a
 * fractional star-rating display. Kept separate so the page and item cards can
 * share them without duplicating markup.
 */
import { useState } from 'react';
import { Star } from 'lucide-react';

/** Brand orange — single constant so the accent colour stays consistent. */
export const ORANGE = '#f97316';

/**
 * Item/banner image that falls back to a neutral placeholder icon when the
 * source is missing or fails to load, so the layout never shows a broken image.
 */
export function ItemImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <svg className="h-1/3 w-1/3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-8-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

/**
 * Five-star rating display that supports fractional fills (e.g. 4.3 stars) by
 * clipping the orange star overlay to the remaining fraction of each star.
 */
export function Stars({ value, className = 'h-3.5 w-3.5' }: { value: number; className?: string }) {
  return (
    <div className="flex items-center" aria-label={`Rated ${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={`relative inline-block ${className}`}>
            <Star className={`absolute inset-0 ${className} text-gray-300`} strokeWidth={1.5} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${className} text-[${ORANGE}]`} style={{ fill: ORANGE, color: ORANGE }} strokeWidth={1.5} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
