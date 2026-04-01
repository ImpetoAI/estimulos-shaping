import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, ChevronRight, Clock, User, Package, Trash2, CheckCircle2, Lock } from "lucide-react";

// ---- Types ----

type ProductionStatus = "solicitada" | "producao_pedagogica" | "impressao" | "finalizacao" | "concluida";
type Classification = "novo" | "adaptado_acervo" | "reuso_canva" | "reuso_armario";
type StepType = "producao_pedagogica" | "impressao" | "finalizacao";

interface ProductionStep {
  id: string;
  step: StepType;
  responsible_id: string | null;
  started_at: string | null;
  completed_at: string | null;
}

interface Order {
  id: string;
  student_id: string | null;
  material_type: string;
  classification: Classification;
  priority: number;
  notes: string | null;
  status: ProductionStatus;
  requested_at: string;
  students: { full_name: string } | null;
  production_steps: ProductionStep[];
}

interface Profile { id: string; full_name: string; role: string; }
interface SupplyItem { id: string; name: string; unit: string; }
interface Student { id: string; full_name: string; }

// ---- Constants ----

const MATERIAL_TYPES = [
  { value: "adaptacao_curricular", label: "Adaptação Curricular" },
  { value: "apostila_complementar", label: "Apostila Complementar" },
  { value: "adaptacao_provas", label: "Adaptação de Provas" },
  { value: "historias_sociais", label: "Histórias Sociais" },
  { value: "rotina", label: "Rotina" },
  { value: "calendario", label: "Calendário" },
  { value: "passo_a_passo", label: "Passo a Passo" },
  { value: "quadro_recompensa", label: "Quadro de Recompensa" },
  { value: "cartoes_instrucao", label: "Cartões de Instrução" },
  { value: "album_figurinhas", label: "Álbum de Figurinhas" },
  { value: "outros", label: "Outros" },
];

const CLASSIFICATION_LABELS: Record<Classification, string> = {
  novo: "Novo",
  adaptado_acervo: "Adaptado Acervo",
  reuso_canva: "Reuso Canva",
  reuso_armario: "Reuso Armário",
};

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  novo: "bg-primary/15 text-primary",
  adaptado_acervo: "bg-secondary/15 text-secondary",
  reuso_canva: "bg-warning/15 text-warning",
  reuso_armario: "bg-success/15 text-success",
};

const STEP_LABELS: Record<StepType, string> = {
  producao_pedagogica: "Produção Pedagógica",
  impressao: "Impressão",
  finalizacao: "Finalização",
};

const STATUS_TO_STEP: Partial<Record<ProductionStatus, StepType>> = {
  producao_pedagogica: "producao_pedagogica",
  impressao: "impressao",
  finalizacao: "finalizacao",
};

function getActiveStep(order: Order): ProductionStep | null {
  return order.production_steps.find((s) => !s.completed_at) || null;
}

function getElapsed(startedAt: string | null): string {
  if (!startedAt) return "—";
  const diff = Date.now() - new Date(startedAt).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getMaterialLabel(val: string): string {
  return MATERIAL_TYPES.find((m) => m.value === val)?.label ?? val;
}

function getResponsibleName(profiles: Profile[], id: string | null): string {
  if (!id) return "—";
  return profiles.find((p) => p.id === id)?.full_name ?? "—";
}

// ---- Solicitar Dialog ----

interface SolicitarDialogProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  currentUserId: string;
  onSuccess: () => void;
}

