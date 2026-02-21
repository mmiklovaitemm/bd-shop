import { Routes, Route } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Product from "@/pages/Product/Product";
import Favorites from "@/pages/Favorites";
import LogIn from "@/pages/LogIn";
import About from "@/pages/about/About";
import Contact from "@/pages/Contact";
import PersonalizedProducts from "@/pages/personalized/PersonalizedProducts";
import NotFound from "@/pages/NotFound";
import Account from "@/pages/account/Account";
import OrderHistory from "./pages/account/OrderHistory";
import Profile from "./pages/account/Profile";
import ChangePassword from "./pages/account/ChangePassword";
import Checkout from "./pages/checkout/Checkout";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Products />} />
        <Route path="/collections/:id" element={<Product />} />
        <Route path="/favorites" element={<Favorites />} />

        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<LogIn />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/orders" element={<OrderHistory />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/change-password" element={<ChangePassword />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/personalized" element={<PersonalizedProducts />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
