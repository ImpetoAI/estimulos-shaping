import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/supabase";

interface PatientRow {
  id: string;
  full_name: string;
  current_grade: string;
  school_name: string | null;
  diagnosis: string | null;
  photo_url: string | null;
  schools: { name: string } | null;
  current_bimester?: number;
}

export default function PortalPatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadPatients();
  }, [user]);

  const isCoord = user?.role === "coordenador" || user?.role === "admin";
  const isAT = user?.role === "atendente_terapeutica";

  async function loadPatients() {
    setLoading(true);

    let studentIds: string[] = [];

    if (isCoord) {
      // Coordenador: ve alunos onde e coordenador OU todos (admin)
      if (user?.role === "admin") {
        const { data: allStudents } = await db.from("students").select("id").eq("status", "active");
        studentIds = (allStudents ?? []).map((s: any) => s.id);
      } else {
        const { data: coordStudents } = await db.from("students").select("id").eq("coordinator_id", user!.id).eq("status", "active");
        studentIds = (coordStudents ?? []).map((s: any) => s.id);
      }
    } else {
      // AT: ve alunos atribuidos via student_assignments
      const { data: assignments } = await db
        .from("student_assignments")
        .select("student_id")
        .eq("profile_id", user!.id);
      studentIds = (assignments ?? []).map((a: any) => a.student_id);
    }

    if (studentIds.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }

    const { data: students } = await db
      .from("students")
      .select("id, full_name, current_grade, school_name, diagnosis, photo_url, schools(name)")
      .in("id", studentIds)
      .eq("status", "active")
      .order("full_name");

    if (!students) {
      setPatients([]);
      setLoading(false);
      return;
    }

    // Buscar bimestre atual de cada aluno
    const currentYear = new Date().getFullYear();
    const { data: cases } = await db
      .from("cases")
      .select("student_id, current_bimester")
      .in("student_id", studentIds)
      .eq("academic_year", currentYear)
      .eq("status", "active");

    const bimesterMap = new Map<string, number>();
    (cases ?? []).forEach((c: any) => bimesterMap.set(c.student_id, c.current_bimester));

    const result = (students as unknown as PatientRow[]).map((s) => ({
      ...s,
      current_bimester: bimesterMap.get(s.id) ?? 1,
    }));

    setPatients(result);
    setLoading(false);
  }

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const BIMESTER_LABEL: Record<number, string> = {
    1: "1o Bim", 2: "2o Bim", 3: "3o Bim", 4: "4o Bim",
  };

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{isCoord ? "Meus Alunos" : "Meus Pacientes"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ola, {user?.full_name?.split(" ")[0]}. Voce tem <strong className="text-foreground">{patients.length}</strong> aluno{patients.length !== 1 ? "s" : ""}.
          {isCoord && <span className="ml-1 text-primary font-medium">(Coordenador)</span>}
          {isAT && <span className="ml-1 text-primary font-medium">(AT)</span>}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, escola ou diagnostico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-white border-border/60 shadow-sm rounded-xl text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhum paciente encontrado.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((patient) => {
            const schoolName = patient.schools?.name ?? patient.school_name ?? "—";
            const initials = patient.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <button
                key={patient.id}
                onClick={() => navigate(`/portal/pacientes/${patient.id}`)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm border border-border/40 text-left hover:shadow-lg hover:border-primary/30 transition-all active:scale-[0.98] group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    {patient.photo_url ? (
                      <img src={patient.photo_url} alt={patient.full_name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">{initials}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{patient.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{schoolName}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-[10px] font-semibold">{patient.current_grade}</Badge>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-semibold">
                        {BIMESTER_LABEL[patient.current_bimester ?? 1]}
                      </Badge>
                      {patient.diagnosis && (
                        <Badge className="text-[10px] bg-rose-50 text-rose-600 border-0 font-medium">{patient.diagnosis}</Badge>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
