import {
  BarChart3,
  Target,
  TrendingUp,
  Globe,
  Users,
  FileText,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
}

const features: Feature[] = [
  {
    icon: BarChart3,
    title: "Unified Analytics Dashboard",
    description:
      "Track all your social media KPIs — revenue, leads, ROI, and cost per lead — in one beautiful dashboard.",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Funnel Tracking",
    description:
      "Visualize your complete funnel from impressions to leads to sales. Identify drop-offs and optimize conversions.",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: TrendingUp,
    title: "Performance-Based Billing",
    description:
      "Transparent billing tied to actual results. Pay for performance, not promises.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Platform Integration",
    description:
      "Connect Instagram, TikTok, YouTube, LinkedIn, and Google Ads. All your data in one place.",
    color: "text-cyan-600",
    bg: "bg-cyan-500/10",
  },
  {
    icon: FileText,
    title: "Monthly Reports",
    description:
      "Automated monthly reports with actionable insights. Share with stakeholders in one click.",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Influencer Network",
    description:
      "Access our curated network of influencers across every niche. Connect and collaborate seamlessly.",
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Admins and clients get tailored views. Secure, multi-tenant architecture keeps your data safe.",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Real-Time Insights",
    description:
      "Live data feeds from all platforms. Make data-driven decisions faster than your competition.",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From analytics to influencer management, we provide the complete
            toolkit for modern brand growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card rounded-2xl border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-heading font-bold text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
