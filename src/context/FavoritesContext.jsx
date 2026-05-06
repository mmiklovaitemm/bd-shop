import { useEffect, useMemo, useState } from "react";
import FavoritesContext from "./favoritesContextInstance";
import useAuth from "@/store/useAuth";

const STORAGE_KEY = "bdshop:favorites";
const API_BASE = "https://bd-shop-gfva.onrender.com/api";

function readLocalFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const user = useAuth((s) => s.user);

  const [favoriteIds, setFavoriteIds] = useState(readLocalFavorites);

  // When user logs in — fetch from API; when logs out — restore from localStorage
  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/favorites`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.favoriteIds)) {
            setFavoriteIds(data.favoriteIds);
          }
        })
        .catch(() => {});
    } else {
      setFavoriteIds(readLocalFavorites());
    }
  }, [user]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
      } catch {
        // ignore
      }
    }
  }, [favoriteIds, user]);

  const value = useMemo(() => {
    const has = (id) => favoriteIds.includes(id);

    const toggle = (id) => {
      const isAdding = !favoriteIds.includes(id);
      setFavoriteIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      if (user) {
        if (isAdding) {
          fetch(`${API_BASE}/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId: id }),
          }).catch(() => {});
        } else {
          fetch(`${API_BASE}/favorites/${id}`, {
            method: "DELETE",
            credentials: "include",
          }).catch(() => {});
        }
      }
    };

    const remove = (id) => {
      setFavoriteIds((prev) => prev.filter((x) => x !== id));
      if (user) {
        fetch(`${API_BASE}/favorites/${id}`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => {});
      }
    };

    const clear = () => setFavoriteIds([]);

    return { favoriteIds, has, toggle, remove, clear };
  }, [favoriteIds, user]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
