import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Globe, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type InfluencerStatus = "pending" | "approved" | "rejected";

interface Influencer {
  id: string;
  full_name: string;
  email: string;
  niche: string;
  platforms: string[];
  follower_count: number;
  engagement_rate: number;
  rate_per_post: number;
  bio?: string;
  status: InfluencerStatus;
  [key: string]: any;
}

// Static data
const STATIC_INFLUENCERS: Influencer[] = [
  {
    id: "1",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    niche: "Fashion & Lifestyle",
    platforms: ["Instagram", "TikTok"],
    follower_count: 125000,
    engagement_rate: 4.8,
    rate_per_post: 850,
    bio: "Fashion enthusiast sharing style tips and sustainable fashion choices. Lover of all things creative!",
    status: "pending",
  },
  {
    id: "2",
    full_name: "Mike Chen",
    email: "mike.chen@example.com",
    niche: "Technology",
    platforms: ["YouTube", "Twitter", "Instagram"],
    follower_count: 89000,
    engagement_rate: 5.2,
    rate_per_post: 1200,
    bio: "Tech reviewer and digital creator. Unboxing the latest gadgets and sharing honest reviews.",
    status: "approved",
  },
  {
    id: "3",
    full_name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    niche: "Fitness & Wellness",
    platforms: ["Instagram", "TikTok", "YouTube"],
    follower_count: 234000,
    engagement_rate: 6.1,
    rate_per_post: 1500,
    bio: "Certified personal trainer helping you achieve your fitness goals. Daily workouts and nutrition tips.",
    status: "pending",
  },
  {
    id: "4",
    full_name: "David Kim",
    email: "david.kim@example.com",
    niche: "Food & Cooking",
    platforms: ["Instagram", "YouTube"],
    follower_count: 56700,
    engagement_rate: 3.9,
    rate_per_post: 600,
    bio: "Home chef sharing easy and delicious recipes. Food photography and cooking tutorials.",
    status: "rejected",
  },
  {
    id: "5",
    full_name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    niche: "Travel",
    platforms: ["Instagram", "TikTok", "YouTube"],
    follower_count: 178000,
    engagement_rate: 5.5,
    rate_per_post: 1300,
    bio: "Travel blogger exploring hidden gems around the world. Adventure awaits!",
    status: "approved",
  },
  {
    id: "6",
    full_name: "Alex Rivera",
    email: "alex.rivera@example.com",
    niche: "Gaming",
    platforms: ["Twitch", "YouTube", "Twitter"],
    follower_count: 342000,
    engagement_rate: 7.2,
    rate_per_post: 2000,
    bio: "Professional gamer and streamer. Live streams daily and creates gaming content.",
    status: "pending",
  },
  {
    id: "7",
    full_name: "Nina Patel",
    email: "nina.patel@example.com",
    niche: "Beauty",
    platforms: ["Instagram", "YouTube", "TikTok"],
    follower_count: 456000,
    engagement_rate: 4.5,
    rate_per_post: 1800,
    bio: "Makeup artist and beauty influencer. Product reviews and makeup tutorials.",
    status: "approved",
  },
  {
    id: "8",
    full_name: "Tom Wilson",
    email: "tom.wilson@example.com",
    niche: "Business",
    platforms: ["LinkedIn", "Twitter"],
    follower_count: 34500,
    engagement_rate: 3.2,
    rate_per_post: 450,
    bio: "Entrepreneur sharing business insights and leadership tips.",
    status: "pending",
  },
];

const statusColors: Record<InfluencerStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-rose-500/10 text-rose-600",
};

export default function ManageInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const { toast } = useToast();

  const loadInfluencers = async (): Promise<void> => {
    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInfluencers(STATIC_INFLUENCERS);
    setLoading(false);
  };

  useEffect(() => {
    loadInfluencers();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: InfluencerStatus,
  ): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setInfluencers((prevInfluencers) =>
      prevInfluencers.map((influencer) =>
        influencer.id === id ? { ...influencer, status } : influencer,
      ),
    );

    toast({ title: `Influencer ${status}` });
  };

  const filtered = influencers.filter(
    (i) =>
      i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.niche?.toLowerCase().includes(search.toLowerCase()),
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
          Manage Influencers
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage influencer applications
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search influencers..."
          className="pl-10 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No influencers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inf) => (
            <div
              key={inf.id}
              className="bg-card rounded-2xl border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-bold">{inf.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{inf.email}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${statusColors[inf.status]}`}
                >
                  {inf.status}
                </Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{inf.niche}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inf.platforms?.map((p: string) => (
                    <span
                      key={p}
                      className="text-xs bg-muted px-2 py-1 rounded-md"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-bold text-sm">
                      {(inf.follower_count || 0).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {inf.engagement_rate || 0}%
                    </p>
                    <p className="text-muted-foreground">Engagement</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      ${inf.rate_per_post || 0}
                    </p>
                    <p className="text-muted-foreground">Per Post</p>
                  </div>
                </div>
              </div>
              {inf.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                  {inf.bio}
                </p>
              )}
              {inf.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatusChange(inf.id, "approved")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl text-destructive border-destructive/30"
                    onClick={() => handleStatusChange(inf.id, "rejected")}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
