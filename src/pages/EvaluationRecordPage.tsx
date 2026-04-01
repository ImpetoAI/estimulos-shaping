import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Calendar, FileText, Upload, Eye, Clock, Brain,
  CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
  Minus, FileUp, History, BarChart3, Zap, Lightbulb,
  ArrowUp, ArrowDown, Equal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.3 },
};

const mockStudent = {
  name: "Lucas Mendes", age: 9, grade: "4º ano",
  adaptationLevel: "Nível 3 — Significativo", subject: "Português",
};

const mockAssessment = {
  title: "Avaliação Adaptada — Português — Abril 2026",
  date: "2026-04-10", totalQuestions: 8,
};

const mockHistory = [
  { id: 1, date: "2026-03-15", subject: "Matemática", performance: "parcial", autonomy: "ajuda leve", score: 62 },
  { id: 2, date: "2026-02-20", subject: "Português", performance: "adequado", autonomy: "sozinho", score: 78 },
  { id: 3, date: "2026-01-18", subject: "Ciências", performance: "abaixo", autonomy: "ajuda constante", score: 35 },
  { id: 4, date: "2025-12-10", subject: "Português", performance: "parcial", autonomy: "ajuda leve", score: 55 },
];

const performanceBadge: Record<string, string> = {
  adequado: "bg-success/15 text-success",
  parcial: "bg-warning/15 text-warning",
  abaixo: "bg-destructive/15 text-destructive",
};

// ===== AUTO-ANALYSIS ENGINE =====
function generateAutoAnalysis(perf: string, autonomy: string, adaptation: string, behavior: string): { verdict: string; icon: React.ElementType; color: string; recommendations: string[] } | null {
  if (!perf || !autonomy || !adaptation) return null;

  const isGood = perf === "adequado" && (autonomy === "sozinho" || autonomy === "ajuda_leve");
  const isPartial = perf === "parcial";
  const isBad = perf === "abaixo";

  if (isGood && adaptation === "adequada") {
    return {
      verdict: "Adaptação adequada — Desempenho consistente",
      icon: CheckCircle2,
      color: "bg-success/10 text-success border-success/20",
      recommendations: [
        "Considerar progressão gradual de nível de adaptação",
        "Aluno demonstra prontidão para desafios incrementais",
        "Manter reforço positivo e acompanhamento",
      ],
    };
  }

  if (isPartial) {
    return {
      verdict: "Adaptação parcialmente adequada — Ajustes recomendados",
      icon: AlertTriangle,
      color: "bg-warning/10 text-warning border-warning/20",
      recommendations: [
        "Revisar instruções para maior clareza visual",
        "Ajustar tempo de execução disponível",
        "Incluir mais apoio concreto/ilustrativo nas questões",
      ],
    };
  }

  if (isBad) {
    return {
      verdict: "Recomenda-se aumentar nível de adaptação",
      icon: TrendingUp,
      color: "bg-destructive/10 text-destructive border-destructive/20",
      recommendations: [
        "Aumentar nível de adaptação para próxima avaliação",
        "Reduzir quantidade de questões por avaliação",
        "Incluir mais apoio visual e manipulativo",
        "Avaliar necessidade de apoio individual durante prova",
      ],
    };
  }

  return {
    verdict: "Análise inconclusiva — mais dados necessários",
    icon: Minus,
    color: "bg-muted text-muted-foreground border-border",
    recommendations: ["Preencha todos os campos do registro para análise completa"],
  };
}

