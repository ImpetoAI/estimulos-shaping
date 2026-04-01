import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  Heart, ThumbsDown, MessageCircle, HandHelping, Star, School,
  Pill, User, Save, Plus, X, Check, Baby, ShieldCheck, Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/supabase";
import { type CicloTabProps } from "./_shared";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ComunicacaoItem {
  emocao: string;
  descricao: string;
}

interface CardContent {
  sobre_mim: string;
  nome_preferido: string;
  medicamentos: string;
  coisas_que_gosto: string[];
  coisas_que_nao_gosto: string[];
  comunicacao: ComunicacaoItem[];
  estrategias_apoio: string[];
  habilidades: string[];
  nivel_suporte_escolar: "nenhum" | "leve" | "moderado" | "intenso" | "";
}

const defaultContent: CardContent = {
  sobre_mim: "",
  nome_preferido: "",
  medicamentos: "",
  coisas_que_gosto: [],
  coisas_que_nao_gosto: [],
  comunicacao: [],
  estrategias_apoio: [],
  habilidades: [],
  nivel_suporte_escolar: "",
};

const supportLevels = [
  { key: "nenhum" as const, label: "Não necessita", color: "bg-muted text-muted-foreground" },
  { key: "leve" as const, label: "Leve", color: "bg-success/15 text-success" },
  { key: "moderado" as const, label: "Moderado", color: "bg-warning/15 text-warning" },
  { key: "intenso" as const, label: "Intenso", color: "bg-destructive/15 text-destructive" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

// ─── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  index,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2.5 px-5 py-3.5 bg-accent/40 border-b border-border/40">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-card-foreground">{title}</h2>
        </div>
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

// ─── ChipList ──────────────────────────────────────────────────────────────────

function ChipList({ items, variant }: { items: string[]; variant: "like" | "dislike" }) {
  const colors =
    variant === "like"
      ? "bg-success/10 text-success border-success/20"
      : "bg-destructive/10 text-destructive border-destructive/20";
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground italic">Nenhum item adicionado.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${colors}`}
        >
          {variant === "like" ? <Heart size={13} /> : <ThumbsDown size={13} />}
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── TagInput ──────────────────────────────────────────────────────────────────

function TagInput({
  items,
  onChange,
  placeholder,
  variant = "default",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  variant?: "like" | "dislike" | "default";
}) {
  const [input, setInput] = useState("");

  const chipColors =
    variant === "like"
      ? "bg-success/10 text-success border-success/20"
      : variant === "dislike"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : "bg-accent/50 text-foreground border-border/40";

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput("");
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !input && items.length > 0) {
      remove(items.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${chipColors}`}
            >
              {item}
              <button
                type="button"
                onClick={() => remove(i)}
                className="hover:opacity-70 ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-sm h-8"
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="h-8 px-2">
          <Plus size={13} />
        </Button>
      </div>
    </div>
  );
}

// ─── ComunicacaoInput ──────────────────────────────────────────────────────────

function ComunicacaoInput({
  items,
  onChange,
}: {
  items: ComunicacaoItem[];
  onChange: (items: ComunicacaoItem[]) => void;
}) {
  const add = () => onChange([...items, { emocao: "", descricao: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateField = (i: number, field: keyof ComunicacaoItem, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            value={item.emocao}
            onChange={(e) => updateField(i, "emocao", e.target.value)}
            placeholder="Emoção (ex: Felicidade)"
            className="text-sm h-8 w-36 flex-shrink-0"
          />
          <Input
            value={item.descricao}
            onChange={(e) => updateField(i, "descricao", e.target.value)}
            placeholder="Como demonstra..."
            className="text-sm h-8 flex-1"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => remove(i)}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X size={13} />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1.5 h-8 text-xs">
        <Plus size={12} /> Adicionar emoção
      </Button>
    </div>
  );
}

// ─── CardPreview ───────────────────────────────────────────────────────────────

function CardPreview({
  content,
  studentName,
  studentPhoto,
}: {
  content: CardContent;
  studentName: string;
  studentPhoto?: string | null;
}) {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-24 bg-gradient-to-br from-primary via-primary/80 to-secondary relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, hsl(var(--secondary)/0.4), transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.3), transparent 50%)",
              }}
            />
          </div>
          <div className="relative px-5 pb-5">
            <div className="-mt-12 mb-4 flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-card shadow-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                {studentPhoto ? (
                  <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-muted-foreground" />
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-extrabold text-card-foreground leading-tight">
                  {studentName || "Nome do Estudante"}
                </h1>
                {content.nome_preferido && (
                  <p className="text-secondary font-semibold text-sm">"{content.nome_preferido}"</p>
                )}
                {content.medicamentos && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Pill size={11} /> {content.medicamentos}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {content.sobre_mim && (
        <Section title="Sobre Mim" icon={Baby} index={1}>
          <p className="text-sm text-foreground leading-relaxed">{content.sobre_mim}</p>
        </Section>
      )}

      {content.coisas_que_gosto.length > 0 && (
        <Section title="Gosto De" icon={Heart} index={2}>
          <ChipList items={content.coisas_que_gosto} variant="like" />
        </Section>
      )}

      {content.coisas_que_nao_gosto.length > 0 && (
        <Section title="Não Gosto De" icon={ThumbsDown} index={3}>
          <ChipList items={content.coisas_que_nao_gosto} variant="dislike" />
        </Section>
      )}

      {content.comunicacao.length > 0 && (
        <Section title="Como Me Comunico" icon={MessageCircle} index={4}>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.comunicacao.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 border border-border/30"
              >
                <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle size={16} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">{item.emocao}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.estrategias_apoio.length > 0 && (
        <Section title="Como Me Ajudar" icon={HandHelping} index={5}>
          <ul className="space-y-2.5">
            {content.estrategias_apoio.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-primary" />
                </div>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {content.habilidades.length > 0 && (
        <Section title="Habilidades — Eu Posso!" icon={Star} index={6}>
          <div className="flex flex-wrap gap-2">
            {content.habilidades.map((a, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary/15 text-secondary border border-secondary/20 hover:bg-secondary/25"
              >
                <Sparkles size={12} />
                {a}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {content.nivel_suporte_escolar && (
        <Section title="Nível de Apoio na Escola" icon={School} index={7}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {supportLevels.map((level) => {
              const active = content.nivel_suporte_escolar === level.key;
              return (
                <div
                  key={level.key}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    active
                      ? "border-primary shadow-md scale-[1.03] ring-2 ring-primary/20"
                      : "border-border/40 opacity-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${level.color}`}>
                    <ShieldCheck size={18} />
                  </div>
                  <span className={`text-sm font-bold ${active ? "text-card-foreground" : "text-muted-foreground"}`}>
                    {level.label}
                  </span>
                  {active && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 py-3">
          <span>Cartão de Apresentação — Grupo Estímulos</span>
          <span>Atualizado em: {new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CardTab({ caseId, studentId }: CicloTabProps) {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<CardContent>(defaultContent);
  const [studentName, setStudentName] = useState("");
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);

  const update = <K extends keyof CardContent>(key: K, value: CardContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cardRes, studentRes] = await Promise.all([
      db
        .from("child_cards")
        .select("*")
        .eq("case_id", caseId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db.from("students").select("name, photo_url").eq("id", studentId).maybeSingle(),
    ]);

    if (studentRes.data) {
      setStudentName(studentRes.data.name ?? "");
      setStudentPhoto(studentRes.data.photo_url ?? null);
    }

    if (cardRes.data) {
      setRecordId(cardRes.data.id);
      const c = cardRes.data.content ?? {};
      setContent({
        sobre_mim: c.sobre_mim ?? "",
        nome_preferido: c.nome_preferido ?? "",
        medicamentos: c.medicamentos ?? "",
        coisas_que_gosto: Array.isArray(c.coisas_que_gosto) ? c.coisas_que_gosto : [],
        coisas_que_nao_gosto: Array.isArray(c.coisas_que_nao_gosto) ? c.coisas_que_nao_gosto : [],
        comunicacao: Array.isArray(c.comunicacao) ? c.comunicacao : [],
        estrategias_apoio: Array.isArray(c.estrategias_apoio) ? c.estrategias_apoio : [],
        habilidades: Array.isArray(c.habilidades) ? c.habilidades : [],
        nivel_suporte_escolar: c.nivel_suporte_escolar ?? "",
      });
    }
    setLoading(false);
  }, [caseId, studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { case_id: caseId, student_id: studentId, content };
      if (recordId) {
        const { error } = await db.from("child_cards").update(payload).eq("id", recordId);
        if (error) throw error;
      } else {
        const { data, error } = await db
          .from("child_cards")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (data) setRecordId(data.id);
      }
      toast.success("Cartão salvo com sucesso!");
    } catch {
      toast.error("Erro ao salvar cartão.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Visual Preview */}
        <div className="lg:sticky lg:top-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Preview
          </p>
          <CardPreview content={content} studentName={studentName} studentPhoto={studentPhoto} />
        </div>

        {/* Right: Form */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Editar Cartão
            </p>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Salvar
            </Button>
          </div>

          {/* Identificação */}
          <div className="space-y-3 p-4 rounded-xl bg-accent/30 border border-border/30">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome Preferido</Label>
                <Input
                  value={content.nome_preferido}
                  onChange={(e) => update("nome_preferido", e.target.value)}
                  placeholder="Como gosta de ser chamado..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Medicamentos</Label>
                <Input
                  value={content.medicamentos}
                  onChange={(e) => update("medicamentos", e.target.value)}
                  placeholder="Ex: Ritalina 10mg"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sobre Mim */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Baby size={13} /> Sobre Mim
            </Label>
            <Textarea
              value={content.sobre_mim}
              onChange={(e) => update("sobre_mim", e.target.value)}
              placeholder="Quem sou eu, o que me faz especial..."
              rows={3}
            />
          </div>

          {/* Coisas que Gosto */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Heart size={13} className="text-success" /> Coisas que Gosto
            </Label>
            <TagInput
              items={content.coisas_que_gosto}
              onChange={(v) => update("coisas_que_gosto", v)}
              placeholder="Digite e pressione Enter para adicionar..."
              variant="like"
            />
          </div>

          {/* Coisas que Não Gosto */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <ThumbsDown size={13} className="text-destructive" /> Coisas que Não Gosto
            </Label>
            <TagInput
              items={content.coisas_que_nao_gosto}
              onChange={(v) => update("coisas_que_nao_gosto", v)}
              placeholder="Digite e pressione Enter para adicionar..."
              variant="dislike"
            />
          </div>

          {/* Como Me Comunico */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <MessageCircle size={13} /> Como Me Comunico
            </Label>
            <ComunicacaoInput
              items={content.comunicacao}
              onChange={(v) => update("comunicacao", v)}
            />
          </div>

          {/* Estratégias de Apoio */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <HandHelping size={13} /> Como Me Ajudar
            </Label>
            <TagInput
              items={content.estrategias_apoio}
              onChange={(v) => update("estrategias_apoio", v)}
              placeholder="Digite uma estratégia e pressione Enter..."
            />
          </div>

          {/* Habilidades */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Star size={13} /> Habilidades — Eu Posso!
            </Label>
            <TagInput
              items={content.habilidades}
              onChange={(v) => update("habilidades", v)}
              placeholder="Digite uma habilidade e pressione Enter..."
            />
          </div>

          {/* Nível de Suporte Escolar */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <School size={13} /> Nível de Apoio Escolar
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {supportLevels.map((level) => {
                const active = content.nivel_suporte_escolar === level.key;
                return (
                  <button
                    key={level.key}
                    type="button"
                    onClick={() => update("nivel_suporte_escolar", level.key)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      active
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${level.color}`}
                    >
                      <ShieldCheck size={15} />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        active ? "text-card-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {level.label}
                    </span>
                    {active && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check size={10} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Salvar Cartão
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
