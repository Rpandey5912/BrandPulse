import { TrendingUp, TrendingDown } from "lucide-react";
import { type  LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
}

export default function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = "text-primary",
  bg = "bg-primary/10",
}: KPICardProps) {
  const isPositive =
    change !== undefined ? parseFloat(String(change)) >= 0 : false;

  return (
    <div className="bg-card rounded-2xl border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}%
          </div>
        )}
      </div>
      <p className="font-heading text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {changeLabel || title}
      </p>
    </div>
  );
}
