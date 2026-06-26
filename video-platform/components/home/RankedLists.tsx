import { ProductCarousel } from './ProductCarousel';
import { rankedLists } from '@/lib/home-data';

/**
 * (H) Repeatable ranked-list pattern — renders one ProductCarousel per list.
 * Add more lists by appending to `rankedLists` in lib/home-data.ts.
 */
export function RankedLists() {
  return (
    <div className="space-y-10">
      {rankedLists.map((list) => (
        <ProductCarousel key={list.id} title={list.title} products={list.items} />
      ))}
    </div>
  );
}
