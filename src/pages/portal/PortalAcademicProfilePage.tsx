import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Copy, Save, Check,
  PenTool, BookOpen, Calculator, Grid3X3, Hand, FileText, MessageCircle, StickyNote, Zap, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/supabase";
import { toast } from "sonner";

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Tipo de Letra", icon: PenTool },
  { label: "Alfabetização", icon: BookOpen },
  { label: "Escrita", icon: PenTool },
  { label: "Matemática", icon: Calculator },
  { label: "Associação", icon: Grid3X3 },
  { label: "Coord. Motora", icon: Hand },
  { label: "Compreensão", icon: FileText },
  { label: "Comunicação", icon: MessageCircle },
  { label: "Observações", icon: StickyNote },
];

const ADAPTATION_LEVELS = [
  { value: 1, label: "Leve", description: "Adaptações mínimas, aluno próximo do nível da turma", color: "bg-success/15 text-success" },
  { value: 2, label: "Moderado", description: "Simplificação de conteúdo e apoio visual recomendados", color: "bg-info/15 text-info" },
  { value: 3, label: "Significativo", description: "Currículo paralelo com atividades funcionais e concretas", color: "bg-warning/15 text-warning" },
  { value: 4, label: "Paralelo", description: "Conteúdo predominantemente funcional e vivencial", color: "bg-orange-100 text-orange-700" },
  { value: 5, label: "Funcional", description: "Foco em habilidades de vida diária e comunicação", color: "bg-destructive/15 text-destructive" },
];

// ─── Score calculation from actual responses ─────────────────────────────────
// Each block's responses are analyzed to derive a 0-5 score per area.
// Higher = more independent/capable. Lower = more support needed.

