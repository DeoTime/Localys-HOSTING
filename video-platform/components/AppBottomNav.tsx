'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

export function AppBottomNav() {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const cartCount = getCartCount();
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsBusiness(false);
      return;
    }

    const checkBusiness = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();
      setIsBusiness(!!data?.type);
    };

    checkBusiness();
  }, [user]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border-color)] bg-[var(--surface-overlay)] backdrop-blur-md">
      <div className="flex items-center justify-around py-3">
        <NavItem href="/" label="Home" active={isActive('/')} icon={
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        } fillIcon />
        <NavItem href="/search" label="Search" active={isActive('/search')} icon={
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        } />
        <NavItem href="/upload" label="Upload" active={isActive('/upload')} icon={
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        } />
        <NavItem href="/chats" label="Chats" active={isActive('/chats')} icon={
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        } />
        <Link href="/cart" className="relative flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-105 active:scale-95">
          <svg className={`h-6 w-6 ${isActive('/cart') ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
          <span className={`text-xs ${isActive('/cart') ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>Cart</span>
        </Link>
        {isBusiness && (
          <NavItem href="/dashboard" label="Orders" active={isActive('/dashboard')} icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          } />
        )}
        <NavItem href="/profile" label="Profile" active={isActive('/profile')} icon={
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        } />
      </div>
    </nav>
  );
}

function NavItem({ href, label, active, icon, fillIcon = false }: { href: string; label: string; active: boolean; icon: React.ReactNode; fillIcon?: boolean }) {
  const toneClass = active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]';

  return (
    <Link href={href} className="flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-105 active:scale-95">
      <svg className={`h-6 w-6 ${toneClass}`} fill={fillIcon ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
      <span className={`text-xs ${toneClass}`}>{label}</span>
    </Link>
  );
}
