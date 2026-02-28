'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AppBottomNav } from '@/components/AppBottomNav';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const total = items.reduce((sum, item) => sum + item.itemPrice, 0);

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (items.length === 0) return;
    router.push('/checkout?source=cart');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-white/60 hover:text-white mb-4 inline-flex items-center gap-2">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          {items.length > 0 && (
            <p className="text-white/60 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-white/60 mb-4">Your cart is empty</p>
            <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-6 py-2 transition-colors">
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
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-3"
                >
                  {item.itemImage && (
                    <img
                      src={item.itemImage}
                      alt={item.itemName}
                      className="w-16 h-16 rounded-lg object-cover border border-white/20 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{item.itemName}</h3>
                    <p className="text-yellow-400 font-bold">${item.itemPrice.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="text-red-400 hover:text-red-300 p-1 self-start"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Total</span>
                <span className="text-xl font-bold text-yellow-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold py-3 rounded-lg transition-colors border border-white/10"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
      <AppBottomNav />
    </div>
  );
}
