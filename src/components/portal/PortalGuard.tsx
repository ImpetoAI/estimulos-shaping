import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PORTAL_ROLES = ["atendente_terapeutica", "coordenador", "admin"];

export default function PortalGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (!PORTAL_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 px-4">
        <div className="bg-white rounded-xl p-6 shadow-md text-center max-w-sm w-full">
          <div className="text-destructive font-bold text-lg mb-2">Acesso nao autorizado</div>
          <p className="text-muted-foreground text-sm">
            Este portal e exclusivo para Coordenadores e Atendentes Terapeuticas.
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
