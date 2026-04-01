import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Calendar, Clock, FileText, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/supabase";
import type { CicloTabProps } from "./_shared";

interface EvalRegistry {
  id: string;
  evaluation_date: string;
  knowledge_area: string;
  contents: string | null;
  completed_evaluation: boolean;
  conducted_by: string;
  duration_minutes: number | null;
  exam_type: string | null;
  exam_file_url: string | null;
  description: string | null;
  showed_resistance: boolean;
  showed_discomfort: boolean;
  discomfort_description: string | null;
  used_support_resources: boolean;
  support_resources_description: string | null;
  understood_commands: boolean;
  commands_observation: string | null;
  used_reinforcers: boolean;
  reinforcers_description: string | null;
  created_at: string;
}

const AREA_LABELS: Record<string, string> = {
  portugues: "Portugues",
  matematica: "Matematica",
  ciencias: "Ciencias",
  historia: "Historia",
  geografia: "Geografia",
  artes: "Artes",
  educacao_fisica: "Educacao Fisica",
  ingles: "Ingles",
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function BoolBadge({ value, label }: { value: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {value ? (
        <CheckCircle2 size={12} className="text-success" />
      ) : (
        <XCircle size={12} className="text-muted-foreground" />
      )}
      <span className={value ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

export default function RegistroAvaliativoTab({ caseId, bimester, studentId }: CicloTabProps) {
  const [records, setRecords] = useState<EvalRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await db
      .from("evaluation_registries")
      .select("*")
      .eq("student_id", studentId)
      .eq("bimester", bimester)
      .order("evaluation_date", { ascending: false });
    setRecords((data as EvalRegistry[]) ?? []);
    setLoading(false);
  }, [studentId, bimester]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={20} className="text-primary" />
          <h2 className="text-lg font-bold">Registros Avaliativos</h2>
          <Badge variant="outline" className="text-[10px]">Somente visualizacao</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Registros preenchidos pelo AT no portal. {records.length} registro(s) no {bimester}o bimestre.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
        <FileText size={18} className="text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Os registros avaliativos sao preenchidos pelo Atendente Terapeutico (AT) apos aplicar as provas.
          Aqui voce visualiza todos os registros enviados, incluindo o PDF da prova executada.
        </p>
      </div>

      {/* Records list */}
      {records.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-10 text-center space-y-3">
          <ClipboardList size={28} className="mx-auto text-muted-foreground/30" />
          <p className="font-semibold text-sm">Nenhum registro avaliativo</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            O AT ainda nao enviou registros para este bimestre. Os registros aparecem aqui automaticamente apos serem preenchidos no portal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((reg) => {
            const expanded = expandedId === reg.id;
            return (
              <div key={reg.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => setExpandedId(expanded ? null : reg.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ClipboardList size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {AREA_LABELS[reg.knowledge_area] ?? reg.knowledge_area}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(reg.evaluation_date)}
                        </span>
                        {reg.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {reg.duration_minutes} min
                          </span>
                        )}
                        {reg.exam_type && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                            {reg.exam_type === "v1" ? "V1 Mensal" : "V2 Bimestral"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reg.exam_file_url && (
                      <Badge className="bg-success/15 text-success border-0 text-[10px]">PDF anexado</Badge>
                    )}
                    <Badge variant={reg.completed_evaluation ? "default" : "secondary"} className="text-[10px]">
                      {reg.completed_evaluation ? "Concluiu" : "Nao concluiu"}
                    </Badge>
                  </div>
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-border/50 p-4 space-y-4 bg-muted/10">
                    {/* Contents */}
                    {reg.contents && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Conteudos</p>
                        <p className="text-sm">{reg.contents}</p>
                      </div>
                    )}

                    {/* Toggles */}
                    <div className="grid sm:grid-cols-2 gap-2">
                      <BoolBadge value={reg.showed_resistance} label="Apresentou resistencia" />
                      <BoolBadge value={reg.showed_discomfort} label="Demonstrou desconforto" />
                      <BoolBadge value={reg.used_support_resources} label="Usou recursos de apoio" />
                      <BoolBadge value={reg.understood_commands} label="Compreendeu comandos" />
                      <BoolBadge value={reg.used_reinforcers} label="Usou reforcadores" />
                      <BoolBadge value={reg.completed_evaluation} label="Completou avaliacao" />
                    </div>

                    {/* Conditional descriptions */}
                    {reg.discomfort_description && (
                      <div className="text-xs"><strong>Desconforto:</strong> {reg.discomfort_description}</div>
                    )}
                    {reg.support_resources_description && (
                      <div className="text-xs"><strong>Recursos:</strong> {reg.support_resources_description}</div>
                    )}
                    {reg.commands_observation && (
                      <div className="text-xs"><strong>Comandos:</strong> {reg.commands_observation}</div>
                    )}
                    {reg.reinforcers_description && (
                      <div className="text-xs"><strong>Reforcadores:</strong> {reg.reinforcers_description}</div>
                    )}

                    {/* Conducted by */}
                    <div className="text-xs text-muted-foreground">
                      Conduzido por: <strong>{reg.conducted_by === "atendente_terapeutica" ? "Atendente Terapeutica" : "Professor"}</strong>
                    </div>

                    {/* Free description */}
                    {reg.description && (
                      <div className="rounded-lg bg-card border border-border/50 p-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Observacoes</p>
                        <p className="text-sm text-muted-foreground">{reg.description}</p>
                      </div>
                    )}

                    {/* PDF attachment */}
                    {reg.exam_file_url ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                        <FileText size={16} className="text-success shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold">Prova executada (PDF)</p>
                          <a href={reg.exam_file_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1">
                            Abrir PDF <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                        <FileText size={16} className="text-warning shrink-0" />
                        <p className="text-xs text-warning">Nenhum PDF da prova anexado</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
