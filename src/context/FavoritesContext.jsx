import { useEffect, useMemo, useRef, useState } from "react";
import FavoritesContext from "./favoritesContextInstance";
import useAuth, { getStoredToken } from "@/store/useAuth";

const STORAGE_KEY = "bdshop:favorites";
const API_BASE = "https://bd-shop-gfva.onrender.com/api";

function authHeaders() {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function readLocalFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalFavorites(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function FavoritesProvider({ children }) {
  const user = useAuth((s) => s.user);
  const [favoriteIds, setFavoriteIds] = useState(readLocalFavorites);
  const prevUserRef = useRef(null);

  useEffect(() => {
    saveLocalFavorites(favoriteIds);
  }, [favoriteIds]);

  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    if (user && !prevUser) {
      fetch(`${API_BASE}/favorites`, {
        credentials: "include",
        headers: authHeaders(),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.favoriteIds)) {
            setFavoriteIds(data.favoriteIds.map(String));
          }
        })
        .catch(() => {});
    } else if (!user && prevUser) {
      setFavoriteIds([]);
      saveLocalFavorites([]);
    }
  }, [user]);

  const value = useMemo(() => {
    const has = (id) => favoriteIds.map(String).includes(String(id));

    const toggle = (id) => {
      const strId = String(id);
      const isAdding = !favoriteIds.map(String).includes(strId);

      setFavoriteIds((prev) => {
        const strPrev = prev.map(String);
        return isAdding
          ? [...strPrev, strId]
          : strPrev.filter((x) => x !== strId);
      });

      if (user) {
        if (isAdding) {
          fetch(`${API_BASE}/favorites`, {
            method: "POST",
            headers: authHeaders(),
            credentials: "include",
            body: JSON.stringify({ productId: strId }),
          }).catch(() => {});
        } else {
          fetch(`${API_BASE}/favorites/${strId}`, {
            method: "DELETE",
            headers: authHeaders(),
            credentials: "include",
          }).catch(() => {});
        }
      }
    };

    const remove = (id) => {
      const strId = String(id);
      setFavoriteIds((prev) => prev.map(String).filter((x) => x !== strId));
      if (user) {
        fetch(`${API_BASE}/favorites/${strId}`, {
          method: "DELETE",
          headers: authHeaders(),
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
