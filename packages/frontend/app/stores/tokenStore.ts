import { create } from "zustand";
import type { AuthTokens } from "~/pages/auth/login/types/types";

interface TokenStore {
  accessToken: string | null;
  refreshToken: string | null;
  logout: () => void;
  login: (token: AuthTokens) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

const isBrowser = typeof window !== "undefined";

const getInitialState = () => {
  if (!isBrowser) return null;

  try {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    return {
      accessToken: storedAccessToken,
      refreshToken: storedRefreshToken,
    };
  } catch (error) {
    console.error("Error parsing token from localStorage:", error);
    return null;
  }
};

const useTokenStore = create<TokenStore>((set) => ({
  accessToken: getInitialState()?.accessToken ?? null,
  refreshToken: getInitialState()?.refreshToken ?? null,
  logout: () => {
    if (!isBrowser) return;
    set({ accessToken: null, refreshToken: null });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  login: (token: AuthTokens) => {
    if (!isBrowser) return;
    set({ accessToken: token.accessToken, refreshToken: token.refreshToken });
    localStorage.setItem("accessToken", token.accessToken);
    localStorage.setItem("refreshToken", token.refreshToken);
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    if (!isBrowser) return;
    set({ accessToken, refreshToken });
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },
}));

export default useTokenStore;
