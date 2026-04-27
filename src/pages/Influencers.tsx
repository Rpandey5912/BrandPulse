import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
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
  Upload,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Star,
  MapPin,
  DollarSign,
  Eye,
  Paperclip,
} from "lucide-react";

type Niche =
  | "Food"
  | "Travel"
  | "Technology"
  | "Fashion"
  | "Fitness"
  | "Beauty"
  | "Gaming"
  | "Education"
  | "Finance"
  | "Lifestyle"
  | "Entertainment"
  | "Health";
type Platform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Google";
type RequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "delivered"
  | "completed";

interface Influencer {
  id: string;
  full_name: string;
  email: string;
  niche: Niche;
  location?: string;
  follower_count: number;
  engagement_rate: number;
  rate_per_post: number;
  platforms: Platform[];
  bio?: string;
  portfolio_url?: string;
  status: string;
  [key: string]: any;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  [key: string]: any;
}

interface CollabRequest {
  id: string;
  campaign_id: string;
  campaign_name: string;
  influencer_id: string;
  influencer_name: string;
  influencer_email: string;
  message: string;
  agreed_rate: number;
  due_date: string | null;
  status: RequestStatus;
  deliverable_url?: string;
  deliverable_notes?: string;
  [key: string]: any;
}

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface InviteFormData {
  campaign_id: string;
  message: string;
  agreed_rate: string;
  due_date: string;
}

// Static data
const STATIC_INFLUENCERS: Influencer[] = [
  {
    id: "1",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    niche: "Fashion",
    location: "New York, NY",
    follower_count: 125000,
    engagement_rate: 4.8,
    rate_per_post: 850,
    platforms: ["Instagram", "TikTok"],
    bio: "Fashion enthusiast sharing style tips and sustainable fashion choices.",
    portfolio_url: "https://sarahjohnson.com",
    status: "approved",
  },
  {
    id: "2",
    full_name: "Mike Chen",
    email: "mike.chen@example.com",
    niche: "Technology",
    location: "San Francisco, CA",
    follower_count: 89000,
    engagement_rate: 5.2,
    rate_per_post: 1200,
    platforms: ["YouTube", "LinkedIn", "Instagram"],
    bio: "Tech reviewer and digital creator. Unboxing the latest gadgets.",
    portfolio_url: "https://mikechen.tech",
    status: "approved",
  },
  {
    id: "3",
    full_name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    niche: "Fitness",
    location: "Los Angeles, CA",
    follower_count: 234000,
    engagement_rate: 6.1,
    rate_per_post: 1500,
    platforms: ["Instagram", "TikTok", "YouTube"],
    bio: "Certified personal trainer helping you achieve your fitness goals.",
    portfolio_url: "https://emmafitness.com",
    status: "approved",
  },
  {
    id: "4",
    full_name: "David Kim",
    email: "david.kim@example.com",
    niche: "Food",
    location: "Chicago, IL",
    follower_count: 56700,
    engagement_rate: 3.9,
    rate_per_post: 600,
    platforms: ["Instagram", "YouTube"],
    bio: "Home chef sharing easy and delicious recipes.",
    portfolio_url: "https://davidkitchen.com",
    status: "approved",
  },
  {
    id: "5",
    full_name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    niche: "Travel",
    location: "Miami, FL",
    follower_count: 178000,
    engagement_rate: 5.5,
    rate_per_post: 1300,
    platforms: ["Instagram", "TikTok", "YouTube"],
    bio: "Travel blogger exploring hidden gems around the world.",
    portfolio_url: "https://lisatravels.com",
    status: "approved",
  },
];

const STATIC_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Launch Campaign",
    description: "Promoting our new summer product line",
    budget: 10000,
  },
  {
    id: "2",
    name: "Holiday Special",
    description: "Holiday season marketing push",
    budget: 15000,
  },
  {
    id: "3",
    name: "Brand Awareness Q1",
    description: "Increasing brand visibility",
    budget: 8000,
  },
  {
    id: "4",
    name: "Influencer Partnership",
    description: "Collaborating with top influencers",
    budget: 20000,
  },
];

