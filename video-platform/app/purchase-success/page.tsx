'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderQRCode } from '@/components/QRCode';
import { useAuth } from '@/contexts/AuthContext';
import { saveLocalOrder } from '@/lib/clientEngagement';

interface OrderInfo {
  orderId: string;
  token: string;
  itemName: string;
  price: number;
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]" />
      </div>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  );
}

function PurchaseSuccessContent() {
  const { session, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    // Wait until AuthContext has finished initialising — otherwise the token is
    // not yet available and the request goes out without an Authorization header.
    if (authLoading) return;

    const verifyPurchase = async () => {
      try {
        const response = await fetch('/api/verify-item-purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          console.error('[purchase-success] Verify failed:', response.status);
          return;
        }

        const data = await response.json();
        if (data.confirmationNumber) setConfirmationNumber(data.confirmationNumber);
        if (data.orders?.length > 0) {
          setOrders(data.orders);
          // Save to localStorage so demo/local orders appear in order history
          const now = new Date().toISOString();
          data.orders.forEach((o: OrderInfo) => {
            try {
              saveLocalOrder({
                id: o.orderId,
                confirmationNumber: data.confirmationNumber,
                itemName: o.itemName,
                price: o.price,
                purchased_at: now,
              });
            } catch (err) {
              console.error('[purchase-success] Could not save local order:', err);
            }
          });
        }
      } catch (err) {
        console.error('[purchase-success] Verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyPurchase();
  }, [sessionId, session?.access_token, authLoading]);

  const total = orders.reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="w-full max-w-lg mx-auto px-4 py-10">

        {/* Success icon + heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#f97316]/10 border-2 border-[#f97316] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black mb-1">Order confirmed!</h1>
          <p className="text-gray-500 text-sm">Thank you for your purchase</p>
        </div>

        {/* Order number */}
        {confirmationNumber && (
          <div className="bg-black rounded-2xl p-5 mb-4 text-center">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Order number</p>
            <p className="text-2xl font-mono font-bold text-[#f97316] tracking-wider">{confirmationNumber}</p>
            <p className="text-white/40 text-xs mt-1">Save this for your records</p>
          </div>
        )}

        {/* Loading while verifying */}
        {loading && (
          <div className="border border-gray-100 rounded-2xl p-6 mb-4 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f97316]" />
            <p className="text-gray-400 text-sm">Confirming order details...</p>
          </div>
        )}

        {/* Order summary */}
        {!loading && orders.length > 0 && (
          <div className="border border-gray-200 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-black mb-3">Order summary</h2>
            <div className="space-y-3 divide-y divide-gray-100">
              {orders.map((o) => (
                <div key={o.orderId} className="flex items-center justify-between pt-3 first:pt-0">
                  <span className="text-sm text-black font-medium">{o.itemName}</span>
                  <span className="text-sm font-bold text-[#f97316]">${o.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {orders.length > 1 && (
              <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-black">Total</span>
                <span className="text-sm font-bold text-black">${total.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* QR codes for pickup */}
        {!loading && orders.length > 0 && (
          <div className="border border-gray-200 rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-black mb-1">Pickup QR code</p>
            <p className="text-xs text-gray-400 mb-4">Show this at the business when you arrive</p>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="flex flex-col items-center">
                  <OrderQRCode orderId={order.orderId} token={order.token} size={160} />
                  <p className="text-sm font-medium text-black mt-2">{order.itemName}</p>
                  <p className="text-xs text-gray-400">${order.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/profile"
            className="block w-full bg-[#f97316] hover:opacity-90 text-white font-semibold py-3.5 rounded-xl text-center transition-opacity"
          >
            View Order History
          </Link>
          <Link
            href="/feed"
            className="block w-full border border-gray-200 hover:border-gray-400 text-black font-semibold py-3.5 rounded-xl text-center transition-colors"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
