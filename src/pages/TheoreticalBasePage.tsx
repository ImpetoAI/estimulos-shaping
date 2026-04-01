import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  GraduationCap,
  Sparkles,
  FileText,
  Edit3,
  Download,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Save,
  FileDown,
  History,
  Layers,
  Target,
  Lightbulb,
  Palette,
  AlertCircle,
  PenTool,
  ClipboardList,
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
  photo: null as string | null,
  materialType: "Apostila",
  status: "Currículo concluído",
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
  { version: 2, author: "Dra. Maria", date: "11/03/2026", status: "Em revisão" },
  { version: 1, author: "Dra. Maria", date: "10/03/2026", status: "Gerada" },
];

const mockGeneratedContent = `## 📘 PLANEJAMENTO COMPLETO — ALFABETIZAÇÃO E NUMERAMENTO ADAPTADO

**Nível:** 3º ano (adaptado)
**Perfil:** Aluno com adaptação significativa (Nível 3)

---

## 🧭 1. Objetivo Geral (adaptado)

Favorecer a progressão de habilidades de alfabetização e numeramento por meio de atividades visuais, concretas e de complexidade gradual, respeitando o ritmo e o perfil cognitivo do aluno.

---

## 🧩 2. Objetivos Específicos

- Reconhecer e nomear as letras do alfabeto.
- Associar letra inicial a imagens do cotidiano.
- Formar sílabas simples (CV).
- Realizar contagem de objetos até 20 com apoio visual.
- Reconhecer sequência numérica até 10.
- Interpretar imagens simples relacionadas ao cotidiano.
- Realizar traçados curvos e retos com suporte.

---

## 🧠 3. Habilidades BNCC (principais)

**EF01LP02** — Reconhecer letras do alfabeto e associar a fonemas.
**EF01MA01** — Contar objetos e relacionar quantidade a número.
(As atividades também conversam com EF01LP04, EF01MA04 e EF02LP01.)

---

## 📑 4. PLANEJAMENTO DAS ATIVIDADES (com enunciado + descrição)

---

### ATIVIDADE 1 — CAÇA-LETRAS VOGAIS

**Enunciado:**
Encontre e circule todas as vogais na grade de letras.

**Descrição:**
Grade 5x5 com letras em bastão maiúscula, tamanho grande, espaçamento amplo. O aluno deve circular as vogais (A, E, I, O, U). Incluir modelo das vogais ao lado da grade como referência visual. Atividade de reconhecimento visual e leitura funcional.

---

### ATIVIDADE 2 — LIGA IMAGEM À LETRA INICIAL

**Enunciado:**
Ligue cada imagem à letra que começa o nome dela.

**Descrição:**
4 imagens à esquerda (ex: Abacaxi, Estrela, Ovo, Uva) e 4 letras à direita (A, E, O, U). Imagens coloridas, contorno definido, fundo limpo. Pontilhado guia para o traçado da ligação. Atividade de associação fonema-grafema.

---

### ATIVIDADE 3 — PINTE A LETRA CERTA

**Enunciado:**
Olhe a imagem e pinte a letra que começa o nome.

**Descrição:**
Imagem grande de um objeto (ex: Bola) com 3 letras abaixo (B, M, T). O aluno pinta apenas a letra correta. Letras em tamanho grande, com contorno grosso para facilitar a pintura.

---

### ATIVIDADE 4 — COMPLETE A SÍLABA

**Enunciado:**
Complete a palavra com a sílaba que falta.

**Descrição:**
Palavras simples com uma sílaba faltando e apoio de imagem. Ex: BO___ (BOLA) com imagem de bola ao lado. Sílaba pontilhada como modelo de escrita. Atividade de formação silábica simples (CV).

---

### ATIVIDADE 5 — CONTAGEM COM APOIO VISUAL

**Enunciado:**
Conte os objetos e escreva o número.

**Descrição:**
Grupos de objetos grandes e alinhados (1 a 10), com espaço para escrita ao lado. Número pontilhado como modelo de escrita. Objetos do cotidiano (frutas, estrelas, bolas). Atividade de contagem com registro numérico.

---

### ATIVIDADE 6 — LIGUE O NÚMERO À QUANTIDADE

**Enunciado:**
Ligue cada número ao grupo com a quantidade certa.

**Descrição:**
Números de 1 a 5 à esquerda, grupos de objetos à direita. Pontilhado cruzado para guiar a ligação. Objetos grandes e bem espaçados. Atividade de associação número-quantidade.

---

### ATIVIDADE 7 — SEQUÊNCIA NUMÉRICA (1 A 10)

**Enunciado:**
Complete a sequência escrevendo os números que faltam.

**Descrição:**
Linha numérica de 1 a 10 com alguns números faltando (ex: 1, __, 3, __, 5...). Números pontilhados nos espaços em branco. Atividade de reconhecimento e escrita de sequência numérica.

---

### ATIVIDADE 8 — SEQUÊNCIA LÓGICA DE IMAGENS (1-2-3)

**Enunciado:**
Coloque os números 1, 2 e 3 na ordem correta.

**Descrição:**
Três imagens simples fora de ordem representando uma sequência do cotidiano (ex: 1-Acordar, 2-Escovar dentes, 3-Tomar café). Quadros separados com numeração pontilhada. Dica visual com seta indicativa de direção.

---

### ATIVIDADE 9 — PAREAMENTO: PALAVRA → FIGURA

**Enunciado:**
Ligue cada palavra à figura correta.

**Descrição:**
4 palavras simples à esquerda (ex: SOL, LUA, PÉ, MÃO) e 4 imagens correspondentes à direita. Palavras em bastão maiúscula, tamanho grande. Pontilhado guia para ligação. Atividade de leitura funcional e associação.

---

### ATIVIDADE 10 — IDENTIFIQUE AS FORMAS

**Enunciado:**
Circule todos os círculos de azul e todos os quadrados de vermelho.

**Descrição:**
Conjunto de formas geométricas planas misturadas (círculos, quadrados, triângulos). Formas grandes e bem espaçadas. Atividade de classificação e reconhecimento de formas.

---

### ATIVIDADE 11 — TRAÇADO DE LINHAS

**Enunciado:**
Siga o pontilhado e complete o caminho.

**Descrição:**
Linhas retas e curvas pontilhadas que levam de um objeto a outro (ex: abelha até a flor). Traçado com espessura adequada para lápis. Progressão: primeiro retas, depois curvas. Atividade de coordenação motora fina.

---

### ATIVIDADE 12 — PINTURA DIRIGIDA POR LEGENDA

**Enunciado:**
Pinte o desenho usando as cores da legenda.

**Descrição:**
Desenho simples com áreas numeradas e legenda de cores (1=azul, 2=amarelo, 3=verde). Contornos grossos e bem definidos. Máximo de 3 cores para evitar sobrecarga. Atividade de coordenação motora e atenção.

---

### ATIVIDADE 13 — ANTIGO x NOVO (CLASSIFICAÇÃO)

**Enunciado:**
Marque X no quadro certo: ANTIGO ou NOVO.

**Descrição:**
Figuras misturadas de objetos antigos e atuais (ex: vela/lâmpada, cavalo/carro). O aluno classifica visualmente marcando na coluna correta. Atividade de classificação e raciocínio lógico.

---

### ATIVIDADE 14 — CAÇA-PALAVRAS FÁCIL

**Enunciado:**
Encontre as palavras: BOLA, CASA, GATO, PATO.

**Descrição:**
Caça-palavras pequeno (6x6), apenas horizontal e vertical. Palavras do cotidiano do aluno. Imagens das palavras ao lado como apoio visual. Atividade focada em leitura funcional.

---

### ATIVIDADE 15 — RECORTE E COLE NA ORDEM

**Enunciado:**
Recorte as imagens e cole na ordem certa.

**Descrição:**
Cartela com 3 imagens de uma sequência temporal (ex: plantar semente → regar → flor crescer). Espaços numerados para colagem. Atividade de organização sequencial e coordenação motora.

---

### ATIVIDADE 16 — LEITURA CURTA + RESPOSTA

**Enunciado:**
Leia e responda com uma palavra.

**Descrição:**
Texto curto de 2 frases: "O gato é pequeno. Ele gosta de leite." Perguntas simples com espaço para resposta: 1) O que é pequeno? 2) O que ele gosta? Atividade de compreensão e interpretação textual.

---

### ATIVIDADE 17 — COMPLETE A FRASE

**Enunciado:**
Complete a frase usando uma das palavras: gato / sol / bola.

**Descrição:**
Frase simples com lacuna: "O ___ é amarelo." Palavras de apoio com imagens ao lado. Atividade de escrita funcional e compreensão de contexto.

---

### ATIVIDADE 18 — JOGO DAS SOMBRAS

**Enunciado:**
Ligue cada objeto à sua sombra correta.

**Descrição:**
Objetos coloridos à esquerda e silhuetas correspondentes à direita. Objetos do cotidiano (estrela, coração, casa, árvore). Atividade de discriminação visual e atenção.

---

### ATIVIDADE 19 — OBSERVE A IMAGEM E ESCREVA

**Enunciado:**
Observe a imagem e escreva 3 palavras que você vê.

**Descrição:**
Imagem colorida de uma cena simples (ex: parque com crianças). Linhas pontilhadas para escrita. O aluno pode escrever palavras como: "sol", "bola", "flor". Atividade de produção escrita com apoio visual.

---

### ATIVIDADE 20 — MINHA FRASE SOBRE O QUE APRENDI

**Enunciado:**
Escreva uma frase sobre o que você aprendeu hoje.

**Descrição:**
Produção curta e livre, com apoio de imagens de referência (letras, números, formas). Linha pontilhada para escrita. Atividade de produção textual dirigida com suporte visual.

---

## 🎨 5. Orientações para o Setor de Design

- Diagramar com amplo espaçamento entre elementos.
- Usar fonte bastão maiúscula, tamanho mínimo 16pt.
- Limitar a 2-3 atividades por página.
- Fundo branco, sem texturas que dificultem leitura.
- Ícones de instrução no topo de cada atividade.
- Cores suaves, sem excesso de estímulos visuais.
- Incluir área de nome do aluno e data em cada página.
- Contornos grossos e bem definidos em todas as ilustrações.
- Imagens sempre coloridas, com fundo limpo.

---

## 📝 6. Observações Finais

Material deve ser impresso em folha A4 e plastificado quando possível. Recomenda-se uso com mediação de terapeuta ou professor de apoio. Reavaliar progressão após 4 semanas de uso. Cada atividade deve ser apresentada individualmente, respeitando o tempo de processamento do aluno.`;

