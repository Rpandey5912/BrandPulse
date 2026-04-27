import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

interface FunnelItem {
  label: string;
  value: number;
  color: string;
}

export default function HeroSection() {
  const stats: StatItem[] = [
    { label: "Revenue", value: "$48.2K", change: "+24%", icon: TrendingUp },
    { label: "Leads", value: "1,847", change: "+18%", icon: BarChart3 },
    { label: "ROI", value: "342%", change: "+12%", icon: Zap },
  ];

  const funnelData: FunnelItem[] = [
    { label: "Impressions", value: 85, color: "bg-primary" },
    { label: "Leads", value: 62, color: "bg-accent" },
    { label: "Conversions", value: 38, color: "bg-emerald-500" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Brand Analytics
            </div>
            <h1 className="font-heading text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Track Your{" "}
              <span className="bg-primary bg-clip-text text-transparent">
                Brand Growth
              </span>{" "}
              Across Every Platform
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Unify your social media analytics, track ROI in real-time, and
              scale your brand performance with actionable insights from
              Instagram, TikTok, YouTube, LinkedIn & Google.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-xl text-black cursor-pointer hover:bg-[var(--primary)] hover:opacity-80 hover:text-white transition-all"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                3-month free trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                No credit card required
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative bg-card rounded-2xl shadow-2xl border p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-bold text-lg">
                  Performance Overview
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-medium">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-muted/50 rounded-xl p-4">
                    <stat.icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold font-heading">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-emerald-600 font-medium">
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium">Funnel Performance</p>
                {funnelData.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
