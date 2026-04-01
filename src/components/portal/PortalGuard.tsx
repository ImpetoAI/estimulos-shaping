import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PortalGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--estimulos-blue-light))]">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (user.role !== "atendente_terapeutica") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--estimulos-blue-light))] px-4">
        <div className="bg-white rounded-xl p-6 shadow-md text-center max-w-sm w-full">
          <div className="text-destructive font-bold text-lg mb-2">Acesso não autorizado</div>
          <p className="text-muted-foreground text-sm">
            Este portal é exclusivo para Atendentes Terapêuticas.
          </p>
          <button
            className="mt-4 text-sm text-primary underline"
            onClick={() => window.location.replace("/portal/login")}
          >
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
