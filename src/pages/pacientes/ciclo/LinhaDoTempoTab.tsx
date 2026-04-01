import { useState, useEffect, useCallback } from "react";
import {
  User, BookOpen, ClipboardList, FileText, Award, Activity, Star,
  Calendar, Clock
} from "lucide-react";
import { db } from "@/lib/supabase";
import { type CicloTabProps } from "./_shared";

interface TimelineEvent {
  id: string;
  event_type: string;
  module: string;
  description: string;
  created_at: string;
  bimester?: number;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  profile_completed: User,
  curriculum_linked: BookOpen,
  curriculum_adapted: FileText,
  plan_created: ClipboardList,
  booklet_saved: FileText,
  exam_saved: Award,
  evaluation_registered: Activity,
  card_saved: Star,
};

const EVENT_COLORS: Record<string, string> = {
  profile_completed: "bg-primary/10 text-primary border-primary/20",
  curriculum_linked: "bg-info/10 text-info border-info/20",
  curriculum_adapted: "bg-blue-100 text-blue-700 border-blue-200",
  plan_created: "bg-warning/10 text-warning border-warning/20",
  booklet_saved: "bg-purple-100 text-purple-700 border-purple-200",
  exam_saved: "bg-orange-100 text-orange-700 border-orange-200",
  evaluation_registered: "bg-success/10 text-success border-success/20",
  card_saved: "bg-pink-100 text-pink-700 border-pink-200",
};

const EVENT_LABELS: Record<string, string> = {
  profile_completed: "Perfil Concluído",
  curriculum_linked: "Currículo Original Vinculado",
  curriculum_adapted: "Currículo Adaptado Salvo",
  plan_created: "Planejamento Criado",
  booklet_saved: "Apostila Registrada",
  exam_saved: "Prova Registrada",
  evaluation_registered: "Registro Avaliativo",
  card_saved: "Card da Criança Atualizado",
};

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function LinhaDoTempoTab({ caseId }: CicloTabProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data } = await db
      .from("timeline_events")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    setEvents((data as TimelineEvent[]) ?? []);
    setLoading(false);
  }, [caseId]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
        <Clock size={32} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum evento registrado</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Os eventos serão gerados automaticamente conforme o ciclo for preenchido.
        </p>
      </div>
    );
  }

  // Group by date
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const date = event.created_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={13} />
        <span>Linha do tempo — somente leitura</span>
      </div>

      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border" />

        {Object.entries(grouped).map(([date, dayEvents]) => (
          <div key={date} className="mb-6">
            {/* Date header */}
            <div className="flex items-center gap-2 mb-3 -ml-6">
              <div className="w-5 h-5 rounded-full bg-border flex items-center justify-center flex-shrink-0">
                <Calendar size={10} className="text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {formatRelativeDate(dayEvents[0].created_at)}
              </span>
            </div>

            {/* Events for this day */}
            <div className="space-y-3">
              {dayEvents.map((event) => {
                const Icon = EVENT_ICONS[event.event_type] ?? Activity;
                const colorClass = EVENT_COLORS[event.event_type] ?? "bg-muted text-muted-foreground border-border";
                const label = EVENT_LABELS[event.event_type] ?? event.event_type;

                return (
                  <div key={event.id} className="relative -ml-6 pl-8">
                    {/* Dot */}
                    <div className={`absolute left-0 top-3 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={10} />
                    </div>

                    <div className="rounded-xl border border-border p-3 bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                          )}
                          {event.bimester && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{event.bimester}º Bimestre</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                          {formatTime(event.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
