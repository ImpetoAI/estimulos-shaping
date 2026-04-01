import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  Edit3,
  Download,
  RotateCcw,
  Clock,
  CheckCircle2,
  Eye,
  Save,
  FileDown,
  History,
  Layers,
  Target,
  Lightbulb,
  Palette,
  Upload,
  ClipboardCheck,
  PenTool,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  FileUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── Mock data ─────────────────────────────────────────────
const mockStudent = {
  name: "Lucas Mendes",
  age: 9,
  grade: "4º ano",
  year: "2026",
  materialType: "Apostila",
  status: "Base teórica concluída",
};

const mockCurriculum = {
  adaptationLevel: 3,
  adaptationLabel: "Adaptação Significativa",
  areas: [
    "Linguagem e Alfabetização",
    "Matemática",
    "Coordenação Motora",
    "Compreensão e Interpretação",
  ],
  goals: [
    "Reconhecer letras do alfabeto e formar sílabas simples",
    "Contar objetos até 20 com apoio visual",
    "Realizar traçados curvos e retos com suporte",
    "Interpretar imagens simples relacionadas ao cotidiano",
  ],
  strategies: [
    "Apoio visual constante",
    "Segmentação de tarefas",
    "Repetição estruturada",
    "Instruções curtas e diretas",
  ],
};

const mockVersions = [
  { version: 1, author: "Dra. Maria", date: "12/03/2026", status: "Gerada" },
];

