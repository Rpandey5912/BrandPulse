import { useState, type FormEvent, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InfluencersAPI, CampaignsAPI, CollabAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Send,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Star,
  MapPin,
  DollarSign,
  Eye,
  Upload,
  Paperclip,
} from "lucide-react";

type Platform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Google";

const platformIcons: Record<Platform, string> = {
  Instagram: "🔴",
  TikTok: "🎵",
  YouTube: "▶️",
  LinkedIn: "🔷",
  Google: "🔍",
};

const nicheColors: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700",
  Travel: "bg-sky-100 text-sky-700",
  Technology: "bg-blue-100 text-blue-700",
  Fashion: "bg-pink-100 text-pink-700",
  Fitness: "bg-green-100 text-green-700",
  Beauty: "bg-rose-100 text-rose-700",
  Gaming: "bg-purple-100 text-purple-700",
  Education: "bg-amber-100 text-amber-700",
  Finance: "bg-emerald-100 text-emerald-700",
  Lifestyle: "bg-violet-100 text-violet-700",
  Entertainment: "bg-red-100 text-red-700",
  Health: "bg-teal-100 text-teal-700",
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    color: "bg-red-500/10 text-red-600",
    icon: XCircle,
  },
  delivered: {
    label: "Delivered",
    color: "bg-blue-500/10 text-blue-600",
    icon: PackageCheck,
  },
  completed: {
    label: "Completed",
    color: "bg-violet-500/10 text-violet-600",
    icon: Star,
  },
};

