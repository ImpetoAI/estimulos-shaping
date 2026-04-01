import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Upload, X, Link2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const schema = z.object({
  origin: z.enum(["bncc", "dct", "livro_didatico", "outro"]),
  origin_name: z.string().optional(),
  escola: z.string().optional(),
  stage: z.enum(["infantil", "fundamental_1", "fundamental_2"]),
  discipline: z.string().optional(),
  experience_field: z.string().optional(),
  grade: z.string().min(1, "Selecione a série"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  cover_image_url: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type CurriculumBank = {
  id: string;
  origin: string;
  origin_name: string | null;
  escola: string | null;
  stage: string;
  discipline: string | null;
  experience_field: string | null;
  grade: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
};

const ORIGINS = [
  { value: "bncc", label: "BNCC" },
  { value: "dct", label: "DCT" },
  { value: "livro_didatico", label: "Livro Didático" },
  { value: "outro", label: "Outro" },
];

const STAGES = [
  { value: "infantil", label: "Ed. Infantil" },
  { value: "fundamental_1", label: "Fund. I" },
  { value: "fundamental_2", label: "Fund. II" },
];

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

const GRADES_BY_STAGE: Record<string, string[]> = {
  infantil: ["Berçário", "Maternal I", "Maternal II", "Pré I", "Pré II"],
  fundamental_1: ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"],
  fundamental_2: ["6º Ano", "7º Ano", "8º Ano", "9º Ano"],
};

const ORIGIN_LABELS: Record<string, string> = {
  bncc: "BNCC",
  dct: "DCT",
  livro_didatico: "Livro Didático",
  outro: "Outro",
};

const STAGE_LABELS: Record<string, string> = {
  infantil: "Ed. Infantil",
  fundamental_1: "Fund. I",
  fundamental_2: "Fund. II",
};

export default function BancoCurriculosPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<CurriculumBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CurriculumBank | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CurriculumBank | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vincular a aluno
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkCurriculumId, setLinkCurriculumId] = useState<string | null>(null);
  const [linkStudents, setLinkStudents] = useState<{ id: string; full_name: string; case_id: string; grade: string }[]>([]);
  const [linkSelectedStudent, setLinkSelectedStudent] = useState("");
  const [linkBimester, setLinkBimester] = useState("1");
  const [linkSaving, setLinkSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin: "bncc",
      stage: "fundamental_1",
      grade: "",
      content: "",
    },
  });

  const watchStage = form.watch("stage");
  const watchOrigin = form.watch("origin");
  const watchCoverUrl = form.watch("cover_image_url");

  const openLinkDialog = async (curriculumId: string) => {
    setLinkCurriculumId(curriculumId);
    setLinkSelectedStudent("");
    setLinkBimester("1");
    // Load students with active cases
    const { data } = await db
      .from("cases")
      .select("id, student_id, grade, students(id, full_name)")
      .eq("status", "active")
      .eq("academic_year", new Date().getFullYear());
    const students = (data ?? []).map((c: any) => ({
      id: c.students?.id ?? c.student_id,
      full_name: c.students?.full_name ?? "—",
      case_id: c.id,
      grade: c.grade,
    }));
    setLinkStudents(students);
    setLinkDialogOpen(true);
  };

  const handleLink = async () => {
    if (!linkCurriculumId || !linkSelectedStudent) return;
    setLinkSaving(true);
    const student = linkStudents.find((s) => s.id === linkSelectedStudent);
    if (!student) { setLinkSaving(false); return; }
    const { error } = await db.from("case_curriculum_originals").insert({
      case_id: student.case_id,
      bimester: parseInt(linkBimester),
      curriculum_bank_id: linkCurriculumId,
    });
    setLinkSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vinculado!", description: `Curriculo vinculado a ${student.full_name} no ${linkBimester}o bimestre.` });
      setLinkDialogOpen(false);
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db
      .from("curriculum_banks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as CurriculumBank[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    form.setValue("grade", "");
  }, [watchStage]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    form.reset({
      origin: "bncc",
      stage: "fundamental_1",
      grade: "",
      content: "",
      origin_name: "",
      escola: "",
      discipline: "",
      experience_field: "",
      cover_image_url: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: CurriculumBank) => {
    setEditing(item);
    form.reset({
      origin: item.origin as FormValues["origin"],
      origin_name: item.origin_name ?? "",
      escola: item.escola ?? "",
      stage: item.stage as FormValues["stage"],
      discipline: item.discipline ?? "",
      experience_field: item.experience_field ?? "",
      grade: item.grade,
      content: item.content,
      cover_image_url: item.cover_image_url ?? "",
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `curriculos/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(path, file);
    if (error) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(data.path);
      form.setValue("cover_image_url", urlData.publicUrl);
    }
    setUploading(false);
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const needsName = ["livro_didatico", "outro"].includes(values.origin);
    const payload = {
      origin: values.origin,
      origin_name: needsName ? (values.origin_name || null) : null,
      escola: values.escola || null,
      stage: values.stage,
      discipline:
        values.stage !== "infantil" ? (values.discipline || null) : null,
      experience_field:
        values.stage === "infantil"
          ? (values.experience_field || null)
          : null,
      grade: values.grade,
      content: values.content,
      cover_image_url: values.cover_image_url || null,
      created_by: user?.id ?? null,
    };

    let error;
    if (editing) {
      ({ error } = await db
        .from("curriculum_banks")
        .update(payload)
        .eq("id", editing.id));
    } else {
      ({ error } = await db.from("curriculum_banks").insert(payload));
    }

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: editing ? "Currículo atualizado" : "Currículo criado" });
      setDialogOpen(false);
      fetchItems();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await db
      .from("curriculum_banks")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Currículo removido" });
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const filtered = items.filter((item) => {
    if (filterOrigin !== "all" && item.origin !== filterOrigin) return false;
    if (filterStage !== "all" && item.stage !== filterStage) return false;
    if (filterDiscipline !== "all" && item.discipline !== filterDiscipline)
      return false;
    if (filterGrade !== "all" && item.grade !== filterGrade) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        (item.discipline ?? "").toLowerCase().includes(q) ||
        (item.experience_field ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const allGrades = [...new Set(items.map((i) => i.grade))].sort();
  const hasFilters =
    filterOrigin !== "all" ||
    filterStage !== "all" ||
    filterDiscipline !== "all" ||
    filterGrade !== "all" ||
    search !== "";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Banco de Currículos</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registro{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Novo Currículo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Buscar por conteúdo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Select value={filterOrigin} onValueChange={setFilterOrigin}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            {ORIGINS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas etapas</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
          <SelectTrigger className="w-44">
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
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Série" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas séries</SelectItem>
            {allGrades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterOrigin("all");
              setFilterStage("all");
              setFilterDiscipline("all");
              setFilterGrade("all");
              setSearch("");
            }}
          >
            <X size={14} className="mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origem</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Disciplina / Campo</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {ORIGIN_LABELS[item.origin] ?? item.origin}
                    </Badge>
                    {item.origin_name && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({item.origin_name})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {STAGE_LABELS[item.stage] ?? item.stage}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.discipline ?? item.experience_field ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{item.grade}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm line-clamp-2">{item.content}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Vincular a aluno"
                        onClick={() => openLinkDialog(item.id)}
                      >
                        <Link2 size={14} className="text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Currículo" : "Novo Currículo"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem</FormLabel>
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
                          {ORIGINS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {["livro_didatico", "outro"].includes(watchOrigin) && (
                  <FormField
                    control={form.control}
                    name="origin_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchOrigin === "livro_didatico"
                            ? "Nome do Livro"
                            : "Nome da Fonte"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Anglo, Passeio..."
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
                  name="escola"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escola</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Escola Municipal Darcy Ribeiro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etapa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGES.map((s) => (
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

              {watchStage === "infantil" ? (
                <FormField
                  control={form.control}
                  name="experience_field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campo de Experiência</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Escuta, fala, pensamento e imaginação"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
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
              )}

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série / Turma</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(GRADES_BY_STAGE[watchStage] ?? []).map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
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
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Descreva o conteúdo curricular..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cover image upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Capa do Livro (opcional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Upload size={14} className="mr-2" />
                        {uploading ? "Enviando..." : "Upload Imagem"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  {watchCoverUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={watchCoverUrl}
                        alt="Capa"
                        className="h-12 w-auto rounded border object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => form.setValue("cover_image_url", "")}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                </div>
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
                  {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
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
            <AlertDialogTitle>Remover currículo?</AlertDialogTitle>
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

      {/* Link to student dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Curriculo a Aluno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Aluno</label>
              <Select value={linkSelectedStudent} onValueChange={setLinkSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Selecionar aluno" /></SelectTrigger>
                <SelectContent>
                  {linkStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} — {s.grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bimestre</label>
              <Select value={linkBimester} onValueChange={setLinkBimester}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1o Bimestre</SelectItem>
                  <SelectItem value="2">2o Bimestre</SelectItem>
                  <SelectItem value="3">3o Bimestre</SelectItem>
                  <SelectItem value="4">4o Bimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleLink} disabled={linkSaving || !linkSelectedStudent}>
              {linkSaving ? "Vinculando..." : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
