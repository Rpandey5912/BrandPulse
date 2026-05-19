import { useState, type ChangeEvent, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI, InfluencersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, Globe, Users, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type InfluencerStatus = "pending" | "approved" | "rejected";

const statusBadge: Record<InfluencerStatus, string> = {
  pending: "bg-amber-100 text-amber-600 border border-amber-200",
  approved: "bg-emerald-100 text-emerald-600 border border-emerald-200",
  rejected: "bg-red-100 text-red-600 border border-red-200",
};

const NICHES = [
  "Food", "Travel", "Technology", "Fashion", "Fitness", "Beauty",
  "Gaming", "Education", "Finance", "Lifestyle", "Entertainment", "Health",
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Google"];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  niche: "",
  bio: "",
  portfolio_url: "",
  follower_count: "",
  engagement_rate: "",
  rate_per_post: "",
  status: "pending" as InfluencerStatus,
  platforms: [] as string[],
};

const formatFollowers = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K`
      : String(n ?? 0);

export default function ManageInfluencers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["admin-influencers", search, statusFilter, page],
    queryFn: () =>
      AdminAPI.listInfluencers({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: 15,
      }).then((r: any) => r),
    staleTime: 30_000,
  });

  const influencers: any[] = (data as any)?.data ?? [];
  const meta: any = (data as any)?.meta ?? {};

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-influencers"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8001/api/v1"}/influencers/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bp_token")}`,
          },
        },
      ).then((r) => r.json()),
    onSuccess: () => { toast({ title: "Influencer approved ✅" }); invalidate(); },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8001/api/v1"}/influencers/${id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bp_token")}`,
          },
        },
      ).then((r) => r.json()),
    onSuccess: () => { toast({ title: "Influencer rejected" }); invalidate(); },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => InfluencersAPI.create(body),
    onSuccess: () => {
      toast({ title: "Influencer created!" });
      invalidate();
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e?.response?.detail ?? e.message, variant: "destructive" }),
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || undefined,
      location: form.location || undefined,
      niche: form.niche,
      bio: form.bio || undefined,
      portfolio_url: form.portfolio_url || undefined,
      follower_count: parseInt(form.follower_count) || 0,
      engagement_rate: parseFloat(form.engagement_rate) || 0,
      rate_per_post: parseFloat(form.rate_per_post) || 0,
      status: form.status,
      platforms: form.platforms.map((p) => ({ platform: p, followers: 0 })),
    });
  };

  const togglePlatform = (p: string) =>
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const pending = influencers.filter((i: any) => i.status === "pending").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            Manage Influencers
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage influencer applications
          </p>
        </div>
        <Button
          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Influencer
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search influencers..."
            className="pl-11 rounded-xl h-11 text-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
        >
          <SelectTrigger className="w-44 rounded-xl h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pending count chip */}
      {pending > 0 && (
        <p className="text-sm text-amber-600 font-medium">
          {pending} application{pending > 1 ? "s" : ""} awaiting review
        </p>
      )}

      {/* Cards */}
      {influencers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold">No influencers found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {influencers.map((inf: any) => (
            <div
              key={inf.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Name + Status */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">
                    {inf.full_name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{inf.email}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[inf.status as InfluencerStatus] ?? "bg-gray-100 text-gray-500"}`}>
                  {inf.status}
                </span>
              </div>

              {/* Niche */}
              <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-700 font-medium">
                <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                {inf.niche}
              </div>

              {/* Platform pills */}
              {inf.platforms?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {inf.platforms.map((p: any) => (
                    <span
                      key={p.platform ?? p}
                      className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {p.platform ?? p}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {formatFollowers(inf.follower_count ?? 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Followers</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {inf.engagement_rate ?? 0}%
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Engagement</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    ${inf.rate_per_post ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Per Post</p>
                </div>
              </div>

              {/* Bio */}
              {inf.bio && (
                <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                  {inf.bio}
                </p>
              )}

              {/* Portfolio link */}
              {inf.portfolio_url && (
                <a
                  href={inf.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2"
                >
                  View Portfolio →
                </a>
              )}

              {/* Tenant tag */}
              {inf.tenant && (
                <p className="text-xs text-violet-500 mt-1">@ {inf.tenant.company_name}</p>
              )}

              {/* Approve / Reject — pending only */}
              {inf.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl text-xs border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate(inf.id)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(inf.id)}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {meta.current_page} of {meta.last_page}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg text-xs"
              disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg text-xs"
              disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── Add Influencer Dialog ──────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Influencer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input required value={form.full_name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="rounded-xl" placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input required type="email" value={form.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-xl" placeholder="jane@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-xl" placeholder="+44 7700 000000" />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={form.location}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="rounded-xl" placeholder="London, UK" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Niche *</Label>
                <Select value={form.niche} onValueChange={(v) => setForm((f) => ({ ...f, niche: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select niche" /></SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as InfluencerStatus }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Followers</Label>
                <Input type="number" value={form.follower_count}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, follower_count: e.target.value }))}
                  className="rounded-xl" placeholder="10000" />
              </div>
              <div className="space-y-1.5">
                <Label>Engagement %</Label>
                <Input type="number" step="0.1" value={form.engagement_rate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, engagement_rate: e.target.value }))}
                  className="rounded-xl" placeholder="3.5" />
              </div>
              <div className="space-y-1.5">
                <Label>Rate/Post ($)</Label>
                <Input type="number" value={form.rate_per_post}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, rate_per_post: e.target.value }))}
                  className="rounded-xl" placeholder="500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Portfolio URL</Label>
              <Input value={form.portfolio_url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, portfolio_url: e.target.value }))}
                className="rounded-xl" placeholder="https://portfolio.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <textarea value={form.bio}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={2} placeholder="Short bio…"
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const sel = form.platforms.includes(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${sel ? "bg-primary border-primary text-white" : "bg-gray-100 border-gray-200 text-gray-600 hover:border-primary"}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="submit"
              disabled={createMutation.isPending || !form.full_name || !form.email || !form.niche}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : "Create Influencer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
