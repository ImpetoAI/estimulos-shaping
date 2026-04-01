import { useState, useEffect, useCallback } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { db } from "@/lib/supabase";
import { type CicloTabProps, BIMESTER_LABELS } from "./_shared";

interface AcademicProfile {
  id: string;
  bimester: number;
  scores: Record<string, number>;
  adaptation_level: number;
  completed: boolean;
}

const SCORE_KEYS = [
  { key: "leitura", label: "Leitura" },
  { key: "escrita", label: "Escrita" },
  { key: "matematica", label: "Matemática" },
  { key: "raciocinio", label: "Raciocínio" },
  { key: "autonomia", label: "Autonomia" },
];

const BIMESTER_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

export default function EvolucaoTab({ caseId }: CicloTabProps) {
  const [profiles, setProfiles] = useState<AcademicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const { data } = await db
      .from("academic_profiles")
      .select("id, bimester, scores, adaptation_level, completed")
      .eq("case_id", caseId)
      .eq("completed", true)
      .order("bimester", { ascending: true });
    setProfiles((data as AcademicProfile[]) ?? []);
    setLoading(false);
  }, [caseId]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
        <TrendingUp size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum perfil concluído</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Complete o Perfil Acadêmico em pelo menos um bimestre para visualizar a evolução.
        </p>
      </div>
    );
  }

  // Build radar data: one entry per score key
  const radarData = SCORE_KEYS.map(({ key, label }) => {
    const entry: Record<string, string | number> = { subject: label };
    profiles.forEach((p) => {
      entry[`B${p.bimester}`] = p.scores?.[key] ?? 0;
    });
    return entry;
  });

  // Build bar data: one entry per bimester
  const barData = profiles.map((p) => ({
    bimester: BIMESTER_LABELS[p.bimester] ?? `B${p.bimester}`,
    nivel: p.adaptation_level ?? 0,
  }));

  return (
    <div className="p-6 space-y-8">
      {/* Radar: scores por bimestre */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Scores por Área — Comparativo</h3>
        <div className="bg-card rounded-xl border border-border p-4">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} tickCount={6} />
              {profiles.map((p, i) => (
                <Radar
                  key={p.id}
                  name={BIMESTER_LABELS[p.bimester] ?? `B${p.bimester}`}
                  dataKey={`B${p.bimester}`}
                  stroke={BIMESTER_COLORS[i % BIMESTER_COLORS.length]}
                  fill={BIMESTER_COLORS[i % BIMESTER_COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend />
              <RechartTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar: nível de adaptação por bimestre */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Nível de Adaptação por Bimestre</h3>
        <div className="bg-card rounded-xl border border-border p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="bimester" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <RechartTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(value: number) => {
                  const labels: Record<number, string> = { 1: "Leve", 2: "Moderado", 3: "Significativo", 4: "Paralelo", 5: "Funcional" };
                  return [`${value} — ${labels[value] ?? ""}`, "Nível"];
                }}
              />
              <Bar dataKey="nivel" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Nível" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-3 flex-wrap justify-center">
            {[1, 2, 3, 4, 5].map((n) => {
              const labels: Record<number, string> = { 1: "Leve", 2: "Moderado", 3: "Significativo", 4: "Paralelo", 5: "Funcional" };
              return (
                <span key={n} className="text-[10px] text-muted-foreground">
                  {n} = {labels[n]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score table */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Resumo de Scores</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3 font-medium text-muted-foreground">Área</th>
                {profiles.map((p) => (
                  <th key={p.id} className="text-center p-3 font-medium text-muted-foreground">
                    {BIMESTER_LABELS[p.bimester]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SCORE_KEYS.map(({ key, label }) => (
                <tr key={key} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{label}</td>
                  {profiles.map((p) => {
                    const score = p.scores?.[key];
                    return (
                      <td key={p.id} className="p-3 text-center">
                        {score ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            score >= 4 ? "bg-success/10 text-success" :
                            score >= 3 ? "bg-info/10 text-info" :
                            score >= 2 ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
