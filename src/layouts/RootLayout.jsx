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

      <div className="fixed top-0 left-0 right-0 z-[100]">
        <AnnouncementBar />
        <Header />
      </div>

      <ShoppingBagDrawer />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <SubscribeBanner delayMs={3000} />
      <Footer />
    </div>
  );
}
