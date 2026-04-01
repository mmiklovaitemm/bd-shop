import { Outlet } from "react-router-dom";

import AnnouncementBar from "@/components/sections/AnnouncementBar";
import Header from "@/components/layout/Header";
import ShoppingBagDrawer from "@/components/drawers/ShoppingBagDrawer";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import SubscribeBanner from "@/components/ui/SubscribeBanner";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <ScrollToTop />
      <AnnouncementBar />
      <Header />
      <ShoppingBagDrawer />

      {/* flex-1 uztikrina, kad jei turinio mazai, Footeris visada bus apacioje */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <SubscribeBanner delayMs={3000} />
      <Footer />
    </div>
  );
}
