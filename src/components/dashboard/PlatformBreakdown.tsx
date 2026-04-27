import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PlatformData {
  name: string;
  value: number;
}

const COLORS: string[] = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
];

const defaultData: PlatformData[] = [
  { name: "Instagram", value: 35 },
  { name: "TikTok", value: 28 },
  { name: "YouTube", value: 20 },
  { name: "LinkedIn", value: 12 },
  { name: "Google", value: 5 },
];

interface PlatformBreakdownProps {
  data?: PlatformData[];
}

export default function PlatformBreakdown({
  data = defaultData,
}: PlatformBreakdownProps) {
  return (
    <div className="bg-card rounded-2xl border p-6">
      <h3 className="font-heading font-bold text-base mb-4">
        Platform Breakdown
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
