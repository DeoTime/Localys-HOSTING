import Link from 'next/link';
import { SectionHeader } from './SectionHeader';
import { categories } from '@/lib/home-data';

/** (D) Department circles. Placeholder emoji now; set `image` later to swap photos. */
export function ShopByDepartment() {
  return (
    <section>
      <SectionHeader title="Shop by department" />
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible lg:grid-cols-10 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <Link key={cat.id} href={cat.href} className="group flex shrink-0 flex-col items-center gap-2">
            <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-orange-50 to-amber-100 text-2xl shadow-sm transition group-hover:shadow-md dark:from-gray-800 dark:to-gray-700 sm:h-20 sm:w-20 sm:text-3xl">
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image} alt={cat.label} className="h-full w-full object-cover" />
              ) : (
                cat.emoji
              )}
            </span>
            <span className="text-center text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
