import Link from 'next/link';
import { dealTiles } from '@/lib/home-data';

/**
 * (A) Top deals mosaic that slides + pauses on hover — reuses the landing page
 * marquee animation (`animate-marquee-x` + `.group:hover` pause in globals.css).
 */
export function DealsHero() {
  return (
    <section className="overflow-hidden">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-[#f97316] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Deals</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Top local deals</h2>
      </div>

      <div className="group relative [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]">
        <div className="animate-marquee-x flex w-max gap-4">
          {[...dealTiles, ...dealTiles].map((tile, i) => (
            <Link
              key={`${tile.id}-${i}`}
              href={tile.href}
              className="group/tile flex w-56 shrink-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 text-3xl dark:from-gray-800 dark:to-gray-700">
                {tile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tile.image} alt={tile.title} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  tile.emoji
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-gray-900 dark:text-white">{tile.title}</span>
                <span className="block truncate text-sm font-medium text-[#f97316]">{tile.subtitle}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
