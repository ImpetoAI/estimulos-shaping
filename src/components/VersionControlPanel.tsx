import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History, Clock, CheckCircle2, Edit3, Eye, RotateCcw, User,
  FileText, GitBranch, ArrowRight, X, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface Version {
  id: string;
  version: string;
  date: string;
  author: string;
  status: "atual" | "aprovada" | "rascunho" | "arquivada";
  changes: string[];
  notes?: string;
}

const statusStyles: Record<string, string> = {
  atual: "bg-success/15 text-success",
  aprovada: "bg-primary/15 text-primary",
  rascunho: "bg-warning/15 text-warning",
  arquivada: "bg-muted text-muted-foreground",
};

interface VersionControlPanelProps {
  documentType: string;
  versions: Version[];
}

export default function VersionControlPanel({ documentType, versions }: VersionControlPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const currentVersion = versions.find(v => v.status === "atual") || versions[0];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch size={14} className="text-primary" />
            Controle de Versões
          </CardTitle>
          <Badge variant="outline" className="text-[10px] gap-1">
            <History size={10} /> {versions.length} versões
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current version */}
        <div className="p-3 rounded-lg bg-accent/40 border border-border/40">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-card-foreground">v{currentVersion.version}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[currentVersion.status]}`}>
                {currentVersion.status}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">{currentVersion.date}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{currentVersion.author}</p>
        </div>

        {/* Toggle history */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Ocultar histórico" : "Ver histórico completo"}
        </Button>

        {/* Version list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {versions.map((v, i) => (
                <div
                  key={v.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedVersion === v.id
                      ? "border-primary bg-primary/5"
                      : "border-border/40 hover:border-border"
                  }`}
                  onClick={() => setSelectedVersion(selectedVersion === v.id ? null : v.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-card-foreground">v{v.version}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyles[v.status]}`}>
                        {v.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{v.date}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{v.author}</p>

                  {selectedVersion === v.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 pt-2 border-t border-border/40"
                    >
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Alterações</p>
                      <ul className="space-y-1">
                        {v.changes.map((c, ci) => (
                          <li key={ci} className="text-[11px] text-card-foreground flex items-start gap-1.5">
                            <Edit3 size={10} className="mt-0.5 text-primary flex-shrink-0" /> {c}
                          </li>
                        ))}
                      </ul>
                      {v.notes && (
                        <p className="text-[10px] text-muted-foreground mt-2 italic">Nota: {v.notes}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-[10px] h-7 gap-1">
                          <Eye size={10} /> Visualizar
                        </Button>
                        {v.status !== "atual" && (
                          <Button variant="ghost" size="sm" className="text-[10px] h-7 gap-1">
                            <RotateCcw size={10} /> Restaurar
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Pre-built version data for each document type
export const curriculumVersions: Version[] = [
  { id: "cv1", version: "2.1", date: "12/03/2026", author: "Coord. Maria", status: "atual", changes: ["Ajustado nível de adaptação para Significativo", "Adicionados objetivos de matemática", "Incluídas habilidades BNCC atualizadas"] },
  { id: "cv2", version: "2.0", date: "05/03/2026", author: "Coord. Maria", status: "aprovada", changes: ["Revisão completa do currículo", "Reorganização das áreas prioritárias"], notes: "Aprovado pela coordenação pedagógica" },
  { id: "cv3", version: "1.0", date: "15/02/2026", author: "Sistema", status: "arquivada", changes: ["Versão inicial gerada automaticamente"] },
];

export const theoryVersions: Version[] = [
  { id: "tv1", version: "1.2", date: "11/03/2026", author: "Pedagoga Ana", status: "atual", changes: ["Refinamento das atividades de alfabetização", "Ajuste de complexidade para Nível 3"] },
  { id: "tv2", version: "1.1", date: "01/03/2026", author: "Pedagoga Ana", status: "aprovada", changes: ["Adicionadas referências teóricas", "Incluídas estratégias multissensoriais"] },
  { id: "tv3", version: "1.0", date: "20/02/2026", author: "Sistema", status: "arquivada", changes: ["Base teórica gerada automaticamente"] },
];

export const assessmentVersions: Version[] = [
  { id: "av1", version: "1.1", date: "10/03/2026", author: "Coord. Maria", status: "atual", changes: ["Adicionadas 2 questões de interpretação", "Ajustado nível de dificuldade"] },
  { id: "av2", version: "1.0", date: "25/02/2026", author: "Sistema", status: "aprovada", changes: ["Avaliação gerada a partir da base teórica"] },
];
