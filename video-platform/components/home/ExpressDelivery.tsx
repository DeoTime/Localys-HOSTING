import Link from 'next/link';

/** Walmart-style Express Delivery banner: chip | headline + CTA | teddy bear image. */
export function ExpressDelivery() {
  return (
    <section className="relative flex min-h-[168px] overflow-hidden rounded-2xl bg-[#ea6c00] text-white">
      {/* Left — white chip with brand label */}
      <div className="flex shrink-0 items-center px-5 py-5 sm:px-8">
        <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-base font-extrabold leading-tight text-[#f97316] sm:text-lg">Express</p>
          <p className="text-base font-extrabold leading-tight text-[#f97316] sm:text-lg">Delivery</p>
        </div>
      </div>

      {/* Center — headline, subtitle, CTA */}
      <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">Get local faves fast</h2>
        <p className="mt-1 text-sm text-white/85">Get faves in under 2 hrs</p>
        <Link
          href="/feed"
          className="mt-3 inline-block font-bold text-white underline underline-offset-2"
        >
          Shop
        </Link>
        <p className="mt-1 text-[11px] text-white/55">*Fees and terms apply</p>
      </div>

      {/* Right — teddy bear image (hidden on xs) */}
      <div className="relative hidden shrink-0 sm:block" style={{ width: '176px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Refrences%20of%20ui%20I%20like/Teddybear.jpg"
          alt=""
          className="h-full w-full object-cover object-top"
        />
      </div>
    </section>
  );
}
