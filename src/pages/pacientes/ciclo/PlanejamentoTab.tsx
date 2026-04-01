import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  Edit3,
  Download,
  RotateCcw,
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
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/supabase";
import { type CicloTabProps } from "./_shared";

// ── Types ────────────────────────────────────────────────────────────────────
interface StudentData {
  full_name: string;
  birth_date: string | null;
  current_grade: string | null;
}

interface AcademicProfile {
  adaptation_level: number | null;
  scores: Record<string, unknown> | null;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const mockCurriculum = {
  adaptationLevel: 3,
  adaptationLabel: "Adaptacao Significativa",
  areas: [
    "Linguagem e Alfabetizacao",
    "Matematica",
    "Coordenacao Motora",
    "Compreensao e Interpretacao",
  ],
  goals: [
    "Reconhecer letras do alfabeto e formar silabas simples",
    "Contar objetos ate 20 com apoio visual",
    "Realizar tracados curvos e retos com suporte",
    "Interpretar imagens simples relacionadas ao cotidiano",
  ],
  strategies: [
    "Apoio visual constante",
    "Segmentacao de tarefas",
    "Repeticao estruturada",
    "Instrucoes curtas e diretas",
  ],
};

const mockVersions = [
  { version: 2, author: "Dra. Maria", date: "11/03/2026", status: "Em revisao" },
  { version: 1, author: "Dra. Maria", date: "10/03/2026", status: "Gerada" },
];

const mockGeneratedContent = `## PLANEJAMENTO COMPLETO — ALFABETIZACAO E NUMERAMENTO ADAPTADO

**Nivel:** 3o ano (adaptado)
**Perfil:** Aluno com adaptacao significativa (Nivel 3)

---

## 1. Objetivo Geral (adaptado)

Favorecer a progressao de habilidades de alfabetizacao e numeramento por meio de atividades visuais, concretas e de complexidade gradual, respeitando o ritmo e o perfil cognitivo do aluno.

---

## 2. Objetivos Especificos

- Reconhecer e nomear as letras do alfabeto.
- Associar letra inicial a imagens do cotidiano.
- Formar silabas simples (CV).
- Realizar contagem de objetos ate 20 com apoio visual.
- Reconhecer sequencia numerica ate 10.
- Interpretar imagens simples relacionadas ao cotidiano.
- Realizar tracados curvos e retos com suporte.

---

## 3. Habilidades BNCC (principais)

**EF01LP02** — Reconhecer letras do alfabeto e associar a fonemas.
**EF01MA01** — Contar objetos e relacionar quantidade a numero.
(As atividades tambem conversam com EF01LP04, EF01MA04 e EF02LP01.)

---

## 4. PLANEJAMENTO DAS ATIVIDADES (com enunciado + descricao)

---

### ATIVIDADE 1 — CACA-LETRAS VOGAIS

**Enunciado:**
Encontre e circule todas as vogais na grade de letras.

**Descricao:**
Grade 5x5 com letras em bastao maiuscula, tamanho grande, espacamento amplo. O aluno deve circular as vogais (A, E, I, O, U). Incluir modelo das vogais ao lado da grade como referencia visual. Atividade de reconhecimento visual e leitura funcional.

---

### ATIVIDADE 2 — LIGA IMAGEM A LETRA INICIAL

**Enunciado:**
Ligue cada imagem a letra que comeca o nome dela.

**Descricao:**
4 imagens a esquerda (ex: Abacaxi, Estrela, Ovo, Uva) e 4 letras a direita (A, E, O, U). Imagens coloridas, contorno definido, fundo limpo. Pontilhado guia para o tracado da ligacao. Atividade de associacao fonema-grafema.

---

### ATIVIDADE 3 — PINTE A LETRA CERTA

**Enunciado:**
Olhe a imagem e pinte a letra que comeca o nome.

**Descricao:**
Imagem grande de um objeto (ex: Bola) com 3 letras abaixo (B, M, T). O aluno pinta apenas a letra correta. Letras em tamanho grande, com contorno grosso para facilitar a pintura.

---

### ATIVIDADE 4 — COMPLETE A SILABA

**Enunciado:**
Complete a palavra com a silaba que falta.

**Descricao:**
Palavras simples com uma silaba faltando e apoio de imagem. Ex: BO___ (BOLA) com imagem de bola ao lado. Silaba pontilhada como modelo de escrita. Atividade de formacao silabica simples (CV).

---

### ATIVIDADE 5 — CONTAGEM COM APOIO VISUAL

**Enunciado:**
Conte os objetos e escreva o numero.

**Descricao:**
Grupos de objetos grandes e alinhados (1 a 10), com espaco para escrita ao lado. Numero pontilhado como modelo de escrita. Objetos do cotidiano (frutas, estrelas, bolas). Atividade de contagem com registro numerico.

---

### ATIVIDADE 6 — LIGUE O NUMERO A QUANTIDADE

**Enunciado:**
Ligue cada numero ao grupo com a quantidade certa.

**Descricao:**
Numeros de 1 a 5 a esquerda, grupos de objetos a direita. Pontilhado cruzado para guiar a ligacao. Objetos grandes e bem espacados. Atividade de associacao numero-quantidade.

---

### ATIVIDADE 7 — SEQUENCIA NUMERICA (1 A 10)

**Enunciado:**
Complete a sequencia escrevendo os numeros que faltam.

**Descricao:**
Linha numerica de 1 a 10 com alguns numeros faltando (ex: 1, __, 3, __, 5...). Numeros pontilhados nos espacos em branco. Atividade de reconhecimento e escrita de sequencia numerica.

---

### ATIVIDADE 8 — SEQUENCIA LOGICA DE IMAGENS (1-2-3)

**Enunciado:**
Coloque os numeros 1, 2 e 3 na ordem correta.

**Descricao:**
Tres imagens simples fora de ordem representando uma sequencia do cotidiano (ex: 1-Acordar, 2-Escovar dentes, 3-Tomar cafe). Quadros separados com numeracao pontilhada. Dica visual com seta indicativa de direcao.

---

### ATIVIDADE 9 — PAREAMENTO: PALAVRA -> FIGURA

**Enunciado:**
Ligue cada palavra a figura correta.

**Descricao:**
4 palavras simples a esquerda (ex: SOL, LUA, PE, MAO) e 4 imagens correspondentes a direita. Palavras em bastao maiuscula, tamanho grande. Pontilhado guia para ligacao. Atividade de leitura funcional e associacao.

---

### ATIVIDADE 10 — IDENTIFIQUE AS FORMAS

**Enunciado:**
Circule todos os circulos de azul e todos os quadrados de vermelho.

**Descricao:**
Conjunto de formas geometricas planas misturadas (circulos, quadrados, triangulos). Formas grandes e bem espacadas. Atividade de classificacao e reconhecimento de formas.

---

### ATIVIDADE 11 — TRACADO DE LINHAS

**Enunciado:**
Siga o pontilhado e complete o caminho.

**Descricao:**
Linhas retas e curvas pontilhadas que levam de um objeto a outro (ex: abelha ate a flor). Tracado com espessura adequada para lapis. Progressao: primeiro retas, depois curvas. Atividade de coordenacao motora fina.

---

### ATIVIDADE 12 — PINTURA DIRIGIDA POR LEGENDA

**Enunciado:**
Pinte o desenho usando as cores da legenda.

**Descricao:**
Desenho simples com areas numeradas e legenda de cores (1=azul, 2=amarelo, 3=verde). Contornos grossos e bem definidos. Maximo de 3 cores para evitar sobrecarga. Atividade de coordenacao motora e atencao.

---

### ATIVIDADE 13 — ANTIGO x NOVO (CLASSIFICACAO)

**Enunciado:**
Marque X no quadro certo: ANTIGO ou NOVO.

**Descricao:**
Figuras misturadas de objetos antigos e atuais (ex: vela/lampada, cavalo/carro). O aluno classifica visualmente marcando na coluna correta. Atividade de classificacao e raciocinio logico.

---

### ATIVIDADE 14 — CACA-PALAVRAS FACIL

**Enunciado:**
Encontre as palavras: BOLA, CASA, GATO, PATO.

**Descricao:**
Caca-palavras pequeno (6x6), apenas horizontal e vertical. Palavras do cotidiano do aluno. Imagens das palavras ao lado como apoio visual. Atividade focada em leitura funcional.

---

### ATIVIDADE 15 — RECORTE E COLE NA ORDEM

**Enunciado:**
Recorte as imagens e cole na ordem certa.

**Descricao:**
Cartela com 3 imagens de uma sequencia temporal (ex: plantar semente, regar, flor crescer). Espacos numerados para colagem. Atividade de organizacao sequencial e coordenacao motora.

---

### ATIVIDADE 16 — LEITURA CURTA + RESPOSTA

**Enunciado:**
Leia e responda com uma palavra.

**Descricao:**
Texto curto de 2 frases: "O gato e pequeno. Ele gosta de leite." Perguntas simples com espaco para resposta: 1) O que e pequeno? 2) O que ele gosta? Atividade de compreensao e interpretacao textual.

---

### ATIVIDADE 17 — COMPLETE A FRASE

**Enunciado:**
Complete a frase usando uma das palavras: gato / sol / bola.

**Descricao:**
Frase simples com lacuna: "O ___ e amarelo." Palavras de apoio com imagens ao lado. Atividade de escrita funcional e compreensao de contexto.

---

### ATIVIDADE 18 — JOGO DAS SOMBRAS

**Enunciado:**
Ligue cada objeto a sua sombra correta.

**Descricao:**
Objetos coloridos a esquerda e silhuetas correspondentes a direita. Objetos do cotidiano (estrela, coracao, casa, arvore). Atividade de discriminacao visual e atencao.

---

### ATIVIDADE 19 — OBSERVE A IMAGEM E ESCREVA

**Enunciado:**
Observe a imagem e escreva 3 palavras que voce ve.

**Descricao:**
Imagem colorida de uma cena simples (ex: parque com criancas). Linhas pontilhadas para escrita. O aluno pode escrever palavras como: "sol", "bola", "flor". Atividade de producao escrita com apoio visual.

---

### ATIVIDADE 20 — MINHA FRASE SOBRE O QUE APRENDI

**Enunciado:**
Escreva uma frase sobre o que voce aprendeu hoje.

**Descricao:**
Producao curta e livre, com apoio de imagens de referencia (letras, numeros, formas). Linha pontilhada para escrita. Atividade de producao textual dirigida com suporte visual.

---

## 5. Orientacoes para o Setor de Design

- Diagramar com amplo espacamento entre elementos.
- Usar fonte bastao maiuscula, tamanho minimo 16pt.
- Limitar a 2-3 atividades por pagina.
- Fundo branco, sem texturas que dificultem leitura.
- Icones de instrucao no topo de cada atividade.
- Cores suaves, sem excesso de estimulos visuais.
- Incluir area de nome do aluno e data em cada pagina.
- Contornos grossos e bem definidos em todas as ilustracoes.
- Imagens sempre coloridas, com fundo limpo.

---

## 6. Observacoes Finais

Material deve ser impresso em folha A4 e plastificado quando possivel. Recomenda-se uso com mediacao de terapeuta ou professor de apoio. Reavaliar progressao apos 4 semanas de uso. Cada atividade deve ser apresentada individualmente, respeitando o tempo de processamento do aluno.`;

const mockFinalActivities = [
  { number: 1, title: "O QUE E ARQUEOLOGIA?", enunciado: "Leia a frase e circule a palavra \"arqueologia\".", descricao: "Frase simples como \"A arqueologia estuda coisas antigas.\"\nO aluno identifica visualmente a palavra-chave.\nAtividade de leitura funcional.", tipo: "Leitura" },
  { number: 2, title: "PINTE O ARQUEOLOGO", enunciado: "Pinte apenas o arqueologo.", descricao: "Ilustracao grande com um arqueologo, uma crianca e uma arvore.\nO aluno deve reconhecer o personagem indicado.", tipo: "Pintura" },
  { number: 3, title: "PAREAMENTO: VESTIGIO -> NOME", enunciado: "Ligue cada vestigio ao nome correto.", descricao: "Imagens de: ceramica, osso, ferramenta de pedra e pintura rupestre.\nNomes escritos em coluna ao lado.", tipo: "Pareamento" },
  { number: 4, title: "ANTIGO x ATUAL", enunciado: "Marque X no quadro certo: ANTIGO ou ATUAL.", descricao: "Figuras misturadas: vasinho de barro antigo, lanterna moderna, pedra lascada, celular.\nO aluno classifica visualmente.", tipo: "Classificacao" },
  { number: 5, title: "O QUE O ARQUEOLOGO USA?", enunciado: "Circule os objetos que o arqueologo usa para trabalhar.", descricao: "Imagens: pincel, pa, lanterna, colher, celular, escova.\nO aluno circula apenas materiais reais de escavacao.", tipo: "Identificacao" },
  { number: 6, title: "SEQUENCIA DE ESCAVACAO (1-2-3)", enunciado: "Coloque os numeros 1, 2 e 3 na ordem correta.", descricao: "Tres imagens simples:\n1 - Arqueologo cavando\n2 - Arqueologo encontrando objeto\n3 - Arqueologo limpando o vestigio", tipo: "Sequencia" },
  { number: 7, title: "LEITURA SIMPLES: O QUE E VESTIGIO?", enunciado: "Leia e sublinhe a palavra VESTIGIO.", descricao: "Frase curta: \"O vestigio e uma pista do passado.\"", tipo: "Leitura" },
  { number: 8, title: "QUAL E O VESTIGIO?", enunciado: "Circule apenas os vestigios antigos.", descricao: "Imagens misturadas:\npedra lascada\npintura rupestre\nskate\nvideogame\npote de barro", tipo: "Identificacao" },
  { number: 9, title: "FERRAMENTAS ANTIGAS E SUAS FUNCOES", enunciado: "Ligue a ferramenta ao seu uso.", descricao: "Desenhos simples:\nPedra afiada -> cortar\nGraveto queimado -> fazer fogo\nPote de barro -> guardar comida", tipo: "Pareamento" },
  { number: 10, title: "JOGO DAS SOMBRAS", enunciado: "Ligue cada objeto antigo a sua sombra.", descricao: "Atividade visual com silhuetas (ceramica, machado de pedra, jarro).\nAjuda na discriminacao visual.", tipo: "Visual" },
  { number: 11, title: "CACA-PALAVRAS FACIL", enunciado: "Encontre as palavras: FOGO, PEDRA, VASO, PINTURA.", descricao: "Caca-palavras pequeno, apenas horizontal e vertical.\nFocado em leitura.", tipo: "Leitura" },
  { number: 12, title: "DIFERENCAS ENTRE PASSADO E PRESENTE", enunciado: "Pinte de amarelo o que e do passado.\nPinte de azul o que e do presente.", descricao: "Imagens em sequencia: caverna, casa moderna, fogueira, fogao, pedra lascada, faca moderna.", tipo: "Classificacao" },
  { number: 13, title: "ENCONTRE O ERRO", enunciado: "Olhe o desenho e marque um X no objeto que nao existia na epoca dos primeiros humanos.", descricao: "Cena: familia pre-historica, fogueira, pedra... e um item errado (como uma bola ou mochila).\nO aluno identifica o estranho.", tipo: "Raciocinio" },
  { number: 14, title: "MONTE A CENA PRE-HISTORICA", enunciado: "Recorte e cole os objetos que pertencem a vida dos primeiros humanos.", descricao: "Cartela com itens antigos & modernos.\nO aluno cola apenas os adequados no cenario.", tipo: "Recorte/Colagem" },
  { number: 15, title: "LEITURA CURTA + RESPOSTA", enunciado: "Leia e responda com uma palavra.", descricao: "Texto curto: \"Os arqueologos estudam o passado. Eles encontram objetos antigos na terra.\"\nPerguntas simples:\n1. O que eles estudam?\n2. Onde encontram objetos?", tipo: "Interpretacao" },
  { number: 16, title: "LIGACAO: PASSADO -> ATUAL", enunciado: "Ligue o objeto antigo ao objeto atual parecido.", descricao: "Exemplo:\nTocha -> lanterna\nPedra para cortar -> faca\nCaverna -> casa", tipo: "Pareamento" },
  { number: 17, title: "COMPLETE A FRASE", enunciado: "Complete a frase usando uma das palavras: pedra / fogo / vaso.", descricao: "Frase simples: \"Os primeiros humanos usavam ____ para cortar.\"\nFacilita a escrita funcional.", tipo: "Escrita" },
  { number: 18, title: "MEMORIA: VESTIGIOS", enunciado: "Descubra e pinte os pares iguais.", descricao: "Jogo de memoria impresso com cartas de vestigios: machadinha de pedra, caverna, fogueira, ceramica.", tipo: "Visual" },
  { number: 19, title: "OBSERVE A IMAGEM", enunciado: "Observe a imagem e escreva 3 palavras que voce ve.", descricao: "Imagem: arqueologo trabalhando com ferramentas.\nO aluno pode escrever palavras como: \"pa\", \"terra\", \"pincel\".", tipo: "Escrita" },
  { number: 20, title: "MINHA FRASE SOBRE O PASSADO", enunciado: "Escreva uma frase sobre o que voce aprendeu.", descricao: "Producao curta, com apoio de imagens (pedra, arqueologo, fogueira).", tipo: "Escrita" },
];

const tipoBadgeColors: Record<string, string> = {
  "Leitura": "bg-primary/15 text-primary",
  "Pintura": "bg-secondary/15 text-secondary",
  "Pareamento": "bg-warning/15 text-warning",
  "Classificacao": "bg-accent text-accent-foreground",
  "Identificacao": "bg-primary/15 text-primary",
  "Sequencia": "bg-warning/15 text-warning",
  "Visual": "bg-secondary/15 text-secondary",
  "Raciocinio": "bg-success/15 text-success",
  "Recorte/Colagem": "bg-accent text-accent-foreground",
  "Interpretacao": "bg-success/15 text-success",
  "Escrita": "bg-primary/15 text-primary",
};

const statusColors: Record<string, string> = {
  "Aguardando geracao": "bg-muted text-muted-foreground",
  "Em geracao": "bg-warning/15 text-warning",
  "Gerada": "bg-accent text-accent-foreground",
  "Em revisao": "bg-secondary/15 text-secondary",
  "Revisada": "bg-success/15 text-success",
  "Pronta para design": "bg-success/15 text-success",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PlanejamentoTab({ caseId, bimester, studentId }: CicloTabProps) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(mockGeneratedContent);
  const [showVersions, setShowVersions] = useState(false);

  // ── Load student data ────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingStudent(true);

    Promise.all([
      db.from("students").select("full_name, birth_date, current_grade").eq("id", studentId).single(),
      db.from("academic_profiles").select("adaptation_level, scores").eq("case_id", caseId).eq("bimester", bimester).maybeSingle(),
    ]).then(([studentRes, profileRes]) => {
      if (studentRes.data) setStudent(studentRes.data as StudentData);
      if (profileRes.data) setProfile(profileRes.data as AcademicProfile);
      setLoadingStudent(false);
    });
  }, [studentId, caseId, bimester]);

  // ── Derived values ───────────────────────────────────────────────────────
  const studentName = student?.full_name ?? "Aluno";
  const studentAge = student?.birth_date ? calculateAge(student.birth_date) : null;
  const studentGrade = student?.current_grade ?? null;
  const studentInitial = studentName.charAt(0).toUpperCase();
  const currentYear = new Date().getFullYear().toString();

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingStudent) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-5">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Student Header Bar ────────────────────────────────────────────── */}
      <motion.div
        className="kpi-card flex flex-wrap items-center gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
          {studentInitial}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-lg font-bold text-card-foreground">{studentName}</h2>
          <p className="text-sm text-muted-foreground">
            {studentAge !== null && `${studentAge} anos · `}
            {studentGrade && `${studentGrade} · `}
            Ano letivo {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs font-semibold border-primary/30 text-primary">
            <FileText size={12} /> Apostila
          </Badge>
          <Badge className="gap-1.5 py-1 px-3 text-xs font-semibold bg-success/15 text-success border-0">
            <CheckCircle2 size={12} /> {bimester}o Bimestre
          </Badge>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column — Context ─────────────────────────────────────── */}
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
              <h3 className="text-sm font-bold text-card-foreground">Curriculo Adaptado</h3>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Nivel de Adaptacao
              </p>
              <Badge className="bg-secondary/15 text-secondary border-0 text-xs font-semibold">
                Nivel {profile?.adaptation_level ?? mockCurriculum.adaptationLevel} — {mockCurriculum.adaptationLabel}
              </Badge>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="areas" className="border-border/50">
                <AccordionTrigger className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2 hover:no-underline">
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} /> Areas Prioritarias
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
                    <Target size={13} /> Objetivos Pedagogicos
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
                    <Lightbulb size={13} /> Estrategias
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
              <Sparkles size={18} className="text-secondary" />
              <h3 className="text-sm font-bold text-card-foreground">Configuracao</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material</span>
                <span className="font-semibold text-card-foreground">Apostila</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Curriculo</span>
                <span className="font-semibold text-card-foreground">v{profile?.adaptation_level ?? mockCurriculum.adaptationLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prompt</span>
                <span className="font-semibold text-card-foreground">v1.0 (padrao)</span>
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
                  <RotateCcw size={16} /> Regenerar Base Teorica
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Gerar Base Teorica
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
                  <h3 className="text-sm font-bold text-card-foreground">Historico de Versoes</h3>
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

        {/* ── Right column — Result ─────────────────────────────────────── */}
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
                <p className="text-sm font-semibold text-card-foreground">Gerando base teorica...</p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  A IA esta analisando o curriculo adaptado e criando sugestoes personalizadas para {studentName}.
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
                      <ClipboardList size={15} /> Base Teorica
                    </TabsTrigger>
                    <TabsTrigger value="produto" className="gap-2 text-sm font-semibold">
                      <PenTool size={15} /> Produto Final (Questoes)
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Tab: Base Teorica ── */}
                  <TabsContent value="base">
                    <div className="kpi-card space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={18} className="text-primary" />
                          <h3 className="text-sm font-bold text-card-foreground">Base Teorica Gerada</h3>
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
                          <h3 className="text-sm font-bold text-card-foreground">Produto Final — Questoes Adaptadas</h3>
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
                          Planejamento Completo — Arqueologia, Vestigios e Primeiros Humanos
                        </h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span><strong className="text-card-foreground">Nivel:</strong> 3o ao 5o ano (adaptado)</span>
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
                                <p className="text-[10px] uppercase tracking-wider font-bold text-secondary mb-1">Enunciado</p>
                                <p className="text-sm text-card-foreground font-medium leading-relaxed whitespace-pre-line">{act.enunciado}</p>
                              </div>

                              {/* Descricao */}
                              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">Descricao</p>
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
                  Nenhuma base teorica gerada ainda
                </p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  Clique em "Gerar Base Teorica" para criar sugestoes de atividades pedagogicas adaptadas com base no curriculo de {studentName}.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Simple Markdown Renderer ─────────────────────────────────────────────────
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

  const renderInline = (text: string) => {
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
