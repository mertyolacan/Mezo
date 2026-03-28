"use client";

import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useState } from "react";

type Product = { id: number; name: string; price: number; image: string; slug: string; categoryId?: number | null };

export default function AddToCartButton({ product, disabled }: { product: Product; disabled?: boolean }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const cart = JSON.parse(localStorage.getItem("mesopro-cart") ?? "[]");
    const existing = cart.find((i: { id: number }) => i.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }
    localStorage.setItem("mesopro-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-update"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Adet seçici */}
      {!disabled && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Adet:</span>
          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sepete ekle butonu */}
      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
          disabled
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            : added
            ? "bg-green-500 text-white"
            : "bg-brand-primary hover:bg-brand-primary-light text-white active:scale-95"
        }`}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
        {added ? `${qty} ürün sepete eklendi!` : disabled ? "Stokta yok" : "Sepete Ekle"}
      </button>
    </div>
  );
}
