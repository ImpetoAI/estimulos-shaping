import { useState, useEffect } from "react";
import { BookOpen, ExternalLink, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/supabase";
import type { CicloTabProps } from "./_shared";

const ORIGIN_LABELS: Record<string, string> = {
  bncc: "BNCC",
  dct: "DCT",
  livro_didatico: "Livro Didatico",
  outro: "Outro",
};

const STAGE_LABELS: Record<string, string> = {
  infantil: "Ed. Infantil",
  fundamental_1: "Fundamental I",
  fundamental_2: "Fundamental II",
};

interface LinkedCurriculum {
  id: string;
  origin: string;
  origin_name: string | null;
  escola: string | null;
  stage: string;
  discipline: string | null;
  grade: string;
  content: string;
  cover_image_url: string | null;
}

interface StudentBasic {
  school_name: string | null;
  current_grade: string;
}

export default function CurriculoOriginalTab({ caseId, bimester, studentId }: CicloTabProps) {
  const [curricula, setCurricula] = useState<LinkedCurriculum[]>([]);
  const [student, setStudent] = useState<StudentBasic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Load student school
      const { data: s } = await db.from("students").select("school_name, current_grade").eq("id", studentId).single();
      if (s) setStudent(s as StudentBasic);

      // Load linked curricula for this case (via escola match or direct link)
      const { data: linked } = await db
        .from("case_curriculum_originals")
        .select("curriculum_bank_id")
        .eq("case_id", caseId)
        .eq("bimester", bimester);

      if (linked && linked.length > 0) {
        const ids = linked.map((l: any) => l.curriculum_bank_id);
        const { data: banks } = await db
          .from("curriculum_banks")
          .select("id, origin, origin_name, escola, stage, discipline, grade, content, cover_image_url")
          .in("id", ids);
        setCurricula((banks as LinkedCurriculum[]) ?? []);
      } else if (s) {
        // Auto-match: find curricula from same school + grade
        const { data: autoMatch } = await db
          .from("curriculum_banks")
          .select("id, origin, origin_name, escola, stage, discipline, grade, content, cover_image_url")
          .ilike("escola", `%${(s as StudentBasic).school_name ?? ""}%`)
          .ilike("grade", `%${(s as StudentBasic).current_grade ?? ""}%`)
          .limit(10);
        setCurricula((autoMatch as LinkedCurriculum[]) ?? []);
      }

      setLoading(false);
    })();
  }, [caseId, bimester, studentId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} className="text-primary" />
          <h2 className="text-lg font-bold">Curriculo Original</h2>
          <Badge variant="outline" className="text-[10px]">Somente visualizacao</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Curriculos vinculados a partir do Banco de Curriculos.
          {student?.school_name && (
            <> Escola: <strong className="text-foreground">{student.school_name}</strong> · {student.current_grade}</>
          )}
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
        <FileText size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-card-foreground">Insumo para o Curriculo Adaptado</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Este conteudo sera cruzado com o perfil academico e as habilidades BNCC para gerar o curriculo adaptado com IA.
            O cadastro e vinculo sao feitos no <strong>Banco de Curriculos</strong> (Base Pedagogica).
          </p>
        </div>
      </div>

      {/* Linked curricula */}
      {curricula.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-10 text-center space-y-3">
          <AlertTriangle size={28} className="mx-auto text-warning" />
          <p className="font-semibold text-sm">Nenhum curriculo vinculado</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Nenhum curriculo original foi vinculado a este aluno para o {bimester}o bimestre.
            Acesse o Banco de Curriculos na Base Pedagogica para cadastrar e vincular.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {curricula.map((curr) => (
            <div key={curr.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {curr.discipline ?? "Geral"} — {curr.grade}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                        {ORIGIN_LABELS[curr.origin] ?? curr.origin}
                      </Badge>
                      {curr.origin_name && (
                        <span className="text-[10px] text-muted-foreground">{curr.origin_name}</span>
                      )}
                      {curr.escola && (
                        <Badge variant="outline" className="text-[10px]">{curr.escola}</Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {STAGE_LABELS[curr.stage] ?? curr.stage}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                  {curr.content.length > 500 ? curr.content.slice(0, 500) + "..." : curr.content}
                </p>
                {curr.content.length > 500 && (
                  <button className="text-xs text-primary mt-2 hover:underline">Ver conteudo completo</button>
                )}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground text-center mt-2">
            {curricula.length} curriculo(s) vinculado(s) para o {bimester}o bimestre
          </p>
        </div>
      )}
    </div>
  );
}
