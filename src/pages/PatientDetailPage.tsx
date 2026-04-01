import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, User, School, MapPin, Calendar, Shield,
  Stethoscope, Lock, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MODULOS_PEDAGOGICOS } from "@/types/patient";
import type { ModuloKey } from "@/types/patient";
import PerfilAcademicoTab from "@/pages/pacientes/ciclo/PerfilAcademicoTab";
import CurriculoOriginalTab from "@/pages/pacientes/ciclo/CurriculoOriginalTab";
import CurriculoAdaptadoTab from "@/pages/pacientes/ciclo/CurriculoAdaptadoTab";
import PlanejamentoTab from "@/pages/pacientes/ciclo/PlanejamentoTab";
import ApostilaTab from "@/pages/pacientes/ciclo/ApostilaTab";
import ProvasTab from "@/pages/pacientes/ciclo/ProvasTab";
import RegistroAvaliativoTab from "@/pages/pacientes/ciclo/RegistroAvaliativoTab";
import LinhaDoTempoTab from "@/pages/pacientes/ciclo/LinhaDoTempoTab";
import EvolucaoTab from "@/pages/pacientes/ciclo/EvolucaoTab";
import ExtratoTab from "@/pages/pacientes/ciclo/ExtratoTab";
import CardTab from "@/pages/pacientes/ciclo/CardTab";
import RelatorioTab from "@/pages/pacientes/ciclo/RelatorioTab";

interface StudentData {
  id: string;
  full_name: string;
  birth_date: string;
  city: string | null;
  school_name: string | null;
  current_grade: string;
  attendance_type: string;
  diagnosis: string | null;
  plan_type: string | null;
  therapies: string[];
  pedagogical_items: Record<string, any>;
  guardian_1_name: string | null;
  guardian_1_contact: string | null;
  guardian_2_name: string | null;
  guardian_2_contact: string | null;
  status: string;
  schools?: { name: string } | null;
}

interface CaseData {
  id: string;
  academic_year: number;
  grade: string;
  current_bimester: number;
  uniform_adaptation: boolean;
  status: string;
}

