import { Navigate } from "react-router-dom";
import useAuth from "@/store/useAuth";

export default function RequireAdmin({ children }) {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/account" replace />;
  }

  return children;
}
