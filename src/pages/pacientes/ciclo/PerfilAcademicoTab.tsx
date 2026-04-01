import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PenTool, BookOpen, Calculator, Grid3X3, Hand, FileText, MessageCircle, StickyNote,
  Check, Zap, AlertTriangle, Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/supabase";
import type { CicloTabProps } from "./_shared";

interface ProfileData {
  id: string;
  blocks: Record<string, any>;
  scores: Record<string, number>;
  adaptation_level: number;
  recommendations: string | null;
  completed: boolean;
  updated_at: string;
}

const ADAPTATION_LEVELS: Record<number, { label: string; description: string; color: string }> = {
  1: { label: "Leve", description: "Adaptações mínimas, aluno próximo do nível da turma", color: "bg-success/15 text-success" },
  2: { label: "Moderado", description: "Simplificação de conteúdo e apoio visual recomendados", color: "bg-info/15 text-info" },
  3: { label: "Significativo", description: "Currículo paralelo com atividades funcionais e concretas", color: "bg-warning/15 text-warning" },
  4: { label: "Paralelo", description: "Conteúdo predominantemente funcional e vivencial", color: "bg-orange-100 text-orange-700" },
  5: { label: "Funcional", description: "Foco em habilidades de vida diária e comunicação", color: "bg-destructive/15 text-destructive" },
};

const SCORE_LABELS: Record<number, string> = {
  1: "Muito abaixo", 2: "Abaixo", 3: "Adequado", 4: "Acima", 5: "Excelente",
};

const SCORE_COLORS: Record<number, string> = {
  1: "bg-destructive/15 text-destructive",
  2: "bg-warning/15 text-warning",
  3: "bg-info/15 text-info",
  4: "bg-success/15 text-success",
  5: "bg-success/20 text-success",
};

const PROFILE_SECTIONS = [
  { key: "tipo_letra", label: "Tipo de Letra", icon: PenTool },
  { key: "alfabetizacao", label: "Alfabetização", icon: BookOpen },
  { key: "escrita", label: "Escrita", icon: PenTool },
  { key: "matematica", label: "Matemática", icon: Calculator },
  { key: "associacao", label: "Associação", icon: Grid3X3 },
  { key: "coord_motora", label: "Coord. Motora", icon: Hand },
  { key: "compreensao", label: "Compreensão", icon: FileText },
  { key: "comunicacao", label: "Comunicação", icon: MessageCircle },
  { key: "observacoes", label: "Observações", icon: StickyNote },
];

