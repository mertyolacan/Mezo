"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "./CartDrawer";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NavigationProgress from "./NavigationProgress";
import ContactBubble from "./ContactBubble";

interface Contact {
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
}

export default function Providers({
  children,
  isLoggedIn,
  userIsAdmin,
  contact,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
  userIsAdmin?: boolean;
  contact?: Contact;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <CartProvider>
      <NavigationProgress />
      {!isAdminRoute && <Navbar isLoggedIn={isLoggedIn} isAdmin={userIsAdmin} />}
      {!isAdminRoute && <CartDrawer />}
      <div className={isAdminRoute ? undefined : "pt-16"}>
        {children}
        {!isAdminRoute && <Footer />}
      </div>
      {!isAdminRoute && (
        <ContactBubble
          phone={contact?.phone}
          email={contact?.email}
          whatsapp={contact?.whatsapp}
        />
      )}
    </CartProvider>
  );
}
