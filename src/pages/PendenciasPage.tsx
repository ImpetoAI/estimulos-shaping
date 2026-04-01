import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, MessageSquare, X } from "lucide-react";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Pendency = {
  id: string;
  case_id: string;
  module: string;
  discipline: string | null;
  bimester: number | null;
  description: string | null;
  due_date: string | null;
  responsible_id: string | null;
  status: string;
  justification: string | null;
  justified_by: string | null;
  resolved_at: string | null;
  created_at: string;
  // joined
  student_name?: string;
  student_photo?: string | null;
  responsible_name?: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  perfil: "Perfil",
  curriculo_original: "Currículo Original",
  curriculo_adaptado: "Currículo Adaptado",
  planejamento: "Planejamento",
  apostila: "Apostila",
  provas: "Provas",
  registro: "Registro",
  extrato: "Extrato",
};

const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  resolved: {
    label: "Resolvido",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  justified: {
    label: "Justificado",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

// ─── Justify form schema ───────────────────────────────────────────────────────

const justifySchema = z.object({
  justification: z
    .string()
    .min(10, "Justificativa deve ter ao menos 10 caracteres"),
});

type JustifyValues = z.infer<typeof justifySchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PendenciasPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<Pendency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [filterBimester, setFilterBimester] = useState("all");
  const [justifyTarget, setJustifyTarget] = useState<Pendency | null>(null);
  const [justifying, setJustifying] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  const form = useForm<JustifyValues>({
    resolver: zodResolver(justifySchema),
    defaultValues: { justification: "" },
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);

    const { data: rawPendencies, error } = await db
      .from("pendencies")
      .select(
        `
        *,
        cases!inner(
          student_id,
          students!inner(full_name, photo_url)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error || !rawPendencies) {
      setLoading(false);
      return;
    }

    // Collect unique responsible_ids to batch-fetch profiles
    const responsibleIds = [
      ...new Set(
        (rawPendencies as Record<string, unknown>[])
          .map((p) => p.responsible_id as string | null)
          .filter(Boolean) as string[]
      ),
    ];

    let profileMap: Record<string, string> = {};
    if (responsibleIds.length > 0) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id, full_name")
        .in("id", responsibleIds);
      if (profiles) {
        profileMap = Object.fromEntries(
          (profiles as { id: string; full_name: string }[]).map((p) => [
            p.id,
            p.full_name,
          ])
        );
      }
    }

    const mapped: Pendency[] = (
      rawPendencies as Record<string, unknown>[]
    ).map((p) => {
      const cases = p.cases as {
        students: { full_name: string; photo_url: string | null };
      };
      return {
        id: p.id as string,
        case_id: p.case_id as string,
        module: p.module as string,
        discipline: p.discipline as string | null,
        bimester: p.bimester as number | null,
        description: p.description as string | null,
        due_date: p.due_date as string | null,
        responsible_id: p.responsible_id as string | null,
        status: p.status as string,
        justification: p.justification as string | null,
        justified_by: p.justified_by as string | null,
        resolved_at: p.resolved_at as string | null,
        created_at: p.created_at as string,
        student_name: cases?.students?.full_name,
        student_photo: cases?.students?.photo_url,
        responsible_name: p.responsible_id
          ? (profileMap[p.responsible_id as string] ?? null)
          : null,
      };
    });

    setItems(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleResolve = async (item: Pendency) => {
    setResolving(item.id);
    const { error } = await db
      .from("pendencies")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Erro ao resolver",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Pendência resolvida" });
      setItems((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                status: "resolved",
                resolved_at: new Date().toISOString(),
              }
            : p
        )
      );
    }
    setResolving(null);
  };

  const openJustify = (item: Pendency) => {
    setJustifyTarget(item);
    form.reset({ justification: "" });
  };

  const onJustify = async (values: JustifyValues) => {
    if (!justifyTarget) return;
    setJustifying(true);
    const { error } = await db
      .from("pendencies")
      .update({
        status: "justified",
        justification: values.justification,
        justified_by: user?.id ?? null,
      })
      .eq("id", justifyTarget.id);

    if (error) {
      toast({
        title: "Erro ao justificar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Pendência justificada" });
      setItems((prev) =>
        prev.map((p) =>
          p.id === justifyTarget.id
            ? {
                ...p,
                status: "justified",
                justification: values.justification,
                justified_by: user?.id ?? null,
              }
            : p
        )
      );
      setJustifyTarget(null);
    }
    setJustifying(false);
  };

  const filtered = items.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterModule !== "all" && item.module !== filterModule) return false;
    if (filterBimester !== "all" && String(item.bimester) !== filterBimester)
      return false;
    if (search) {
      const q = search.toLowerCase();
      return (item.student_name ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const hasFilters =
    filterStatus !== "all" ||
    filterModule !== "all" ||
    filterBimester !== "all" ||
    search !== "";

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pendências</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registro{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-500 text-white">
            {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="justified">Justificado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos módulos</SelectItem>
            {MODULE_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterBimester} onValueChange={setFilterBimester}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Bimestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos bimestres</SelectItem>
            {[1, 2, 3, 4].map((b) => (
              <SelectItem key={b} value={String(b)}>
                {b}º Bimestre
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterStatus("all");
              setFilterModule("all");
              setFilterBimester("all");
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
              <TableHead>Paciente</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead>Bimestre</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10 text-muted-foreground"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10 text-muted-foreground"
                >
                  Nenhuma pendência encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const statusConfig =
                  STATUS_BADGE[item.status] ?? STATUS_BADGE.pending;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {item.student_photo && (
                            <AvatarImage src={item.student_photo} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {(item.student_name ?? "?")
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {item.student_name ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {MODULE_LABELS[item.module] ?? item.module}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.discipline ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.bimester ? `${item.bimester}º` : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm line-clamp-2">
                        {item.description ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {item.due_date
                        ? new Date(item.due_date).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.responsible_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs px-2 ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            disabled={resolving === item.id}
                            onClick={() => handleResolve(item)}
                            title="Resolver"
                          >
                            <CheckCircle2
                              size={13}
                              className="mr-1 text-green-600"
                            />
                            Resolver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => openJustify(item)}
                            title="Justificar"
                          >
                            <MessageSquare
                              size={13}
                              className="mr-1 text-blue-600"
                            />
                            Justificar
                          </Button>
                        </div>
                      )}
                      {item.status !== "pending" &&
                        item.justification && (
                          <span
                            className="text-xs text-muted-foreground line-clamp-2"
                            title={item.justification}
                          >
                            {item.justification}
                          </span>
                        )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Justify Dialog */}
      <Dialog
        open={!!justifyTarget}
        onOpenChange={(open) => !open && setJustifyTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Justificar Pendência</DialogTitle>
          </DialogHeader>
          {justifyTarget && (
            <p className="text-sm text-muted-foreground">
              <strong>{justifyTarget.student_name}</strong> —{" "}
              {MODULE_LABELS[justifyTarget.module] ?? justifyTarget.module}
              {justifyTarget.discipline
                ? ` · ${justifyTarget.discipline}`
                : ""}
            </p>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onJustify)}
              className="space-y-4 pt-2"
            >
              <FormField
                control={form.control}
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificativa</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Descreva o motivo..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setJustifyTarget(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={justifying}>
                  {justifying ? "Salvando..." : "Justificar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
