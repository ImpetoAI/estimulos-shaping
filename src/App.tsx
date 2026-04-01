import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppGuard from "@/components/auth/AppGuard";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import { PortalRoutes } from "./pages/portal/PortalRoutes";

// Main app pages
import DashboardPage from "./pages/DashboardPage";
import PacientesPage from "./pages/PacientesPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import CriarPacientePage from "./pages/pacientes/CriarPacientePage";
import EditarPacientePage from "./pages/pacientes/EditarPacientePage";
import PendenciasPage from "./pages/PendenciasPage";
import BancoCurriculosPage from "./pages/banco-curriculos";
import BancoAtividadesPage from "./pages/banco-atividades";
import UserPermissionsPage from "./pages/UserPermissionsPage";
import PortalAcademicProfilePage from "./pages/portal/PortalAcademicProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Portal AT — has its own guard (PortalGuard) */}
            {PortalRoutes}

            {/* Main app — guarded: unauthenticated → /login, AT → /portal */}
            <Route element={<AppGuard />}>
              <Route element={<AppLayout />}>
                {/* Gestão */}
                <Route path="/" element={<DashboardPage />} />
                <Route path="/pacientes" element={<PacientesPage />} />
                <Route path="/pacientes/criar" element={<CriarPacientePage />} />
                <Route path="/pacientes/:id" element={<PatientDetailPage />} />
                <Route path="/pacientes/:id/editar" element={<EditarPacientePage />} />
                <Route path="/pacientes/:id/perfil" element={<PortalAcademicProfilePage />} />
                <Route path="/pendencias" element={<PendenciasPage />} />

                {/* Base Pedagógica */}
                <Route path="/banco-curriculos" element={<BancoCurriculosPage />} />
                <Route path="/banco-atividades" element={<BancoAtividadesPage />} />

                {/* Admin */}
                <Route path="/permissoes" element={<UserPermissionsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
