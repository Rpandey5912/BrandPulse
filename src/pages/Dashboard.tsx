import { useState, useEffect } from "react";
import { DollarSign, Users, TrendingUp, Target, Megaphone } from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import RevenueChart from "../components/dashboard/RevenueChart";
import FunnelChart from "../components/dashboard/FunnelChart";
import PlatformBreakdown from "../components/dashboard/PlatformBreakdown";

interface Campaign {
  id: string;
  name: string;
  revenue?: number;
  leads?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  reach?: number;
  platform?: string;
  status?: string;
  [key: string]: any;
}

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

// Static campaign data
const STATIC_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Launch Campaign",
    revenue: 12500,
    leads: 450,
    spend: 3200,
    impressions: 125000,
    clicks: 4200,
    conversions: 125,
    reach: 45000,
    platform: "Instagram",
    status: "active",
  },
  {
    id: "2",
    name: "Influencer Partnership - Q1",
    revenue: 8900,
    leads: 320,
    spend: 2800,
    impressions: 98000,
    clicks: 3100,
    conversions: 98,
    reach: 32000,
    platform: "TikTok",
    status: "active",
  },
  {
    id: "3",
    name: "Holiday Special",
    revenue: 15400,
    leads: 580,
    spend: 4100,
    impressions: 156000,
    clicks: 5200,
    conversions: 156,
    reach: 55000,
    platform: "Instagram",
    status: "completed",
  },
  {
    id: "4",
    name: "Brand Awareness Week",
    revenue: 3200,
    leads: 120,
    spend: 1800,
    impressions: 89000,
    clicks: 2100,
    conversions: 45,
    reach: 28000,
    platform: "Facebook",
    status: "active",
  },
  {
    id: "5",
    name: "Product Launch - Spring",
    revenue: 9800,
    leads: 420,
    spend: 3000,
    impressions: 112000,
    clicks: 3800,
    conversions: 112,
    reach: 38000,
    platform: "YouTube",
    status: "active",
  },
  {
    id: "6",
    name: "Retargeting Campaign",
    revenue: 5600,
    leads: 210,
    spend: 1500,
    impressions: 45000,
    clicks: 1800,
    conversions: 58,
    reach: 15000,
    platform: "Google",
    status: "completed",
  },
  {
    id: "7",
    name: "Influencer Collab - Summer",
    revenue: 11200,
    leads: 380,
    spend: 3500,
    impressions: 134000,
    clicks: 4500,
    conversions: 134,
    reach: 48000,
    platform: "Instagram",
    status: "active",
  },
  {
    id: "8",
    name: "Flash Sale Campaign",
    revenue: 8900,
    leads: 290,
    spend: 2200,
    impressions: 67000,
    clicks: 2900,
    conversions: 78,
    reach: 22000,
    platform: "TikTok",
    status: "completed",
  },
];

// Static funnel data (used as fallback if campaign data is insufficient)
const DEFAULT_FUNNEL_STAGES: FunnelStage[] = [
  { label: "Impressions", value: 24500, color: "bg-blue-500" },
  { label: "Reach", value: 18200, color: "bg-violet-500" },
  { label: "Clicks", value: 8400, color: "bg-amber-500" },
  { label: "Leads", value: 1847, color: "bg-emerald-500" },
  { label: "Conversions", value: 523, color: "bg-primary" },
];

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      // Simulate API loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCampaigns(STATIC_CAMPAIGNS);
      setLoading(false);
    };
    loadData();
  }, []);

  const totalRevenue: number = campaigns.reduce(
    (sum, c) => sum + (c.revenue || 0),
    0,
  );
  const totalLeads: number = campaigns.reduce(
    (sum, c) => sum + (c.leads || 0),
    0,
  );
  const totalSpend: number = campaigns.reduce(
    (sum, c) => sum + (c.spend || 0),
    0,
  );
  const roi: string =
    totalSpend > 0
      ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1)
      : "0";
  const costPerLead: string =
    totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0";
  const totalImpressions: number = campaigns.reduce(
    (sum, c) => sum + (c.impressions || 0),
    0,
  );
  const totalClicks: number = campaigns.reduce(
    (sum, c) => sum + (c.clicks || 0),
    0,
  );
  const totalConversions: number = campaigns.reduce(
    (sum, c) => sum + (c.conversions || 0),
    0,
  );
  const totalReach: number = campaigns.reduce(
    (sum, c) => sum + (c.reach || 0),
    0,
  );

  // Use actual data from campaigns, fallback to default values if no data
  const funnelStages: FunnelStage[] =
    campaigns.length > 0
      ? [
          {
            label: "Impressions",
            value: totalImpressions || DEFAULT_FUNNEL_STAGES[0].value,
            color: "bg-blue-500",
          },
          {
            label: "Reach",
            value: totalReach || DEFAULT_FUNNEL_STAGES[1].value,
            color: "bg-violet-500",
          },
          {
            label: "Clicks",
            value: totalClicks || DEFAULT_FUNNEL_STAGES[2].value,
            color: "bg-amber-500",
          },
          {
            label: "Leads",
            value: totalLeads || DEFAULT_FUNNEL_STAGES[3].value,
            color: "bg-emerald-500",
          },
          {
            label: "Conversions",
            value: totalConversions || DEFAULT_FUNNEL_STAGES[4].value,
            color: "bg-primary",
          },
        ]
      : DEFAULT_FUNNEL_STAGES;

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
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your brand performance at a glance
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Revenue"
          value={`$${(totalRevenue || 48200).toLocaleString()}`}
          change={24.3}
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-500/10"
        />
        <KPICard
          title="Leads"
          value={(totalLeads || 1847).toLocaleString()}
          change={18.2}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-500/10"
        />
        <KPICard
          title="ROI"
          value={`${roi || 342}%`}
          change={12.1}
          icon={TrendingUp}
          color="text-violet-600"
          bg="bg-violet-500/10"
        />
        <KPICard
          title="Cost/Lead"
          value={`$${costPerLead || "12.40"}`}
          change={-8.3}
          icon={Target}
          color="text-amber-600"
          bg="bg-amber-500/10"
        />
        <KPICard
          title="Campaigns"
          value={campaigns.length || 12}
          icon={Megaphone}
          color="text-cyan-600"
          bg="bg-cyan-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <PlatformBreakdown />
      </div>

      <FunnelChart stages={funnelStages} />
    </div>
  );
}
