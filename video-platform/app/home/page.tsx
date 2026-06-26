import { DealsHero } from '@/components/home/DealsHero';
import { Challenges } from '@/components/home/Challenges';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { ExpressDelivery } from '@/components/home/ExpressDelivery';
import { ShopByDepartment } from '@/components/home/ShopByDepartment';
import { FeaturedVideos } from '@/components/home/FeaturedVideos';
import { RankedLists } from '@/components/home/RankedLists';
import { Feedback } from '@/components/home/Feedback';
import { dealsAndMore, trendingArea, otherBusinesses } from '@/lib/home-data';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#1A1A18] dark:text-white">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6 sm:px-6">
      {/* (A) Top deals marquee + challenges */}
      <DealsHero />
      <Challenges />

      {/* (B) Deals & more for all */}
      <ProductCarousel title="Deals & more for all" products={dealsAndMore} seeAllHref="/feed" />

      {/* (C) Express delivery */}
      <ExpressDelivery />

      {/* (D) Shop by department */}
      <ShopByDepartment />

      {/* (E) Trending in your area */}
      <ProductCarousel title="Trending in your area" products={trendingArea} seeAllHref="/feed" />

      {/* (F) Featured in videos */}
      <FeaturedVideos />

      {/* (G) Other businesses in your area */}
      <ProductCarousel title="Other businesses in your area" products={otherBusinesses} seeAllHref="/feed" />

      {/* (H) Ranked lists */}
      <RankedLists />

      {/* (I) Feedback */}
      <Feedback />
      </div>
    </div>
  );
}
