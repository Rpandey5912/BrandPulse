import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Megaphone,
  FileText,
  CreditCard,
  Settings,
  X,
  ChevronDown,
  Check,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KPICard from "../components/dashboard/KPICard";
import RevenueChart from "../components/dashboard/RevenueChart";
import FunnelChart from "../components/dashboard/FunnelChart";
import PlatformBreakdown from "../components/dashboard/PlatformBreakdown";

const MegaphoneIcon = Megaphone;

type CampaignStatus = "active" | "paused" | "completed";
type PlanType = "Gold" | "Platinum" | "Silver";

interface KPIData {
  revenue: number;
  leads: number;
  roi: number;
  costPerLead: number;
  campaigns: number;
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  leads: number;
  spend: number;
}

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface PlatformData {
  name: string;
  value: number;
}

interface Campaign {
  name: string;
  platform: string;
  status: CampaignStatus;
  revenue: number;
  leads: number;
  impressions: number;
}

interface Client {
  id: string;
  company_name: string;
  industry: string;
  plan: PlanType;
  color: string;
  kpis: KPIData;
  revenueData: RevenueDataPoint[];
  funnel: FunnelStage[];
  platforms: PlatformData[];
  campaigns: Campaign[];
}

interface NavLink {
  label: string;
  icon: LucideIcon;
}

