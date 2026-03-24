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
  },
  lt: {
    collections: "Kolekcijos",
    aboutUs: "Apie mus",
    contacts: "Kontaktai",
    wishlist: "Patikusios",
    bag: "Krepšelis",
    logIn: "Prisijungti",
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
