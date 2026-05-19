import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CampaignsAPI } from "@/lib/api";
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
import { useToast } from "@/components/ui/use-toast";

type CampaignStatus = "draft" | "active" | "paused" | "completed";
type Platform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Google";

interface CampaignFormData {
  name: string;
  platform: Platform | "";
  status: CampaignStatus;
  budget: string;
  start_date: string;
  end_date: string;
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

const EMPTY_FORM: CampaignFormData = {
  name: "",
  platform: "",
  status: "draft",
  budget: "",
  start_date: "",
  end_date: "",
};

function CampaignActionsMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-xl"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[140px] rounded-lg border bg-popover p-1 shadow-md">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function Campaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormData>(EMPTY_FORM);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", search],
    queryFn: () =>
      CampaignsAPI.list({ search: search || undefined, per_page: 50 }).then(
        (r: any) => r.data,
      ),
    staleTime: 30_000,
  });
  const campaigns: any[] = data ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });

  const createMutation = useMutation({
    mutationFn: (body: any) => CampaignsAPI.create(body),
    onSuccess: () => {
      toast({ title: "Campaign created!" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      CampaignsAPI.update(id, body),
    onSuccess: () => {
      toast({ title: "Campaign updated!" });
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
    mutationFn: (id: string) => CampaignsAPI.delete(id),
    onSuccess: () => {
      toast({ title: "Campaign deleted" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      platform: form.platform,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, body: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      platform: c.platform,
      status: c.status,
      budget: String(c.budget ?? ""),
      start_date: c.start_date ? c.start_date.slice(0, 10) : "",
      end_date: c.end_date ? c.end_date.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
            Campaigns
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your social media campaigns
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
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
                {editingId ? "Edit Campaign" : "Create Campaign"}
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
                  placeholder="e.g. Summer Launch"
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
                          {platformIcons[p]} {p}
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
              <div className="space-y-2">
                <Label>Budget (£)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, budget: e.target.value }))
                  }
                  className="rounded-xl"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, start_date: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm((p) => ({ ...p, end_date: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : editingId ? (
                  "Update Campaign"
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search campaigns…"
          className="pl-10 rounded-xl"
        />
      </div>

      {/* List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No campaigns yet</p>
          <p className="text-sm mt-1">
            Create your first campaign to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c: any) => (
            <div
              key={c.id}
              className="bg-card rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {platformIcons[c.platform as Platform] ?? "📊"}
                  </span>
                  <h3 className="font-heading font-bold truncate">{c.name}</h3>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${statusColors[c.status as CampaignStatus]}`}
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.platform}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold">
                    £{(c.budget ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Budget</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">
                    £{(c.spend ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Spend</p>
                </div>
                <CampaignActionsMenu
                  onEdit={() => handleEdit(c)}
                  onDelete={() => deleteMutation.mutate(c.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
