'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/lib/home-data';
import { Stars } from './Stars';

/**
 * THE reusable Walmart-style product/business card used across every Home row.
 *
 * Layout: image (with heart top-right) → "+ Add" → price (discounted + struck
 * original) → title/description → stars + review count. Falls back to an emoji
 * + gradient when `product.image` is missing so real photos drop in trivially.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      itemId: product.id,
      itemName: product.title,
      itemPrice: product.price,
      itemImage: product.image,
      sellerId: product.businessId,
      buyerId: user?.id ?? 'guest',
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group/card flex w-[170px] shrink-0 flex-col sm:w-[200px]">
      {/* Image */}
      <Link
        href={product.href}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-800 dark:to-gray-700"
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover/card:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl">{product.emoji}</span>
        )}

        {product.discountPct ? (
          <span className="absolute left-2 top-2 rounded-full bg-[#f97316] px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            {product.discountPct}% off
          </span>
        ) : null}

        <button
          type="button"
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
          onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-200"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-[#f97316] text-[#f97316]' : ''}`} strokeWidth={1.8} />
        </button>
      </Link>

      {/* Body */}
      <div className="mt-2 flex flex-col gap-1">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex w-fit items-center gap-1 rounded-full border border-[#f97316] px-3 py-1 text-sm font-semibold text-[#f97316] transition hover:bg-[#f97316] hover:text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {added ? 'Added' : 'Add'}
        </button>

        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
          {product.originalPrice ? (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          ) : null}
        </div>

        <Link href={product.href} className="line-clamp-2 text-sm text-gray-700 hover:underline dark:text-gray-300">
          {product.title} — <span className="text-gray-500 dark:text-gray-400">{product.description}</span>
        </Link>

        <Stars rating={product.rating} reviewCount={product.reviewCount} />
      </div>
    </div>
  );
}