// ── Assessment questions ──────────────────────────────────
const mockAssessmentQuestions = [
  {
    number: 1,
    area: "Alfabetização",
    title: "IDENTIFIQUE AS VOGAIS",
    enunciado: "Circule todas as vogais que você encontrar.",
    descricao: "Grade 4x4 com letras em bastão maiúscula. O aluno deve circular A, E, I, O, U. Incluir modelo das vogais no topo como referência. Letras com tamanho mínimo 20pt e espaçamento amplo.",
    tipo: "Identificação",
    dificuldade: "Básico",
    objetivo: "Verificar reconhecimento visual das vogais do alfabeto.",
  },
  {
    number: 2,
    area: "Alfabetização",
    title: "LIGUE A IMAGEM À LETRA",
    enunciado: "Ligue cada imagem à letra que começa o nome dela.",
    descricao: "4 imagens à esquerda (Abacaxi, Estrela, Ovo, Uva) e 4 letras à direita (A, E, O, U). Imagens coloridas com contorno definido. Pontilhado guia para traçado da ligação.",
    tipo: "Pareamento",
    dificuldade: "Básico",
    objetivo: "Avaliar associação fonema-grafema com apoio visual.",
  },
  {
    number: 3,
    area: "Alfabetização",
    title: "COMPLETE A SÍLABA",
    enunciado: "Complete a palavra com a sílaba que falta.",
    descricao: "3 palavras simples com sílaba faltando e apoio de imagem. Ex: BO___ (BOLA) com imagem ao lado. Sílaba pontilhada como modelo de escrita. Formato CV apenas.",
    tipo: "Escrita",
    dificuldade: "Intermediário",
    objetivo: "Verificar capacidade de formar sílabas simples (CV).",
  },
  {
    number: 4,
    area: "Matemática",
    title: "CONTE E ESCREVA O NÚMERO",
    enunciado: "Conte os objetos e escreva o número.",
    descricao: "4 grupos de objetos (frutas, estrelas) com quantidades de 1 a 10. Espaço ao lado com número pontilhado como modelo. Objetos grandes, coloridos e bem alinhados.",
    tipo: "Contagem",
    dificuldade: "Básico",
    objetivo: "Avaliar contagem de objetos e registro numérico.",
  },
  {
    number: 5,
    area: "Matemática",
    title: "LIGUE O NÚMERO À QUANTIDADE",
    enunciado: "Ligue cada número ao grupo com a quantidade certa.",
    descricao: "Números 1 a 5 à esquerda, grupos de objetos à direita (desordenados). Pontilhado guia cruzado. Objetos grandes e bem espaçados entre si.",
    tipo: "Pareamento",
    dificuldade: "Básico",
    objetivo: "Verificar associação número-quantidade.",
  },
  {
    number: 6,
    area: "Matemática",
    title: "COMPLETE A SEQUÊNCIA",
    enunciado: "Escreva os números que faltam na sequência.",
    descricao: "Linha numérica de 1 a 10 com 3 números faltando. Números pontilhados nos espaços em branco. Dica visual com seta indicativa de direção da contagem.",
    tipo: "Sequência",
    dificuldade: "Intermediário",
    objetivo: "Avaliar reconhecimento de sequência numérica.",
  },
  {
    number: 7,
    area: "Lógica",
    title: "SEQUÊNCIA DE IMAGENS (1–2–3)",
    enunciado: "Coloque os números 1, 2 e 3 na ordem correta.",
    descricao: "3 imagens fora de ordem representando uma sequência do cotidiano (Acordar → Escovar dentes → Tomar café). Quadros com espaço para escrita. Dica visual com seta.",
    tipo: "Sequência",
    dificuldade: "Básico",
    objetivo: "Verificar organização temporal e sequência lógica.",
  },
  {
    number: 8,
    area: "Lógica",
    title: "CLASSIFIQUE: ANTIGO OU NOVO",
    enunciado: "Marque X no quadro certo: ANTIGO ou NOVO.",
    descricao: "4 pares de figuras misturadas (vela/lâmpada, cavalo/carro, pedra/faca, fogueira/fogão). Tabela com duas colunas. O aluno marca visualmente.",
    tipo: "Classificação",
    dificuldade: "Intermediário",
    objetivo: "Avaliar capacidade de classificação e raciocínio comparativo.",
  },
  {
    number: 9,
    area: "Coordenação Motora",
    title: "SIGA O PONTILHADO",
    enunciado: "Siga o pontilhado e complete o caminho.",
    descricao: "Linhas retas e curvas pontilhadas levando de um objeto a outro (abelha até flor). Traçado com espessura adequada para lápis. Progressão: retas primeiro, curvas depois.",
    tipo: "Traçado",
    dificuldade: "Básico",
    objetivo: "Avaliar coordenação motora fina e controle do traçado.",
  },
  {
    number: 10,
    area: "Interpretação",
    title: "LEIA E RESPONDA",
    enunciado: "Leia o texto e responda com uma palavra.",
    descricao: "Texto curto de 2 frases: \"O gato é pequeno. Ele gosta de leite.\" Perguntas: 1) O que é pequeno? 2) O que ele gosta? Espaço com linha pontilhada para resposta.",
    tipo: "Interpretação",
    dificuldade: "Intermediário",
    objetivo: "Verificar compreensão textual e interpretação básica.",
  },
];

const tipoBadgeColors: Record<string, string> = {
  Identificação: "bg-primary/15 text-primary",
  Pareamento: "bg-warning/15 text-warning",
  Escrita: "bg-secondary/15 text-secondary",
  Contagem: "bg-primary/15 text-primary",
  Sequência: "bg-warning/15 text-warning",
  Classificação: "bg-accent text-accent-foreground",
  Traçado: "bg-secondary/15 text-secondary",
  Interpretação: "bg-success/15 text-success",
};

const dificuldadeColors: Record<string, string> = {
  Básico: "bg-success/15 text-success",
  Intermediário: "bg-warning/15 text-warning",
  Avançado: "bg-destructive/15 text-destructive",
};

const statusColors: Record<string, string> = {
  "Avaliação pendente": "bg-muted text-muted-foreground",
  "Em geração": "bg-warning/15 text-warning",
  "Avaliação gerada": "bg-accent text-accent-foreground",
  "Em revisão": "bg-secondary/15 text-secondary",
  "Aprovada": "bg-success/15 text-success",
  "Prova final enviada": "bg-success/15 text-success",
};

