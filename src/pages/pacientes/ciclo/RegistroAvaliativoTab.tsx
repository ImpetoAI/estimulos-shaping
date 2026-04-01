import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronLeft, Check, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase, db } from "@/lib/supabase";
import type { CicloTabProps } from "./_shared";
import { KNOWLEDGE_AREA_LABELS, type KnowledgeArea } from "@/types/portal";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EvalRegistry {
  id: string;
  evaluation_date: string;
  knowledge_area: string;
  contents: string;
  completed_evaluation: boolean;
  conducted_by: string;
  created_at: string;
}

// ─── Yes/No Toggle ───────────────────────────────────────────────────────────
function YesNoToggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 h-9 rounded-lg text-sm font-semibold border-2 flex items-center justify-center gap-1.5 transition-all",
            value ? "bg-success/10 border-success text-success" : "bg-background border-border text-muted-foreground hover:border-success/50"
          )}
        >
          <Check className="w-3.5 h-3.5" /> Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 h-9 rounded-lg text-sm font-semibold border-2 flex items-center justify-center gap-1.5 transition-all",
            !value ? "bg-destructive/10 border-destructive text-destructive" : "bg-background border-border text-muted-foreground hover:border-destructive/50"
          )}
        >
          <X className="w-3.5 h-3.5" /> Não
        </button>
      </div>
    </div>
  );
}

// ─── Form schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  evaluation_date: z.string().min(1, "Informe a data"),
  duration_minutes: z.coerce.number().min(1).max(480),
  contents: z.string().min(1, "Informe os conteúdos"),
  knowledge_area: z.string().min(1, "Selecione a área") as z.ZodType<KnowledgeArea>,
  exam_type: z.enum(["v1", "v2"]).optional(),
  showed_resistance: z.boolean(),
  showed_discomfort: z.boolean(),
  discomfort_description: z.string().optional(),
  used_support_resources: z.boolean(),
  support_resources_description: z.string().optional(),
  understood_commands: z.boolean(),
  commands_observation: z.string().optional(),
  conducted_by: z.enum(["atendente_terapeutica", "professor"]),
  used_reinforcers: z.boolean(),
  reinforcers_description: z.string().optional(),
  completed_evaluation: z.boolean(),
  free_description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.showed_discomfort && !data.discomfort_description?.trim())
    ctx.addIssue({ code: "custom", path: ["discomfort_description"], message: "Descreva o desconforto" });
  if (data.used_support_resources && !data.support_resources_description?.trim())
    ctx.addIssue({ code: "custom", path: ["support_resources_description"], message: "Descreva os recursos" });
  if (!data.understood_commands && !data.commands_observation?.trim())
    ctx.addIssue({ code: "custom", path: ["commands_observation"], message: "Descreva a dificuldade" });
  if (data.used_reinforcers && !data.reinforcers_description?.trim())
    ctx.addIssue({ code: "custom", path: ["reinforcers_description"], message: "Descreva os reforçadores" });
});

type FormData = z.infer<typeof schema>;

