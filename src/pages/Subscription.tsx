import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlansAPI, SubscriptionAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, AlertTriangle, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

export default function Subscription() {
  const { toast } = useToast();
  const { tenant } = useAuth();
  const queryClient = useQueryClient();

  const [confirmPlan, setConfirmPlan] = useState<any>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => PlansAPI.list().then((r: any) => r.data),
    staleTime: 300_000,
  });

  const {
    data: subData,
    isLoading: loadingSub,
    refetch: refetchSub,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => SubscriptionAPI.current().then((r: any) => r.data),
    staleTime: 60_000,
  });

  const plans: any[] = plansData ?? [];
  const currentSub: any = subData ?? null;
  const currentPlanSlug = tenant?.subscription_plan ?? "trial";

  // ── Mutations ──────────────────────────────────────────────────────────────
  const upgradeMutation = useMutation({
    mutationFn: (slug: string) => SubscriptionAPI.upgrade(slug),
    onSuccess: () => {
      toast({
        title: "Plan changed!",
        description: "Your subscription has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      refetchSub();
      setConfirmPlan(null);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => SubscriptionAPI.cancel(),
    onSuccess: () => {
      toast({
        title: "Subscription cancelled",
        description:
          "Your plan will remain active until the end of the billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setCancelOpen(false);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const isLoading = loadingPlans || loadingSub;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Popular plan index (middle of list)
  const popularSlug = "gold";

  return (
    <div className="p-6 lg:p-8 space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          Subscription
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your plan and billing
        </p>
      </div>

      {/* Current subscription info */}
      {currentSub ? (
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">Current Plan</h2>
            <Badge
              variant="secondary"
              className={
                currentSub.status === "active"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              }
            >
              {currentSub.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Plan</p>
              <p className="font-semibold capitalize">
                {currentSub.plan?.name ?? currentPlanSlug}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Amount</p>
              <p className="font-semibold">
                £{(currentSub.amount ?? 0).toLocaleString()}/mo
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Start Date</p>
              <p className="font-semibold">
                {currentSub.start_date
                  ? moment(currentSub.start_date).format("D MMM YYYY")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Renewal</p>
              <p className="font-semibold">
                {currentSub.end_date
                  ? moment(currentSub.end_date).format("D MMM YYYY")
                  : "—"}
              </p>
            </div>
          </div>

          {tenant?.trial_ends_at && currentPlanSlug === "trial" && (
            <div className="mt-4 flex items-center gap-2 bg-amber-500/10 text-amber-700 rounded-xl px-4 py-2.5 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Trial ends {moment(tenant.trial_ends_at).fromNow()} — upgrade to
              keep full access
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setCancelOpen(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          No active subscription found. Choose a plan below to get started.
        </div>
      )}

      {/* Plans grid */}
      <div>
        <h2 className="font-heading font-bold text-lg mb-4">Available Plans</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan: any) => {
            const isCurrent = plan.slug === currentPlanSlug;
            const isPopular = plan.slug === popularSlug;

            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl border p-6 flex flex-col transition-shadow hover:shadow-md ${
                  isPopular
                    ? "border-violet-500 shadow-violet-500/10 shadow-lg"
                    : ""
                } ${isCurrent ? "ring-2 ring-primary/40" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-heading font-bold text-lg">
                    {plan.name}
                  </h3>
                  <div className="mt-1">
                    <span className="text-3xl font-extrabold">
                      £{(plan.price_monthly ?? 0).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {(plan.features ?? []).map((feature: string) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {plan.max_campaigns === -1
                        ? "Unlimited"
                        : plan.max_campaigns}{" "}
                      campaigns
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{plan.max_platforms} platforms</span>
                  </li>
                </ul>

                {isCurrent ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full rounded-xl ${
                      isPopular
                        ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white"
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    }`}
                    onClick={() => setConfirmPlan(plan)}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {(plan.price_monthly ?? 0) >
                    (plans.find((p: any) => p.slug === currentPlanSlug)
                      ?.price_monthly ?? 0)
                      ? "Upgrade"
                      : "Downgrade"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade confirm dialog */}
      <Dialog open={!!confirmPlan} onOpenChange={() => setConfirmPlan(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Confirm Plan Change
            </DialogTitle>
          </DialogHeader>
          {confirmPlan && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                You're switching to the{" "}
                <strong className="text-foreground">{confirmPlan.name}</strong>{" "}
                plan at{" "}
                <strong className="text-foreground">
                  £{(confirmPlan.price_monthly ?? 0).toLocaleString()}/month
                </strong>
                .
              </p>
              <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
                <p>
                  ✅{" "}
                  {confirmPlan.max_campaigns === -1
                    ? "Unlimited"
                    : confirmPlan.max_campaigns}{" "}
                  campaigns
                </p>
                <p>✅ {confirmPlan.max_platforms} platforms</p>
                {(confirmPlan.features ?? []).slice(0, 3).map((f: string) => (
                  <p key={f}>✅ {f}</p>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setConfirmPlan(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={upgradeMutation.isPending}
                  onClick={() => upgradeMutation.mutate(confirmPlan.slug)}
                >
                  {upgradeMutation.isPending ? "Switching…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirm dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-destructive">
              Cancel Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure? You'll keep access until the end of the current
              billing period, then your account will be downgraded.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setCancelOpen(false)}
              >
                Keep Plan
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending ? "Cancelling…" : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
