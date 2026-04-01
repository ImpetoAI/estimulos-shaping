import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db } from "@/lib/supabase";
import type { CicloTabProps } from "./_shared";
import { toast } from "sonner";

const schema = z.object({
  link: z.string().url("Informe uma URL válida").or(z.literal("")).optional().default(""),
  version: z.string().optional().default(""),
  responsible: z.string().optional().default(""),
  finalized_at: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

export default function ApostilaTab({ caseId, bimester }: CicloTabProps) {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { link: "", version: "", responsible: "", finalized_at: "", notes: "" },
  });

  const currentLink = form.watch("link");

  const loadRecord = useCallback(async () => {
    setLoading(true);
    const { data } = await db
      .from("adapted_booklets")
      .select("*")
      .eq("case_id", caseId)
      .eq("bimester", bimester)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setRecordId(data.id);
      form.reset({
        link: data.link ?? "",
        version: data.version ?? "",
        responsible: data.responsible ?? "",
        finalized_at: data.finalized_at ? data.finalized_at.split("T")[0] : "",
        notes: data.notes ?? "",
      });
    } else {
      setRecordId(null);
      form.reset({ link: "", version: "", responsible: "", finalized_at: "", notes: "" });
    }
    setLoading(false);
  }, [caseId, bimester, form]);

  useEffect(() => { loadRecord(); }, [loadRecord]);

  const onSubmit = async (values: FormData) => {
    setSaving(true);
    try {
      const payload = {
        case_id: caseId,
        bimester,
        link: values.link || null,
        version: values.version || null,
        responsible: values.responsible || null,
        finalized_at: values.finalized_at || null,
        notes: values.notes || null,
      };

      if (recordId) {
        const { error } = await db.from("adapted_booklets").update(payload).eq("id", recordId);
        if (error) throw error;
      } else {
        const { error } = await db.from("adapted_booklets").insert(payload);
        if (error) throw error;
      }
      toast.success("Apostila salva!");
      loadRecord();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          {/* Link */}
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link (Canva / Drive)</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="url" placeholder="https://www.canva.com/..." {...field} />
                  </FormControl>
                  {currentLink && (
                    <a
                      href={currentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                        <ExternalLink size={14} />
                      </Button>
                    </a>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Versão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: v1.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="finalized_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Finalização</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="responsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do responsável pela apostila" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Observações sobre a apostila..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
              {saving ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
