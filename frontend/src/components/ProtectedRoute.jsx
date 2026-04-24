import { Navigate, Outlet, useLocation } from "react-router-dom";
export default function ProtectedRoute() {
  
  // Gets the current route (useful for redirecting back after login)
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  // If there is no token, user is NOT logged in
  if (!token) {
    return (
      <Navigate
        to="/login"              // Redirect user to login page
        replace                  // Replace current history entry (prevents back button returning to protected page)
        state={{ from: location }} // Store original page so user can be redirected back after login
      />
    );
  }

  // If token exists, allow access to the protected route
  // Outlet renders the nested child route (e.g., Dashboard, Profile, etc.)
  return <Outlet />;
}