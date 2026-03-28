import { CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Siparişiniz Alındı!</h1>
      {order && (
        <p className="text-sm text-zinc-500 mb-1">
          Sipariş No: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{order}</span>
        </p>
      )}
      <p className="text-sm text-zinc-500 mb-8">
        Siparişiniz hazırlanmaya başladığında e-posta ile bilgilendirileceksiniz. Ödeme kapıda nakit olarak alınacaktır.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors">
          <ShoppingBag className="h-4 w-4" />
          Alışverişe Devam Et
        </Link>
        <Link href="/profile/orders" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors">
          Siparişlerim
        </Link>
      </div>
    </div>
  );
}
