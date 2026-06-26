'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { dealTiles } from '@/lib/home-data';
import { Thumb } from './Thumb';

/**
 * (A) Walmart-style top deals block: ONE large featured deal that auto-shifts
 * every ~5s (framer-motion slide, reusing the landing hero motion), surrounded
 * by a grid of smaller deal tiles. Replaces the old left-right marquee.
 */
export function DealsHero() {
  const featured = dealTiles.slice(0, 4);
  const surrounding = dealTiles.slice(4);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((n) => (n + 1) % featured.length), 5000);
    return () => clearInterval(id);
  }, [paused, featured.length]);

  const current = featured[i];

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-[#f97316] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Deals</span>
        <h2 className="text-xl font-bold text-black dark:text-white sm:text-2xl">Top local deals</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Big featured shifting deal */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 lg:col-span-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative aspect-[16/9] w-full lg:aspect-[2/1]">
            <AnimatePresence mode="sync">
              <motion.div
                key={current.id}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                className="absolute inset-0"
              >
                <Link href={current.href} className="block h-full w-full">
                  <Thumb src={current.image} label={current.title} alt={current.title} className="h-full w-full" />
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                    <span className="inline-block rounded-full bg-[#f97316] px-3 py-1 text-sm font-bold text-white">{current.subtitle}</span>
                    <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-4xl">{current.title}</h3>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2">
            {featured.map((_, n) => (
              <button
                key={n}
                type="button"
                aria-label={`Featured deal ${n + 1}`}
                onClick={() => setI(n)}
                className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-[#f97316]' : 'w-2 bg-white/70'}`}
              />
            ))}
          </div>
        </div>

        {/* Surrounding deal tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {surrounding.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <Thumb src={tile.image} label={tile.title} alt={tile.title} className="h-14 w-14 shrink-0 rounded-xl" />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-black dark:text-white">{tile.title}</span>
                <span className="block truncate text-sm font-medium text-[#f97316]">{tile.subtitle}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
