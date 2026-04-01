import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  TERAPIAS,
  SERIES,
  DISCIPLINAS,
  MODULOS_PEDAGOGICOS,
  PERIODICIDADES,
} from "@/types/patient";
import type { PatientFormValues } from "./patientSchema";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="col-span-full pb-1">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function PatientForm() {
  const form = useFormContext<PatientFormValues>();
  const { fields: responsaveisFields, append: appendResponsavel, remove: removeResponsavel } =
    useFieldArray({ control: form.control, name: "responsaveis" });

  const [atendentes, setAtendentes] = useState<{ id: string; full_name: string }[]>([]);
  const [coordenadores, setCoordenadores] = useState<{ id: string; full_name: string }[]>([]);
  useEffect(() => {
    db.from("profiles").select("id, full_name").eq("role", "atendente_terapeutica").eq("active", true).order("full_name")
      .then(({ data }) => { if (data) setAtendentes(data as { id: string; full_name: string }[]); });
    db.from("profiles").select("id, full_name").in("role", ["coordenador", "admin"]).eq("active", true).order("full_name")
      .then(({ data }) => { if (data) setCoordenadores(data as { id: string; full_name: string }[]); });
  }, []);

  return (
    <div className="bg-card border rounded-lg p-6">
      {/* ── ROW 1: Pessoais + Escolares lado a lado ── */}
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
        {/* Coluna esquerda: Dados Pessoais */}
        <div className="space-y-4">
          <SectionHeader title="Dados Pessoais" />

          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="data_nascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nascimento *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade / UF</FormLabel>
                  <FormControl>
                    <Input placeholder="Palmas - TO" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="diagnostico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnostico</FormLabel>
                <FormControl>
                  <Input placeholder="CID ou descricao" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Coluna direita: Dados Escolares + Clinicos */}
        <div className="space-y-4">
          <SectionHeader title="Dados Escolares e Clinicos" />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="escola"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escola</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da escola" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serie *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="tipo_atendimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Atendimento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="escolar">Escolar</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="individual_escolar">Individual + Escolar</SelectItem>
                      <SelectItem value="particular">Particular</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="particular">Particular</SelectItem>
                      <SelectItem value="convenio">Convenio</SelectItem>
                      <SelectItem value="sus">SUS</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="coordenador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coordenador Responsavel</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar coordenador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {coordenadores.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="atendente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atendente Terapeutica</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar atendente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {atendentes.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="foto_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto do Paciente</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value && (
                      <img src={field.value} alt="Foto" className="w-16 h-16 rounded-lg object-cover border" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const path = `fotos/${Date.now()}-${file.name}`;
                        const { error } = await (await import("@/lib/supabase")).supabase.storage.from("photos").upload(path, file);
                        if (!error) {
                          const { data } = (await import("@/lib/supabase")).supabase.storage.from("photos").getPublicUrl(path);
                          field.onChange(data.publicUrl);
                        }
                      }}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tem_prova"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Aluno tem prova?</FormLabel>
                  <FormDescription className="text-xs">Ed. Infantil geralmente nao tem prova</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("tem_prova") && (
            <FormField
              control={form.control}
              name="config_v1_v2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuracao de Provas</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="v1_only">V1 apenas (mensal)</SelectItem>
                      <SelectItem value="v1_v2">V1 + V2 (mensal + bimestral)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* ── ROW 2: Responsaveis + Terapias lado a lado ── */}
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
        {/* Coluna esquerda: Responsaveis */}
        <div className="space-y-3">
          <SectionHeader title="Responsaveis" />
          {responsaveisFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-end">
              <FormField
                control={form.control}
                name={`responsaveis.${index}.nome`}
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    {index === 0 && <FormLabel className="text-xs">Nome</FormLabel>}
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`responsaveis.${index}.parentesco`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    {index === 0 && <FormLabel className="text-xs">Parentesco</FormLabel>}
                    <FormControl>
                      <Input placeholder="Mae, Pai..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`responsaveis.${index}.telefone`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    {index === 0 && <FormLabel className="text-xs">Telefone</FormLabel>}
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {index > 0 && (
                <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeResponsavel(index)}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => appendResponsavel({ nome: "", parentesco: "", telefone: "" })}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>

        {/* Coluna direita: Terapias */}
        <div className="space-y-3">
          <SectionHeader title="Terapias Liberadas" />
          <FormField
            control={form.control}
            name="terapias"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {TERAPIAS.map((terapia) => (
                    <FormField
                      key={terapia}
                      control={form.control}
                      name="terapias"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0 py-0.5">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(terapia)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                field.onChange(checked ? [...current, terapia] : current.filter((v) => v !== terapia));
                              }}
                            />
                          </FormControl>
                          <Label className="font-normal cursor-pointer text-sm leading-none">{terapia}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* ── ROW 3: Servicos Pedagogicos + Adaptacao por disciplina ── */}
      <div className="grid lg:grid-cols-2 gap-x-10 gap-y-6">
        {/* Coluna esquerda: Servicos */}
        <div className="space-y-2">
          <SectionHeader title="Servicos Pedagogicos" subtitle="Define quais modulos aparecem na pasta do paciente" />
          {MODULOS_PEDAGOGICOS.map((modulo, index) => {
            const habilitado = form.watch(`itens_pedagogicos.${index}.habilitado`);
            return (
              <div key={modulo.key} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${habilitado ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                <FormField
                  control={form.control}
                  name={`itens_pedagogicos.${index}.habilitado`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0 flex-1 min-w-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <Label className="font-normal cursor-pointer text-sm leading-none">{modulo.label}</Label>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`itens_pedagogicos.${index}.periodicidade`}
                  render={({ field }) => (
                    <FormItem className="w-32 shrink-0">
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!habilitado}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Periodo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PERIODICIDADES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Coluna direita: info */}
        <div className="space-y-4">
          <SectionHeader title="Sobre os Serviços" subtitle="Configuração do que será produzido para este aluno" />
          <div className="rounded-lg bg-muted/50 border border-border/50 p-4 text-xs text-muted-foreground space-y-2">
            <p><strong>Currículo Adaptado:</strong> A pedagoga gera o currículo individualizado com apoio da IA, baseado no perfil acadêmico e currículo original da escola.</p>
            <p><strong>Adaptação de Provas:</strong> Provas adequadas ao nível do aluno (V1 mensal e/ou V2 bimestral).</p>
            <p><strong>Registro Avaliativo:</strong> O AT registra como o aluno se saiu nas avaliações aplicadas.</p>
            <p><strong>Materiais Avulsos:</strong> Rotinas visuais, histórias sociais, calendários e outros materiais sob demanda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
