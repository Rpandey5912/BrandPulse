import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, ArrowLeft, Check, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

declare const process: any;

type Platform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Google";
type Niche =
  | "Food"
  | "Travel"
  | "Technology"
  | "Fashion"
  | "Fitness"
  | "Beauty"
  | "Gaming"
  | "Education"
  | "Finance"
  | "Lifestyle"
  | "Entertainment"
  | "Health";

interface InfluencerFormData {
  full_name: string;
  email: string;
  phone: string;
  niche: Niche | "";
  platforms: Platform[];
  follower_count: string;
  engagement_rate: string;
  portfolio_url: string;
  bio: string;
  rate_per_post: string;
  location: string;
}

// Store applications in memory (simulating database)
let influencerApplications: any[] = [];

const niches: Niche[] = [
  "Food",
  "Travel",
  "Technology",
  "Fashion",
  "Fitness",
  "Beauty",
  "Gaming",
  "Education",
  "Finance",
  "Lifestyle",
  "Entertainment",
  "Health",
];
const platforms: Platform[] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "LinkedIn",
  "Google",
];

export default function InfluencerRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<InfluencerFormData>({
    full_name: "",
    email: "",
    phone: "",
    niche: "",
    platforms: [],
    follower_count: "",
    engagement_rate: "",
    portfolio_url: "",
    bio: "",
    rate_per_post: "",
    location: "",
  });

  const handlePlatformToggle = (platform: Platform): void => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create new influencer application
    const newInfluencer = {
      id: Math.random().toString(36).substr(2, 9),
      ...form,
      follower_count: parseInt(form.follower_count) || 0,
      engagement_rate: parseFloat(form.engagement_rate) || 0,
      rate_per_post: parseFloat(form.rate_per_post) || 0,
      status: "pending",
      created_date: new Date().toISOString(),
    };

    // Store in memory
    influencerApplications.push(newInfluencer);

    // Log for debugging
    console.log("New influencer application submitted:", newInfluencer);
    console.log("Total applications:", influencerApplications.length);

    toast({
      title: "Application Submitted!",
      description: "We'll review your profile and get back to you soon.",
    });

    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold">
            Join as an Influencer
          </h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Register to be part of our influencer network and connect with top
          brands.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                required
                value={form.full_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, full_name: e.target.value }))
                }
                placeholder="Jane Smith"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="jane@example.com"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Los Angeles, CA"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Your Niche *</Label>
            <Select
              required
              value={form.niche}
              onValueChange={(v: Niche) => setForm((p) => ({ ...p, niche: v }))}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Choose your niche" />
              </SelectTrigger>
              <SelectContent>
                {niches.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Platforms</Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    form.platforms.includes(platform)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {form.platforms.includes(platform) && (
                    <Check className="w-4 h-4" />
                  )}
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Follower Count</Label>
              <Input
                type="number"
                value={form.follower_count}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, follower_count: e.target.value }))
                }
                placeholder="50000"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Engagement Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.engagement_rate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, engagement_rate: e.target.value }))
                }
                placeholder="3.5"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Rate Per Post ($)</Label>
              <Input
                type="number"
                value={form.rate_per_post}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, rate_per_post: e.target.value }))
                }
                placeholder="500"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Portfolio URL</Label>
            <Input
              value={form.portfolio_url}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((p) => ({ ...p, portfolio_url: e.target.value }))
              }
              placeholder="https://your-portfolio.com"
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, bio: e.target.value }))
              }
              placeholder="Tell us about yourself and your content..."
              className="rounded-xl"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-xl text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>

        {/* Optional: Display submitted applications count for debugging */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-muted rounded-xl text-xs text-muted-foreground">
            <p className="font-medium mb-1">Debug Info:</p>
            <p>Total applications submitted: {influencerApplications.length}</p>
            <p className="mt-1 text-[11px]">
              Note: Applications are stored in memory and will reset on page
              refresh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
