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
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Eye, QrCode,
  Clock, Save, CheckCircle, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, ReceiptText, CreditCard, Settings,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

type Tab = 'overview' | 'transactions' | 'payments' | 'business';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: 'transactions', label: 'Transactions', icon: <ReceiptText className="h-4 w-4" /> },
  { key: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  { key: 'business', label: 'Business', icon: <Settings className="h-4 w-4" /> },
];

/* ── Placeholder data (used when no real data exists) ── */
const DEMO_CHART = [
  { day: 'Mon', revenue: 380 },
  { day: 'Tue', revenue: 520 },
  { day: 'Wed', revenue: 290 },
  { day: 'Thu', revenue: 680 },
  { day: 'Fri', revenue: 450 },
  { day: 'Sat', revenue: 820 },
  { day: 'Sun', revenue: 360 },
];

const DEMO_TRANSACTIONS = [
  { id: 'tx1', name: 'Alex Johnson', type: 'Payment', amount: 45.00, status: 'Successful', method: 'Credit Card', date: 'Jun 25' },
  { id: 'tx2', name: 'Maria Garcia', type: 'Service Order', amount: 120.00, status: 'Successful', method: 'Stripe', date: 'Jun 24' },
  { id: 'tx3', name: 'James Wilson', type: 'Payment', amount: 75.50, status: 'Successful', method: 'Bank Transfer', date: 'Jun 24' },
  { id: 'tx4', name: 'Emma Davis', type: 'Refund', amount: -25.00, status: 'Pending', method: 'Credit Card', date: 'Jun 23' },
  { id: 'tx5', name: 'Chris Brown', type: 'Service Order', amount: 200.00, status: 'Successful', method: 'Stripe', date: 'Jun 22' },
  { id: 'tx6', name: 'Taylor Lee', type: 'Payment', amount: 58.00, status: 'Successful', method: 'Bank Transfer', date: 'Jun 21' },
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
    success: boolean; message: string; order?: { item_name: string; price: number };
  } | null>(null);

  useEffect(() => { if (!user) return; checkBusinessStatus(); }, [user]);

  useEffect(() => {
    if (isBusiness === true && user) { loadOrders(); loadBusiness(); }
  }, [isBusiness, user]);

  useEffect(() => {
    if (!user || !isBusiness) return;
    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'item_purchases', filter: `seller_id=eq.${user.id}` }, (payload) => {
        const o = payload.new as ItemPurchase;
        if (o.status === 'paid') setPendingOrders(prev => [o, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'item_purchases', filter: `seller_id=eq.${user.id}` }, (payload) => {
        const o = payload.new as ItemPurchase;
        if (o.status === 'completed') {
          setPendingOrders(prev => prev.filter(p => p.id !== o.id));
          setCompletedOrders(prev => [o, ...prev.slice(0, 19)]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isBusiness]);

  const checkBusinessStatus = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('type').eq('id', user.id).single();
    if (data?.type) { setIsBusiness(true); }
    else { setIsBusiness(false); router.replace('/profile'); }
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
        if (data.business_hours && typeof data.business_hours === 'string') data.business_hours = JSON.parse(data.business_hours);
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
      setScanResult({ success: false, message: 'Could not read QR code.' });
    }
  }, []);

  /* Analytics */
  const totalRevenue = useMemo(() => completedOrders.reduce((s, o) => s + (o.price || 0), 0), [completedOrders]);
  const lastMonthRevenue = totalRevenue * 0.78; // synthetic comparison
  const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  const revenueChartData = useMemo(() => {
    const days: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const revenue = completedOrders.filter(o => (o.purchased_at || '').startsWith(key)).reduce((s, o) => s + (o.price || 0), 0);
      days.push({ day: label, revenue });
    }
    return days;
  }, [completedOrders]);

  const hasRealRevenue = totalRevenue > 0;
  const chartData = hasRealRevenue ? revenueChartData : DEMO_CHART;
  const displayRevenue = hasRealRevenue ? totalRevenue : 3500.45;
  const displayPending = hasRealRevenue ? pendingOrders.length : 3;
  const displayCompleted = hasRealRevenue ? completedOrders.length : 28;
  const profileViews = 1247;
  const videoViews = 8432;

  // Blended transactions: real orders as transactions + demo if empty
  const recentTransactions = useMemo(() => {
    const real = completedOrders.slice(0, 6).map(o => ({
      id: o.id,
      name: o.item_name,
      type: 'Order',
      amount: o.price,
      status: 'Successful',
      method: 'Stripe',
      date: new Date(o.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
    return real.length > 0 ? real : DEMO_TRANSACTIONS;
  }, [completedOrders]);

  if (isBusiness === null || (loading && isBusiness)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900 pb-24">
      {/* ── Top header ── */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-10 pt-6 pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Business Manager</p>
              <p className="text-3xl font-bold text-gray-900">
                ${displayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={`text-xs font-medium ${revenueChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {Math.abs(revenueChange).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">vs last period</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => { setScanResult(null); setShowScanner(true); }}
                className="flex items-center gap-1.5 bg-[#f97316] hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-opacity"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>
              <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                <span>Reports</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#f97316] border-[#f97316] bg-orange-50/60'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-10 py-6">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Scan result */}
            {scanResult && (
              <div className={`p-4 rounded-2xl border flex items-start justify-between ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-medium text-sm ${scanResult.success ? 'text-green-700' : 'text-red-600'}`}>{scanResult.message}</p>
                <button onClick={() => setScanResult(null)} className="text-gray-400 hover:text-gray-600 ml-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* Cash Flow + Income/Expense */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chart — 2/3 width */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-700">Cash Flow</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Last 7 days</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Revenue performance</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Revenue']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                        cursor={{ fill: '#f97316', opacity: 0.06 }}
                      />
                      <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Income / Expense — 1/3 width */}
              <div className="flex flex-col gap-4">
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">Income</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${displayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      +{Math.abs(revenueChange).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-gray-400">vs last period</span>
                  </div>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center">
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">Expense</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(displayRevenue * 0.32).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      -12.5%
                    </span>
                    <span className="text-[11px] text-gray-400">vs last period</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Business Account"
                value={`$${(displayRevenue * 0.68).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={`vs $${(displayRevenue * 0.55).toFixed(2)} last period`}
                change="+12.4%"
                positive
              />
              <StatCard
                label="Profile Views"
                value={profileViews.toLocaleString()}
                sub="Unique visitors this month"
                change="+8.2%"
                positive
              />
              <StatCard
                label="Video Views"
                value={videoViews.toLocaleString()}
                sub="Total across all videos"
                change="+24.1%"
                positive
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">Recent Activity</p>
                <button className="text-xs text-[#f97316] font-medium hover:underline">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-medium">Type</th>
                      <th className="text-left px-5 py-3 font-medium">Amount</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Method</th>
                      <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-gray-900 text-xs">{tx.type}</p>
                            <p className="text-gray-400 text-xs">{tx.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold text-sm ${tx.amount < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                            {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                            tx.status === 'Successful'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-orange-50 text-[#f97316]'
                          }`}>
                            {tx.status === 'Successful' && <CheckCircle className="h-3 w-3" />}
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-gray-500 text-xs">{tx.method}</span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-gray-400 text-xs">{tx.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {activeTab === 'transactions' && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStatCard label="Total Transactions" value={String(displayCompleted)} />
              <MiniStatCard label="Successful" value={String(displayCompleted)} color="green" />
              <MiniStatCard label="Pending" value={String(displayPending)} color="orange" />
              <MiniStatCard label="Total Value" value={`$${displayRevenue.toFixed(2)}`} />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">All Transactions</p>
                <span className="text-xs text-gray-400">Last 30 days</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-medium">Type</th>
                      <th className="text-left px-5 py-3 font-medium">Amount</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Method</th>
                      <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...recentTransactions, ...DEMO_TRANSACTIONS.slice(0, 4)].map((tx, i) => (
                      <tr key={tx.id + i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-gray-900 text-xs">{tx.type}</p>
                            <p className="text-gray-400 text-xs">{tx.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold text-sm ${tx.amount < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                            {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                            tx.status === 'Successful' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-[#f97316]'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-gray-500 text-xs">{tx.method}</span></td>
                        <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-gray-400 text-xs">{tx.date}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending orders with QR scan */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Pending Orders</h2>
                {pendingOrders.length > 0 && (
                  <span className="bg-[#f97316] text-white text-xs px-2 py-0.5 rounded-full font-medium">{pendingOrders.length}</span>
                )}
              </div>
              <button
                onClick={() => { setScanResult(null); setShowScanner(true); }}
                className="w-full flex items-center justify-center gap-2 bg-black hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-opacity mb-3"
              >
                <QrCode className="h-4 w-4" />
                Scan Customer QR Code
              </button>
              {pendingOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No pending orders</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingOrders.map(o => <OrderCard key={o.id} order={o} variant="pending" />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div className="space-y-5">
            {/* Payment summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Received</p>
                <p className="text-2xl font-bold text-gray-900">${displayRevenue.toFixed(2)}</p>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-1 inline-block">Successful</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">${(displayPending * 42.5).toFixed(2)}</p>
                <span className="text-xs font-semibold text-[#f97316] bg-orange-50 px-1.5 py-0.5 rounded mt-1 inline-block">Pending</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Refunded</p>
                <p className="text-2xl font-bold text-gray-900">$25.00</p>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">1 refund</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-4">Payment Methods Breakdown</p>
              <div className="space-y-3">
                {[
                  { method: 'Stripe', pct: 58, amount: displayRevenue * 0.58 },
                  { method: 'Bank Transfer', pct: 27, amount: displayRevenue * 0.27 },
                  { method: 'Credit Card', pct: 15, amount: displayRevenue * 0.15 },
                ].map(m => (
                  <div key={m.method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{m.method}</span>
                      <span className="text-sm font-semibold text-gray-900">${m.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f97316] rounded-full" style={{ width: `${m.pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{m.pct}% of total</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-4">Recent Payment Status</p>
              <div className="space-y-2">
                {DEMO_TRANSACTIONS.slice(0, 5).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.name}</p>
                      <p className="text-xs text-gray-400">{tx.date} · {tx.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${Math.abs(tx.amount).toFixed(2)}</p>
                      <span className={`text-xs font-medium ${tx.status === 'Successful' ? 'text-green-600' : 'text-[#f97316]'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BUSINESS TAB ── */}
        {activeTab === 'business' && (
          <div className="space-y-5">
            {business && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{business.business_name || 'Your Business'}</h2>
                  {business.business_type && (
                    <span className="text-xs bg-orange-50 text-[#f97316] border border-orange-200 px-2 py-0.5 rounded-full capitalize">
                      {business.business_type === 'hybrid' ? 'Pickup & Delivery' : business.business_type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">ID: {business.id?.slice(0, 8)}…</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Videos</h2>
              {user && <PostedVideos userId={user.id} isOwnProfile={true} />}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Services &amp; Menu</h2>
              {user && business && <MenuList userId={user.id} businessId={business.id} isOwnProfile={true} />}
            </div>

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

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, sub, change, positive }: {
  label: string; value: string; sub: string; change: string; positive: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded mt-1.5 inline-block ${positive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
        {change}
      </span>
    </div>
  );
}

function MiniStatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function OrderCard({ order, variant }: { order: ItemPurchase; variant: 'pending' | 'completed' }) {
  const date = new Date(order.purchased_at);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <div className={`bg-white border rounded-2xl p-4 ${variant === 'pending' ? 'border-orange-200' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 mr-3">
          <p className="font-medium text-gray-900 text-sm truncate">{order.item_name}{order.quantity && order.quantity > 1 && <span className="text-gray-400 font-normal"> ×{order.quantity}</span>}</p>
          <p className="text-gray-400 text-xs mt-0.5">#{order.id.slice(0, 8)} · {formatted}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-gray-900 text-sm">${order.price.toFixed(2)}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${variant === 'pending' ? 'bg-orange-50 text-[#f97316]' : 'bg-green-50 text-green-700'}`}>{order.status}</span>
        </div>
      </div>
      {order.special_requests && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
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

function BusinessHoursEditor({ business, userId, onSaved }: {
  business: Business; userId: string; onSaved: (updated: Business) => void;
}) {
  const [hours, setHours] = useState<BusinessHours>(business.business_hours || DEFAULT_HOURS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const { error: err } = await updateBusinessInfo(business.id, { business_hours: hours } as BusinessUpdateData);
      if (err) throw new Error(err.message);
      setSaved(true); onSaved({ ...business, business_hours: hours });
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) { setError(e.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#f97316]" />
          <h2 className="text-sm font-semibold text-gray-900">Business Hours</h2>
        </div>
        <button
          onClick={handleSave} disabled={saving}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${saved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#f97316] text-white hover:opacity-90'} disabled:opacity-50`}
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Hours'}
        </button>
      </div>
      {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{error}</div>}
      <div className="space-y-3">
        {DAYS.map(day => (
          <div key={day} className="flex items-center gap-3">
            <label className="w-24 text-sm text-gray-600 capitalize shrink-0">{day}</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={!hours[day]?.closed}
                onChange={e => setHours({ ...hours, [day]: e.target.checked ? { open: '09:00', close: '17:00' } : { closed: true } })}
                className="w-4 h-4 accent-[#f97316] rounded"
              />
              {!hours[day]?.closed ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={hours[day]?.open || '09:00'} onChange={e => setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-[#f97316]" />
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="time" value={hours[day]?.close || '17:00'} onChange={e => setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-[#f97316]" />
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
