import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ClipboardCheck, Upload, CheckCircle2, FileUp,
  PenTool, FileDown, Save, Download, FileText, Eye, Edit3,
  BookOpen, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/supabase";
import { type CicloTabProps } from "./_shared";
import { DISCIPLINAS } from "@/types/patient";
import { toast } from "sonner";

// ─── Mock questions (Cenario B) ──────────────────────────────────────────────
const mockQuestions = [
  { number: 1, area: "Alfabetizacao", title: "IDENTIFIQUE AS VOGAIS", enunciado: "Circule todas as vogais que voce encontrar.", descricao: "Grade 4x4 com letras em bastao maiuscula. O aluno deve circular A, E, I, O, U.", tipo: "Identificacao", dificuldade: "Basico" },
  { number: 2, area: "Alfabetizacao", title: "LIGUE A IMAGEM A LETRA", enunciado: "Ligue cada imagem a letra que comeca o nome dela.", descricao: "4 imagens a esquerda e 4 letras a direita. Pontilhado guia para ligacao.", tipo: "Pareamento", dificuldade: "Basico" },
  { number: 3, area: "Alfabetizacao", title: "COMPLETE A SILABA", enunciado: "Complete a palavra com a silaba que falta.", descricao: "3 palavras simples com silaba faltando e apoio de imagem.", tipo: "Escrita", dificuldade: "Intermediario" },
  { number: 4, area: "Matematica", title: "CONTE E ESCREVA", enunciado: "Conte os objetos e escreva o numero.", descricao: "4 grupos de objetos com quantidades de 1 a 10.", tipo: "Contagem", dificuldade: "Basico" },
  { number: 5, area: "Matematica", title: "LIGUE NUMERO A QUANTIDADE", enunciado: "Ligue cada numero ao grupo com a quantidade certa.", descricao: "Numeros 1 a 5 a esquerda, grupos de objetos a direita.", tipo: "Pareamento", dificuldade: "Basico" },
  { number: 6, area: "Logica", title: "SEQUENCIA DE IMAGENS", enunciado: "Coloque os numeros 1, 2 e 3 na ordem correta.", descricao: "3 imagens fora de ordem representando uma sequencia.", tipo: "Sequencia", dificuldade: "Basico" },
  { number: 7, area: "Coord. Motora", title: "SIGA O PONTILHADO", enunciado: "Siga o pontilhado e complete o caminho.", descricao: "Linhas retas e curvas pontilhadas.", tipo: "Tracado", dificuldade: "Basico" },
  { number: 8, area: "Interpretacao", title: "LEIA E RESPONDA", enunciado: "Leia o texto e responda com uma palavra.", descricao: "Texto curto de 2 frases com perguntas simples.", tipo: "Interpretacao", dificuldade: "Intermediario" },
];

const tipoBadgeColors: Record<string, string> = {
  Identificacao: "bg-primary/15 text-primary",
  Pareamento: "bg-warning/15 text-warning",
  Escrita: "bg-secondary/15 text-secondary",
  Contagem: "bg-primary/15 text-primary",
  Sequencia: "bg-warning/15 text-warning",
  Tracado: "bg-secondary/15 text-secondary",
  Interpretacao: "bg-success/15 text-success",
};

