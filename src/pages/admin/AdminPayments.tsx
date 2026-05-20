import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/lib/api";
import type { AdminPayment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Search, DollarSign, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

const statusColor: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-blue-500/10 text-blue-600",
};

export default function AdminPayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", search, statusFilter, dateFrom, dateTo, page],
    queryFn: () =>
      AdminAPI.listPayments({
        client: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: 20,
      }).then((r) => r),
    staleTime: 30_000,
  });

  const payments: AdminPayment[] = (data as any)?.data ?? [];
  const meta: any = (data as any)?.meta ?? {};

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-payments"] });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "paid" | "failed" | "refunded" }) =>
      AdminAPI.updatePaymentStatus(id, status),
    onSuccess: () => {
      toast({ title: "Payment status updated!" });
      invalidate();
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e?.response?.detail ?? e.message, variant: "destructive" }),
  });

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const failedCount = payments.filter((p) => p.status === "failed").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const currency = (payments[0] as any)?.currency ?? "GBP";
  const currencySymbol = currency === "GBP" ? "£" : "$";

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
          Manage Payments
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and resolve payment issues across all clients
        </p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: `Total (${meta.total ?? 0} records)`, value: `${currencySymbol}${totalAmount.toLocaleString()}`, color: "text-emerald-600 bg-emerald-50", icon: DollarSign },
          { label: "Paid", value: paidCount, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
          { label: "Pending", value: pendingCount, color: "text-amber-600 bg-amber-50", icon: RotateCcw },
          { label: "Failed", value: failedCount, color: "text-red-600 bg-red-50", icon: XCircle },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-lg">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by client…"
            className="pl-11 rounded-xl h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44 rounded-xl h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e: ChangeEvent<HTMLInputElement>) => { setDateFrom(e.target.value); setPage(1); }}
          className="rounded-xl h-11 w-40"
          placeholder="From"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e: ChangeEvent<HTMLInputElement>) => { setDateTo(e.target.value); setPage(1); }}
          className="rounded-xl h-11 w-40"
          placeholder="To"
        />
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-semibold">No payments found</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium">{p.tenant?.company_name ?? p.paid_by ?? "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{p.tenant?.email ?? ""}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold">{currencySymbol}{(p.amount ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-muted-foreground capitalize">{p.payment_method ?? "—"}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                      {p.transaction_id ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary" className={`text-xs ${statusColor[p.status] ?? "bg-muted"}`}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-7 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: p.id, status: "paid" })}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Paid
                          </Button>
                        )}
                        {p.status !== "failed" && p.status !== "refunded" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-7 border-red-200 text-red-500 hover:bg-red-50"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: p.id, status: "failed" })}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Mark Failed
                          </Button>
                        )}
                        {p.status === "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-7 border-blue-200 text-blue-500 hover:bg-blue-50"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: p.id, status: "refunded" })}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" /> Refund
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
    </div>
  );
}
