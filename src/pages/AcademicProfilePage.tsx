import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, BookOpen, PenTool, Calculator, Grid3X3, Hand, FileText, MessageCircle, StickyNote,
  ChevronRight, ChevronLeft, Check, Camera, School, Phone, MapPin, Heart, Shield, Users,
  Calendar, Zap, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import MaterialConfigTab from "@/components/forms/MaterialConfigTab";

// ===== WIZARD PHASES =====
const wizardPhases = [
  { id: "identification", label: "Identificação", icon: User },
  { id: "profile", label: "Perfil Acadêmico", icon: BookOpen },
  { id: "material", label: "Solicitação de Material", icon: FileText },
];

const profileSteps = [
  { id: 1, label: "Tipo de Letra", icon: PenTool },
  { id: 2, label: "Alfabetização", icon: BookOpen },
  { id: 3, label: "Escrita", icon: PenTool },
  { id: 4, label: "Matemática", icon: Calculator },
  { id: 5, label: "Associação", icon: Grid3X3 },
  { id: 6, label: "Coord. Motora", icon: Hand },
  { id: 7, label: "Compreensão", icon: FileText },
  { id: 8, label: "Comunicação", icon: MessageCircle },
  { id: 9, label: "Observações", icon: StickyNote },
];

// ===== ADAPTATION LEVEL CALCULATOR =====
interface ProfileScores {
  leitura: number;
  escrita: number;
  matematica: number;
  logica: number;
  autonomia: number;
}

function calculateAdaptationLevel(scores: ProfileScores): { level: number; label: string; description: string; color: string } {
  const avg = (scores.leitura + scores.escrita + scores.matematica + scores.logica + scores.autonomia) / 5;
  if (avg >= 4) return { level: 1, label: "Leve", description: "Adaptações mínimas, aluno próximo do nível da turma", color: "bg-success/15 text-success" };
  if (avg >= 3) return { level: 2, label: "Moderado", description: "Simplificação de conteúdo e apoio visual recomendados", color: "bg-info/15 text-info" };
  if (avg >= 2) return { level: 3, label: "Significativo", description: "Currículo paralelo com atividades funcionais e concretas", color: "bg-warning/15 text-warning" };
  if (avg >= 1) return { level: 4, label: "Paralelo", description: "Conteúdo predominantemente funcional e vivencial", color: "bg-orange-100 text-orange-700" };
  return { level: 5, label: "Funcional", description: "Foco em habilidades de vida diária e comunicação", color: "bg-destructive/15 text-destructive" };
}

