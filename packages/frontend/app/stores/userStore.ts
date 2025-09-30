import { create } from "zustand";
import type { LoginResponse } from "~/pages/auth/login/services/api";

interface UserStore {
  user: LoginResponse | null;
  logout: () => void;
  login: (user: LoginResponse) => void;
}

const isBrowser = typeof window !== "undefined";
const userKey = "userInfo";

const getInitialState = (): LoginResponse | null => {
  if (!isBrowser) return null;

  try {
    const storedUser = localStorage.getItem(userKey);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

const useUserStore = create<UserStore>((set) => ({
  user: getInitialState(),
  logout: () => {
    if (!isBrowser) return;
    set({ user: null });
    localStorage.removeItem(userKey);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  login: (user) => {
    if (!isBrowser) return;
    set({ user });
    localStorage.setItem(userKey, JSON.stringify(user));
    localStorage.setItem("accessToken", user.token?.accessToken || "");
    localStorage.setItem("refreshToken", user.token?.refreshToken || "");
  },
}));

export default useUserStore;