interface CaseBimester {
  id: string;
  bimester: number;
  status: "open" | "closed";
  start_date: string | null;
  end_date: string | null;
  profile_status: string | null;
  curriculum_status: string | null;
  assessment_status: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const ATTENDANCE_LABELS: Record<string, string> = {
  escolar: "Escolar",
  individual: "Individual",
  individual_escolar: "Individual + Escolar",
  particular: "Particular",
};

const PLAN_LABELS: Record<string, string> = {
  particular: "Particular",
  convenio: "Convênio",
  sus: "SUS",
};

const GRADE_PROGRESSION: Record<string, string> = {
  "1º ano": "2º ano",
  "2º ano": "3º ano",
  "3º ano": "4º ano",
  "4º ano": "5º ano",
  "5º ano": "6º ano",
  "6º ano": "7º ano",
  "7º ano": "8º ano",
  "8º ano": "9º ano",
  "9º ano": "9º ano",
};

// ─── Derive enabled modules from pedagogical_items JSONB ─────────────────────
function getEnabledModules(items: Record<string, any>): Set<ModuloKey> {
  const enabled = new Set<ModuloKey>();
  enabled.add("perfil");
  enabled.add("linha_do_tempo");
  enabled.add("evolucao");
  enabled.add("extrato");
  enabled.add("card");

  if (items.curriculum_adaptation?.enabled) {
    enabled.add("curriculo_original");
    enabled.add("curriculo_adaptado");
    enabled.add("planejamento");
    enabled.add("apostila");
  }
  if (items.exam_adaptation) enabled.add("provas");
  if (items.evaluation_registry) enabled.add("registro_avaliativo");

  return enabled;
}

// ─── Tab content dispatcher ───────────────────────────────────────────────────
function TabContent({ moduleKey, caseId, studentId, bimester }: { moduleKey: ModuloKey; caseId: string; studentId: string; bimester: number }) {
  const props = { caseId, bimester, studentId };

  switch (moduleKey) {
    case "perfil": return <PerfilAcademicoTab {...props} />;
    case "curriculo_original": return <CurriculoOriginalTab {...props} />;
    case "curriculo_adaptado": return <CurriculoAdaptadoTab {...props} />;
    case "planejamento": return <PlanejamentoTab {...props} />;
    case "apostila": return <ApostilaTab {...props} />;
    case "provas": return <ProvasTab {...props} />;
    case "registro_avaliativo": return <RegistroAvaliativoTab {...props} />;
    case "linha_do_tempo": return <LinhaDoTempoTab {...props} />;
    case "evolucao": return <EvolucaoTab {...props} />;
    case "extrato": return <ExtratoTab {...props} />;
    case "card": return <CardTab {...props} />;
    case "relatorio": return <RelatorioTab {...props} />;
    default: return null;
  }
}

// ─── Info cell ───────────────────────────────────────────────────────────────
function InfoCell({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</p>
        <p className="text-sm font-medium text-card-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [allCases, setAllCases] = useState<CaseData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeCase, setActiveCase] = useState<CaseData | null>(null);
  const [selectedBimester, setSelectedBimester] = useState<number>(1);
  const [caseBimesters, setCaseBimesters] = useState<CaseBimester[]>([]);
  const [perfilConcluido, setPerfilConcluido] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "perfil";
  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => { prev.set("tab", tab); return prev; }, { replace: true });
  };
  const [loading, setLoading] = useState(true);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closingBimester, setClosingBimester] = useState(false);
  const [promotingYear, setPromotingYear] = useState(false);

  const isCoordinator = user?.role === "admin" || user?.role === "coordenador";

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  async function loadData(studentId: string) {
    setLoading(true);

    const { data: studentData } = await db
      .from("students")
      .select("*, schools(name)")
      .eq("id", studentId)
      .single();

    if (!studentData) {
      setLoading(false);
      return;
    }
    setStudent(studentData as unknown as StudentData);

    const { data: casesData } = await db
      .from("cases")
      .select("id, academic_year, grade, current_bimester, uniform_adaptation, status")
      .eq("student_id", studentId)
      .order("academic_year", { ascending: false });

    const cases = (casesData as CaseData[]) ?? [];
    setAllCases(cases);

    if (cases.length > 0) {
      const mostRecent = cases[0];
      setSelectedYear(mostRecent.academic_year);
      await loadCaseData(mostRecent);
    }

    setLoading(false);
  }

  async function loadCaseData(caseData: CaseData) {
    setActiveCase(caseData);
    setSelectedBimester(caseData.current_bimester);

    // Check if ANY bimester has a completed profile (not just current)
    const { data: profileData } = await db
      .from("academic_profiles")
      .select("completed, bimester")
      .eq("case_id", caseData.id)
      .eq("completed", true)
      .limit(1);

    setPerfilConcluido((profileData ?? []).length > 0);

    try {
      const { data: bimestersData } = await db
        .from("case_bimesters")
        .select("id, bimester, status, start_date, end_date, profile_status, curriculum_status, assessment_status")
        .eq("case_id", caseData.id)
        .order("bimester");
      setCaseBimesters((bimestersData as CaseBimester[]) ?? []);
    } catch {
      // table not yet created, ignore
    }
  }

  async function handleYearChange(year: string) {
    const yearNum = parseInt(year, 10);
    setSelectedYear(yearNum);
    const caseForYear = allCases.find((c) => c.academic_year === yearNum);
    if (caseForYear) {
      await loadCaseData(caseForYear);
    }
  }

  async function handleCloseBimester() {
    if (!activeCase) return;
    setClosingBimester(true);

    try {
      await db
        .from("case_bimesters")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("case_id", activeCase.id)
        .eq("bimester", selectedBimester);

      const nextBimester = selectedBimester + 1;

      if (selectedBimester < 4) {
        await db.from("case_bimesters").insert({
          case_id: activeCase.id,
          bimester: nextBimester,
          status: "open",
          start_date: new Date().toISOString().split("T")[0],
        });

        await db
          .from("cases")
          .update({ current_bimester: nextBimester })
          .eq("id", activeCase.id);

        toast.success(`${selectedBimester}º Bimestre fechado. ${nextBimester}º Bimestre aberto.`);
      } else {
        await db
          .from("cases")
          .update({ current_bimester: 4 })
          .eq("id", activeCase.id);

        toast.success(`4º Bimestre fechado. Ano letivo ${activeCase.academic_year} encerrado.`);
      }

      setShowCloseDialog(false);
      await loadData(student!.id);
    } catch {
      toast.error("Erro ao fechar bimestre.");
    } finally {
      setClosingBimester(false);
    }
  }

  async function handlePromoteYear() {
    if (!activeCase || !student) return;
    setPromotingYear(true);

    try {
      const nextYear = activeCase.academic_year + 1;
      const nextGrade = GRADE_PROGRESSION[activeCase.grade] ?? activeCase.grade;

      const { data: newCase } = await db
        .from("cases")
        .insert({
          student_id: student.id,
          academic_year: nextYear,
          grade: nextGrade,
          current_bimester: 1,
          status: "active",
        })
        .select()
        .single();

      if (newCase) {
        await db.from("case_bimesters").insert({
          case_id: newCase.id,
          bimester: 1,
          status: "open",
          start_date: new Date().toISOString().split("T")[0],
        });
      }

      await db
        .from("students")
        .update({ current_grade: nextGrade })
        .eq("id", student.id);

      toast.success(`Ano letivo ${nextYear} iniciado.`);
      await loadData(student.id);
    } catch {
      toast.error("Erro ao iniciar novo ano letivo.");
    } finally {
      setPromotingYear(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">Paciente nao encontrado.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/pacientes">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const schoolName = student.schools?.name ?? student.school_name ?? "—";
  const enabledModulos = getEnabledModules(student.pedagogical_items ?? {});

  // All cycle tabs — always visible (these are the pedagogical flow, not optional services)
  const ALL_CYCLE_TABS: { key: ModuloKey; label: string }[] = [
    { key: "perfil", label: "Perfil" },
    { key: "curriculo_original", label: "Currículo Original" },
    { key: "curriculo_adaptado", label: "Currículo Adaptado" },
    { key: "planejamento", label: "Planejamento" },
    { key: "apostila", label: "Apostila" },
    { key: "provas", label: "Provas" },
    { key: "registro_avaliativo", label: "Registro Avaliativo" },
    { key: "linha_do_tempo", label: "Linha do Tempo" },
    { key: "evolucao", label: "Evolução" },
    { key: "extrato", label: "Extrato" },
    { key: "card", label: "Card" },
    { key: "relatorio", label: "Relatório" },
  ];
  const visibleTabs = ALL_CYCLE_TABS;
  // Only block content-creation tabs when no profile exists. View-only tabs are always accessible.
  const NEVER_BLOCKED: string[] = ["perfil", "curriculo_original", "linha_do_tempo", "evolucao", "extrato", "card", "registro_avaliativo", "relatorio"];
  const isBlocked = (key: ModuloKey) => !NEVER_BLOCKED.includes(key) && !perfilConcluido;

  const responsaveis = [
    student.guardian_1_name ? { nome: student.guardian_1_name, contato: student.guardian_1_contact } : null,
    student.guardian_2_name ? { nome: student.guardian_2_name, contato: student.guardian_2_contact } : null,
  ].filter(Boolean);

  // Year/read-only logic
  const isLatestYear = allCases.length > 0 && activeCase?.academic_year === allCases[0].academic_year;
  const isReadOnly = !isLatestYear || activeCase?.status !== "active";

  // Bimester data for selected bimester
  const selectedBimData = caseBimesters.find((x) => x.bimester === selectedBimester);
  const isBimesterClosed = selectedBimData?.status === "closed";
  const isB4Closed = caseBimesters.find((x) => x.bimester === 4)?.status === "closed";

  // Checklist for close dialog
  const checklistItems = [
    {
      label: "Perfil Acadêmico",
      done: selectedBimData?.profile_status === "done" || selectedBimData?.profile_status === "completed",
    },
    {
      label: "Currículo",
      done: selectedBimData?.curriculum_status === "done" || selectedBimData?.curriculum_status === "completed",
    },
    {
      label: "Avaliação",
      done: selectedBimData?.assessment_status === "done" || selectedBimData?.assessment_status === "completed" || selectedBimData?.assessment_status === "closed",
    },
  ];
  const pendingCount = checklistItems.filter((item) => !item.done).length;

  // Next year for promote
  const nextYear = activeCase ? activeCase.academic_year + 1 : null;
  // Check if nextYear already exists
  const nextYearExists = nextYear !== null && allCases.some((c) => c.academic_year === nextYear);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back + edit */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/pacientes"><ArrowLeft size={15} /> Pacientes</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to={`/pacientes/${student.id}/editar`}><Pencil size={13} /> Editar</Link>
        </Button>
      </div>

      {/* ── Block 1: Dados Cadastrais ── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{student.full_name}</h1>
              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                {student.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              {perfilConcluido ? (
                <Badge variant="outline" className="text-success border-success/40 bg-success/5 text-[10px]">Perfil concluído</Badge>
              ) : (
                <Badge variant="outline" className="text-warning border-warning/40 bg-warning/5 text-[10px]">Perfil pendente</Badge>
              )}
              {activeCase && (
                <Badge variant="outline" className="text-[10px]">
                  {activeCase.grade} · {activeCase.academic_year} · {activeCase.current_bimester}º bim
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {calcAge(student.birth_date)} anos · {student.current_grade} · {student.diagnosis ?? "Sem diagnóstico"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoCell icon={Calendar} label="Nascimento" value={formatDate(student.birth_date)} />
          <InfoCell icon={School} label="Escola" value={schoolName} />
          <InfoCell icon={MapPin} label="Cidade" value={student.city ?? undefined} />
          <InfoCell icon={Shield} label="Coordenador" value="—" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <InfoCell icon={Stethoscope} label="Tipo de Atendimento" value={ATTENDANCE_LABELS[student.attendance_type]} />
          <InfoCell icon={Stethoscope} label="Plano" value={PLAN_LABELS[student.plan_type ?? ""] ?? student.plan_type ?? "—"} />
          <div className="lg:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">Responsáveis</p>
            <div className="space-y-0.5">
              {responsaveis.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                responsaveis.map((r: any, i: number) => (
                  <p key={i} className="text-sm">
                    <span className="font-medium">{r.nome}</span>
                    {r.contato && <span className="text-muted-foreground"> · {r.contato}</span>}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {student.therapies?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">Terapias</p>
            <div className="flex flex-wrap gap-1.5">
              {student.therapies.map((t) => (
                <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Block 2: Barra do Ciclo Pedagógico ── */}
      {activeCase ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-sm">Ciclo Pedagógico</h2>
              {!perfilConcluido && (
                <p className="text-xs text-warning mt-0.5">Complete o Perfil para desbloquear os demais módulos.</p>
              )}
            </div>
            {/* Year selector */}
            {allCases.length > 1 && (
              <Select value={String(selectedYear)} onValueChange={handleYearChange}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Ano letivo" />
                </SelectTrigger>
                <SelectContent>
                  {allCases.map((c) => (
                    <SelectItem key={c.academic_year} value={String(c.academic_year)} className="text-xs">
                      Ano Letivo {c.academic_year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {allCases.length === 1 && (
              <span className="text-xs text-muted-foreground">Ano Letivo {activeCase.academic_year}</span>
            )}
          </div>

          {/* Read-only banner for past years */}
          {isReadOnly && (
            <div className="px-6 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
              <Lock size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ano letivo {activeCase.academic_year} — somente leitura</span>
            </div>
          )}

          {/* Bimester selector */}
          <div className="px-6 py-3 border-b border-border bg-muted/20 flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bimestre:</span>
            {[1, 2, 3, 4].map((b) => {
              const bimData = caseBimesters.find((x) => x.bimester === b);
              const isActive = selectedBimester === b;
              const isCurrent = b === activeCase.current_bimester;
              const pendingCount = bimData
                ? [bimData.profile_status, bimData.curriculum_status, bimData.assessment_status]
                    .filter((s) => s && s !== "done" && s !== "completed" && s !== "closed").length
                : 0;
              return (
                <button
                  key={b}
                  onClick={() => setSelectedBimester(b)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {b}º Bim
                  {/* Closed badge */}
                  {bimData?.status === "closed" && (
                    <span className={`text-[9px] font-bold px-1 rounded ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                      Fechado
                    </span>
                  )}
                  {/* Pulsing dot for ALL open bimesters (supports 2 simultaneous) */}
                  {bimData?.status === "open" && (
                    <span className="relative flex-shrink-0 w-2 h-2">
                      <span className={`absolute inset-0 rounded-full animate-ping opacity-40 ${
                        isActive ? "bg-primary-foreground" : "bg-emerald-400"
                      }`} />
                      <span className={`relative block w-2 h-2 rounded-full ${
                        isActive ? "bg-primary-foreground/70" : "bg-emerald-500"
                      }`} />
                    </span>
                  )}
                  {/* Current bimester dot (no bimData yet) */}
                  {!bimData && isCurrent && (
                    <span className="relative flex-shrink-0 w-2 h-2">
                      <span className={`absolute inset-0 rounded-full animate-ping opacity-40 ${
                        isActive ? "bg-primary-foreground" : "bg-primary"
                      }`} />
                      <span className={`relative block w-2 h-2 rounded-full ${
                        isActive ? "bg-primary-foreground/70" : "bg-primary"
                      }`} />
                    </span>
                  )}
                  {/* Pending badge */}
                  {pendingCount > 0 && (
                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold flex-shrink-0 ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-warning/20 text-warning"
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}

            <span className="text-[10px] text-muted-foreground/60 ml-1">
              Atual: {activeCase.current_bimester}º
            </span>

            {/* Close bimester button */}
            {isCoordinator && !isReadOnly && !isBimesterClosed && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 text-xs gap-1.5"
                onClick={() => setShowCloseDialog(true)}
              >
                <Lock size={11} />
                Fechar {selectedBimester}º Bimestre
              </Button>
            )}
          </div>

          {visibleTabs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Nenhum módulo pedagógico habilitado no cadastro.
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="border-b border-border overflow-x-auto">
                <TabsList className="h-auto bg-transparent rounded-none px-4 gap-0 flex-nowrap">
                  {visibleTabs.map((modulo) => {
                    const blocked = isBlocked(modulo.key);
                    const trigger = (
                      <TabsTrigger
                        key={modulo.key}
                        value={modulo.key}
                        disabled={blocked}
                        className={`rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${blocked ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        {blocked && <Lock size={10} className="mr-1.5 inline-block" />}
                        {modulo.label}
                      </TabsTrigger>
                    );

                    return blocked ? (
                      <Tooltip key={modulo.key}>
                        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Complete o Perfil primeiro</TooltipContent>
                      </Tooltip>
                    ) : trigger;
                  })}
                </TabsList>
              </div>

              {visibleTabs.map((modulo) => (
                <TabsContent key={modulo.key} value={modulo.key} className="mt-0">
                  <TabContent
                    moduleKey={modulo.key}
                    caseId={activeCase.id}
                    studentId={student.id}
                    bimester={selectedBimester}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Promote year banner */}
          {isCoordinator && !isReadOnly && isB4Closed && !nextYearExists && nextYear && (
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Ano letivo {activeCase.academic_year} encerrado.</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Iniciar {nextYear} com {GRADE_PROGRESSION[activeCase.grade] ?? activeCase.grade}?
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={handlePromoteYear}
                disabled={promotingYear}
              >
                {promotingYear ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ChevronRight size={13} />
                )}
                Iniciar Ano Letivo {nextYear}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Nenhum caso ativo para {new Date().getFullYear()}.</p>
          <p className="text-xs text-muted-foreground mt-1">Crie um caso para iniciar o ciclo pedagógico.</p>
        </div>
      )}

      {/* ── AlertDialog: Fechar Bimestre ── */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar {selectedBimester}º Bimestre?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Verifique as pendências antes de fechar:</p>
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      {item.done ? (
                        <CheckCircle2 size={16} className="text-success shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-destructive shrink-0" />
                      )}
                      <span className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                      {!item.done && (
                        <Badge variant="outline" className="text-[10px] text-warning border-warning/40 ml-auto">
                          Pendente
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                {pendingCount > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                    <AlertTriangle size={14} className="text-warning shrink-0" />
                    <p className="text-xs text-warning">
                      {pendingCount} {pendingCount === 1 ? "pendência não resolvida" : "pendências não resolvidas"}. Deseja fechar mesmo assim?
                    </p>
                  </div>
                )}
                {selectedBimester < 4 && (
                  <p className="text-xs text-muted-foreground">
                    O {selectedBimester + 1}º Bimestre será aberto automaticamente.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingBimester}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCloseBimester();
              }}
              disabled={closingBimester}
            >
              {closingBimester ? (
                <><Loader2 size={13} className="animate-spin mr-1.5" />Fechando...</>
              ) : (
                <>Fechar Bimestre</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
