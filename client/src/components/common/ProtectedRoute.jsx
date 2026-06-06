import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * Wraps a route and redirects to /login if the user is not authenticated.
 */
export default function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}