export default function AcademicProfilePage() {
  const [wizardPhase, setWizardPhase] = useState(0); // 0=identification, 1=profile, 2=material
  const [currentStep, setCurrentStep] = useState(1);
  const [profileScores, setProfileScores] = useState<ProfileScores>({
    leitura: 2, escrita: 2, matematica: 3, logica: 2, autonomia: 3,
  });
  const [adaptationAccepted, setAdaptationAccepted] = useState(false);

  const suggestedLevel = calculateAdaptationLevel(profileScores);
  const totalSteps = wizardPhase === 0 ? 1 : wizardPhase === 1 ? profileSteps.length : 1;
  const overallProgress = wizardPhase === 0 ? 10 : wizardPhase === 1 ? 10 + (currentStep / profileSteps.length) * 70 : 90;

  const handleNextPhase = () => {
    if (wizardPhase < 2) {
      setWizardPhase(wizardPhase + 1);
      setCurrentStep(1);
    }
  };

  const handlePrevPhase = () => {
    if (wizardPhase > 0) {
      setWizardPhase(wizardPhase - 1);
      setCurrentStep(1);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wizard de Diagnóstico</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Fluxo unificado: Identificação → Perfil Acadêmico → Solicitação de Material
        </p>
      </div>

      {/* ===== WIZARD PHASE INDICATOR ===== */}
      <div className="flex items-center gap-2 bg-card rounded-xl border border-border p-4">
        {wizardPhases.map((phase, i) => {
          const active = i === wizardPhase;
          const done = i < wizardPhase;
          return (
            <div key={phase.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => { setWizardPhase(i); setCurrentStep(1); }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 ${
                  active ? "bg-primary text-primary-foreground shadow-sm" :
                  done ? "bg-success/10 text-success" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? "bg-primary-foreground/20" : done ? "bg-success/20" : "bg-muted-foreground/20"
                }`}>
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <phase.icon size={16} />
                <span>{phase.label}</span>
              </button>
              {i < wizardPhases.length - 1 && (
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-3">
        <Progress value={overallProgress} className="flex-1 h-2" />
        <span className="text-xs font-semibold text-muted-foreground">{Math.round(overallProgress)}%</span>
      </div>

      {/* ===== PHASE CONTENT ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wizardPhase}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {wizardPhase === 0 && (
            <IdentificationPhase onNext={handleNextPhase} />
          )}

          {wizardPhase === 1 && (
            <ProfilePhase
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              totalSteps={profileSteps.length}
              profileScores={profileScores}
              setProfileScores={setProfileScores}
              suggestedLevel={suggestedLevel}
              adaptationAccepted={adaptationAccepted}
              setAdaptationAccepted={setAdaptationAccepted}
              onNext={handleNextPhase}
              onPrev={handlePrevPhase}
            />
          )}

          {wizardPhase === 2 && (
            <div className="space-y-4">
              <MaterialConfigTab />
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrevPhase} className="gap-1.5">
                  <ChevronLeft size={16} /> Voltar ao Perfil
                </Button>
                <Button className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
                  <Check size={16} /> Finalizar Diagnóstico
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ===== PHASE 1: IDENTIFICATION =====
function IdentificationPhase({ onNext }: { onNext: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold">Identificação do Paciente</h2>
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <label className="cursor-pointer">
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
                {preview ? (
                  <img src={preview} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Camera size={24} />
                    <span className="text-[10px] font-medium">Foto</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {/* Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Nome Completo", placeholder: "Nome do paciente", icon: User },
              { label: "Data de Nascimento", placeholder: "dd/mm/aaaa", icon: Calendar },
              { label: "Escola", placeholder: "Nome da escola", icon: School },
              { label: "Série", placeholder: "Ex: 4º ano", icon: School },
              { label: "Responsáveis", placeholder: "Nomes dos responsáveis", icon: Users },
              { label: "Contato", placeholder: "(00) 00000-0000", icon: Phone },
              { label: "Cidade/UF", placeholder: "Ex: Palmas - TO", icon: MapPin },
              { label: "Coordenador", placeholder: "Nome do coordenador", icon: Shield },
            ].map((field, i) => (
              <div key={i}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder={field.placeholder} className="pl-9" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onNext} className="gap-1.5">
            Avançar para Perfil Acadêmico <ChevronRight size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== PHASE 2: PROFILE =====
function ProfilePhase({ currentStep, setCurrentStep, totalSteps, profileScores, setProfileScores, suggestedLevel, adaptationAccepted, setAdaptationAccepted, onNext, onPrev }: {
  currentStep: number; setCurrentStep: (s: number) => void; totalSteps: number;
  profileScores: ProfileScores; setProfileScores: (s: ProfileScores) => void;
  suggestedLevel: ReturnType<typeof calculateAdaptationLevel>;
  adaptationAccepted: boolean; setAdaptationAccepted: (v: boolean) => void;
  onNext: () => void; onPrev: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* Step sidebar */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Blocos do Perfil</p>
            <div className="space-y-1">
              {profileSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentStep === step.id ? "bg-primary text-primary-foreground" :
                    currentStep > step.id ? "text-success" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === step.id ? "bg-primary-foreground/20" :
                    currentStep > step.id ? "bg-success/20" : "bg-muted"
                  }`}>
                    {currentStep > step.id ? <Check size={10} /> : step.id}
                  </div>
                  <span className="truncate">{step.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ===== ADAPTATION LEVEL CALCULATOR ===== */}
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <p className="text-xs font-bold text-card-foreground uppercase tracking-wider">Nível Sugerido</p>
            </div>

            {/* Score sliders */}
            {[
              { key: "leitura" as const, label: "Leitura" },
              { key: "escrita" as const, label: "Escrita" },
              { key: "matematica" as const, label: "Matemática" },
              { key: "logica" as const, label: "Lógica" },
              { key: "autonomia" as const, label: "Autonomia" },
            ].map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{label}</span>
                  <span>{profileScores[key]}/5</span>
                </div>
                <input
                  type="range"
                  min={0} max={5} step={1}
                  value={profileScores[key]}
                  onChange={e => setProfileScores({ ...profileScores, [key]: Number(e.target.value) })}
                  className="w-full h-1.5 accent-primary"
                />
              </div>
            ))}

            <Separator />

            {/* Result */}
            <div className={`p-3 rounded-xl text-center ${suggestedLevel.color}`}>
              <p className="text-lg font-bold">Nível {suggestedLevel.level}</p>
              <p className="text-xs font-semibold">{suggestedLevel.label}</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{suggestedLevel.description}</p>

            <Button
              size="sm"
              variant={adaptationAccepted ? "default" : "outline"}
              className="w-full gap-1.5 text-xs"
              onClick={() => setAdaptationAccepted(!adaptationAccepted)}
            >
              {adaptationAccepted ? <Check size={12} /> : <Sparkles size={12} />}
              {adaptationAccepted ? "Nível aceito" : "Aceitar sugestão"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Form content */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Bloco {currentStep} de {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <StepContent step={currentStep} />
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => currentStep === 1 ? onPrev() : setCurrentStep(Math.max(1, currentStep - 1))} className="gap-1.5">
              <ChevronLeft size={16} /> {currentStep === 1 ? "Voltar à Identificação" : "Anterior"}
            </Button>
            <Button onClick={() => currentStep === totalSteps ? onNext() : setCurrentStep(Math.min(totalSteps, currentStep + 1))} className="gap-1.5">
              {currentStep === totalSteps ? "Avançar para Solicitação" : "Próximo"} <ChevronRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Step Content ---
function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1: return <FontPreferenceBlock />;
    case 2: return <LiteracyBlock />;
    case 3: return <WritingBlock />;
    case 4: return <MathBlock />;
    case 5: return <AssociationBlock />;
    case 6: return <MotorBlock />;
    case 7: return <ComprehensionBlock />;
    case 8: return <CommunicationBlock />;
    case 9: return <ObservationsBlock />;
    default: return null;
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-card-foreground mb-1.5">{children}</label>;
}

function TextInput({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input type="text" placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow" />
    </div>
  );
}

function CheckboxGroup({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors text-sm">
            <input type="checkbox" className="mt-0.5 accent-primary" />
            <span className="text-card-foreground">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors text-sm">
            <input type="radio" name={label} className="accent-primary" />
            <span className="text-card-foreground">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FontPreferenceBlock() {
  const rows = ["Cursiva", "Bastão Maiúscula", "Bastão Imprensa"];
  const cols = ["Pequeno", "Médio", "Grande", "Não se aplica"];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><PenTool size={20} className="text-primary" /> Preferência de Tipo de Letra</h2>
      <p className="text-sm text-muted-foreground">Selecione o formato tipográfico adequado para os materiais.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="p-2 text-left font-medium text-muted-foreground"></th>{cols.map(c => <th key={c} className="p-2 text-center font-medium text-muted-foreground">{c}</th>)}</tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r} className="border-t border-border">
              <td className="p-2 font-medium text-card-foreground">{r}</td>
              {cols.map(c => <td key={c} className="p-2 text-center"><input type="radio" name={r} className="accent-primary" /></td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function LiteracyBlock() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen size={20} className="text-primary" /> Alfabetização e Letramento</h2>
      <CheckboxGroup label="Selecione as habilidades observadas:" options={[
        "Conhece todo o alfabeto", "Conhece as vogais", "Não identifica letras",
        "Ordena letras para formar palavras", "Lê sílabas simples", "Lê sílabas complexas",
        "Nomeia objetos cotidianos", "Consegue pegar itens quando solicitado (se não verbal)",
        "Relaciona palavras com figuras", "Liga palavras aos seus significados"
      ]} />
    </div>
  );
}

function WritingBlock() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><PenTool size={20} className="text-primary" /> Escrita</h2>
      <RadioGroup label="Capacidade de cópia" options={["Não escreve", "Copia 1 palavra por vez", "Copia 1 frase curta", "Copia 1 texto curto", "Reescreve textos", "Produção de texto livre", "Produção de texto dirigida"]} />
      <CheckboxGroup label="Reconhecimento numérico" options={["Reconhece números de 0 a 10", "Reconhece números de 11 a 20", "Reconhece números de 20 a 50", "Reconhece números de 50 a 100", "Reconhece números acima de 100"]} />
    </div>
  );
}

function MathBlock() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><Calculator size={20} className="text-primary" /> Matemática e Lógica</h2>
      <RadioGroup label="Contagem de objetos (até)" options={["0", "10", "20", "40", "60", "80", "100"]} />
      <RadioGroup label="Escrita de quantidades" options={["Independente", "Com pontilhado", "Garatuja", "Não escreve"]} />
      <RadioGroup label="Necessita quadro de valor?" options={["Sim", "Não", "Não realiza operações"]} />
      <RadioGroup label="Resolve problemas" options={["Com ilustração", "Sem ilustração", "Não resolve problemas"]} />
      <RadioGroup label="Reconhece cédulas de dinheiro" options={["Sim", "Não", "Não apresenta reconhecimento"]} />
    </div>
  );
}

function AssociationBlock() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><Grid3X3 size={20} className="text-primary" /> Associação e Organização</h2>
      <CheckboxGroup label="Liga colunas" options={["Palavra x Figura", "Pergunta x Resposta", "Igual x Igual", "Não faz associação"]} />
      <RadioGroup label="Sequência lógica (antes e depois)" options={["Sim", "Não", "Não faz associação"]} />
      <RadioGroup label="Completa padrões" options={["Sim", "Não", "Não completa padrões"]} />
      <RadioGroup label="Classificação" options={["Sim", "Não", "Não classifica objetos"]} />
    </div>
  );
}

function MotorBlock() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><Hand size={20} className="text-primary" /> Coordenação Motora e Expressão</h2>
      <RadioGroup label="Pinta dentro do contorno?" options={["Sim", "Não", "Não pinta"]} />
      <RadioGroup label="Coloração por legenda" options={["Sim", "Não", "Não colore conforme legenda"]} />
      <CheckboxGroup label="Construções com materiais" options={["Massinha", "Colagem", "Tangram", "Areia cinética", "Slime", "Argila", "Orbeez", "Esponjas", "Blocos de montar", "Papel picado", "Cartões com cadarço", "Pompons"]} />
      <RadioGroup label="Traçado de linhas" options={["Retas", "Curvas", "Pontilhadas", "Não realiza"]} />
    </div>
  );
}

