import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, User, BookOpen, BarChart3, Settings2, FileOutput,
  ChevronDown, ChevronUp, Edit3, Download, Check, AlertTriangle, Zap, Sparkles
} from "lucide-react";
import VersionControlPanel, { curriculumVersions } from "@/components/VersionControlPanel";

const adaptationLevels = [
  { level: 1, name: "Adaptação Leve", desc: "Mantém currículo da turma com adaptações de linguagem, apoio visual e formato.", color: "bg-success/15 text-success" },
  { level: 2, name: "Adaptação Moderada", desc: "Prioriza objetivos essenciais, reduz escopo e amplitude de habilidades.", color: "bg-info/15 text-info" },
  { level: 3, name: "Adaptação Significativa", desc: "Usa conteúdos do ano anterior, reconstrói aprendizagem a partir de lacunas.", color: "bg-warning/15 text-warning" },
  { level: 4, name: "Currículo Paralelo", desc: "Conteúdos de etapa anterior com currículo paralelo à série formal.", color: "bg-secondary/15 text-secondary" },
  { level: 5, name: "Currículo Funcional", desc: "Foco em comunicação, autonomia e habilidades adaptativas.", color: "bg-destructive/15 text-destructive" },
];

const profileSummary = [
  { area: "Alfabetização", level: "Conhece vogais, lê sílabas simples", status: "medium" },
  { area: "Escrita", level: "Copia 1 palavra por vez", status: "low" },
  { area: "Matemática", level: "Contagem até 20, adição 1 termo", status: "medium" },
  { area: "Coordenação", level: "Pinta dentro do contorno", status: "high" },
  { area: "Interpretação", level: "Assinala imagem correta", status: "medium" },
  { area: "Comunicação", level: "Expressa preferências", status: "medium" },
];

const statusColor: Record<string, string> = {
  low: "bg-destructive/15 text-destructive",
  medium: "bg-warning/15 text-warning",
  high: "bg-success/15 text-success",
};

const curriculumAreas = [
  {
    area: "Linguagem e Alfabetização",
    objectives: [
      "Reconhecer todas as letras do alfabeto",
      "Formar sílabas simples (consoante + vogal)",
      "Relacionar palavras com figuras do cotidiano",
    ],
    strategies: ["Apoio visual com cartões", "Repetição guiada", "Atividades multissensoriais"],
    bncc: ["EF01LP01", "EF01LP04", "EF01LP07"],
  },
  {
    area: "Matemática",
    objectives: [
      "Contagem sequencial até 40",
      "Adição simples com 1 termo ilustrado",
      "Reconhecimento de formas geométricas planas",
    ],
    strategies: ["Material concreto", "Ilustrações", "Jogos de associação numérica"],
    bncc: ["EF01MA01", "EF01MA05", "EF01MA13"],
  },
  {
    area: "Coordenação Motora",
    objectives: [
      "Traçado de linhas retas e curvas",
      "Pintura dentro do contorno",
      "Recorte com suporte",
    ],
    strategies: ["Atividades de massinha", "Pontilhados progressivos", "Colagem dirigida"],
    bncc: [],
  },
];

