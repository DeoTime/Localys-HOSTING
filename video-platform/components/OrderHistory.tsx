'use client';

import { useState, useEffect } from 'react';
import { getUserCoinPurchases, getUserItemPurchases, getBusinessItemSales } from '@/lib/supabase/profiles';
import { supabase } from '@/lib/supabase/client';
import type { CoinPurchase, ItemPurchase } from '@/models/Order';
import { useTranslation } from '@/hooks/useTranslation';
import { OrderQRCode } from '@/components/QRCode';

function DiscountBadge({ item }: { item: ItemPurchase }) {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!item.coupon_code || !item.original_price) return null;

  const discountAmount = item.original_price - item.price;

  return (
    <span className="relative inline-flex items-center gap-1 text-xs text-green-400">
      <span>- ${discountAmount.toFixed(2)}</span>
      <span
        className="cursor-help inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/10 text-[10px] text-white/60"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(v => !v)}
      >
        i
      </span>
      {showTooltip && (
        <span className="absolute bottom-full right-0 mb-1 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap z-10 shadow-lg border border-white/10">
          Coupon: {item.coupon_code} ({item.discount_percentage}% off)
        </span>
      )}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-yellow-500/20 text-yellow-300',
    completed: 'bg-green-500/20 text-green-300',
    pending: 'bg-gray-500/20 text-gray-300',
    failed: 'bg-red-500/20 text-red-300',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

interface OrderHistoryProps {
  userId: string;
  businessId?: string;
  isBusiness?: boolean;
}

export function OrderHistory({ userId, businessId, isBusiness = false }: OrderHistoryProps) {
  const { t } = useTranslation();
  const [coinPurchases, setCoinPurchases] = useState<CoinPurchase[]>([]);
  const [itemPurchases, setItemPurchases] = useState<ItemPurchase[]>([]);
  const [itemSales, setItemSales] = useState<ItemPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
  const [tablesExist, setTablesExist] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [userId, isBusiness]);

  // Supabase Realtime: listen for status changes on the user's orders
  useEffect(() => {
    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'item_purchases',
          filter: `buyer_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as ItemPurchase;
          setItemPurchases(prev =>
            prev.map(p => p.id === updated.id ? { ...p, status: updated.status } : p)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: coins } = await getUserCoinPurchases(userId);
      const { data: items } = await getUserItemPurchases(userId);

      setCoinPurchases(coins || []);
      setItemPurchases(items || []);

      if (isBusiness) {
        const { data: sales } = await getBusinessItemSales(userId);
        setItemSales(sales || []);
      }

      setTablesExist(true);
    } catch (error) {
      console.error('Error loading orders:', error);
      setCoinPurchases([]);
      setItemPurchases([]);
      setItemSales([]);
      setTablesExist(false);
    } finally {
      setLoading(false);
    }
  };

  const allPurchases = [...coinPurchases, ...itemPurchases].sort((a, b) => {
    const dateA = new Date('created_at' in a ? a.created_at : a.purchased_at).getTime();
    const dateB = new Date('created_at' in b ? b.created_at : b.purchased_at).getTime();
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!tablesExist) {
    return (
      <div className="text-center py-8 text-white/60">
        <p className="text-sm">Order history feature coming soon!</p>
      </div>
    );
  }

  if (isBusiness) {
    const hasPurchases = coinPurchases.length > 0 || itemPurchases.length > 0;
    const hasSales = itemSales.length > 0;

    if (!hasPurchases && !hasSales) {
      return (
        <div className="text-center py-8 text-white/60">
          <p>No orders yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'purchases'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Purchases {hasPurchases ? `(${coinPurchases.length + itemPurchases.length})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'sales'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            Sales {hasSales ? `(${itemSales.length})` : ''}
          </button>
        </div>

        {activeTab === 'purchases' && (
          <div className="space-y-3">
            {allPurchases.length === 0 ? (
              <p className="text-center py-4 text-white/40 text-sm">No purchases</p>
            ) : (
              allPurchases.map((order, idx) => (
                <OrderItem key={idx} order={order} />
              ))
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-3">
            {itemSales.length === 0 ? (
              <p className="text-center py-4 text-white/40 text-sm">No sales yet</p>
            ) : (
              itemSales.map((sale, idx) => (
                <SaleItem key={idx} sale={sale} />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  if (allPurchases.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allPurchases.map((order, idx) => (
        <OrderItem key={idx} order={order} />
      ))}
    </div>
  );
}

function OrderItem({ order }: { order: CoinPurchase | ItemPurchase }) {
  const [showQR, setShowQR] = useState(false);
  const isCoinPurchase = 'coins' in order;
  const date = new Date(isCoinPurchase ? order.created_at : order.purchased_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isCoinPurchase) {
    const coins = order as CoinPurchase;
    return (
      <div className="bg-white/5 border border-yellow-500/30 rounded-lg p-4 hover:bg-white/10 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">🪙</div>
            <div>
              <p className="font-medium text-white">Coin Purchase</p>
              <p className="text-white/60 text-sm">{coins.coins} coins</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-yellow-400">{coins.coins}x 🪙</p>
            <p className="text-white/60 text-xs">{formattedDate}</p>
          </div>
        </div>
      </div>
    );
  }

  const item = order as ItemPurchase;
  const isPaid = item.status === 'paid';

  return (
    <div className="bg-white/5 border border-blue-500/30 rounded-lg p-4 hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">🛍️</div>
          <div>
            <p className="font-medium text-white">{item.item_name}</p>
            <p className="text-white/60 text-sm">Order #{item.id.substring(0, 8)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-blue-400">
            {item.original_price ? `$${item.original_price.toFixed(2)}` : `$${item.price.toFixed(2)}`}
          </p>
          <DiscountBadge item={item} />
          <p className="text-white/60 text-xs">{formattedDate}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <StatusBadge status={item.status} />
        {isPaid && item.verification_token && (
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
          >
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
        )}
      </div>
      {showQR && isPaid && item.verification_token && (
        <div className="mt-3 flex flex-col items-center py-3 border-t border-white/10">
          <p className="text-white/40 text-xs mb-2">Show at pickup</p>
          <OrderQRCode orderId={item.id} token={item.verification_token} size={160} />
        </div>
      )}
    </div>
  );
}

function SaleItem({ sale }: { sale: ItemPurchase }) {
  const date = new Date(sale.purchased_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white/5 border border-green-500/30 rounded-lg p-4 hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">📦</div>
          <div>
            <p className="font-medium text-white">{sale.item_name}</p>
            <p className="text-white/60 text-sm">Order #{sale.id.substring(0, 8)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-green-400">${sale.price.toFixed(2)}</p>
          <p className="text-white/60 text-xs">{formattedDate}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <StatusBadge status={sale.status} />
      </div>
    </div>
  );
}
