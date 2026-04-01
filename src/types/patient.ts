export type PatientStatus = "ativo" | "inativo";
export type TipoAtendimento = "escolar" | "individual" | "individual_escolar" | "particular";
export type Plano = "particular" | "convenio" | "sus";

export const TERAPIAS = [
  "ABA Individual",
  "ABA Escolar",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Psicologia",
  "Psicopedagogia",
  "Fisioterapia",
  "Neuropsicologia",
  "Musicoterapia",
  "Equoterapia",
] as const;

export const SERIES = [
  "Maternal I",
  "Maternal II",
  "Pré I",
  "Pré II",
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
  "1º EM",
  "2º EM",
  "3º EM",
] as const;

export const DISCIPLINAS = [
  "Português",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
  "Artes",
  "Educação Física",
  "Inglês",
] as const;

export const MODULOS_PEDAGOGICOS = [
  { key: "curriculo_adaptado", label: "Currículo Adaptado" },
  { key: "provas", label: "Adaptação de Provas" },
  { key: "registro_avaliativo", label: "Registro Avaliativo" },
  { key: "materiais_avulsos", label: "Materiais Avulsos" },
] as const;

export type ModuloKey = (typeof MODULOS_PEDAGOGICOS)[number]["key"];

export const PERIODICIDADES = [
  "Semanal",
  "Quinzenal",
  "Mensal",
  "Bimestral",
  "Semestral",
  "Anual",
] as const;

export interface Responsavel {
  nome: string;
  parentesco: string;
  telefone?: string;
}

export interface ItemPedagogico {
  item: ModuloKey;
  habilitado: boolean;
  periodicidade?: string;
}

export interface ConfigAdaptacao {
  disciplina: string;
  adaptado: boolean;
}

export interface Patient {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  cidade: string;
  foto_url?: string;
  escola: string;
  serie: string;
  coordenador?: string;
  tipo_atendimento: TipoAtendimento;
  diagnostico?: string;
  plano: Plano;
  terapias: string[];
  responsaveis: Responsavel[];
  itens_pedagogicos: ItemPedagogico[];
  config_adaptacao: ConfigAdaptacao[];
  status: PatientStatus;
  perfil_concluido: boolean;
  created_at?: string;
}
