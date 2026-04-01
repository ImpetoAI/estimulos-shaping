import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Sparkles, Download, Copy, Edit3, Eye, Check,
  AlertTriangle, CheckCircle2, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/supabase";
import { type CicloTabProps } from "./_shared";
import { toast } from "sonner";

// ─── Section config ──────────────────────────────────────────────────────────
const REPORT_SECTIONS = [
  { key: "perfil", label: "Perfil Acadêmico", icon: "📋", description: "Blocos, scores e nível de adaptação" },
  { key: "curriculo_original", label: "Currículo Original", icon: "📖", description: "Conteúdo da escola vinculado" },
  { key: "curriculo_adaptado", label: "Currículo Adaptado", icon: "🎯", description: "Objetivos e estratégias adaptadas" },
  { key: "planejamento", label: "Planejamento", icon: "📝", description: "Atividades planejadas por matéria" },
  { key: "registro_avaliativo", label: "Registro Avaliativo", icon: "📊", description: "Resultados das avaliações aplicadas" },
  { key: "evolucao", label: "Evolução", icon: "📈", description: "Comparativo entre bimestres" },
  { key: "linha_do_tempo", label: "Linha do Tempo", icon: "🕐", description: "Eventos cronológicos do ciclo" },
  { key: "observacoes", label: "Observações Gerais", icon: "💬", description: "Notas e recomendações adicionais" },
];

