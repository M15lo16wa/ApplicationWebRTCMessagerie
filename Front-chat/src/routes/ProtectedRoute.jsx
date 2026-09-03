import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export function ProtectedRoute({ children }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === "idle" || status === "loading") {
    return <div className="min-h-dvh flex items-center justify-center text-ink-soft">Chargement…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
