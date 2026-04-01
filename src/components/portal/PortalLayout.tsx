import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-estimulos.png";

export default function PortalLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/portal/login");
  };

  const isHome = location.pathname === "/portal" || location.pathname === "/portal/pacientes";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Estimulos" className="h-9 w-auto" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-tight">Estimulos</p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/portal/pacientes")}
                className="gap-1.5 text-xs h-8 text-muted-foreground"
              >
                <Home className="w-3.5 h-3.5" /> Inicio
              </Button>
            )}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">{user.full_name}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground h-8 px-2.5 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-xs">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-6 text-center">
        <p className="text-[10px] text-muted-foreground/50">
          Sistema Estimulos · Brinquedoteca Estimulos · Palmas-TO
        </p>
      </footer>
    </div>
  );
}
