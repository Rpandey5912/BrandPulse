import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

type InstanceStatus = "active" | "blocked" | "pending";
type SubscriptionPlan = "trial" | "silver" | "gold" | "platinum";

const statusClass: Record<InstanceStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  blocked: "bg-red-500/10 text-red-600",
  pending: "bg-amber-500/10 text-amber-600",
};

const planClass: Record<SubscriptionPlan, string> = {
  platinum: "bg-violet-500/10 text-violet-600",
  gold: "bg-amber-500/10 text-amber-600",
  silver: "bg-blue-500/10 text-blue-600",
  trial: "bg-muted text-muted-foreground",
};

const EMPTY_FORM = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  industry: "",
  website: "",
  subscription_plan: "trial" as SubscriptionPlan,
  password: "",
};

export default function ManageClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["admin-clients", search, page],
    queryFn: () =>
      AdminAPI.listClients({
        search: search || undefined,
        page,
        per_page: 15,
      }).then((r: any) => r),
    staleTime: 30_000,
  });

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-client-detail", selected?.id],
    queryFn: () =>
      selected
        ? AdminAPI.getClient(selected.id).then((r: any) => r.data)
        : null,
    enabled: !!selected && detailOpen,
    staleTime: 30_000,
  });

  const clients: any[] = (data as any)?.data ?? [];
  const meta: any = (data as any)?.meta ?? {};

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-clients"] });

  const createMutation = useMutation({
    mutationFn: (body: any) => AdminAPI.createClient(body),
    onSuccess: () => {
      toast({ title: "Client created!" });
      invalidate();
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => AdminAPI.blockClient(id),
    onSuccess: () => {
      toast({ title: "Client blocked" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => AdminAPI.unblockClient(id),
    onSuccess: () => {
      toast({ title: "Client unblocked" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminAPI.deleteClient(id),
    onSuccess: () => {
      toast({ title: "Client deleted" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            Manage Clients
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {meta.total ?? clients.length} total clients
          </p>
        </div>
        <Button
          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search clients…"
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Table */}
      {clients.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No clients found</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  {[
                    "Company",
                    "Email",
                    "Plan",
                    "Status",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client: any) => (
                  <tr
                    key={client.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{client.company_name}</p>
                        {client.contact_name && (
                          <p className="text-xs text-muted-foreground">
                            {client.contact_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`capitalize text-xs ${planClass[client.subscription_plan as SubscriptionPlan] ?? "bg-muted"}`}
                      >
                        {client.subscription_plan}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${statusClass[client.instance_status as InstanceStatus] ?? "bg-muted"}`}
                      >
                        {client.instance_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {moment(client.created_at).format("D MMM YYYY")}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelected(client);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          {client.instance_status === "blocked" ? (
                            <DropdownMenuItem
                              onClick={() => unblockMutation.mutate(client.id)}
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" /> Unblock
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => blockMutation.mutate(client.id)}
                            >
                              <ShieldOff className="w-4 h-4 mr-2" /> Block
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(client.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} · {meta.total}{" "}
                total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  disabled={page === meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Client Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Company Name *</Label>
                <Input
                  required
                  value={form.company_name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, company_name: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contact Name *</Label>
                <Input
                  required
                  value={form.contact_name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, contact_name: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Temp Password *</Label>
              <Input
                required
                type="password"
                value={form.password}
                placeholder="Min 8 characters"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input
                  value={form.industry}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, industry: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <Select
                value={form.subscription_plan}
                onValueChange={(v: SubscriptionPlan) =>
                  setForm((p) => ({ ...p, subscription_plan: v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Starter (Trial)</SelectItem>
                  <SelectItem value="silver">Growth (£499/mo)</SelectItem>
                  <SelectItem value="gold">Scale (£999/mo)</SelectItem>
                  <SelectItem value="platinum">
                    Accelerator (£2499/mo)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {createMutation.isPending ? "Creating…" : "Create Client"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selected?.company_name}
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            detailData && (
              <div className="space-y-4 mt-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Contact", value: detailData.contact_name },
                    { label: "Email", value: detailData.email },
                    { label: "Phone", value: detailData.phone },
                    { label: "Industry", value: detailData.industry },
                    { label: "Website", value: detailData.website },
                    { label: "Plan", value: detailData.subscription_plan },
                    { label: "Status", value: detailData.instance_status },
                    { label: "Campaigns", value: detailData.campaigns_count },
                    {
                      label: "Influencers",
                      value: detailData.influencers_count,
                    },
                    {
                      label: "Joined",
                      value: moment(detailData.created_at).format("D MMM YYYY"),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium mt-0.5">{value ?? "—"}</p>
                    </div>
                  ))}
                </div>
                {detailData.users?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">
                      Users ({detailData.users.length})
                    </p>
                    <div className="space-y-2">
                      {detailData.users.map((u: any) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2"
                        >
                          <div>
                            <p className="font-medium text-xs">{u.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {u.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
