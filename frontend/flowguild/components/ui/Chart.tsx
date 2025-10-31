import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ChartProps {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  type?: "line" | "bar";
  color?: string;
}

export function Chart({ title, data, xKey, yKey, type = "line", color = "#00ef8b" }: ChartProps) {
  return (
    <div className="surface rounded-2xl p-6 flex flex-col">
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        {type === "line" ? (
          <LineChart data={data} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={36} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={36} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
            <Bar dataKey={yKey} fill={color} radius={8} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
