'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Users, MessageCircle } from 'lucide-react';

const items = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/feed', label: 'Discover', icon: Compass },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/chats', label: 'Messages', icon: MessageCircle },
];

/** Secondary horizontal nav below the top header. Active item = orange accent. */
export function SecondaryNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/home' ? pathname === '/home' : pathname?.startsWith(href);

  return (
    <nav className="sticky top-[var(--header-h,64px)] z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-[#1A1A18]/95">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-2 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'border-[#f97316] text-[#f97316]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
