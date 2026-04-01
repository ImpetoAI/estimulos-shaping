import { useState, useEffect, useCallback } from "react";
import { FileText, Image, BookOpen, Award, Package, Palmtree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/supabase";
import type { CicloTabProps } from "./_shared";

interface MaterialStatement {
  id: string;
  material_type: string;
  description?: string;
  photo_url?: string;
  production_order_id?: string;
  bimester?: number;
  responsible?: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  apostila: BookOpen,
  prova: Award,
  atividade: FileText,
  material: Package,
};

const TYPE_LABELS: Record<string, string> = {
  apostila: "Apostila",
  prova: "Prova",
  atividade: "Atividade",
  material: "Material",
};

const TYPE_COLORS: Record<string, string> = {
  apostila: "bg-purple-100 text-purple-700",
  prova: "bg-orange-100 text-orange-700",
  atividade: "bg-blue-100 text-blue-700",
  material: "bg-muted text-muted-foreground",
};

export default function ExtratoTab({ caseId, bimester }: CicloTabProps) {
  const [items, setItems] = useState<MaterialStatement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const query = db
      .from("material_statements")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    // Filter by bimester if the table has bimester field
    const { data } = await query.eq("bimester", bimester);
    setItems((data as MaterialStatement[]) ?? []);
    setLoading(false);
  }, [caseId, bimester]);

  useEffect(() => { loadItems(); }, [loadItems]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{items.length} material(is)</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={32} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nenhum material neste bimestre</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Os materiais produzidos aparecem aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.material_type] ?? FileText;
            const typeLabel = TYPE_LABELS[item.material_type] ?? item.material_type;
            const colorClass = TYPE_COLORS[item.material_type] ?? "bg-muted text-muted-foreground";

            return (
              <div key={item.id} className="rounded-xl border border-border overflow-hidden">
                {/* Photo or placeholder */}
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={typeLabel}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-28 bg-muted/40 flex items-center justify-center">
                    <Icon size={28} className="text-muted-foreground/40" />
                  </div>
                )}

                <div className="p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
                      {typeLabel}
                    </span>
                    {item.production_order_id && (
                      <Badge variant="outline" className="text-[10px]">
                        Ordem vinculada
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                    <span>{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                    {item.responsible && <span>{item.responsible}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Materiais Extra-Bimestre (Apostila de Ferias) */}
      <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/10 p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <Palmtree size={16} className="text-amber-500" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Materiais Extra-Bimestre</h3>
            <p className="text-[11px] text-muted-foreground">
              Apostila de ferias e materiais avulsos (junho/dezembro)
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhum material extra-bimestre registrado
          </p>
        </div>
      </div>
    </div>
  );
}
