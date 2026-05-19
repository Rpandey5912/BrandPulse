import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Download,
} from "lucide-react";
import moment from "moment";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState(
    moment().startOf("month").format("YYYY-MM-DD"),
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: ["reports-summary", dateFrom, dateTo],
    queryFn: () =>
      ReportsAPI.summary({ date_from: dateFrom, date_to: dateTo }).then(
        (r: any) => r.data,
      ),
    staleTime: 60_000,
  });

  const { data: campaignReport, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["reports-campaigns", dateFrom, dateTo],
    queryFn: () =>
      ReportsAPI.campaigns({ date_from: dateFrom, date_to: dateTo }).then(
        (r: any) => r.data,
      ),
    staleTime: 60_000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["reports-revenue"],
    queryFn: () => ReportsAPI.revenue({ months: 6 }).then((r: any) => r.data),
    staleTime: 60_000,
  });

  const isLoading = loadingSummary || loadingCampaigns;
  const summary = summaryData ?? {};
  const campaigns: any[] = campaignReport ?? [];
  const revenue: any[] = revenueData ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fmt = (n: number) => (n ?? 0).toLocaleString();
  const fmtGbp = (n: number) => `£${(n ?? 0).toLocaleString()}`;
  const roi =
    summary.total_revenue && summary.total_spend
      ? (
          ((summary.total_revenue - summary.total_spend) /
            summary.total_spend) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="p-6 lg:p-8 space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Analytics and performance overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl w-36 text-sm"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl w-36 text-sm"
          />
        </div>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: fmtGbp(summary.total_revenue),
            icon: DollarSign,
            color: "text-emerald-600",
          },
          {
            label: "Total Leads",
            value: fmt(summary.total_leads),
            icon: Users,
            color: "text-blue-600",
          },
          {
            label: "Impressions",
            value: fmt(summary.total_impressions),
            icon: Eye,
            color: "text-violet-600",
          },
          {
            label: "ROI",
            value: `${roi}%`,
            icon: TrendingUp,
            color: "text-amber-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-card rounded-2xl border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-heading font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      {/* Additional metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Conversions", value: fmt(summary.total_conversions) },
          { label: "CTR", value: `${summary.ctr ?? 0}%` },
          {
            label: "Conversion Rate",
            value: `${summary.conversion_rate ?? 0}%`,
          },
          { label: "Net Revenue", value: fmtGbp(summary.net_revenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-heading font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      {revenue.length > 0 && (
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="font-heading font-bold text-lg mb-4">
            6-Month Revenue Trend
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Spend</th>
                  <th className="pb-2 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {revenue.map((r: any) => (
                  <tr key={r.month} className="border-b last:border-0">
                    <td className="py-3 font-medium">
                      {moment(r.month + "-01").format("MMM YYYY")}
                    </td>
                    <td className="py-3">{fmtGbp(r.revenue)}</td>
                    <td className="py-3">{fmtGbp(r.spend)}</td>
                    <td
                      className={`py-3 font-medium ${r.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {fmtGbp(r.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign breakdown */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">
            Campaign Performance
          </h2>
          <Badge variant="secondary" className="text-xs">
            {campaigns.length} campaigns
          </Badge>
        </div>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No campaign data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium">Platform</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Impressions</th>
                  <th className="pb-2 font-medium">Leads</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 font-medium max-w-[180px] truncate">
                      {c.name}
                    </td>
                    <td className="py-3 text-muted-foreground">{c.platform}</td>
                    <td className="py-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs capitalize ${
                          c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : c.status === "completed"
                              ? "bg-blue-500/10 text-blue-600"
                              : c.status === "paused"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3">{fmt(c.impressions)}</td>
                    <td className="py-3">{fmt(c.leads)}</td>
                    <td className="py-3 font-medium">{fmtGbp(c.revenue)}</td>
                    <td className="py-3">{c.roas ? `${c.roas}x` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
