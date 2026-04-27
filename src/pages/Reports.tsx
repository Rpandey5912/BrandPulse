import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

interface Report {
  id: string;
  title: string;
  period_start: string;
  period_end: string;
  summary: string;
  total_revenue: number;
  total_leads: number;
  total_spend: number;
  roi_percentage: number;
  cost_per_lead: number;
  impressions: number;
  conversions: number;
  status: "draft" | "published";
  created_date: string;
}

// Static data
const STATIC_REPORTS: Report[] = [
  {
    id: "1",
    title: "January 2026 Performance Report",
    period_start: "2026-01-01",
    period_end: "2026-01-31",
    summary: "Strong start to the year with excellent engagement metrics.",
    total_revenue: 45200,
    total_leads: 1250,
    total_spend: 12300,
    roi_percentage: 267.5,
    cost_per_lead: 9.84,
    impressions: 450000,
    conversions: 890,
    status: "published",
    created_date: "2026-02-01T10:00:00Z",
  },
  {
    id: "2",
    title: "February 2026 Performance Report",
    period_start: "2026-02-01",
    period_end: "2026-02-28",
    summary: "Continued growth with improved ROI from influencer campaigns.",
    total_revenue: 56700,
    total_leads: 1890,
    total_spend: 14500,
    roi_percentage: 291.0,
    cost_per_lead: 7.67,
    impressions: 580000,
    conversions: 1230,
    status: "published",
    created_date: "2026-03-01T10:00:00Z",
  },
  {
    id: "3",
    title: "March 2026 Performance Report",
    period_start: "2026-03-01",
    period_end: "2026-03-31",
    summary: "Record-breaking month with highest revenue to date.",
    total_revenue: 78400,
    total_leads: 2450,
    total_spend: 18900,
    roi_percentage: 314.8,
    cost_per_lead: 7.71,
    impressions: 720000,
    conversions: 1670,
    status: "draft",
    created_date: "2026-04-01T10:00:00Z",
  },
];

// Store reports in memory (simulating database)
let reportsStore: Report[] = [...STATIC_REPORTS];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    period_start: "",
    period_end: "",
    summary: "",
    total_revenue: "",
    total_leads: "",
    total_spend: "",
    roi_percentage: "",
    cost_per_lead: "",
    impressions: "",
    conversions: "",
  });

  const loadReports = async () => {
    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReports([...reportsStore]);
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      title: form.title,
      period_start: form.period_start,
      period_end: form.period_end,
      summary: form.summary,
      total_revenue: parseFloat(form.total_revenue) || 0,
      total_leads: parseInt(form.total_leads) || 0,
      total_spend: parseFloat(form.total_spend) || 0,
      roi_percentage: parseFloat(form.roi_percentage) || 0,
      cost_per_lead: parseFloat(form.cost_per_lead) || 0,
      impressions: parseInt(form.impressions) || 0,
      conversions: parseInt(form.conversions) || 0,
      status: "draft",
      created_date: new Date().toISOString(),
    };

    reportsStore.unshift(newReport);
    setReports([...reportsStore]);

    toast({ title: "Report created!" });
    setDialogOpen(false);
    setForm({
      title: "",
      period_start: "",
      period_end: "",
      summary: "",
      total_revenue: "",
      total_leads: "",
      total_spend: "",
      roi_percentage: "",
      cost_per_lead: "",
      impressions: "",
      conversions: "",
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monthly performance reports
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Create Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Report Title *</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="March 2026 Performance Report"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start *</Label>
                  <Input
                    required
                    type="date"
                    value={form.period_start}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, period_start: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period End *</Label>
                  <Input
                    required
                    type="date"
                    value={form.period_end}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, period_end: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Revenue ($)</Label>
                  <Input
                    type="number"
                    value={form.total_revenue}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, total_revenue: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Leads</Label>
                  <Input
                    type="number"
                    value={form.total_leads}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, total_leads: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Spend ($)</Label>
                  <Input
                    type="number"
                    value={form.total_spend}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, total_spend: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ROI (%)</Label>
                  <Input
                    type="number"
                    value={form.roi_percentage}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, roi_percentage: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Per Lead ($)</Label>
                  <Input
                    type="number"
                    value={form.cost_per_lead}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, cost_per_lead: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impressions</Label>
                  <Input
                    type="number"
                    value={form.impressions}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, impressions: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conversions</Label>
                <Input
                  type="number"
                  value={form.conversions}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, conversions: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, summary: e.target.value }))
                  }
                  placeholder="Performance highlights..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Create Report
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No reports yet</p>
          <p className="text-sm mt-1">Create your first monthly report.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-card rounded-2xl border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <Badge
                  variant="secondary"
                  className={
                    report.status === "published"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }
                >
                  {report.status}
                </Badge>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold mb-1">{report.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {moment(report.period_start).format("MMM D")} -{" "}
                {moment(report.period_end).format("MMM D, YYYY")}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Revenue</p>
                  <p className="font-bold">
                    ${(report.total_revenue || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Leads</p>
                  <p className="font-bold">
                    {(report.total_leads || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ROI</p>
                  <p className="font-bold">{report.roi_percentage || 0}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Spend</p>
                  <p className="font-bold">
                    ${(report.total_spend || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {report.summary && (
                <p className="text-xs text-muted-foreground mt-4 line-clamp-2">
                  {report.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Optional: Display debug info in development */}
      {import.meta.env.DEV && reports.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground text-center">
          <p>
            Total reports: {reports.length} • Reports are stored in memory and
            will reset on page refresh.
          </p>
        </div>
      )}
    </div>
  );
}