function calculateScoresFromBlocks(blocks: Record<string, any>): Record<string, number> {
  const scores: Record<string, number> = { leitura: 0, escrita: 0, matematica: 0, logica: 0, autonomia: 0 };

  // Leitura — from alfabetizacao (array of selected skills)
  const alfa = (blocks.alfabetizacao ?? []) as string[];
  const leituraPositive = ["Conhece todo o alfabeto", "Lê sílabas complexas", "Liga palavras aos seus significados", "Relaciona palavras com figuras", "Ordena letras para formar palavras"];
  const leituraBasic = ["Conhece as vogais", "Lê sílabas simples", "Nomeia objetos cotidianos"];
  const leituraHits = alfa.filter(x => leituraPositive.includes(x)).length;
  const leituraBasicHits = alfa.filter(x => leituraBasic.includes(x)).length;
  if (alfa.includes("Não identifica letras")) scores.leitura = 1;
  else if (leituraHits >= 3) scores.leitura = 5;
  else if (leituraHits >= 1) scores.leitura = 4;
  else if (leituraBasicHits >= 2) scores.leitura = 3;
  else if (leituraBasicHits >= 1) scores.leitura = 2;
  else if (alfa.length > 0) scores.leitura = 2;

  // Escrita — from escrita block (radio copia + checkbox numeros)
  const escrita = blocks.escrita ?? {};
  const copiaLevels: Record<string, number> = {
    "Não escreve": 1, "Copia 1 palavra por vez": 2, "Copia 1 frase curta": 3,
    "Copia 1 texto curto": 3, "Reescreve textos": 4,
    "Produção de texto livre": 5, "Produção de texto dirigida": 5,
  };
  scores.escrita = copiaLevels[escrita.copia] ?? 0;
  const numeros = (escrita.numeros ?? []) as string[];
  if (numeros.includes("Reconhece números acima de 100")) scores.escrita = Math.max(scores.escrita, 4);
  else if (numeros.includes("Reconhece números de 50 a 100")) scores.escrita = Math.max(scores.escrita, 3);

  // Matematica — from matematica block
  const mat = blocks.matematica ?? {};
  const contagemOralLevels: Record<string, number> = { "Não conta": 1, "Até 10": 2, "Até 20": 2, "Até 40": 3, "Até 60": 3, "Até 80": 4, "Até 100": 5, "Acima de 100": 5 };
  const seqNumLevels: Record<string, number> = { "Não reconhece": 1, "Até 10": 2, "Até 20": 3, "Até 50": 4, "Até 100": 5 };
  const escritaQtdLevels: Record<string, number> = { "Não escreve": 1, "Garatuja": 1, "Com pontilhado": 2, "Independente": 4 };
  const problemasLevels: Record<string, number> = { "Não resolve problemas": 1, "Com ilustração": 3, "Sem ilustração": 5 };
  const adicao = (mat.adicao ?? []) as string[];
  let adicaoScore = 0;
  if (adicao.includes("Com reserva (vai um)")) adicaoScore = 5;
  else if (adicao.includes("3 termos")) adicaoScore = 4;
  else if (adicao.includes("2 termos")) adicaoScore = 3;
  else if (adicao.includes("1 termo")) adicaoScore = 2;
  const subtracao = (mat.subtracao ?? []) as string[];
  let subtracaoScore = 0;
  if (subtracao.includes("Com empréstimo")) subtracaoScore = 5;
  else if (subtracao.includes("2 termos")) subtracaoScore = 3;
  else if (subtracao.includes("1 termo")) subtracaoScore = 2;
  const matScores = [
    contagemOralLevels[mat.contagem_oral] ?? 0,
    seqNumLevels[mat.sequencia_numerica] ?? 0,
    escritaQtdLevels[mat.escrita_qtd] ?? 0,
    adicaoScore,
    subtracaoScore,
    problemasLevels[mat.problemas] ?? 0,
    mat.cedulas === "Sim" ? 4 : mat.cedulas === "Não" ? 2 : 0,
  ].filter(v => v > 0);
  scores.matematica = matScores.length > 0 ? Math.round(matScores.reduce((a, b) => a + b, 0) / matScores.length) : 0;

  // Logica — from associacao block
  const assoc = blocks.associacao ?? {};
  const ligaColunas = (assoc.liga_colunas ?? []) as string[];
  let logicaScore = 0;
  if (ligaColunas.includes("Não faz associação")) logicaScore = 1;
  else logicaScore = Math.min(5, 2 + ligaColunas.length);
  if (assoc.sequencia === "Sim") logicaScore = Math.max(logicaScore, 3);
  if (assoc.padroes === "Sim") logicaScore = Math.max(logicaScore, 4);
  if (assoc.classificacao === "Sim") logicaScore = Math.max(logicaScore, 3);
  if (assoc.sequencia === "Sim" && assoc.padroes === "Sim" && assoc.classificacao === "Sim") logicaScore = 5;
  scores.logica = logicaScore || 0;

  // Autonomia — from coord_motora + comunicacao + compreensao
  const motor = blocks.coord_motora ?? {};
  const compreensao = blocks.compreensao ?? {};
  const comunicacao = (blocks.comunicacao ?? []) as string[];
  const autoScores: number[] = [];
  const contornoLevels: Record<string, number> = { "Não pinta": 1, "Pinta fora do contorno": 2, "Pinta parcialmente dentro": 3, "Pinta dentro do contorno": 4 };
  if (contornoLevels[motor.contorno]) autoScores.push(contornoLevels[motor.contorno]);
  // Puzzle pieces as motor indicator
  const puzzleLevels: Record<string, number> = { "Não monta": 1, "2 peças": 2, "3 peças": 2, "4 peças": 3, "8 peças": 4, "10+ peças": 5 };
  if (puzzleLevels[motor.quebra_cabeca]) autoScores.push(puzzleLevels[motor.quebra_cabeca]);
  const materiais = (motor.materiais ?? []) as string[];
  if (materiais.length >= 4) autoScores.push(4);
  else if (materiais.length >= 2) autoScores.push(3);
  else if (materiais.length >= 1) autoScores.push(2);
  if (compreensao.questoes === "Ambas") autoScores.push(5);
  else if (compreensao.questoes === "Dissertativas") autoScores.push(4);
  else if (compreensao.questoes === "Objetivas") autoScores.push(3);
  const autoComm = comunicacao.filter(x => !x.includes("Baixa")).length;
  if (autoComm >= 4) autoScores.push(4);
  else if (autoComm >= 2) autoScores.push(3);
  else if (autoComm >= 1) autoScores.push(2);
  if (comunicacao.includes("Baixa reciprocidade emocional")) autoScores.push(1);
  scores.autonomia = autoScores.length > 0 ? Math.round(autoScores.reduce((a, b) => a + b, 0) / autoScores.length) : 0;

  return scores;
}

