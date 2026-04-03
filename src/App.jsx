import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import AdminProducts from "@/pages/admin/AdminProducts";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="pt-6"
  >
    {children}
  </motion.div>
);

export default function App() {
  const fetchMe = useAuth((s) => s.fetchMe);
  const location = useLocation();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<RootLayout />}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Home />
              </PageWrapper>
            }
          />
          <Route
            path="/collections"
            element={
              <PageWrapper>
                <Collections />
              </PageWrapper>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <PageWrapper>
                <Product />
              </PageWrapper>
            }
          />
          <Route
            path="/favorites"
            element={
              <PageWrapper>
                <Favorites />
              </PageWrapper>
            }
          />
          <Route
            path="/login"
            element={
              <PageWrapper>
                <LogIn />
              </PageWrapper>
            }
          />
          <Route
            path="/register"
            element={
              <PageWrapper>
                <LogIn />
              </PageWrapper>
            }
          />

          <Route
            path="/account"
            element={
              <RequireAuth>
                <PageWrapper>
                  <Account />
                </PageWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="/account/orders"
            element={
              <RequireAuth>
                <PageWrapper>
                  <OrderHistory />
                </PageWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="/account/profile"
            element={
              <RequireAuth>
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="/account/change-password"
            element={
              <RequireAuth>
                <PageWrapper>
                  <ChangePassword />
                </PageWrapper>
              </RequireAuth>
            }
          />

          {/* ADMIN ROUTES (if needed) */}
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin>
                <PageWrapper>
                  <AdminOrders />
                </PageWrapper>
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RequireAdmin>
                <PageWrapper>
                  <AdminProducts />
                </PageWrapper>
              </RequireAdmin>
            }
          />

          <Route
            path="/about"
            element={
              <PageWrapper>
                <About />
              </PageWrapper>
            }
          />
          <Route
            path="/personalized"
            element={
              <PageWrapper>
                <PersonalizedProducts />
              </PageWrapper>
            }
          />
          <Route
            path="/contact"
            element={
              <PageWrapper>
                <Contact />
              </PageWrapper>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageWrapper>
                <Checkout />
              </PageWrapper>
            }
          />
          <Route
            path="/thank-you"
            element={
              <PageWrapper>
                <ThankYou />
              </PageWrapper>
            }
          />

          <Route
            path="*"
            element={
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
