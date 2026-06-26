import Link from 'next/link';
import { MapPin } from 'lucide-react';

// Two vertically-scrolling columns of local-business / community photos.
const colA = [
  '/landing/biz-ana-pastry.png',
  '/landing/hero-food.jpeg',
  '/landing/biz-align.png',
  '/landing/creator-dining.jpg',
  '/landing/biz-arnold.png',
];
const colB = [
  '/landing/biz-aneals.png',
  '/landing/hero-flowers.jpg',
  '/landing/biz-acuvega.png',
  '/landing/hero-restaurant.png',
  '/landing/biz-advanced-printing.png',
];

function Column({ images, className }: { images: string[]; className: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {[...images, ...images].map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          aria-hidden
          loading="eager"
          className="aspect-[3/4] w-full rounded-2xl object-cover"
        />
      ))}
    </div>
  );
}

export default function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LEFT — animated collage */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
          <Column images={colA} className="animate-marquee-y" />
          <Column images={colB} className="animate-marquee-y-rev" />
        </div>

        {/* legibility overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />

        {/* brand wordmark */}
        <Link href="/" className="absolute left-8 top-8 z-10 flex items-center gap-2 text-white">
          <MapPin className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-xl font-semibold tracking-wide">Localys</span>
        </Link>
      </div>

      {/* RIGHT — form */}
      <div className="flex w-full items-center justify-center overflow-y-auto bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
