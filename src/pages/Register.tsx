import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const industries = [
  "Technology",
  "Food & Beverage",
  "Fashion",
  "Health & Wellness",
  "Travel",
  "Education",
  "Finance",
  "Entertainment",
  "Other",
];
const platforms = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Google"];

const planDetails = {
  trial: { name: "Trial", price: "Free for 3 months", color: "border-muted" },
  silver: { name: "Silver", price: "$99/month", color: "border-blue-500" },
  gold: { name: "Gold", price: "$249/month", color: "border-amber-500" },
  platinum: {
    name: "Platinum",
    price: "$499/month",
    color: "border-violet-500",
  },
};

interface FormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  subscription_plan: string;
  social_platforms: string[];
}

// Store clients in memory (simulating database)
interface StoredClient {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  subscription_plan: string;
  social_platforms: string[];
  subscription_status: string;
  instance_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  created_date: string;
}

let registeredClients: StoredClient[] = [];

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    industry: "",
    website: "",
    subscription_plan: "trial",
    social_platforms: [],
  });

  const handlePlatformToggle = (platform: string): void => {
    setForm((prev) => ({
      ...prev,
      social_platforms: prev.social_platforms.includes(platform)
        ? prev.social_platforms.filter((p) => p !== platform)
        : [...prev.social_platforms, platform],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const now = new Date().toISOString();
    const endDate = new Date();
    if (form.subscription_plan === "trial") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create new client
    const newClient: StoredClient = {
      id: Math.random().toString(36).substr(2, 9),
      ...form,
      subscription_status:
        form.subscription_plan === "trial" ? "active" : "pending_payment",
      instance_status:
        form.subscription_plan === "trial" ? "active" : "pending",
      subscription_start_date: now,
      subscription_end_date: endDate.toISOString(),
      created_date: now,
    };

    // Store in memory
    registeredClients.push(newClient);
    console.log("New client registered:", newClient);
    console.log("Total clients:", registeredClients.length);

    setLoading(false);

    if (form.subscription_plan === "trial") {
      toast({
        title: "Welcome to BrandPulse!",
        description: "Your 3-month free trial has started.",
      });
      navigate("/dashboard");
    } else {
      // Store client ID in session storage for payment page
      sessionStorage.setItem("pendingClientId", newClient.id);
      navigate(
        `/payment?plan=${form.subscription_plan}&client_id=${newClient.id}`,
      );
    }
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
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold">
            Get Started with BrandPulse
          </h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Create your account and start tracking your brand performance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Plan Selection */}
          <div>
            <Label className="text-base font-heading font-bold mb-3 block">
              Choose Your Plan
            </Label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(planDetails).map(([key, plan]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, subscription_plan: key }))
                  }
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    form.subscription_plan === key
                      ? `${plan.color} bg-primary/5`
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {form.subscription_plan === key && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <p className="font-heading font-bold text-sm">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.price}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input
                required
                value={form.company_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({ ...prev, company_name: e.target.value }))
                }
                placeholder="Acme Inc."
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Name *</Label>
              <Input
                required
                value={form.contact_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({ ...prev, contact_name: e.target.value }))
                }
                placeholder="John Doe"
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
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="john@acme.com"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select
                value={form.industry}
                onValueChange={(v: string) =>
                  setForm((prev) => ({ ...prev, industry: v }))
                }
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://acme.com"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <Label className="text-base font-heading font-bold mb-3 block">
              Social Media Platforms
            </Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    form.social_platforms.includes(platform)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {form.social_platforms.includes(platform) && (
                    <Check className="w-4 h-4" />
                  )}
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-xl text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </div>
            ) : (
              "Create Account & Start Free Trial"
            )}
          </Button>
        </form>

        {/* Optional: Display debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-muted rounded-xl text-xs text-muted-foreground">
            <p className="font-medium mb-1">Debug Info:</p>
            <p>Total registrations: {registeredClients.length}</p>
            <p className="mt-1 text-[11px]">
              Note: Client data is stored in memory and will reset on page
              refresh.
              {form.subscription_plan !== "trial" &&
                " Paid plans will redirect to payment page."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
