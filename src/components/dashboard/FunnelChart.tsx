import { motion } from "framer-motion";

interface Stage {
  label: string;
  value: number;
  color: string;
}

const defaultStages: Stage[] = [
  { label: "Impressions", value: 100, color: "bg-blue-500" },
  { label: "Reach", value: 75, color: "bg-violet-500" },
  { label: "Clicks", value: 48, color: "bg-amber-500" },
  { label: "Leads", value: 28, color: "bg-emerald-500" },
  { label: "Conversions", value: 12, color: "bg-primary" },
];

interface FunnelChartProps {
  stages?: Stage[];
}

export default function FunnelChart({
  stages = defaultStages,
}: FunnelChartProps) {
  const maxValue = Math.max(...stages.map((s) => s.value));

  return (
    <div className="bg-card rounded-2xl border p-6">
      <h3 className="font-heading font-bold text-base mb-6">
        Conversion Funnel
      </h3>
      <div className="space-y-4">
        {stages.map((stage, i) => {
          const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                {stage.label}
              </span>
              <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`h-full ${stage.color} rounded-lg flex items-center justify-end pr-3`}
                >
                  <span className="text-xs font-bold text-white">
                    {stage.value.toLocaleString()}
                  </span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
