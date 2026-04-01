import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Calendar, FileText, Download, Eye, Filter,
  BarChart3, BookOpen, ClipboardCheck, Package,
  TrendingUp, ExternalLink, FileDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const mockStudent = {
  name: "Lucas Mendes",
  age: 9,
  grade: "4º ano",
  school: "Escola Municipal São Paulo",
  adaptationLevel: "Nível 3 — significativo",
  photo: null as string | null,
};

const mockMaterials = [
  {
    id: "1",
    date: "2026-03-10",
    title: "Apostila de Alfabetização Adaptada",
    subject: "Português",
    type: "Apostila",
    content: "Associação palavra-imagem, sílabas simples",
    adaptationLevel: 3,
    editableLink: "https://canva.com/design/example1",
    hasPdf: true,
  },
  {
    id: "2",
    date: "2026-03-05",
    title: "Avaliação Adaptada de Matemática",
    subject: "Matemática",
    type: "Avaliação adaptada",
    content: "Contagem até 20, associação número-quantidade",
    adaptationLevel: 3,
    editableLink: "https://canva.com/design/example2",
    hasPdf: true,
  },
  {
    id: "3",
    date: "2026-02-28",
    title: "Quadro de Rotina Visual",
    subject: "Habilidades Sociais",
    type: "Material visual",
    content: "Rotina diária com pictogramas",
    adaptationLevel: 4,
    editableLink: "https://canva.com/design/example3",
    hasPdf: true,
  },
  {
    id: "4",
    date: "2026-02-20",
    title: "Atividades de Leitura Funcional",
    subject: "Português",
    type: "Atividade individual",
    content: "Leitura de sílabas simples, completar palavras",
    adaptationLevel: 3,
    editableLink: "https://canva.com/design/example4",
    hasPdf: false,
  },
  {
    id: "5",
    date: "2026-02-15",
    title: "Cartão Pedagógico de Ciências",
    subject: "Ciências",
    type: "Cartão pedagógico",
    content: "Identificação de animais e habitats",
    adaptationLevel: 2,
    editableLink: null,
    hasPdf: true,
  },
  {
    id: "6",
    date: "2026-02-10",
    title: "Atividades de Coordenação Motora",
    subject: "Coordenação Motora",
    type: "Atividade individual",
    content: "Traçado de letras, recorte e colagem",
    adaptationLevel: 2,
    editableLink: "https://canva.com/design/example6",
    hasPdf: true,
  },
  {
    id: "7",
    date: "2026-01-30",
    title: "Avaliação Diagnóstica Inicial",
    subject: "Português",
    type: "Avaliação adaptada",
    content: "Avaliação de nível de leitura e escrita",
    adaptationLevel: 3,
    editableLink: null,
    hasPdf: true,
  },
  {
    id: "8",
    date: "2026-01-20",
    title: "Apostila de Matemática Básica",
    subject: "Matemática",
    type: "Apostila",
    content: "Números de 1 a 10, formas geométricas",
    adaptationLevel: 3,
    editableLink: "https://canva.com/design/example8",
    hasPdf: true,
  },
];

const subjectColors: Record<string, string> = {
  Português: "bg-primary/15 text-primary",
  Matemática: "bg-warning/15 text-warning",
  Ciências: "bg-success/15 text-success",
  "Habilidades Sociais": "bg-secondary/15 text-secondary",
  "Coordenação Motora": "bg-accent text-accent-foreground",
  História: "bg-info/15 text-info",
  Geografia: "bg-muted text-muted-foreground",
};

const adaptationLabels: Record<number, string> = {
  1: "Leve",
  2: "Moderado",
  3: "Significativo",
  4: "Paralelo",
  5: "Funcional",
};

const adaptationColors: Record<number, string> = {
  1: "bg-success/15 text-success",
  2: "bg-primary/15 text-primary",
  3: "bg-warning/15 text-warning",
  4: "bg-secondary/15 text-secondary",
  5: "bg-destructive/15 text-destructive",
};