export default function CurriculumPage() {
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [expandedArea, setExpandedArea] = useState<string | null>("Linguagem e Alfabetização");
  const [generated, setGenerated] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Currículo Acadêmico Adaptado</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Etapa 3 — Geração do currículo individualizado com base no perfil acadêmico
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">
          {/* Student header */}
          <motion.div className="kpi-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <User size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-card-foreground">Lucas Mendes</p>
                <p className="text-xs text-muted-foreground">4º Ano • 9 anos • 2026</p>
              </div>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-warning">
              Currículo em elaboração
            </span>
          </motion.div>

          {/* Profile summary */}
          <motion.div className="kpi-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="section-title flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Resumo do Perfil</h3>
            <div className="space-y-2">
              {profileSummary.map((p) => (
                <div key={p.area} className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{p.area}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status]}`}>
                    {p.level}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Adaptation level */}
          <motion.div className="kpi-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="section-title flex items-center gap-2"><Settings2 size={16} className="text-primary" /> Nível de Adaptação</h3>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-warning" />
              <span className="text-xs text-muted-foreground">Sugestão automática: Nível 3</span>
            </div>
            <div className="space-y-1.5">
              {adaptationLevels.map((al) => (
                <button
                  key={al.level}
                  onClick={() => setSelectedLevel(al.level)}
                  className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${
                    selectedLevel === al.level
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${al.color}`}>N{al.level}</span>
                    <span className="font-medium text-card-foreground">{al.name}</span>
                    {selectedLevel === al.level && <Check size={14} className="ml-auto text-primary" />}
                  </div>
                  {selectedLevel === al.level && (
                    <p className="text-xs text-muted-foreground mt-1.5">{al.desc}</p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Version Control */}
          {generated && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <VersionControlPanel documentType="Currículo Adaptado" versions={curriculumVersions} />
            </motion.div>
          )}
        </div>

        {/* Right column - Generated curriculum */}
        <div className="lg:col-span-2 space-y-5">
          {!generated ? (
            <motion.div
              className="kpi-card space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Intelligent suggestion banner */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-card-foreground">Sugestão Inteligente de Currículo</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Com base no perfil acadêmico de Lucas (4º ano, 9 anos), o sistema cruzou os dados com a BNCC e identificou:
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2 mt-3">
                      {[
                        { label: "Série base sugerida", value: "1º-2º ano", desc: "Baseado no nível de leitura/escrita" },
                        { label: "Áreas prioritárias", value: "3 áreas", desc: "Linguagem, Matemática, Coord. Motora" },
                        { label: "Habilidades BNCC", value: "9 selecionadas", desc: "EF01-EF02 compatíveis" },
                      ].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-card border border-border/40 text-center">
                          <p className="text-xs font-bold text-primary">{s.value}</p>
                          <p className="text-[10px] font-semibold text-card-foreground mt-0.5">{s.label}</p>
                          <p className="text-[9px] text-muted-foreground">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GraduationCap size={48} className="text-primary/30 mb-4" />
                <h3 className="text-lg font-bold text-card-foreground mb-2">Gerar Currículo Adaptado</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  O sistema irá cruzar o perfil acadêmico com a base curricular e as habilidades BNCC para gerar um currículo individualizado.
                </p>
                <button
                  onClick={() => setGenerated(true)}
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-colors flex items-center gap-2"
                >
                  <Zap size={18} /> Gerar com Sugestão Inteligente
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Actions bar */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Currículo Gerado</h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                    <Edit3 size={13} /> Editar
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                    <Download size={13} /> PDF
                  </button>
                </div>
              </div>

              {/* Curriculum document */}
              <motion.div
                className="bg-card rounded-xl border border-border"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Header */}
                <div className="p-5 border-b border-border bg-accent/30 rounded-t-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Currículo Acadêmico Adaptado Individualizado</p>
                  <p className="font-bold text-card-foreground">Lucas Mendes — 4º Ano — Nível 3: Adaptação Significativa</p>
                  <p className="text-xs text-muted-foreground mt-1">Gerado em 12/03/2026 • Versão 1.0</p>
                </div>

                {/* Synthesis */}
                <div className="p-5 border-b border-border">
                  <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <BookOpen size={15} /> Síntese do Perfil
                  </h3>
                  <p className="text-sm text-card-foreground leading-relaxed">
                    Lucas apresenta repertório acadêmico compatível com 1º/2º ano em linguagem e matemática.
                    Demonstra boa coordenação motora e expressa preferências de forma funcional.
                    A adaptação curricular significativa (Nível 3) é recomendada, priorizando habilidades fundamentais com apoio visual e concreto.
                  </p>
                </div>

                {/* Areas */}
                <div className="divide-y divide-border">
                  {curriculumAreas.map((area) => (
                    <div key={area.area}>
                      <button
                        onClick={() => setExpandedArea(expandedArea === area.area ? null : area.area)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-semibold text-sm text-card-foreground">{area.area}</span>
                        {expandedArea === area.area ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                      </button>
                      {expandedArea === area.area && (
                        <motion.div
                          className="px-5 pb-5 space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Objetivos Prioritários</p>
                            <ul className="space-y-1.5">
                              {area.objectives.map((o) => (
                                <li key={o} className="text-sm text-card-foreground flex items-start gap-2">
                                  <Check size={13} className="text-success mt-0.5 flex-shrink-0" />
                                  {o}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Estratégias Adaptadas</p>
                            <div className="flex flex-wrap gap-1.5">
                              {area.strategies.map((s) => (
                                <span key={s} className="text-xs px-2.5 py-1 bg-accent rounded-full text-accent-foreground font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                          {area.bncc.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Habilidades BNCC</p>
                              <div className="flex flex-wrap gap-1.5">
                                {area.bncc.map((b) => (
                                  <span key={b} className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-mono font-semibold">{b}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
