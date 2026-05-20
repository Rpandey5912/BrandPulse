import { useQuery } from "@tanstack/react-query";
import { AdminAPI, ReportsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Users, DollarSign, BarChart3, Activity } from "lucide-react";

export default function AdminReports() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["admin-reports-overview"],
    queryFn: () => AdminAPI.overview().then((r: any) => r),
    staleTime: 60_000,
  });

  const { data: campaignReport, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["admin-reports-campaigns"],
    queryFn: () => ReportsAPI.campaigns().then((r: any) => r),
    staleTime: 60_000,
  });

  const { data: influencerReport, isLoading: loadingInfluencers } = useQuery({
    queryKey: ["admin-reports-influencers"],
    queryFn: () => ReportsAPI.influencers().then((r: any) => r),
    staleTime: 60_000,
  });

  const { data: revenueReport, isLoading: loadingRevenue } = useQuery({
    queryKey: ["admin-reports-revenue"],
    queryFn: () => ReportsAPI.revenue({ months: 6 }).then((r: any) => r),
    staleTime: 60_000,
  });

  const isLoading = loadingOverview || loadingCampaigns || loadingInfluencers || loadingRevenue;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Normalise shapes — backend may wrap in .data or return flat
  const ov: any = overview ?? {};
  const campaigns: any[] = (campaignReport as any)?.data ?? (campaignReport as any)?.campaigns ?? [];
  const influencers: any[] = (influencerReport as any)?.data ?? (influencerReport as any)?.influencers ?? [];
  const revenue: any[] = (revenueReport as any)?.data ?? (revenueReport as any)?.months ?? [];

  const kpis = [
    {
      label: "Total Revenue",
      value: `$${((ov.total_revenue ?? 0) as number).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Clients",
      value: ov.total_clients ?? ov.clients ?? "—",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active Campaigns",
      value: ov.active_campaigns ?? ov.campaigns ?? "—",
      icon: Activity,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Total Influencers",
      value: ov.total_influencers ?? ov.influencers ?? "—",
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Avg ROI",
      value: ov.avg_roi != null ? `${ov.avg_roi}%` : "—",
      icon: BarChart3,
      color: "text-pink-600 bg-pink-50",
    },
    {
      label: "Total Leads",
      value: ((ov.total_leads ?? 0) as number).toLocaleString(),
      icon: FileText,
      color: "text-cyan-600 bg-cyan-50",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          All Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card rounded-2xl border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
              <k.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campaign Report */}
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-heading font-bold">Campaign Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{campaigns.length} campaigns tracked</p>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No campaign data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Campaign</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Leads</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">ROI</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 8).map((c: any) => (
                    <tr key={c.id ?? c.name} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3 font-medium truncate max-w-[150px]">{c.name ?? "—"}</td>
                      <td className="px-5 py-3 text-right">${((c.revenue ?? c.total_revenue ?? 0) as number).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">{((c.leads ?? c.total_leads ?? 0) as number).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">{c.roi ?? c.roi_percentage ?? "—"}{c.roi || c.roi_percentage ? "%" : ""}</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant="secondary" className={`text-xs ${
                          c.status === "active" ? "bg-emerald-500/10 text-emerald-600"
                          : c.status === "completed" ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {c.status ?? "—"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Influencer Report */}
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-heading font-bold">Top Influencers</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{influencers.length} influencers</p>
          </div>
          {influencers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No influencer data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Followers</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Engagement</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Collabs</th>
                  </tr>
                </thead>
                <tbody>
                  {influencers.slice(0, 8).map((inf: any) => (
                    <tr key={inf.id ?? inf.full_name} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3">
                        <p className="font-medium truncate max-w-[140px]">{inf.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{inf.niche ?? ""}</p>
                      </td>
                      <td className="px-5 py-3 text-right text-xs">
                        {inf.follower_count >= 1_000_000
                          ? `${(inf.follower_count / 1_000_000).toFixed(1)}M`
                          : inf.follower_count >= 1_000
                          ? `${(inf.follower_count / 1_000).toFixed(0)}K`
                          : inf.follower_count ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right">{inf.engagement_rate ?? "—"}{inf.engagement_rate != null ? "%" : ""}</td>
                      <td className="px-5 py-3 text-right">{inf.collab_requests_count ?? inf.collabs ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Month */}
      {revenue.length > 0 && (
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-heading font-bold">Revenue by Month</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Month</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Subscriptions</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">New Clients</th>
                </tr>
              </thead>
              <tbody>
                {revenue.map((r: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium">{r.month ?? r.period ?? `Month ${i + 1}`}</td>
                    <td className="px-5 py-3 text-right">${((r.revenue ?? r.total_revenue ?? 0) as number).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">{r.subscriptions ?? r.active_subscriptions ?? "—"}</td>
                    <td className="px-5 py-3 text-right">{r.new_clients ?? r.clients ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
