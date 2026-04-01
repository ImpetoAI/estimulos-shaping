import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Sparkles,
  FileText,
  ImageIcon,
} from "lucide-react";
import { db, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  source_url: z.string().url("URL inválida").optional().or(z.literal("")),
  file_url: z.string().optional(),
  preview_image_url: z.string().optional(),
  discipline: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  primary_skill: z.string().optional(),
  secondary_skills: z.array(z.string()).optional(),
  activity_type: z.string().optional(),
  theme: z.string().optional(),
  pedagogical_level: z.string().optional(),
  adaptation_level: z
    .enum(["sem_adaptacao", "leve", "moderada", "alta"])
    .optional(),
  adaptation_justification: z.string().optional(),
  pedagogical_objective: z.string().optional(),
  usage_context: z
    .enum(["introducao", "reforco", "avaliacao"])
    .optional(),
  tags: z.array(z.string()).optional(),
  base: z.enum(["infantil", "fundamental", "teens"]).default("infantil"),
  bncc_tags: z.string().optional(),
  status: z.enum(["pendente", "em_design", "concluida"]).default("pendente"),
  designer_link: z.string().url("URL inválida").optional().or(z.literal("")),
  nivel_adaptacao: z
    .enum(["n1_leve", "n2_moderado", "n3_significativo", "n4_paralelo", "n5_funcional"])
    .optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Types ────────────────────────────────────────────────────────────────────

type Activity = {
  id: string;
  title: string;
  source_url: string | null;
  file_url: string | null;
  preview_image_url: string | null;
  discipline: string | null;
  category: string | null;
  subcategory: string | null;
  primary_skill: string | null;
  secondary_skills: string[] | null;
  activity_type: string | null;
  theme: string | null;
  pedagogical_level: string | null;
  adaptation_level: string | null;
  adaptation_justification: string | null;
  pedagogical_objective: string | null;
  usage_context: string | null;
  tags: string[] | null;
  base: string;
  bncc_tags: string | null;
  status: string | null;
  designer_link: string | null;
  nivel_adaptacao: string | null;
  created_at: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCIPLINES = [
  "Português",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Arte",
  "Ed. Física",
  "Ensino Religioso",
];

const ACTIVITY_TYPES = [
  { value: "pareamento", label: "Pareamento" },
  { value: "caca_palavras", label: "Caça-palavras" },
  { value: "completar", label: "Completar" },
  { value: "ligar", label: "Ligar" },
  { value: "pintar", label: "Pintar" },
  { value: "recortar", label: "Recortar" },
  { value: "sequencia", label: "Sequência" },
  { value: "interpretacao", label: "Interpretação" },
  { value: "outro", label: "Outro" },
];

const ADAPTATION_LEVELS = [
  { value: "sem_adaptacao", label: "Sem adaptação" },
  { value: "leve", label: "Leve" },
  { value: "moderada", label: "Moderada" },
  { value: "alta", label: "Alta" },
];

const USAGE_CONTEXTS = [
  { value: "introducao", label: "Introdução" },
  { value: "reforco", label: "Reforço" },
  { value: "avaliacao", label: "Avaliação" },
];

const BASE_OPTIONS = [
  { value: "infantil", label: "Infantil" },
  { value: "teens", label: "Teens" },
  { value: "fundamental", label: "Fundamental" },
];

const BASE_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  infantil: {
    label: "Infantil",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  teens: {
    label: "Teens",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  fundamental: {
    label: "Fundamental",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_design", label: "Em Design" },
  { value: "concluida", label: "Concluída" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
  em_design: { label: "Em Design", className: "bg-blue-100 text-blue-800" },
  concluida: { label: "Concluída", className: "bg-green-100 text-green-800" },
};

const NIVEL_ADAPTACAO_OPTIONS = [
  { value: "n1_leve", label: "N1 Leve" },
  { value: "n2_moderado", label: "N2 Moderado" },
  { value: "n3_significativo", label: "N3 Significativo" },
  { value: "n4_paralelo", label: "N4 Paralelo" },
  { value: "n5_funcional", label: "N5 Funcional" },
];

const ADAPTATION_BADGE: Record<string, string> = {
  sem_adaptacao: "bg-gray-100 text-gray-700",
  leve: "bg-yellow-100 text-yellow-800",
  moderada: "bg-orange-100 text-orange-800",
  alta: "bg-red-100 text-red-800",
};

// ─── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? "Adicionar..."}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="ml-1 hover:text-destructive"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── File Upload Helper ───────────────────────────────────────────────────────

async function uploadFile(
  bucket: string,
  prefix: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${prefix}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  if (error || !data) return null;
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BancoAtividadesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBase, setFilterBase] = useState("all");
  const [filterAdaptation, setFilterAdaptation] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      base: "infantil",
      secondary_skills: [],
      tags: [],
    },
  });

  const watchAdaptation = form.watch("adaptation_level");
  const watchFileUrl = form.watch("file_url");
  const watchPreviewUrl = form.watch("preview_image_url");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as Activity[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      title: "",
      base: "infantil",
      secondary_skills: [],
      tags: [],
      source_url: "",
      bncc_tags: "",
      status: "pendente",
      designer_link: "",
      nivel_adaptacao: undefined,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: Activity) => {
    setEditing(item);
    form.reset({
      title: item.title,
      source_url: item.source_url ?? "",
      file_url: item.file_url ?? "",
      preview_image_url: item.preview_image_url ?? "",
      discipline: item.discipline ?? "",
      category: item.category ?? "",
      subcategory: item.subcategory ?? "",
      primary_skill: item.primary_skill ?? "",
      secondary_skills: item.secondary_skills ?? [],
      activity_type: item.activity_type ?? "",
      theme: item.theme ?? "",
      pedagogical_level: item.pedagogical_level ?? "",
      adaptation_level:
        (item.adaptation_level as FormValues["adaptation_level"]) ?? undefined,
      adaptation_justification: item.adaptation_justification ?? "",
      pedagogical_objective: item.pedagogical_objective ?? "",
      usage_context:
        (item.usage_context as FormValues["usage_context"]) ?? undefined,
      tags: item.tags ?? [],
      base: (item.base as FormValues["base"]) ?? "infantil",
      bncc_tags: item.bncc_tags ?? "",
      status: (item.status as FormValues["status"]) ?? "pendente",
      designer_link: item.designer_link ?? "",
      nivel_adaptacao: (item.nivel_adaptacao as FormValues["nivel_adaptacao"]) ?? undefined,
    });
    setDialogOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const url = await uploadFile("materials", "atividades/pdf", file);
    if (url) {
      form.setValue("file_url", url);
    } else {
      toast({
        title: "Erro no upload do PDF",
        variant: "destructive",
      });
    }
    setUploadingPdf(false);
  };

  const handlePreviewUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPreview(true);
    const url = await uploadFile("materials", "atividades/preview", file);
    if (url) {
      form.setValue("preview_image_url", url);
    } else {
      toast({
        title: "Erro no upload da imagem",
        variant: "destructive",
      });
    }
    setUploadingPreview(false);
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const payload = {
      title: values.title,
      source_url: values.source_url || null,
      file_url: values.file_url || null,
      preview_image_url: values.preview_image_url || null,
      discipline: values.discipline || null,
      category: values.category || null,
      subcategory: values.subcategory || null,
      primary_skill: values.primary_skill || null,
      secondary_skills:
        values.secondary_skills && values.secondary_skills.length > 0
          ? values.secondary_skills
          : null,
      activity_type: values.activity_type || null,
      theme: values.theme || null,
      pedagogical_level: values.pedagogical_level || null,
      adaptation_level: values.adaptation_level ?? null,
      adaptation_justification: values.adaptation_justification || null,
      pedagogical_objective: values.pedagogical_objective || null,
      usage_context: values.usage_context ?? null,
      tags:
        values.tags && values.tags.length > 0 ? values.tags : null,
      base: values.base,
      bncc_tags: values.bncc_tags || null,
      status: values.status ?? "pendente",
      designer_link: values.designer_link || null,
      nivel_adaptacao: values.nivel_adaptacao ?? null,
      created_by: user?.id ?? null,
    };

    let error;
    if (editing) {
      ({ error } = await db
        .from("activities")
        .update(payload)
        .eq("id", editing.id));
    } else {
      ({ error } = await db.from("activities").insert(payload));
    }

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: editing ? "Atividade atualizada" : "Atividade criada" });
      setDialogOpen(false);
      fetchItems();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await db
      .from("activities")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Atividade removida" });
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const allCategories = [
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ] as string[];

  const filtered = items.filter((item) => {
    if (filterDiscipline !== "all" && item.discipline !== filterDiscipline)
      return false;
    if (filterCategory !== "all" && item.category !== filterCategory)
      return false;
    if (filterBase !== "all" && item.base !== filterBase) return false;
    if (
      filterAdaptation !== "all" &&
      item.adaptation_level !== filterAdaptation
    )
      return false;
    if (filterType !== "all" && item.activity_type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const hasFilters =
    filterDiscipline !== "all" ||
    filterCategory !== "all" ||
    filterBase !== "all" ||
    filterAdaptation !== "all" ||
    filterType !== "all" ||
    search !== "";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Banco de Atividades</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} atividade{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Nova Atividade
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Buscar por título ou tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60"
        />
        <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas disciplinas</SelectItem>
            {DISCIPLINES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {allCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterBase} onValueChange={setFilterBase}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Base" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas bases</SelectItem>
            {BASE_OPTIONS.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAdaptation} onValueChange={setFilterAdaptation}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Adaptação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos níveis</SelectItem>
            {ADAPTATION_LEVELS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos tipos</SelectItem>
            {ACTIVITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterDiscipline("all");
              setFilterCategory("all");
              setFilterBase("all");
              setFilterAdaptation("all");
              setFilterType("all");
              setSearch("");
            }}
          >
            <X size={14} className="mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Nenhuma atividade encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const base = BASE_BADGE[item.base] ?? BASE_BADGE.infantil;
            const isOutdated = false;
            return (
              <div
                key={item.id}
                className={`rounded-lg border bg-card flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                  isOutdated ? "border-destructive/50" : ""
                }`}
              >
                {/* Preview */}
                <div className="relative h-36 bg-muted flex items-center justify-center">
                  {item.preview_image_url ? (
                    <img
                      src={item.preview_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      size={32}
                      className="text-muted-foreground/40"
                    />
                  )}
                  {isOutdated && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                        Desatualizada
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p className="font-medium text-sm line-clamp-2">
                    {item.title}
                  </p>

                  <div className="flex flex-wrap gap-1 items-center">
                    <Badge className={`text-[10px] px-1.5 ${base.className}`}>
                      {base.label}
                    </Badge>
                    {item.discipline && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5"
                      >
                        {item.discipline}
                      </Badge>
                    )}
                    {item.adaptation_level && (
                      <Badge
                        className={`text-[10px] px-1.5 ${
                          ADAPTATION_BADGE[item.adaptation_level] ?? ""
                        }`}
                      >
                        {
                          ADAPTATION_LEVELS.find(
                            (a) => a.value === item.adaptation_level
                          )?.label
                        }
                      </Badge>
                    )}
                    {item.status && STATUS_BADGE[item.status] && (
                      <Badge
                        className={`text-[10px] px-1.5 ${STATUS_BADGE[item.status].className}`}
                      >
                        {STATUS_BADGE[item.status].label}
                      </Badge>
                    )}
                    {item.nivel_adaptacao && (
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {NIVEL_ADAPTACAO_OPTIONS.find((n) => n.value === item.nivel_adaptacao)?.label}
                      </Badge>
                    )}
                  </div>

                  {item.bncc_tags && (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {item.bncc_tags}
                    </p>
                  )}

                  {item.category && (
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                      {item.subcategory ? ` · ${item.subcategory}` : ""}
                    </p>
                  )}

                  {(item.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(item.tags ?? []).slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {(item.tags ?? []).length > 4 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{(item.tags ?? []).length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-1 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={11} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 size={12} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Atividade" : "Nova Atividade"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da atividade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BASE_OPTIONS.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                              {b.label}
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
                  name="discipline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DISCIPLINES.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Leitura, Escrita..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="activity_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Atividade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACTIVITY_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
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
                  name="usage_context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contexto de Uso</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USAGE_CONTEXTS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adaptation_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Adaptação</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ADAPTATION_LEVELS.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              {a.label}
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
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Animais, Números..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchAdaptation &&
                watchAdaptation !== "sem_adaptacao" && (
                  <FormField
                    control={form.control}
                    name="adaptation_justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justificativa da Adaptação</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={2}
                            placeholder="Descreva por que esta atividade foi adaptada..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              <FormField
                control={form.control}
                name="pedagogical_objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Pedagógico</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Descreva o objetivo pedagógico..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primary_skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidade Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: EF01LP01..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondary_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidades Secundárias</FormLabel>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Digite e pressione Enter"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Ex: alfabetização, vogais..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bncc_tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidades BNCC</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="EF01MA01, EF02LP03..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? "pendente"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
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
                  name="nivel_adaptacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel Adaptacao</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NIVEL_ADAPTACAO_OPTIONS.map((n) => (
                            <SelectItem key={n.value} value={n.value}>
                              {n.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="designer_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Design (Canva/PDF)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Canva / Drive</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File uploads */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PDF (opcional)</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingPdf}
                        asChild
                      >
                        <span>
                          <FileText size={14} className="mr-2" />
                          {uploadingPdf ? "Enviando..." : "Upload PDF"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                      />
                    </label>
                    {watchFileUrl && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-600">
                          Anexado
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => form.setValue("file_url", "")}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Preview (opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingPreview}
                        asChild
                      >
                        <span>
                          <Upload size={14} className="mr-2" />
                          {uploadingPreview ? "Enviando..." : "Upload Imagem"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePreviewUpload}
                        disabled={uploadingPreview}
                      />
                    </label>
                    {watchPreviewUrl && (
                      <div className="flex items-center gap-1">
                        <img
                          src={watchPreviewUrl}
                          alt=""
                          className="h-8 w-auto rounded border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            form.setValue("preview_image_url", "")
                          }
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI classify (mocked) */}
              <div className="flex items-center gap-3 p-3 rounded-md border border-dashed bg-muted/30">
                <Sparkles size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">
                  Classificação automática por IA
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({ title: "Classificação automática em breve" })
                  }
                >
                  <Sparkles size={13} className="mr-1" />
                  Classificar com IA
                </Button>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Salvando..."
                    : editing
                    ? "Salvar"
                    : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
