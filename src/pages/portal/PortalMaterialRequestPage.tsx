import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Calendar, GraduationCap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/supabase";
import { toast } from "sonner";

type MaterialType =
  | "adaptacao_curricular"
  | "apostila_complementar"
  | "adaptacao_provas"
  | "historias_sociais"
  | "rotina"
  | "calendario"
  | "passo_a_passo"
  | "quadro_recompensa"
  | "cartoes_instrucao"
  | "album_figurinhas"
  | "outros";

interface CaseOption {
  id: string;
  academic_year: number;
  grade: string;
  current_bimester: number;
}

interface ProductionOrder {
  id: string;
  material_type: string;
  description: string | null;
  priority: number;
  status: string;
  notes: string | null;
  requested_at: string;
  bimester?: number;
  academic_year?: number;
}

const MATERIAL_LABELS: Record<MaterialType, string> = {
  adaptacao_curricular: "Adaptacao Curricular",
  apostila_complementar: "Apostila Complementar",
  adaptacao_provas: "Adaptacao de Provas",
  historias_sociais: "Historias Sociais",
  rotina: "Rotina Visual",
  calendario: "Calendario",
  passo_a_passo: "Passo a Passo",
  quadro_recompensa: "Quadro de Recompensa",
  cartoes_instrucao: "Cartoes de Instrucao",
  album_figurinhas: "Album de Figurinhas",
  outros: "Outros",
};

const STATUS_LABELS: Record<string, string> = {
  solicitada: "Solicitada",
  producao_pedagogica: "Em Producao",
  impressao: "Impressao",
  finalizacao: "Finalizacao",
  concluida: "Concluida",
};

const STATUS_CLASS: Record<string, string> = {
  solicitada: "border-yellow-400 text-yellow-700 bg-yellow-50",
  producao_pedagogica: "bg-blue-100 text-blue-700 border-blue-300",
  impressao: "bg-blue-100 text-blue-700 border-blue-300",
  finalizacao: "bg-blue-100 text-blue-700 border-blue-300",
  concluida: "bg-green-100 text-green-700 border-green-300",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function PortalMaterialRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Case selection
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedBimester, setSelectedBimester] = useState("");

  // Form
  const [materialType, setMaterialType] = useState<MaterialType | "">("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0"); // 0=normal, 1=urgente
  const [submitting, setSubmitting] = useState(false);

  // Orders
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);

    // Buscar casos do aluno
    const { data: casesData } = await db
      .from("cases")
      .select("id, academic_year, grade, current_bimester")
      .eq("student_id", id!)
      .eq("status", "active")
      .order("academic_year", { ascending: false });

    if (casesData && casesData.length > 0) {
      setCases(casesData as CaseOption[]);
      setSelectedCaseId(casesData[0].id);
      setSelectedBimester(casesData[0].current_bimester.toString());
    }

    // Buscar solicitacoes existentes
    const { data: ordersData } = await db
      .from("production_orders")
      .select("id, material_type, description, priority, status, notes, requested_at")
      .eq("student_id", id!)
      .order("requested_at", { ascending: false });

    setOrders((ordersData as ProductionOrder[]) ?? []);
    setLoading(false);
  }

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !materialType || !selectedCaseId || !selectedBimester) return;

    setSubmitting(true);
    const { data: newOrder, error } = await db
      .from("production_orders")
      .insert({
        student_id: id,
        requested_by: user.id,
        material_type: materialType,
        classification: "novo",
        priority: parseInt(priority),
        status: "solicitada",
        notes: `Ano: ${selectedCase?.academic_year} | Bimestre: ${selectedBimester} | ${description}`,
      })
      .select("id, material_type, description, priority, status, notes, requested_at")
      .single();

    if (error) {
      toast.error("Erro ao criar solicitacao");
    } else if (newOrder) {
      setOrders((prev) => [newOrder as ProductionOrder, ...prev]);
      setMaterialType("");
      setDescription("");
      setPriority("0");
      toast.success("Material solicitado com sucesso!");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <button onClick={() => navigate(`/portal/pacientes/${id}`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Ficha do Paciente
      </button>

      <h1 className="text-xl font-bold mb-6">Solicitar Material</h1>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Funcionalidade Premium</p>
          <p className="text-xs text-amber-600">Solicitacao de materiais avulsos disponivel no plano completo.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-4 mb-6">
            {/* Ano + Bimestre */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Ano Letivo
                </Label>
                <Select value={selectedCaseId} onValueChange={(v) => {
                  setSelectedCaseId(v);
                  const c = cases.find((x) => x.id === v);
                  if (c) setSelectedBimester(c.current_bimester.toString());
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.academic_year} — {c.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Bimestre
                </Label>
                <Select value={selectedBimester} onValueChange={setSelectedBimester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bim" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((b) => (
                      <SelectItem key={b} value={b.toString()}>
                        {b}o Bimestre {b === selectedCase?.current_bimester ? "(atual)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo material */}
            <div className="space-y-1.5">
              <Label>Tipo de Material *</Label>
              <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MATERIAL_LABELS) as MaterialType[]).map((key) => (
                    <SelectItem key={key} value={key}>{MATERIAL_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descricao */}
            <div className="space-y-1.5">
              <Label>Descricao</Label>
              <Textarea
                rows={3}
                placeholder="Descreva o material necessario, contexto e observacoes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>

            {/* Prioridade */}
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={submitting || !materialType || !selectedCaseId}>
              {submitting ? "Solicitando..." : (
                <><Package className="w-4 h-4 mr-2" /> Solicitar</>
              )}
            </Button>
          </form>

          {/* Historico */}
          <h3 className="font-semibold text-sm mb-3">Minhas Solicitacoes</h3>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-border/40 p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma solicitacao ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-border/40 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {MATERIAL_LABELS[order.material_type as MaterialType] ?? order.material_type}
                    </span>
                    <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_CLASS[order.status] ?? ""}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{order.notes}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(order.requested_at)}</span>
                    {order.priority > 0 && <span className="text-destructive font-medium">Urgente</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pb-8" />
        </>
      )}
    </div>
  );
}
