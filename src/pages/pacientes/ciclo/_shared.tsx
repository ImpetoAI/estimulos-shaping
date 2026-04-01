export interface CicloTabProps {
  caseId: string;
  bimester: number;
  studentId: string;
}

export const BIMESTER_LABELS: Record<number, string> = {
  1: "1º Bimestre",
  2: "2º Bimestre",
  3: "3º Bimestre",
  4: "4º Bimestre",
};
