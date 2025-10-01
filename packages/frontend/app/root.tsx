import {
  isRouteErrorResponse,
  Links,
  Meta,
  Navigate,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import {
  AlertCircle,
  ChevronDown,
  Home,
  RefreshCcw,
  XCircle,
} from "lucide-react";

import type { Route } from "./+types/root";
import "./app.css";
import { QueryProvider } from "./providers/query-provider";
import { ThemeProvider } from "./components/theme-provider";
import useUserStore from "./stores/userStore";
import { NOT_AUTH_PATH } from "./constants/consts";
import "./lang/i18n";
import { Toaster } from "./components/ui/sonner";
import { SidebarProvider } from "./components/ui/sidebar";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user && !NOT_AUTH_PATH.includes(location.pathname)) {
    // 원래 경로를 state에 저장하여 로그인 후 리다이렉트
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  if (user && NOT_AUTH_PATH.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }
  return (
    <QueryProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Outlet />
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let icon = <AlertCircle className="h-12 w-12 text-destructive" />;
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      icon = <XCircle className="h-12 w-12 text-destructive" />;
      message = "404 - Page Not Found";
      details = "The requested page could not be found.";
    } else {
      message = `Error ${error.status}`;
      details = error.statusText || details;
    }
  } else if (process.env.NODE_ENV === "development" && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ maxWidth: "42rem", width: "100%", gap: "2rem" }}>
        <div style={{ textAlign: "center", gap: "1.5rem" }}>
          {/* Icon and Message */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {icon}
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: "bold",
                lineHeight: "1.25",
              }}
            >
              {message}
            </h1>
          </div>

          {/* Error Details */}
          <p
            style={{
              color: "#6b7280", // Tailwind muted-foreground color
              fontSize: "1.125rem",
            }}
          >
            {details}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              justifyContent: "center",
              paddingTop: "1rem",
            }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                color: "#1f2937",
                background: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCcw style={{ height: "1rem", width: "1rem" }} />
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "0.375rem",
                color: "#ffffff",
                backgroundColor: "#2563eb", // Tailwind blue-600 equivalent
                cursor: "pointer",
              }}
            >
              <Home style={{ height: "1rem", width: "1rem" }} />
              Return Home
            </button>
          </div>
        </div>

        {/* Stack Trace (Development Only) */}
        {stack && (
          <div
            style={{
              borderRadius: "0.375rem",
              border: "1px solid #e5e7eb",
              backgroundColor: "rgba(107, 114, 128, 0.1)", // Tailwind muted/40 equivalent
            }}
          >
            <button
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.875rem",
                color: "#374151",
                cursor: "pointer",
                background: "none",
              }}
            >
              <span style={{ fontFamily: "monospace" }}>Stack Trace</span>
              <ChevronDown />
            </button>
            <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <pre
                style={{
                  overflowX: "auto",
                  fontSize: "0.875rem",
                  color: "#ff4d4f",
                }}
              >
                <code>{stack}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Support Information */}
        <div
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          <p>If this problem persists, please contact our support team.</p>
        </div>
      </div>
    </main>
  );
}