const periodOptions = [
  { value: "all", label: "Todo o período" },
  { value: "month", label: "Último mês" },
  { value: "quarter", label: "Último trimestre" },
  { value: "semester", label: "Último semestre" },
  { value: "year", label: "Último ano" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

export default function MaterialStatementPage() {
  const [period, setPeriod] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const subjects = [...new Set(mockMaterials.map((m) => m.subject))];
  const types = [...new Set(mockMaterials.map((m) => m.type))];

  const filtered = mockMaterials.filter((m) => {
    if (subjectFilter !== "all" && m.subject !== subjectFilter) return false;
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (period !== "all") {
      const now = new Date("2026-03-12");
      const mDate = new Date(m.date + "T00:00:00");
      const diffDays = (now.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24);
      if (period === "month" && diffDays > 30) return false;
      if (period === "quarter" && diffDays > 90) return false;
      if (period === "semester" && diffDays > 180) return false;
      if (period === "year" && diffDays > 365) return false;
    }
    return true;
  });

  const totalMaterials = filtered.length;
  const totalAssessments = filtered.filter((m) => m.type.toLowerCase().includes("avaliação")).length;
  const uniqueSubjects = [...new Set(filtered.map((m) => m.subject))].length;
  const totalWithPdf = filtered.filter((m) => m.hasPdf).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Extrato de Materiais Pedagógicos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Relatório consolidado de materiais produzidos e entregues
          </p>
        </div>
        <Button className="gap-2">
          <FileDown size={16} />
          Exportar PDF
        </Button>
      </motion.div>

      {/* Student ID */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {mockStudent.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-card-foreground">{mockStudent.name}</h2>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span>{mockStudent.age} anos</span>
                  <span>{mockStudent.grade}</span>
                  <span>{mockStudent.school}</span>
                </div>
              </div>
              <Badge className="bg-warning/15 text-warning border-0 text-xs">
                {mockStudent.adaptationLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPIs */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Materiais Produzidos", value: totalMaterials, icon: Package, color: "text-primary" },
          { label: "Avaliações Aplicadas", value: totalAssessments, icon: ClipboardCheck, color: "text-secondary" },
          { label: "Áreas Trabalhadas", value: uniqueSubjects, icon: BookOpen, color: "text-warning" },
          { label: "Arquivos Disponíveis", value: totalWithPdf, icon: FileText, color: "text-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">{kpi.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-card-foreground">Filtros</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
                <SelectContent>
                  {periodOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger><SelectValue placeholder="Disciplina" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="Tipo de material" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Materiais Produzidos
              <Badge variant="secondary" className="ml-2 text-xs">{filtered.length} itens</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden lg:table-cell">Conteúdo</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        Nenhum material encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(m.date)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-card-foreground text-sm">{m.title}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${subjectColors[m.subject] || "bg-muted text-muted-foreground"}`}>
                            {m.subject}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.type}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                          {m.content}
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${adaptationColors[m.adaptationLevel]}`}>
                            N{m.adaptationLevel} — {adaptationLabels[m.adaptationLevel]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {m.editableLink && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Abrir link editável">
                                <ExternalLink size={14} />
                              </Button>
                            )}
                            {m.hasPdf && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Baixar PDF">
                                <Download size={14} />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar">
                              <Eye size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Production summary by subject */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-success" />
              Resumo por Área Pedagógica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((subject) => {
                const count = filtered.filter((m) => m.subject === subject).length;
                if (count === 0) return null;
                return (
                  <div key={subject} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge className={`border-0 text-xs ${subjectColors[subject] || "bg-muted text-muted-foreground"}`}>
                        {subject}
                      </Badge>
                    </div>
                    <span className="text-sm font-bold text-card-foreground">{count} {count === 1 ? "material" : "materiais"}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
