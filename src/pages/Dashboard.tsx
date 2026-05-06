import { useState, useEffect, useRef } from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  TrendingUp,
  TrendingDown,
  MoreVertical,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Static Data ─────────────────────────────────────────────────────────────

const STATIC_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Launch",
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
    name: "Influencer Q1",
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
    name: "Brand Awareness",
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
    name: "Spring Launch",
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
    name: "Retargeting",
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
    name: "Influencer Summer",
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
    name: "Flash Sale",
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

const SOCIAL_PLATFORMS = [
  {
    name: "Facebook",
    value: "16.4 mln",
    label: "Likes",
    color: "#1877F2",
    textColor: "#fff",
    abbr: "f",
  },
  {
    name: "Instagram",
    value: "16.4 mln",
    label: "Followers",
    gradient: true,
    abbr: "ig",
  },
  {
    name: "YouTube",
    value: "16.4 mln",
    label: "Subscribers",
    color: "#FF0000",
    textColor: "#fff",
    abbr: "▶",
  },
  {
    name: "Twitter",
    value: "15.4k",
    label: "Followers",
    color: "#1DA1F2",
    textColor: "#fff",
    abbr: "t",
  },
  {
    name: "Google",
    value: "160,543",
    label: "Circled buy",
    color: "#fff",
    textColor: "#EA4335",
    border: true,
    abbr: "G",
  },
  {
    name: "LinkedIn",
    value: "10k",
    label: "Followers",
    color: "#0A66C2",
    textColor: "#fff",
    abbr: "in",
  },
];

const ACTIVE_USERS = [
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

const SOCIAL_CONVERSIONS = [
  { platform: "Instagram", pct: 25.3, color: "#E1306C" },
  { platform: "Facebook", pct: 21.2, color: "#4A90D9" },
  { platform: "Twitter", pct: 13.8, color: "#00BFFF" },
  { platform: "Google", pct: 9.9, color: "#34A853" },
  { platform: "Youtube", pct: 15.7, color: "#FF0000" },
  { platform: "LinkedIn", pct: 14.1, color: "#0A66C2" },
];

const TRAFFIC_DATA = [
  { name: "Instagram", lastMonth: 84500, lastYear: 72300 },
  { name: "Facebook", lastMonth: 42100, lastYear: 38900 },
  { name: "Twitter", lastMonth: 63700, lastYear: 59100 },
  { name: "Google", lastMonth: 28400, lastYear: 25600 },
  { name: "Youtube", lastMonth: 56900, lastYear: 51200 },
  { name: "LinkedIn", lastMonth: 19300, lastYear: 17800 },
];

const TOTAL_STATS = [
  { name: "Likes", pos: "+20%", neg: "-6%", sparkColor: "#34d399" },
  { name: "Followers", pos: "+20%", neg: "-6%", sparkColor: "#818cf8" },
  { name: "Page reach", pos: "+20%", neg: "-6%", sparkColor: "#f472b6" },
  { name: "Retweets", pos: "+20%", neg: "-6%", sparkColor: "#a78bfa" },
  { name: "Content watch", pos: "+20%", neg: "-6%", sparkColor: "#f87171" },
  { name: "Engagement", pos: "+20%", neg: "-6%", sparkColor: "#60a5fa" },
];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth || 80;
    const h = 28;
    canvas.width = w;
    canvas.height = h;
    const data = Array.from({ length: 10 }, () => Math.random() * 0.7 + 0.15);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - v * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [color]);
  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 28, display: "block" }}
    />
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 110;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2,
      cy = size / 2,
      r = 46,
      inner = 30;
    const total = SOCIAL_CONVERSIONS.reduce((s, d) => s + d.pct, 0);
    let angle = -Math.PI / 2;
    SOCIAL_CONVERSIONS.forEach(({ pct, color }) => {
      const sweep = (pct / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      angle += sweep;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }, []);
  return (
    <div
      style={{
        position: "relative",
        width: 110,
        height: 110,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ width: 110, height: 110 }} />
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 9, color: "#888", lineHeight: 1.3 }}>
          Av conversion
          <br />
          rate
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
          8.4%
        </div>
      </div>
    </div>
  );
}

// ─── Custom Y-axis tick ───────────────────────────────────────────────────────

