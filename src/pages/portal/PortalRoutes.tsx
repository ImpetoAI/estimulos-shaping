import { Route } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import PortalGuard from "@/components/portal/PortalGuard";
import PortalLoginPage from "./PortalLoginPage";
import PortalIndexPage from "./PortalIndexPage";
import PortalPatientsPage from "./PortalPatientsPage";
import PortalPatientDetailPage from "./PortalPatientDetailPage";
import PortalEvaluationFormPage from "./PortalEvaluationFormPage";
import PortalAcademicProfilePage from "./PortalAcademicProfilePage";

export const PortalRoutes = (
  <>
    <Route path="/portal/login" element={<PortalLoginPage />} />
    <Route
      element={
        <PortalGuard>
          <PortalLayout />
        </PortalGuard>
      }
    >
      <Route path="/portal" element={<PortalIndexPage />} />
      <Route path="/portal/pacientes" element={<PortalPatientsPage />} />
      <Route path="/portal/pacientes/:id" element={<PortalPatientDetailPage />} />
      <Route path="/portal/pacientes/:id/registro" element={<PortalEvaluationFormPage />} />
      <Route path="/portal/pacientes/:id/perfil" element={<PortalAcademicProfilePage />} />
    </Route>
  </>
);