function ComprehensionBlock() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-primary" /> Compreensão Textual</h2>
      <RadioGroup label="Responde questões" options={["Dissertativas", "Objetivas", "Ambas"]} />
      <RadioGroup label="Escala de escrita" options={["Até 4 frases", "Até 2 parágrafos", "Mais de 3 parágrafos", "Não escreve"]} />
      <CheckboxGroup label="Interpretação" options={["Assinala imagem correta", "Organiza sequência de eventos", "Ilustra texto", "Interpreta imagem", "Verdadeiro ou falso", "Ainda não demonstra compreensão"]} />
    </div>
  );
}

function CommunicationBlock() {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><MessageCircle size={20} className="text-primary" /> Comunicação e Habilidades Sociais</h2>
      <CheckboxGroup label="Habilidades observadas" options={["Expressa preferências", "Completa frases", "Seleciona figuras para sentimentos", "Quadros de rotina", "Histórias sociais", "Diálogos com balões", "Baixa reciprocidade emocional"]} />
    </div>
  );
}

function ObservationsBlock() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><StickyNote size={20} className="text-primary" /> Observações Finais</h2>
      <div>
        <FieldLabel>Orientações específicas do coordenador</FieldLabel>
        <textarea rows={6} placeholder="Descreva observações relevantes sobre o paciente..." className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y transition-shadow" />
      </div>
    </div>
  );
}
