import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PatientForm } from "./PatientForm";
import { patientSchema, type PatientFormValues } from "./patientSchema";
import { MODULOS_PEDAGOGICOS, DISCIPLINAS } from "@/types/patient";
import { db } from "@/lib/supabase";

function buildDefaultValues(): Partial<PatientFormValues> {
  return {
    nome_completo: "",
    data_nascimento: "",
    cidade: "",
    escola: "",
    serie: "",
    coordenador: "",
    tipo_atendimento: "individual",
    diagnostico: "",
    plano: "particular",
    terapias: [],
    responsaveis: [{ nome: "", parentesco: "", telefone: "" }],
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

export default function CriarPacientePage() {
  const navigate = useNavigate();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: buildDefaultValues(),
  });

  const onSubmit = async (data: PatientFormValues) => {
    const { atendente_id, ...studentData } = data;
    const { data: created, error } = await db
      .from("students")
      .insert({
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
      .select("id")
      .single();

    if (error) { console.error("Erro ao criar paciente:", error); return; }

    if (created && atendente_id) {
      await db.from("student_assignments").upsert(
        { student_id: created.id, profile_id: atendente_id },
        { onConflict: "student_id,profile_id" }
      );
    }

    navigate("/pacientes");
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate("/pacientes")}>
            <ArrowLeft size={15} /> Voltar
          </Button>
          <h1 className="text-xl font-bold">Novo Paciente</h1>
        </div>
        <Button form="patient-form" type="submit" className="gap-2">
          <Save size={15} /> Cadastrar
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
