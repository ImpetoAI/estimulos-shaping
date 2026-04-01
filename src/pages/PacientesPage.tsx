import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Search, User, ChevronRight, SlidersHorizontal, UserX,
  AlertTriangle, CheckCircle2, Circle,
} from "lucide-react";
import { db } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface StudentRow {
  id: string;
  full_name: string;
  birth_date: string;
  school_name: string | null;
  current_grade: string;
  diagnosis: string | null;
  status: string;
  coordinator_id: string | null;
}

interface CaseRow {
  student_id: string;
  current_bimester: number;
  academic_year: number;
  status: string;
}

interface ProfileRow {
  case_id: string;
  bimester: number;
  completed: boolean;
}

interface AssignmentRow {
  student_id: string;
  profile_id: string;
}

interface ProfileOption {
  id: string;
  full_name: string;
  role: string;
}

const SERIES = [
  "Maternal I", "Maternal II", "Pre I", "Pre II",
  "1o ano", "2o ano", "3o ano", "4o ano", "5o ano",
  "6o ano", "7o ano", "8o ano", "9o ano",
];

const ETAPA_LABELS: Record<string, { label: string; color: string }> = {
  perfil_pendente: { label: "Perfil pendente", color: "bg-warning/15 text-warning" },
  perfil_ok: { label: "Perfil OK", color: "bg-success/15 text-success" },
  curriculo_pendente: { label: "Curriculo pendente", color: "bg-warning/15 text-warning" },
  em_andamento: { label: "Em andamento", color: "bg-primary/15 text-primary" },
  bimestre_fechado: { label: "Bimestre fechado", color: "bg-muted text-muted-foreground" },
};

