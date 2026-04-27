import { useState, useEffect } from "react";
import {
  Users,
  Building,
  Globe,
  DollarSign,
  Shield,
  TrendingUp,
} from "lucide-react";
import KPICard from "../../components/dashboard/KPICard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

interface Client {
  id: string;
  company_name: string;
  email: string;
  subscription_plan: string;
  instance_status: "active" | "blocked" | "pending";
  created_date: string;
}

interface Influencer {
  id: string;
  full_name: string;
  email: string;
  niche: string;
  follower_count: number;
  status: "pending" | "approved" | "rejected";
  created_date: string;
}

interface Subscription {
  id: string;
  client_id: string;
  amount: number;
  status: string;
  plan: string;
}

// Static data
const STATIC_CLIENTS: Client[] = [
  {
    id: "1",
    company_name: "TechCorp Solutions",
    email: "admin@techcorp.com",
    subscription_plan: "Enterprise",
    instance_status: "active",
    created_date: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    company_name: "Marketing Pro",
    email: "contact@marketingpro.com",
    subscription_plan: "Professional",
    instance_status: "active",
    created_date: "2026-01-20T10:00:00Z",
  },
  {
    id: "3",
    company_name: "BrandFlow Inc",
    email: "hello@brandflow.com",
    subscription_plan: "Basic",
    instance_status: "blocked",
    created_date: "2026-01-10T10:00:00Z",
  },
  {
    id: "4",
    company_name: "SocialBoost",
    email: "support@socialboost.com",
    subscription_plan: "Professional",
    instance_status: "active",
    created_date: "2026-02-01T10:00:00Z",
  },
  {
    id: "5",
    company_name: "Digital Nexus",
    email: "info@digitalnexus.com",
    subscription_plan: "Enterprise",
    instance_status: "pending",
    created_date: "2026-02-05T10:00:00Z",
  },
  {
    id: "6",
    company_name: "Creative Labs",
    email: "hello@creativelabs.com",
    subscription_plan: "Professional",
    instance_status: "active",
    created_date: "2026-02-10T10:00:00Z",
  },
];

const STATIC_INFLUENCERS: Influencer[] = [
  {
    id: "1",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    niche: "Fashion",
    follower_count: 125000,
    status: "approved",
    created_date: "2026-01-10T10:00:00Z",
  },
  {
    id: "2",
    full_name: "Mike Chen",
    email: "mike.chen@example.com",
    niche: "Technology",
    follower_count: 89000,
    status: "pending",
    created_date: "2026-01-15T10:00:00Z",
  },
  {
    id: "3",
    full_name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    niche: "Fitness",
    follower_count: 234000,
    status: "pending",
    created_date: "2026-01-20T10:00:00Z",
  },
  {
    id: "4",
    full_name: "David Kim",
    email: "david.kim@example.com",
    niche: "Food",
    follower_count: 56700,
    status: "approved",
    created_date: "2026-01-25T10:00:00Z",
  },
  {
    id: "5",
    full_name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    niche: "Travel",
    follower_count: 178000,
    status: "pending",
    created_date: "2026-02-01T10:00:00Z",
  },
  {
    id: "6",
    full_name: "Alex Rivera",
    email: "alex.rivera@example.com",
    niche: "Gaming",
    follower_count: 342000,
    status: "approved",
    created_date: "2026-02-05T10:00:00Z",
  },
];

const STATIC_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    client_id: "1",
    amount: 999,
    status: "active",
    plan: "enterprise",
  },
  {
    id: "2",
    client_id: "2",
    amount: 499,
    status: "active",
    plan: "professional",
  },
  {
    id: "3",
    client_id: "3",
    amount: 199,
    status: "cancelled",
    plan: "basic",
  },
  {
    id: "4",
    client_id: "4",
    amount: 499,
    status: "active",
    plan: "professional",
  },
  {
    id: "5",
    client_id: "5",
    amount: 999,
    status: "pending",
    plan: "enterprise",
  },
  {
    id: "6",
    client_id: "6",
    amount: 499,
    status: "active",
    plan: "professional",
  },
];

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      // Simulate API loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setClients(STATIC_CLIENTS);
      setInfluencers(STATIC_INFLUENCERS);
      setSubscriptions(STATIC_SUBSCRIPTIONS);
      setLoading(false);
    };
    load();
  }, []);

  const activeClients: number = clients.filter(
    (c) => c.instance_status === "active",
  ).length;
  const totalRevenue: number = subscriptions.reduce(
    (sum, s) => sum + (s.amount || 0),
    0,
  );
  const pendingInfluencers: number = influencers.filter(
    (i) => i.status === "pending",
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Clients"
          value={clients.length}
          icon={Building}
          color="text-blue-600"
          bg="bg-blue-500/10"
        />
        <KPICard
          title="Active Instances"
          value={activeClients}
          icon={Users}
          color="text-emerald-600"
          bg="bg-emerald-500/10"
        />
        <KPICard
          title="Influencers"
          value={influencers.length}
          icon={Globe}
          color="text-violet-600"
          bg="bg-violet-500/10"
        />
        <KPICard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-amber-600"
          bg="bg-amber-500/10"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold">Recent Clients</h3>
            <Link to="/admin/clients">
              <Button variant="ghost" size="sm" className="rounded-lg text-xs">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {clients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{client.company_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {client.subscription_plan}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      client.instance_status === "active"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : client.instance_status === "blocked"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {client.instance_status}
                  </Badge>
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No clients yet
              </p>
            )}
          </div>
        </div>

        {/* Pending Influencers */}
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold">
              Pending Influencers ({pendingInfluencers})
            </h3>
            <Link to="/admin/influencers">
              <Button variant="ghost" size="sm" className="rounded-lg text-xs">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {influencers
              .filter((i) => i.status === "pending")
              .slice(0, 5)
              .map((inf) => (
                <div
                  key={inf.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{inf.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inf.niche} • {inf.follower_count?.toLocaleString()}{" "}
                      followers
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/10 text-amber-600 text-xs"
                  >
                    Pending
                  </Badge>
                </div>
              ))}
            {pendingInfluencers === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending applications
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Optional: Display debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground text-center">
          <p>
            Demo Mode: {clients.length} clients, {influencers.length}{" "}
            influencers, ${totalRevenue.toLocaleString()} revenue
          </p>
        </div>
      )}
    </div>
  );
}
