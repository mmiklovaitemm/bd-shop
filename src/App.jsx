import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "@/store/useAuth";

import RootLayout from "@/layouts/RootLayout";
import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import Product from "@/pages/Product/Product";
import Favorites from "@/pages/Favorites";
import LogIn from "@/pages/LogIn";
import About from "@/pages/about/About";
import Contact from "@/pages/Contact";
import PersonalizedProducts from "@/pages/personalized/PersonalizedProducts";
import NotFound from "@/pages/NotFound";
import Account from "@/pages/account/Account";
import OrderHistory from "@/pages/account/OrderHistory";
import Profile from "@/pages/account/Profile";
import ChangePassword from "@/pages/account/ChangePassword";
import Checkout from "@/pages/checkout/Checkout";
import ThankYou from "@/pages/checkout/ThankYou";
import RequireAuth from "@/components/auth/RequireAuth";
import AdminOrders from "@/pages/admin/AdminOrders";
import RequireAdmin from "@/components/auth/RequireAdmin";

export default function App() {
  const fetchMe = useAuth((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<Product />} />
        <Route path="/favorites" element={<Favorites />} />

        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<LogIn />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders"
          element={
            <RequireAuth>
              <OrderHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/account/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/account/change-password"
          element={
            <RequireAuth>
              <ChangePassword />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <AdminOrders />
            </RequireAdmin>
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/personalized" element={<PersonalizedProducts />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
