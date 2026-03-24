"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  categoryId?: number | null;
};

export default function AddToCartButton({ product, stock }: { product: Product; stock: number }) {
  const [added, setAdded] = useState(false);
  const disabled = stock <= 0;

  function handleAdd() {
    if (disabled) return;
    const cart = JSON.parse(localStorage.getItem("mesopro-cart") ?? "[]");
    const existing = cart.find((i: { id: number }) => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("mesopro-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-update"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
        disabled
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
          : added
          ? "bg-green-500 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
      }`}
    >
      <ShoppingCart className="h-4 w-4" />
      {added ? "Eklendi!" : disabled ? "Stokta yok" : "Sepete ekle"}
    </button>
  );
}
