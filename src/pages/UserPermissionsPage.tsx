import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, User, Eye, Edit3, Settings, Lock, Check,
  BookOpen, ClipboardCheck, Library, FileText, LayoutDashboard,
  GraduationCap, Sparkles, IdCard, ChevronRight, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const roles = [
  {
    id: "admin",
    label: "Administrador",
    description: "Acesso total ao sistema, gestão de usuários e configurações",
    color: "bg-destructive/15 text-destructive",
    icon: Shield,
    count: 1,
    permissions: {
      dashboard: { view: true, edit: true },
      patients: { view: true, edit: true },
      cases: { view: true, edit: true },
      profile: { view: true, edit: true },
      curriculum: { view: true, edit: true },
      theory: { view: true, edit: true },
      assessment: { view: true, edit: true },
      activities: { view: true, edit: true },
      evaluation: { view: true, edit: true },
      materials: { view: true, edit: true },
      card: { view: true, edit: true },
      settings: { view: true, edit: true },
    },
  },
  {
    id: "coordinator",
    label: "Coordenador Pedagógico",
    description: "Gerencia casos, perfis e acompanha produção. Não edita configurações do sistema.",
    color: "bg-primary/15 text-primary",
    icon: GraduationCap,
    count: 3,
    permissions: {
      dashboard: { view: true, edit: false },
      patients: { view: true, edit: true },
      cases: { view: true, edit: true },
      profile: { view: true, edit: true },
      curriculum: { view: true, edit: true },
      theory: { view: true, edit: false },
      assessment: { view: true, edit: false },
      activities: { view: true, edit: false },
      evaluation: { view: true, edit: true },
      materials: { view: true, edit: false },
      card: { view: true, edit: true },
      settings: { view: false, edit: false },
    },
  },
  {
    id: "pedagogue",
    label: "Pedagogo",
    description: "Elabora base teórica, currículo e avaliações. Acesso a perfil e materiais.",
    color: "bg-secondary/15 text-secondary",
    icon: Sparkles,
    count: 4,
    permissions: {
      dashboard: { view: true, edit: false },
      patients: { view: true, edit: false },
      cases: { view: true, edit: false },
      profile: { view: true, edit: false },
      curriculum: { view: true, edit: true },
      theory: { view: true, edit: true },
      assessment: { view: true, edit: true },
      activities: { view: true, edit: true },
      evaluation: { view: true, edit: false },
      materials: { view: true, edit: false },
      card: { view: true, edit: false },
      settings: { view: false, edit: false },
    },
  },
  {
    id: "designer",
    label: "Designer de Material",
    description: "Produz materiais finais, acessa banco de atividades e extrato.",
    color: "bg-warning/15 text-warning",
    icon: BookOpen,
    count: 2,
    permissions: {
      dashboard: { view: true, edit: false },
      patients: { view: true, edit: false },
      cases: { view: true, edit: false },
      profile: { view: false, edit: false },
      curriculum: { view: true, edit: false },
      theory: { view: true, edit: false },
      assessment: { view: false, edit: false },
      activities: { view: true, edit: true },
      evaluation: { view: false, edit: false },
      materials: { view: true, edit: true },
      card: { view: false, edit: false },
      settings: { view: false, edit: false },
    },
  },
  {
    id: "therapist",
    label: "Atendente Terapêutica",
    description: "Aplica avaliações e registra desempenho. Visualiza perfil e cartão.",
    color: "bg-info/15 text-info",
    icon: ClipboardCheck,
    count: 6,
    permissions: {
      dashboard: { view: true, edit: false },
      patients: { view: true, edit: false },
      cases: { view: true, edit: false },
      profile: { view: true, edit: false },
      curriculum: { view: true, edit: false },
      theory: { view: false, edit: false },
      assessment: { view: true, edit: false },
      activities: { view: false, edit: false },
      evaluation: { view: true, edit: true },
      materials: { view: false, edit: false },
      card: { view: true, edit: false },
      settings: { view: false, edit: false },
    },
  },
];

