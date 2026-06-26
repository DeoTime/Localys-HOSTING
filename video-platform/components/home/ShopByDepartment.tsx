import Link from 'next/link';
import { SectionHeader } from './SectionHeader';
import { Thumb } from './Thumb';
import { categories } from '@/lib/home-data';

/** (D) Department circles, wired to /categories icons (swap via `image`). */
export function ShopByDepartment() {
  return (
    <section>
      <SectionHeader title="Shop by department" />
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible lg:grid-cols-10 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <Link key={cat.id} href={cat.href} className="group flex shrink-0 flex-col items-center gap-2">
            <Thumb
              src={cat.image}
              label={cat.label}
              alt={cat.label}
              className="h-16 w-16 rounded-full shadow-sm transition group-hover:shadow-md sm:h-20 sm:w-20"
              imgClassName="h-full w-full object-contain p-3"
            />
            <span className="text-center text-xs font-semibold text-black dark:text-white sm:text-sm">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
