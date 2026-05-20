import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/lib/api";
import type { AdminSubscription } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, CreditCard, XCircle, RefreshCw } from "lucide-react";

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  pending_payment: "bg-amber-500/10 text-amber-600",
  cancelled: "bg-red-500/10 text-red-600",
  inactive: "bg-muted text-muted-foreground",
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Starter", starter: "Starter",
  silver: "Growth", growth: "Growth",
  gold: "Scale", scale: "Scale",
  platinum: "Accelerator", accelerator: "Accelerator",
};

const PLANS = [
  { value: "trial", label: "Starter" },
  { value: "silver", label: "Growth" },
  { value: "gold", label: "Scale" },
  { value: "platinum", label: "Accelerator" },
];

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<AdminSubscription | null>(null);
  const [editForm, setEditForm] = useState({ plan_id: "", billing_cycle: "monthly" as "monthly" | "annually", status: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions", search, statusFilter, page],
    queryFn: () =>
      AdminAPI.listSubscriptions({
        client: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: 15,
      }).then((r) => r),
    staleTime: 30_000,
  });

  const subscriptions: AdminSubscription[] = (data as any)?.data ?? [];
  const meta: any = (data as any)?.meta ?? {};

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      AdminAPI.updateSubscription(id, body),
    onSuccess: () => {
      toast({ title: "Subscription updated!" });
      setEditOpen(false);
      invalidate();
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e?.response?.detail ?? e.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => AdminAPI.cancelSubscription(id),
    onSuccess: () => {
      toast({ title: "Subscription cancelled" });
      invalidate();
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e?.response?.detail ?? e.message, variant: "destructive" }),
  });

  const openEdit = (sub: AdminSubscription) => {
    setSelected(sub);
    setEditForm({
      plan_id: sub.plan_id ?? "",
      billing_cycle: sub.billing_cycle ?? "monthly",
      status: sub.status,
    });
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selected) return;
    updateMutation.mutate({
      id: selected.tenant_id,
      body: {
        plan_id: editForm.plan_id || undefined,
        billing_cycle: editForm.billing_cycle,
        status: editForm.status || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          Manage Subscriptions
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage all client subscriptions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by client name…"
            className="pl-11 rounded-xl h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44 rounded-xl h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-semibold">No subscriptions found</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Billing</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Ends</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium">{sub.tenant?.company_name ?? sub.tenant_id}</p>
                      <p className="text-xs text-muted-foreground">{sub.tenant?.email ?? ""}</p>
                    </td>
                    <td className="px-5 py-4 capitalize font-medium">
                      {PLAN_LABELS[sub.plan?.name?.toLowerCase() ?? sub.plan_id?.toLowerCase() ?? ""] ?? sub.plan?.name ?? sub.plan_id ?? "—"}
                    </td>
                    <td className="px-5 py-4 capitalize text-muted-foreground text-xs">
                      {sub.billing_cycle ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary" className={`text-xs ${statusColor[sub.status] ?? "bg-muted"}`}>
                        {sub.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs h-8"
                          onClick={() => openEdit(sub)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Change Plan
                        </Button>
                        {sub.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-8 border-red-200 text-red-500 hover:bg-red-50"
                            disabled={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate(sub.tenant_id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {meta.current_page} of {meta.last_page}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg text-xs"
              disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-lg text-xs"
              disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Update Subscription — {selected?.tenant?.company_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Plan</p>
              <Select value={editForm.plan_id} onValueChange={(v) => setEditForm((f) => ({ ...f, plan_id: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Keep current plan" /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Billing Cycle</p>
              <Select value={editForm.billing_cycle} onValueChange={(v: "monthly" | "annually") => setEditForm((f) => ({ ...f, billing_cycle: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Status</p>
              <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              disabled={updateMutation.isPending}
              onClick={handleUpdate}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
