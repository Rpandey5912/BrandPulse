import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardAPI, CampaignsAPI } from "@/lib/api";
import { MoreVertical } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  {
    name: "TikTok",
    abbr: "tt",
    label: "Followers",
    bg: "#010101",
    fg: "#fff",
  },
  {
    name: "YouTube",
    abbr: "▶",
    label: "Subscribers",
    bg: "#FF0000",
    fg: "#fff",
  },
  { name: "Twitter", abbr: "t", label: "Followers", bg: "#1DA1F2", fg: "#fff" },
  {
    name: "Google",
    abbr: "G",
    label: "Impressions",
    bg: "#fff",
    fg: "#EA4335",
    border: "1px solid #ddd",
  },
  {
    name: "LinkedIn",
    abbr: "in",
    label: "Followers",
    bg: "#0A66C2",
    fg: "#fff",
  },
];

function getUserPlatforms(): string[] {
  try {
    const stored = localStorage.getItem("bp_platforms");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  Facebook: "#4A90D9",
  Twitter: "#00BFFF",
  Google: "#34A853",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  TikTok: "#010101",
};

const STAT_COLORS = [
  "#34d399",
  "#818cf8",
  "#f472b6",
  "#a78bfa",
  "#f87171",
  "#60a5fa",
];

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
  return (
    <canvas ref={ref} style={{ width: "100%", height: 28, display: "block" }} />
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────
function Donut({
  slices,
  center,
}: {
  slices: { pct: number; color: string }[];
  center: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const S = 110;
    c.width = S;
    c.height = S;
    const cx = S / 2,
      cy = S / 2,
      R = 48,
      r = 32;
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
    <div
      style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}
    >
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
        <span
          style={{
            fontSize: 9,
            color: "#999",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          Av conversion
          <br />
          rate
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>
          {center}
        </span>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} mln`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n ?? 0);

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

// ─── Fallback data (shown when API has no data yet) ───────────────────────────
const FALLBACK_TRAFFIC = [
  { name: "Facebook", lastMonth: 84500, lastYear: 72300 },
  { name: "Twitter", lastMonth: 42100, lastYear: 38900 },
  { name: "Google", lastMonth: 63700, lastYear: 59100 },
  { name: "Youtube", lastMonth: 28400, lastYear: 25600 },
  { name: "LinkedIn", lastMonth: 56900, lastYear: 51200 },
];
const FALLBACK_ACTIVE = [
  {
    platform: "Instagram",
    count: 65376,
    change: 12.5,
    color: "#E1306C",
    pct: 90,
  },
  {
    platform: "Facebook",
    count: 12109,
    change: -3.2,
    color: "#4A90D9",
    pct: 18,
  },
  {
    platform: "Twitter",
    count: 132645,
    change: 18.7,
    color: "#00BFFF",
    pct: 100,
  },
  {
    platform: "Google",
    count: 132645,
    change: 5.4,
    color: "#34A853",
    pct: 100,
  },
];
const FALLBACK_CONV = [
  { platform: "Instagram", pct: 25.3, color: "#E1306C" },
  { platform: "Facebook", pct: 21.2, color: "#4A90D9" },
  { platform: "Twitter", pct: 13.8, color: "#00BFFF" },
  { platform: "Google", pct: 9.9, color: "#34A853" },
  { platform: "Youtube", pct: 15.7, color: "#FF0000" },
  { platform: "LinkedIn", pct: 14.1, color: "#0A66C2" },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Month");

  const { data: dash, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => DashboardAPI.full().then((r: any) => r.data),
    staleTime: 60_000,
  });

  const kpis: any = dash?.kpis ?? {};
  const platforms: any[] = dash?.platform_breakdown ?? [];
  const revenueChart: any[] = dash?.revenue_chart ?? [];
  const funnel: any[] = dash?.funnel ?? [];

  // Filter by user's registered platforms
  const userPlatforms = getUserPlatforms();
  const hasFilter = userPlatforms.length > 0;
  const matchesPlatform = (name: string) =>
    !hasFilter ||
    userPlatforms.some((up) => up.toLowerCase() === name.toLowerCase());

  // Platform pills — only show user-selected platforms
  const pills = SOCIAL_PLATFORMS.filter((p) => matchesPlatform(p.name)).map((p) => {
    const api = platforms.find(
      (d: any) => d.platform?.toLowerCase() === p.name.toLowerCase(),
    );
    return { ...p, value: api ? fmtNum(api.impressions ?? 0) : "—" };
  });

  // Total stats boxes
  const totalStats = [
    {
      name: "Impressions",
      pos: kpis.impressions_change,
      color: STAT_COLORS[0],
    },
    { name: "Reach", pos: kpis.reach_change, color: STAT_COLORS[1] },
    { name: "Clicks", pos: kpis.clicks_change, color: STAT_COLORS[2] },
    { name: "Leads", pos: kpis.leads_change, color: STAT_COLORS[3] },
    {
      name: "Conversions",
      pos: kpis.conversions_change,
      color: STAT_COLORS[4],
    },
    { name: "Revenue", pos: kpis.revenue_change, color: STAT_COLORS[5] },
  ];

  // Traffic chart
  const trafficData =
    revenueChart.length > 0
      ? revenueChart.map((r: any) => ({
          name: r.month?.slice(5) ?? r.month,
          lastMonth: r.revenue ?? 0,
          lastYear: r.spend ?? 0,
        }))
      : FALLBACK_TRAFFIC;

  // Active users — filter API data and fallback by user-selected platforms
  const filteredPlatforms = platforms.filter((p: any) => matchesPlatform(p.platform));
  const maxCount = Math.max(
    ...filteredPlatforms.map((p: any) => p.impressions ?? 0),
    1,
  );
  const activeUsers =
    filteredPlatforms.length > 0
      ? filteredPlatforms.map((p: any) => ({
          platform: p.platform,
          count: p.impressions ?? 0,
          change: +((Math.random() - 0.4) * 25).toFixed(1),
          color: PLATFORM_COLORS[p.platform] ?? "#6366f1",
          pct: Math.round(((p.impressions ?? 0) / maxCount) * 100),
        }))
      : FALLBACK_ACTIVE.filter((a) => matchesPlatform(a.platform));

  // Conversions donut — filter by user-selected platforms
  const totalRev =
    filteredPlatforms.reduce((s: number, p: any) => s + (p.revenue ?? 0), 0) || 0;
  const convData =
    filteredPlatforms.length > 0 && totalRev > 0
      ? filteredPlatforms.map((p: any) => ({
          platform: p.platform,
          pct: +((p.revenue / totalRev) * 100).toFixed(1),
          color: PLATFORM_COLORS[p.platform] ?? "#6366f1",
        }))
      : FALLBACK_CONV.filter((c) => matchesPlatform(c.platform));

  const avgRate =
    funnel.length >= 2 && funnel[0]?.value > 0
      ? `${((funnel[funnel.length - 1].value / funnel[0].value) * 100).toFixed(1)}%`
      : "8.4%";

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f4f6fb",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #e0e4f0",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans','Inter',sans-serif",
        background: "#f4f6fb",
        minHeight: "100vh",
        color: "#1a1a2e",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #e2e8f0",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</span>
        <div
          style={{
            display: "flex",
            border: "1px solid #dde1ec",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
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

      <div
        style={{
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Platform pills ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {pills.map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: 10,
                padding: "8px 16px",
                minWidth: 148,
                flexShrink: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  background: p.bg,
                  color: p.fg,
                  border: (p as any).border ?? "none",
                }}
              >
                {p.abbr}
              </div>
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}
                >
                  {p.value}
                </div>
                <div style={{ fontSize: 10, color: "#999" }}>{p.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Total stats dark card ── */}
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: 14,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#c8ccda" }}>
              Total stats
            </span>
            <MoreVertical
              size={16}
              color="#555"
              style={{ cursor: "pointer" }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              gap: 8,
            }}
          >
            {totalStats.map((s) => {
              const change = s.pos ?? 20;
              const positive = change >= 0;
              return (
                <div
                  key={s.name}
                  style={{
                    background: "#252744",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: "#9ca3b8", marginBottom: 4 }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {positive ? "+" : ""}
                    {Math.abs(change).toFixed(0)}%
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: positive ? "#4ade80" : "#f87171",
                      marginBottom: 4,
                    }}
                  >
                    {positive ? "" : "-"}
                    {Math.abs(change * 0.3).toFixed(0)}%
                  </div>
                  <Sparkline color={s.color} positive={positive} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main 2-col ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* Social Traffic */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "0.5px solid #e2e8f0",
              padding: "16px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
                Social traffic
              </span>
              <MoreVertical size={16} color="#bbb" />
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
              {[
                { label: "Last month", color: "#a78bfa" },
                { label: "Last year", color: "#4ade80" },
              ].map((l) => (
                <span
                  key={l.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10,
                    color: "#777",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: l.color,
                      display: "inline-block",
                    }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={trafficData} barCategoryGap="35%" barGap={3}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={<XTick />}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={<YTick />}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "0.5px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                  formatter={(v: any) => [`${(Number(v) / 1000).toFixed(1)}K`, ""]}
                />
                <Bar
                  dataKey="lastMonth"
                  name="Last month"
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="lastYear"
                  name="Last year"
                  fill="rgba(74,222,128,0.55)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Active users */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "0.5px solid #e2e8f0",
                padding: "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}
                >
                  Active users
                </span>
                <MoreVertical size={16} color="#bbb" />
              </div>
              {/* Legend dots */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {activeUsers.map((u: any) => (
                  <span
                    key={u.platform}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      color: "#666",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: u.color,
                        display: "inline-block",
                      }}
                    />
                    {u.platform}
                  </span>
                ))}
              </div>
              {/* Rows */}
              {activeUsers.map((u: any) => (
                <div
                  key={u.platform}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 9,
                  }}
                >
                  <span
                    style={{
                      width: 68,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#444",
                      flexShrink: 0,
                    }}
                  >
                    {u.platform}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 7,
                      background: "#f0f2f8",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${u.pct}%`,
                        background: u.color,
                        borderRadius: 4,
                        transition: "width .5s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      width: 54,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {(u.count ?? 0).toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      width: 42,
                      textAlign: "right",
                      flexShrink: 0,
                      fontWeight: 600,
                      color: u.change >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {u.change >= 0 ? "+" : ""}
                    {u.change}%
                  </span>
                </div>
              ))}
            </div>

            {/* Social media conversions */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "0.5px solid #e2e8f0",
                padding: "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}
                >
                  Social media conversions
                </span>
                <MoreVertical size={16} color="#bbb" />
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {convData.map((c: any) => (
                    <div
                      key={c.platform}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: "#444",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: c.color,
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ flex: 1 }}>{c.platform}</span>
                      <span style={{ fontWeight: 700, color: "#1a1a2e" }}>
                        {c.pct}%
                      </span>
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
  );
}
