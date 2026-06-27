'use client';

import Link from 'next/link';
import { SectionHeader } from './SectionHeader';

const DEPARTMENTS = [
  { name: 'Beauty',        src: '/Shop%20by%20department/beauty.jpg',          href: '/feed?category=Beauty' },
  { name: 'Flowers',       src: '/Shop%20by%20department/Flowers.jpg',         href: '/feed?category=Flowers' },
  { name: 'Grocery',       src: '/Shop%20by%20department/Grocery.jpg',         href: '/feed?category=Grocery' },
  { name: 'Health',        src: '/Shop%20by%20department/Health.jpg',          href: '/feed?category=Health' },
  { name: 'Home Services', src: '/Shop%20by%20department/Home%20services.jpg', href: '/feed?category=Home+Services' },
  { name: 'Personal Care', src: '/Shop%20by%20department/Personal%20care.jpg', href: '/feed?category=Personal+Care' },
  { name: 'Pets',          src: '/Shop%20by%20department/Pets.png',            href: '/feed?category=Pets' },
  { name: 'Restaurants',   src: '/Shop%20by%20department/Restaurants.webp',   href: '/feed?category=Restaurants' },
];

/** Static circular department icons sourced from /public/Shop by department/. */
export function ShopByDepartment() {
  return (
    <section>
      <SectionHeader title="Shop by department" seeAllHref="/feed" />
      <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-8 [&::-webkit-scrollbar]:hidden">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.name}
            href={dept.href}
            className="group flex shrink-0 flex-col items-center gap-2"
          >
            <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-gray-100 ring-2 ring-transparent transition-all duration-200 group-hover:ring-[#f97316] sm:h-[88px] sm:w-[88px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dept.src}
                alt={dept.name}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="w-20 text-center text-[11px] font-semibold leading-tight text-black dark:text-white sm:w-24 sm:text-xs">
              {dept.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
