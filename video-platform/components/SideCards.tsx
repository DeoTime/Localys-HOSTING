'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { X, RefreshCw, Tag } from 'lucide-react';

interface SideCardsProps {
  userId: string;
}

interface LastOrder {
  item_name: string;
  item_id: string;
  seller_id: string;
  price: number;
}

export function SideCards({ userId }: SideCardsProps) {
  const router = useRouter();
  const [showOrderCard, setShowOrderCard] = useState(true);
  const [showDealCard, setShowDealCard] = useState(true);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    supabase
      .from('item_purchases')
      .select('item_name, item_id, seller_id, price')
      .eq('buyer_id', userId)
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setLastOrder(data as LastOrder); });
  }, [userId]);

  const neitherVisible = !showOrderCard && !showDealCard;
  const orderCardVisible = showOrderCard && !!lastOrder;
  if (neitherVisible) return null;

  return (
    <>
      {/* Left card — Order Again */}
      {orderCardVisible && (
        <div className="hidden xl:block fixed left-4 top-[32%] w-48 z-30 pointer-events-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Order Again</p>
              <button
                onClick={() => setShowOrderCard(false)}
                className="text-gray-300 hover:text-gray-600 transition-colors -mr-0.5 -mt-0.5"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-2 leading-snug">
              {lastOrder!.item_name}
            </p>
            <p className="text-[#f97316] font-bold text-sm mb-3">
              ${lastOrder!.price.toFixed(2)}
            </p>
            <button
              onClick={() =>
                router.push(
                  `/checkout?itemId=${lastOrder!.item_id}&itemName=${encodeURIComponent(lastOrder!.item_name)}&itemPrice=${lastOrder!.price}&sellerId=${lastOrder!.seller_id}&buyerId=${userId}`
                )
              }
              className="w-full bg-[#f97316] text-white text-xs font-semibold py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Re-order
            </button>
          </div>
        </div>
      )}

      {/* Right card — Local Deals */}
      {showDealCard && (
        <div className="hidden xl:block fixed right-4 top-[32%] w-48 z-30 pointer-events-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Local Deals</p>
              <button
                onClick={() => setShowDealCard(false)}
                className="text-gray-300 hover:text-gray-600 transition-colors -mr-0.5 -mt-0.5"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#f97316]/10 flex items-center justify-center mb-2">
              <Tag className="h-4 w-4 text-[#f97316]" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Deals near you</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Browse coupons and offers from local businesses.
            </p>
            <button
              onClick={() => router.push('/feed')}
              className="w-full bg-gray-900 text-white text-xs font-semibold py-2 rounded-xl hover:opacity-80 transition-opacity"
            >
              Browse Deals
            </button>
          </div>
        </div>
      )}
    </>
  );
}
