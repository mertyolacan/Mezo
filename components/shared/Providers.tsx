"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "./CartDrawer";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NavigationProgress from "./NavigationProgress";

export default function Providers({ children, isLoggedIn }: { children: React.ReactNode; isLoggedIn: boolean }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <CartProvider>
      <NavigationProgress />
      {!isAdmin && <Navbar isLoggedIn={isLoggedIn} />}
      {!isAdmin && <CartDrawer />}
      <div className={isAdmin ? undefined : "pt-16"}>
        {children}
        {!isAdmin && <Footer />}
      </div>
    </CartProvider>
  );
}
