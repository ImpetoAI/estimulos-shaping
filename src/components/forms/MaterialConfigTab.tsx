import { User, FileText } from "lucide-react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-card-foreground mb-1.5">{children}</label>;
}

const materialTypes = ["Apostila", "Rotina", "Cartão", "Quadro de recompensa", "Plastificado", "PDF", "Outro"];
const requesterTypes = ["Individual", "Escolar", "Terapeutas"];

export default function MaterialConfigTab() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 max-w-3xl space-y-8">
      <h2 className="text-lg font-bold">Configuração do Material Didático</h2>

      {/* Block 1 - Identification */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
          <User size={16} /> Identificação da Solicitação
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Paciente</FieldLabel>
            <input type="text" placeholder="Nome completo" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
          <div>
            <FieldLabel>Solicitante</FieldLabel>
            <input type="text" placeholder="Nome do solicitante" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
        </div>
        <div>
          <FieldLabel>Tipo de solicitante</FieldLabel>
          <div className="flex gap-2 flex-wrap">
            {requesterTypes.map((t) => (
              <label key={t} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer text-sm">
                <input type="radio" name="requesterType" className="accent-primary" />
                <span className="text-card-foreground">{t}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Block 2 - Format */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
          <FileText size={16} /> Formato do Material
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {materialTypes.map((type) => (
            <label key={type} className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer text-sm transition-colors">
              <input type="radio" name="materialType" className="accent-primary" />
              <span className="text-card-foreground font-medium">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Block 3 - Description */}
      <div className="space-y-2">
        <FieldLabel>Descrição geral da demanda</FieldLabel>
        <textarea
          rows={4}
          placeholder="Ex: Trabalhar leitura funcional, estimular reconhecimento de números..."
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
        />
      </div>

      {/* Block 4 - Justification */}
      <div className="space-y-2">
        <FieldLabel>Justificativa pedagógica</FieldLabel>
        <p className="text-xs text-muted-foreground mb-1">Escreva um texto curto justificando esta produção para comunicação com a família.</p>
        <textarea
          rows={4}
          placeholder="Finalidade pedagógica..."
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-colors">
          Enviar Solicitação
        </button>
      </div>
    </div>
  );
}
