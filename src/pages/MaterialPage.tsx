import { BookOpen } from "lucide-react";

export default function MaterialPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Material Didático</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gerencie a produção de materiais pedagógicos adaptados
        </p>
      </div>

      <div className="kpi-card flex flex-col items-center justify-center py-16 text-center">
        <BookOpen size={48} className="text-primary/30 mb-4" />
        <h3 className="text-lg font-bold text-card-foreground mb-2">Nenhum material em produção</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Os materiais serão listados aqui após a conclusão do perfil acadêmico e do currículo adaptado.
        </p>
      </div>
    </div>
  );
}