// ===== PROGRESSION ALERT =====
function ProgressionAlert({ history }: { history: typeof mockHistory }) {
  const recentGood = history.filter(h => h.performance === "adequado" && h.score >= 70).length;
  const trend = history.length >= 2 ? history[0].score - history[1].score : 0;

  if (recentGood < 2 && trend <= 0) return null;

  return (
    <motion.div {...fadeUp}>
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={18} className="text-success" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-success">Alerta de Progressão Pedagógica</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {recentGood >= 2
                  ? `O aluno apresentou desempenho adequado em ${recentGood} das últimas ${history.length} avaliações. Considere reduzir o nível de adaptação gradualmente.`
                  : `Tendência positiva detectada (+${trend} pontos). Continue monitorando para possível progressão.`
                }
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] gap-1 text-success border-success/30">
                  <TrendingUp size={10} /> Tendência ascendente
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function EvaluationRecordPage() {
  const [activeTab, setActiveTab] = useState("registro");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [instructionUnderstanding, setInstructionUnderstanding] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState("");
  const [executionTime, setExecutionTime] = useState("");
  const [behavior, setBehavior] = useState("");
  const [performanceLevel, setPerformanceLevel] = useState("");
  const [adaptationFunctionality, setAdaptationFunctionality] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [observations, setObservations] = useState("");

  const autoAnalysis = generateAutoAnalysis(performanceLevel, autonomyLevel, adaptationFunctionality, behavior);

  const handleFileUpload = () => setUploadedFile("prova_respondida_lucas.pdf");
  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registro Avaliativo</h1>
          <p className="text-muted-foreground text-sm mt-1">Registre o desempenho e receba análise automática</p>
        </div>
        <Button onClick={handleSave} disabled={saved} className="gap-2">
          <CheckCircle2 size={16} /> {saved ? "Salvo" : "Salvar Registro"}
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="registro" className="flex-1 gap-2"><FileText size={14} /> Registro</TabsTrigger>
          <TabsTrigger value="historico" className="flex-1 gap-2"><History size={14} /> Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="registro" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              {/* Identification */}
              <motion.div {...fadeUp}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><User size={16} /> Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">LM</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{mockStudent.name}</p>
                        <p className="text-sm text-muted-foreground">{mockStudent.age} anos · {mockStudent.grade}</p>
                        <Badge variant="outline" className="text-xs">{mockStudent.adaptationLevel}</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Disciplina</span><p className="font-medium">{mockStudent.subject}</p></div>
                      <div><span className="text-muted-foreground">Data</span><p className="font-medium">{mockAssessment.date}</p></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Assessment info */}
              <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText size={16} /> Prova Aplicada</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-medium">{mockAssessment.title}</p>
                    <p className="text-xs text-muted-foreground">{mockAssessment.totalQuestions} questões adaptadas</p>
                    <Button variant="outline" size="sm" className="w-full gap-2"><Eye size={14} /> Visualizar Prova</Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upload */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Upload size={16} /> Prova Respondida</CardTitle></CardHeader>
                  <CardContent>
                    {uploadedFile ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <FileUp size={20} className="text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{uploadedFile}</p>
                          <p className="text-xs text-muted-foreground">Enviado com sucesso</p>
                        </div>
                        <Badge className="bg-success/15 text-success">Anexado</Badge>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={handleFileUpload} className="w-full gap-2"><FileUp size={14} /> Anexar Prova</Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* ===== AUTO ANALYSIS ===== */}
              {autoAnalysis && (
                <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                  <Card className={`border ${autoAnalysis.color}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap size={16} /> Análise Automática
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${autoAnalysis.color}`}>
                        <autoAnalysis.icon size={18} />
                        <p className="text-sm font-bold">{autoAnalysis.verdict}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recomendações</p>
                        {autoAnalysis.recommendations.map((r, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <CheckCircle2 size={10} className="mt-0.5 flex-shrink-0 text-primary" /> {r}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right column — Form */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain size={16} /> Registro de Desempenho</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    {/* Instruction understanding */}
                    <div className="space-y-3">
                      <Label className="font-semibold">Compreensão das Instruções</Label>
                      <RadioGroup value={instructionUnderstanding} onValueChange={setInstructionUnderstanding}>
                        {[{ value: "sem_ajuda", label: "Compreendeu sem ajuda" }, { value: "com_apoio", label: "Compreendeu com apoio" }, { value: "dificuldade", label: "Teve dificuldade" }].map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`inst-${opt.value}`} />
                            <Label htmlFor={`inst-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Separator />

                    {/* Autonomy */}
                    <div className="space-y-3">
                      <Label className="font-semibold">Nível de Autonomia</Label>
                      <RadioGroup value={autonomyLevel} onValueChange={setAutonomyLevel}>
                        {[{ value: "sozinho", label: "Realizou sozinho" }, { value: "ajuda_leve", label: "Com ajuda leve" }, { value: "ajuda_constante", label: "Com ajuda constante" }].map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`aut-${opt.value}`} />
                            <Label htmlFor={`aut-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Separator />

                    {/* Time */}
                    <div className="space-y-3">
                      <Label className="font-semibold">Tempo de Execução</Label>
                      <RadioGroup value={executionTime} onValueChange={setExecutionTime}>
                        {[{ value: "dentro", label: "Dentro do esperado" }, { value: "demorou", label: "Demorou mais" }, { value: "nao_concluiu", label: "Não concluiu" }].map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`time-${opt.value}`} />
                            <Label htmlFor={`time-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Separator />

                    {/* Behavior */}
                    <div className="space-y-3">
                      <Label className="font-semibold">Comportamento</Label>
                      <Select value={behavior} onValueChange={setBehavior}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concentrado">Concentrado</SelectItem>
                          <SelectItem value="distraido">Distraído</SelectItem>
                          <SelectItem value="ansioso">Ansioso</SelectItem>
                          <SelectItem value="evitou">Evitou tarefas</SelectItem>
                          <SelectItem value="cooperativo">Cooperativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />

                    {/* Performance */}
                    <div className="space-y-3">
                      <Label className="font-semibold">Desempenho Geral</Label>
                      <RadioGroup value={performanceLevel} onValueChange={setPerformanceLevel}>
                        {[{ value: "adequado", label: "Adequado" }, { value: "parcial", label: "Parcial" }, { value: "abaixo", label: "Abaixo do esperado" }].map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`perf-${opt.value}`} />
                            <Label htmlFor={`perf-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Observations */}
              <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                <Card>
                  <CardHeader><CardTitle className="text-base">Observações da Atendente</CardTitle></CardHeader>
                  <CardContent>
                    <Textarea placeholder="Registre observações..." className="min-h-[120px]" value={observations} onChange={e => setObservations(e.target.value)} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Adaptation + Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Funcionalidade da Adaptação</CardTitle></CardHeader>
                    <CardContent>
                      <RadioGroup value={adaptationFunctionality} onValueChange={setAdaptationFunctionality}>
                        {[
                          { value: "adequada", label: "Adequada", icon: CheckCircle2, color: "text-success" },
                          { value: "parcial", label: "Parcialmente adequada", icon: Minus, color: "text-warning" },
                          { value: "inadequada", label: "Inadequada", icon: AlertTriangle, color: "text-destructive" },
                        ].map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`adapt-${opt.value}`} />
                            <Label htmlFor={`adapt-${opt.value}`} className="font-normal cursor-pointer flex items-center gap-2">
                              <opt.icon size={14} className={opt.color} /> {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Recomendação Pedagógica</CardTitle></CardHeader>
                    <CardContent>
                      <RadioGroup value={recommendation} onValueChange={setRecommendation}>
                        {[
                          { value: "manter", label: "Manter nível", icon: Minus },
                          { value: "reduzir", label: "Reduzir adaptação", icon: TrendingDown },
                          { value: "aumentar", label: "Aumentar adaptação", icon: TrendingUp },
                        ].map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`rec-${opt.value}`} />
                            <Label htmlFor={`rec-${opt.value}`} className="font-normal cursor-pointer flex items-center gap-2">
                              <opt.icon size={14} /> {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ===== TAB HISTÓRICO ===== */}
        <TabsContent value="historico" className="space-y-6 mt-4">
          {/* Progression Alert */}
          <ProgressionAlert history={mockHistory} />

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Avaliações", value: mockHistory.length, icon: FileText },
              { label: "Média Geral", value: `${Math.round(mockHistory.reduce((a, b) => a + b.score, 0) / mockHistory.length)}%`, icon: BarChart3 },
              { label: "Melhor Score", value: `${Math.max(...mockHistory.map(h => h.score))}%`, icon: TrendingUp },
              { label: "Adequados", value: mockHistory.filter(h => h.performance === "adequado").length, icon: CheckCircle2 },
            ].map((kpi, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <kpi.icon size={18} className="text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-card-foreground">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* History table */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium">Disciplina</th>
                    <th className="p-4 font-medium">Desempenho</th>
                    <th className="p-4 font-medium">Autonomia</th>
                    <th className="p-4 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHistory.map(h => (
                    <tr key={h.id} className="border-b border-border/50 last:border-0">
                      <td className="p-4 text-muted-foreground">{h.date}</td>
                      <td className="p-4 font-medium">{h.subject}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${performanceBadge[h.performance]}`}>{h.performance}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">{h.autonomy}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={h.score} className="w-16 h-1.5" />
                          <span className="font-semibold">{h.score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
