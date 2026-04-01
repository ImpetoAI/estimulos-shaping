import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, GraduationCap, ClipboardCheck, AlertTriangle,
  BookOpen, Library, TrendingUp,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function KpiCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();

  // Students
  const { data: students = [] } = useQuery({
    queryKey: ["dash-students"],
    queryFn: async () => {
      const { data } = await db.from("students").select("id, full_name, current_grade, status, diagnosis");
      return (data ?? []) as { id: string; full_name: string; current_grade: string; status: string; diagnosis: string | null }[];
    },
  });

  // Cases (current year)
  const { data: cases = [] } = useQuery({
    queryKey: ["dash-cases"],
    queryFn: async () => {
      const { data } = await db.from("cases").select("id, student_id, academic_year, current_bimester, status").eq("academic_year", currentYear);
      return (data ?? []) as { id: string; student_id: string; academic_year: number; current_bimester: number; status: string }[];
    },
  });

  // Academic profiles (current year)
  const { data: profiles = [] } = useQuery({
    queryKey: ["dash-profiles"],
    queryFn: async () => {
      const { data } = await db.from("academic_profiles").select("id, case_id, bimester, completed, adaptation_level");
      return (data ?? []) as { id: string; case_id: string; bimester: number; completed: boolean; adaptation_level: number | null }[];
    },
  });

  // Evaluation registries
  const { data: registries = [] } = useQuery({
    queryKey: ["dash-registries"],
    queryFn: async () => {
      const { data } = await db.from("evaluation_registries").select("id, knowledge_area, evaluation_date, completed_evaluation");
      return (data ?? []) as { id: string; knowledge_area: string; evaluation_date: string; completed_evaluation: boolean }[];
    },
  });

  // Pendencies
  const { data: pendencies = [] } = useQuery({
    queryKey: ["dash-pendencies"],
    queryFn: async () => {
      const { data } = await db.from("pendencies").select("id, status, module");
      return (data ?? []) as { id: string; status: string; module: string }[];
    },
  });

  // Activities in bank
  const { data: activities = [] } = useQuery({
    queryKey: ["dash-activities"],
    queryFn: async () => {
      const { data } = await db.from("activities").select("id", { count: "exact", head: true });
      return data;
    },
    select: () => [],
  });

  const { count: activityCount = 0 } = useQuery({
    queryKey: ["dash-activity-count"],
    queryFn: async () => {
      const { count } = await db.from("activities").select("id", { count: "exact", head: true });
      return { count: count ?? 0 };
    },
    select: (d) => d,
  });

  // Derived data
  const activeStudents = students.filter((s) => s.status === "active");
  const activeCases = cases.filter((c) => c.status === "active");
  const completedProfiles = profiles.filter((p) => p.completed);
  const pendingPendencies = pendencies.filter((p) => p.status === "pending");

  // Chart: students by grade
  const gradeMap = new Map<string, number>();
  activeStudents.forEach((s) => {
    gradeMap.set(s.current_grade, (gradeMap.get(s.current_grade) ?? 0) + 1);
  });
  const gradeData = Array.from(gradeMap.entries()).map(([grade, count]) => ({ grade, count })).sort((a, b) => a.grade.localeCompare(b.grade));

  // Chart: profiles by bimester
  const bimesterData = [1, 2, 3, 4].map((b) => ({
    bimestre: `B${b}`,
    concluidos: profiles.filter((p) => p.bimester === b && p.completed).length,
    pendentes: cases.length - profiles.filter((p) => p.bimester === b && p.completed).length,
  }));

  // Chart: adaptation levels
  const levelMap = new Map<number, number>();
  completedProfiles.forEach((p) => {
    if (p.adaptation_level) levelMap.set(p.adaptation_level, (levelMap.get(p.adaptation_level) ?? 0) + 1);
  });
  const LEVEL_LABELS: Record<number, string> = { 1: "N1 Leve", 2: "N2 Moderado", 3: "N3 Significativo", 4: "N4 Paralelo", 5: "N5 Funcional" };
  const levelData = Array.from(levelMap.entries()).map(([level, count]) => ({ name: LEVEL_LABELS[level] ?? `N${level}`, value: count }));

  // Chart: pendencies by module
  const moduleMap = new Map<string, number>();
  pendingPendencies.forEach((p) => {
    moduleMap.set(p.module, (moduleMap.get(p.module) ?? 0) + 1);
  });
  const moduleData = Array.from(moduleMap.entries()).map(([module, count]) => ({ module, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visao geral — Ano letivo {currentYear}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Alunos ativos" value={activeStudents.length} sub={`${students.length} total`} />
        <KpiCard icon={GraduationCap} label="Casos ativos" value={activeCases.length} sub={`Ano ${currentYear}`} color="text-success" />
        <KpiCard icon={ClipboardCheck} label="Perfis concluidos" value={completedProfiles.length} sub={`de ${activeCases.length} esperados`} color="text-info" />
        <KpiCard icon={AlertTriangle} label="Pendencias abertas" value={pendingPendencies.length} sub={`${pendencies.length - pendingPendencies.length} resolvidas`} color="text-warning" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Students by grade */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Users size={16} className="text-primary" /> Alunos por Serie
            </h3>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gradeData}>
                  <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Alunos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Profiles by bimester */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-primary" /> Perfis por Bimestre
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bimesterData}>
                <XAxis dataKey="bimestre" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="concluidos" fill="#10b981" radius={[4, 4, 0, 0]} name="Concluidos" stackId="a" />
                <Bar dataKey="pendentes" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Pendentes" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Adaptation levels */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Niveis de Adaptacao
            </h3>
            {levelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={levelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                    {levelData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Sem perfis concluidos</p>
            )}
          </CardContent>
        </Card>

        {/* Pendencies by module */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> Pendencias por Modulo
            </h3>
            {moduleData.length > 0 ? (
              <div className="space-y-2">
                {moduleData.map((m) => (
                  <div key={m.module} className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground capitalize">{m.module.replace(/_/g, " ")}</span>
                    <Badge variant="secondary" className="text-xs">{m.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Nenhuma pendencia</p>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Library size={16} className="text-primary" /> Resumo Rapido
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Registros avaliativos</span>
                <span className="text-sm font-bold">{registries.length}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Atividades no banco</span>
                <span className="text-sm font-bold">{activityCount.count ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Bimestre mais avancado</span>
                <span className="text-sm font-bold">B{Math.max(...activeCases.map((c) => c.current_bimester), 1)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Taxa de conclusao perfis</span>
                <span className="text-sm font-bold">
                  {activeCases.length > 0 ? Math.round((completedProfiles.length / activeCases.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
