import { z } from "zod";
import { MODULOS_PEDAGOGICOS } from "@/types/patient";

export const responsavelSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  parentesco: z.string().min(1, "Parentesco obrigatório"),
  telefone: z.string().optional(),
});

export const itemPedagogicoSchema = z.object({
  item: z.string() as z.ZodType<(typeof MODULOS_PEDAGOGICOS)[number]["key"]>,
  habilitado: z.boolean(),
  periodicidade: z.string().optional(),
});

export const configAdaptacaoSchema = z.object({
  disciplina: z.string(),
  adaptado: z.boolean(),
});

export const patientSchema = z.object({
  nome_completo: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  data_nascimento: z.string().min(1, "Data de nascimento obrigatória"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  escola: z.string().min(1, "Escola obrigatória"),
  serie: z.string().min(1, "Série obrigatória"),
  coordenador: z.string().optional(),
  tipo_atendimento: z.enum(["escolar", "individual", "individual_escolar", "particular"]),
  diagnostico: z.string().optional(),
  plano: z.enum(["particular", "convenio", "sus"]),
  terapias: z.array(z.string()).min(1, "Selecione pelo menos uma terapia"),
  responsaveis: z.array(responsavelSchema).min(1, "Adicione pelo menos um responsável"),
  itens_pedagogicos: z.array(itemPedagogicoSchema),
  config_adaptacao: z.array(configAdaptacaoSchema),
  status: z.enum(["ativo", "inativo"]).default("ativo"),
  atendente_id: z.string().optional(),
  foto_url: z.string().optional(),
  tem_prova: z.boolean().default(true),
  config_v1_v2: z.enum(["v1_only", "v1_v2"]).default("v1_v2"),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
