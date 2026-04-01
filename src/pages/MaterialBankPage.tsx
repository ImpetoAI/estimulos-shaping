import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Plus, ExternalLink, FileText, BookOpen, Calculator,
  Globe, Microscope, Hand, MessageCircle, ChevronDown, X, Upload,
  Library, Layers, GraduationCap, User, Calendar, Link2, Eye,
  Lightbulb, Repeat2, Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockActivities = [
  { id: 1, title: "Caça-Letras do Alfabeto", description: "Atividade de identificação visual de letras em grid simplificado.", subject: "Português", skillArea: "Alfabetização", ageRange: "6-8", grade: "1º ano", adaptationLevel: 3, activityType: "Identificação de letras", author: "Coord. Maria", canvaLink: "https://canva.com/design/example1", hasPdf: true, createdAt: "2025-12-10", reuseCount: 5 },
  { id: 2, title: "Pareamento Número-Quantidade", description: "Ligar números de 1 a 10 a conjuntos de objetos ilustrados.", subject: "Matemática", skillArea: "Contagem", ageRange: "6-9", grade: "2º ano", adaptationLevel: 2, activityType: "Associação número-quantidade", author: "Coord. Ana", canvaLink: "https://canva.com/design/example2", hasPdf: true, createdAt: "2025-11-28", reuseCount: 8 },
  { id: 3, title: "Sequência Lógica – Rotina Diária", description: "Organizar 4 imagens de rotina na ordem correta.", subject: "Habilidades Sociais", skillArea: "Organização", ageRange: "5-8", grade: "1º ano", adaptationLevel: 4, activityType: "Sequência lógica", author: "Coord. Paulo", canvaLink: "", hasPdf: false, createdAt: "2026-01-15", reuseCount: 3 },
  { id: 4, title: "Completar Palavras com Vogais", description: "Preencher vogais que faltam em palavras do cotidiano com apoio de imagem.", subject: "Português", skillArea: "Escrita", ageRange: "7-10", grade: "3º ano", adaptationLevel: 2, activityType: "Completar palavras", author: "Coord. Maria", canvaLink: "https://canva.com/design/example4", hasPdf: true, createdAt: "2026-02-03", reuseCount: 12 },
  { id: 5, title: "Antigo x Atual – História", description: "Classificar objetos como antigos ou atuais usando quadro visual.", subject: "História", skillArea: "Interpretação", ageRange: "8-11", grade: "3º ano", adaptationLevel: 3, activityType: "Associação imagem-palavra", author: "Coord. Ana", canvaLink: "https://canva.com/design/example5", hasPdf: true, createdAt: "2026-02-20", reuseCount: 2 },
  { id: 6, title: "Coordenação Motora – Traçados Curvos", description: "Cobrir linhas curvas pontilhadas com lápis grosso.", subject: "Coordenação Motora", skillArea: "Coordenação motora", ageRange: "5-7", grade: "Pré", adaptationLevel: 5, activityType: "Atividades motoras", author: "Coord. Paulo", canvaLink: "", hasPdf: false, createdAt: "2026-03-01", reuseCount: 0 },
];

const mockStudentMaterials = [
  { id: 1, studentName: "Lucas Mendes", grade: "4º ano", age: 9, materialTitle: "Apostila Adaptada – Arqueologia", materialType: "Apostila adaptada", canvaLink: "https://canva.com/design/apostila-lucas", hasPdf: true, activitiesUsed: [1, 4, 5], createdBy: "Designer Carla", createdAt: "2026-03-05" },
  { id: 2, studentName: "Ana P.", grade: "1º ano", age: 7, materialTitle: "Atividades Complementares – Alfabetização", materialType: "Atividades complementares", canvaLink: "https://canva.com/design/ativ-ana", hasPdf: false, activitiesUsed: [1, 3], createdBy: "Designer João", createdAt: "2026-03-08" },
];

const subjects = ["Todos", "Português", "Matemática", "História", "Geografia", "Ciências", "Habilidades Sociais", "Coordenação Motora"];
const adaptationLevels = ["Todos", "1 — Leve", "2 — Moderado", "3 — Significativo", "4 — Paralelo", "5 — Funcional"];
const activityTypes = ["Todos", "Identificação de letras", "Associação imagem-palavra", "Completar palavras", "Ligar colunas", "Sequência lógica", "Contagem", "Associação número-quantidade", "Atividades motoras", "Interpretação de imagem"];

