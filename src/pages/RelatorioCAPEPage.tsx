import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { FileText, Download, Users, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { format, startOfMonth, subDays, parseISO } from "date-fns";

// ---- Types ----

interface ProductionOrder {
  id: string;
  student_id: string | null;
  material_type: string;
  classification: string;
  status: string;
  requested_at: string;
  requested_by: string | null;
  production_steps: { responsible_id: string | null; started_at: string | null; completed_at: string | null }[];
  students: { full_name: string } | null;
}

interface Profile { id: string; full_name: string; }

const MATERIAL_LABELS: Record<string, string> = {
  adaptacao_curricular: "Adap. Curricular",
  apostila_complementar: "Apostila",
  adaptacao_provas: "Adap. Provas",
  historias_sociais: "H. Sociais",
  rotina: "Rotina",
  calendario: "Calendário",
  passo_a_passo: "Passo a Passo",
  quadro_recompensa: "Quadro",
  cartoes_instrucao: "Cartões",
  album_figurinhas: "Álbum",
  outros: "Outros",
};

function inRange(dateStr: string, from: Date, to: Date): boolean {
  const d = parseISO(dateStr);
  return d >= from && d <= to;
}

function getDefaultDates(): { from: string; to: string } {
  return {
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  };
}

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2"><Icon size={18} className={color} /></div>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function RelatorioCAPEPage() {
  const defaults = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [filterProfile, setFilterProfile] = useState("all");

  const { data: orders = [] } = useQuery<ProductionOrder[]>({
    queryKey: ["relatorio_cape_orders"],
    queryFn: async () => {
      const { data, error } = await db
        .from("production_orders")
        .select(`
          id, student_id, material_type, classification, status, requested_at, requested_by,
          students(full_name),
          production_steps(responsible_id, started_at, completed_at)
        `)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductionOrder[];
    },
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles_list"],
    queryFn: async () => {
      const { data, error } = await db.from("profiles").select("id, full_name").eq("active", true).order("full_name");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const from = new Date(dateFrom);
  const to = new Date(dateTo + "T23:59:59");

  const filtered = useMemo(() => {
    let result = orders.filter((o) => inRange(o.requested_at, from, to));
    if (filterProfile !== "all") {
      result = result.filter((o) =>
        o.requested_by === filterProfile ||
        o.production_steps.some((s) => s.responsible_id === filterProfile)
      );
    }
    return result;
  }, [orders, from, to, filterProfile]);

  // KPIs
  const pacientesAtendidos = new Set(filtered.filter((o) => o.student_id).map((o) => o.student_id)).size;
  const abertas = filtered.filter((o) => o.status === "solicitada").length;
  const concluidas = filtered.filter((o) => o.status === "concluida").length;
  const andamento = filtered.filter((o) =>
    ["producao_pedagogica", "impressao", "finalizacao"].includes(o.status)
  ).length;

  // Production by type
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of filtered) {
      const label = MATERIAL_LABELS[o.material_type] ?? o.material_type;
      map[label] = (map[label] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Volume by professional
  const byProfissional = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of filtered) {
      for (const step of o.production_steps) {
        if (!step.responsible_id) continue;
        const name = profiles.find((p) => p.id === step.responsible_id)?.full_name ?? "—";
        map[name] = (map[name] || 0) + 1;
      }
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered, profiles]);

  // Avg production time
  const avgTime = useMemo(() => {
    const diffs: number[] = [];
    for (const o of filtered.filter((o) => o.status === "concluida")) {
      const lastStep = o.production_steps
        .filter((s) => s.completed_at)
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];
      if (lastStep?.completed_at) {
        const diff = (new Date(lastStep.completed_at).getTime() - new Date(o.requested_at).getTime()) / 86400000;
        if (diff >= 0) diffs.push(diff);
      }
    }
    if (diffs.length === 0) return "—";
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return avg < 1 ? `${Math.round(avg * 24)}h` : `${avg.toFixed(1)} dias`;
  }, [filtered]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório CAPE</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Indicadores operacionais de produção</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Exportação em breve")}>
            <Download size={14} className="mr-1.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Exportação em breve")}>
            <Download size={14} className="mr-1.5" /> Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Profissional</Label>
              <Select value={filterProfile} onValueChange={setFilterProfile}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pacientes atendidos" value={pacientesAtendidos} icon={Users} color="text-primary" />
        <KpiCard label="Solicitações abertas" value={abertas} icon={FileText} color="text-warning" />
        <KpiCard label="Em andamento" value={andamento} icon={PlayCircle} color="text-secondary" />
        <KpiCard label="Concluídas" value={concluidas} icon={CheckCircle2} color="text-success" />
      </div>

      {/* Produtividade */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Produção por Tipo de Material</CardTitle>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados no período</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byType} layout="vertical" margin={{ left: 20, right: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="value" name="Qtd" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By professional */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Volume por Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            {byProfissional.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados no período</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byProfissional} layout="vertical" margin={{ left: 20, right: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="value" name="Etapas" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tempo médio */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Clock size={20} className="text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Tempo médio de produção (concluídos)</p>
            <p className="text-xl font-bold text-card-foreground">{avgTime}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