function calcAge(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PacientesPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<StudentRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterSerie, setFilterSerie] = useState("todas");
  const [filterAT, setFilterAT] = useState("todos");
  const [filterCoord, setFilterCoord] = useState("todos");
  const [filterBimestre, setFilterBimestre] = useState("todos");
  const [showFilters, setShowFilters] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: s }, { data: c }, { data: p }, { data: a }, { data: staff }] = await Promise.all([
      db.from("students").select("id, full_name, birth_date, school_name, current_grade, diagnosis, status, coordinator_id").order("full_name"),
      db.from("cases").select("student_id, current_bimester, academic_year, status").eq("academic_year", currentYear),
      db.from("academic_profiles").select("case_id, bimester, completed"),
      db.from("student_assignments").select("student_id, profile_id"),
      db.from("profiles").select("id, full_name, role").in("role", ["admin", "coordenador", "atendente_terapeutica"]).eq("active", true).order("full_name"),
    ]);
    setPatients((s ?? []) as StudentRow[]);
    setCases((c ?? []) as CaseRow[]);
    setProfiles((p ?? []) as ProfileRow[]);
    setAssignments((a ?? []) as AssignmentRow[]);
    setStaffProfiles((staff ?? []) as ProfileOption[]);
    setLoading(false);
  }

  async function handleInativar(id: string) {
    const { error } = await db.from("students").update({ status: "inactive" }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Paciente inativado" });
      fetchAll();
    }
  }

  // Derived data helpers
  const getCaseForStudent = (studentId: string) => cases.find((c) => c.student_id === studentId && c.status === "active");
  const getATForStudent = (studentId: string) => {
    const assignment = assignments.find((a) => a.student_id === studentId);
    if (!assignment) return null;
    return staffProfiles.find((p) => p.id === assignment.profile_id);
  };
  const getCoordName = (coordId: string | null) => {
    if (!coordId) return null;
    return staffProfiles.find((p) => p.id === coordId);
  };

  const getEtapa = (studentId: string): { label: string; color: string } => {
    const caso = getCaseForStudent(studentId);
    if (!caso) return { label: "Sem caso", color: "bg-muted text-muted-foreground" };
    const caseProfiles = profiles.filter((p) => cases.some((c) => c.student_id === studentId && c.status === "active"));
    const hasCompletedProfile = caseProfiles.some((p) => p.completed);
    if (!hasCompletedProfile) return ETAPA_LABELS.perfil_pendente;
    return ETAPA_LABELS.em_andamento;
  };

  // Filters
  const ats = staffProfiles.filter((p) => p.role === "atendente_terapeutica");
  const coords = staffProfiles.filter((p) => p.role === "coordenador" || p.role === "admin");

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.school_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.diagnosis ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || p.status === (filterStatus === "ativo" ? "active" : "inactive");
    const matchSerie = filterSerie === "todas" || p.current_grade === filterSerie;
    const matchAT = filterAT === "todos" || assignments.some((a) => a.student_id === p.id && a.profile_id === filterAT);
    const matchCoord = filterCoord === "todos" || p.coordinator_id === filterCoord;
    const caso = getCaseForStudent(p.id);
    const matchBim = filterBimestre === "todos" || (caso && caso.current_bimester === parseInt(filterBimestre));
    return matchSearch && matchStatus && matchSerie && matchAT && matchCoord && matchBim;
  });

  const activeCount = patients.filter((p) => p.status === "active").length;
  const hasActiveFilters = filterStatus !== "todos" || filterSerie !== "todas" || filterAT !== "todos" || filterCoord !== "todos" || filterBimestre !== "todos";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {activeCount} ativos · {patients.length} total · Ano {currentYear}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/pacientes/criar"><Plus size={16} /> Novo Paciente</Link>
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar paciente, escola, diagnostico..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={14} /> Filtros
          {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block" />}
        </Button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSerie} onValueChange={setFilterSerie}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Serie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas series</SelectItem>
              {SERIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterBimestre} onValueChange={setFilterBimestre}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Bimestre" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos bim.</SelectItem>
              <SelectItem value="1">1o Bim</SelectItem>
              <SelectItem value="2">2o Bim</SelectItem>
              <SelectItem value="3">3o Bim</SelectItem>
              <SelectItem value="4">4o Bim</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAT} onValueChange={setFilterAT}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="AT" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos ATs</SelectItem>
              {ats.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterCoord} onValueChange={setFilterCoord}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Coordenador" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos coord.</SelectItem>
              {coords.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setFilterStatus("todos"); setFilterSerie("todas"); setFilterAT("todos"); setFilterCoord("todos"); setFilterBimestre("todos"); }}>
            Limpar
          </Button>
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10" />
              <TableHead>Paciente</TableHead>
              <TableHead>Serie</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Bimestre</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>AT</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28 text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-sm">Nenhum paciente encontrado.</TableCell>
              </TableRow>
            ) : (
              filtered.map((patient, i) => {
                const caso = getCaseForStudent(patient.id);
                const at = getATForStudent(patient.id);
                const etapa = getEtapa(patient.id);

                return (
                  <motion.tr
                    key={patient.id}
                    custom={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={15} className="text-primary" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{patient.full_name}</p>
                        <p className="text-xs text-muted-foreground">{calcAge(patient.birth_date)} anos · {patient.diagnosis ?? "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{patient.current_grade}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{patient.school_name ?? "—"}</TableCell>
                    <TableCell>
                      {caso ? (
                        <Badge variant="outline" className="text-xs text-primary border-primary/30 font-semibold">
                          B{caso.current_bimester}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] border-0 font-medium ${etapa.color}`}>
                        {etapa.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {at ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-xs text-muted-foreground">{at.full_name.split(" ")[0]}</span>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">{at.full_name}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {patient.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                          <Link to={`/pacientes/${patient.id}`}>Ver <ChevronRight size={12} /></Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link to={`/pacientes/${patient.id}/editar`}>Editar</Link>
                        </Button>
                        {patient.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                                <UserX size={13} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Inativar paciente?</AlertDialogTitle>
                                <AlertDialogDescription>{patient.full_name} sera marcado como inativo.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleInativar(patient.id)}>Inativar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {filtered.length} de {patients.length} paciente(s)
      </p>
    </div>
  );
}
