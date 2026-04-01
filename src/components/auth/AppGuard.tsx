import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

/**
 * Guards the main application routes.
 * - Unauthenticated → /login
 * - atendente_terapeutica → /portal (AT has a separate portal)
 * - Others → render children
 */
export default function AppGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "atendente_terapeutica") return <Navigate to="/portal" replace />;

  return <Outlet />;
}