const modules = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "patients", label: "Pacientes", icon: Users },
  { key: "cases", label: "Casos Pedagógicos", icon: FileText },
  { key: "profile", label: "Perfil Acadêmico", icon: User },
  { key: "curriculum", label: "Currículo", icon: GraduationCap },
  { key: "theory", label: "Base Teórica", icon: Sparkles },
  { key: "assessment", label: "Avaliação", icon: ClipboardCheck },
  { key: "activities", label: "Banco Atividades", icon: Library },
  { key: "evaluation", label: "Registro Avaliativo", icon: FileText },
  { key: "materials", label: "Extrato Materiais", icon: FileText },
  { key: "card", label: "Cartão Criança", icon: IdCard },
  { key: "settings", label: "Configurações", icon: Settings },
];

const mockUsers = [
  { name: "Dr. Carlos Oliveira", role: "admin", email: "carlos@estimulos.com", lastAccess: "12/03/2026" },
  { name: "Maria Santos", role: "coordinator", email: "maria@estimulos.com", lastAccess: "12/03/2026" },
  { name: "Ana Paula Costa", role: "coordinator", email: "ana@estimulos.com", lastAccess: "11/03/2026" },
  { name: "Fernanda Lima", role: "pedagogue", email: "fernanda@estimulos.com", lastAccess: "12/03/2026" },
  { name: "João Pedro Silva", role: "pedagogue", email: "joao@estimulos.com", lastAccess: "10/03/2026" },
  { name: "Carla Mendes", role: "designer", email: "carla@estimulos.com", lastAccess: "12/03/2026" },
  { name: "Patrícia Souza", role: "therapist", email: "patricia@estimulos.com", lastAccess: "12/03/2026" },
  { name: "Luciana Ferreira", role: "therapist", email: "luciana@estimulos.com", lastAccess: "11/03/2026" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function UserPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState("coordinator");
  const [activeView, setActiveView] = useState<"roles" | "users">("roles");

  const currentRole = roles.find(r => r.id === selectedRole)!;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={24} className="text-primary" /> Permissões e Usuários
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gerencie perfis de acesso e atribuições do sistema
          </p>
        </div>
        <Button className="gap-2"><Plus size={16} /> Novo Usuário</Button>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {[
          { id: "roles" as const, label: "Perfis de Acesso", icon: Shield },
          { id: "users" as const, label: "Usuários", icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === tab.id ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeView === "roles" ? (
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Role list */}
          <div className="space-y-2">
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRole === role.id ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${role.color}`}>
                    <role.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-card-foreground">{role.label}</p>
                    <p className="text-[10px] text-muted-foreground">{role.count} usuário(s)</p>
                  </div>
                  {selectedRole === role.id && <ChevronRight size={14} className="text-primary" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Permission matrix */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentRole.color}`}>
                  <currentRole.icon size={18} />
                </div>
                <div>
                  <CardTitle className="text-base">{currentRole.label}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentRole.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">Módulo</th>
                      <th className="pb-3 font-medium text-center">Visualizar</th>
                      <th className="pb-3 font-medium text-center">Editar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(mod => {
                      const perms = currentRole.permissions[mod.key as keyof typeof currentRole.permissions];
                      return (
                        <tr key={mod.key} className="border-b border-border/40">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <mod.icon size={14} className="text-muted-foreground" />
                              <span className="font-medium text-card-foreground">{mod.label}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center">
                              <Switch checked={perms.view} disabled className="scale-75" />
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center">
                              <Switch checked={perms.edit} disabled className="scale-75" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Users list */
        <div className="space-y-3">
          {mockUsers.map((user, i) => {
            const role = roles.find(r => r.id === user.role)!;
            return (
              <motion.div key={user.email} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-card-foreground">{user.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>
                          {role.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Último acesso</p>
                      <p className="text-xs font-medium text-card-foreground">{user.lastAccess}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Edit3 size={12} /> Editar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