const DEMO_CLIENTS: Client[] = [
  {
    id: "1",
    company_name: "TechVenture Labs",
    industry: "Technology",
    plan: "Gold",
    color: "from-amber-500 to-yellow-500",
    kpis: {
      revenue: 48200,
      leads: 1847,
      roi: 342,
      costPerLead: 12.4,
      campaigns: 5,
    },
    revenueData: [
      { month: "Oct", revenue: 28000, leads: 890, spend: 8200 },
      { month: "Nov", revenue: 32000, leads: 1100, spend: 9100 },
      { month: "Dec", revenue: 38000, leads: 1350, spend: 9800 },
      { month: "Jan", revenue: 41000, leads: 1520, spend: 10500 },
      { month: "Feb", revenue: 44500, leads: 1700, spend: 11000 },
      { month: "Mar", revenue: 48200, leads: 1847, spend: 11600 },
    ],
    funnel: [
      { label: "Impressions", value: 920000, color: "bg-blue-500" },
      { label: "Reach", value: 680000, color: "bg-violet-500" },
      { label: "Clicks", value: 33800, color: "bg-amber-500" },
      { label: "Leads", value: 1847, color: "bg-emerald-500" },
      { label: "Conversions", value: 555, color: "bg-primary" },
    ],
    platforms: [
      { name: "Instagram", value: 35 },
      { name: "TikTok", value: 28 },
      { name: "YouTube", value: 20 },
      { name: "LinkedIn", value: 12 },
      { name: "Google", value: 5 },
    ],
    campaigns: [
      {
        name: "Summer Brand Awareness",
        platform: "Instagram",
        status: "active",
        revenue: 12500,
        leads: 380,
        impressions: 125000,
      },
      {
        name: "TikTok Viral Challenge",
        platform: "TikTok",
        status: "active",
        revenue: 18000,
        leads: 520,
        impressions: 250000,
      },
      {
        name: "LinkedIn B2B Outreach",
        platform: "LinkedIn",
        status: "active",
        revenue: 22000,
        leads: 290,
        impressions: 45000,
      },
      {
        name: "YouTube Product Reviews",
        platform: "YouTube",
        status: "completed",
        revenue: 28000,
        leads: 410,
        impressions: 180000,
      },
      {
        name: "Google Ads Q1",
        platform: "Google",
        status: "active",
        revenue: 35000,
        leads: 680,
        impressions: 320000,
      },
    ],
  },
  {
    id: "2",
    company_name: "StyleHouse Co",
    industry: "Fashion",
    plan: "Platinum",
    color: "from-violet-500 to-purple-600",
    kpis: {
      revenue: 92500,
      leads: 3420,
      roi: 415,
      costPerLead: 9.8,
      campaigns: 8,
    },
    revenueData: [
      { month: "Oct", revenue: 55000, leads: 1800, spend: 14000 },
      { month: "Nov", revenue: 63000, leads: 2100, spend: 15500 },
      { month: "Dec", revenue: 71000, leads: 2450, spend: 16800 },
      { month: "Jan", revenue: 78000, leads: 2800, spend: 17500 },
      { month: "Feb", revenue: 85000, leads: 3100, spend: 18200 },
      { month: "Mar", revenue: 92500, leads: 3420, spend: 19000 },
    ],
    funnel: [
      { label: "Impressions", value: 2100000, color: "bg-blue-500" },
      { label: "Reach", value: 1500000, color: "bg-violet-500" },
      { label: "Clicks", value: 68000, color: "bg-amber-500" },
      { label: "Leads", value: 3420, color: "bg-emerald-500" },
      { label: "Conversions", value: 1250, color: "bg-primary" },
    ],
    platforms: [
      { name: "Instagram", value: 45 },
      { name: "TikTok", value: 35 },
      { name: "YouTube", value: 12 },
      { name: "LinkedIn", value: 4 },
      { name: "Google", value: 4 },
    ],
    campaigns: [
      {
        name: "Spring Collection Launch",
        platform: "Instagram",
        status: "active",
        revenue: 32000,
        leads: 980,
        impressions: 580000,
      },
      {
        name: "Influencer Collab Series",
        platform: "TikTok",
        status: "active",
        revenue: 28000,
        leads: 850,
        impressions: 720000,
      },
      {
        name: "YouTube Haul Videos",
        platform: "YouTube",
        status: "active",
        revenue: 19000,
        leads: 620,
        impressions: 320000,
      },
      {
        name: "Flash Sale Campaign",
        platform: "Instagram",
        status: "completed",
        revenue: 13500,
        leads: 970,
        impressions: 480000,
      },
    ],
  },
  {
    id: "3",
    company_name: "FreshBite Foods",
    industry: "Food & Beverage",
    plan: "Silver",
    color: "from-emerald-500 to-green-600",
    kpis: {
      revenue: 21400,
      leads: 820,
      roi: 198,
      costPerLead: 18.2,
      campaigns: 3,
    },
    revenueData: [
      { month: "Oct", revenue: 9000, leads: 320, spend: 4500 },
      { month: "Nov", revenue: 11500, leads: 420, spend: 5000 },
      { month: "Dec", revenue: 14000, leads: 540, spend: 5500 },
      { month: "Jan", revenue: 16500, leads: 640, spend: 6000 },
      { month: "Feb", revenue: 19000, leads: 730, spend: 6400 },
      { month: "Mar", revenue: 21400, leads: 820, spend: 6800 },
    ],
    funnel: [
      { label: "Impressions", value: 380000, color: "bg-blue-500" },
      { label: "Reach", value: 260000, color: "bg-violet-500" },
      { label: "Clicks", value: 14200, color: "bg-amber-500" },
      { label: "Leads", value: 820, color: "bg-emerald-500" },
      { label: "Conversions", value: 215, color: "bg-primary" },
    ],
    platforms: [
      { name: "Instagram", value: 40 },
      { name: "TikTok", value: 38 },
      { name: "YouTube", value: 22 },
    ],
    campaigns: [
      {
        name: "Summer Menu Launch",
        platform: "Instagram",
        status: "active",
        revenue: 8200,
        leads: 310,
        impressions: 145000,
      },
      {
        name: "Recipe TikToks",
        platform: "TikTok",
        status: "active",
        revenue: 9800,
        leads: 380,
        impressions: 185000,
      },
      {
        name: "Chef Reviews",
        platform: "YouTube",
        status: "paused",
        revenue: 3400,
        leads: 130,
        impressions: 50000,
      },
    ],
  },
];

