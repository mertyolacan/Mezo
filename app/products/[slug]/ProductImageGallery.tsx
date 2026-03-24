"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

type Props = {
  images: string[];
  name: string;
  discount: number | null;
};

export default function ProductImageGallery({ images, name, discount }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      {/* Ana görsel */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        {images[active] ? (
          <Image
            key={active}
            src={images[active]}
            alt={`${name} ${active + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority={active === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-20 w-20 text-zinc-300" />
          </div>
        )}
        {discount && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
      </div>

      {/* Küçük resimler */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                active === i
                  ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800"
                  : "border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
