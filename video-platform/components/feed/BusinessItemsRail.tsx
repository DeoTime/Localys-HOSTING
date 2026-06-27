'use client';

import { useEffect, useState } from 'react';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { getUserMenu } from '@/lib/supabase/profiles';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { AliasItem } from '@/lib/businessAliases';

// Render up to 6; how many actually show scales with viewport width via CSS below.
const MAX_CARDS = 6;

// Extra cards (beyond the first 3) reveal progressively on larger screens, so the
// rail shows MORE item info when the window is maximized.
const cardVisibility = (i: number) =>
  i < 3 ? '' : i === 3 ? 'hidden lg:block' : i === 4 ? 'hidden xl:block' : 'hidden 2xl:block';

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
    return () => { cancelled = true; };
  }, [hasProvidedItems, userId]);

  const items = hasProvidedItems ? itemsProp! : loadedItems;
  const shown = items.slice(0, MAX_CARDS);
  if (shown.length === 0) return null;

  return (
    <div className="pointer-events-auto hidden w-[clamp(240px,22vw,420px)] flex-col gap-3 sm:flex lg:gap-4">
      <p
        className="px-1 text-sm font-bold text-white lg:text-base"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
      >
        {businessName}
      </p>
      {shown.map((item, i) => (
        <div
          key={item.id}
          className={`overflow-hidden rounded-2xl bg-white shadow-2xl ${cardVisibility(i)}`}
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
        >
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              className="h-32 w-full object-cover lg:h-40 xl:h-48"
            />
          ) : (
            <div className="flex h-32 w-full items-center justify-center bg-gray-100 lg:h-40 xl:h-48">
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
          )}
          {/* Deal badge on first item */}
          {i === 0 && (
            <div className="mx-3 mt-2 inline-block rounded-full bg-[#f97316] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white lg:text-[11px]">
              Featured
            </div>
          )}
          <div className="px-3 pb-3 pt-1.5 lg:px-4 lg:pb-4">
            <p className="text-sm font-bold leading-tight text-black lg:text-base">{item.name}</p>
            <p className="mt-0.5 text-[11px] text-gray-500 lg:text-xs">Tap to add to cart</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-lg font-bold text-[#f97316] lg:text-xl">${item.price.toFixed(2)}</span>
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f97316] text-white shadow-md transition hover:opacity-90 active:scale-95 lg:h-10 lg:w-10"
              >
                {addedId === item.id ? <Check className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" /> : <Plus className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