const navLinks: NavLink[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Campaigns", icon: Megaphone },
  { label: "Reports", icon: FileText },
  { label: "Subscription", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

const statusColors: Record<CampaignStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  paused: "bg-amber-500/10 text-amber-600",
  completed: "bg-blue-500/10 text-blue-600",
};

export default function ClientDemo() {
  const [selectedClientId, setSelectedClientId] = useState<string>("1");
  const [activeNav, setActiveNav] = useState<string>("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const client = DEMO_CLIENTS.find((c) => c.id === selectedClientId)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo Banner */}
      <div className="bg-primary text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">🎭 Demo Mode</span>
          <span className="text-xs opacity-80 hidden sm:inline">
            This is a simulated client dashboard preview
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Tenant Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Switch Client: {client.company_name}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card text-foreground rounded-xl border shadow-xl z-50 min-w-52 overflow-hidden">
                {DEMO_CLIENTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 ${c.id === selectedClientId ? "bg-primary/10" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {c.company_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.company_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.plan} Plan · {c.industry}
                      </p>
                    </div>
                    {c.id === selectedClientId && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/">
            <button className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors">
              <X className="w-3.5 h-3.5" /> Exit Demo
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-card border-r">
          <div className="h-16 flex items-center px-5 border-b">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-extrabold text-lg">
                BrandPulse
              </span>
            </Link>
          </div>
          <div className="px-4 py-4 border-b">
            <div
              className={`bg-gradient-to-r ${client.color} rounded-xl p-3 text-white`}
            >
              <p className="font-heading font-bold text-sm">
                {client.company_name}
              </p>
              <p className="text-xs opacity-80">
                {client.plan} Plan · {client.industry}
              </p>
            </div>
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => setActiveNav(link.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeNav === link.label
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {link.label}
              </button>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${client.color} flex items-center justify-center text-white text-sm font-bold`}
              >
                {client.company_name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">Demo User</p>
                <p className="text-xs text-muted-foreground">
                  demo@{client.company_name.toLowerCase().replace(/\s/g, "")}
                  .com
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 space-y-6">
          {activeNav === "Dashboard" && (
            <>
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Welcome back, {client.company_name} 👋
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                  title="Revenue"
                  value={`$${client.kpis.revenue.toLocaleString()}`}
                  change={24.3}
                  icon={DollarSign}
                  color="text-emerald-600"
                  bg="bg-emerald-500/10"
                />
                <KPICard
                  title="Leads"
                  value={client.kpis.leads.toLocaleString()}
                  change={18.2}
                  icon={Users}
                  color="text-blue-600"
                  bg="bg-blue-500/10"
                />
                <KPICard
                  title="ROI"
                  value={`${client.kpis.roi}%`}
                  change={12.1}
                  icon={TrendingUp}
                  color="text-violet-600"
                  bg="bg-violet-500/10"
                />
                <KPICard
                  title="Cost/Lead"
                  value={`$${client.kpis.costPerLead}`}
                  change={-8.3}
                  icon={Target}
                  color="text-amber-600"
                  bg="bg-amber-500/10"
                />
                <KPICard
                  title="Campaigns"
                  value={client.kpis.campaigns}
                  icon={MegaphoneIcon}
                  color="text-cyan-600"
                  bg="bg-cyan-500/10"
                />
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart data={client.revenueData} />
                </div>
                <PlatformBreakdown data={client.platforms} />
              </div>
              <FunnelChart stages={client.funnel} />
            </>
          )}

          {activeNav === "Campaigns" && (
            <>
              <h1 className="font-heading text-2xl font-extrabold">
                Campaigns
              </h1>
              <div className="grid gap-4">
                {client.campaigns.map((c, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl border p-5 flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold">{c.name}</h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${statusColors[c.status]}`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {c.platform}
                      </p>
                    </div>
                    <div className="flex gap-6 text-sm text-center">
                      <div>
                        <p className="font-bold">
                          ${c.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div>
                        <p className="font-bold">{c.leads.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div>
                        <p className="font-bold">
                          {c.impressions.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Impressions
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeNav !== "Dashboard" && activeNav !== "Campaigns" && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                {(() => {
                  const L = navLinks.find((n) => n.label === activeNav);
                  return L ? <L.icon className="w-8 h-8" /> : null;
                })()}
              </div>
              <p className="font-heading font-bold text-lg text-foreground">
                {activeNav}
              </p>
              <p className="text-sm mt-1">
                This section is available in the full client portal.
              </p>
              <Link to="/register">
                <Button className="mt-4 rounded-xl bg-gradient-to-r from-primary to-accent">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
