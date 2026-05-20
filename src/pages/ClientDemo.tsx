import { useState, useEffect, useRef } from "react";
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
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Platform branding ───────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  { name: "Facebook", abbr: "f", label: "Likes", bg: "#1877F2", fg: "#fff" },
  {
    name: "Instagram",
    abbr: "ig",
    label: "Followers",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    fg: "#fff",
  },
  { name: "TikTok", abbr: "tt", label: "Followers", bg: "#010101", fg: "#fff" },
  { name: "YouTube", abbr: "▶", label: "Subscribers", bg: "#FF0000", fg: "#fff" },
  { name: "Twitter", abbr: "t", label: "Followers", bg: "#1DA1F2", fg: "#fff" },
  {
    name: "Google",
    abbr: "G",
    label: "Impressions",
    bg: "#fff",
    fg: "#EA4335",
    border: "1px solid #ddd",
  },
  { name: "LinkedIn", abbr: "in", label: "Followers", bg: "#0A66C2", fg: "#fff" },
];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  Facebook: "#4A90D9",
  Twitter: "#00BFFF",
  Google: "#34A853",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  TikTok: "#010101",
};

const STAT_COLORS = ["#34d399", "#818cf8", "#f472b6", "#a78bfa", "#f87171", "#60a5fa"];

