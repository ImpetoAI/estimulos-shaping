import { useState } from "react";
import lucasPhoto from "@/assets/lucas-photo.jpg";
import { motion } from "framer-motion";
import {
  Heart, ThumbsDown, MessageCircle, HandHelping, Star, School,
  MapPin, Pill, User, Calendar, Share2, FileDown, Pencil, Check,
  Smile, Frown, Baby, ShieldCheck, Sparkles, Volume2, Clock,
  QrCode, Link2, Copy, CheckCircle2, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// --- Mock Data ---
const mockChild = {
  photo: lucasPhoto,
  fullName: "Lucas Mendes da Silva",
  preferredName: "Lucas",
  birthDate: "15/06/2016",
  age: 9,
  location: "Palmas - TO",
  guardians: "Fernanda Mendes (mãe) e Ricardo Silva (pai)",
  keyReferencePerson: "Avó Dona Maria",
  medications: "Risperidona 0,5mg",
  aboutMe: "Lucas é um menino carinhoso e curioso, que adora explorar o mundo ao seu redor. Ele gosta de estar perto de pessoas que o tratam com calma e carinho. Tem um sorriso contagiante e demonstra muito afeto por abraços. Mora com a mamãe Fernanda e o papai Ricardo, e tem um vínculo muito forte com a avó Maria, que o acompanha desde bebê.",
  likes: ["Brincar no parquinho", "Desenhar e pintar", "Música infantil", "Massinha de modelar", "Histórias com figuras", "Correr ao ar livre", "Bolhas de sabão", "Brincar com água"],
  dislikes: ["Barulho muito alto", "Mudança brusca de rotina", "Ficar em ambientes fechados por muito tempo", "Insetos", "Quando está com sono e não pode descansar", "Texturas pegajosas"],
  communication: [
    { emotion: "Felicidade", description: "Sorri, pula, abraça e faz sons alegres", icon: Smile },
    { emotion: "Frustração", description: "Chora, se joga no chão ou se afasta do grupo", icon: Frown },
    { emotion: "Incômodo", description: "Tampa os ouvidos, fecha os olhos ou se encolhe", icon: Volume2 },
    { emotion: "Vontade", description: "Aponta, puxa pela mão ou leva até o objeto", icon: Star },
    { emotion: "Cansaço", description: "Deita no chão, esfrega os olhos, fica irritada", icon: Clock },
  ],
  supportStrategies: [
    "Chamar pelo nome calmamente antes de dar instruções",
    "Avisar com antecedência sobre mudanças de atividade",
    "Usar apoio visual (imagens e pictogramas)",
    "Respeitar seu tempo de autorregulação",
    "Evitar insistência verbal excessiva em momentos de crise",
    "Oferecer escolhas simples entre duas opções",
    "Usar reforço positivo e elogio específico",
  ],
  abilities: ["Come sozinha com colher e garfo", "Vai ao banheiro com supervisão leve", "Veste-se com ajuda mínima", "Corre, pula e sobe escadas", "Categoriza cores e formas", "Completa quebra-cabeças de 12 peças", "Reconhece letras do próprio nome", "Conta até 10", "Acompanha rotina escolar com apoio visual"],
  schoolSupportLevel: "moderado" as "nenhum" | "leve" | "moderado" | "intenso",
};

const supportLevels = [
  { key: "nenhum", label: "Não necessita", color: "bg-muted text-muted-foreground" },
  { key: "leve", label: "Leve", color: "bg-success/15 text-success" },
  { key: "moderado", label: "Moderado", color: "bg-warning/15 text-warning" },
  { key: "intenso", label: "Intenso", color: "bg-destructive/15 text-destructive" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

function Section({ title, icon: Icon, children, index }: { title: string; icon: React.ElementType; children: React.ReactNode; index: number }) {
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

function ChipList({ items, variant }: { items: string[]; variant: "like" | "dislike" }) {
  const colors = variant === "like" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${colors}`}>
          {variant === "like" ? <Heart size={13} /> : <ThumbsDown size={13} />}
          {item}
        </span>
      ))}
    </div>
  );
}

// ===== SHARE MODAL =====
function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://estimulos.app/cartao/lucas-mendes-2026";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <Share2 size={18} className="text-primary" /> Compartilhar Cartão
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* QR Code simulation */}
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-accent/40 border border-border/40">
          <div className="w-40 h-40 bg-card rounded-xl border-2 border-border flex items-center justify-center">
            <div className="grid grid-cols-7 gap-[2px]">
              {Array.from({ length: 49 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[6px] h-[6px] rounded-[1px] ${Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Escaneie o QR Code para acessar o cartão
          </p>
        </div>

        {/* Link */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Link Compartilhável
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted border border-border text-sm">
              <Link2 size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="truncate text-foreground">{shareUrl}</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 flex-shrink-0">
              {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* Export options */}
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-1.5">
            <FileDown size={14} /> Exportar PDF
          </Button>
          <Button variant="outline" className="gap-1.5">
            <QrCode size={14} /> Baixar QR Code
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ChildPresentationCardPage() {
  const child = mockChild;
  const [editMode, setEditMode] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Share modal */}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      {/* ===== HERO ===== */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-secondary relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, hsl(var(--secondary)/0.4), transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.3), transparent 50%)" }} />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="gap-1.5 bg-card/90 text-card-foreground hover:bg-card shadow-md" onClick={() => setEditMode(!editMode)}>
                {editMode ? <Check size={14} /> : <Pencil size={14} />}
                {editMode ? "Salvar" : "Editar"}
              </Button>
              <Button size="sm" variant="secondary" className="gap-1.5 bg-card/90 text-card-foreground hover:bg-card shadow-md" onClick={() => setShowShare(true)}>
                <Share2 size={14} /> Compartilhar
              </Button>
              <Button size="sm" className="gap-1.5 shadow-md">
                <FileDown size={14} /> Exportar PDF
              </Button>
            </div>
          </div>

          <div className="relative px-6 pb-6">
            <div className="-mt-16 mb-4 flex items-end gap-5">
              <div className="w-28 h-28 rounded-2xl border-4 border-card shadow-xl overflow-hidden flex-shrink-0 bg-muted">
                <img src={child.photo} alt={child.fullName} className="w-full h-full object-cover" />
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-extrabold text-card-foreground leading-tight">{child.fullName}</h1>
                <p className="text-secondary font-semibold text-base">"{child.preferredName}"</p>
                <p className="text-sm text-muted-foreground mt-0.5">{child.guardians}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Calendar, label: "Idade", value: `${child.age} anos` },
                { icon: MapPin, label: "Localização", value: child.location },
                { icon: Pill, label: "Medicações", value: child.medications },
                { icon: User, label: "Ref. importante", value: child.keyReferencePerson },
              ].map((info, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/50 border border-border/40">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <info.icon size={15} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{info.label}</p>
                    <p className="text-sm font-bold text-card-foreground truncate">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <Section title="Sobre Mim" icon={Baby} index={1}>
        <p className="text-sm text-foreground leading-relaxed">{child.aboutMe}</p>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Gosto De" icon={Heart} index={2}>
          <ChipList items={child.likes} variant="like" />
        </Section>
        <Section title="Não Gosto De" icon={ThumbsDown} index={3}>
          <ChipList items={child.dislikes} variant="dislike" />
        </Section>
      </div>

      <Section title="Como Me Comunico" icon={MessageCircle} index={4}>
        <div className="grid sm:grid-cols-2 gap-3">
          {child.communication.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 border border-border/30">
              <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold text-card-foreground">{item.emotion}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Como Me Ajudar" icon={HandHelping} index={5}>
        <ul className="space-y-2.5">
          {child.supportStrategies.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} className="text-primary" />
              </div>
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Habilidades — Eu Posso!" icon={Star} index={6}>
        <div className="flex flex-wrap gap-2">
          {child.abilities.map((a, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary/15 text-secondary border border-secondary/20 hover:bg-secondary/25">
              <Sparkles size={12} />
              {a}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Nível de Apoio Necessário na Escola" icon={School} index={7}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {supportLevels.map((level) => {
            const active = child.schoolSupportLevel === level.key;
            return (
              <div key={level.key} className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${active ? "border-primary shadow-md scale-[1.03] ring-2 ring-primary/20" : "border-border/40 opacity-50"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${level.color}`}>
                  <ShieldCheck size={18} />
                </div>
                <span className={`text-sm font-bold ${active ? "text-card-foreground" : "text-muted-foreground"}`}>{level.label}</span>
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

      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 py-3">
          <span>Cartão de Apresentação do Paciente — Grupo Estímulos</span>
          <span>Atualizado em: {new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </motion.div>
    </div>
  );
}
