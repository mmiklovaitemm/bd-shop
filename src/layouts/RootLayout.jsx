import { Outlet } from "react-router-dom";

import AnnouncementBar from "@/components/sections/AnnouncementBar";
import Header from "@/components/layout/Header";
import ShoppingBagDrawer from "@/components/drawers/ShoppingBagDrawer";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import SubscribeBanner from "@/components/ui/SubscribeBanner";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <ScrollToTop />
      <AnnouncementBar />
      <Header />
      <ShoppingBagDrawer />
      <main className="mx-auto w-full max-w-6xl">
        <Outlet />
      </main>

      <SubscribeBanner delayMs={3000} />
      <Footer />
    </div>
  );
}
