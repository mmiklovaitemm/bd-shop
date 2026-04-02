import { create } from "zustand";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com/api";

const getUrl = (path) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  let finalPath = cleanPath;
  if (base.endsWith("/api") && cleanPath.startsWith("/api")) {
    finalPath = cleanPath.replace("/api", "");
  }

  return `${base}${finalPath}`;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function api(path, options = {}) {
  const url = getUrl(path);

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("access_token");
    }
    throw new Error(data.message || `API klaida ${res.status}`);
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
    return data;
  },

  register: async ({ email, password, firstName, lastName }) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    set({ user: data.user });
    return data;
  },

  logout: async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("access_token");
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
    return data.orders;
  },
}));

export default useAuth;