// ── Mock final product activities ─────────────────────────
const mockFinalActivities = [
  { number: 1, title: "O QUE É ARQUEOLOGIA?", enunciado: "Leia a frase e circule a palavra \"arqueologia\".", descricao: "Frase simples como \"A arqueologia estuda coisas antigas.\"\nO aluno identifica visualmente a palavra-chave.\nAtividade de leitura funcional.", tipo: "Leitura" },
  { number: 2, title: "PINTE O ARQUEÓLOGO", enunciado: "Pinte apenas o arqueólogo.", descricao: "Ilustração grande com um arqueólogo, uma criança e uma árvore.\nO aluno deve reconhecer o personagem indicado.", tipo: "Pintura" },
  { number: 3, title: "PAREAMENTO: VESTÍGIO → NOME", enunciado: "Ligue cada vestígio ao nome correto.", descricao: "Imagens de: cerâmica, osso, ferramenta de pedra e pintura rupestre.\nNomes escritos em coluna ao lado.", tipo: "Pareamento" },
  { number: 4, title: "ANTIGO x ATUAL", enunciado: "Marque X no quadro certo: ANTIGO ou ATUAL.", descricao: "Figuras misturadas: vasinho de barro antigo, lanterna moderna, pedra lascada, celular.\nO aluno classifica visualmente.", tipo: "Classificação" },
  { number: 5, title: "O QUE O ARQUEÓLOGO USA?", enunciado: "Circule os objetos que o arqueólogo usa para trabalhar.", descricao: "Imagens: pincel, pá, lanterna, colher, celular, escova.\nO aluno circula apenas materiais reais de escavação.", tipo: "Identificação" },
  { number: 6, title: "SEQUÊNCIA DE ESCAVAÇÃO (1–2–3)", enunciado: "Coloque os números 1, 2 e 3 na ordem correta.", descricao: "Três imagens simples:\n1 – Arqueólogo cavando\n2 – Arqueólogo encontrando objeto\n3 – Arqueólogo limpando o vestígio", tipo: "Sequência" },
  { number: 7, title: "LEITURA SIMPLES: O QUE É VESTÍGIO?", enunciado: "Leia e sublinhe a palavra VESTÍGIO.", descricao: "Frase curta: \"O vestígio é uma pista do passado.\"", tipo: "Leitura" },
  { number: 8, title: "QUAL É O VESTÍGIO?", enunciado: "Circule apenas os vestígios antigos.", descricao: "Imagens misturadas:\n✔ pedra lascada\n✔ pintura rupestre\n✘ skate\n✘ videogame\n✔ pote de barro", tipo: "Identificação" },
  { number: 9, title: "FERRAMENTAS ANTIGAS E SUAS FUNÇÕES", enunciado: "Ligue a ferramenta ao seu uso.", descricao: "Desenhos simples:\n• Pedra afiada → cortar\n• Graveto queimado → fazer fogo\n• Pote de barro → guardar comida", tipo: "Pareamento" },
  { number: 10, title: "JOGO DAS SOMBRAS", enunciado: "Ligue cada objeto antigo à sua sombra.", descricao: "Atividade visual com silhuetas (cerâmica, machado de pedra, jarro).\nAjuda na discriminação visual.", tipo: "Visual" },
  { number: 11, title: "CAÇA-PALAVRAS FÁCIL", enunciado: "Encontre as palavras: FOGO, PEDRA, VASO, PINTURA.", descricao: "Caça-palavras pequeno, apenas horizontal e vertical.\nFocado em leitura.", tipo: "Leitura" },
  { number: 12, title: "DIFERENÇAS ENTRE PASSADO E PRESENTE", enunciado: "Pinte de amarelo o que é do passado.\nPinte de azul o que é do presente.", descricao: "Imagens em sequência: caverna, casa moderna, fogueira, fogão, pedra lascada, faca moderna.", tipo: "Classificação" },
  { number: 13, title: "ENCONTRE O ERRO", enunciado: "Olhe o desenho e marque um X no objeto que não existia na época dos primeiros humanos.", descricao: "Cena: família pré-histórica, fogueira, pedra… e um item errado (como uma bola ou mochila).\nO aluno identifica o estranho.", tipo: "Raciocínio" },
  { number: 14, title: "MONTE A CENA PRÉ-HISTÓRICA", enunciado: "Recorte e cole os objetos que pertencem à vida dos primeiros humanos.", descricao: "Cartela com itens antigos & modernos.\nO aluno cola apenas os adequados no cenário.", tipo: "Recorte/Colagem" },
  { number: 15, title: "LEITURA CURTA + RESPOSTA", enunciado: "Leia e responda com uma palavra.", descricao: "Texto curto: \"Os arqueólogos estudam o passado. Eles encontram objetos antigos na terra.\"\nPerguntas simples:\n1. O que eles estudam?\n2. Onde encontram objetos?", tipo: "Interpretação" },
  { number: 16, title: "LIGAÇÃO: PASSADO → ATUAL", enunciado: "Ligue o objeto antigo ao objeto atual parecido.", descricao: "Exemplo:\n• Tocha → lanterna\n• Pedra para cortar → faca\n• Caverna → casa", tipo: "Pareamento" },
  { number: 17, title: "COMPLETE A FRASE", enunciado: "Complete a frase usando uma das palavras: pedra / fogo / vaso.", descricao: "Frase simples: \"Os primeiros humanos usavam ____ para cortar.\"\nFacilita a escrita funcional.", tipo: "Escrita" },
  { number: 18, title: "MEMÓRIA: VESTÍGIOS", enunciado: "Descubra e pinte os pares iguais.", descricao: "Jogo de memória impresso com cartas de vestígios: machadinha de pedra, caverna, fogueira, cerâmica.", tipo: "Visual" },
  { number: 19, title: "OBSERVE A IMAGEM", enunciado: "Observe a imagem e escreva 3 palavras que você vê.", descricao: "Imagem: arqueólogo trabalhando com ferramentas.\nO aluno pode escrever palavras como: \"pá\", \"terra\", \"pincel\".", tipo: "Escrita" },
  { number: 20, title: "MINHA FRASE SOBRE O PASSADO", enunciado: "Escreva uma frase sobre o que você aprendeu.", descricao: "Produção curta, com apoio de imagens (pedra, arqueólogo, fogueira).", tipo: "Escrita" },
];

