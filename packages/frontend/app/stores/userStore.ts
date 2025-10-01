import { create } from "zustand";
import type { User, Company } from "~/pages/auth/login/types/types";

interface UserData {
  user: User;
  company: Company;
}

interface UserStore {
  user: User | null;
  company: Company | null;
  logout: () => void;
  login: (data: UserData) => void;
  setUser: (user: User) => void;
}

const isBrowser = typeof window !== "undefined";
const userKey = "userInfo";
const companyKey = "companyInfo";

interface StoredData {
  user: User | null;
  company: Company | null;
}

const getInitialState = (): StoredData => {
  if (!isBrowser) return { user: null, company: null };

  try {
    const storedUser = localStorage.getItem(userKey);
    const storedCompany = localStorage.getItem(companyKey);
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      company: storedCompany ? JSON.parse(storedCompany) : null,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { user: null, company: null };
  }
};

const useUserStore = create<UserStore>((set) => ({
  user: getInitialState().user,
  company: getInitialState().company,
  logout: () => {
    if (!isBrowser) return;
    set({ user: null, company: null });
    localStorage.removeItem(userKey);
    localStorage.removeItem(companyKey);
  },
  login: (data: UserData) => {
    if (!isBrowser) return;
    set({ user: data.user, company: data.company });
    localStorage.setItem(userKey, JSON.stringify(data.user));
    localStorage.setItem(companyKey, JSON.stringify(data.company));
  },
  setUser: (user: User) => {
    if (!isBrowser) return;
    set({ user });
    localStorage.setItem(userKey, JSON.stringify(user));
  },
}));

export default useUserStore;
