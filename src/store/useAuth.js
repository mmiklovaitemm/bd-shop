// src/store/useAuth.js
import { create } from "zustand";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function api(path, options = {}) {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
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
    set({ user: data.user });
    return data.user;
  },

  register: async ({ email, password, firstName, lastName }) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    set({ user: data.user });
    return data.user;
  },

  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    set({ user: null });
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
    return data.orders;
  },
}));

export default useAuth;
