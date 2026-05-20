import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { BarChart3, Shield, Eye, EyeOff, KeyRound } from "lucide-react";
import { AuthAPI, setToken } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function AdminRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAppState } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    admin_key: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res: any = await AuthAPI.adminRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        admin_key: form.admin_key,
      });
      setToken(res.access_token);
      await checkAppState();
      toast({ title: "Admin account created!", description: "Welcome to BrandPulse." });
      navigate("/admin");
    } catch (err: any) {
      const detail = err?.response?.detail;
      const msg = typeof detail === "string" ? detail : (err.message ?? "Registration failed");
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-10 text-white">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl">BrandPulse</span>
        </Link>

        <div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight mb-3">
            Admin Registration
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Create a system administrator account. This page is restricted — you'll need the admin registration key to proceed.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Full access to all client dashboards",
              "Manage users, subscriptions & payments",
              "View system-wide analytics & reports",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-300 mt-1.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} BrandPulse. Internal use only.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-base">BrandPulse</span>
          </Link>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="font-heading text-2xl font-extrabold">Create Admin Account</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            Restricted to authorised personnel only.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Smith"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="admin@brandpulse.com"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 8 chars, upper, lower, number"
                  className="rounded-xl h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm Password *</Label>
              <Input
                id="confirm_password"
                type="password"
                required
                value={form.confirm_password}
                onChange={set("confirm_password")}
                placeholder="Repeat password"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin_key" className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Admin Registration Key *
              </Label>
              <div className="relative">
                <Input
                  id="admin_key"
                  type={showKey ? "text" : "password"}
                  required
                  value={form.admin_key}
                  onChange={set("admin_key")}
                  placeholder="Enter the admin key"
                  className="rounded-xl h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowKey((v) => !v)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your system owner to obtain the admin registration key.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Create Admin Account
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
