import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { Download, Package } from "lucide-react";
import { format, startOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ---- Types ----

interface SupplyConsumption {
  id: string;
  order_id: string;
  supply_item_id: string;
  quantity: number;
  recorded_at: string;
  supply_items: { name: string; unit: string } | null;
  production_orders: {
    material_type: string;
    status: string;
    students: { full_name: string } | null;
  } | null;
}

const MATERIAL_LABELS: Record<string, string> = {
  adaptacao_curricular: "Adap. Curricular",
  apostila_complementar: "Apostila",
  adaptacao_provas: "Adap. Provas",
  historias_sociais: "H. Sociais",
  rotina: "Rotina",
  calendario: "Calendário",
  passo_a_passo: "Passo a Passo",
  quadro_recompensa: "Quadro",
  cartoes_instrucao: "Cartões",
  album_figurinhas: "Álbum",
  outros: "Outros",
};

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];

function inRange(dateStr: string, from: Date, to: Date): boolean {
  const d = parseISO(dateStr);
  return d >= from && d <= to;
}

function getDefaultDates(): { from: string; to: string } {
  return {
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  };
}

export default function RelatorioInsumosPage() {
  const defaults = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [filterStudent, setFilterStudent] = useState("all");
  const [filterMaterial, setFilterMaterial] = useState("all");

  const { data: consumption = [] } = useQuery<SupplyConsumption[]>({
    queryKey: ["relatorio_insumos"],
    queryFn: async () => {
      const { data, error } = await db
        .from("supply_consumption")
        .select(`
          id, order_id, supply_item_id, quantity, recorded_at,
          supply_items(name, unit),
          production_orders(material_type, status, students(full_name))
        `)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupplyConsumption[];
    },
  });

  const from = new Date(dateFrom);
  const to = new Date(dateTo + "T23:59:59");

  const filtered = useMemo(() => {
    let result = consumption.filter((c) => inRange(c.recorded_at, from, to));
    if (filterStudent !== "all") {
      result = result.filter((c) =>
        c.production_orders?.students?.full_name === filterStudent
      );
    }
    if (filterMaterial !== "all") {
      result = result.filter((c) =>
        c.production_orders?.material_type === filterMaterial
      );
    }
    return result;
  }, [consumption, from, to, filterStudent, filterMaterial]);

  // KPIs
  const totalMateriais = new Set(filtered.map((c) => c.order_id)).size;
  const totalItems = filtered.reduce((acc, c) => acc + Number(c.quantity), 0);

  // Unique students and material types for filters
  const allStudents = useMemo(() => {
    const names = new Set<string>();
    for (const c of consumption) {
      const name = c.production_orders?.students?.full_name;
      if (name) names.add(name);
    }
    return Array.from(names).sort();
  }, [consumption]);

  // Chart: by supply item (totals)
  const byItem = useMemo(() => {
    const map: Record<string, { name: string; unit: string; total: number }> = {};
    for (const c of filtered) {
      const key = c.supply_item_id;
      if (!map[key]) {
        map[key] = { name: c.supply_items?.name ?? "—", unit: c.supply_items?.unit ?? "un", total: 0 };
      }
      map[key].total += Number(c.quantity);
    }
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 7)
      .map((x) => ({ name: `${x.name} (${x.unit})`, value: x.total }));
  }, [filtered]);

  // Chart: by material type (pie)
  const byMaterialType = useMemo(() => {
    const map: Record<string, number> = {};
    const orders = new Set<string>();
    for (const c of filtered) {
      if (!c.order_id || orders.has(c.order_id)) continue;
      orders.add(c.order_id);
      const label = MATERIAL_LABELS[c.production_orders?.material_type ?? ""] ?? (c.production_orders?.material_type ?? "Outro");
      map[label] = (map[label] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Chart: over time
  const overTime = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of filtered) {
      const key = format(parseISO(c.recorded_at), "dd/MM", { locale: ptBR });
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .sort(([a], [b]) => {
        const [da, ma] = a.split("/").map(Number);
        const [db2, mb] = b.split("/").map(Number);
        return ma !== mb ? ma - mb : da - db2;
      })
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Chart: by student (top 8)
  const byStudent = useMemo(() => {
    const map: Record<string, number> = {};
    const seenOrders = new Map<string, string>();
    for (const c of filtered) {
      const student = c.production_orders?.students?.full_name ?? "Sem paciente";
      if (!seenOrders.has(c.order_id)) {
        seenOrders.set(c.order_id, student);
        map[student] = (map[student] || 0) + 1;
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Insumos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Controle de consumo de materiais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Exportação em breve")}>
            <Download size={14} className="mr-1.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Exportação em breve")}>
            <Download size={14} className="mr-1.5" /> Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">De</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Até</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Paciente</Label>
              <Select value={filterStudent} onValueChange={setFilterStudent}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {allStudents.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo Material</Label>
              <Select value={filterMaterial} onValueChange={setFilterMaterial}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(MATERIAL_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Package size={18} className="text-primary mb-2" />
            <p className="text-2xl font-bold">{totalMateriais}</p>
            <p className="text-xs text-muted-foreground mt-1">Ordens com insumos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Package size={18} className="text-warning mb-2" />
            <p className="text-2xl font-bold">{totalItems.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total de itens consumidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie: by material type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Por Tipo de Material</CardTitle>
          </CardHeader>
          <CardContent>
            {byMaterialType.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byMaterialType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                    labelLine={false}
                  >
                    {byMaterialType.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Line: over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Produção ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {overTime.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={overTime} margin={{ left: -20, right: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Registros" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bars: by item */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Insumos Consumidos</CardTitle>
          </CardHeader>
          <CardContent>
            {byItem.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byItem} layout="vertical" margin={{ left: 10, right: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="value" name="Qtd" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bars: by student */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Volume por Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            {byStudent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byStudent} layout="vertical" margin={{ left: 10, right: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="value" name="Materiais" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Listagem Detalhada</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Insumo</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Data Registro</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum registro no período
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.production_orders?.students?.full_name ?? "—"}
                      </TableCell>
                      <TableCell>
                        {MATERIAL_LABELS[c.production_orders?.material_type ?? ""] ?? (c.production_orders?.material_type ?? "—")}
                      </TableCell>
                      <TableCell>{c.supply_items?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {c.quantity} {c.supply_items?.unit ?? ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(parseISO(c.recorded_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          c.production_orders?.status === "concluida"
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary"
                        }`}>
                          {c.production_orders?.status ?? "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
