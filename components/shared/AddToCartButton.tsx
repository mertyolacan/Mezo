"use client";

import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  categoryId?: number | null;
};

export default function AddToCartButton({ product, stock }: { product: Product; stock: number }) {
  const [quantity, setQuantity] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const disabled = stock <= 0;

  // Initialize quantity from cart
  useEffect(() => {
    const getInitialQuantity = () => {
      const cart = JSON.parse(localStorage.getItem("mesopro-cart") ?? "[]");
      const existing = cart.find((i: { id: number }) => i.id === product.id);
      return existing ? existing.quantity : 0;
    };
    setQuantity(getInitialQuantity());

    const handleUpdate = () => setQuantity(getInitialQuantity());
    window.addEventListener("cart-update", handleUpdate);
    return () => window.removeEventListener("cart-update", handleUpdate);
  }, [product.id]);

  function updateCart(newQty: number) {
    setIsChanging(true);
    const cart = JSON.parse(localStorage.getItem("mesopro-cart") ?? "[]");
    const index = cart.findIndex((i: { id: number }) => i.id === product.id);

    if (newQty <= 0) {
      if (index > -1) cart.splice(index, 1);
    } else {
      if (index > -1) {
        cart[index].quantity = newQty;
      } else {
        cart.push({ ...product, quantity: newQty });
      }
    }

    localStorage.setItem("mesopro-cart", JSON.stringify(cart));
    setQuantity(newQty);
    window.dispatchEvent(new Event("cart-update"));
    setTimeout(() => setIsChanging(false), 200);
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full h-10 flex items-center justify-center rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-transparent"
      >
        Stokta Yok
      </button>
    );
  }

  return (
    <div className="relative w-full h-10 group overflow-hidden">
      {/* Sepete Ekle - Initial State */}
      <button
        onClick={() => updateCart(1)}
        className={`absolute inset-0 w-full h-full flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 border-2 border-indigo-600 bg-white dark:bg-zinc-950 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 active:scale-95 shadow-sm shadow-indigo-600/5 ${
          quantity > 0 ? "opacity-0 pointer-events-none -translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <span>Sepete Ekle</span>
      </button>

      {/* Quantity Selector - Active State */}
      <div 
        className={`absolute inset-0 flex items-center w-full h-full border-2 border-indigo-600 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm shadow-indigo-600/10 transition-all duration-300 ${
          quantity > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 pointer-events-none translate-y-2 scale-105"
        }`}
      >
        <button
          onClick={() => updateCart(quantity - 1)}
          className="h-full px-3 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 transition-colors"
          aria-label="Azalt"
        >
          {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </button>

        <span className={`flex-1 text-center transition-all duration-200 flex flex-col items-center justify-center leading-none ${isChanging ? "scale-110 opacity-70" : "scale-100 opacity-100"}`}>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{quantity}</span>
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Adet</span>
        </span>

        <button
          onClick={() => updateCart(quantity + 1)}
          disabled={quantity >= stock}
          className="h-full px-3 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 disabled:opacity-30 transition-colors"
          aria-label="Artır"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
