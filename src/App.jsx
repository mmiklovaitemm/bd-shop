import { Routes, Route } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Product from "@/pages/Product/Product";
import Favorites from "@/pages/Favorites";
import Account from "@/pages/Account";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import ShoppingBag from "@/pages/ShoppingBag";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Products />} />
        <Route path="/collections/:id" element={<Product />} />
        <Route path="/favorites" element={<Favorites />} />
        {/* <Route path="/cart" element={<ShoppingBag />} /> */}
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