// ── Component ─────────────────────────────────────────────
export default function AssessmentPage() {
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  const handleFileUpload = () => {
    setUploadedFile("Prova_Final_Lucas_M_Mar2026.pdf");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avaliação Adaptada</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Geração de provas individualizadas por IA
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* ── Student Header ─────────────────────── */}
      <motion.div
        className="kpi-card flex flex-wrap items-center gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
          {mockStudent.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-lg font-bold text-card-foreground">{mockStudent.name}</h2>
          <p className="text-sm text-muted-foreground">
            {mockStudent.age} anos · {mockStudent.grade} · Ano letivo {mockStudent.year}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs font-semibold border-primary/30 text-primary">
            <FileText size={12} /> {mockStudent.materialType}
          </Badge>
          <Badge className="gap-1.5 py-1 px-3 text-xs font-semibold bg-success/15 text-success border-0">
            <CheckCircle2 size={12} /> {mockStudent.status}
          </Badge>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column — Context ──────────────── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Curriculum summary */}
          <motion.div
            className="kpi-card space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-card-foreground">Conteúdo Avaliado</h3>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Nível de Adaptação
              </p>
              <Badge className="bg-secondary/15 text-secondary border-0 text-xs font-semibold">
                Nível {mockCurriculum.adaptationLevel} — {mockCurriculum.adaptationLabel}
              </Badge>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="areas" className="border-border/50">
                <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 hover:no-underline">
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} /> Áreas Avaliadas
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5">
                    {mockCurriculum.areas.map((a) => (
                      <li key={a} className="text-sm text-card-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="goals" className="border-border/50">
                <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 hover:no-underline">
                  <span className="flex items-center gap-1.5">
                    <Target size={13} /> Objetivos Avaliados
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5">
                    {mockCurriculum.goals.map((g) => (
                      <li key={g} className="text-sm text-card-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="strategies" className="border-0">
                <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 hover:no-underline">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb size={13} /> Estratégias
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5">
                    {mockCurriculum.strategies.map((s) => (
                      <li key={s} className="text-sm text-card-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {/* Generation config */}
          <motion.div
            className="kpi-card space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-secondary" />
              <h3 className="text-sm font-bold text-card-foreground">Configuração</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material</span>
                <span className="font-semibold text-card-foreground">{mockStudent.materialType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currículo</span>
                <span className="font-semibold text-card-foreground">v{mockCurriculum.adaptationLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Teórica</span>
                <span className="font-semibold text-card-foreground">v2 (revisada)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questões</span>
                <span className="font-semibold text-card-foreground">10 questões</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles size={16} />
                  </motion.div>
                  Gerando...
                </>
              ) : generated ? (
                <>
                  <RotateCcw size={16} /> Regenerar Avaliação
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Gerar Prova Adaptada
                </>
              )}
            </Button>
          </motion.div>

          {/* Upload prova final */}
          {generated && (
            <motion.div
              className="kpi-card space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2">
                <FileUp size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-card-foreground">Prova Final (Design)</h3>
              </div>

              <p className="text-xs text-muted-foreground">
                Após o setor de design produzir a prova final, faça o upload aqui para registro oficial.
              </p>

              {uploadedFile ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-card-foreground truncate">{uploadedFile}</p>
                    <p className="text-[10px] text-muted-foreground">Enviado em 12/03/2026</p>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2 border-dashed border-2"
                  onClick={handleFileUpload}
                >
                  <Upload size={14} /> Upload da Prova Final
                </Button>
              )}
            </motion.div>
          )}

          {/* Version history */}
          {generated && (
            <motion.div
              className="kpi-card space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center justify-between w-full"
              >
                <span className="flex items-center gap-2">
                  <History size={18} className="text-primary" />
                  <h3 className="text-sm font-bold text-card-foreground">Histórico</h3>
                </span>
                {showVersions ? (
                  <ChevronUp size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {showVersions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {mockVersions.map((v) => (
                      <div
                        key={v.version}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm"
                      >
                        <div>
                          <span className="font-semibold text-card-foreground">v{v.version}</span>
                          <span className="text-muted-foreground ml-2">{v.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{v.date}</span>
                          <Badge className={`text-[10px] border-0 ${statusColors[v.status] || "bg-muted text-muted-foreground"}`}>
                            {v.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── Right column — Result ──────────────── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                className="kpi-card flex flex-col items-center justify-center py-24 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                  transition={{
                    rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                    scale: { repeat: Infinity, duration: 1.5 },
                  }}
                  className="w-16 h-16 rounded-2xl bg-secondary/15 flex items-center justify-center"
                >
                  <Sparkles size={28} className="text-secondary" />
                </motion.div>
                <p className="text-sm font-semibold text-card-foreground">Gerando avaliação adaptada...</p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  A IA está criando questões personalizadas baseadas no currículo e na base teórica de {mockStudent.name}.
                </p>
              </motion.div>
            ) : generated ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tabs defaultValue="questoes" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="questoes" className="gap-2 text-sm font-semibold">
                      <ClipboardCheck size={15} /> Questões da Prova
                    </TabsTrigger>
                    <TabsTrigger value="orientacoes" className="gap-2 text-sm font-semibold">
                      <PenTool size={15} /> Orientações para Design
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Tab: Questões ── */}
                  <TabsContent value="questoes">
                    <div className="kpi-card space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck size={18} className="text-primary" />
                          <h3 className="text-sm font-bold text-card-foreground">Avaliação Adaptada</h3>
                          <Badge className="bg-success/15 text-success border-0 text-[10px]">10 questões</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <Save size={14} /> Salvar
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <FileDown size={14} /> PDF
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <Download size={14} /> DOCX
                          </Button>
                        </div>
                      </div>

                      {/* Assessment header */}
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <h4 className="text-base font-bold text-card-foreground flex items-center gap-2">
                          📝 Avaliação Pedagógica Adaptada — {mockStudent.name}
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span>
                            <strong className="text-card-foreground">Série:</strong> {mockStudent.grade}
                          </span>
                          <span>
                            <strong className="text-card-foreground">Nível:</strong> {mockCurriculum.adaptationLabel}
                          </span>
                          <span>
                            <strong className="text-card-foreground">Data:</strong> 12/03/2026
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          <strong className="text-card-foreground">Instrução geral:</strong> Responda cada questão com calma. Você pode pedir ajuda se precisar. Não há respostas erradas — o importante é mostrar o que você já sabe!
                        </p>
                      </div>

                      {/* Questions */}
                      <div className="max-h-[650px] overflow-y-auto space-y-3 pr-1">
                        {mockAssessmentQuestions.map((q, idx) => (
                          <motion.div
                            key={q.number}
                            className="rounded-xl border border-border/60 bg-background overflow-hidden"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                          >
                            {/* Question header */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border/40">
                              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                                {q.number}
                              </span>
                              <h4 className="text-sm font-bold text-card-foreground flex-1">{q.title}</h4>
                              <Badge className={`text-[10px] border-0 font-semibold ${tipoBadgeColors[q.tipo] || "bg-muted text-muted-foreground"}`}>
                                {q.tipo}
                              </Badge>
                              <Badge className={`text-[10px] border-0 font-semibold ${dificuldadeColors[q.dificuldade] || "bg-muted text-muted-foreground"}`}>
                                {q.dificuldade}
                              </Badge>
                            </div>

                            <div className="p-4 space-y-3">
                              {/* Area tag */}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                                  {q.area}
                                </Badge>
                              </div>

                              {/* Enunciado */}
                              <div className="rounded-lg bg-secondary/8 border border-secondary/20 p-3">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-secondary mb-1">
                                  📋 Enunciado
                                </p>
                                <p className="text-sm text-card-foreground font-medium leading-relaxed whitespace-pre-line">
                                  {q.enunciado}
                                </p>
                              </div>

                              {/* Descrição */}
                              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                                  📝 Descrição / Orientação
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                  {q.descricao}
                                </p>
                              </div>

                              {/* Objetivo */}
                              <div className="rounded-lg bg-success/5 border border-success/15 p-3">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-success mb-1">
                                  🎯 Objetivo Pedagógico
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {q.objetivo}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── Tab: Orientações ── */}
                  <TabsContent value="orientacoes">
                    <div className="kpi-card space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <PenTool size={18} className="text-secondary" />
                          <h3 className="text-sm font-bold text-card-foreground">Orientações para o Setor de Design</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <FileDown size={14} /> PDF
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <Download size={14} /> DOCX
                          </Button>
                        </div>
                      </div>

                      <div className="p-5 rounded-lg bg-muted/30 border border-border/50 space-y-6 max-h-[700px] overflow-y-auto">
                        {/* Instrução geral */}
                        <div>
                          <h4 className="text-sm font-bold text-card-foreground mb-2 flex items-center gap-2">
                            🎨 Diretrizes Gerais de Diagramação
                          </h4>
                          <ul className="space-y-2">
                            {[
                              "Fonte: Bastão maiúscula (Arial ou similar), tamanho mínimo 18pt para enunciados.",
                              "Máximo de 2 questões por página para evitar sobrecarga visual.",
                              "Fundo branco, sem texturas ou padrões de fundo.",
                              "Contornos grossos e bem definidos em todas as ilustrações.",
                              "Imagens coloridas, com fundo limpo e alto contraste.",
                              "Espaçamento amplo entre elementos — mínimo 1,5cm entre questões.",
                              "Incluir área para nome do aluno e data no topo de cada página.",
                              "Numerar questões com destaque visual (número em círculo colorido).",
                            ].map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <hr className="border-border/50" />

                        {/* Instruções por tipo */}
                        <div>
                          <h4 className="text-sm font-bold text-card-foreground mb-2 flex items-center gap-2">
                            📐 Orientações por Tipo de Questão
                          </h4>
                          <div className="space-y-3">
                            {[
                              {
                                tipo: "Identificação / Circular",
                                orientacao: "Elementos bem espaçados para facilitar o ato motor de circular. Tamanho mínimo de cada elemento: 2cm x 2cm.",
                              },
                              {
                                tipo: "Pareamento / Ligação",
                                orientacao: "Usar pontilhado guia entre colunas. Espaçamento vertical de 2cm entre itens. Linhas guia com cor cinza clara.",
                              },
                              {
                                tipo: "Escrita / Completar",
                                orientacao: "Linha pontilhada para escrita com altura de 1,5cm. Incluir modelo de letra acima quando possível.",
                              },
                              {
                                tipo: "Contagem",
                                orientacao: "Objetos alinhados horizontalmente, com tamanho uniforme. Espaço para escrita do número ao lado, com modelo pontilhado.",
                              },
                              {
                                tipo: "Sequência",
                                orientacao: "Quadros com bordas bem definidas, numeração clara. Seta indicativa de direção da sequência.",
                              },
                              {
                                tipo: "Classificação",
                                orientacao: "Tabela com colunas largas, cabeçalho colorido. Espaço amplo em cada célula para marcação.",
                              },
                            ].map((item, i) => (
                              <div key={i} className="p-3 rounded-lg bg-background border border-border/40">
                                <p className="text-xs font-bold text-card-foreground mb-1">{item.tipo}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.orientacao}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <hr className="border-border/50" />

                        {/* Observações */}
                        <div>
                          <h4 className="text-sm font-bold text-card-foreground mb-2 flex items-center gap-2">
                            📌 Observações para Aplicação
                          </h4>
                          <ul className="space-y-2">
                            {[
                              "A avaliação deve ser aplicada com mediação de terapeuta ou professor de apoio.",
                              "Cada questão deve ser apresentada individualmente, respeitando o tempo do aluno.",
                              "Se necessário, ler o enunciado em voz alta para o aluno.",
                              "Não cronometrar — o objetivo é verificar aprendizagem, não velocidade.",
                              "Registrar observações comportamentais durante a aplicação.",
                              "Material deve ser impresso em A4 e, se possível, plastificado.",
                            ].map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="kpi-card flex flex-col items-center justify-center py-24 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <ClipboardCheck size={28} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-card-foreground">
                  Nenhuma avaliação gerada ainda
                </p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  Clique em "Gerar Prova Adaptada" para criar uma avaliação personalizada com base no currículo e nas atividades do aluno.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
