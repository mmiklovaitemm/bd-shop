import { useEffect, useMemo, useState } from "react";
import FavoritesContext from "./favoritesContextInstance";

const STORAGE_KEY = "bdshop:favorites";

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  const value = useMemo(() => {
    const has = (id) => favoriteIds.includes(id);

    const toggle = (id) => {
      setFavoriteIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    };

    const remove = (id) =>
      setFavoriteIds((prev) => prev.filter((x) => x !== id));
    const clear = () => setFavoriteIds([]);

    return { favoriteIds, has, toggle, remove, clear };
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