// Store collaboration requests in memory
let collabRequests: CollabRequest[] = [
  {
    id: "1",
    campaign_id: "1",
    campaign_name: "Summer Launch Campaign",
    influencer_id: "1",
    influencer_name: "Sarah Johnson",
    influencer_email: "sarah.johnson@example.com",
    message: "Would love to collaborate on your summer campaign!",
    agreed_rate: 850,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "2",
    campaign_id: "2",
    campaign_name: "Holiday Special",
    influencer_id: "3",
    influencer_name: "Emma Rodriguez",
    influencer_email: "emma.rodriguez@example.com",
    message: "Great fit for our holiday campaign!",
    agreed_rate: 1500,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "accepted",
  },
];

const nicheColors: Record<Niche, string> = {
  Food: "bg-amber-500/10 text-amber-700",
  Travel: "bg-cyan-500/10 text-cyan-700",
  Technology: "bg-blue-500/10 text-blue-700",
  Fashion: "bg-rose-500/10 text-rose-700",
  Fitness: "bg-emerald-500/10 text-emerald-700",
  Beauty: "bg-pink-500/10 text-pink-700",
  Gaming: "bg-violet-500/10 text-violet-700",
  Education: "bg-orange-500/10 text-orange-700",
  Finance: "bg-green-500/10 text-green-700",
  Lifestyle: "bg-indigo-500/10 text-indigo-700",
  Entertainment: "bg-red-500/10 text-red-700",
  Health: "bg-teal-500/10 text-teal-700",
};

const statusConfig: Record<RequestStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-700",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-blue-500/10 text-blue-700",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    color: "bg-red-500/10 text-red-700",
    icon: XCircle,
  },
  delivered: {
    label: "Delivered",
    color: "bg-violet-500/10 text-violet-700",
    icon: PackageCheck,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500/10 text-emerald-700",
    icon: CheckCircle2,
  },
};

const platformIcons: Record<Platform, string> = {
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "▶️",
  LinkedIn: "🔷",
  Google: "🔍",
};

function formatFollowers(n: number | undefined | null): string {
  if (!n) return "—";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
}

