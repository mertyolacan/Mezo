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
  contact,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
  contact?: Contact;
}) {
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
      {!isAdmin && (
        <ContactBubble
          phone={contact?.phone}
          email={contact?.email}
          whatsapp={contact?.whatsapp}
        />
      )}
    </CartProvider>
  );
}
