import { useState, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

type CampaignStatus = "draft" | "active" | "paused" | "completed";
type Platform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Google";

interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  budget: number;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
}

interface CampaignFormData {
  name: string;
  platform: Platform | "";
  status: CampaignStatus;
  budget: string;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  leads: string;
  conversions: string;
  revenue: string;
}

const platforms: Platform[] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "LinkedIn",
  "Google",
];
const statuses: CampaignStatus[] = ["draft", "active", "paused", "completed"];

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-emerald-500/10 text-emerald-600",
  paused: "bg-amber-500/10 text-amber-600",
  completed: "bg-blue-500/10 text-blue-600",
};

const platformIcons: Record<Platform, string> = {
  Instagram: "🔴",
  TikTok: "🎵",
  YouTube: "▶️",
  LinkedIn: "🔷",
  Google: "🔍",
};

// Static demo data
const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Brand Awareness",
    platform: "Instagram",
    status: "active",
    budget: 5000,
    spend: 3250,
    impressions: 125000,
    reach: 98000,
    clicks: 4500,
    leads: 380,
    conversions: 95,
    revenue: 12500,
  },
  {
    id: "2",
    name: "TikTok Viral Challenge",
    platform: "TikTok",
    status: "active",
    budget: 8000,
    spend: 6200,
    impressions: 250000,
    reach: 210000,
    clicks: 8900,
    leads: 520,
    conversions: 145,
    revenue: 18000,
  },
  {
    id: "3",
    name: "LinkedIn B2B Outreach",
    platform: "LinkedIn",
    status: "paused",
    budget: 3000,
    spend: 1800,
    impressions: 45000,
    reach: 32000,
    clicks: 1200,
    leads: 290,
    conversions: 42,
    revenue: 22000,
  },
  {
    id: "4",
    name: "YouTube Product Reviews",
    platform: "YouTube",
    status: "completed",
    budget: 10000,
    spend: 9800,
    impressions: 180000,
    reach: 145000,
    clicks: 5200,
    leads: 410,
    conversions: 128,
    revenue: 28000,
  },
  {
    id: "5",
    name: "Google Ads Q1",
    platform: "Google",
    status: "active",
    budget: 12000,
    spend: 11500,
    impressions: 320000,
    reach: 280000,
    clicks: 15400,
    leads: 680,
    conversions: 210,
    revenue: 35000,
  },
  {
    id: "6",
    name: "Holiday Special Campaign",
    platform: "Instagram",
    status: "draft",
    budget: 4000,
    spend: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    leads: 0,
    conversions: 0,
    revenue: 0,
  },
];

export default function Campaigns() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [loading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [form, setForm] = useState<CampaignFormData>({
    name: "",
    platform: "",
    status: "draft",
    budget: "",
    spend: "",
    impressions: "",
    reach: "",
    clicks: "",
    leads: "",
    conversions: "",
    revenue: "",
  });

  const resetForm = (): void => {
    setForm({
      name: "",
      platform: "",
      status: "draft",
      budget: "",
      spend: "",
      impressions: "",
      reach: "",
      clicks: "",
      leads: "",
      conversions: "",
      revenue: "",
    });
    setEditingCampaign(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const payload: Omit<Campaign, "id"> = {
      name: form.name,
      platform: form.platform as Platform,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      spend: parseFloat(form.spend) || 0,
      impressions: parseInt(form.impressions) || 0,
      reach: parseInt(form.reach) || 0,
      clicks: parseInt(form.clicks) || 0,
      leads: parseInt(form.leads) || 0,
      conversions: parseInt(form.conversions) || 0,
      revenue: parseFloat(form.revenue) || 0,
    };

    if (editingCampaign) {
      // Update existing campaign
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === editingCampaign.id ? { ...c, ...payload } : c,
        ),
      );
      toast({ title: "Campaign updated!" });
    } else {
      // Create new campaign
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        ...payload,
      };
      setCampaigns((prev) => [newCampaign, ...prev]);
      toast({ title: "Campaign created!" });
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (campaign: Campaign): void => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      budget: String(campaign.budget || ""),
      spend: String(campaign.spend || ""),
      impressions: String(campaign.impressions || ""),
      reach: String(campaign.reach || ""),
      clicks: String(campaign.clicks || ""),
      leads: String(campaign.leads || ""),
      conversions: String(campaign.conversions || ""),
      revenue: String(campaign.revenue || ""),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Campaign deleted" });
  };

  const filtered = campaigns.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            Campaigns
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your social media campaigns
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o: boolean) => {
            setDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingCampaign ? "Edit Campaign" : "Create Campaign"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform *</Label>
                  <Select
                    required
                    value={form.platform}
                    onValueChange={(v: Platform) =>
                      setForm((p) => ({ ...p, platform: v }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: CampaignStatus) =>
                      setForm((p) => ({ ...p, status: v }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget ($)</Label>
                  <Input
                    type="number"
                    value={form.budget}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, budget: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Spend ($)</Label>
                  <Input
                    type="number"
                    value={form.spend}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, spend: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Impressions</Label>
                  <Input
                    type="number"
                    value={form.impressions}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, impressions: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reach</Label>
                  <Input
                    type="number"
                    value={form.reach}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, reach: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clicks</Label>
                  <Input
                    type="number"
                    value={form.clicks}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, clicks: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Leads</Label>
                  <Input
                    type="number"
                    value={form.leads}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, leads: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conversions</Label>
                  <Input
                    type="number"
                    value={form.conversions}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, conversions: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Revenue ($)</Label>
                  <Input
                    type="number"
                    value={form.revenue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, revenue: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {editingCampaign ? "Update Campaign" : "Create Campaign"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search campaigns..."
          className="pl-10 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No campaigns yet</p>
          <p className="text-sm mt-1">
            Create your first campaign to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-card rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {platformIcons[campaign.platform] || "📊"}
                  </span>
                  <h3 className="font-heading font-bold truncate">
                    {campaign.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${statusColors[campaign.status]}`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {campaign.platform}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold">
                    ${(campaign.revenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">
                    {(campaign.leads || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">
                    {(campaign.impressions || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