export default function RegistroAvaliativoTab({ caseId, bimester, studentId }: CicloTabProps) {
  const [records, setRecords] = useState<EvalRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examFile, setExamFile] = useState<File | null>(null);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      evaluation_date: new Date().toISOString().split("T")[0],
      duration_minutes: 45,
      contents: "",
      knowledge_area: "portugues",
      exam_type: undefined,
      showed_resistance: false,
      showed_discomfort: false,
      discomfort_description: "",
      used_support_resources: false,
      support_resources_description: "",
      understood_commands: true,
      commands_observation: "",
      conducted_by: "atendente_terapeutica",
      used_reinforcers: false,
      reinforcers_description: "",
      completed_evaluation: true,
      free_description: "",
    },
  });

  const watchDiscomfort = form.watch("showed_discomfort");
  const watchSupport = form.watch("used_support_resources");
  const watchUnderstood = form.watch("understood_commands");
  const watchReinforcers = form.watch("used_reinforcers");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await db
      .from("evaluation_registries")
      .select("id, evaluation_date, knowledge_area, contents, completed_evaluation, conducted_by, created_at")
      .eq("student_id", studentId)
      .eq("bimester", bimester)
      .order("evaluation_date", { ascending: false });
    setRecords((data as EvalRegistry[]) ?? []);
    setLoading(false);
  }, [studentId, bimester]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const onSubmit = async (values: FormData) => {
    setSaving(true);
    try {
      let exam_file_url: string | undefined;
      if (examFile) {
        const path = `${studentId}/${Date.now()}-${examFile.name}`;
        const { error: uploadError } = await supabase.storage.from("exam-files").upload(path, examFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("exam-files").getPublicUrl(path);
        exam_file_url = urlData.publicUrl;
      }

      const { error } = await db.from("evaluation_registries").insert({
        student_id: studentId,
        case_id: caseId,
        bimester,
        evaluator_id: user?.id,
        ...values,
        exam_file_url,
      });
      if (error) throw error;

      toast.success("Registro salvo!");
      setShowForm(false);
      setExamFile(null);
      form.reset();
      loadRecords();
    } catch {
      toast.error("Erro ao salvar registro.");
    } finally {
      setSaving(false);
    }
  };

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="gap-1.5">
            <ChevronLeft size={15} /> Voltar
          </Button>
          <h3 className="font-semibold text-sm">Novo Registro Avaliativo</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="evaluation_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="duration_minutes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (min)</FormLabel>
                  <FormControl><Input type="number" min={1} max={480} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="knowledge_area" render={({ field }) => (
              <FormItem>
                <FormLabel>Área de Conhecimento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {(Object.keys(KNOWLEDGE_AREA_LABELS) as KnowledgeArea[]).map((k) => (
                      <SelectItem key={k} value={k}>{KNOWLEDGE_AREA_LABELS[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="exam_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Prova</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="v1">V1 — Mensal</SelectItem>
                    <SelectItem value="v2">V2 — Bimestral</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="contents" render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdos</FormLabel>
                <FormControl><Input placeholder="Ex: Frações, interpretação de texto..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Toggles */}
            {([
              { name: "showed_resistance" as const, label: "Apresentou resistência?" },
              { name: "showed_discomfort" as const, label: "Demonstrou desconforto?" },
              { name: "used_support_resources" as const, label: "Utilizou recursos de apoio?" },
              { name: "understood_commands" as const, label: "Compreendeu os comandos?" },
              { name: "used_reinforcers" as const, label: "Utilizou reforçadores?" },
              { name: "completed_evaluation" as const, label: "Concluiu a avaliação?" },
            ] as const).map(({ name, label }) => (
              <FormField key={name} control={form.control} name={name} render={({ field }) => (
                <FormItem>
                  <YesNoToggle label={label} value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )} />
            ))}

            {watchDiscomfort && (
              <FormField control={form.control} name="discomfort_description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Descreva o desconforto</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Descreva..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {watchSupport && (
              <FormField control={form.control} name="support_resources_description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Quais recursos?</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Ex: Material concreto..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {!watchUnderstood && (
              <FormField control={form.control} name="commands_observation" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Dificuldade observada</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Descreva..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {watchReinforcers && (
              <FormField control={form.control} name="reinforcers_description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Quais reforçadores?</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Ex: Elogios verbais, token..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <FormField control={form.control} name="conducted_by" render={({ field }) => (
              <FormItem>
                <FormLabel>Quem conduziu?</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 mt-1">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="atendente_terapeutica" id="at" />
                      <Label htmlFor="at" className="text-sm font-normal">Atendente Terapêutica</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="professor" id="prof" />
                      <Label htmlFor="prof" className="text-sm font-normal">Professor</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* File upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prova Respondida (opcional)</Label>
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                {examFile ? (
                  <span className="text-sm font-medium text-primary">{examFile.name}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Selecionar PDF</span>
                )}
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setExamFile(e.target.files?.[0] ?? null)} />
              </label>
              {examFile && (
                <button type="button" onClick={() => setExamFile(null)} className="text-xs text-destructive hover:underline">
                  Remover
                </button>
              )}
            </div>

            <FormField control={form.control} name="free_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição livre (opcional)</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Observações gerais..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Salvando...
                </span>
              ) : "Salvar Registro"}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm font-medium text-muted-foreground">{records.length} registro(s)</span>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Novo Registro
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">Nenhum registro avaliativo</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Novo Registro" para criar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">
                    {new Date(r.evaluation_date).toLocaleDateString("pt-BR")}
                  </p>
                  <Badge variant="secondary" className="text-[10px]">
                    {KNOWLEDGE_AREA_LABELS[r.knowledge_area as KnowledgeArea] ?? r.knowledge_area}
                  </Badge>
                  <Badge variant={r.completed_evaluation ? "outline" : "destructive"} className={cn("text-[10px]", r.completed_evaluation ? "text-success border-success/40 bg-success/5" : "")}>
                    {r.completed_evaluation ? "Concluída" : "Não concluída"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.contents}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
