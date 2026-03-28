"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/contexts/CartContext";
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
  const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  const showNavbar = !isAdminRoute;
  const showFooter = !isAdminRoute && !isAuthRoute && pathname !== "/cart" && pathname !== "/checkout";
  const showContactBubble = !isAdminRoute && !isAuthRoute && pathname !== "/cart" && pathname !== "/checkout";

  return (
    <CartProvider>
      <NavigationProgress />
      {showNavbar && <Navbar isLoggedIn={isLoggedIn} isAdmin={userIsAdmin} />}
      <div className={isAdminRoute ? undefined : "pt-[90px] md:pt-[64px]"}>
        {children}
        {showFooter && <Footer />}
      </div>
      {showContactBubble && (
        <ContactBubble
          phone={contact?.phone}
          email={contact?.email}
          whatsapp={contact?.whatsapp}
        />
      )}
    </CartProvider>
  );
}