const CustomYTick = ({ x, y, payload }: any) => (
  <text
    x={x}
    y={y}
    dy={4}
    textAnchor="end"
    fill="#888"
    fontSize={10}
    fontFamily="DM Sans, sans-serif"
  >
    {payload.value >= 1000 ? `${payload.value / 1000}K` : payload.value}
  </text>
);

const CustomXTick = ({ x, y, payload }: any) => (
  <text
    x={x}
    y={y}
    dy={12}
    textAnchor="middle"
    fill="#888"
    fontSize={10}
    fontFamily="DM Sans, sans-serif"
  >
    {payload.value}
  </text>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Month");

  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 600));
      setCampaigns(STATIC_CAMPAIGNS);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: "#f4f6fb",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #e0e4f0",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        background: "#f4f6fb",
        minHeight: "100vh",
        color: "#1a1a2e",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #e2e8f0",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          Dashboard
        </div>
        <div
          style={{
            display: "flex",
            border: "1px solid #dde1ec",
            borderRadius: 20,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {(["Week", "Month", "Year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                background: period === p ? "#1a1a2e" : "transparent",
                color: period === p ? "#fff" : "#666",
                borderRadius: period === p ? 20 : 0,
                transition: "all 0.15s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Social platform pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {SOCIAL_PLATFORMS.map((s) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: 10,
                padding: "8px 14px",
                minWidth: 130,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  background: s.gradient
                    ? "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
                    : s.color,
                  color: s.textColor || "#fff",
                  border: s.border ? "1px solid #ddd" : "none",
                }}
              >
                {s.abbr}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}
                >
                  {s.value}
                </span>
                <span style={{ fontSize: 10, color: "#888" }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total stats dark card */}
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: 14,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#c8ccda",
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Total stats
            <MoreVertical
              size={16}
              color="#555"
              style={{ cursor: "pointer" }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 8,
            }}
          >
            {TOTAL_STATS.map((s) => (
              <div
                key={s.name}
                style={{
                  background: "#252744",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#9ca3b8",
                    marginBottom: 4,
                  }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {s.pos}
                </div>
                <div style={{ fontSize: 10, color: "#f87171", marginTop: 2 }}>
                  {s.neg}
                </div>
                <Sparkline color={s.sparkColor} />
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-col grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* Left: Bar Chart */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "0.5px solid #e2e8f0",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a2e",
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Social traffic
              <MoreVertical
                size={16}
                color="#bbb"
                style={{ cursor: "pointer" }}
              />
            </div>
            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginBottom: 8,
                fontSize: 11,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#666",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#a78bfa",
                    display: "inline-block",
                  }}
                />
                Last month
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#666",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                  }}
                />
                Last year
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TRAFFIC_DATA} barCategoryGap="30%" barGap={3}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={<CustomXTick />}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={<CustomYTick />}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                  domain={[0, 100000]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "0.5px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                  formatter={(v: number) => [`${(v / 1000).toFixed(1)}K`, ""]}
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
                  fill="rgba(74,222,128,0.6)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right column: Active Users + Donut */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Active Users */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "0.5px solid #e2e8f0",
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a1a2e",
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Active users
                <MoreVertical
                  size={16}
                  color="#bbb"
                  style={{ cursor: "pointer" }}
                />
              </div>
              {/* Legend pills */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                {ACTIVE_USERS.map((u) => (
                  <span
                    key={u.platform}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      color: "#555",
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
              {ACTIVE_USERS.map((u) => (
                <div
                  key={u.platform}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#333",
                      width: 70,
                      flexShrink: 0,
                    }}
                  >
                    {u.platform}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
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
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      width: 56,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {u.count.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      width: 40,
                      textAlign: "right",
                      flexShrink: 0,
                      color: u.change >= 0 ? "#22c55e" : "#ef4444",
                      fontWeight: 500,
                    }}
                  >
                    {u.change >= 0 ? "+" : ""}
                    {u.change}%
                  </span>
                </div>
              ))}
            </div>

            {/* Social Media Conversions Donut */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "0.5px solid #e2e8f0",
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a1a2e",
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Social media conversions
                <MoreVertical
                  size={16}
                  color="#bbb"
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  {SOCIAL_CONVERSIONS.map((c) => (
                    <div
                      key={c.platform}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 11,
                        color: "#333",
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
                      <span style={{ fontWeight: 600, color: "#1a1a2e" }}>
                        {c.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <DonutChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
