import { useState, useRef, useEffect } from "react";
import { Search, User, BookOpen, FileText, ClipboardCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockResults = [
  { type: "paciente", icon: User, label: "Lucas Mendes da Silva", path: "/cadastro-paciente", sub: "9 anos · Palmas - TO" },
  { type: "paciente", icon: User, label: "Ana Clara Souza", path: "/cadastro-paciente", sub: "7 anos · Palmas - TO" },
  { type: "paciente", icon: User, label: "Pedro Henrique Lima", path: "/cadastro-paciente", sub: "10 anos · Palmas - TO" },
  { type: "atividade", icon: BookOpen, label: "Alfabeto Ilustrado - Nível 1", path: "/banco-atividades", sub: "Português · Adaptação leve" },
  { type: "atividade", icon: BookOpen, label: "Sequência Numérica com Figuras", path: "/banco-atividades", sub: "Matemática · Adaptação moderada" },
  { type: "material", icon: FileText, label: "Apostila Individualizada - Lucas", path: "/extrato-materiais", sub: "Material didático · Mar/2026" },
  { type: "avaliacao", icon: ClipboardCheck, label: "Avaliação Adaptada - Português Q1", path: "/avaliacao-adaptada", sub: "Lucas Mendes · 05/03/2026" },
];

const typeLabels: Record<string, string> = {
  paciente: "Pacientes",
  atividade: "Atividades",
  material: "Materiais",
  avaliacao: "Avaliações",
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = query.length > 0
    ? mockResults.filter(r => r.label.toLowerCase().includes(query.toLowerCase()) || r.sub.toLowerCase().includes(query.toLowerCase()))
    : [];

  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, typeof mockResults>);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/60 border border-border/50 text-muted-foreground text-sm hover:bg-accent transition-colors w-64"
      >
        <Search size={15} />
        <span>Buscar pacientes, materiais...</span>
        <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center pt-[15vh]">
      <div ref={containerRef} className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar pacientes, atividades, materiais, avaliações..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={() => { setOpen(false); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {query.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum resultado para "{query}"</p>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    {typeLabels[type] || type}
                  </p>
                  {items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/60 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {query.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Digite para buscar em toda a plataforma</p>
          </div>
        )}
      </div>
    </div>
  );
}
