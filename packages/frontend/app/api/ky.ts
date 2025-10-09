import ky from "ky";
import type { RefreshResponse } from "~/pages/auth/login/types/types";
import useTokenStore from "~/stores/tokenStore";
import useUserStore from "~/stores/userStore";
import type { ApiResponse } from "~/utils/api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const REFRESH_TOKEN_URL = "/auth/refresh";
const AUTH_LOGIN_PATH = "/auth/login";
const DEFAULT_ERROR_MESSAGE = "인증이 만료되었습니다. 다시 로그인 해주세요.";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];
let originalResponse: Response | null = null;

const processQueue = (error: Error | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error!);
    }
  });
  failedQueue = [];
};

export const getResponseData = <T>(response: any): T => {
  return response.data as T;
};
// 파일 업로드용 API 인스턴스
export const uploadAPI = ky.create({
  prefixUrl: BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const accessToken = useTokenStore.getState().accessToken;
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        // Content-Type을 설정하지 않음 (FormData 자동 설정을 위해)

        // Add ngrok skip browser warning header if exists in env
        const ngrokSkipBrowserWarning = import.meta.env
          .VITE_NGROK_SKIP_BROWSER_WARNING;
        if (ngrokSkipBrowserWarning) {
          request.headers.set(
            "ngrok-skip-browser-warning",
            ngrokSkipBrowserWarning
          );
        }

        // Add current page path to X-Custom-Referer header
        const currentPagePath = window.location.pathname;
        request.headers.set("X-Custom-Referer", currentPagePath);
      },
    ],
  },
});

const API = ky.create({
  prefixUrl: BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const accessToken = useTokenStore.getState().accessToken;
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }

        // Add ngrok skip browser warning header if exists in env
        const ngrokSkipBrowserWarning = import.meta.env
          .VITE_NGROK_SKIP_BROWSER_WARNING;
        if (ngrokSkipBrowserWarning) {
          request.headers.set(
            "ngrok-skip-browser-warning",
            ngrokSkipBrowserWarning
          );
        }

        request.headers.set("Content-Type", "application/json");

        // Add current page path to X-Custom-Referer header
        const currentPagePath = window.location.pathname;
        request.headers.set("X-Custom-Referer", currentPagePath);
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        // Handle account locked (423) - don't try refresh token
        if (response.status === 423) {
          try {
            const errorResponse = await response.clone().json();
            const errorMessage =
              errorResponse?.error?.message ||
              "Account is locked. Please try again later.";
            console.error(errorMessage);
          } catch (err) {
            console.error("Account is locked. Please try again later.");
          }
          return response;
        }

        if (response.status === 401) {
          const originalRequest = request.clone();
          if (!originalResponse) {
            originalResponse = response.clone();
          }

          if (!request.headers.get("x-retry")) {
            if (isRefreshing) {
              try {
                const newToken = await new Promise<string>(
                  (resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                  }
                );

                if (!newToken || newToken === "undefined") {
                  throw new Error("Invalid token received");
                }

                originalRequest.headers.set(
                  "Authorization",
                  `Bearer ${newToken}`
                );
                originalRequest.headers.set("x-retry", "true");
                return ky(originalRequest);
              } catch (err) {
                throw err;
              }
            }

            isRefreshing = true;
            console.log("Refreshing token...");

            try {
              const refreshToken = useTokenStore.getState().refreshToken;
              if (!refreshToken) {
                throw new Response("Missing refreshToken", { status: 400 });
              }

              const refreshResponse = await ky
                .post(BASE_URL + REFRESH_TOKEN_URL, {
                  json: {
                    refreshToken: refreshToken,
                  },
                })
                .json<ApiResponse<RefreshResponse>>();

              // Backend wraps response in { status, timestamp, data }
              const newAccessToken = refreshResponse.data?.accessToken;
              const newRefreshToken = refreshResponse.data?.refreshToken;
              if (!newAccessToken || !newRefreshToken) {
                throw new Error("Invalid tokens received from refresh");
              }

              // Update TokenStore with new tokens
              useTokenStore
                .getState()
                .setTokens(newAccessToken, newRefreshToken);

              processQueue(null, newAccessToken);

              // 토큰 갱신 성공 시 원본 응답 초기화
              originalResponse = null;

              originalRequest.headers.set(
                "Authorization",
                `Bearer ${newAccessToken}`
              );
              originalRequest.headers.set("x-retry", "true");
              return ky(originalRequest);
            } catch (refreshError) {
              let errorMessage = DEFAULT_ERROR_MESSAGE;
              if (originalResponse) {
                try {
                  const errorResponse = await originalResponse.json();
                  errorMessage = errorResponse?.detail || DEFAULT_ERROR_MESSAGE;
                } catch (err) {
                  errorMessage = DEFAULT_ERROR_MESSAGE;
                }
              }
              alert(errorMessage);

              // 원본 응답 초기화
              originalResponse = null;

              processQueue(refreshError as Error, null);

              // Logout and clear all stores
              useTokenStore.getState().logout();
              useUserStore.getState().logout();
              window.location.href = AUTH_LOGIN_PATH;
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }
        }

        return response;
      },
    ],
  },
  retry: {
    limit: 0,
  },
});

export default API;
