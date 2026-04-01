import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Plus, Search, Phone, School, MapPin, Calendar, Camera,
  Heart, ChevronRight, Shield, Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const mockPatients = [
  { id: 1, name: "Lucas Mendes da Silva", age: 9, school: "Escola Municipal Centro", grade: "4º ano", status: "ativo", cases: 2, photo: null },
  { id: 2, name: "Ana Clara Souza", age: 7, school: "Colégio Estadual Norte", grade: "2º ano", status: "ativo", cases: 1, photo: null },
  { id: 3, name: "Pedro Henrique Lima", age: 10, school: "Escola Particular Sol", grade: "5º ano", status: "ativo", cases: 3, photo: null },
  { id: 4, name: "Maria Luísa Ferreira", age: 6, school: "Escola Municipal Lago", grade: "1º ano", status: "inativo", cases: 1, photo: null },
  { id: 5, name: "João Vitor Costa", age: 8, school: "Colégio Estadual Sul", grade: "3º ano", status: "ativo", cases: 1, photo: null },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function PatientRegistrationPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cadastro de Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Perfil permanente dos alunos atendidos
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Novo Paciente
        </Button>
      </div>

      {/* Registration Form (collapsible) */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <Card className="border-primary/30 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <h2 className="text-base font-bold">Novo Cadastro de Paciente</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Photo upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-2xl bg-accent/60 border-2 border-dashed border-border flex items-center justify-center">
                    <Camera size={28} className="text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Camera size={13} /> Adicionar Foto
                  </Button>
                </div>

                {/* Fields */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Nome Completo", placeholder: "Nome do paciente", icon: User },
                    { label: "Data de Nascimento", placeholder: "dd/mm/aaaa", icon: Calendar },
                    { label: "Escola", placeholder: "Nome da escola", icon: School },
                    { label: "Série", placeholder: "Ex: 4º ano", icon: School },
                    { label: "Responsáveis", placeholder: "Nomes dos responsáveis", icon: Users },
                    { label: "Contato", placeholder: "(00) 00000-0000", icon: Phone },
                    { label: "Cidade/UF", placeholder: "Ex: Palmas - TO", icon: MapPin },
                    { label: "Atendente Terapêutica", placeholder: "Nome da atendente", icon: Heart },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{field.label}</label>
                      <div className="relative">
                        <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder={field.placeholder} className="pl-9" />
                      </div>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Coordenador Responsável</label>
                    <div className="relative">
                      <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Nome do coordenador" className="pl-9" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button className="gap-1.5" onClick={() => setShowForm(false)}>
                  <Plus size={14} /> Cadastrar Paciente
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patient List */}
      <div className="grid gap-3">
        {filtered.map((p, i) => (
          <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" animate="visible">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-card-foreground">{p.name}</h3>
                    <Badge variant={p.status === "ativo" ? "default" : "secondary"} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.age} anos · {p.school} · {p.grade}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-card-foreground">{p.cases}</p>
                    <p className="text-[10px] text-muted-foreground">Casos</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
