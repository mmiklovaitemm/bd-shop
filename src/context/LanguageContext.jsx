import { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./languageContext";

const translations = {
  en: {
    collections: "Collections",
    aboutUs: "About us",
    contacts: "Contacts",
    wishlist: "Wishlist",
    bag: "Bag",
    logIn: "Log in",
    close: "Close",
    closeBag: "Close bag",
    account: "Account",
    subscribeTitle: "Subscribe & save",
    subscribeText:
      "Subscribe to our email newsletter and receive the best offers and discounts",
    emailPlaceholder: "Email",
    subscribeButton: "Subscribe",
    home: "Home",
    products: "Products",
    favorites: "Favorites",
    bagEmpty: "Your bag is empty.",
    soldOut: "Sold out",
    inStock: "In stock",
    shippingKit: "Shipping kit",
    serviceOption: "Service option",
    inStore: "In-store",
    color: "Color",
    size: "Size",
    oneSize: "One size",
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    removeItem: "Remove item",
    checkout: "Check out",
    warranty: "2 Year Warranty",
    highQuality: "High Quality",
    fastDelivery: "Fast Delivery",
    return90Days: "90-Day Return",
    bestSellers: "Best sellers",
    seeAll: "See all",
    seeAllBestSellers: "See all best sellers",
    categories: "Categories",
    heroTitleLine1: "Discover",
    heroTitleLine2: "Timeless",
    heroTitleLine3: "Elegance",
    heroTitleDesktop: "Discover Timeless Elegance",
  },
  lt: {
    collections: "Kolekcijos",
    aboutUs: "Apie mus",
    contacts: "Kontaktai",
    wishlist: "Patikusios",
    bag: "Krepšelis",
    logIn: "Prisijungti",
    close: "Uždaryti",
    closeBag: "Uždaryti krepšelį",
    account: "Paskyra",
    subscribeTitle: "Prenumeruokite ir sutaupykite",
    subscribeText:
      "Prenumeruokite mūsų naujienlaiškį el. paštu ir gaukite geriausius pasiūlymus bei nuolaidas",
    emailPlaceholder: "El. paštas",
    subscribeButton: "Prenumeruoti",
    home: "Pagrindinis",
    products: "Produktai",
    favorites: "Patikusios",
    bagEmpty: "Jūsų krepšelis tuščias.",
    soldOut: "Išparduota",
    inStock: "Liko",
    shippingKit: "Siuntimo rinkinys",
    serviceOption: "Paslaugos pasirinkimas",
    inStore: "Salone",
    color: "Spalva",
    size: "Dydis",
    oneSize: "Vienas dydis",
    decreaseQuantity: "Sumažinti kiekį",
    increaseQuantity: "Padidinti kiekį",
    removeItem: "Pašalinti prekę",
    checkout: "Apmokėti",
    warranty: "2 metų garantija",
    highQuality: "Aukšta kokybė",
    fastDelivery: "Greitas pristatymas",
    return90Days: "90 dienų grąžinimas",
    bestSellers: "Perkamiausi",
    seeAll: "Žiūrėti visus",
    seeAllBestSellers: "Žiūrėti visus perkamiausius",
    categories: "Kategorijos",
    heroTitleLine1: "Atraskite",
    heroTitleLine2: "Nesenstančią",
    heroTitleLine3: "Eleganciją",
    heroTitleDesktop: "Atraskite nesenstančią eleganciją",
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const value = useMemo(() => {
    return {
      lang,
      setLang,
      t: translations[lang],
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
