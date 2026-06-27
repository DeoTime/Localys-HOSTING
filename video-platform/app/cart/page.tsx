'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getShopCoupons, Coupon } from '@/lib/supabase/coupons';
import Link from 'next/link';
import { ChevronLeft, Trash2, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, updateSpecialRequests, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const total = items.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (items.length === 0) { setCoupons([]); return; }
    const sellerIds = [...new Set(items.map(i => i.sellerId))];
    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      const allCoupons: Coupon[] = [];
      for (const sellerId of sellerIds) {
        const { data } = await getShopCoupons(sellerId);
        if (data) allCoupons.push(...data);
      }
      setCoupons(allCoupons);
      setLoadingCoupons(false);
    };
    fetchCoupons();
  }, [items]);

  const handleCheckout = () => {
    if (!user) { router.push('/login'); return; }
    if (items.length === 0) return;
    router.push('/checkout?source=cart');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          {items.length > 0 && (
            <p className="text-gray-500 text-sm mt-0.5">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</p>
            <p className="text-gray-500 text-sm mb-6">Browse local businesses and add items</p>
            <Link
              href="/feed"
              className="inline-block bg-[#f97316] hover:opacity-90 text-white font-semibold rounded-xl px-6 py-3 transition-opacity active:scale-95"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex gap-3">
                    {item.itemImage && (
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-semibold truncate">{item.itemName}</h3>
                      <p className="text-[#f97316] font-bold">
                        ${(item.itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.itemId)}
                      className="text-gray-400 hover:text-red-500 p-2 self-start rounded-lg hover:bg-red-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-gray-500 text-sm">Qty:</span>
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1.5 text-gray-900 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors min-w-[40px] min-h-[40px]"
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className="px-3 py-1.5 text-gray-900 font-medium min-w-[2rem] text-center border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="px-3 py-1.5 text-gray-900 hover:bg-gray-200 transition-colors min-w-[40px] min-h-[40px]"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    {item.quantity > 1 && (
                      <span className="text-gray-400 text-xs">${item.itemPrice.toFixed(2)} each</span>
                    )}
                  </div>

                  {/* Special requests */}
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Special requests (e.g. no onions, extra sauce...)"
                      value={item.specialRequests || ''}
                      onChange={(e) => updateSpecialRequests(item.itemId, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/20 transition-colors"
                      aria-label="Special requests"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Available Coupons */}
            {!loadingCoupons && coupons.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <h2 className="text-base font-semibold mb-1 text-gray-900">Available Coupons</h2>
                <p className="text-gray-500 text-xs mb-3">Apply at checkout</p>
                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-green-200 bg-white"
                    >
                      <div>
                        <p className="font-semibold text-green-700">{coupon.code}</p>
                        <p className="text-gray-500 text-sm">{coupon.discount_percentage}% off</p>
                      </div>
                      <span className="text-green-600 text-xs border border-green-200 px-2 py-1 rounded-lg">
                        Apply at checkout
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {loadingCoupons && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#f97316]" />
              </div>
            )}

            {/* Order summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-[#f97316] hover:opacity-90 text-white font-semibold py-3.5 rounded-xl transition-opacity active:scale-[0.98] shadow-sm min-h-[48px]"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium py-3 rounded-xl transition-colors border border-gray-200 min-h-[44px]"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