const subjectIcons: Record<string, React.ReactNode> = {
  "Português": <BookOpen size={14} />, "Matemática": <Calculator size={14} />, "História": <Globe size={14} />,
  "Geografia": <Globe size={14} />, "Ciências": <Microscope size={14} />, "Habilidades Sociais": <MessageCircle size={14} />,
  "Coordenação Motora": <Hand size={14} />,
};

const adaptationColors: Record<number, string> = {
  1: "bg-success/15 text-success", 2: "bg-info/15 text-info", 3: "bg-warning/15 text-warning",
  4: "bg-orange-100 text-orange-700", 5: "bg-destructive/15 text-destructive",
};

// ===== REUSE SUGGESTION COMPONENT =====
function ReuseSuggestionBanner({ onDismiss }: { onDismiss: () => void }) {
  const suggestions = mockActivities.filter(a => a.reuseCount >= 5).slice(0, 3);
  if (suggestions.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-card-foreground">Atividades semelhantes encontradas na biblioteca</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Considere reutilizar ou adaptar estas atividades já existentes:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestions.map(s => (
                    <Badge key={s.id} variant="outline" className="gap-1.5 text-xs cursor-pointer hover:bg-accent">
                      <Repeat2 size={10} /> {s.title} ({s.reuseCount}x usado)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MaterialBankPage() {
  const [activeTab, setActiveTab] = useState("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showReuseSuggestion, setShowReuseSuggestion] = useState(true);

  const filteredActivities = mockActivities.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = selectedSubject === "Todos" || a.subject === selectedSubject;
    const matchLevel = selectedLevel === "Todos" || a.adaptationLevel === parseInt(selectedLevel.charAt(0));
    const matchType = selectedType === "Todos" || a.activityType === selectedType;
    return matchSearch && matchSubject && matchLevel && matchType;
  });

  const hasActiveFilters = selectedSubject !== "Todos" || selectedLevel !== "Todos" || selectedType !== "Todos" || searchTerm !== "";
  const totalReuses = mockActivities.reduce((sum, a) => sum + a.reuseCount, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library size={24} className="text-primary" /> Biblioteca Pedagógica Inteligente
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Repositório central com metadados estruturados e sugestão de reutilização</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-2">
            <Layers size={14} /> <strong className="text-foreground">{mockActivities.length}</strong> atividades
          </div>
          <div className="flex items-center gap-1 bg-success/10 rounded-lg px-3 py-2 text-success">
            <Repeat2 size={14} /> <strong>{totalReuses}</strong> reutilizações
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="library" className="flex items-center gap-1.5"><Library size={14} /> Biblioteca de Atividades</TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-1.5"><FileText size={14} /> Material Final do Aluno</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-5 mt-4">
          {/* Reuse suggestion */}
          {showReuseSuggestion && showNewActivity && <ReuseSuggestionBanner onDismiss={() => setShowReuseSuggestion(false)} />}

          {/* Search + Filters */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Buscar atividade por título, descrição ou habilidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <button onClick={() => { setShowNewActivity(true); setShowReuseSuggestion(true); }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors">
                <Plus size={16} /> Nova Atividade
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <FilterSelect label="Disciplina" value={selectedSubject} options={subjects} onChange={setSelectedSubject} />
              <FilterSelect label="Nível Adaptação" value={selectedLevel} options={adaptationLevels} onChange={setSelectedLevel} />
              <FilterSelect label="Tipo de Atividade" value={selectedType} options={activityTypes} onChange={setSelectedType} />
              {hasActiveFilters && (
                <button onClick={() => { setSelectedSubject("Todos"); setSelectedLevel("Todos"); setSelectedType("Todos"); setSearchTerm(""); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors self-end mb-1">
                  <X size={14} /> Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{filteredActivities.length} atividade(s) encontrada(s)</p>
            <AnimatePresence>
              {filteredActivities.map((activity, i) => (
                <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-card-foreground">{activity.title}</h3>
                        <Badge variant="outline" className="text-[10px] gap-1">{subjectIcons[activity.subject]} {activity.subject}</Badge>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${adaptationColors[activity.adaptationLevel]}`}>Nível {activity.adaptationLevel}</span>
                        {activity.reuseCount > 0 && (
                          <Badge variant="outline" className="text-[10px] gap-1 text-success border-success/30">
                            <Repeat2 size={10} /> {activity.reuseCount}x reutilizada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><GraduationCap size={12} /> {activity.grade}</span>
                        <span className="flex items-center gap-1"><User size={12} /> {activity.ageRange} anos</span>
                        <span className="flex items-center gap-1"><Layers size={12} /> {activity.activityType}</span>
                        <span className="flex items-center gap-1"><BookOpen size={12} /> {activity.skillArea}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {activity.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activity.canvaLink && (
                        <a href={activity.canvaLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><Link2 size={14} /> Canva</a>
                      )}
                      {activity.hasPdf && (
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><FileText size={14} /> PDF</button>
                      )}
                      <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-muted text-foreground rounded-lg hover:bg-accent transition-colors"><Eye size={14} /> Abrir</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredActivities.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma atividade encontrada.</div>
            )}
          </div>

          <AnimatePresence>{showNewActivity && <NewActivityModal onClose={() => setShowNewActivity(false)} />}</AnimatePresence>
        </TabsContent>

        <TabsContent value="materials" className="space-y-5 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{mockStudentMaterials.length} material(is)</p>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors">
              <Plus size={16} /> Registrar Material Final
            </button>
          </div>
          <div className="space-y-3">
            {mockStudentMaterials.map((mat, i) => (
              <motion.div key={mat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-card-foreground">{mat.materialTitle}</h3>
                      <Badge variant="outline" className="text-[10px]">{mat.materialType}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User size={12} /> {mat.studentName}</span>
                      <span className="flex items-center gap-1"><GraduationCap size={12} /> {mat.grade} · {mat.age} anos</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {mat.createdAt}</span>
                      <span className="flex items-center gap-1"><Layers size={12} /> {mat.activitiesUsed.length} atividades</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {mat.canvaLink && <a href={mat.canvaLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><Link2 size={14} /> Canva</a>}
                    {mat.hasPdf ? <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><FileText size={14} /> PDF</button>
                      : <button className="flex items-center gap-1 text-xs text-warning hover:text-warning"><Upload size={14} /> Enviar PDF</button>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer">
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function NewActivityModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-card-foreground">Nova Atividade</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {/* Reuse suggestion inline */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground"><strong className="text-card-foreground">Dica:</strong> Verifique a biblioteca antes — atividades semelhantes podem ser adaptadas.</p>
            </div>
          </CardContent>
        </Card>

        <FormField label="Título da atividade" placeholder="Ex: Caça-Letras do Alfabeto" />
        <FormField label="Descrição pedagógica" placeholder="Descreva a atividade..." textarea />
        <FormField label="Habilidade pedagógica" placeholder="Ex: Alfabetização, Contagem..." />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Disciplina" options={["Português", "Matemática", "História", "Geografia", "Ciências", "Habilidades Sociais", "Coordenação Motora"]} />
          <FormSelect label="Nível de Adaptação" options={["1 — Leve", "2 — Moderado", "3 — Significativo", "4 — Paralelo", "5 — Funcional"]} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Faixa etária" placeholder="Ex: 6-8" />
          <FormField label="Série" placeholder="Ex: 1º ano" />
        </div>
        <FormSelect label="Tipo de Atividade" options={activityTypes.filter(t => t !== "Todos")} />
        <FormField label="Link do Canva" placeholder="https://canva.com/design/..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onClose} className="gap-1.5"><Plus size={14} /> Cadastrar Atividade</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, placeholder, textarea }: { label: string; placeholder: string; textarea?: boolean }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</label>
      <Tag placeholder={placeholder} rows={textarea ? 3 : undefined}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y transition-shadow" />
    </div>
  );
}

function FormSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</label>
      <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
        <option value="">Selecione</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
