/// <reference types="node" />
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

interface Plan {
  key: string;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  features: string[];
}

interface Client {
  id: string;
  company_name: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  [key: string]: any;
}

interface Subscription {
  id: string;
  client_id: string;
  plan: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string;
  billing_cycle: string;
  [key: string]: any;
}

const plans: Plan[] = [
  {
    key: "trial",
    name: "Trial",
    price: 0,
    period: "3 months free",
    features: [
      "2 platforms",
      "Basic analytics",
      "Monthly report",
      "Email support",
      "3 campaigns",
    ],
  },
  {
    key: "silver",
    name: "Silver",
    price: 99,
    period: "/month",
    features: [
      "3 platforms",
      "Advanced analytics",
      "Funnel tracking",
      "Weekly reports",
      "10 campaigns",
      "Priority support",
    ],
  },
  {
    key: "gold",
    name: "Gold",
    price: 249,
    period: "/month",
    popular: true,
    features: [
      "All 5 platforms",
      "Full analytics",
      "Advanced funnels",
      "Real-time reports",
      "Unlimited campaigns",
      "Influencer matching",
      "Account manager",
      "Performance billing",
    ],
  },
  {
    key: "platinum",
    name: "Platinum",
    price: 499,
    period: "/month",
    features: [
      "All Gold features",
      "White-label reports",
      "Custom API",
      "Multi-brand",
      "Success team",
      "Custom KPIs",
      "SLA guarantee",
      "Advanced ROI",
    ],
  },
];

// Static mock data
const MOCK_CLIENT: Client = {
  id: "1",
  company_name: "TechCorp Solutions",
  subscription_plan: "silver",
  subscription_status: "active",
  subscription_start_date: new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString(),
  subscription_end_date: new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString(),
};

const MOCK_SUBSCRIPTION: Subscription = {
  id: "1",
  client_id: "1",
  plan: "silver",
  amount: 99,
  status: "active",
  start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  billing_cycle: "monthly",
};

// Store subscription data in memory
let currentClientData: Client = { ...MOCK_CLIENT };
let currentSubscriptionData: Subscription = { ...MOCK_SUBSCRIPTION };

export default function Subscription() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      // Simulate API loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubscriptions([currentSubscriptionData]);
      setClients([currentClientData]);
      setLoading(false);
    };
    load();
  }, []);

  const currentSub = subscriptions[0];
  const currentClient = clients[0];
  const currentPlan = currentClient?.subscription_plan || "trial";

  const handleUpgrade = async (planKey: string) => {
    const plan = plans.find((p) => p.key === planKey);
    if (!plan) return;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const now = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + (planKey === "trial" ? 3 : 1));

    // Update client data
    if (currentClient) {
      currentClientData = {
        ...currentClientData,
        subscription_plan: planKey,
        subscription_status: "active",
        subscription_start_date: now.toISOString(),
        subscription_end_date: end.toISOString(),
      };
      setClients([currentClientData]);
    }

    // Create new subscription
    const newSubscription: Subscription = {
      id: Math.random().toString(36).substr(2, 9),
      client_id: currentClient?.id || "",
      plan: planKey,
      amount: plan.price,
      status: planKey === "trial" ? "active" : "pending_payment",
      start_date: now.toISOString(),
      end_date: end.toISOString(),
      billing_cycle: "monthly",
    };

    currentSubscriptionData = newSubscription;
    setSubscriptions([currentSubscriptionData]);

    toast({ title: `Switched to ${plan.name} plan!` });
    setConfirmDialog(null);

    // Simulate page reload by reloading data
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleCancel = async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (currentClient) {
      currentClientData = {
        ...currentClientData,
        subscription_status: "cancelled",
      };
      setClients([currentClientData]);
    }

    if (currentSub) {
      currentSubscriptionData = {
        ...currentSubscriptionData,
        status: "cancelled",
      };
      setSubscriptions([currentSubscriptionData]);
    }

    toast({
      title: "Subscription cancelled",
      description:
        "Your access will continue until the end of the billing period.",
    });

    // Simulate page reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          Subscription
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your plan and billing
        </p>
      </div>

      {/* Current Plan */}
      {currentClient && (
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <h2 className="font-heading text-2xl font-extrabold capitalize">
                {currentPlan}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge
                  variant="secondary"
                  className={
                    currentClient.subscription_status === "active"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-600"
                  }
                >
                  {currentClient.subscription_status}
                </Badge>
                {currentClient.subscription_end_date && (
                  <span className="text-xs text-muted-foreground">
                    Expires{" "}
                    {moment(currentClient.subscription_end_date).format(
                      "MMM D, YYYY",
                    )}
                  </span>
                )}
              </div>
            </div>
            {currentClient.subscription_status === "active" &&
              currentPlan !== "trial" && (
                <Button
                  variant="outline"
                  className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel your subscription?",
                      )
                    ) {
                      handleCancel();
                    }
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" /> Cancel Subscription
                </Button>
              )}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div
              key={plan.key}
              className={`relative bg-card rounded-2xl border p-6 flex flex-col ${
                plan.popular ? "border-primary shadow-xl shadow-primary/10" : ""
              } ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full">
                  Current
                </div>
              )}
              <h3 className="font-heading font-bold text-lg mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-heading text-3xl font-extrabold">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                disabled={isCurrent}
                onClick={() => setConfirmDialog(plan.key)}
                className={`w-full rounded-xl ${plan.popular && !isCurrent ? "bg-gradient-to-r from-primary to-accent" : ""}`}
                variant={
                  isCurrent ? "secondary" : plan.popular ? "default" : "outline"
                }
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Confirm Plan Change
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to switch to the{" "}
            <strong className="text-foreground capitalize">
              {confirmDialog}
            </strong>{" "}
            plan?
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setConfirmDialog(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent"
              onClick={() => confirmDialog && handleUpgrade(confirmDialog)}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Optional: Display debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground text-center">
          <p>
            Demo Mode: Subscription data is stored in memory and will reset on
            page refresh.
          </p>
          <p className="mt-1">
            Use the upgrade buttons to test different plans.
          </p>
        </div>
      )}
    </div>
  );
}
