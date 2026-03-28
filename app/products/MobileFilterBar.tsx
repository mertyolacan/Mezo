"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Filter, ArrowDownUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PriceFilter from "./PriceFilter";



type MobileFilterBarProps = {
  categories: { id: number; name: string; slug: string }[];
  brands: { id: number; name: string; slug: string }[];
  currentCategory?: string;
  currentBrand?: string;
  currentSort?: string;
  minPrice?: string;
  maxPrice?: string;
  totalCount: number;
};

export default function MobileFilterBar({
  categories,
  brands,
  currentCategory,
  currentBrand,
  currentSort,
  minPrice,
  maxPrice,
  totalCount,
}: MobileFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (filterOpen || sortOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen, sortOpen]);

  const sortOptions = [
    { value: "newest", label: "Önerilen Sıralama (En Yeni)" },
    { value: "price-asc", label: "En Düşük Fiyat" },
    { value: "price-desc", label: "En Yüksek Fiyat" },
  ];

  const activeFiltersCount = [currentCategory, currentBrand, minPrice, maxPrice].filter(Boolean).length;

  function handleSort(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", val);
    router.push(`/products?${params.toString()}`);
    setSortOpen(false);
  }

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY > 15 && currentY > lastY) {
        setScrolled(true);
      } else if (currentY < lastY) {
        setScrolled(false);
      }
      if (currentY < 15) setScrolled(false);
      lastY = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`lg:hidden w-full sticky top-[90px] md:top-[64px] z-20 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-all duration-500 transform will-change-transform ${
      scrolled ? "-translate-y-full opacity-0 pointer-events-none ease-in shadow-none" : "translate-y-0 opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] ease-[cubic-bezier(0.4,0,0.2,1)]"
    }`}>
      {/* Top Action Bar */}
      <div className="flex divide-x divide-zinc-200/50 dark:divide-zinc-800/50">
        <button
          onClick={() => setSortOpen(true)}
          className="flex-1 py-4 flex items-center justify-center gap-2.5 text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-brand-primary" />
          Sırala
        </button>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 py-4 flex items-center justify-center gap-2.5 text-[11px] font-bold uppercase text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 relative"
        >
          <Filter className="w-3.5 h-3.5 text-brand-primary" />
          Filtrele
          {activeFiltersCount > 0 && (
            <span className="absolute top-3 right-[22%] flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-brand-primary text-white text-[9px] font-bold border-2 border-white dark:border-zinc-950 shadow-sm animate-in zoom-in">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>



      {/* FILTER MODAL (Full Screen Portal) */}
      {mounted && createPortal(
        <div 
          className={`fixed inset-0 z-[999999] bg-white dark:bg-zinc-950 flex flex-col transition-transform duration-300 ease-out ${
            filterOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="relative flex items-center justify-center p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950">
            <button 
              onClick={() => setFilterOpen(false)} 
              className="absolute left-4 p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Menü & Filtrele</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">


            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Kategoriler</h3>
              <div className="space-y-2">
                <Link
                  href="/products"
                  className={`block p-3 rounded-brand border-2 transition-all ${!currentCategory ? "border-brand-primary bg-brand-surface text-brand-primary font-bold" : "border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"}`}
                  onClick={() => setFilterOpen(false)}
                >
                  Tümü
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className={`block p-3 rounded-brand border-2 transition-all ${currentCategory === c.slug ? "border-brand-primary bg-brand-surface text-brand-primary font-bold" : "border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"}`}
                    onClick={() => setFilterOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Markalar</h3>
                <div className="space-y-2">
                  <Link
                    href="/products"
                    className={`block p-3 rounded-brand border-2 transition-all ${!currentBrand ? "border-brand-primary bg-brand-surface text-brand-primary font-bold" : "border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"}`}
                    onClick={() => setFilterOpen(false)}
                  >
                    Tüm Markalar
                  </Link>
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/products?brand=${b.slug}`}
                      className={`block p-3 rounded-brand border-2 transition-all ${currentBrand === b.slug ? "border-brand-primary bg-brand-surface text-brand-primary font-bold" : "border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"}`}
                      onClick={() => setFilterOpen(false)}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter (Reused) */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Fiyat Aralığı</h3>
              <PriceFilter minPrice={minPrice} maxPrice={maxPrice} />
            </div>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-4 rounded-brand flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
            >
              Ürünleri Listele ({totalCount})
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* SORT MODAL (Bottom Sheet Portal) */}
      {mounted && createPortal(
        <>
          <div 
            className={`fixed inset-0 z-[999998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              sortOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`} 
            onClick={() => setSortOpen(false)}
          ></div>
          <div 
            className={`fixed bottom-0 left-0 right-0 z-[999999] bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
              sortOpen ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ maxHeight: "70vh" }}
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Sıralama</h2>
              <button onClick={() => setSortOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 pb-12 overflow-y-auto">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className="w-full text-left px-5 py-5 font-medium border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      currentSort === opt.value ? "border-brand-primary" : "border-zinc-300 dark:border-zinc-700"
                    }`}>
                      {currentSort === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                    </div>
                    <span className={currentSort === opt.value ? "text-brand-primary font-bold" : "text-zinc-700 dark:text-zinc-300 text-lg"}>
                      {opt.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
