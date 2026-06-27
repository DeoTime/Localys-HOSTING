'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { QRScanner } from '@/components/QRScanner';
import { PostedVideos } from '@/components/PostedVideos';
import { MenuList } from '@/components/MenuList';
import {
  ensureUserBusiness,
  updateBusinessInfo,
  Business,
  BusinessHours,
  BusinessUpdateData,
} from '@/lib/supabase/profiles';
import type { ItemPurchase } from '@/models/Order';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  QrCode,
  Megaphone,
  Users,
  Video,
  Settings,
  Save,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

type Tab = 'overview' | 'orders' | 'videos' | 'business';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'videos', label: 'Videos' },
  { key: 'business', label: 'Business' },
];

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isBusiness, setIsBusiness] = useState<boolean | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [pendingOrders, setPendingOrders] = useState<ItemPurchase[]>([]);
  const [completedOrders, setCompletedOrders] = useState<ItemPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    order?: { item_name: string; price: number };
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    checkBusinessStatus();
  }, [user]);

  useEffect(() => {
    if (isBusiness === true && user) {
      loadOrders();
      loadBusiness();
    }
  }, [isBusiness, user]);

  useEffect(() => {
    if (!user || !isBusiness) return;
    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'item_purchases', filter: `seller_id=eq.${user.id}` }, (payload) => {
        const newOrder = payload.new as ItemPurchase;
        if (newOrder.status === 'paid') setPendingOrders((prev) => [newOrder, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'item_purchases', filter: `seller_id=eq.${user.id}` }, (payload) => {
        const updated = payload.new as ItemPurchase;
        if (updated.status === 'completed') {
          setPendingOrders((prev) => prev.filter((o) => o.id !== updated.id));
          setCompletedOrders((prev) => [updated, ...prev.slice(0, 19)]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isBusiness]);

  const checkBusinessStatus = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('type').eq('id', user.id).single();
    if (data?.type) {
      setIsBusiness(true);
    } else {
      setIsBusiness(false);
      router.replace('/profile');
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: pending }, { data: completed }] = await Promise.all([
      supabase.from('item_purchases').select('*').eq('seller_id', user.id).eq('status', 'paid').order('purchased_at', { ascending: false }),
      supabase.from('item_purchases').select('*').eq('seller_id', user.id).eq('status', 'completed').order('purchased_at', { ascending: false }).limit(50),
    ]);
    setPendingOrders(pending || []);
    setCompletedOrders(completed || []);
    setLoading(false);
  };

  const loadBusiness = async () => {
    if (!user) return;
    try {
      const { data, error } = await ensureUserBusiness(user.id);
      if (!error && data) {
        if (data.business_hours && typeof data.business_hours === 'string') {
          data.business_hours = JSON.parse(data.business_hours);
        }
        setBusiness(data);
      }
    } catch { /* silently fail */ }
  };

  const handleScan = useCallback(async (data: string) => {
    setShowScanner(false);
    try {
      const url = new URL(data);
      const orderId = url.searchParams.get('id');
      const token = url.searchParams.get('token');
      if (!orderId || !token) { setScanResult({ success: false, message: 'Invalid QR code format.' }); return; }
      const response = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, token }),
      });
      const result = await response.json();
      if (!response.ok) { setScanResult({ success: false, message: result.error || 'Failed to complete order.' }); return; }
      setScanResult({ success: true, message: 'Order completed!', order: result.order });
    } catch {
      setScanResult({ success: false, message: 'Could not read QR code data.' });
    }
  }, []);

  // Derived analytics
  const totalRevenue = useMemo(() => completedOrders.reduce((s, o) => s + (o.price || 0), 0), [completedOrders]);
  const avgOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  const revenueChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const revenue = completedOrders
        .filter((o) => (o.purchased_at || '').startsWith(key))
        .reduce((s, o) => s + (o.price || 0), 0);
      const orders = completedOrders.filter((o) => (o.purchased_at || '').startsWith(key)).length;
      days.push({ day: label, revenue, orders });
    }
    return days;
  }, [completedOrders]);

  if (isBusiness === null || (loading && isBusiness)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-12 pt-6 pb-0">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-500 mb-0.5">Welcome back</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Manager</h1>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-[#f97316] border-[#f97316] bg-orange-50/50'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-12 py-6">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={<DollarSign className="h-5 w-5 text-[#f97316]" />}
                label="Total Revenue"
                value={`$${totalRevenue.toFixed(2)}`}
                sub={`${completedOrders.length} completed orders`}
                iconBg="bg-orange-50"
              />
              <KpiCard
                icon={<ShoppingBag className="h-5 w-5 text-blue-500" />}
                label="Pending Orders"
                value={String(pendingOrders.length)}
                sub="awaiting fulfillment"
                iconBg="bg-blue-50"
              />
              <KpiCard
                icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                label="Avg Order Value"
                value={`$${avgOrderValue.toFixed(2)}`}
                sub="per completed order"
                iconBg="bg-green-50"
              />
              <KpiCard
                icon={<Users className="h-5 w-5 text-purple-500" />}
                label="Total Orders"
                value={String(pendingOrders.length + completedOrders.length)}
                sub="all time"
                iconBg="bg-purple-50"
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue chart */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Last 7 days</span>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Revenue']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order trend chart */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value: number | undefined) => [(value ?? 0), 'Orders']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} fill="url(#ordersGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Promotional Analytics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="h-4 w-4 text-[#f97316]" />
                <h2 className="text-base font-semibold text-gray-900">Promotional Analytics</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Promoted Videos', value: '—' },
                  { label: 'Impressions', value: '—' },
                  { label: 'Click-Through Rate', value: '—' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Promote a video from the Videos tab to start tracking.
              </p>
            </div>

            {/* Community Mentions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-[#f97316]" />
                <h2 className="text-base font-semibold text-gray-900">Community Mentions</h2>
              </div>
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Community mention tracking coming soon.</p>
                <p className="text-xs text-gray-400 mt-1">Engage in communities to build your presence.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Scan result */}
            {scanResult && (
              <div className={`p-4 rounded-2xl border flex items-start justify-between ${
                scanResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div>
                  <p className={`font-medium text-sm ${scanResult.success ? 'text-green-700' : 'text-red-600'}`}>
                    {scanResult.message}
                  </p>
                  {scanResult.order && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {scanResult.order.item_name} — ${scanResult.order.price.toFixed(2)}
                    </p>
                  )}
                </div>
                <button onClick={() => setScanResult(null)} className="text-gray-400 hover:text-gray-600 ml-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Scan CTA */}
            <button
              onClick={() => { setScanResult(null); setShowScanner(true); }}
              className="w-full flex items-center justify-center gap-3 bg-[#f97316] hover:opacity-90 text-white font-semibold py-4 rounded-2xl transition-opacity shadow-sm"
            >
              <QrCode className="h-5 w-5" />
              Scan Customer QR Code
            </button>

            {/* Pending Orders */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold text-gray-900">Pending Orders</h2>
                {pendingOrders.length > 0 && (
                  <span className="bg-[#f97316] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {pendingOrders.length}
                  </span>
                )}
              </div>
              {pendingOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No pending orders</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} variant="pending" />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Orders */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Completed</h2>
              {completedOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                  <p className="text-gray-400 text-sm">No completed orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} variant="completed" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VIDEOS TAB ── */}
        {activeTab === 'videos' && (
          <div className="space-y-5">
            {/* Promote banner */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5 text-[#f97316]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Promote Your Videos</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Boost visibility for your best content and attract more customers.
                </p>
              </div>
              <button className="shrink-0 bg-[#f97316] hover:opacity-90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-opacity">
                Promote
              </button>
            </div>

            {/* Video list */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-4 w-4 text-[#f97316]" />
                <h2 className="text-base font-semibold text-gray-900">Your Videos</h2>
              </div>
              {user && <PostedVideos userId={user.id} isOwnProfile={true} />}
            </div>
          </div>
        )}

        {/* ── BUSINESS TAB ── */}
        {activeTab === 'business' && (
          <div className="space-y-5">
            {/* Business info card */}
            {business && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-gray-900">{business.business_name || 'Your Business'}</h2>
                  {business.business_type && (
                    <span className="text-xs bg-orange-50 text-[#f97316] border border-orange-200 px-2 py-0.5 rounded-full capitalize">
                      {business.business_type === 'hybrid' ? 'Pickup & Delivery' : business.business_type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Business ID: {business.id?.slice(0, 8)}…</p>
              </div>
            )}

            {/* Services / Menu */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Services &amp; Menu</h2>
              {user && business && (
                <MenuList userId={user.id} businessId={business.id} isOwnProfile={true} />
              )}
            </div>

            {/* Business Hours */}
            {business && (
              <BusinessHoursEditor
                business={business}
                userId={user?.id || ''}
                onSaved={(updated) => setBusiness(updated)}
              />
            )}
          </div>
        )}
      </div>

      {/* QR Scanner overlay */}
      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({
  icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function OrderCard({ order, variant }: { order: ItemPurchase; variant: 'pending' | 'completed' }) {
  const date = new Date(order.purchased_at);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`bg-white border rounded-2xl p-4 ${
      variant === 'pending' ? 'border-orange-200' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 mr-3">
          <p className="font-medium text-gray-900 text-sm truncate">
            {order.item_name}
            {order.quantity && order.quantity > 1 && (
              <span className="text-gray-400 font-normal"> ×{order.quantity}</span>
            )}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            #{order.id.substring(0, 8)} · {formattedDate} {formattedTime}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-gray-900 text-sm">${order.price.toFixed(2)}</p>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
            variant === 'pending'
              ? 'bg-orange-50 text-[#f97316]'
              : 'bg-green-50 text-green-700'
          }`}>
            {order.status}
          </span>
        </div>
      </div>
      {order.special_requests && (
        <div className="mt-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <p className="text-gray-500 text-xs font-medium">Special Request</p>
          <p className="text-gray-700 text-sm mt-0.5">{order.special_requests}</p>
        </div>
      )}
    </div>
  );
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '17:00' },
  tuesday: { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday: { open: '09:00', close: '17:00' },
  friday: { open: '09:00', close: '17:00' },
  saturday: { open: '10:00', close: '16:00' },
  sunday: { closed: true },
};

function BusinessHoursEditor({
  business,
  userId,
  onSaved,
}: {
  business: Business;
  userId: string;
  onSaved: (updated: Business) => void;
}) {
  const [hours, setHours] = useState<BusinessHours>(business.business_hours || DEFAULT_HOURS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updates: BusinessUpdateData = { business_hours: hours };
      const { error: err } = await updateBusinessInfo(business.id, updates);
      if (err) throw new Error(err.message);
      setSaved(true);
      onSaved({ ...business, business_hours: hours });
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#f97316]" />
          <h2 className="text-base font-semibold text-gray-900">Business Hours</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${
            saved
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-[#f97316] text-white hover:opacity-90'
          } disabled:opacity-50`}
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Hours'}
        </button>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{error}</div>
      )}

      <div className="space-y-3">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <label className="w-24 text-sm text-gray-600 capitalize shrink-0">{day}</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={!hours[day]?.closed}
                onChange={(e) => {
                  setHours({
                    ...hours,
                    [day]: e.target.checked
                      ? { open: '09:00', close: '17:00' }
                      : { closed: true },
                  });
                }}
                className="w-4 h-4 accent-[#f97316] rounded"
              />
              {!hours[day]?.closed ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hours[day]?.open || '09:00'}
                    onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-[#f97316]"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={hours[day]?.close || '17:00'}
                    onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-[#f97316]"
                  />
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">Check the box to mark a day as open.</p>
    </div>
  );
}
