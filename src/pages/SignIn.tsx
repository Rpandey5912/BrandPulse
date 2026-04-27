import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DEMO_EMAIL = "demo@brandpulse.io";
const DEMO_PASSWORD = "BrandPulse2024!";

// Mock user credentials for demo
const VALID_CREDENTIALS = [
  {
    email: "demo@brandpulse.io",
    password: "BrandPulse2024!",
    role: "client",
    name: "Demo User",
  },
  {
    email: "admin@brandpulse.io",
    password: "Admin123!",
    role: "admin",
    name: "Admin User",
  },
  {
    email: "client@brandpulse.io",
    password: "Client123!",
    role: "client",
    name: "Test Client",
  },
  {
    email: "john@example.com",
    password: "password123",
    role: "client",
    name: "John Doe",
  },
];

// Store current user session in memory
let currentSession: { email: string; role: string; name: string } | null = null;

export default function SignIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check credentials
    const user = VALID_CREDENTIALS.find(
      (cred) => cred.email === form.email && cred.password === form.password,
    );

    if (user) {
      // Store session
      currentSession = {
        email: user.email,
        role: user.role,
        name: user.name,
      };

      // Store in localStorage for persistence across refreshes
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.name}`,
      });

      navigate("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check demo credentials
    const demoUser = VALID_CREDENTIALS.find(
      (cred) => cred.email === DEMO_EMAIL && cred.password === DEMO_PASSWORD,
    );

    if (demoUser) {
      // Store session
      currentSession = {
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
      };

      // Store in localStorage
      localStorage.setItem("userRole", demoUser.role);
      localStorage.setItem("userEmail", demoUser.email);
      localStorage.setItem("userName", demoUser.name);
      localStorage.setItem("isAuthenticated", "true");

      toast({
        title: "Welcome to the demo!",
        description: "You're now signed in with demo credentials.",
      });

      navigate("/dashboard");
    } else {
      // If demo user doesn't exist, redirect to demo page
      navigate("/demo");
    }

    setDemoLoading(false);
  };

  const fillDemo = () => {
    setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl text-white">
            BrandPulse
          </span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="font-heading text-4xl font-extrabold text-white leading-tight">
            Welcome back to
            <br />
            your Brand Hub
          </h2>
          <p className="text-white/80 text-lg max-w-sm">
            Track campaigns, manage influencers, and grow your brand — all in
            one place.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: "Active Clients", value: "500+" },
              { label: "Campaigns Tracked", value: "12K+" },
              { label: "Avg ROI Boost", value: "3.2×" },
              { label: "Influencers", value: "8K+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <p className="font-heading font-bold text-2xl text-white">
                  {stat.value}
                </p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/50 text-sm">
          © 2026 BrandPulse. All rights reserved.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-lg">
              BrandPulse
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight">
              Sign in
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Demo credentials card */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-heading font-bold text-amber-800">
                Try the Demo
              </p>
            </div>
            <p className="text-xs text-amber-700 mb-3">
              Explore BrandPulse with these demo credentials:
            </p>
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Mail className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-900 font-medium">
                    {DEMO_EMAIL}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-900 font-medium">
                    {DEMO_PASSWORD}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={fillDemo}
                variant="outline"
                className="flex-1 h-9 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-100 text-xs"
              >
                Fill Credentials
              </Button>
              <Button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="flex-1 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium"
              >
                {demoLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Quick Login
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                or sign in with your account
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="you@company.com"
                  className="pl-10 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  className="pl-10 pr-10 rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Get started free
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            <Link
              to="/demo"
              className="text-muted-foreground hover:text-foreground hover:underline text-xs"
            >
              View interactive demo instead →
            </Link>
          </p>
        </div>
      </div>

      {/* Optional: Display debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 p-2 bg-black/80 text-white text-xs rounded-lg">
          Demo Credentials: demo@brandpulse.io / BrandPulse2024!
        </div>
      )}
    </div>
  );
}
