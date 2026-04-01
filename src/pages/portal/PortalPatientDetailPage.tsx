import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, ClipboardList, User, Calendar, Clock,
  BookOpen, Package, CheckCircle2, Circle, GraduationCap, ChevronDown, ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface StudentData {
  id: string;
  full_name: string;
  current_grade: string;
  school_name: string | null;
  diagnosis: string | null;
  therapies: string[];
  schools: { name: string } | null;
}

interface CaseData {
  id: string;
  academic_year: number;
  grade: string;
  current_bimester: number;
  status: string;
}

interface BimesterData {
  id: string;
  bimester: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  profile_status: string | null;
  curriculum_status: string | null;
  assessment_status: string | null;
}

interface ProfileRow {
  id: string;
  bimester_id: string;
  adaptation_level: string | null;
}

interface RegistryRow {
  id: string;
  discipline: string;
  knowledge_area: string;
  evaluation_date: string;
  duration_minutes: number | null;
  contents: string | null;
  completed_assessment: boolean;
  description: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function PortalPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCoord = user?.role === "coordenador" || user?.role === "admin";
  const isAT = user?.role === "atendente_terapeutica";

  const [student, setStudent] = useState<StudentData | null>(null);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeCase, setActiveCase] = useState<CaseData | null>(null);
  const [bimesters, setBimesters] = useState<BimesterData[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [registries, setRegistries] = useState<RegistryRow[]>([]);
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  useEffect(() => {
    if (!selectedYear || cases.length === 0) return;
    const c = cases.find((x) => x.academic_year === selectedYear);
    setActiveCase(c ?? null);
    if (c) loadCaseData(c.id);
  }, [selectedYear, cases]);

  async function loadData(studentId: string) {
    setLoading(true);
    const { data: s } = await db
      .from("students")
      .select("id, full_name, current_grade, school_name, diagnosis, therapies, schools(name)")
      .eq("id", studentId)
      .single();
    if (s) setStudent(s as unknown as StudentData);

    const { data: c } = await db
      .from("cases")
      .select("id, academic_year, grade, current_bimester, status")
      .eq("student_id", studentId)
      .order("academic_year", { ascending: false });
    if (c && c.length > 0) {
      setCases(c as CaseData[]);
      setSelectedYear(c[0].academic_year);
    }
    setLoading(false);
  }

  async function loadCaseData(caseId: string) {
    const { data: bim } = await db
      .from("case_bimesters")
      .select("id, bimester, status, start_date, end_date, profile_status, curriculum_status, assessment_status")
      .eq("case_id", caseId)
      .order("bimester");
    const bimList = (bim as BimesterData[]) ?? [];
    setBimesters(bimList);

    const bimIds = bimList.map((b) => b.id);
    if (bimIds.length > 0) {
      const { data: profs } = await db
        .from("academic_profiles")
        .select("id, bimester_id, adaptation_level")
        .in("bimester_id", bimIds);
      setProfiles((profs as ProfileRow[]) ?? []);
    } else {
      setProfiles([]);
    }

    const { data: regs } = await db
      .from("evaluation_registries")
      .select("id, discipline, knowledge_area, evaluation_date, duration_minutes, contents, completed_assessment, description")
      .eq("case_id", caseId)
      .order("evaluation_date", { ascending: false });
    setRegistries((regs as RegistryRow[]) ?? []);
  }

  function toggleYear(year: number) {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Paciente nao encontrado.</p>
        <Button variant="link" onClick={() => navigate("/portal/pacientes")}>Voltar</Button>
      </div>
    );
  }

  const schoolName = student.schools?.name ?? student.school_name ?? "—";
  const currentBim = activeCase
    ? bimesters.find((b) => b.bimester === activeCase.current_bimester)
    : null;
  const currentBimProfile = currentBim
    ? profiles.find((p) => p.bimester_id === currentBim.id)
    : null;
  const isProfilePending = !!currentBim && !currentBimProfile;

  const previousCases = cases.filter((c) => c.academic_year !== selectedYear);

  return (
    <div>
      <button onClick={() => navigate("/portal/pacientes")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Meus Pacientes
      </button>

      {/* Patient card */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg leading-tight">{student.full_name}</h2>
            <p className="text-sm text-muted-foreground">{schoolName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">{student.current_grade}</Badge>
          {student.diagnosis && <Badge variant="secondary" className="text-xs">{student.diagnosis}</Badge>}
        </div>
      </div>

      {/* Year selector + bimester grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Ano Letivo</h3>
          {cases.length > 1 && (
            <Select value={selectedYear?.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.academic_year} value={c.academic_year.toString()}>
                    {c.academic_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {activeCase ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="text-sm bg-primary/10 text-primary border-primary/20">
                {activeCase.academic_year} — {activeCase.grade}
              </Badge>
            </div>

            {/* 4-bimester grid */}
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((b) => {
                const bim = bimesters.find((x) => x.bimester === b);
                const isCurrent = b === activeCase.current_bimester;
                const isClosed = bim?.status === "closed";
                const bimProfile = bim ? profiles.find((p) => p.bimester_id === bim.id) : null;
                const profileDone = !!bimProfile;
                const registryDone =
                  bim?.assessment_status === "completed" || bim?.assessment_status === "done";

                return (
                  <div
                    key={b}
                    className={`rounded-xl border p-3 flex flex-col gap-2 ${
                      isCurrent
                        ? "border-primary bg-primary/5"
                        : isClosed
                        ? "border-border/40 bg-muted/30"
                        : "border-border/40"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-sm ${isCurrent ? "text-primary" : ""}`}>
                        B{b}
                      </span>
                      {isCurrent && (
                        <Badge className="text-[10px] py-0 px-1.5 bg-primary text-primary-foreground">
                          Atual
                        </Badge>
                      )}
                      {isClosed && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          Concluido
                        </Badge>
                      )}
                      {!isCurrent && !isClosed && bim && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          Aberto
                        </Badge>
                      )}
                      {!bim && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                          —
                        </Badge>
                      )}
                    </div>

                    {/* Dates */}
                    {bim?.start_date && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(bim.start_date)} — {formatDate(bim.end_date)}
                      </p>
                    )}

                    {/* Checklist */}
                    {bim && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          {profileDone ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                          )}
                          <span className={profileDone ? "text-foreground" : "text-muted-foreground"}>
                            Perfil
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          {registryDone ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                          )}
                          <span className={registryDone ? "text-foreground" : "text-muted-foreground"}>
                            Registro
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Closed summary */}
                    {isClosed && bimProfile?.adaptation_level && (
                      <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                        Nivel: {bimProfile.adaptation_level}
                      </p>
                    )}

                    {/* CTA for current open bimester with pending registry */}
                    {isCurrent && !registryDone && (
                      <Button
                        size="sm"
                        className="h-7 text-xs mt-1"
                        onClick={() => navigate(`/portal/pacientes/${id}/registro`)}
                      >
                        <ClipboardList className="w-3 h-3 mr-1" /> Enviar Registro
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum caso ativo.</p>
        )}
      </div>

      {/* Action buttons — conditional by role */}
      <div className="flex flex-col gap-3 mb-6">
        {isCoord && (
          <Button
            className="w-full"
            onClick={() => navigate(`/portal/pacientes/${id}/perfil`)}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Preencher / Editar Perfil Academico
          </Button>
        )}
        {isAT && (
          <Button
            className="w-full"
            onClick={() => navigate(`/portal/pacientes/${id}/registro`)}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Registro Avaliativo
          </Button>
        )}
      </div>

      {/* Provas disponiveis — visivel pra AT */}
      {isAT && activeCase && (
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-5 mb-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> Provas Disponiveis — B{activeCase.current_bimester}
          </h3>
          <ProvasDisponiveis caseId={activeCase.id} bimester={activeCase.current_bimester} />
        </div>
      )}

      {/* Previous years */}
      {previousCases.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" /> Anos Anteriores
          </h3>
          <div className="space-y-2">
            {previousCases.map((pc) => {
              const isCollapsed = collapsedYears.has(pc.academic_year);
              return (
                <div key={pc.academic_year} className="bg-white rounded-xl border border-border/40 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
                    onClick={() => toggleYear(pc.academic_year)}
                  >
                    <span>{pc.academic_year} — {pc.grade}</span>
                    {isCollapsed
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {!isCollapsed && (
                    <div className="px-4 pb-3 border-t border-border/40">
                      <PreviousYearSummary caseId={pc.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Registries history — only for AT */}
      {isAT && <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" /> Historico de Registros
        </h3>

        {registries.length === 0 ? (
          <div className="bg-white rounded-xl border border-border/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhum registro avaliativo ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registries.map((reg) => (
              <div key={reg.id} className="bg-white rounded-xl border border-border/40 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm">{reg.knowledge_area}</span>
                  <Badge variant={reg.completed_assessment ? "default" : "secondary"} className="text-xs shrink-0">
                    {reg.completed_assessment ? "Concluiu" : "Nao concluiu"}
                  </Badge>
                </div>
                {reg.contents && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{reg.contents}</p>}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(reg.evaluation_date)}
                  </span>
                  {reg.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {reg.duration_minutes} min
                    </span>
                  )}
                </div>
                {reg.description && (
                  <p className="mt-2 text-xs text-muted-foreground border-t border-border/40 pt-2 line-clamp-2">
                    {reg.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}

function ProvasDisponiveis({ caseId, bimester }: { caseId: string; bimester: number }) {
  const [exams, setExams] = useState<{ id: string; discipline: string; scenario: string; exam_type: string; adapted_exam_url: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.from("adapted_exams")
      .select("id, discipline, scenario, exam_type, adapted_exam_url")
      .eq("case_id", caseId)
      .eq("bimester", bimester)
      .then(({ data }) => { setExams((data ?? []) as any); setLoading(false); });
  }, [caseId, bimester]);

  if (loading) return <div className="text-xs text-muted-foreground">Carregando...</div>;

  if (exams.length === 0) {
    return (
      <div className="text-center py-6">
        <Circle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma prova disponivel neste bimestre</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">As provas aparecem aqui quando o designer finalizar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exams.map((exam) => (
        <div key={exam.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              exam.adapted_exam_url ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
            }`}>
              {exam.exam_type === "v1" ? "V1" : "V2"}
            </div>
            <div>
              <p className="text-sm font-semibold">{exam.discipline}</p>
              <p className="text-[10px] text-muted-foreground">
                {exam.scenario === "school_adaptation" ? "Adequacao escola" : "Gerada por IA"}
              </p>
            </div>
          </div>
          {exam.adapted_exam_url ? (
            <a
              href={exam.adapted_exam_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Baixar PDF
            </a>
          ) : (
            <span className="text-[10px] text-warning font-medium px-2 py-0.5 rounded-full bg-warning/10">Aguardando design</span>
          )}
        </div>
      ))}
    </div>
  );
}

function PreviousYearSummary({ caseId }: { caseId: string }) {
  const [bimesters, setBimesters] = useState<{ bimester: number; status: string }[]>([]);

  useEffect(() => {
    db.from("case_bimesters")
      .select("bimester, status")
      .eq("case_id", caseId)
      .order("bimester")
      .then(({ data }) => { if (data) setBimesters(data); });
  }, [caseId]);

  return (
    <div className="pt-3 flex gap-2 flex-wrap">
      {[1, 2, 3, 4].map((b) => {
        const bim = bimesters.find((x) => x.bimester === b);
        return (
          <div
            key={b}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
              bim?.status === "closed"
                ? "bg-muted text-muted-foreground"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            B{b}
            {bim?.status === "closed" && <CheckCircle2 size={10} />}
          </div>
        );
      })}
    </div>
  );
}