const tipoBadgeColors: Record<string, string> = {
  "Leitura": "bg-primary/15 text-primary",
  "Pintura": "bg-secondary/15 text-secondary",
  "Pareamento": "bg-warning/15 text-warning",
  "Classificação": "bg-accent text-accent-foreground",
  "Identificação": "bg-primary/15 text-primary",
  "Sequência": "bg-warning/15 text-warning",
  "Visual": "bg-secondary/15 text-secondary",
  "Raciocínio": "bg-success/15 text-success",
  "Recorte/Colagem": "bg-accent text-accent-foreground",
  "Interpretação": "bg-success/15 text-success",
  "Escrita": "bg-primary/15 text-primary",
};

// ── Status badge map ──────────────────────────────────────
const statusColors: Record<string, string> = {
  "Aguardando geração": "bg-muted text-muted-foreground",
  "Em geração": "bg-warning/15 text-warning",
  "Gerada": "bg-accent text-accent-foreground",
  "Em revisão": "bg-secondary/15 text-secondary",
  "Revisada": "bg-success/15 text-success",
  "Pronta para design": "bg-success/15 text-success",
};

// ── Component ─────────────────────────────────────────────
export default function TheoreticalBasePage() {
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(mockGeneratedContent);
  const [showVersions, setShowVersions] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Base Teórica de Atividades</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Geração de base pedagógica orientada por IA
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* ── Bloco A — Student Header ──────────────── */}
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
        {/* ── Left column — Context ───────────────── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Bloco B — Curriculum summary */}
          <motion.div
            className="kpi-card space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <h3 className="text-sm font-bold text-card-foreground">Currículo Adaptado</h3>
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
                    <Layers size={13} /> Áreas Prioritárias
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
                    <Target size={13} /> Objetivos Pedagógicos
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

          {/* Bloco C — Generation config */}
          <motion.div
            className="kpi-card space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-secondary" />
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
                <span className="text-muted-foreground">Prompt</span>
                <span className="font-semibold text-card-foreground">v1.0 (padrão)</span>
              </div>
            </div>

            {/* Generate button */}
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
                  <RotateCcw size={16} /> Regenerar Base Teórica
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Gerar Base Teórica
                </>
              )}
            </Button>
          </motion.div>

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
                  <h3 className="text-sm font-bold text-card-foreground">Histórico de Versões</h3>
                </span>
                {showVersions ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
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

        {/* ── Right column — Result ───────────────── */}
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
                  transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5 } }}
                  className="w-16 h-16 rounded-2xl bg-secondary/15 flex items-center justify-center"
                >
                  <Sparkles size={28} className="text-secondary" />
                </motion.div>
                <p className="text-sm font-semibold text-card-foreground">Gerando base teórica...</p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  A IA está analisando o currículo adaptado e criando sugestões personalizadas para {mockStudent.name}.
                </p>
              </motion.div>
            ) : generated ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tabs defaultValue="base" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="base" className="gap-2 text-sm font-semibold">
                      <ClipboardList size={15} /> Base Teórica
                    </TabsTrigger>
                    <TabsTrigger value="produto" className="gap-2 text-sm font-semibold">
                      <PenTool size={15} /> Produto Final (Questões)
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Tab: Base Teórica ── */}
                  <TabsContent value="base">
                    <div className="kpi-card space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={18} className="text-primary" />
                          <h3 className="text-sm font-bold text-card-foreground">Base Teórica Gerada</h3>
                          <Badge className="bg-success/15 text-success border-0 text-[10px]">v3</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-1.5 text-xs">
                            {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
                            {isEditing ? "Visualizar" : "Editar"}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Save size={14} /> Salvar</Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><FileDown size={14} /> PDF</Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download size={14} /> DOCX</Button>
                        </div>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full min-h-[600px] p-4 rounded-lg border border-input bg-background text-foreground text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
                      ) : (
                        <div className="prose-container p-5 rounded-lg bg-muted/30 border border-border/50 max-h-[700px] overflow-y-auto">
                          <MarkdownRenderer content={content} />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* ── Tab: Produto Final ── */}
                  <TabsContent value="produto">
                    <div className="kpi-card space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <PenTool size={18} className="text-secondary" />
                          <h3 className="text-sm font-bold text-card-foreground">Produto Final — Questões Adaptadas</h3>
                          <Badge className="bg-secondary/15 text-secondary border-0 text-[10px]">20 atividades</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><FileDown size={14} /> PDF</Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download size={14} /> DOCX</Button>
                        </div>
                      </div>

                      {/* Theme header */}
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <h4 className="text-base font-bold text-card-foreground flex items-center gap-2">
                          📘 Planejamento Completo — Arqueologia, Vestígios e Primeiros Humanos
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span><strong className="text-card-foreground">Nível:</strong> 3º ao 5º ano (adaptado)</span>
                          <span><strong className="text-card-foreground">Perfil:</strong> Aluno autista semi verbal</span>
                          <span><strong className="text-card-foreground">BNCC:</strong> EF03HI02</span>
                        </div>
                      </div>

                      {/* Activities list */}
                      <div className="max-h-[650px] overflow-y-auto space-y-3 pr-1">
                        {mockFinalActivities.map((act, idx) => (
                          <motion.div
                            key={act.number}
                            className="rounded-xl border border-border/60 bg-background overflow-hidden"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            {/* Activity header */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border/40">
                              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                                {act.number}
                              </span>
                              <h4 className="text-sm font-bold text-card-foreground flex-1">{act.title}</h4>
                              <Badge className={`text-[10px] border-0 font-semibold ${tipoBadgeColors[act.tipo] || "bg-muted text-muted-foreground"}`}>
                                {act.tipo}
                              </Badge>
                            </div>

                            <div className="p-4 space-y-3">
                              {/* Enunciado */}
                              <div className="rounded-lg bg-secondary/8 border border-secondary/20 p-3">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-secondary mb-1">📋 Enunciado</p>
                                <p className="text-sm text-card-foreground font-medium leading-relaxed whitespace-pre-line">{act.enunciado}</p>
                              </div>

                              {/* Descrição */}
                              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">📝 Descrição</p>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{act.descricao}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
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
                  <Palette size={28} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-card-foreground">
                  Nenhuma base teórica gerada ainda
                </p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  Clique em "Gerar Base Teórica" para criar sugestões de atividades pedagógicas adaptadas com base no currículo do aluno.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Simple Markdown Renderer ──────────────────────────────
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

  const renderInline = (text: string) => {
    // Handle **bold** segments
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={key++} className="text-card-foreground font-semibold">{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-2 text-sm text-card-foreground leading-relaxed">
      {lines.map((line, i) => {
        if (line.trim() === "---") {
          return <hr key={i} className="border-border/50 my-4" />;
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-base font-bold text-card-foreground mt-5 mb-2 pb-1 border-b border-border/50">
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-bold text-primary mt-4 mb-1">
              {line.replace("### ", "")}
            </h3>
          );
        }
        if (line.startsWith("- **")) {
          const match = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
          if (match) {
            return (
              <p key={i} className="pl-4 flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-card-foreground">{match[1]}</strong>
                  <span className="text-muted-foreground">{match[2]}</span>
                </span>
              </p>
            );
          }
        }
        if (line.startsWith("- ")) {
          return (
            <p key={i} className="pl-4 flex items-start gap-1.5 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>{renderInline(line.replace("- ", ""))}</span>
            </p>
          );
        }
        if (line.startsWith("* ")) {
          return (
            <p key={i} className="pl-4 flex items-start gap-1.5 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>{renderInline(line.replace("* ", ""))}</span>
            </p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-muted-foreground">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}
