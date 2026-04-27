import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

type InstanceStatus = "active" | "blocked" | "pending";
type SubscriptionPlan = "trial" | "silver" | "gold" | "platinum";
type SubscriptionStatus = "active" | "inactive" | "canceled" | "pending";

interface Client {
  id: string;
  company_name: string;
  email: string;
  industry?: string;
  contact_name?: string;
  subscription_plan: SubscriptionPlan;
  instance_status: InstanceStatus;
  subscription_status: SubscriptionStatus;
  created_date: string;
  [key: string]: any;
}

// Static data
const STATIC_CLIENTS: Client[] = [
  {
    id: "1",
    company_name: "TechCorp Solutions",
    email: "admin@techcorp.com",
    industry: "Technology",
    contact_name: "John Smith",
    subscription_plan: "platinum",
    instance_status: "active",
    subscription_status: "active",
    created_date: "2024-01-15",
  },
  {
    id: "2",
    company_name: "Marketing Pro",
    email: "contact@marketingpro.com",
    industry: "Marketing",
    contact_name: "Sarah Johnson",
    subscription_plan: "gold",
    instance_status: "active",
    subscription_status: "active",
    created_date: "2024-01-20",
  },
  {
    id: "3",
    company_name: "BrandFlow Inc",
    email: "hello@brandflow.com",
    industry: "Branding",
    contact_name: "Mike Chen",
    subscription_plan: "silver",
    instance_status: "blocked",
    subscription_status: "inactive",
    created_date: "2024-01-10",
  },
  {
    id: "4",
    company_name: "SocialBoost",
    email: "support@socialboost.com",
    industry: "Social Media",
    contact_name: "Emma Rodriguez",
    subscription_plan: "gold",
    instance_status: "pending",
    subscription_status: "pending",
    created_date: "2024-02-01",
  },
  {
    id: "5",
    company_name: "Digital Nexus",
    email: "info@digitalnexus.com",
    industry: "Digital Agency",
    contact_name: "David Kim",
    subscription_plan: "platinum",
    instance_status: "active",
    subscription_status: "active",
    created_date: "2024-01-05",
  },
  {
    id: "6",
    company_name: "Creative Minds",
    email: "hello@creativeminds.com",
    industry: "Creative Agency",
    contact_name: "Lisa Thompson",
    subscription_plan: "trial",
    instance_status: "pending",
    subscription_status: "pending",
    created_date: "2024-02-10",
  },
  {
    id: "7",
    company_name: "DataDrive Analytics",
    email: "contact@datadrive.com",
    industry: "Analytics",
    contact_name: "James Wilson",
    subscription_plan: "silver",
    instance_status: "active",
    subscription_status: "active",
    created_date: "2024-01-25",
  },
  {
    id: "8",
    company_name: "Growth Hackers",
    email: "team@growthhackers.com",
    industry: "Growth Marketing",
    contact_name: "Rachel Green",
    subscription_plan: "gold",
    instance_status: "blocked",
    subscription_status: "canceled",
    created_date: "2024-01-18",
  },
];

const statusColors: Record<InstanceStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  blocked: "bg-rose-500/10 text-rose-600",
  pending: "bg-amber-500/10 text-amber-600",
};

const planColors: Record<SubscriptionPlan, string> = {
  trial: "bg-muted text-muted-foreground",
  silver: "bg-blue-500/10 text-blue-600",
  gold: "bg-amber-500/10 text-amber-600",
  platinum: "bg-violet-500/10 text-violet-600",
};

export default function ManageClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const { toast } = useToast();

  const loadClients = async (): Promise<void> => {
    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setClients(STATIC_CLIENTS);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleStatusChange = async (
    clientId: string,
    newStatus: InstanceStatus,
  ): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId
          ? { 
              ...client, 
              instance_status: newStatus,
              subscription_status: newStatus === "active" ? "active" : client.subscription_status
            }
          : client
      )
    );
    
    toast({ title: `Instance ${newStatus}` });
  };

  const handleDelete = async (clientId: string): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    toast({ title: "Client instance deleted" });
  };

  const handleCreateInstance = async (clientId: string): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId
          ? { 
              ...client, 
              instance_status: "active",
              subscription_status: "active"
            }
          : client
      )
    );
    
    toast({ title: "Dashboard instance created and activated" });
  };

  const filtered = clients.filter(
    (c) =>
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

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
          Manage Clients
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage client instances and subscriptions
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search clients..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Company
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Contact
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Instance
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Subscription
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Created
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{client.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.industry}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{client.contact_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`capitalize text-xs ${planColors[client.subscription_plan] || ""}`}
                    >
                      {client.subscription_plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`capitalize text-xs ${statusColors[client.instance_status] || ""}`}
                    >
                      {client.instance_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`capitalize text-xs ${
                        client.subscription_status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {client.subscription_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {moment(client.created_date).format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg h-8 w-8"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {client.instance_status !== "active" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(client.id, "active")
                            }
                          >
                            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />{" "}
                            Activate Instance
                          </DropdownMenuItem>
                        )}
                        {client.instance_status === "active" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(client.id, "blocked")
                            }
                          >
                            <ShieldOff className="w-4 h-4 mr-2 text-amber-600" />{" "}
                            Block Instance
                          </DropdownMenuItem>
                        )}
                        {client.instance_status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleCreateInstance(client.id)}
                          >
                            <Plus className="w-4 h-4 mr-2 text-blue-600" />{" "}
                            Create Instance
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Instance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}