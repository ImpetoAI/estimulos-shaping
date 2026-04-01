export type UserRole =
  | "admin"
  | "coordenador"
  | "professor"
  | "atendente_terapeutica";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  full_name: string;
  photo_url?: string;
  grade: string;
  school: string;
  diagnosis: string;
  current_bimester: number;
}

export interface EvaluationRegistry {
  id: string;
  student_id: string;
  evaluator_id: string;
  knowledge_area: KnowledgeArea;
  evaluation_date: string;
  duration_minutes: number;
  contents: string;
  showed_resistance: boolean;
  showed_discomfort: boolean;
  discomfort_description?: string;
  used_support_resources: boolean;
  support_resources_description?: string;
  understood_commands: boolean;
  commands_observation?: string;
  conducted_by: "atendente_terapeutica" | "professor";
  used_reinforcers: boolean;
  reinforcers_description?: string;
  completed_evaluation: boolean;
  exam_file_url?: string;
  free_description?: string;
  created_at: string;
}

export type KnowledgeArea =
  | "ciencias"
  | "historia"
  | "geografia"
  | "matematica"
  | "portugues"
  | "ingles"
  | "arte"
  | "educacao_fisica"
  | "ensino_religioso";

export const KNOWLEDGE_AREA_LABELS: Record<KnowledgeArea, string> = {
  ciencias: "Ciências",
  historia: "História",
  geografia: "Geografia",
  matematica: "Matemática",
  portugues: "Português",
  ingles: "Inglês",
  arte: "Arte",
  educacao_fisica: "Ed. Física",
  ensino_religioso: "Ensino Religioso",
};