function calculateLevelFromScores(scores: Record<string, number>): number | null {
  const vals = Object.values(scores).filter(v => v > 0);
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (avg >= 4) return 1;
  if (avg >= 3) return 2;
  if (avg >= 2) return 3;
  if (avg >= 1.5) return 4;
  return 5;
}

// ─── Reusable form components ─────────────────────────────────────────────────
function CheckboxGroup({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{label}</p>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {options.map(opt => (
          <label key={opt} className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
            selected.includes(opt) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}>
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="mt-0.5 accent-primary" />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{label}</p>
      <div className="space-y-1.5">
        {options.map(opt => (
          <label key={opt} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
            value === opt ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}>
            <input type="radio" name={label} checked={value === opt} onChange={() => onChange(opt)} className="accent-primary" />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PortalAcademicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [blocks, setBlocks] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, number>>({ leitura: 0, escrita: 0, matematica: 0, logica: 0, autonomia: 0 });
  const [adaptationLevel, setAdaptationLevel] = useState<number | null>(null);
  const [adaptationAccepted, setAdaptationAccepted] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [currentBimester, setCurrentBimester] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load case + existing profile
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: caseData } = await db
        .from("cases")
        .select("id, current_bimester")
        .eq("student_id", id)
        .eq("academic_year", new Date().getFullYear())
        .eq("status", "active")
        .single();
      if (!caseData) return;
      setCaseId(caseData.id);
      setCurrentBimester(caseData.current_bimester);

      const { data: profile } = await db
        .from("academic_profiles")
        .select("*")
        .eq("case_id", caseData.id)
        .eq("bimester", caseData.current_bimester)
        .maybeSingle();
      if (profile) {
        setProfileId(profile.id);
        setBlocks(profile.blocks ?? {});
        setScores(profile.scores ?? { leitura: 0, escrita: 0, matematica: 0, logica: 0, autonomia: 0 });
        setAdaptationLevel(profile.adaptation_level);
      }
    })();
  }, [id]);

  const updateBlock = useCallback((key: string, value: any) => {
    setBlocks(prev => {
      const next = { ...prev, [key]: value };
      // Recalculate scores from responses
      const newScores = calculateScoresFromBlocks(next);
      setScores(newScores);
      if (!manualOverride) {
        const suggested = calculateLevelFromScores(newScores);
        if (suggested) setAdaptationLevel(suggested);
      }
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => autoSave(next, newScores, adaptationLevel), 3000);
      return next;
    });
  }, [adaptationLevel, manualOverride, caseId, currentBimester, profileId, user]);

  const autoSave = async (b: Record<string, any>, s: Record<string, number>, level: number | null) => {
    if (!caseId || !user) return;
    setSaving(true);
    const payload = { case_id: caseId, bimester: currentBimester, blocks: b, scores: s, adaptation_level: level, filled_by: user.id, filled_via: "portal" as const, completed: false };
    if (profileId) {
      await db.from("academic_profiles").update(payload).eq("id", profileId);
    } else {
      const { data } = await db.from("academic_profiles").insert(payload).select("id").single();
      if (data) setProfileId(data.id);
    }
    setSaving(false);
  };

  const handleCopyPrevious = async () => {
    if (!caseId) return;
    const prevBim = currentBimester - 1;
    if (prevBim < 1) { toast.info("Não há bimestre anterior"); return; }
    const { data } = await db.from("academic_profiles").select("blocks, scores, adaptation_level").eq("case_id", caseId).eq("bimester", prevBim).eq("completed", true).single();
    if (!data) { toast.info("Nenhum perfil concluído no bimestre anterior"); return; }
    setBlocks(data.blocks ?? {});
    setScores(data.scores ?? scores);
    setAdaptationLevel(data.adaptation_level);
    toast.success("Dados copiados do bimestre anterior");
  };

  const handleFinish = async () => {
    if (!caseId || !user || !adaptationLevel) { toast.error("Defina o nível de adaptação"); return; }
    setSubmitting(true);

    // Check previous bimester for adaptation level change
    let adaptationChanged = false;
    if (currentBimester > 1) {
      const { data: prevProfile } = await db
        .from("academic_profiles")
        .select("adaptation_level")
        .eq("case_id", caseId)
        .eq("bimester", currentBimester - 1)
        .eq("completed", true)
        .single();
      if (prevProfile && prevProfile.adaptation_level !== adaptationLevel) {
        adaptationChanged = true;
        await db.from("pendencies").insert({
          case_id: caseId,
          module: "curriculo_adaptado",
          bimester: currentBimester,
          description: `Nível de adaptação mudou de N${prevProfile.adaptation_level} para N${adaptationLevel} — currículo adaptado precisa ser atualizado`,
          status: "pending",
        });
      }
    }

    const payload = {
      case_id: caseId,
      bimester: currentBimester,
      blocks,
      scores,
      adaptation_level: adaptationLevel,
      adaptation_changed: adaptationChanged,
      filled_by: user.id,
      filled_via: "portal" as const,
      completed: true,
      recommendations: (blocks.observacoes_finais as string) ?? "",
    };
    if (profileId) {
      await db.from("academic_profiles").update(payload).eq("id", profileId);
    } else {
      await db.from("academic_profiles").insert(payload);
    }

    if (adaptationChanged) {
      toast.warning("Nível de adaptação mudou! Pendência criada para atualizar currículo adaptado.");
    } else {
      toast.success("Perfil acadêmico concluído!");
    }
    setSubmitting(false);
    navigate(`/portal/pacientes/${id}`);
  };

  const suggestedLevel = calculateLevelFromScores(scores);

  // Detect if running inside main app (not portal)
  const isMainApp = !location.pathname.startsWith("/portal");

  return (
    <div className={isMainApp ? "p-6 lg:p-8" : ""}>
      <button onClick={() => navigate(isMainApp ? `/pacientes/${id}` : `/portal/pacientes/${id}`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5">
        <ArrowLeft className="w-4 h-4" /> {isMainApp ? "Voltar ao Paciente" : "Ficha do Paciente"}
      </button>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Perfil Acadêmico</h1>
        <Button type="button" variant="ghost" size="sm" className="text-xs gap-1.5" onClick={handleCopyPrevious}>
          <Copy className="w-3.5 h-3.5" /> Copiar bimestre anterior
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{STEPS[step].label}</span>
          <span>{step + 1}/{STEPS.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {saving && <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5"><Save className="w-3 h-3 animate-pulse" /> Salvando rascunho...</p>}

      <div className="grid lg:grid-cols-[200px_1fr] gap-5">
        {/* Sidebar — step nav + scores */}
        <div className="space-y-4 hidden lg:block">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Blocos</p>
              <div className="space-y-0.5">
                {STEPS.map((s, i) => (
                  <button key={i} onClick={() => setStep(i)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    step === i ? "bg-primary text-primary-foreground" : i < step ? "text-success" : "text-muted-foreground hover:bg-muted"
                  }`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      step === i ? "bg-primary-foreground/20" : i < step ? "bg-success/20" : "bg-muted"
                    }`}>{i < step ? <Check size={8} /> : i + 1}</div>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Nível Sugerido</p>
              </div>
              {(["leitura", "escrita", "matematica", "logica", "autonomia"] as const).map(key => (
                <div key={key}>
                  <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                    <span className="capitalize">{key === "logica" ? "Lógica" : key}</span>
                    <span className={`font-bold ${scores[key] >= 4 ? "text-success" : scores[key] >= 3 ? "text-info" : scores[key] >= 2 ? "text-warning" : "text-destructive"}`}>{scores[key]}/5</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${scores[key] >= 4 ? "bg-success" : scores[key] >= 3 ? "bg-info" : scores[key] >= 2 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${(scores[key] / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-[8px] text-muted-foreground/60 italic">Calculado automaticamente pelas respostas</p>
              <Separator />
              {suggestedLevel && (
                <>
                  <div className={`p-2 rounded-xl text-center ${ADAPTATION_LEVELS.find(l => l.value === suggestedLevel)?.color}`}>
                    <p className="text-base font-bold">Nível {suggestedLevel}</p>
                    <p className="text-[10px] font-semibold">{ADAPTATION_LEVELS.find(l => l.value === suggestedLevel)?.label}</p>
                  </div>
                  <Button size="sm" variant={adaptationAccepted ? "default" : "outline"} className="w-full gap-1 text-[10px]" onClick={() => { setAdaptationLevel(suggestedLevel); setAdaptationAccepted(true); setManualOverride(false); }}>
                    {adaptationAccepted && !manualOverride ? <Check size={10} /> : <Sparkles size={10} />}
                    {adaptationAccepted && !manualOverride ? "Sugestão aceita" : "Aceitar sugestão"}
                  </Button>
                  <Select value={adaptationLevel?.toString() ?? ""} onValueChange={v => { setAdaptationLevel(Number(v)); setManualOverride(true); setAdaptationAccepted(false); }}>
                    <SelectTrigger className="h-7 text-[10px]"><SelectValue placeholder="Ou defina manualmente" /></SelectTrigger>
                    <SelectContent>
                      {ADAPTATION_LEVELS.map(l => <SelectItem key={l.value} value={l.value.toString()}>N{l.value} — {l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {manualOverride && <p className="text-[8px] text-warning">Nível definido manualmente</p>}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-5">
          {step === 0 && <FontPreferenceStep data={blocks.tipo_letra ?? {}} onChange={v => updateBlock("tipo_letra", v)} />}
          {step === 1 && <LiteracyStep data={blocks.alfabetizacao ?? []} onChange={v => updateBlock("alfabetizacao", v)} />}
          {step === 2 && <WritingStep data={blocks.escrita ?? {}} onChange={v => updateBlock("escrita", v)} />}
          {step === 3 && <MathStep data={blocks.matematica ?? {}} onChange={v => updateBlock("matematica", v)} />}
          {step === 4 && <AssociationStep data={blocks.associacao ?? {}} onChange={v => updateBlock("associacao", v)} />}
          {step === 5 && <MotorStep data={blocks.coord_motora ?? {}} onChange={v => updateBlock("coord_motora", v)} />}
          {step === 6 && <ComprehensionStep data={blocks.compreensao ?? {}} onChange={v => updateBlock("compreensao", v)} />}
          {step === 7 && <CommunicationStep data={blocks.comunicacao ?? []} onChange={v => updateBlock("comunicacao", v)} />}
          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><StickyNote size={20} className="text-primary" /> Observações Finais</h2>
              <Textarea rows={6} placeholder="Orientações específicas, sugestões de estratégias..." value={blocks.observacoes_finais ?? ""} onChange={e => updateBlock("observacoes_finais", e.target.value)} className="resize-y" />

              {/* Mobile scores */}
              <div className="lg:hidden space-y-3 pt-4 border-t">
                <p className="text-sm font-bold">Scores e Nível</p>
                {(["leitura", "escrita", "matematica", "logica", "autonomia"] as const).map(key => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="capitalize">{key === "logica" ? "Lógica" : key}</span>
                      <span>{scores[key]}/5</span>
                    </div>
                    <input type="range" min={0} max={5} step={1} value={scores[key]} onChange={e => updateScore(key, Number(e.target.value))} className="w-full h-1.5 accent-primary" />
                  </div>
                ))}
                <Select value={adaptationLevel?.toString() ?? ""} onValueChange={v => setAdaptationLevel(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Nível de Adaptação" /></SelectTrigger>
                  <SelectContent>
                    {ADAPTATION_LEVELS.map(l => <SelectItem key={l.value} value={l.value.toString()}>N{l.value} — {l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex gap-3 pt-4 border-t">
            {step > 0 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" className="flex-1" onClick={() => setStep(s => s + 1)}>
                Próximo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" className="flex-1" disabled={submitting || !adaptationLevel} onClick={handleFinish}>
                {submitting ? "Salvando..." : "Concluir Perfil"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step components (checkboxes + radios like Lovable) ──────────────────────

function FontPreferenceStep({ data, onChange }: { data: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const rows = ["Cursiva", "Bastão Maiúscula", "Bastão Imprensa"];
  const cols = ["Pequeno", "Médio", "Grande", "Não se aplica"];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><PenTool size={20} className="text-primary" /> Preferência de Tipo de Letra</h2>
      <p className="text-sm text-muted-foreground">Selecione o formato tipográfico adequado para os materiais.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead><tr className="bg-muted"><th className="p-2 text-left font-medium text-muted-foreground" />{cols.map(c => <th key={c} className="p-2 text-center font-medium text-muted-foreground text-xs">{c}</th>)}</tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r} className="border-t border-border">
              <td className="p-2 font-medium text-sm">{r}</td>
              {cols.map(c => <td key={c} className="p-2 text-center">
                <input type="radio" name={r} checked={data[r] === c} onChange={() => onChange({ ...data, [r]: c })} className="accent-primary" />
              </td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function LiteracyStep({ data, onChange }: { data: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen size={20} className="text-primary" /> Alfabetização e Letramento</h2>
      <CheckboxGroup label="Selecione as habilidades observadas:" options={[
        "Conhece todo o alfabeto", "Conhece as vogais", "Não identifica letras",
        "Ordena letras para formar palavras", "Lê sílabas simples", "Lê sílabas complexas",
        "Nomeia objetos cotidianos", "Consegue pegar itens quando solicitado (se não verbal)",
        "Relaciona palavras com figuras", "Liga palavras aos seus significados"
      ]} selected={data} onChange={onChange} />
    </div>
  );
}

function WritingStep({ data, onChange }: { data: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><PenTool size={20} className="text-primary" /> Escrita</h2>
      <RadioGroup label="Capacidade de cópia" options={["Não escreve", "Copia 1 palavra por vez", "Copia 1 frase curta", "Copia 1 texto curto", "Reescreve textos", "Produção de texto livre", "Produção de texto dirigida"]} value={data.copia ?? ""} onChange={v => onChange({ ...data, copia: v })} />
      <CheckboxGroup label="Reconhecimento numérico" options={["Reconhece números de 0 a 10", "Reconhece números de 11 a 20", "Reconhece números de 20 a 50", "Reconhece números de 50 a 100", "Reconhece números acima de 100"]} selected={data.numeros ?? []} onChange={v => onChange({ ...data, numeros: v })} />
    </div>
  );
}

function MathStep({ data, onChange }: { data: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><Calculator size={20} className="text-primary" /> Matemática e Lógica</h2>
      <RadioGroup label="Até quanto conta oralmente?" options={["Não conta", "Até 10", "Até 20", "Até 40", "Até 60", "Até 80", "Até 100", "Acima de 100"]} value={data.contagem_oral ?? ""} onChange={v => onChange({ ...data, contagem_oral: v })} />
      <RadioGroup label="Reconhece sequência numérica?" options={["Não reconhece", "Até 10", "Até 20", "Até 50", "Até 100"]} value={data.sequencia_numerica ?? ""} onChange={v => onChange({ ...data, sequencia_numerica: v })} />
      <RadioGroup label="Escrita de quantidades" options={["Independente", "Com pontilhado", "Garatuja", "Não escreve"]} value={data.escrita_qtd ?? ""} onChange={v => onChange({ ...data, escrita_qtd: v })} />
      <CheckboxGroup label="Realiza adição:" options={["1 termo", "2 termos", "3 termos", "Com reserva (vai um)"]} selected={data.adicao ?? []} onChange={v => onChange({ ...data, adicao: v })} />
      <CheckboxGroup label="Realiza subtração:" options={["1 termo", "2 termos", "Com empréstimo", "Sem empréstimo"]} selected={data.subtracao ?? []} onChange={v => onChange({ ...data, subtracao: v })} />
      <RadioGroup label="Compreende quadro valor lugar?" options={["Não", "Unidade", "Dezena", "Centena"]} value={data.quadro_valor ?? ""} onChange={v => onChange({ ...data, quadro_valor: v })} />
      <CheckboxGroup label="Liga número à quantidade:" options={["Numeral ao conjunto", "Conjunto ao numeral", "Quantidade ao numeral escrito", "Numeral escrito à quantidade"]} selected={data.liga_numero_qtd ?? []} onChange={v => onChange({ ...data, liga_numero_qtd: v })} />
      <RadioGroup label="Resolve problemas" options={["Com ilustração", "Sem ilustração", "Não resolve problemas"]} value={data.problemas ?? ""} onChange={v => onChange({ ...data, problemas: v })} />
      <CheckboxGroup label="Reconhece formas:" options={["Planas (círculo, quadrado, triângulo, retângulo)", "Espaciais (cubo, esfera, cilindro, cone)"]} selected={data.formas_geometricas ?? []} onChange={v => onChange({ ...data, formas_geometricas: v })} />
      <RadioGroup label="Reconhece cédulas de dinheiro" options={["Sim", "Não", "Não apresenta reconhecimento"]} value={data.cedulas ?? ""} onChange={v => onChange({ ...data, cedulas: v })} />
      <RadioGroup label="Localiza números em caça-números?" options={["Não", "Com apoio", "Independente"]} value={data.caca_numeros ?? ""} onChange={v => onChange({ ...data, caca_numeros: v })} />
    </div>
  );
}

function AssociationStep({ data, onChange }: { data: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><Grid3X3 size={20} className="text-primary" /> Associação e Organização</h2>
      <CheckboxGroup label="Liga colunas" options={["Palavra x Figura", "Pergunta x Resposta", "Igual x Igual", "Não faz associação"]} selected={data.liga_colunas ?? []} onChange={v => onChange({ ...data, liga_colunas: v })} />
      <RadioGroup label="Sequência lógica (antes e depois)" options={["Sim", "Não", "Não faz associação"]} value={data.sequencia ?? ""} onChange={v => onChange({ ...data, sequencia: v })} />
      <RadioGroup label="Completa padrões" options={["Sim", "Não", "Não completa padrões"]} value={data.padroes ?? ""} onChange={v => onChange({ ...data, padroes: v })} />
      <RadioGroup label="Classificação" options={["Sim", "Não", "Não classifica objetos"]} value={data.classificacao ?? ""} onChange={v => onChange({ ...data, classificacao: v })} />
    </div>
  );
}

function MotorStep({ data, onChange }: { data: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><Hand size={20} className="text-primary" /> Coordenação Motora e Expressão</h2>
      <RadioGroup label="Pinta dentro do contorno?" options={["Não pinta", "Pinta fora do contorno", "Pinta parcialmente dentro", "Pinta dentro do contorno"]} value={data.contorno ?? ""} onChange={v => onChange({ ...data, contorno: v })} />
      <RadioGroup label="Segue legenda de cores?" options={["Não", "Com apoio", "Independente"]} value={data.legenda ?? ""} onChange={v => onChange({ ...data, legenda: v })} />
      <RadioGroup label="Recorta com tesoura:" options={["Não recorta", "Com suporte total", "Com suporte parcial", "Sozinho(a)"]} value={data.recorte ?? ""} onChange={v => onChange({ ...data, recorte: v })} />
      <RadioGroup label="Cola materiais:" options={["Não cola", "Com suporte total", "Com suporte parcial", "Sozinho(a)"]} value={data.colagem ?? ""} onChange={v => onChange({ ...data, colagem: v })} />
      <RadioGroup label="Montagem de figuras/palavras:" options={["Não monta", "Com suporte", "Sozinho(a)"]} value={data.montagem ?? ""} onChange={v => onChange({ ...data, montagem: v })} />
      <RadioGroup label="Liga pontos:" options={["Não liga", "Com suporte", "Sozinho(a)"]} value={data.liga_pontos ?? ""} onChange={v => onChange({ ...data, liga_pontos: v })} />
      <RadioGroup label="Dobraduras:" options={["Não faz", "Com suporte", "Sozinho(a)"]} value={data.dobraduras ?? ""} onChange={v => onChange({ ...data, dobraduras: v })} />
      <CheckboxGroup label="Construção com materiais:" options={["Massinha", "Blocos", "Palitos", "Materiais recicláveis", "Outros"]} selected={data.materiais ?? []} onChange={v => onChange({ ...data, materiais: v })} />
      <RadioGroup label="Qualidade do traçado:" options={["Não faz traçado", "Traçado irregular", "Traçado regular com suporte", "Traçado regular independente"]} value={data.tracado ?? ""} onChange={v => onChange({ ...data, tracado: v })} />
      <RadioGroup label="Monta quebra-cabeça de:" options={["Não monta", "2 peças", "3 peças", "4 peças", "8 peças", "10+ peças"]} value={data.quebra_cabeca ?? ""} onChange={v => onChange({ ...data, quebra_cabeca: v })} />
      <RadioGroup label="Tipo de corte do quebra-cabeça:" options={["Reto", "Curvo", "Misto"]} value={data.corte_quebra_cabeca ?? ""} onChange={v => onChange({ ...data, corte_quebra_cabeca: v })} />
    </div>
  );
}

function ComprehensionStep({ data, onChange }: { data: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-primary" /> Compreensão Textual</h2>
      <RadioGroup label="Responde questões" options={["Dissertativas", "Objetivas", "Ambas"]} value={data.questoes ?? ""} onChange={v => onChange({ ...data, questoes: v })} />
      <RadioGroup label="Escala de escrita" options={["Até 4 frases", "Até 2 parágrafos", "Mais de 3 parágrafos", "Não escreve"]} value={data.escala ?? ""} onChange={v => onChange({ ...data, escala: v })} />
      <CheckboxGroup label="Interpretação" options={["Assinala imagem correta", "Organiza sequência de eventos", "Ilustra texto", "Interpreta imagem", "Verdadeiro ou falso", "Ainda não demonstra compreensão"]} selected={data.interpretacao ?? []} onChange={v => onChange({ ...data, interpretacao: v })} />
    </div>
  );
}

function CommunicationStep({ data, onChange }: { data: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold flex items-center gap-2"><MessageCircle size={20} className="text-primary" /> Comunicação e Habilidades Sociais</h2>
      <CheckboxGroup label="Habilidades observadas" options={["Expressa preferências", "Completa frases", "Seleciona figuras para sentimentos", "Quadros de rotina", "Histórias sociais", "Diálogos com balões", "Baixa reciprocidade emocional"]} selected={data} onChange={onChange} />
    </div>
  );
}
