import { create } from "zustand";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com/api";

const getUrl = (path) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  let finalPath = cleanPath;
  if (base.endsWith("/api") && cleanPath.startsWith("/api/")) {
    finalPath = cleanPath.replace("/api", "");
  }

  return `${base}${finalPath}`;
};

const TOKEN_KEY = "auth_token";
export const getStoredToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const saveToken = (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch {} };
const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} };

async function api(path, options = {}) {
  const url = getUrl(path);
  const token = getStoredToken();

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `API error ${res.status}`);
  }

  return data;
}

const useAuth = create((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    set({ loading: true });
    try {
      const data = await api("/api/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async ({ email, password }) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) saveToken(data.token);
    set({ user: data.user });
    return data;
  },

  register: async ({ email, password, firstName, lastName }) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    if (data.token) saveToken(data.token);
    set({ user: data.user });
    return data;
  },

  logout: async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      clearToken();
      set({ user: null });
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const data = await api("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return data;
  },

  updateProfile: async ({ firstName, lastName }) => {
    const data = await api("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({ firstName, lastName }),
    });

    set((state) => ({
      user: {
        ...state.user,
        ...data.user,
        role: data.user?.role || state.user?.role || "user",
      },
    }));

    return data.user;
  },

  getOrders: async () => {
    const data = await api("/api/orders");
    return data.orders || [];
  },
}));

export default useAuth;
