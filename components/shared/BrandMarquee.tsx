"use client";

import Image from "next/image";

type Brand = { id: number; name: string; logo: string | null };

function LogoSet({ brands, ariaHidden }: { brands: Brand[]; ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center"
    >
      {brands.map((brand, i) => (
        <li key={`${brand.id}-${i}`} className="flex items-center justify-center px-10 shrink-0">
          <div className="relative h-9 w-28">
            <Image
              src={brand.logo!}
              alt={ariaHidden ? "" : brand.name}
              fill
              className="object-contain opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
              sizes="112px"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function BrandMarquee({ brands }: { brands: Brand[] }) {
  const withLogo = brands.filter((b) => b.logo);
  if (withLogo.length === 0) return null;

  // Pad to at least 10 so the track is always wider than the viewport
  const MIN = 10;
  const padded: Brand[] = [];
  while (padded.length < MIN) padded.push(...withLogo);

  return (
    <section className="border-y border-zinc-100 dark:border-zinc-800 py-8 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

      {/*
        Two identical sets side by side inside one animated wrapper.
        The wrapper's total width = 2× one set.
        translate3d(-50%) moves exactly one set → seamless loop on GPU.
      */}
      <div
        className="flex animate-marquee"
        style={{ width: "max-content" }}
      >
        <LogoSet brands={padded} />
        <LogoSet brands={padded} ariaHidden />
      </div>
    </section>
  );
}
