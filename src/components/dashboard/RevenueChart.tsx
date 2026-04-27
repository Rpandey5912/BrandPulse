import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  month: string;
  revenue: number;
  leads: number;
  spend: number;
}

const defaultData: RevenueData[] = [
  { month: "Jan", revenue: 4200, leads: 120, spend: 1800 },
  { month: "Feb", revenue: 5100, leads: 145, spend: 2000 },
  { month: "Mar", revenue: 6800, leads: 190, spend: 2200 },
  { month: "Apr", revenue: 7500, leads: 210, spend: 2100 },
  { month: "May", revenue: 9200, leads: 260, spend: 2400 },
  { month: "Jun", revenue: 11000, leads: 310, spend: 2600 },
];

interface RevenueChartProps {
  data?: RevenueData[];
}

export default function RevenueChart({
  data = defaultData,
}: RevenueChartProps) {
  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-base">
          Revenue & Leads Trend
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            Revenue
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-accent" />
            Leads
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(243, 75%, 59%)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(243, 75%, 59%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(243, 75%, 59%)"
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="hsl(262, 83%, 58%)"
              fill="url(#colorLeads)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
