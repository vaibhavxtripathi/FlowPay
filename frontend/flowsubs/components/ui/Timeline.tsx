import { Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDate, formatTime } from "../../lib/utils";

interface TimelineEvent {
  type: string;
  label: string;
  date: string;
  status?: string;
  meta?: string;
}

const typeStyles: Record<string, { icon: any; color: string }> = {
  paid: { icon: DollarSign, color: "text-emerald-700 bg-emerald-100" },
  created: { icon: CheckCircle, color: "text-sky-700 bg-sky-100" },
  canceled: { icon: XCircle, color: "text-rose-700 bg-rose-100" },
  overdue: { icon: AlertCircle, color: "text-amber-700 bg-amber-100" },
  default: { icon: Clock, color: "text-gray-600 bg-gray-100" }
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative border-l border-[color:var(--border)] pl-4 space-y-8">
      {events.length === 0 ? (
        <div className="text-center text-[color:var(--muted)]">No recent activity</div>
      ) : events.map((event, i) => {
        const { icon: Icon, color } = typeStyles[event.type] || typeStyles.default;
        return (
          <li key={i} className="flex items-start gap-4">
            <span className={`flex items-center justify-center w-10 h-10 rounded-full ${color} ring-4 ring-[color:var(--background)]` }>
              <Icon className="w-6 h-6" />
            </span>
            <div className="flex-1">
              <div className="font-medium text-white mb-1 flex items-center gap-1">
                {event.label}
                {event.status && <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 surface text-[color:var(--muted)]">{event.status}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]">
                <span>{formatDate(event.date)}</span>
                <span className="mx-1">•</span>
                <span className="font-mono">{formatTime(event.date)}</span>
                {event.meta && <span className="ml-2 text-xs">{event.meta}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
