'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Users, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { FilterPanel, DEFAULT_FILTERS, type Filters } from './FilterPanel';

const items = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/feed', label: 'Discover', icon: Compass },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/chats', label: 'Messages', icon: MessageCircle },
];

/** Secondary nav: 4 items spread evenly full-width + a Filters control beside Messages. */
export function SecondaryNav() {
  const pathname = usePathname();
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === '/home' ? pathname === '/home' : pathname?.startsWith(href);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenFilters(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="sticky top-[var(--header-h,64px)] z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-[#1A1A18]/95">
      <div ref={wrapRef} className="relative mx-auto flex max-w-7xl items-center px-2 sm:px-6">
        {/* 4 items spread evenly across the available width */}
        <div className="flex flex-1 items-center justify-between sm:justify-around">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition sm:px-4 ${
                  active
                    ? 'border-[#f97316] text-[#f97316]'
                    : 'border-transparent text-black hover:text-[#f97316] dark:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Filters — beside Messages */}
        <div className="relative ml-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpenFilters((v) => !v)}
            aria-expanded={openFilters}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              openFilters
                ? 'border-[#f97316] text-[#f97316]'
                : 'border-gray-300 text-black hover:border-[#f97316] dark:border-gray-600 dark:text-white'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          {openFilters && (
            <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
              <FilterPanel value={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
