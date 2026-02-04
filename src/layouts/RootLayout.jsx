import { Outlet } from "react-router-dom";

import AnnouncementBar from "@/components/sections/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <AnnouncementBar />
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