function SolicitarDialog({ open, onClose, students, currentUserId, onSuccess }: SolicitarDialogProps) {
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [classification, setClassification] = useState<Classification | "">("");
  const [priority, setPriority] = useState("3");
  const [notes, setNotes] = useState("");

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!materialType || !classification) throw new Error("Preencha todos os campos obrigatórios");

      const isReusoArmario = classification === "reuso_armario";

      const { data, error } = await db
        .from("production_orders")
        .insert({
          student_id: studentId || null,
          material_type: materialType,
          classification,
          priority: parseInt(priority, 10),
          notes: notes || null,
          requested_by: currentUserId,
          status: isReusoArmario ? "concluida" : "solicitada",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(
        classification === "reuso_armario"
          ? "Reuso Armário registrado — marcado como concluído."
          : "Solicitação criada com sucesso."
      );
      setStudentId(""); setStudentSearch(""); setMaterialType("");
      setClassification(""); setPriority("3"); setNotes("");
      onSuccess();
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Produção</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Student search */}
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <Input
              placeholder="Buscar paciente..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {studentSearch && (
              <div className="border rounded-md max-h-40 overflow-y-auto bg-background shadow-md">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">Nenhum encontrado</p>
                ) : (
                  filteredStudents.slice(0, 8).map((s) => (
                    <button
                      key={s.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${studentId === s.id ? "bg-primary/10 font-medium" : ""}`}
                      onClick={() => { setStudentId(s.id); setStudentSearch(s.full_name); }}
                    >
                      {s.full_name}
                    </button>
                  ))
                )}
              </div>
            )}
            {studentId && (
              <p className="text-xs text-muted-foreground">
                Selecionado: {students.find((s) => s.id === studentId)?.full_name}
              </p>
            )}
          </div>

          {/* Material type */}
          <div className="space-y-1.5">
            <Label>Tipo de Material *</Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classification */}
          <div className="space-y-1.5">
            <Label>Classificação *</Label>
            <Select value={classification} onValueChange={(v) => setClassification(v as Classification)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="adaptado_acervo">Adaptado Acervo</SelectItem>
                <SelectItem value="reuso_canva">Reuso Canva</SelectItem>
                <SelectItem value="reuso_armario">Reuso Armário (conclui direto)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label>Prioridade (1 = baixa, 5 = urgente)</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Detalhes adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !materialType || !classification}
          >
            {mutation.isPending ? "Salvando..." : "Solicitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Avançar Dialog ----

interface AvançarDialogProps {
  open: boolean;
  order: Order | null;
  nextStatus: ProductionStatus | null;
  profiles: Profile[];
  onClose: () => void;
  onSuccess: () => void;
}

function AvançarDialog({ open, order, nextStatus, profiles, onClose, onSuccess }: AvançarDialogProps) {
  const [responsibleId, setResponsibleId] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!order || !nextStatus) return;

      const activeStep = getActiveStep(order);

      // Complete current step if it exists
      if (activeStep) {
        const { error } = await db
          .from("production_steps")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", activeStep.id);
        if (error) throw error;
      }

      // Create new step for next stage
      const nextStep = STATUS_TO_STEP[nextStatus];
      if (nextStep) {
        const { error } = await db
          .from("production_steps")
          .insert({
            order_id: order.id,
            step: nextStep,
            responsible_id: responsibleId || null,
            started_at: new Date().toISOString(),
          });
        if (error) throw error;
      }

      // Update order status
      const { error } = await db
        .from("production_orders")
        .update({ status: nextStatus })
        .eq("id", order.id);
      if (error) throw error;
    },
    onSuccess: () => {
      const label = nextStatus ? STEP_LABELS[STATUS_TO_STEP[nextStatus] as StepType] ?? nextStatus : "";
      toast.success(`Avançado para: ${label}`);
      setResponsibleId("");
      onSuccess();
      onClose();
    },
    onError: () => toast.error("Erro ao avançar etapa"),
  });

  const nextLabel = nextStatus ? (STEP_LABELS[STATUS_TO_STEP[nextStatus] as StepType] ?? nextStatus) : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Avançar para: {nextLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Responsável pela etapa</Label>
            <Select value={responsibleId} onValueChange={setResponsibleId}>
              <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Avançando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Insumo Dialog (for completing finalizacao) ----

interface ConsumptionLine { supply_item_id: string; quantity: string; }

interface InsumoDialogProps {
  open: boolean;
  order: Order | null;
  supplyItems: SupplyItem[];
  currentUserId: string;
  profiles: Profile[];
  onClose: () => void;
  onSuccess: () => void;
}

function InsumoDialog({ open, order, supplyItems, currentUserId, profiles, onClose, onSuccess }: InsumoDialogProps) {
  const [responsibleId, setResponsibleId] = useState("");
  const [lines, setLines] = useState<ConsumptionLine[]>([{ supply_item_id: "", quantity: "1" }]);

  const addLine = () => setLines((prev) => [...prev, { supply_item_id: "", quantity: "1" }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof ConsumptionLine, value: string) => {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!order) return;

      const activeStep = getActiveStep(order);

      // Complete finalizacao step
      if (activeStep) {
        const { error } = await db
          .from("production_steps")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", activeStep.id);
        if (error) throw error;
      }

      // Record supply consumption
      const validLines = lines.filter((l) => l.supply_item_id && parseFloat(l.quantity) > 0);
      if (validLines.length > 0) {
        const { error } = await db
          .from("supply_consumption")
          .insert(
            validLines.map((l) => ({
              order_id: order.id,
              supply_item_id: l.supply_item_id,
              quantity: parseFloat(l.quantity),
              recorded_by: currentUserId,
            }))
          );
        if (error) throw error;
      }

      // Mark order as concluida
      const { error } = await db
        .from("production_orders")
        .update({ status: "concluida" })
        .eq("id", order.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produção concluída com sucesso!");
      setLines([{ supply_item_id: "", quantity: "1" }]);
      setResponsibleId("");
      onSuccess();
      onClose();
    },
    onError: () => toast.error("Erro ao concluir produção"),
  });

  const getUnit = (itemId: string) =>
    supplyItems.find((s) => s.id === itemId)?.unit ?? "un";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Concluir Produção — Registrar Insumos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Responsible */}
          <div className="space-y-1.5">
            <Label>Responsável pela finalização</Label>
            <Select value={responsibleId} onValueChange={setResponsibleId}>
              <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supply lines */}
          <div className="space-y-2">
            <Label>Insumos utilizados</Label>
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Select
                  value={line.supply_item_id}
                  onValueChange={(v) => updateLine(i, "supply_item_id", v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supplyItems.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  className="w-24"
                  placeholder={line.supply_item_id ? getUnit(line.supply_item_id) : "Qtd"}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                >
                  <Trash2 size={15} className="text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLine} className="w-full">
              <Plus size={14} className="mr-1" /> Adicionar insumo
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Concluir Produção"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Kanban Card ----

interface KanbanCardProps {
  order: Order;
  profiles: Profile[];
  onAdvance: (order: Order, nextStatus: ProductionStatus) => void;
  onComplete: (order: Order) => void;
}

function KanbanCard({ order, profiles, onAdvance, onComplete }: KanbanCardProps) {
  const activeStep = getActiveStep(order);
  const responsible = getResponsibleName(profiles, activeStep?.responsible_id ?? null);

  const handleAdvance = () => {
    const next: Record<ProductionStatus, ProductionStatus | null> = {
      solicitada: "producao_pedagogica",
      producao_pedagogica: "impressao",
      impressao: "finalizacao",
      finalizacao: "concluida",
      concluida: null,
    };
    const nextStatus = next[order.status];
    if (!nextStatus) return;
    if (nextStatus === "concluida") {
      onComplete(order);
    } else {
      onAdvance(order, nextStatus);
    }
  };

  const advanceLabel: Record<ProductionStatus, string> = {
    solicitada: "Iniciar Produção",
    producao_pedagogica: "→ Impressão",
    impressao: "→ Finalização",
    finalizacao: "Concluir",
    concluida: "",
  };

  return (
    <Card className="border border-border bg-card hover:shadow-sm transition-shadow">
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-card-foreground truncate">
              {order.students?.full_name ?? "Sem paciente"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {getMaterialLabel(order.material_type)}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs font-bold text-muted-foreground">P{order.priority}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${CLASSIFICATION_COLORS[order.classification]}`}>
            {CLASSIFICATION_LABELS[order.classification]}
          </span>
          {order.status === "solicitada" && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
              Aguardando
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-0.5">
          {responsible !== "—" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User size={11} />
              <span>{responsible}</span>
            </div>
          )}
          {activeStep?.started_at && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} />
              <span>{getElapsed(activeStep.started_at)} nesta etapa</span>
            </div>
          )}
          {order.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{order.notes}</p>
          )}
        </div>

        {/* Action */}
        {order.status !== "concluida" && (
          <Button
            size="sm"
            variant={order.status === "finalizacao" ? "default" : "outline"}
            className="w-full h-7 text-xs"
            onClick={handleAdvance}
          >
            {order.status === "finalizacao" && <CheckCircle2 size={12} className="mr-1" />}
            {advanceLabel[order.status]}
            {order.status !== "finalizacao" && <ChevronRight size={12} className="ml-1" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Kanban Column ----

interface KanbanColumnProps {
  title: string;
  orders: Order[];
  profiles: Profile[];
  onAdvance: (order: Order, nextStatus: ProductionStatus) => void;
  onComplete: (order: Order) => void;
}

function KanbanColumn({ title, orders, profiles, onAdvance, onComplete }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] flex-1 bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-card-foreground">{title}</h3>
        <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {orders.length}
        </span>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhum item</p>
        ) : (
          orders.map((order) => (
            <KanbanCard
              key={order.id}
              order={order}
              profiles={profiles}
              onAdvance={onAdvance}
              onComplete={onComplete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function ProducaoPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [solicitarOpen, setSolicitarOpen] = useState(false);
  const [avançarOrder, setAvançarOrder] = useState<Order | null>(null);
  const [avançarNextStatus, setAvançarNextStatus] = useState<ProductionStatus | null>(null);
  const [insumoOrder, setInsumoOrder] = useState<Order | null>(null);

  // Data fetching
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["production_orders"],
    queryFn: async () => {
      const { data, error } = await db
        .from("production_orders")
        .select(`
          id, student_id, material_type, classification, priority, notes, status, requested_at,
          students(full_name),
          production_steps(id, step, responsible_id, started_at, completed_at)
        `)
        .neq("status", "concluida")
        .order("priority", { ascending: false })
        .order("requested_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });

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

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles_list"],
    queryFn: async () => {
      const { data, error } = await db
        .from("profiles")
        .select("id, full_name, role")
        .eq("active", true)
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const { data: supplyItems = [] } = useQuery<SupplyItem[]>({
    queryKey: ["supply_items"],
    queryFn: async () => {
      const { data, error } = await db
        .from("supply_items")
        .select("id, name, unit")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as SupplyItem[];
    },
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["production_orders"] });

  const handleAdvance = (order: Order, nextStatus: ProductionStatus) => {
    setAvançarOrder(order);
    setAvançarNextStatus(nextStatus);
  };

  const handleComplete = (order: Order) => {
    setInsumoOrder(order);
  };

  // Group orders by column
  const column1 = orders.filter((o) => o.status === "solicitada" || o.status === "producao_pedagogica");
  const column2 = orders.filter((o) => o.status === "impressao");
  const column3 = orders.filter((o) => o.status === "finalizacao");

  const totalActive = orders.length;

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col space-y-4">
      {/* Premium banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Funcionalidade Premium</p>
          <p className="text-xs text-amber-600">Gestao de producao e fila de materiais disponivel no plano completo.</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produção</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Fila de produção de materiais pedagógicos
            {totalActive > 0 && (
              <span className="ml-2 font-semibold text-primary">{totalActive} em andamento</span>
            )}
          </p>
        </div>
        <Button onClick={() => setSolicitarOpen(true)}>
          <Plus size={16} className="mr-2" />
          Nova Solicitação
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto flex-1 pb-2">
        <KanbanColumn
          title="Produção Pedagógica"
          orders={column1}
          profiles={profiles}
          onAdvance={handleAdvance}
          onComplete={handleComplete}
        />
        <KanbanColumn
          title="Impressão"
          orders={column2}
          profiles={profiles}
          onAdvance={handleAdvance}
          onComplete={handleComplete}
        />
        <KanbanColumn
          title="Finalização"
          orders={column3}
          profiles={profiles}
          onAdvance={handleAdvance}
          onComplete={handleComplete}
        />
      </div>

      {/* Dialogs */}
      <SolicitarDialog
        open={solicitarOpen}
        onClose={() => setSolicitarOpen(false)}
        students={students}
        currentUserId={user?.id ?? ""}
        onSuccess={refetch}
      />
      <AvançarDialog
        open={!!avançarOrder && !insumoOrder}
        order={avançarOrder}
        nextStatus={avançarNextStatus}
        profiles={profiles}
        onClose={() => { setAvançarOrder(null); setAvançarNextStatus(null); }}
        onSuccess={refetch}
      />
      <InsumoDialog
        open={!!insumoOrder}
        order={insumoOrder}
        supplyItems={supplyItems}
        currentUserId={user?.id ?? ""}
        profiles={profiles}
        onClose={() => setInsumoOrder(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