const formatFollowers = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K`
      : String(n);

export default function Influencers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    campaign_id: "",
    message: "",
    agreed_rate: "",
    due_date: "",
  });

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: influencersData, isLoading: loadingInfluencers } = useQuery({
    queryKey: ["influencers", search],
    queryFn: () =>
      InfluencersAPI.list({
        status: "approved",
        search: search || undefined,
        per_page: 50,
      }).then((r: any) => r.data),
    staleTime: 30_000,
  });

  const { data: collabData, isLoading: loadingCollabs } = useQuery({
    queryKey: ["collabs"],
    queryFn: () => CollabAPI.list({ per_page: 100 }).then((r: any) => r.data),
    staleTime: 30_000,
  });

  const { data: campaignsData } = useQuery({
    queryKey: ["campaigns-list"],
    queryFn: () =>
      CampaignsAPI.list({ status: "active", per_page: 100 }).then(
        (r: any) => r.data,
      ),
    staleTime: 60_000,
  });

  const influencers: any[] = influencersData ?? [];
  const collabs: any[] = collabData ?? [];
  const campaigns: any[] = campaignsData ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidateCollabs = () =>
    queryClient.invalidateQueries({ queryKey: ["collabs"] });

  const sendInviteMutation = useMutation({
    mutationFn: (body: any) => CollabAPI.create(body),
    onSuccess: () => {
      toast({ title: "Invite sent!" });
      invalidateCollabs();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const deliverMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      CollabAPI.deliver(id, body),
    onSuccess: () => {
      toast({ title: "Deliverable submitted!" });
      invalidateCollabs();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openInvite = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setInviteForm({
      campaign_id: "",
      message: "",
      agreed_rate: String(influencer.rate_per_post ?? ""),
      due_date: "",
    });
    setInviteOpen(true);
  };

  const handleSendInvite = async (e: FormEvent) => {
    e.preventDefault();
    await sendInviteMutation.mutateAsync({
      campaign_id: inviteForm.campaign_id,
      influencer_id: selectedInfluencer.id,
      agreed_fee: parseFloat(inviteForm.agreed_rate) || 0,
      due_date: inviteForm.due_date || undefined,
      message: inviteForm.message,
    });
    setInviteOpen(false);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !uploadUrl) return;
    setUploading(true);
    try {
      await deliverMutation.mutateAsync({
        id: selectedRequest.id,
        body: { deliverable_url: uploadUrl, deliverable_notes: uploadNotes },
      });
      setUploadOpen(false);
      setUploadUrl("");
      setUploadNotes("");
    } finally {
      setUploading(false);
    }
  };

  if (loadingInfluencers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          Influencers
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage influencers and collaboration requests
        </p>
      </div>

      <Tabs defaultValue="influencers">
        <TabsList className="rounded-xl">
          <TabsTrigger value="influencers" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" /> Influencers
          </TabsTrigger>
          <TabsTrigger value="collabs" className="rounded-lg">
            <Send className="w-4 h-4 mr-2" /> Collab Requests
            {collabs.filter((c) => c.status === "pending").length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {collabs.filter((c) => c.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Influencers Tab ────────────────────────────────────────────── */}
        <TabsContent value="influencers" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search influencers…"
              className="pl-10 rounded-xl"
            />
          </div>

          {influencers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No influencers yet</p>
              <p className="text-sm mt-1">
                Approved influencers will appear here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {influencers.map((inf: any) => (
                <div
                  key={inf.id}
                  className="bg-card rounded-2xl border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-heading font-bold text-primary text-xl">
                      {inf.full_name?.[0]}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${nicheColors[inf.niche] ?? "bg-muted"}`}
                    >
                      {inf.niche}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold truncate">
                    {inf.full_name}
                  </h3>
                  {inf.location && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {inf.location}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                    <div className="bg-muted/50 rounded-xl p-2">
                      <p className="font-bold text-xs">
                        {formatFollowers(inf.follower_count)}
                      </p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-2">
                      <p className="font-bold text-xs">
                        {inf.engagement_rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Engagement
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-2">
                      <p className="font-bold text-xs">£{inf.rate_per_post}</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                  {inf.platforms && inf.platforms.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-3">
                      {inf.platforms.map((p: any) => (
                        <span
                          key={p.platform ?? p}
                          className="bg-muted px-2 py-0.5 rounded-lg text-xs"
                        >
                          {platformIcons[p.platform as Platform] ?? ""}{" "}
                          {p.platform ?? p}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl text-xs"
                      onClick={() => {
                        setSelectedInfluencer(inf);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={() => openInvite(inf)}
                    >
                      <Send className="w-3 h-3 mr-1" /> Invite
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Collab Requests Tab ───────────────────────────────────────── */}
        <TabsContent value="collabs" className="mt-6 space-y-4">
          {loadingCollabs ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : collabs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No collab requests yet</p>
              <p className="text-sm mt-1">
                Send an invite to an influencer to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {collabs.map((req: any) => {
                const cfg = statusConfig[req.status] ?? statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <div
                    key={req.id}
                    className="bg-card rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-heading font-bold truncate">
                          {req.influencer?.full_name ?? "Influencer"}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${cfg.color}`}
                        >
                          <Icon className="w-3 h-3 mr-1 inline" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Campaign: {req.campaign?.name ?? "—"}
                      </p>
                      {req.agreed_fee > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <DollarSign className="w-3 h-3 inline" /> £
                          {req.agreed_fee} agreed
                        </p>
                      )}
                      {req.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(req.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {req.status === "accepted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs"
                        onClick={() => {
                          setSelectedRequest(req);
                          setUploadOpen(true);
                        }}
                      >
                        <Paperclip className="w-3 h-3 mr-1" /> Upload
                        Deliverable
                      </Button>
                    )}
                    {req.deliverable_url && (
                      <a
                        href={req.deliverable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Deliverable →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Invite Dialog ───────────────────────────────────────────────── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Invite {selectedInfluencer?.full_name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendInvite} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Campaign *</Label>
              <Select
                required
                value={inviteForm.campaign_id}
                onValueChange={(v) =>
                  setInviteForm((p) => ({ ...p, campaign_id: v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agreed Rate (£)</Label>
                <Input
                  type="number"
                  value={inviteForm.agreed_rate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setInviteForm((p) => ({
                      ...p,
                      agreed_rate: e.target.value,
                    }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={inviteForm.due_date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setInviteForm((p) => ({ ...p, due_date: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                value={inviteForm.message}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInviteForm((p) => ({ ...p, message: e.target.value }))
                }
                rows={3}
                placeholder="Tell them about the campaign…"
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button
              type="submit"
              disabled={sendInviteMutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {sendInviteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Send Invite
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Upload Deliverable Dialog ───────────────────────────────────── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Upload Deliverable
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-2">
            <div className="bg-muted/50 rounded-xl p-3 text-sm">
              <p className="text-muted-foreground">
                Collab with{" "}
                <strong className="text-foreground">
                  {selectedRequest?.influencer?.full_name}
                </strong>
              </p>
              <p className="text-muted-foreground">
                Campaign:{" "}
                <strong className="text-foreground">
                  {selectedRequest?.campaign?.name}
                </strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Deliverable URL *</Label>
              <Input
                required
                value={uploadUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUploadUrl(e.target.value)
                }
                placeholder="https://drive.google.com/…"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Link to Google Drive, Dropbox, YouTube, etc.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <textarea
                value={uploadNotes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setUploadNotes(e.target.value)
                }
                rows={2}
                placeholder="Any notes about this deliverable…"
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-primary hover:opacity-90"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Submit Deliverable
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ───────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selectedInfluencer?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedInfluencer && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-heading font-bold text-primary text-2xl">
                  {selectedInfluencer.full_name?.[0]}
                </div>
                <div>
                  <Badge
                    variant="secondary"
                    className={
                      nicheColors[selectedInfluencer.niche] ?? "bg-muted"
                    }
                  >
                    {selectedInfluencer.niche}
                  </Badge>
                  {selectedInfluencer.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {selectedInfluencer.location}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedInfluencer.email}
                  </p>
                </div>
              </div>
              {selectedInfluencer.bio && (
                <p className="text-sm text-muted-foreground border-t pt-3">
                  {selectedInfluencer.bio}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="font-bold text-sm">
                    {formatFollowers(selectedInfluencer.follower_count)}
                  </p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="font-bold text-sm">
                    {selectedInfluencer.engagement_rate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="font-bold text-sm">
                    £{selectedInfluencer.rate_per_post}
                  </p>
                  <p className="text-xs text-muted-foreground">Rate/Post</p>
                </div>
              </div>
              {selectedInfluencer.portfolio_url && (
                <a
                  href={selectedInfluencer.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block"
                >
                  View Portfolio →
                </a>
              )}
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={() => {
                  setDetailOpen(false);
                  openInvite(selectedInfluencer);
                }}
              >
                <Send className="w-4 h-4 mr-2" /> Send Invite
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