export default function Influencers() {
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [requests, setRequests] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [nicheFilter, setNicheFilter] = useState<string>("all");

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    campaign_id: "",
    message: "",
    agreed_rate: "",
    due_date: "",
  });
  const [inviting, setInviting] = useState<boolean>(false);

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<CollabRequest | null>(
    null,
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [detailInfluencer, setDetailInfluencer] = useState<Influencer | null>(
    null,
  );

  const loadAll = async (): Promise<void> => {
    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setInfluencers(STATIC_INFLUENCERS);
    setCampaigns(STATIC_CAMPAIGNS);
    setRequests([...collabRequests]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const allNiches: string[] = [
    ...new Set(influencers.map((i) => i.niche).filter(Boolean)),
  ];

  const filtered = influencers.filter((inf) => {
    const matchSearch =
      !search ||
      inf.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      inf.niche?.toLowerCase().includes(search.toLowerCase());
    const matchNiche = nicheFilter === "all" || inf.niche === nicheFilter;
    return matchSearch && matchNiche;
  });

  const openInvite = (inf: Influencer): void => {
    setSelectedInfluencer(inf);
    setInviteForm({
      campaign_id: "",
      message: `Hi ${inf.full_name}, we'd love to collaborate with you on our upcoming campaign!`,
      agreed_rate: inf.rate_per_post?.toString() || "",
      due_date: "",
    });
    setInviteOpen(true);
  };

  const handleInvite = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setInviting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const campaign = campaigns.find((c) => c.id === inviteForm.campaign_id);
    const newRequest: CollabRequest = {
      id: Math.random().toString(36).substr(2, 9),
      campaign_id: inviteForm.campaign_id,
      campaign_name: campaign?.name || "",
      influencer_id: selectedInfluencer!.id,
      influencer_name: selectedInfluencer!.full_name,
      influencer_email: selectedInfluencer!.email,
      message: inviteForm.message,
      agreed_rate: parseFloat(inviteForm.agreed_rate) || 0,
      due_date: inviteForm.due_date
        ? new Date(inviteForm.due_date).toISOString()
        : null,
      status: "pending",
    };

    collabRequests.unshift(newRequest);
    setRequests([...collabRequests]);

    toast({
      title: "Invite sent!",
      description: `${selectedInfluencer!.full_name} has been invited.`,
    });

    setInviting(false);
    setInviteOpen(false);
  };

  const handleStatusChange = async (
    requestId: string,
    newStatus: RequestStatus,
  ): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = collabRequests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      collabRequests[index] = { ...collabRequests[index], status: newStatus };
      setRequests([...collabRequests]);
    }

    toast({ title: `Status updated to ${newStatus}` });
  };

  const openUpload = (req: CollabRequest): void => {
    setSelectedRequest(req);
    setUploadFile(null);
    setUploadNotes("");
    setUploadOpen(true);
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!uploadFile) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }

    setUploading(true);

    // Simulate file upload
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a fake file URL
    const fakeFileUrl = URL.createObjectURL(uploadFile);

    const index = collabRequests.findIndex((r) => r.id === selectedRequest!.id);
    if (index !== -1) {
      collabRequests[index] = {
        ...collabRequests[index],
        deliverable_url: fakeFileUrl,
        deliverable_notes: uploadNotes,
        status: "delivered",
      };
      setRequests([...collabRequests]);
    }

    toast({
      title: "Deliverable uploaded!",
      description: "Status updated to Delivered.",
    });

    setUploading(false);
    setUploadOpen(false);
  };

  if (loading) {
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
          Browse approved influencers, send invites & track collaborations
        </p>
      </div>

      <Tabs defaultValue="browse">
        <TabsList className="rounded-xl">
          <TabsTrigger value="browse" className="rounded-lg">
            <Users className="w-4 h-4 mr-1.5" /> Browse ({influencers.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg">
            <Send className="w-4 h-4 mr-1.5" /> My Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        {/* BROWSE TAB */}
        <TabsContent value="browse" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name or niche..."
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={nicheFilter} onValueChange={setNicheFilter}>
              <SelectTrigger className="rounded-xl w-44">
                <SelectValue placeholder="All Niches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                {allNiches.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No approved influencers found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((inf) => {
                const myRequests = requests.filter(
                  (r) => r.influencer_id === inf.id,
                );
                return (
                  <div
                    key={inf.id}
                    className="bg-card rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-heading font-bold text-primary text-lg shrink-0">
                        {inf.full_name?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold truncate">
                          {inf.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          {inf.location && (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>{inf.location}</span>
                            </>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs mt-1 ${nicheColors[inf.niche] || "bg-muted"}`}
                        >
                          {inf.niche}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-muted/50 rounded-lg py-2">
                        <p className="font-bold">
                          {formatFollowers(inf.follower_count)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Followers
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg py-2">
                        <p className="font-bold">
                          {inf.engagement_rate
                            ? `${inf.engagement_rate}%`
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Engagement
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg py-2">
                        <p className="font-bold">
                          {inf.rate_per_post ? `$${inf.rate_per_post}` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rate/Post
                        </p>
                      </div>
                    </div>

                    {inf.platforms?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {inf.platforms.map((p) => (
                          <span key={p} className="text-sm">
                            {platformIcons[p as Platform] || p}
                          </span>
                        ))}
                      </div>
                    )}

                    {myRequests.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {myRequests.length} active collab
                        {myRequests.length > 1 ? "s" : ""}
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl flex-1"
                        onClick={() => {
                          setDetailInfluencer(inf);
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        onClick={() => openInvite(inf)}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Invite
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* REQUESTS TAB */}
        <TabsContent value="requests" className="space-y-4 mt-4">
          {requests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No collaboration requests yet</p>
              <p className="text-sm mt-1">
                Invite an influencer from the Browse tab
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {requests.map((req) => {
                const sc = statusConfig[req.status];
                const StatusIcon = sc.icon;
                return (
                  <div
                    key={req.id}
                    className="bg-card rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold">
                          {req.influencer_name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${sc.color}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {sc.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Campaign:{" "}
                        <span className="text-foreground font-medium">
                          {req.campaign_name}
                        </span>
                      </p>
                      {req.agreed_rate > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <DollarSign className="w-3 h-3 inline" /> Agreed rate:
                          ${req.agreed_rate}
                        </p>
                      )}
                      {req.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(req.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {req.message && (
                        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() =>
                              handleStatusChange(req.id, "accepted")
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark
                            Accepted
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              handleStatusChange(req.id, "declined")
                            }
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Declined
                          </Button>
                        </>
                      )}
                      {req.status === "accepted" && (
                        <Button
                          size="sm"
                          className="rounded-xl bg-gradient-to-r from-violet-500 to-primary hover:opacity-90"
                          onClick={() => openUpload(req)}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" /> Upload
                          Deliverable
                        </Button>
                      )}
                      {req.status === "delivered" && (
                        <>
                          <a
                            href={req.deliverable_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                            >
                              <Paperclip className="w-3.5 h-3.5 mr-1" /> View
                              File
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                            onClick={() =>
                              handleStatusChange(req.id, "completed")
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark
                            Complete
                          </Button>
                        </>
                      )}
                      {req.status === "completed" && req.deliverable_url && (
                        <a
                          href={req.deliverable_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                          >
                            <Paperclip className="w-3.5 h-3.5 mr-1" /> View
                            Deliverable
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* INVITE DIALOG */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Invite {selectedInfluencer?.full_name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Select Campaign *</Label>
              <Select
                required
                value={inviteForm.campaign_id}
                onValueChange={(v: string) =>
                  setInviteForm((p) => ({ ...p, campaign_id: v }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Agreed Rate ($)</Label>
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
                  placeholder="0"
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
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Write your invite message..."
              />
            </div>
            <Button
              type="submit"
              disabled={inviting || !inviteForm.campaign_id}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {inviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* UPLOAD DIALOG */}
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
                Collaboration with{" "}
                <strong className="text-foreground">
                  {selectedRequest?.influencer_name}
                </strong>
              </p>
              <p className="text-muted-foreground">
                Campaign:{" "}
                <strong className="text-foreground">
                  {selectedRequest?.campaign_name}
                </strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Upload File *</Label>
              <div
                className="border-2 border-dashed border-muted rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() =>
                  document.getElementById("deliverable-upload")?.click()
                }
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                {uploadFile ? (
                  <p className="text-sm font-medium">{uploadFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click to select file
                    <br />
                    <span className="text-xs">
                      Images, videos, PDFs supported
                    </span>
                  </p>
                )}
              </div>
              <input
                id="deliverable-upload"
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUploadFile(e.target.files?.[0] || null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <textarea
                value={uploadNotes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setUploadNotes(e.target.value)
                }
                rows={2}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Any notes about this deliverable..."
              />
            </div>
            <Button
              type="submit"
              disabled={uploading || !uploadFile}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-primary hover:opacity-90"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Mark Delivered
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {detailInfluencer?.full_name}
            </DialogTitle>
          </DialogHeader>
          {detailInfluencer && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-heading font-bold text-primary text-2xl">
                  {detailInfluencer.full_name?.[0]}
                </div>
                <div>
                  <Badge
                    variant="secondary"
                    className={`${nicheColors[detailInfluencer.niche] || "bg-muted"}`}
                  >
                    {detailInfluencer.niche}
                  </Badge>
                  {detailInfluencer.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {detailInfluencer.location}
                    </p>
                  )}
                  {detailInfluencer.email && (
                    <p className="text-sm text-muted-foreground">
                      {detailInfluencer.email}
                    </p>
                  )}
                </div>
              </div>
              {detailInfluencer.bio && (
                <p className="text-sm text-muted-foreground border-t pt-3">
                  {detailInfluencer.bio}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="font-bold">
                    {formatFollowers(detailInfluencer.follower_count)}
                  </p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="font-bold">
                    {detailInfluencer.engagement_rate
                      ? `${detailInfluencer.engagement_rate}%`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="font-bold">
                    {detailInfluencer.rate_per_post
                      ? `$${detailInfluencer.rate_per_post}`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Rate/Post</p>
                </div>
              </div>
              {detailInfluencer.platforms?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {detailInfluencer.platforms.map((p) => (
                    <span
                      key={p}
                      className="bg-muted px-2 py-1 rounded-lg text-xs font-medium"
                    >
                      {platformIcons[p as Platform]} {p}
                    </span>
                  ))}
                </div>
              )}
              {detailInfluencer.portfolio_url && (
                <a
                  href={detailInfluencer.portfolio_url}
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
                  openInvite(detailInfluencer);
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