export default function PerfilAcademicoTab({ caseId, bimester, studentId }: CicloTabProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [caseId, bimester]);

  async function loadProfile() {
    setLoading(true);
    const { data } = await db
      .from("academic_profiles")
      .select("*")
      .eq("case_id", caseId)
      .eq("bimester", bimester)
      .maybeSingle();

    setProfile(data as ProfileData | null);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertTriangle size={32} className="mx-auto text-warning" />
        <h3 className="font-semibold">Perfil Acadêmico não preenchido</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          O Perfil Acadêmico deste bimestre ainda não foi preenchido.
          O preenchimento é responsabilidade do Coordenador.
        </p>
        <Badge variant="outline" className="text-warning border-warning/40">Pendente</Badge>
        <Button className="mt-4 gap-2" onClick={() => navigate(`/pacientes/${studentId}/perfil`)}>
          <Edit3 size={14} /> Preencher Perfil Acadêmico
        </Button>
      </div>
    );
  }

  const level = ADAPTATION_LEVELS[profile.adaptation_level] ?? ADAPTATION_LEVELS[1];
  const blocks = profile.blocks ?? {};

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Section nav */}
          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Blocos do Perfil</p>
              <div className="space-y-0.5">
                {PROFILE_SECTIONS.map((section, i) => {
                  const hasData = blocks[section.key] && (
                    typeof blocks[section.key] === "string"
                      ? blocks[section.key].trim() !== ""
                      : Array.isArray(blocks[section.key])
                        ? blocks[section.key].length > 0
                        : Object.keys(blocks[section.key] ?? {}).length > 0
                  );
                  return (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(i)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === i
                          ? "bg-primary text-primary-foreground"
                          : hasData
                            ? "text-success hover:bg-muted"
                            : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeSection === i ? "bg-primary-foreground/20" : hasData ? "bg-success/20" : "bg-muted"
                      }`}>
                        {hasData ? <Check size={10} /> : i + 1}
                      </div>
                      <span className="truncate">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Scores + Level */}
          <Card className="border-primary/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Nível de Adaptação</p>
              </div>

              {/* Score bars */}
              {profile.scores && Object.entries(profile.scores).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span className="capitalize">{key === "raciocinio" ? "Raciocínio" : key}</span>
                    <span className={`font-semibold px-1.5 py-0.5 rounded ${SCORE_COLORS[value] ?? ""}`}>
                      {value}/5
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <Separator />

              <div className={`p-3 rounded-xl text-center ${level.color}`}>
                <p className="text-lg font-bold">Nível {profile.adaptation_level}</p>
                <p className="text-xs font-semibold">{level.label}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{level.description}</p>

              {profile.completed && (
                <Badge className="w-full justify-center bg-success/10 text-success border-success/30">
                  <Check size={10} className="mr-1" /> Perfil concluído
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Content area (read-only) ── */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = PROFILE_SECTIONS[activeSection].icon;
                  return <Icon size={18} className="text-primary" />;
                })()}
                <h3 className="text-lg font-bold">{PROFILE_SECTIONS[activeSection].label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Preenchido pelo Coordenador</Badge>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => navigate(`/pacientes/${studentId}/perfil`)}>
                  <Edit3 size={12} /> Editar
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Bloco {activeSection + 1} de {PROFILE_SECTIONS.length}</span>
                <span>{Math.round(((activeSection + 1) / PROFILE_SECTIONS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((activeSection + 1) / PROFILE_SECTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Section content */}
            <SectionContent sectionKey={PROFILE_SECTIONS[activeSection].key} data={blocks[PROFILE_SECTIONS[activeSection].key]} />

            {/* Recommendations (show on last section) */}
            {activeSection === PROFILE_SECTIONS.length - 1 && profile.recommendations && (
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Recomendações</p>
                <p className="text-sm whitespace-pre-wrap">{profile.recommendations}</p>
              </div>
            )}

            {/* Nav */}
            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setActiveSection(Math.min(PROFILE_SECTIONS.length - 1, activeSection + 1))}
                disabled={activeSection === PROFILE_SECTIONS.length - 1}
                className="text-sm text-primary hover:text-primary/80 disabled:opacity-30 transition-colors"
              >
                Próximo →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Section content renderer (read-only) ────────────────────────────────────

function SectionContent({ sectionKey, data }: { sectionKey: string; data: any }) {
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Este bloco ainda não foi preenchido.
      </p>
    );
  }

  // If data is a string (old format / observations)
  if (typeof data === "string") {
    return <p className="text-sm whitespace-pre-wrap">{data}</p>;
  }

  // If data is an object with checkbox/radio selections
  if (typeof data === "object" && !Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([field, value]) => (
          <div key={field}>
            <p className="text-sm font-semibold mb-2 capitalize">
              {field.replace(/_/g, " ")}
            </p>
            {Array.isArray(value) ? (
              // Checkboxes — show selected items
              <div className="grid sm:grid-cols-2 gap-1.5">
                {(value as string[]).map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20 text-sm">
                    <Check size={12} className="text-success flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : typeof value === "string" ? (
              // Radio — show selected option
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <Check size={12} className="text-primary flex-shrink-0" />
                <span>{value}</span>
              </div>
            ) : (
              // Table/matrix data
              <p className="text-sm text-muted-foreground">{JSON.stringify(value)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">{JSON.stringify(data)}</p>;
}
