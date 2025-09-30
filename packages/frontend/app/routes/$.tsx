import { Navigate, useLocation } from "react-router";

export default function CatchAllRoute() {
  const location = useLocation();

  // Log error in development mode
  if (process.env.NODE_ENV === "development") {
    console.error(
      `404 Not Found: Path "${location.pathname}" does not exist.\n` +
        `Redirecting to home page because this is a catch-all route that handles non-existent paths.`
    );
  }

  // In SPA mode, redirect to a 404 page or home page
  // You can create a dedicated 404 page component if needed
  return <Navigate to="/" replace />;
}
