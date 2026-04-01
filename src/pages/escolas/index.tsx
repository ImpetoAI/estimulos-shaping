import { useEffect, useState } from "react";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, BookOpen, Search, School, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchoolRecord {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  school_type: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  active: boolean;
}

interface CurriculumBank {
  id: string;
  origin: string;
  origin_name: string | null;
  discipline: string | null;
  experience_field: string | null;
  grade: string;
  stage: string;
}

interface SchoolCurriculum {
  id: string;
  curriculum_bank_id: string;
  academic_year: number;
  notes: string | null;
  curriculum_banks: CurriculumBank;
}

const SCHOOL_TYPES = [
  { value: "publica", label: "Pública" },
  { value: "particular", label: "Particular" },
  { value: "conveniada", label: "Conveniada" },
];

const emptyForm = {
  name: "",
  city: "Palmas",
  state: "TO",
  school_type: "particular",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  notes: "",
};

export default function EscolasPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Curricula dialog
  const [curriculaOpen, setCurriculaOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);
  const [schoolCurricula, setSchoolCurricula] = useState<SchoolCurriculum[]>([]);
  const [availableCurricula, setAvailableCurricula] = useState<CurriculumBank[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [curriculaLoading, setCurriculaLoading] = useState(false);

  // Inactivate dialog
  const [inactivateId, setInactivateId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    setLoading(true);
    const { data, error } = await db
      .from("schools")
      .select("*")
      .order("name");
    if (!error && data) setSchools(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast({ title: "Nome da escola é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await db.from("schools").update(form).eq("id", editingId);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Escola atualizada" });
      }
    } else {
      const { error } = await db.from("schools").insert(form);
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Escola cadastrada" });
      }
    }
    setSaving(false);
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchSchools();
  }

  function openEdit(school: SchoolRecord) {
    setEditingId(school.id);
    setForm({
      name: school.name,
      city: school.city ?? "",
      state: school.state ?? "TO",
      school_type: school.school_type,
      contact_name: school.contact_name ?? "",
      contact_phone: school.contact_phone ?? "",
      contact_email: school.contact_email ?? "",
      notes: school.notes ?? "",
    });
    setFormOpen(true);
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  async function handleInactivate() {
    if (!inactivateId) return;
    const school = schools.find((s) => s.id === inactivateId);
    const newStatus = school?.active === false ? true : false;
    await db.from("schools").update({ active: !newStatus ? true : false }).eq("id", inactivateId);
    setInactivateId(null);
    fetchSchools();
    toast({ title: newStatus ? "Escola inativada" : "Escola reativada" });
  }

  async function openCurricula(school: SchoolRecord) {
    setSelectedSchool(school);
    setCurriculaOpen(true);
    setCurriculaLoading(true);

    const [linked, available] = await Promise.all([
      db
        .from("school_curricula")
        .select("id, curriculum_bank_id, academic_year, notes, curriculum_banks(id, origin, origin_name, discipline, experience_field, grade, stage)")
        .eq("school_id", school.id)
        .order("academic_year", { ascending: false }),
      db
        .from("curriculum_banks")
        .select("id, origin, origin_name, discipline, experience_field, grade, stage")
        .order("discipline"),
    ]);

    if (linked.data) setSchoolCurricula(linked.data as unknown as SchoolCurriculum[]);
    if (available.data) setAvailableCurricula(available.data as CurriculumBank[]);
    setCurriculaLoading(false);
  }

  async function linkCurriculum() {
    if (!selectedSchool || !selectedCurriculumId) return;
    const { error } = await db.from("school_curricula").insert({
      school_id: selectedSchool.id,
      curriculum_bank_id: selectedCurriculumId,
      academic_year: new Date().getFullYear(),
    });
    if (error) {
      toast({ title: "Erro ao vincular", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Currículo vinculado" });
      setSelectedCurriculumId("");
      openCurricula(selectedSchool);
    }
  }

  async function unlinkCurriculum(linkId: string) {
    await db.from("school_curricula").delete().eq("id", linkId);
    toast({ title: "Vínculo removido" });
    if (selectedSchool) openCurricula(selectedSchool);
  }

  function formatCurriculumLabel(c: CurriculumBank) {
    const origin = c.origin_name || c.origin.toUpperCase();
    const subject = c.discipline || c.experience_field || "";
    return `${origin} — ${subject} — ${c.grade}`;
  }

  const filtered = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || s.school_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escolas</h1>
          <p className="text-muted-foreground text-sm">
            Cadastro de escolas e vínculos com currículos/livros
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-2" />
          Nova Escola
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {SCHOOL_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma escola encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((school) => (
                  <TableRow key={school.id} className={!school.active ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <School size={16} className="text-muted-foreground" />
                        {school.name}
                      </div>
                    </TableCell>
                    <TableCell>{school.city ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {SCHOOL_TYPES.find((t) => t.value === school.school_type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {school.contact_name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={school.active ? "default" : "secondary"}>
                        {school.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => openCurricula(school)} title="Currículos">
                          <BookOpen size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(school)} title="Editar">
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setInactivateId(school.id)}
                          title={school.active ? "Inativar" : "Reativar"}
                        >
                          <Power size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Escola" : "Nova Escola"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da escola *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cidade</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.school_type} onValueChange={(v) => setForm({ ...form, school_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome do contato</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Telefone</Label>
                <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Curricula Dialog */}
      <Dialog open={curriculaOpen} onOpenChange={setCurriculaOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Currículos — {selectedSchool?.name}</DialogTitle>
          </DialogHeader>
          {curriculaLoading ? (
            <p className="text-muted-foreground py-4">Carregando...</p>
          ) : (
            <div className="space-y-4">
              {/* Link new */}
              <div className="flex gap-2">
                <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar currículo para vincular..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurricula
                      .filter((c) => !schoolCurricula.some((sc) => sc.curriculum_bank_id === c.id))
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {formatCurriculumLabel(c)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={linkCurriculum} disabled={!selectedCurriculumId}>
                  <Plus size={14} className="mr-1" /> Vincular
                </Button>
              </div>

              {/* Linked list */}
              {schoolCurricula.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Nenhum currículo vinculado. Selecione acima para vincular.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origem</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Ano Letivo</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolCurricula.map((sc) => (
                      <TableRow key={sc.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {sc.curriculum_banks.origin_name || sc.curriculum_banks.origin.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sc.curriculum_banks.discipline || sc.curriculum_banks.experience_field || "—"}
                        </TableCell>
                        <TableCell>{sc.curriculum_banks.grade}</TableCell>
                        <TableCell>{sc.academic_year}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => unlinkCurriculum(sc.id)}>
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inactivate confirm */}
      <AlertDialog open={!!inactivateId} onOpenChange={() => setInactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {schools.find((s) => s.id === inactivateId)?.active
                ? "Inativar escola?"
                : "Reativar escola?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {schools.find((s) => s.id === inactivateId)?.active
                ? "A escola será marcada como inativa. Alunos vinculados não serão afetados."
                : "A escola voltará a aparecer como ativa."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleInactivate}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
