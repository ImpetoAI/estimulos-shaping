import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, FileText } from "lucide-react";

// ---- Types ----

interface Student { id: string; full_name: string; }
interface Case { id: string; student_id: string; academic_year: number; current_bimester: number; }

const SECTIONS = [
  { id: "perfil_academico", label: "Perfil Acadêmico" },
  { id: "curriculo_original", label: "Currículo Original" },
  { id: "curriculo_adaptado", label: "Currículo Adaptado" },
  { id: "planejamento", label: "Planejamento" },
  { id: "atividades", label: "Atividades" },
  { id: "registro_avaliativo", label: "Registro Avaliativo" },
  { id: "evolucao", label: "Evolução" },
  { id: "linha_do_tempo", label: "Linha do Tempo" },
  { id: "observacoes", label: "Observações" },
];

const BIMESTERS = [
  { value: "1", label: "1º Bimestre" },
  { value: "2", label: "2º Bimestre" },
  { value: "3", label: "3º Bimestre" },
  { value: "4", label: "4º Bimestre" },
];

export default function RelatorioPacientePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [studentId, setStudentId] = useState("");
  const [bimester, setBimester] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["students_list"],
    queryFn: async () => {
      const { data, error } = await db
        .from("students")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as Student[];
    },
  });

  const { data: cases = [] } = useQuery<Case[]>({
    queryKey: ["cases_list", studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data, error } = await db
        .from("cases")
        .select("id, student_id, academic_year, current_bimester")
        .eq("student_id", studentId)
        .eq("status", "active")
        .order("academic_year", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Case[];
    },
  });

  const currentCase = cases[0] || null;

  const toggleSection = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    const all: Record<string, boolean> = {};
    SECTIONS.forEach((s) => { all[s.id] = true; });
    setSelected(all);
  };

  const clearAll = () => setSelected({});

  const selectedSections = SECTIONS.filter((s) => selected[s.id]).map((s) => s.id);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!currentCase) throw new Error("Nenhum caso ativo para o paciente selecionado");
      if (!bimester) throw new Error("Selecione o bimestre");
      if (selectedSections.length === 0) throw new Error("Selecione ao menos uma seção");

      const { error } = await db
        .from("patient_reports")
        .insert({
          case_id: currentCase.id,
          bimester: parseInt(bimester, 10),
          selected_sections: selectedSections,
          generated_text: null,
          generated_by: user?.id ?? null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.info("Geração por IA em breve", {
        description: "Sua solicitação foi salva. A geração automática estará disponível em breve.",
      });
      queryClient.invalidateQueries({ queryKey: ["patient_reports"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const studentName = students.find((s) => s.id === studentId)?.full_name ?? "";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Relatório do Paciente</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Geração automática de relatório por IA
        </p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student */}
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <Select value={studentId} onValueChange={(v) => { setStudentId(v); setBimester(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bimester */}
          <div className="space-y-1.5">
            <Label>Bimestre</Label>
            <Select value={bimester} onValueChange={setBimester} disabled={!studentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o bimestre..." />
              </SelectTrigger>
              <SelectContent>
                {BIMESTERS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Seções do Relatório</Label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-primary hover:underline">
                  Selecionar tudo
                </button>
                <span className="text-xs text-muted-foreground">·</span>
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline">
                  Limpar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SECTIONS.map((section) => (
                <div key={section.id} className="flex items-center gap-2">
                  <Checkbox
                    id={section.id}
                    checked={!!selected[section.id]}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <label htmlFor={section.id} className="text-sm cursor-pointer">
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedSections.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedSections.length} seção(ões) selecionada(s)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview area */}
      <Card className="border-dashed">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
          <FileText size={32} className="text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pré-visualização do Relatório</p>
            <p className="text-xs text-muted-foreground mt-1">
              {studentName
                ? `O relatório de ${studentName} será gerado automaticamente pela IA com base nos itens selecionados.`
                : "O relatório será gerado automaticamente pela IA com base nos itens selecionados."}
            </p>
          </div>
          {selectedSections.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {selectedSections.map((id) => (
                <span key={id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {SECTIONS.find((s) => s.id === id)?.label}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate button */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !studentId || !bimester || selectedSections.length === 0}
      >
        <Sparkles size={16} className="mr-2" />
        {mutation.isPending ? "Salvando..." : "Gerar Relatório"}
      </Button>
    </div>
  );
}
