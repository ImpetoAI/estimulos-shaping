import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { KNOWLEDGE_AREA_LABELS, type KnowledgeArea } from "@/types/portal";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ─── Schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  evaluation_date: z.string().min(1, "Informe a data"),
  duration_minutes: z.coerce
    .number({ invalid_type_error: "Informe a duração" })
    .min(1, "Mínimo 1 minuto")
    .max(480, "Máximo 480 minutos"),
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
  if (data.showed_discomfort && !data.discomfort_description?.trim()) {
    ctx.addIssue({ code: "custom", path: ["discomfort_description"], message: "Descreva o desconforto" });
  }
  if (data.used_support_resources && !data.support_resources_description?.trim()) {
    ctx.addIssue({ code: "custom", path: ["support_resources_description"], message: "Descreva os recursos utilizados" });
  }
  if (!data.understood_commands && !data.commands_observation?.trim()) {
    ctx.addIssue({ code: "custom", path: ["commands_observation"], message: "Descreva a dificuldade" });
  }
  if (data.used_reinforcers && !data.reinforcers_description?.trim()) {
    ctx.addIssue({ code: "custom", path: ["reinforcers_description"], message: "Descreva os reforçadores" });
  }
});

type FormData = z.infer<typeof schema>;

// ─── Toggle component ───────────────────────────────────────────────────────
function YesNoToggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-card-foreground">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 h-10 rounded-lg text-sm font-semibold border-2 flex items-center justify-center gap-1.5 transition-all",
            value
              ? "bg-success/10 border-success text-success"
              : "bg-white border-border text-muted-foreground hover:border-success/50"
          )}
        >
          <Check className="w-3.5 h-3.5" />
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 h-10 rounded-lg text-sm font-semibold border-2 flex items-center justify-center gap-1.5 transition-all",
            !value
              ? "bg-destructive/10 border-destructive text-destructive"
              : "bg-white border-border text-muted-foreground hover:border-destructive/50"
          )}
        >
          <X className="w-3.5 h-3.5" />
          Não
        </button>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function PortalEvaluationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [examFile, setExamFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      evaluation_date: new Date().toISOString().split("T")[0],
      duration_minutes: 45,
      contents: "",
      knowledge_area: "portugues",
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

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      // TODO: Upload PDF to Supabase Storage bucket "exam-files" if examFile exists
      // let exam_file_url: string | undefined;
      // if (examFile) {
      //   const path = `${id}/${Date.now()}-${examFile.name}`;
      //   const { error: uploadError } = await supabase.storage
      //     .from("exam-files")
      //     .upload(path, examFile);
      //   if (uploadError) throw uploadError;
      //   const { data: urlData } = supabase.storage.from("exam-files").getPublicUrl(path);
      //   exam_file_url = urlData.publicUrl;
      // }

      // TODO: Insert into estimulos.evaluation_registries
      // const { error } = await supabase
      //   .schema("estimulos")
      //   .from("evaluation_registries")
      //   .insert({
      //     student_id: id,
      //     evaluator_id: user?.id,
      //     ...data,
      //     exam_file_url,
      //   });
      // if (error) throw error;

      // Mock success
      console.log("Registro salvo (mock):", { ...data, student_id: id, evaluator_id: user?.id });
      navigate(`/portal/pacientes/${id}`);
    } catch (err) {
      setSubmitError("Erro ao salvar registro. Tente novamente.");
    }
  };

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate(`/portal/pacientes/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 -ml-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Ficha do Paciente
      </button>

      <h1 className="text-xl font-bold text-card-foreground mb-6">
        Registro Avaliativo
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Dados básicos ── */}
          <section className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-sm text-card-foreground">Dados da Avaliação</h2>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="evaluation_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={480} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="knowledge_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Conhecimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(KNOWLEDGE_AREA_LABELS) as KnowledgeArea[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {KNOWLEDGE_AREA_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exam_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Prova</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="v1">V1 — Mensal</SelectItem>
                      <SelectItem value="v2">V2 — Bimestral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdos</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Frações, interpretação de texto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* ── Comportamento ── */}
          <section className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-5">
            <h2 className="font-semibold text-sm text-card-foreground">Comportamento e Desempenho</h2>

            {/* Resistência */}
            <FormField
              control={form.control}
              name="showed_resistance"
              render={({ field }) => (
                <FormItem>
                  <YesNoToggle
                    label="Apresentou resistência?"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Desconforto */}
            <FormField
              control={form.control}
              name="showed_discomfort"
              render={({ field }) => (
                <FormItem>
                  <YesNoToggle
                    label="Demonstrou desconforto?"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchDiscomfort && (
              <FormField
                control={form.control}
                name="discomfort_description"
                render={({ field }) => (
                  <FormItem className="-mt-2">
                    <FormLabel className="text-xs text-muted-foreground">
                      Descreva o desconforto
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Descreva..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Recursos de apoio */}
            <FormField
              control={form.control}
              name="used_support_resources"
              render={({ field }) => (
                <FormItem>
                  <YesNoToggle
                    label="Foram utilizados recursos de apoio?"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchSupport && (
              <FormField
                control={form.control}
                name="support_resources_description"
                render={({ field }) => (
                  <FormItem className="-mt-2">
                    <FormLabel className="text-xs text-muted-foreground">
                      Quais recursos?
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Ex: Material concreto, pictogramas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Compreendeu comandos */}
            <FormField
              control={form.control}
              name="understood_commands"
              render={({ field }) => (
                <FormItem>
                  <YesNoToggle
                    label="Compreendeu os comandos?"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {!watchUnderstood && (
              <FormField
                control={form.control}
                name="commands_observation"
                render={({ field }) => (
                  <FormItem className="-mt-2">
                    <FormLabel className="text-xs text-muted-foreground">
                      Observação sobre a dificuldade
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Descreva a dificuldade..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Reforçadores */}
            <FormField
              control={form.control}
              name="used_reinforcers"
              render={({ field }) => (
                <FormItem>
                  <YesNoToggle
                    label="Foi necessário uso de reforçadores?"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchReinforcers && (
              <FormField
                control={form.control}
                name="reinforcers_description"
                render={({ field }) => (
                  <FormItem className="-mt-2">
                    <FormLabel className="text-xs text-muted-foreground">
                      Quais reforçadores?
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Ex: Elogios verbais, token..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </section>

          {/* ── Condução e conclusão ── */}
          <section className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-5">
            <h2 className="font-semibold text-sm text-card-foreground">Condução e Conclusão</h2>

            {/* Quem conduziu */}
            <FormField
              control={form.control}
              name="conducted_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quem conduziu a avaliação?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="atendente_terapeutica" id="conducted_at" />
                        <Label htmlFor="conducted_at" className="text-sm font-normal">
                          Atendente Terapêutica
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="professor" id="conducted_prof" />
                        <Label htmlFor="conducted_prof" className="text-sm font-normal">
                          Professor
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Concluiu */}
            <FormField
              control={form.control}
              name="completed_evaluation"
              render={({ field }) => (
                <FormItem>
                  <YesNoToggle
                    label="Conseguiu concluir a avaliação?"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* ── Upload PDF ── */}
          <section className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-sm text-card-foreground">Prova Respondida</h2>
            <p className="text-xs text-muted-foreground">
              Anexe o PDF da prova respondida pelo aluno (opcional).
            </p>

            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground" />
              {examFile ? (
                <span className="text-sm font-medium text-primary truncate max-w-full px-4 text-center">
                  {examFile.name}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Toque para selecionar PDF</span>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setExamFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {examFile && (
              <button
                type="button"
                onClick={() => setExamFile(null)}
                className="text-xs text-destructive hover:underline"
              >
                Remover arquivo
              </button>
            )}
          </section>

          {/* ── Descrição livre ── */}
          <section className="bg-white rounded-2xl border border-border/40 shadow-sm p-5">
            <FormField
              control={form.control}
              name="free_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição livre</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Observações gerais, contexto adicional, evolução percebida..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Submit error */}
          {submitError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Salvando...
              </span>
            ) : (
              "Salvar Registro"
            )}
          </Button>

          <div className="pb-8" />
        </form>
      </Form>
    </div>
  );
}