// ─── Mock generated report ───────────────────────────────────────────────────
const MOCK_REPORT = `# RELATÓRIO PEDAGÓGICO INDIVIDUALIZADO

## 1. Identificação do Aluno

**Nome:** Ângelo Cardoso Azevedo Neto
**Idade:** 11 anos | **Série:** 5º ano | **Ano Letivo:** 2026
**Escola:** Escola Municipal Darcy Ribeiro
**Diagnóstico:** TEA nível 1 de suporte
**Nível de Adaptação:** N3 — Adaptação Significativa

---

## 2. Perfil Acadêmico

Ângelo apresenta repertório acadêmico compatível com 2º/3º ano em linguagem e matemática. Demonstra boa coordenação motora fina e expressa preferências de forma funcional.

**Scores atuais:**
- Leitura: 3/5 (Adequado)
- Escrita: 3/5 (Adequado)
- Matemática: 2/5 (Abaixo)
- Lógica: 3/5 (Adequado)
- Autonomia: 3/5 (Adequado)

**Destaques:** Conhece todo o alfabeto, lê sílabas simples, copia textos curtos com autonomia. Realiza adição com 1 e 2 termos. Monta quebra-cabeça de 4 peças com corte reto.

**Pontos de atenção:** Subtração limitada a 1 termo, dificuldade com sequência numérica acima de 20, não reconhece formas espaciais.

---

## 3. Objetivos Trabalhados

Com base no currículo adaptado (Nível 3 — Significativo), os seguintes objetivos foram priorizados:

**Linguagem e Alfabetização:**
- Reconhecer todas as letras do alfabeto ✓
- Formar sílabas simples (consoante + vogal) ✓
- Relacionar palavras com figuras do cotidiano — em progresso

**Matemática:**
- Contagem sequencial até 40 ✓
- Adição simples com 1 e 2 termos ✓
- Reconhecimento de formas geométricas planas — em progresso

**Coordenação Motora:**
- Traçado de linhas retas e curvas ✓
- Pintura dentro do contorno — parcial
- Recorte com suporte parcial ✓

---

## 4. Intervenções Realizadas

Foram produzidas e aplicadas as seguintes intervenções ao longo do bimestre:

- **Apostila adaptada** com 38 atividades (Português, Matemática, Coordenação Motora)
- **Quadro de rotina visual** personalizado para organização diária
- **História social:** "Como pedir ajuda na escola"
- **5 registros avaliativos** aplicados (Matemática, Geografia, Português, História e outros)

Estratégias utilizadas: apoio visual com cartões, repetição guiada, atividades multissensoriais, material concreto, jogos de associação numérica.

---

## 5. Desempenho do Aluno

Nos registros avaliativos do 1º Bimestre:

| Área | Resultado | Observação |
|------|-----------|------------|
| Matemática | Concluiu com êxito | Respondeu todas as questões com sucesso |
| Geografia | Concluiu | Compreendeu toda a prova com excelência |
| Português | Concluiu | Formou frases e interpretou texto com nota máxima |
| História | Concluiu | Boa convivência e participação |

**Destaque positivo:** Ângelo demonstrou crescente autonomia nas atividades de pareamento e classificação por forma.

---

## 6. Evolução Observada

Comparando o início do bimestre com o momento atual:

- **Leitura:** Manteve nível adequado (3/5). Evolução na leitura de palavras completas.
- **Escrita:** Manteve nível adequado (3/5). Avançou de cópia de palavras para cópia de textos curtos.
- **Matemática:** Ainda abaixo (2/5), porém avançou de contagem até 20 para até 40 e de adição com 1 termo para 2 termos.
- **Coordenação Motora:** Progresso significativo em recorte (de suporte total para parcial) e colagem (independente).

---

## 7. Considerações Finais

Ângelo apresenta evolução consistente dentro do nível de adaptação significativa. Recomenda-se para o próximo bimestre:

1. **Reforçar** escrita progressiva com produção de frases simples
2. **Introduzir** subtração com apoio visual concreto
3. **Ampliar** contagem sequencial para 60
4. **Manter** estratégias visuais e material concreto
5. **Estimular** interpretação textual com apoio de imagens

O acompanhamento bimestral permite ajustes contínuos no currículo adaptado, garantindo que Ângelo avance no seu ritmo com suporte adequado.

---

*Relatório gerado automaticamente pelo Sistema Estímulos em 01/04/2026.*
*Baseado nos dados do 1º Bimestre — Ano Letivo 2026.*`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function RelatorioTab({ caseId, bimester, studentId }: CicloTabProps) {
  const [student, setStudent] = useState<{ full_name: string; current_grade: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set(["perfil", "curriculo_adaptado", "registro_avaliativo", "evolucao"]));
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [dataCounts, setDataCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: s }, { data: profiles }, { data: registries }, { data: timeline }] = await Promise.all([
        db.from("students").select("full_name, current_grade").eq("id", studentId).single(),
        db.from("academic_profiles").select("id").eq("case_id", caseId),
        db.from("evaluation_registries").select("id").eq("case_id", caseId).eq("bimester", bimester),
        db.from("timeline_events").select("id").eq("case_id", caseId),
      ]);
      if (s) setStudent(s as { full_name: string; current_grade: string });
      setDataCounts({
        perfil: (profiles ?? []).length,
        registro_avaliativo: (registries ?? []).length,
        linha_do_tempo: (timeline ?? []).length,
      });
      setLoading(false);
    })();
  }, [caseId, bimester, studentId]);

  const toggleSection = (key: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleGenerate = () => {
    if (selectedSections.size === 0) { toast.error("Selecione pelo menos um item"); return; }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setReportText(MOCK_REPORT);
    }, 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    toast.success("Relatório copiado!");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={20} className="text-primary" />
          <h2 className="text-lg font-bold">Relatório do Paciente</h2>
          {generated && <Badge className="bg-success/15 text-success border-0 text-[10px]">Gerado</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione os dados que deseja incluir e a IA gerará o relatório pedagógico completo.
        </p>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* ── Left: Section selector ── */}
        <div className="space-y-5">
          {/* Student info */}
          <motion.div
            className="rounded-xl border border-border bg-card p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {student?.full_name?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-sm">{student?.full_name}</p>
                <p className="text-xs text-muted-foreground">{student?.current_grade} · B{bimester} · 2026</p>
              </div>
            </div>
            <div className="flex gap-2 text-[10px]">
              <Badge variant="outline">{dataCounts.perfil ?? 0} perfil(is)</Badge>
              <Badge variant="outline">{dataCounts.registro_avaliativo ?? 0} registros</Badge>
              <Badge variant="outline">{dataCounts.linha_do_tempo ?? 0} eventos</Badge>
            </div>
          </motion.div>

          {/* Section checkboxes */}
          <motion.div
            className="rounded-xl border border-border bg-card p-4 space-y-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              <ClipboardList size={12} className="inline mr-1" />
              Incluir no Relatório
            </p>
            {REPORT_SECTIONS.map((section) => {
              const checked = selectedSections.has(section.key);
              return (
                <label
                  key={section.key}
                  className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    checked ? "bg-primary/5 border border-primary/20" : "border border-transparent hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleSection(section.key)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <span>{section.icon}</span> {section.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{section.description}</p>
                  </div>
                </label>
              );
            })}
          </motion.div>

          {/* Generate button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={handleGenerate}
              disabled={generating || selectedSections.size === 0}
              className="w-full gap-2 font-bold h-12 text-sm"
              size="lg"
            >
              {generating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles size={16} />
                  </motion.div>
                  Gerando relatório...
                </>
              ) : generated ? (
                <>
                  <Sparkles size={16} /> Regenerar Relatório
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Gerar Relatório com IA
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              {selectedSections.size} seção(ões) selecionada(s)
            </p>
          </motion.div>

          {/* Warnings */}
          {dataCounts.perfil === 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
              <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
              <p className="text-[11px] text-warning">Perfil acadêmico não preenchido. O relatório ficará incompleto.</p>
            </div>
          )}
        </div>

        {/* ── Right: Generated report ── */}
        <div>
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div
                key="loading"
                className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                  transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5 } }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                >
                  <Sparkles size={28} className="text-primary" />
                </motion.div>
                <p className="text-sm font-semibold">Gerando relatório pedagógico...</p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  A IA está analisando {selectedSections.size} seções de dados de {student?.full_name} para montar o relatório.
                </p>
              </motion.div>
            ) : generated ? (
              <motion.div
                key="result"
                className="rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    <span className="text-sm font-bold">Relatório Gerado</span>
                    <Badge className="bg-success/15 text-success border-0 text-[10px]">
                      <CheckCircle2 size={10} className="mr-1" /> Pronto
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? <Eye size={13} /> : <Edit3 size={13} />}
                      {isEditing ? "Visualizar" : "Editar"}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" onClick={handleCopy}>
                      <Copy size={13} /> Copiar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.info("Export PDF em breve")}>
                      <Download size={13} /> PDF
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {isEditing ? (
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      className="w-full min-h-[700px] p-4 rounded-lg border border-input bg-background text-foreground text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  ) : (
                    <div className="prose-container max-h-[750px] overflow-y-auto pr-2">
                      <ReportRenderer content={reportText} />
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <FileText size={28} className="text-primary/40" />
                </div>
                <p className="text-sm font-semibold">Nenhum relatório gerado</p>
                <p className="text-xs text-muted-foreground max-w-sm text-center">
                  Selecione as seções que deseja incluir e clique em "Gerar Relatório com IA".
                  A IA vai ler todos os dados do aluno e montar um relatório pedagógico completo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown-like renderer ──────────────────────────────────────────────────
function ReportRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm text-card-foreground leading-relaxed">
      {lines.map((line, i) => {
        if (line.trim() === "---") return <hr key={i} className="border-border/50 my-4" />;

        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-xl font-bold text-card-foreground mt-6 mb-3">{line.replace("# ", "")}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-base font-bold text-card-foreground mt-5 mb-2 pb-1 border-b border-border/50">{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-sm font-bold text-primary mt-4 mb-1">{line.replace("### ", "")}</h3>;
        }

        // Table
        if (line.startsWith("|")) {
          if (line.includes("---")) return null;
          const cells = line.split("|").filter(Boolean).map((c) => c.trim());
          const isHeader = i + 1 < lines.length && lines[i + 1]?.includes("---");
          return (
            <div key={i} className={`grid grid-cols-${cells.length} gap-2 px-2 py-1.5 text-xs ${isHeader ? "font-bold border-b border-border/50" : "text-muted-foreground"}`}
              style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
              {cells.map((cell, j) => <span key={j}>{cell}</span>)}
            </div>
          );
        }

        // Bold lines
        const renderInline = (text: string) => {
          const parts: React.ReactNode[] = [];
          const regex = /\*\*(.+?)\*\*/g;
          let lastIndex = 0;
          let match;
          let key = 0;
          while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
            parts.push(<strong key={key++} className="text-card-foreground font-semibold">{match[1]}</strong>);
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < text.length) parts.push(text.slice(lastIndex));
          return parts.length > 0 ? parts : text;
        };

        if (line.startsWith("- **")) {
          const match = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
          if (match) {
            return (
              <p key={i} className="pl-4 flex items-start gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-card-foreground">{match[1]}</strong> <span className="text-muted-foreground">{match[2]}</span></span>
              </p>
            );
          }
        }

        if (line.startsWith("- ")) {
          return (
            <p key={i} className="pl-4 flex items-start gap-1.5 text-muted-foreground py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>{renderInline(line.replace("- ", ""))}</span>
            </p>
          );
        }

        if (line.trim() === "") return <div key={i} className="h-1" />;

        return <p key={i} className="text-muted-foreground">{renderInline(line)}</p>;
      })}
    </div>
  );
}
