import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PatientForm } from "./PatientForm";
import { patientSchema, type PatientFormValues } from "./patientSchema";
import { MODULOS_PEDAGOGICOS, DISCIPLINAS } from "@/types/patient";
import { db } from "@/lib/supabase";

// TODO: substituir por fetch do Supabase usando useParams().id
function getMockPatient(id: string): Partial<PatientFormValues> {
  void id;
  return {
    nome_completo: "Lucas Mendes da Silva",
    data_nascimento: "2015-03-12",
    cidade: "Palmas - TO",
    escola: "Escola Municipal Centro",
    serie: "4º ano",
    coordenador: "Profa. Carla",
    tipo_atendimento: "individual",
    diagnostico: "TDAH - F90.0",
    plano: "particular",
    terapias: ["Fonoaudiologia", "Psicologia"],
    responsaveis: [{ nome: "Marcos Mendes", parentesco: "Pai", telefone: "(63) 99999-0001" }],
    itens_pedagogicos: MODULOS_PEDAGOGICOS.map((m) => ({
      item: m.key,
      habilitado: false,
      periodicidade: undefined,
    })),
    config_adaptacao: DISCIPLINAS.map((d) => ({
      disciplina: d,
      adaptado: false,
    })),
    status: "ativo",
    atendente_id: "",
  };
}

export default function EditarPacientePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: getMockPatient(id ?? ""),
  });

  const onSubmit = async (data: PatientFormValues) => {
    if (!id) return;
    const { atendente_id, ...studentData } = data;
    const { error } = await db
      .from("students")
      .update({
        full_name: studentData.nome_completo,
        birth_date: studentData.data_nascimento,
        city: studentData.cidade,
        school_id: studentData.escola,
        current_grade: studentData.serie,
        coordinator: studentData.coordenador,
        service_type: studentData.tipo_atendimento,
        diagnosis: studentData.diagnostico,
        plan: studentData.plano,
        therapies: studentData.terapias,
        guardians: studentData.responsaveis,
        pedagogical_items: studentData.itens_pedagogicos,
        adaptation_config: studentData.config_adaptacao,
        status: studentData.status,
      })
      .eq("id", id);

    if (error) { console.error("Erro ao atualizar paciente:", error); return; }

    if (atendente_id) {
      await db.from("student_assignments").upsert(
        { student_id: id, profile_id: atendente_id },
        { onConflict: "student_id,profile_id" }
      );
    }

    navigate(`/pacientes/${id}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(`/pacientes/${id}`)}>
            <ArrowLeft size={15} /> Voltar
          </Button>
          <h1 className="text-xl font-bold">Editar Paciente</h1>
        </div>
        <Button form="patient-form" type="submit" className="gap-2">
          <Save size={15} /> Salvar
        </Button>
      </div>

      <Form {...form}>
        <FormProvider {...form}>
          <form id="patient-form" onSubmit={form.handleSubmit(onSubmit)}>
            <PatientForm />
          </form>
        </FormProvider>
      </Form>
    </div>
  );
}
