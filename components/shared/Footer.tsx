import Link from "next/link";

const links = {
  Kurumsal: [
    { href: "/", label: "Ana Sayfa" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "İletişim" },
  ],
  Ürünler: [
    { href: "/products", label: "Tüm Ürünler" },
    { href: "/faq", label: "Sıkça Sorulan Sorular" },
  ],
  Hesap: [
    { href: "/login", label: "Giriş Yap" },
    { href: "/register", label: "Üye Ol" },
    { href: "/profile/orders", label: "Siparişlerim" },
    { href: "/profile/support", label: "Destek" },
  ],
  Yasal: [
    { href: "/kvkk", label: "KVKK & Gizlilik" },
    { href: "/faq", label: "SSS" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Meso<span className="text-indigo-500">Pro</span>
            </Link>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              Klinikler ve doktorlar için profesyonel mezoterapi ürünleri.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                {group}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} MesoPro. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/kvkk" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/faq" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              SSS
            </Link>
            <Link href="/contact" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              İletişim
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
