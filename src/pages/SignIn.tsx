import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { useAuth } from "@/lib/AuthContext";

const DEMO_CLIENT = { email: "demo@brandpulse.io", password: "BrandPulse2024!" };
const DEMO_ADMIN  = { email: "admin@brandpulse.io", password: "Admin123!" };

export default function SignIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast({ title: "Welcome back!", description: "Login successful." });
      const role = localStorage.getItem("userRole");
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.response?.message ?? err?.message ?? "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (creds: { email: string; password: string }) => {
    setForm(creds);
    setLoading(true);
    try {
      await login(creds.email, creds.password);
      toast({ title: "Welcome back!", description: "Login successful." });
      const role = localStorage.getItem("userRole");
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.response?.message ?? err?.message ?? "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col p-10">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[380px] h-[380px] rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full bg-white/10" />
        <div className="absolute top-[35%] left-[30%] w-[220px] h-[220px] rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">BrandPulse</span>
        </div>

        {/* Hero text */}
        <div className="relative mt-16 mb-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back to<br />your Brand Hub
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Track campaigns, manage influencers, and<br />
            grow your brand — all in one place.
          </p>
        </div>

        {/* Stats grid */}
        <div className="relative grid grid-cols-2 gap-3 mb-auto">
          {[
            { value: "500+", label: "Active Clients" },
            { value: "12K+", label: "Campaigns Tracked" },
            { value: "3.2x", label: "Avg ROI Boost" },
            { value: "8K+", label: "Influencers" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10"
            >
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative text-white/40 text-xs mt-10">
          © 2026 BrandPulse. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-7">
            Enter your credentials to access your dashboard.
          </p>

          {/* Try the Demo card */}
          <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-gray-900 text-sm">Try the Demo</span>
            </div>
            <p className="text-amber-600 text-xs mb-3">
              Explore BrandPulse with these demo credentials:
            </p>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-700 text-xs">{DEMO_CLIENT.email}</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-700 text-xs">{DEMO_CLIENT.password}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(DEMO_CLIENT)}
                className="flex-1 text-xs font-medium py-2 rounded-lg border border-amber-400 text-amber-700 bg-white hover:bg-amber-50 transition-colors"
              >
                Fill Credentials
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => quickLogin(DEMO_CLIENT)}
                className="flex-1 text-xs font-semibold py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Quick Login
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign in with your account</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Sign-in form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-600 hover:text-violet-700 font-medium">
              Get started free
            </Link>
          </p>
          <p className="text-center mt-2">
            <button
              type="button"
              onClick={() => quickLogin(DEMO_ADMIN)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              View interactive demo instead →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