const fmtNum = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} mln`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n ?? 0);

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ color, positive }: { color: string; positive: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.offsetWidth || 90,
      H = 28;
    c.width = W;
    c.height = H;
    const pts = Array.from({ length: 10 }, (_, i) =>
      Math.max(
        0.05,
        Math.min(
          0.95,
          0.5 + (positive ? 0.08 : -0.08) * i + (Math.random() - 0.5) * 0.25,
        ),
      ),
    );
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    pts.forEach((v, i) => {
      const x = (i / 9) * W,
        y = H - v * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [color, positive]);
  return <canvas ref={ref} style={{ width: "100%", height: 28, display: "block" }} />;
}

// ─── Donut ────────────────────────────────────────────────────────────────────
function Donut({ slices, center }: { slices: { pct: number; color: string }[]; center: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const S = 110;
    c.width = S;
    c.height = S;
    const cx = S / 2, cy = S / 2, R = 48, r = 32;
    const total = slices.reduce((s, d) => s + d.pct, 0) || 1;
    let angle = -Math.PI / 2;
    slices.forEach(({ pct, color }) => {
      const sweep = (pct / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle, angle + sweep);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      angle += sweep;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, [slices]);
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <canvas ref={ref} style={{ width: 110, height: 110 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 9, color: "#999", textAlign: "center", lineHeight: 1.3 }}>
          Av conversion
          <br />
          rate
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{center}</span>
      </div>
    </div>
  );
}

const YTick = ({ x, y, payload }: any) => (
  <text x={x} y={y} dy={4} textAnchor="end" fill="#aaa" fontSize={10}>
    {payload.value >= 1000 ? `${payload.value / 1000}K` : payload.value}
  </text>
);
const XTick = ({ x, y, payload }: any) => (
  <text x={x} y={y} dy={12} textAnchor="middle" fill="#aaa" fontSize={10}>
    {payload.value}
  </text>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type CampaignStatus = "active" | "paused" | "completed";
type PlanType = "Scale" | "Accelerator" | "Growth";

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
  kpis: { revenue: number; leads: number; roi: number; costPerLead: number; campaigns: number };
  revenueData: { month: string; revenue: number; leads: number; spend: number }[];
  funnel: { label: string; value: number; color: string }[];
  platforms: { name: string; value: number }[];
  campaigns: Campaign[];
}

interface NavLink {
  label: string;
  icon: LucideIcon;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_CLIENTS: Client[] = [
  {
    id: "1",
    company_name: "TechVenture Labs",
    industry: "Technology",
    plan: "Scale",
    color: "from-amber-500 to-yellow-500",
    kpis: { revenue: 48200, leads: 1847, roi: 342, costPerLead: 12.4, campaigns: 5 },
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
      { name: "Summer Brand Awareness", platform: "Instagram", status: "active", revenue: 12500, leads: 380, impressions: 125000 },
      { name: "TikTok Viral Challenge", platform: "TikTok", status: "active", revenue: 18000, leads: 520, impressions: 250000 },
      { name: "LinkedIn B2B Outreach", platform: "LinkedIn", status: "active", revenue: 22000, leads: 290, impressions: 45000 },
      { name: "YouTube Product Reviews", platform: "YouTube", status: "completed", revenue: 28000, leads: 410, impressions: 180000 },
      { name: "Google Ads Q1", platform: "Google", status: "active", revenue: 35000, leads: 680, impressions: 320000 },
    ],
  },
  {
    id: "2",
    company_name: "StyleHouse Co",
    industry: "Fashion",
    plan: "Accelerator",
    color: "from-violet-500 to-purple-600",
    kpis: { revenue: 92500, leads: 3420, roi: 415, costPerLead: 9.8, campaigns: 8 },
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
      { name: "Spring Collection Launch", platform: "Instagram", status: "active", revenue: 32000, leads: 980, impressions: 580000 },
      { name: "Influencer Collab Series", platform: "TikTok", status: "active", revenue: 28000, leads: 850, impressions: 720000 },
      { name: "YouTube Haul Videos", platform: "YouTube", status: "active", revenue: 19000, leads: 620, impressions: 320000 },
      { name: "Flash Sale Campaign", platform: "Instagram", status: "completed", revenue: 13500, leads: 970, impressions: 480000 },
    ],
  },
  {
    id: "3",
    company_name: "FreshBite Foods",
    industry: "Food & Beverage",
    plan: "Growth",
    color: "from-emerald-500 to-green-600",
    kpis: { revenue: 21400, leads: 820, roi: 198, costPerLead: 18.2, campaigns: 3 },
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
      { name: "Summer Menu Launch", platform: "Instagram", status: "active", revenue: 8200, leads: 310, impressions: 145000 },
      { name: "Recipe TikToks", platform: "TikTok", status: "active", revenue: 9800, leads: 380, impressions: 185000 },
      { name: "Chef Reviews", platform: "YouTube", status: "paused", revenue: 3400, leads: 130, impressions: 50000 },
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
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Month");

  const client = DEMO_CLIENTS.find((c) => c.id === selectedClientId)!;

  // ── Derived dashboard data from client ──────────────────────────────────────
  const totalImpressions = client.funnel[0]?.value ?? 0;

  const pills = SOCIAL_PLATFORMS.filter((sp) =>
    client.platforms.some((p) => p.name.toLowerCase() === sp.name.toLowerCase()),
  ).map((sp) => {
    const cp = client.platforms.find((p) => p.name.toLowerCase() === sp.name.toLowerCase())!;
    const impressions = Math.round((totalImpressions * cp.value) / 100);
    return { ...sp, value: fmtNum(impressions) };
  });

  const totalStats = [
    { name: "Impressions", change: 22.4, color: STAT_COLORS[0] },
    { name: "Reach", change: 18.1, color: STAT_COLORS[1] },
    { name: "Clicks", change: 14.7, color: STAT_COLORS[2] },
    { name: "Leads", change: 18.2, color: STAT_COLORS[3] },
    { name: "Conversions", change: 12.1, color: STAT_COLORS[4] },
    { name: "Revenue", change: 24.3, color: STAT_COLORS[5] },
  ];

  const trafficData = client.revenueData.map((r) => ({
    name: r.month,
    lastMonth: r.revenue,
    lastYear: r.spend,
  }));

  const maxPlatformVal = Math.max(...client.platforms.map((p) => p.value), 1);
  const activeUsers = client.platforms.map((p) => ({
    platform: p.name,
    count: Math.round((totalImpressions * p.value) / 100),
    change: +(((Math.random() - 0.35) * 25)).toFixed(1),
    color: PLATFORM_COLORS[p.name] ?? "#6366f1",
    pct: Math.round((p.value / maxPlatformVal) * 100),
  }));

  const convData = client.platforms.map((p) => ({
    platform: p.name,
    pct: p.value,
    color: PLATFORM_COLORS[p.name] ?? "#6366f1",
  }));

  const funnel = client.funnel;
  const avgRate =
    funnel.length >= 2 && funnel[0]?.value > 0
      ? `${((funnel[funnel.length - 1].value / funnel[0].value) * 100).toFixed(1)}%`
      : "8.4%";

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
                    onClick={() => { setSelectedClientId(c.id); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 ${c.id === selectedClientId ? "bg-primary/10" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {c.company_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.company_name}</p>
                      <p className="text-xs text-muted-foreground">{c.plan} Plan · {c.industry}</p>
                    </div>
                    {c.id === selectedClientId && <Check className="w-4 h-4 text-primary ml-auto" />}
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
              <span className="font-heading font-extrabold text-lg">BrandPulse</span>
            </Link>
          </div>
          <div className="px-4 py-4 border-b">
            <div className={`bg-gradient-to-r ${client.color} rounded-xl p-3 text-white`}>
              <p className="font-heading font-bold text-sm">{client.company_name}</p>
              <p className="text-xs opacity-80">{client.plan} Plan · {client.industry}</p>
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
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${client.color} flex items-center justify-center text-white text-sm font-bold`}>
                {client.company_name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">Demo User</p>
                <p className="text-xs text-muted-foreground">
                  demo@{client.company_name.toLowerCase().replace(/\s/g, "")}.com
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeNav === "Dashboard" && (
            <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: "#f4f6fb", minHeight: "100%", color: "#1a1a2e" }}>
              {/* Top bar */}
              <div style={{ background: "#fff", borderBottom: "0.5px solid #e2e8f0", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</span>
                <div style={{ display: "flex", border: "1px solid #dde1ec", borderRadius: 20, overflow: "hidden" }}>
                  {(["Week", "Month", "Year"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      style={{
                        padding: "5px 16px",
                        fontSize: 12,
                        fontWeight: 500,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        background: period === p ? "#1a1a2e" : "transparent",
                        color: period === p ? "#fff" : "#666",
                        borderRadius: period === p ? 20 : 0,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Platform pills */}
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
                  {pills.map((p) => (
                    <div
                      key={p.name}
                      style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: 10, padding: "8px 16px", minWidth: 148, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    >
                      <div
                        style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, background: p.bg, color: p.fg, border: (p as any).border ?? "none" }}
                      >
                        {p.abbr}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{p.value}</div>
                        <div style={{ fontSize: 10, color: "#999" }}>{p.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total stats dark card */}
                <div style={{ background: "#1a1a2e", borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#c8ccda" }}>Total stats</span>
                    <MoreVertical size={16} color="#555" style={{ cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
                    {totalStats.map((s) => {
                      const positive = s.change >= 0;
                      return (
                        <div key={s.name} style={{ background: "#252744", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, color: "#9ca3b8", marginBottom: 4 }}>{s.name}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                            {positive ? "+" : ""}{Math.abs(s.change).toFixed(0)}%
                          </div>
                          <div style={{ fontSize: 10, color: positive ? "#4ade80" : "#f87171", marginBottom: 4 }}>
                            {positive ? "" : "-"}{Math.abs(s.change * 0.3).toFixed(0)}%
                          </div>
                          <Sparkline color={s.color} positive={positive} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Main 2-col */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Social Traffic */}
                  <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e2e8f0", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Social traffic</span>
                      <MoreVertical size={16} color="#bbb" />
                    </div>
                    <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                      {[{ label: "Revenue", color: "#a78bfa" }, { label: "Ad Spend", color: "#4ade80" }].map((l) => (
                        <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#777" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, display: "inline-block" }} />
                          {l.label}
                        </span>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={trafficData} barCategoryGap="35%" barGap={3}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={<XTick />} axisLine={false} tickLine={false} />
                        <YAxis tick={<YTick />} axisLine={false} tickLine={false} tickCount={5} />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: 8, fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                          formatter={(v: any) => [`$${(Number(v) / 1000).toFixed(1)}K`, ""]}
                        />
                        <Bar dataKey="lastMonth" name="Revenue" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="lastYear" name="Ad Spend" fill="rgba(74,222,128,0.55)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Active users */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e2e8f0", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Active users</span>
                        <MoreVertical size={16} color="#bbb" />
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        {activeUsers.map((u) => (
                          <span key={u.platform} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#666" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: u.color, display: "inline-block" }} />
                            {u.platform}
                          </span>
                        ))}
                      </div>
                      {activeUsers.map((u) => (
                        <div key={u.platform} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                          <span style={{ width: 68, fontSize: 11, fontWeight: 500, color: "#444", flexShrink: 0 }}>{u.platform}</span>
                          <div style={{ flex: 1, height: 7, background: "#f0f2f8", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${u.pct}%`, background: u.color, borderRadius: 4, transition: "width .5s" }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", width: 54, textAlign: "right", flexShrink: 0 }}>
                            {u.count.toLocaleString()}
                          </span>
                          <span style={{ fontSize: 10, width: 42, textAlign: "right", flexShrink: 0, fontWeight: 600, color: u.change >= 0 ? "#22c55e" : "#ef4444" }}>
                            {u.change >= 0 ? "+" : ""}{u.change}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Social media conversions */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #e2e8f0", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Social media conversions</span>
                        <MoreVertical size={16} color="#bbb" />
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                          {convData.map((c) => (
                            <div key={c.platform} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#444" }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0, display: "inline-block" }} />
                              <span style={{ flex: 1 }}>{c.platform}</span>
                              <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{c.pct}%</span>
                            </div>
                          ))}
                        </div>
                        <Donut slices={convData} center={avgRate} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === "Campaigns" && (
            <div className="p-6 lg:p-8 space-y-6">
              <h1 className="font-heading text-2xl font-extrabold">Campaigns</h1>
              <div className="grid gap-4">
                {client.campaigns.map((c, i) => (
                  <div key={i} className="bg-card rounded-2xl border p-5 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold">{c.name}</h3>
                        <Badge variant="secondary" className={`text-xs ${statusColors[c.status]}`}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.platform}</p>
                    </div>
                    <div className="flex gap-6 text-sm text-center">
                      <div>
                        <p className="font-bold">${c.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div>
                        <p className="font-bold">{c.leads.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div>
                        <p className="font-bold">{c.impressions.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Impressions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav !== "Dashboard" && activeNav !== "Campaigns" && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground p-6">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                {(() => {
                  const L = navLinks.find((n) => n.label === activeNav);
                  return L ? <L.icon className="w-8 h-8" /> : null;
                })()}
              </div>
              <p className="font-heading font-bold text-lg text-foreground">{activeNav}</p>
              <p className="text-sm mt-1">This section is available in the full client portal.</p>
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
