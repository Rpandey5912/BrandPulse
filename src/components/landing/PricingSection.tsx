import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "£199",
    period: "3 months",
    description: "Perfect to explore our platform",
    features: [
      "2 social media platforms",
      "Basic analytics dashboard",
      "Monthly report",
      "Email support",
      "Up to 3 campaigns",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "£499",
    period: "/month",
    description: "For growing brands",
    features: [
      "3 social media platforms",
      "Advanced analytics & charts",
      "Funnel tracking",
      "Weekly reports",
      "Up to 10 campaigns",
      "Priority email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Scale",
    price: "£999",
    period: "/month",
    description: "For established brands",
    features: [
      "All 5 social platforms",
      "Full analytics suite",
      "Advanced funnel tracking",
      "Real-time reporting",
      "Unlimited campaigns",
      "Influencer matching",
      "Dedicated account manager",
      "Performance-based billing",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Accelerator",
    price: "£2500",
    period: "/month",
    description: "For enterprise brands",
    features: [
      "All Gold features",
      "White-label reports",
      "Custom API integrations",
      "Multi-brand management",
      "Dedicated success team",
      "Custom KPI tracking",
      "SLA guarantee",
      "Advanced ROI modeling",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Choose Your Growth Plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with a free 3-month trial. Upgrade anytime as your brand
            scales.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-extrabold">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button
                  className={`w-full rounded-xl h-12 cursor-pointer ${
                    plan.popular
                      ? "bg-primary text-white hover:opacity-90"
                      : "hover:bg-primary hover:text-white transition-all"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
