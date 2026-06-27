'use client';

import { useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { getUserMenu } from '@/lib/supabase/profiles';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { AliasItem } from '@/lib/businessAliases';

const MAX_CARDS = 4;

/**
 * Left-side item cards for the Discover feed: shows a few of the business's items
 * (image, name, price, add-to-cart) tied to the video being watched. When `items`
 * is supplied (aliased businesses, e.g. Pho Xe Lua) those are shown directly;
 * otherwise the business's Supabase menu is loaded via getUserMenu(userId).
 * Palette only: white cards, black text, orange price/accent.
 */
export function BusinessItemsRail({
  userId,
  businessId,
  businessName,
  items: itemsProp,
}: {
  userId: string;
  businessId: string;
  businessName: string;
  items?: AliasItem[];
}) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const hasProvidedItems = !!itemsProp?.length;
  const [loadedItems, setLoadedItems] = useState<AliasItem[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    // Pre-supplied items (aliased businesses) need no fetch.
    if (hasProvidedItems || !userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await getUserMenu(userId);
      const menuItems = (data?.menu_items ?? []).filter((i) => i.is_available !== false);
      if (!cancelled) {
        setLoadedItems(
          menuItems.map((it) => ({
            id: it.id,
            name: it.item_name,
            price: Number(it.price) || 0,
            image: it.image_url || undefined,
          })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasProvidedItems, userId]);

  const items = hasProvidedItems ? itemsProp! : loadedItems;
  const shown = items.slice(0, MAX_CARDS);
  if (shown.length === 0) return null;

  return (
    <div className="pointer-events-auto hidden w-[170px] flex-col gap-2 sm:flex">
      <p
        className="px-1 text-xs font-bold text-white"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
      >
        {businessName}
      </p>
      {shown.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur"
        >
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg bg-black/10" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-black">{item.name}</span>
            <span className="text-xs font-bold text-[#f97316]">${item.price.toFixed(2)}</span>
          </span>
          <button
            type="button"
            aria-label={`Add ${item.name} to cart`}
            onClick={() => {
              addToCart({
                itemId: item.id,
                itemName: item.name,
                itemPrice: item.price,
                itemImage: item.image,
                sellerId: businessId || userId,
                buyerId: user?.id ?? 'guest',
                quantity: 1,
              });
              setAddedId(item.id);
              window.setTimeout(() => setAddedId((p) => (p === item.id ? null : p)), 1200);
            }}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white transition hover:opacity-90"
          >
            {addedId === item.id ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      ))}
    </div>
  );
}
