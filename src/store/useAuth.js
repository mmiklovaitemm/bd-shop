// Demo auth - localStorage based, no backend needed
import { create } from "zustand";

const USER_KEY = "demo_user";
const USERS_KEY = "demo_users";

export const getStoredToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return user ? "demo-token" : null;
  } catch { return null; }
};

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
};

const saveUsers = (users) => {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
};

const useAuth = create((set) => ({
  user: null,
  loading: true,

  fetchMe: () => {
    try {
      const stored = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      set({ user: stored, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!found) throw new Error("Invalid email address or password.");
    const user = { id: found.id, email: found.email, firstName: found.firstName, lastName: found.lastName, role: found.role || "customer" };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
    return { user };
  },

  register: async ({ email, password, firstName, lastName }) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error("A user with this email address already exists.");
    }
    const newUser = {
      id: Date.now(),
      email,
      password,
      firstName: firstName || "",
      lastName: lastName || "",
      role: "customer",
    };
    saveUsers([...users, newUser]);
    const user = { id: newUser.id, email, firstName: firstName || "", lastName: lastName || "", role: "customer" };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
    return { user };
  },

  logout: async () => {
    localStorage.removeItem(USER_KEY);
    set({ user: null });
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    await new Promise((r) => setTimeout(r, 600));
    const stored = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    if (!stored) throw new Error("Not logged in.");
    const users = getUsers();
    const idx = users.findIndex((u) => u.email === stored.email);
    if (idx === -1 || users[idx].password !== currentPassword) {
      throw new Error("Current password is incorrect.");
    }
    users[idx].password = newPassword;
    saveUsers(users);
    return { success: true };
  },

  updateProfile: async ({ firstName, lastName }) => {
    await new Promise((r) => setTimeout(r, 600));
    const stored = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    if (!stored) throw new Error("Not logged in.");
    const updated = { ...stored, firstName, lastName };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    set({ user: updated });
    return updated;
  },

  getOrders: async () => {
    try {
      return JSON.parse(localStorage.getItem("demo_orders") || "[]");
    } catch { return []; }
  },
}));

export default useAuth;
