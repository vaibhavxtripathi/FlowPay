import { cn } from "../../lib/utils";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  status?: React.ReactNode;
  highlight?: boolean;
}

export function StatsCard({ icon, label, value, status, highlight }: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-xl surface flex flex-col p-5 min-h-[110px] justify-between relative overflow-hidden group",
      highlight && "ring-2 ring-[color:var(--accent)]/40"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[color:var(--accent)] border border-white/10">
            {icon}
          </div>
          <span className="text-xs font-medium text-[color:var(--muted)] truncate">{label}</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {status && <span>{status}</span>}
        </div>
      </div>
    </div>
  );
}
