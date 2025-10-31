import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type Slice = { name: string; value: number; color: string };

export default function Donut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const norm = data.map(d => ({ ...d, value: d.value }));
  return (
    <div className="surface rounded-2xl p-5">
      <div className="text-sm font-medium text-white mb-3">Allocation</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={norm} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
            {norm.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(v: any, n: any, p: any) => [`${v}%`, p.payload.name]} 
            contentStyle={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {norm.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
            {d.name} ({d.value}%)
          </div>
        ))}
      </div>
    </div>
  );
}


