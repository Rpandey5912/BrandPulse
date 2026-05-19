/**
 * BrandPulse API Service — FastAPI backend
 * Set VITE_API_URL in your .env:
 *   VITE_API_URL=http://localhost:8001/
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001/api/v1";

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem("bp_token");
export const setToken = (t: string) => localStorage.setItem("bp_token", t);
export const clearToken = () => localStorage.removeItem("bp_token");

// ── Base fetch ────────────────────────────────────────────────────────────────
async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    // FastAPI validation errors come back as { detail: string | [...] }
    const message =
      typeof data.detail === "string"
        ? data.detail
        : (data.message ?? "API error");
    throw Object.assign(new Error(message), {
      response: data,
      status: res.status,
    });
  }

  return data;
}

const get = <T>(path: string) => apiFetch<T>(path, { method: "GET" });
const post = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) });
const patch = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
const del = <T>(path: string) => apiFetch<T>(path, { method: "DELETE" });

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// FastAPI response: { access_token, token_type, user }  (no "data" wrapper)
// ═══════════════════════════════════════════════════════════════════════════════
export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export const AuthAPI = {
  register: (payload: {
    company_name: string;
    contact_name: string;
    email: string;
    password: string;
    phone?: string;
    industry?: string;
    website?: string;
    subscription_plan?: string;
    social_platforms?: string[];
  }) => post<AuthResponse>("/auth/register", payload),

  login: (email: string, password: string) =>
    post<AuthResponse>("/auth/login", { email, password }),

  logout: () => post<{ message: string }>("/auth/logout", {}),

  // Response: { user, tenant }  — no "data" wrapper
  me: () => get<{ user: User; tenant: Tenant }>("/auth/me"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// APP SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
export const SettingsAPI = {
  getPublic: () => get<AppPublicSettings>("/settings/public"),
  getProfile: () => get<User>("/settings/profile"),
  updateProfile: (body: Partial<Pick<User, "name" | "email">>) =>
    put<User>("/settings/profile", body),

  // FastAPI uses `new_password` (no password_confirmation)
  updatePassword: (body: { current_password: string; new_password: string }) =>
    put<{ message: string }>("/settings/password", body),

  // Admin-only: was /admin/settings, now /settings/admin
  updateAdminSettings: (body: Partial<AppPublicSettings>) =>
    put<AppPublicSettings>("/settings/admin", body),
};

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardAPI = {
  full: () => get("/dashboard"),
  kpis: () => get("/dashboard/kpis"),
  revenueChart: () => get("/dashboard/revenue"),
  funnel: () => get("/dashboard/funnel"),
  platformBreakdown: () => get("/dashboard/platforms"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════════════════
export const CampaignsAPI = {
  list: (params?: {
    status?: string;
    platform?: string;
    search?: string;
    sort_by?: string;
    order?: "asc" | "desc"; // FastAPI uses `order`, not `sort_dir`
    per_page?: number;
    page?: number;
  }) => get<Paginated<Campaign>>("/campaigns" + buildQuery(params)),

  get: (id: string) => get<Campaign>(`/campaigns/${id}`),
  create: (body: Partial<Campaign>) => post<Campaign>("/campaigns", body),
  update: (id: string, body: Partial<Campaign>) =>
    put<Campaign>(`/campaigns/${id}`, body),
  delete: (id: string) => del(`/campaigns/${id}`),
  updateStatus: (id: string, status: string) =>
    patch<Campaign>(`/campaigns/${id}/status`, { status }),

  // Metrics
  getMetrics: (
    campaignId: string,
    params?: { date_from?: string; date_to?: string },
  ) =>
    get<{ data: CampaignMetric[] }>(
      `/campaigns/${campaignId}/metrics` + buildQuery(params),
    ),
  addMetrics: (campaignId: string, body: Partial<CampaignMetric>) =>
    post<CampaignMetric>(`/campaigns/${campaignId}/metrics`, body),
  updateMetric: (
    campaignId: string,
    metricId: string,
    body: Partial<CampaignMetric>,
  ) =>
    put<CampaignMetric>(`/campaigns/${campaignId}/metrics/${metricId}`, body),
};

// ═══════════════════════════════════════════════════════════════════════════════
// INFLUENCERS
// ═══════════════════════════════════════════════════════════════════════════════
export const InfluencersAPI = {
  list: (params?: {
    status?: string;
    niche?: string;
    search?: string;
    min_followers?: number;
    sort_by?: string;
    order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }) => get<Paginated<Influencer>>("/influencers" + buildQuery(params)),

  get: (id: string) => get<Influencer>(`/influencers/${id}`),
  create: (body: Partial<Influencer>) => post<Influencer>("/influencers", body),
  update: (id: string, body: Partial<Influencer>) =>
    put<Influencer>(`/influencers/${id}`, body),
  delete: (id: string) => del(`/influencers/${id}`),
  approve: (id: string) => patch<Influencer>(`/influencers/${id}/approve`),
  reject: (id: string) => patch<Influencer>(`/influencers/${id}/reject`),

  // Public self-registration (no auth)
  selfRegister: (body: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    niche: string;
    bio?: string;
    portfolio_url?: string;
    follower_count?: number;
    engagement_rate?: number;
    rate_per_post?: number;
    tenant_id: string;
    platforms?: { platform: string; handle?: string; followers?: number }[];
  }) => post<Influencer>("/influencers/register", body),
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLLAB REQUESTS
// FastAPI replaced due_date/message with deliverable_type/description
// ═══════════════════════════════════════════════════════════════════════════════
export const CollabAPI = {
  list: (params?: {
    status?: string;
    campaign_id?: string;
    influencer_id?: string;
    per_page?: number;
    page?: number;
  }) => get<Paginated<CollabRequest>>("/collab-requests" + buildQuery(params)),
  get: (id: string) => get<CollabRequest>(`/collab-requests/${id}`),
  create: (body: {
    campaign_id: string;
    influencer_id: string;
    agreed_fee: number;
    deliverable_type?: string;
    description?: string;
  }) => post<CollabRequest>("/collab-requests", body),
  update: (id: string, body: Partial<CollabRequest>) =>
    put<CollabRequest>(`/collab-requests/${id}`, body),
  delete: (id: string) => del(`/collab-requests/${id}`),
  respond: (id: string, status: "accepted" | "declined") =>
    patch<CollabRequest>(`/collab-requests/${id}/respond`, { status }),
  deliver: (
    id: string,
    body: { deliverable_url: string; deliverable_notes?: string },
  ) => patch<CollabRequest>(`/collab-requests/${id}/deliver`, body),
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLANS
// ═══════════════════════════════════════════════════════════════════════════════
export const PlansAPI = {
  list: () => get<{ data: Plan[] }>("/plans"),
  get: (slug: string) => get<Plan>(`/plans/${slug}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION & PAYMENTS
// FastAPI: upgrade takes plan_id (not plan_slug); billing_cycle: "monthly"|"annually"
// ═══════════════════════════════════════════════════════════════════════════════
export const SubscriptionAPI = {
  current: () => get<Subscription>("/subscription"),
  upgrade: (plan_id: string, billing_cycle?: "monthly" | "annually") =>
    post<Subscription>("/subscription/upgrade", { plan_id, billing_cycle }),
  cancel: () => post<{ message: string }>("/subscription/cancel", {}),
};

export const PaymentsAPI = {
  list: () => get<{ data: Payment[] }>("/payments"),
  get: (id: string) => get<Payment>(`/payments/${id}`),
  // FastAPI: payment_method (not method), transaction_id (not gateway_ref)
  create: (body: {
    subscription_id: string;
    amount: number;
    payment_method: string;
    transaction_id?: string;
  }) => post<Payment>("/payments", body),
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// FastAPI uses period_start / period_end (not date_from / date_to)
// ═══════════════════════════════════════════════════════════════════════════════
export const ReportsAPI = {
  summary: (params?: { period_start?: string; period_end?: string }) =>
    get("/reports/summary" + buildQuery(params)),
  campaigns: (params?: { period_start?: string; period_end?: string }) =>
    get("/reports/campaigns" + buildQuery(params)),
  influencers: () => get("/reports/influencers"),
  revenue: (params?: { months?: number }) =>
    get("/reports/revenue" + buildQuery(params)),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
export const AdminAPI = {
  // Clients (tenants)
  listClients: (params?: Record<string, any>) =>
    get<Paginated<Tenant>>("/admin/clients" + buildQuery(params)),
  getClient: (id: string) => get<Tenant>(`/admin/clients/${id}`),
  createClient: (body: Partial<Tenant>) => post<Tenant>("/admin/clients", body),
  updateClient: (id: string, body: Partial<Tenant>) =>
    put<Tenant>(`/admin/clients/${id}`, body),
  deleteClient: (id: string) => del(`/admin/clients/${id}`),
  blockClient: (id: string) => patch<Tenant>(`/admin/clients/${id}/block`),
  unblockClient: (id: string) => patch<Tenant>(`/admin/clients/${id}/unblock`),

  // Users
  listUsers: (params?: Record<string, any>) =>
    get<Paginated<User>>("/admin/users" + buildQuery(params)),
  getUser: (id: string) => get<User>(`/admin/users/${id}`),
  createUser: (body: any) => post<User>("/admin/users", body),
  updateUser: (id: string, body: any) => put<User>(`/admin/users/${id}`, body),
  deleteUser: (id: string) => del(`/admin/users/${id}`),
  toggleActive: (id: string) => patch<User>(`/admin/users/${id}/toggle-active`),

  // Influencers
  listInfluencers: (params?: Record<string, any>) =>
    get<Paginated<Influencer>>("/admin/influencers" + buildQuery(params)),

  // Settings — was /admin/settings, now /settings/admin
  updateSettings: (body: Partial<AppPublicSettings>) =>
    put<AppPublicSettings>("/settings/admin", body),

  // Reports — was /admin/reports/overview, now /reports/admin/overview
  overview: () => get("/reports/admin/overview"),

  // Plans
  createPlan: (body: any) => post<Plan>("/plans", body),
  updatePlan: (id: string, body: any) => put<Plan>(`/plans/${id}`, body),
  deletePlan: (id: string) => del(`/plans/${id}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  is_active: boolean;
  tenant_id?: string;
  company_name?: string;
  last_login_at?: string;
  created_at?: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  slug: string;
  email?: string;
  instance_status: "active" | "blocked" | "pending";
  subscription_plan: string;
  subscription_status: "active" | "inactive" | "cancelled" | "pending_payment";
  trial_ends_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Google";
  status: "draft" | "active" | "paused" | "completed";
  budget: number;
  spend: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  metrics_count?: number;
  collab_requests_count?: number;
}

export interface CampaignMetric {
  id?: string;
  campaign_id?: string;
  metric_date: string;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  created_at?: string;
  updated_at?: string;
}

export interface Influencer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  niche: string;
  bio?: string;
  portfolio_url?: string;
  follower_count: number;
  engagement_rate: number;
  rate_per_post?: number;
  status: "pending" | "approved" | "rejected";
  platforms?: InfluencerPlatform[];
  collab_requests_count?: number;
}

export interface InfluencerPlatform {
  id?: string;
  platform: string;
  handle?: string;
  followers: number;
}

export interface CollabRequest {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: "pending" | "accepted" | "declined" | "delivered" | "completed";
  agreed_fee: number;
  deliverable_type?: string;
  description?: string;
  deliverable_url?: string;
  deliverable_notes?: string;
  responded_at?: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_annual?: number;
  max_campaigns?: number;
  max_platforms?: number;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: "active" | "pending_payment" | "cancelled";
  billing_cycle?: "monthly" | "annually";
  starts_at?: string;
  ends_at?: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: "paid" | "pending" | "failed";
  paid_by?: string;
  paid_at?: string;
  created_at?: string;
}

export interface AppPublicSettings {
  app_name: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  supported_plans: string[];
  default_plan: string;
}

// Standard paginated response shape from FastAPI
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}
