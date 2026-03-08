import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/store/useAuth";

export default function RequireAuth({ children }) {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