// ─── Adequacoes Cenario A ────────────────────────────────────────────────────
const ADEQUACOES_OPTIONS = [
  "Simplificar enunciados",
  "Reduzir numero de alternativas",
  "Aumentar tamanho da fonte",
  "Adicionar apoio visual (imagens)",
  "Reduzir quantidade de questoes",
  "Substituir dissertativas por objetivas",
  "Adicionar espaco para respostas",
  "Incluir modelo/exemplo resolvido",
  "Numerar questoes com destaque visual",
  "Separar 1 questao por pagina",
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ProvasTab({ caseId, bimester, studentId }: CicloTabProps) {
  const [student, setStudent] = useState<{ full_name: string; birth_date: string | null; current_grade: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  // Config
  const [selectedDiscipline, setSelectedDiscipline] = useState(DISCIPLINAS[0]);
  const [examType, setExamType] = useState<"v1" | "v2">("v1");
  const [scenario, setScenario] = useState<"A" | "B" | null>(null);

  // Cenario A state
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [selectedAdequacoes, setSelectedAdequacoes] = useState<Set<string>>(new Set());
  const [adequacoesNotes, setAdequacoesNotes] = useState("");

  // Cenario B state
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Upload final
  const [finalFile, setFinalFile] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await db.from("students").select("full_name, birth_date, current_grade").eq("id", studentId).single();
      if (data) setStudent(data as any);
      setLoading(false);
    })();
  }, [studentId]);

  const calcAge = (dob: string | null) => dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2500);
  };

  const toggleAdequacao = (item: string) => {
    setSelectedAdequacoes((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item); else next.add(item);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-40" /><Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  const age = calcAge(student?.birth_date ?? null);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardCheck size={20} className="text-primary" /> Adaptacao de Provas
          </h2>
          <p className="text-sm text-muted-foreground">
            {student?.full_name} · {student?.current_grade}{age ? ` · ${age} anos` : ""} · B{bimester}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DISCIPLINAS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={examType} onValueChange={(v) => setExamType(v as "v1" | "v2")}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="v1">V1 — Mensal</SelectItem>
              <SelectItem value="v2">V2 — Bimestral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scenario selector */}
      {!scenario ? (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Cenario A */}
          <motion.button
            className="rounded-xl border-2 border-border bg-card p-6 text-left hover:border-primary/50 transition-colors group"
            onClick={() => setScenario("A")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Upload size={22} className="text-primary" />
            </div>
            <h3 className="font-bold text-card-foreground mb-1">Cenario A — Adequacao da Prova da Escola</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Faca upload da prova original da escola e selecione quais adequacoes aplicar (simplificar enunciados, aumentar fonte, reduzir alternativas, etc.)
            </p>
            <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:underline">
              Selecionar <ArrowRight size={12} />
            </span>
          </motion.button>

          {/* Cenario B */}
          <motion.button
            className="rounded-xl border-2 border-border bg-card p-6 text-left hover:border-secondary/50 transition-colors group"
            onClick={() => setScenario("B")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Sparkles size={22} className="text-secondary" />
            </div>
            <h3 className="font-bold text-card-foreground mb-1">Cenario B — Prova Nova com IA</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A IA gera uma prova 100% nova baseada no curriculo adaptado do aluno, com questoes personalizadas para o nivel de adaptacao.
            </p>
            <span className="text-xs text-secondary font-semibold flex items-center gap-1 group-hover:underline">
              Selecionar <ArrowRight size={12} />
            </span>
          </motion.button>
        </div>
      ) : scenario === "A" ? (
        /* ═══ CENARIO A: Adequacao ═══ */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0">Cenario A</Badge>
              <span className="text-sm font-semibold">Adequacao da Prova — {selectedDiscipline} ({examType === "v1" ? "V1 Mensal" : "V2 Bimestral"})</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setScenario(null)}>Trocar cenario</Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload prova original */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileUp size={16} className="text-primary" /> Prova Original da Escola
              </h3>
              {uploadedFile ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                  <span className="text-sm truncate flex-1">{uploadedFile}</span>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setUploadedFile(null)}>Remover</Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <Upload size={24} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Clique para enviar a prova original (PDF, DOC, imagem)</span>
                  <input type="file" className="hidden" onChange={() => setUploadedFile("Prova_V1_Portugues_5ano_Mar2026.pdf")} />
                </label>
              )}

              {/* Upload prova final adaptada */}
              <div className="border-t border-border/50 pt-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Prova Final Adaptada (apos design)</h4>
                {finalFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                    <span className="text-xs truncate flex-1">{finalFile}</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => setFinalFile("Prova_Adaptada_Angelo_V1_PT.pdf")}>
                    <Upload size={13} /> Upload da prova adaptada
                  </Button>
                )}
              </div>
            </div>

            {/* Adequacoes checklist */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <PenTool size={16} className="text-secondary" /> Adequacoes a Aplicar
              </h3>
              <div className="space-y-1.5">
                {ADEQUACOES_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      selectedAdequacoes.has(item) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox checked={selectedAdequacoes.has(item)} onCheckedChange={() => toggleAdequacao(item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Observacoes adicionais</Label>
                <Textarea
                  placeholder="Ex: Manter questao 3 mas trocar as imagens por figuras maiores..."
                  value={adequacoesNotes}
                  onChange={(e) => setAdequacoesNotes(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>

              <Button className="w-full gap-2" onClick={() => toast.success("Adequacoes salvas!")}>
                <Save size={14} /> Salvar Adequacoes
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ═══ CENARIO B: IA ═══ */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-secondary/10 text-secondary border-0">Cenario B</Badge>
              <span className="text-sm font-semibold">Prova Gerada por IA — {selectedDiscipline} ({examType === "v1" ? "V1 Mensal" : "V2 Bimestral"})</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setScenario(null)}>Trocar cenario</Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-secondary" /> Configuracao
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disciplina</span>
                    <span className="font-semibold">{selectedDiscipline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-semibold">{examType === "v1" ? "V1 Mensal" : "V2 Bimestral"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel</span>
                    <Badge className="bg-warning/15 text-warning border-0 text-xs">N3 Significativo</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questoes</span>
                    <span className="font-semibold">8 questoes</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Sparkles size={16} />
                      </motion.div>
                      Gerando...
                    </>
                  ) : generated ? (
                    <><Sparkles size={16} /> Regenerar Prova</>
                  ) : (
                    <><Sparkles size={16} /> Gerar Prova com IA</>
                  )}
                </Button>
              </div>

              {/* Upload final */}
              {generated && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <FileUp size={16} className="text-primary" /> Prova Final (Design)
                  </h3>
                  <p className="text-xs text-muted-foreground">Apos o designer produzir a prova, faca upload aqui.</p>
                  {finalFile ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span className="text-xs truncate flex-1">{finalFile}</span>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setFinalFile("Prova_IA_Angelo_V1_PT.pdf")}>
                      <Upload size={14} /> Upload da Prova Final
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Right: result */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div
                    key="loading"
                    className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 space-y-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                      transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5 } }}
                      className="w-16 h-16 rounded-2xl bg-secondary/15 flex items-center justify-center"
                    >
                      <Sparkles size={28} className="text-secondary" />
                    </motion.div>
                    <p className="text-sm font-semibold">Gerando prova adaptada...</p>
                    <p className="text-xs text-muted-foreground max-w-xs text-center">
                      A IA esta criando questoes personalizadas de {selectedDiscipline} para {student?.full_name}.
                    </p>
                  </motion.div>
                ) : generated ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <Tabs defaultValue="questoes" className="w-full">
                      <TabsList className="w-full grid grid-cols-2 mb-4">
                        <TabsTrigger value="questoes" className="gap-2 text-sm font-semibold">
                          <ClipboardCheck size={15} /> Questoes da Prova
                        </TabsTrigger>
                        <TabsTrigger value="orientacoes" className="gap-2 text-sm font-semibold">
                          <PenTool size={15} /> Orientacoes Design
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="questoes">
                        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ClipboardCheck size={16} className="text-primary" />
                              <span className="text-sm font-bold">Prova Adaptada — {selectedDiscipline}</span>
                              <Badge className="bg-success/15 text-success border-0 text-[10px]">8 questoes</Badge>
                            </div>
                            <div className="flex gap-1.5">
                              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1"><Save size={12} /> Salvar</Button>
                              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1"><FileDown size={12} /> PDF</Button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-sm font-bold">Avaliacao Pedagogica Adaptada — {student?.full_name}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                              <span><strong className="text-card-foreground">Serie:</strong> {student?.current_grade}</span>
                              <span><strong className="text-card-foreground">Nivel:</strong> N3 Significativo</span>
                              <span><strong className="text-card-foreground">Tipo:</strong> {examType === "v1" ? "V1 Mensal" : "V2 Bimestral"}</span>
                            </div>
                          </div>

                          <div className="max-h-[550px] overflow-y-auto space-y-3 pr-1">
                            {mockQuestions.map((q, idx) => (
                              <motion.div
                                key={q.number}
                                className="rounded-xl border border-border/60 bg-background overflow-hidden"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                              >
                                <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border/40">
                                  <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                                    {q.number}
                                  </span>
                                  <h4 className="text-sm font-bold flex-1">{q.title}</h4>
                                  <Badge className={`text-[10px] border-0 font-semibold ${tipoBadgeColors[q.tipo] ?? "bg-muted text-muted-foreground"}`}>{q.tipo}</Badge>
                                </div>
                                <div className="p-4 space-y-3">
                                  <Badge variant="outline" className="text-[10px]">{q.area}</Badge>
                                  <div className="rounded-lg bg-secondary/5 border border-secondary/20 p-3">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-secondary mb-1">Enunciado</p>
                                    <p className="text-sm font-medium">{q.enunciado}</p>
                                  </div>
                                  <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">Descricao</p>
                                    <p className="text-sm text-muted-foreground">{q.descricao}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="orientacoes">
                        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                          <h3 className="text-sm font-bold flex items-center gap-2">
                            <PenTool size={16} className="text-secondary" /> Orientacoes para o Setor de Design
                          </h3>
                          <div className="p-5 rounded-lg bg-muted/30 border border-border/50 space-y-4 max-h-[500px] overflow-y-auto">
                            {[
                              { titulo: "Diretrizes Gerais", items: ["Fonte bastao maiuscula, minimo 18pt", "Maximo 2 questoes por pagina", "Fundo branco, sem texturas", "Contornos grossos e definidos", "Imagens coloridas, fundo limpo", "Espacamento amplo (1,5cm entre questoes)", "Nome do aluno e data no topo"] },
                              { titulo: "Orientacoes por Tipo", items: ["Identificacao: elementos bem espacados, minimo 2x2cm", "Pareamento: pontilhado guia, 2cm entre itens", "Escrita: linha pontilhada 1,5cm, modelo de letra", "Contagem: objetos alinhados, tamanho uniforme", "Sequencia: quadros com bordas, numeracao clara"] },
                              { titulo: "Aplicacao", items: ["Aplicar com mediacao de terapeuta", "Cada questao individualmente", "Ler enunciado em voz alta se necessario", "Nao cronometrar", "Registrar observacoes comportamentais", "Imprimir em A4, plastificar se possivel"] },
                            ].map((section) => (
                              <div key={section.titulo}>
                                <h4 className="text-sm font-bold mb-2">{section.titulo}</h4>
                                <ul className="space-y-1.5">
                                  {section.items.map((item, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="rounded-xl border border-border bg-card flex flex-col items-center justify-center py-24 space-y-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                      <ClipboardCheck size={28} className="text-primary/40" />
                    </div>
                    <p className="text-sm font-semibold">Nenhuma prova gerada</p>
                    <p className="text-xs text-muted-foreground max-w-xs text-center">
                      Clique em "Gerar Prova com IA" para criar uma avaliacao personalizada baseada no curriculo adaptado.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
