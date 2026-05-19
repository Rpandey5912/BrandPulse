import { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({
  to,
  prefix = "",
  suffix = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent =
        prefix + Math.floor(eased * to).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame((ts) => step(ts, startTime));
    };
    requestAnimationFrame((ts) => step(ts, ts));
  }, [to, prefix, suffix]);
  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}

// ── Mini ring chart ───────────────────────────────────────────────────────────
function RingChart({ pct, color }: { pct: number; color: string }) {
  const r = 20,
    circ = 2 * Math.PI * r;
  return (
    <svg width={52} height={52} viewBox="0 0 52 52">
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={5}
      />
      <circle
        cx={26}
        cy={26}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
      />
      <text
        x={26}
        y={30}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#fff"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────
const PLAN_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  platinum: { bg: "rgba(167,139,250,0.15)", text: "#c4b5fd", dot: "#a78bfa" },
  gold: { bg: "rgba(251,191,36,0.15)", text: "#fbbf24", dot: "#f59e0b" },
  silver: { bg: "rgba(148,163,184,0.15)", text: "#94a3b8", dot: "#64748b" },
  trial: { bg: "rgba(99,102,241,0.15)", text: "#818cf8", dot: "#6366f1" },
};

function PlanBadge({ plan }: { plan: string }) {
  const s = PLAN_STYLES[plan] ?? PLAN_STYLES.trial;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 20,
        background: s.bg,
        color: s.text,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "capitalize",
        letterSpacing: ".04em",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
        }}
      />
      {plan}
    </span>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "#4ade80",
    blocked: "#f87171",
    pending: "#fbbf24",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        color: colors[status] ?? "#888",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: colors[status] ?? "#888",
          boxShadow: `0 0 6px ${colors[status] ?? "#888"}`,
          display: "inline-block",
          animation: status === "active" ? "pulse 2s infinite" : "none",
        }}
      />
      {status}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K`
      : String(n ?? 0);

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: overview, isLoading: loadingOv } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => AdminAPI.overview().then((r: any) => r.data),
    staleTime: 60_000,
  });
  const { data: clientsData, isLoading: loadingCl } = useQuery({
    queryKey: ["admin-clients-dash"],
    queryFn: () =>
      AdminAPI.listClients({
        per_page: 6,
        sort_by: "created_at",
        sort_dir: "desc",
      }).then((r: any) => r.data),
    staleTime: 60_000,
  });
  const { data: pendingData, isLoading: loadingPe } = useQuery({
    queryKey: ["admin-influencers-pending"],
    queryFn: () =>
      AdminAPI.listInfluencers({ status: "pending", per_page: 5 }).then(
        (r: any) => r.data,
      ),
    staleTime: 60_000,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-influencers-pending"] });
  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8001/api/v1"}/influencers/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bp_token")}`,
            "Content-Type": "application/json",
          },
        },
      ).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Influencer approved ✅" });
      invalidate();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"}/influencers/${id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bp_token")}`,
            "Content-Type": "application/json",
          },
        },
      ).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Influencer rejected" });
      invalidate();
    },
  });

  const ov: any = overview ?? {};
  const clients: any[] = clientsData ?? [];
  const pending: any[] = pendingData ?? [];
  const planBreak: any = ov.plan_breakdown ?? {};
  const isLoading = loadingOv || loadingCl || loadingPe;

  const activeRate = ov.total_tenants
    ? Math.round((ov.active_tenants / ov.total_tenants) * 100)
    : 0;
  const mrr = ov.mrr ?? 0;

  const KPI_CARDS = [
    {
      label: "Total Clients",
      value: ov.total_tenants ?? 0,
      icon: Building2,
      gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      ring: activeRate,
      ringColor: "#a78bfa",
    },
    {
      label: "Active Clients",
      value: ov.active_tenants ?? 0,
      icon: Users,
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      ring: activeRate,
      ringColor: "#4ade80",
    },
    {
      label: "Total Campaigns",
      value: ov.total_campaigns ?? 0,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
      ring: 78,
      ringColor: "#fbbf24",
    },
    {
      label: "Monthly Revenue",
      value: mrr,
      prefix: "£",
      icon: DollarSign,
      gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
      ring: 92,
      ringColor: "#38bdf8",
      isCurrency: true,
    },
    {
      label: "Influencers",
      value: ov.total_influencers ?? 0,
      icon: Zap,
      gradient: "linear-gradient(135deg,#ec4899,#f43f5e)",
      ring: ov.total_influencers
        ? Math.round(
            ((ov.total_influencers - (ov.pending_influencers ?? 0)) /
              ov.total_influencers) *
              100,
          )
        : 0,
      ringColor: "#f472b6",
    },
    {
      label: "Pending Review",
      value: ov.pending_influencers ?? 0,
      icon: ShieldAlert,
      gradient: "linear-gradient(135deg,#f97316,#eab308)",
      ring: 100,
      ringColor: "#fb923c",
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f0f1a",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(99,102,241,0.2)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#555", fontSize: 12 }}>Loading platform data…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans','Inter',sans-serif",
        background: "#0f0f1a",
        minHeight: "100vh",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important; }
        .action-btn { border:none; cursor:pointer; border-radius:8px; padding:5px 10px; font-size:11px; font-weight:600; font-family:inherit; transition:opacity .15s, transform .1s; display:inline-flex; align-items:center; gap:4px; }
        .action-btn:hover { opacity:.85; transform:scale(1.04); }
        .action-btn:active { transform:scale(.97); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#2a2a3e; border-radius:4px; }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 8px #4ade80",
                animation: "pulse 2s infinite",
              }}
            />
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-.02em",
                margin: 0,
                background: "linear-gradient(135deg,#e2e8f0,#94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Control Centre
            </h1>
          </div>
          <p style={{ fontSize: 11, color: "#475569", margin: "3px 0 0 18px" }}>
            {moment().format("dddd, D MMMM YYYY")} · Platform overview
          </p>
        </div>
        <Link to="/admin/clients" style={{ textDecoration: "none" }}>
          <button
            className="action-btn"
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 12,
            }}
          >
            Manage Clients <ArrowRight size={13} />
          </button>
        </Link>
      </div>

      <div
        style={{
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          animation: "fadeUp .5s ease both",
        }}
      >
        {/* ── KPI Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 14,
          }}
        >
          {KPI_CARDS.map((k, i) => (
            <div
              key={k.label}
              className="card-hover"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "18px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                animation: `fadeUp .5s ease ${i * 0.06}s both`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow blob */}
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: k.gradient,
                  opacity: 0.15,
                  filter: "blur(20px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: k.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <k.icon size={16} color="#fff" />
                </div>
                <RingChart pct={k.ring} color={k.ringColor} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    letterSpacing: "-.02em",
                    lineHeight: 1,
                  }}
                >
                  {k.isCurrency ? (
                    <>
                      <span
                        style={{ fontSize: 13, fontWeight: 500, opacity: 0.6 }}
                      >
                        £
                      </span>
                      <Counter to={k.value} />
                    </>
                  ) : k.prefix ? (
                    <>
                      <span
                        style={{ fontSize: 13, fontWeight: 500, opacity: 0.6 }}
                      >
                        {k.prefix}
                      </span>
                      <Counter to={k.value} />
                    </>
                  ) : (
                    <Counter to={k.value} />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {k.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Plan distribution bar ── */}
        {Object.keys(planBreak).length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  letterSpacing: "-.01em",
                }}
              >
                Plan Distribution
              </span>
              <span style={{ fontSize: 11, color: "#475569" }}>
                {ov.total_tenants ?? 0} total clients
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 3,
                height: 10,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              {Object.entries(planBreak).map(([slug, count]: [string, any]) => {
                const pct = ov.total_tenants
                  ? Math.round((count / ov.total_tenants) * 100)
                  : 0;
                const colors: Record<string, string> = {
                  platinum: "#a78bfa",
                  gold: "#f59e0b",
                  silver: "#94a3b8",
                  trial: "#6366f1",
                };
                return (
                  <div
                    key={slug}
                    style={{
                      flex: pct,
                      background: colors[slug] ?? "#6366f1",
                      transition: "flex .8s cubic-bezier(.4,0,.2,1)",
                      minWidth: pct > 0 ? 4 : 0,
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {Object.entries(planBreak).map(([slug, count]: [string, any]) => {
                const colors: Record<string, string> = {
                  platinum: "#a78bfa",
                  gold: "#f59e0b",
                  silver: "#94a3b8",
                  trial: "#6366f1",
                };
                return (
                  <div
                    key={slug}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: colors[slug] ?? "#6366f1",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        textTransform: "capitalize",
                      }}
                    >
                      {slug}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#e2e8f0",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}
        >
          {/* Recent Clients */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 22px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Building2 size={15} color="#6366f1" />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}
                >
                  Recent Clients
                </span>
              </div>
              <Link
                to="/admin/clients"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#6366f1",
                  fontWeight: 600,
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ padding: "8px 0" }}>
              {clients.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#475569",
                    fontSize: 12,
                    padding: "24px 0",
                  }}
                >
                  No clients yet
                </p>
              ) : (
                clients.map((c: any, i: number) => (
                  <div
                    key={c.id}
                    className="card-hover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 22px",
                      borderBottom:
                        i < clients.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <Avatar name={c.company_name} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#e2e8f0",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.company_name}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#475569",
                          margin: "2px 0 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.email}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <PlanBadge plan={c.subscription_plan} />
                      <StatusDot status={c.instance_status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Influencers */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 22px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={15} color="#f59e0b" />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}
                >
                  Pending Review
                </span>
                {pending.length > 0 && (
                  <span
                    style={{
                      background: "#f59e0b",
                      color: "#000",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 7px",
                    }}
                  >
                    {pending.length}
                  </span>
                )}
              </div>
              <Link
                to="/admin/influencers"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#6366f1",
                  fontWeight: 600,
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ padding: "8px 0" }}>
              {pending.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                  <p
                    style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}
                  >
                    All clear! No pending reviews.
                  </p>
                </div>
              ) : (
                pending.map((inf: any, i: number) => (
                  <div
                    key={inf.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      borderBottom:
                        i < pending.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                  >
                    <Avatar name={inf.full_name} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#e2e8f0",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {inf.full_name}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "#475569",
                          margin: "2px 0 0",
                        }}
                      >
                        {inf.niche} · {fmt(inf.follower_count)} followers
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button
                        className="action-btn"
                        style={{
                          background: "rgba(248,113,113,0.15)",
                          color: "#f87171",
                        }}
                        disabled={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(inf.id)}
                      >
                        <XCircle size={11} /> Reject
                      </button>
                      <button
                        className="action-btn"
                        style={{
                          background: "rgba(74,222,128,0.15)",
                          color: "#4ade80",
                        }}
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(inf.id)}
                      >
                        <CheckCircle size={11} /> Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Quick actions footer ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
          }}
        >
          {[
            {
              to: "/admin/clients",
              label: "Manage Clients",
              icon: Building2,
              color: "#6366f1",
            },
            {
              to: "/admin/influencers",
              label: "All Influencers",
              icon: Users,
              color: "#ec4899",
            },
            {
              to: "/admin/users",
              label: "User Management",
              icon: ShieldAlert,
              color: "#f59e0b",
            },
            {
              to: "/reports",
              label: "View Reports",
              icon: TrendingUp,
              color: "#10b981",
            },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <div
                className="card-hover"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={color} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#475569",
                      margin: "2px 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    Open <ArrowRight size={9} />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
