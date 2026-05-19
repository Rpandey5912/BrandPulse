import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AuthAPI, setToken } from "@/lib/api";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BarChart3, Check, X, ArrowLeft } from "lucide-react";
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

const planDetails: Record<
  string,
  { name: string; price: string; sub: string; color: string }
> = {
  trial: { name: "Trial", price: "Free", sub: "Free for 3 months", color: "border-violet-500 bg-violet-50" },
  silver: { name: "Silver", price: "£499/month", sub: "£499/month", color: "border-gray-200 bg-white" },
  gold: { name: "Gold", price: "£999/month", sub: "£999/month", color: "border-gray-200 bg-white" },
  platinum: { name: "Platinum", price: "£2499/month", sub: "£2499/month", color: "border-gray-200 bg-white" },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium truncate max-w-[55%] text-right text-gray-900">
        {value || "—"}
      </span>
    </div>
  );
}

const validationSchema = Yup.object({
  company_name: Yup.string().min(2).required("Company name is required"),
  contact_name: Yup.string().min(2).required("Contact name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Min 8 characters")
    .required("Password is required"),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  phone: Yup.string().optional(),
  industry: Yup.string().optional(),
  website: Yup.string().test(
    "is-url",
    "Enter a valid URL e.g. https://acme.com",
    (value) => {
      if (!value || value.trim() === "") return true;
      return Yup.string().url().isValidSync(value);
    },
  ),
  subscription_plan: Yup.string()
    .oneOf(["trial", "silver", "gold", "platinum"])
    .required("Please select a plan"),
  social_platforms: Yup.array()
    .of(Yup.string().required())
    .min(1, "Select at least one platform"),
});

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const planFromUrl = searchParams.get("plan") ?? "";
  const validPlan = Object.keys(planDetails).includes(planFromUrl) ? planFromUrl : "trial";

  const formik = useFormik({
    initialValues: {
      company_name: "",
      contact_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone: "",
      industry: "",
      website: "",
      subscription_plan: validPlan,
      social_platforms: [] as string[],
    },
    validationSchema,
    onSubmit: () => setConfirmOpen(true),
  });

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await AuthAPI.register({
        company_name: formik.values.company_name,
        contact_name: formik.values.contact_name,
        email: formik.values.email,
        password: formik.values.password,
        phone: formik.values.phone || undefined,
        industry: formik.values.industry || undefined,
        website: formik.values.website || undefined,
        subscription_plan: formik.values.subscription_plan,
        social_platforms: formik.values.social_platforms,
      });

      setToken(res.access_token);
      localStorage.setItem("userRole", res.user.role);
      localStorage.setItem("bp_platforms", JSON.stringify(formik.values.social_platforms));

      toast({ title: "Account created! Proceeding to payment..." });
      setConfirmOpen(false);
      navigate(`/payment?plan=${formik.values.subscription_plan}`);
    } catch (err: any) {
      const detail = err?.response?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join(", ")
        : (typeof detail === "string" ? detail : (err.message ?? "Registration failed"));
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: string) => {
    const current = formik.values.social_platforms;
    formik.setFieldValue(
      "social_platforms",
      current.includes(p) ? current.filter((x) => x !== p) : [...current, p],
    );
  };

  const e = (field: string) =>
    (formik.touched as any)[field] && (formik.errors as any)[field];

  const selectedPlan = formik.values.subscription_plan;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back to Home */}
      <div className="px-8 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Get Started with BrandPulse
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-[52px]">
              Create your account and start tracking your brand performance.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <form onSubmit={formik.handleSubmit} className="space-y-6">

              {/* Plan Selector */}
              <div className="space-y-3">
                <Label className="text-gray-700 font-semibold text-sm">Choose Your Plan</Label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(planDetails).map(([key, plan]) => {
                    const isSelected = selectedPlan === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => formik.setFieldValue("subscription_plan", key)}
                        className={`relative text-left p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-violet-500 bg-violet-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                        <p className={`font-semibold text-sm ${isSelected ? "text-violet-700" : "text-gray-800"}`}>
                          {plan.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${isSelected ? "text-violet-500" : "text-gray-400"}`}>
                          {plan.sub}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {e("subscription_plan") && (
                  <p className="text-xs text-red-500">{e("subscription_plan")}</p>
                )}
              </div>

              {/* Company Name & Contact Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Company Name *</Label>
                  <Input
                    {...formik.getFieldProps("company_name")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Acme Inc."
                  />
                  {e("company_name") && (
                    <p className="text-xs text-red-500">{e("company_name")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Contact Name *</Label>
                  <Input
                    {...formik.getFieldProps("contact_name")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="John Doe"
                  />
                  {e("contact_name") && (
                    <p className="text-xs text-red-500">{e("contact_name")}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Email *</Label>
                  <Input
                    type="email"
                    {...formik.getFieldProps("email")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="john@acme.com"
                  />
                  {e("email") && (
                    <p className="text-xs text-red-500">{e("email")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Phone</Label>
                  <Input
                    {...formik.getFieldProps("phone")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Industry & Website */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Industry</Label>
                  <Select
                    value={formik.values.industry}
                    onValueChange={(v) => formik.setFieldValue("industry", v)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-lg">
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
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Website</Label>
                  <Input
                    {...formik.getFieldProps("website")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="https://acme.com"
                  />
                  {e("website") && (
                    <p className="text-xs text-red-500">{e("website")}</p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Password *</Label>
                  <Input
                    type="password"
                    {...formik.getFieldProps("password")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Min 8 characters"
                  />
                  {e("password") && (
                    <p className="text-xs text-red-500">{e("password")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm">Confirm Password *</Label>
                  <Input
                    type="password"
                    {...formik.getFieldProps("password_confirmation")}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Repeat password"
                  />
                  {e("password_confirmation") && (
                    <p className="text-xs text-red-500">{e("password_confirmation")}</p>
                  )}
                </div>
              </div>

              {/* Social Media Platforms */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold text-sm">Social Media Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => {
                    const selected = formik.values.social_platforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          selected
                            ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                            : "bg-white border-gray-300 text-gray-700 hover:border-violet-400 hover:text-violet-600"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                {e("social_platforms") && (
                  <p className="text-xs text-red-500">{e("social_platforms")}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-base shadow-md transition-all"
              >
                Create Account & Start Free Trial
              </Button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-5">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 my-2">
            <Row label="Company" value={formik.values.company_name} />
            <Row label="Contact" value={formik.values.contact_name} />
            <Row label="Email" value={formik.values.email} />
            <Row label="Phone" value={formik.values.phone} />
            <Row label="Industry" value={formik.values.industry} />
            <Row
              label="Plan"
              value={
                planDetails[formik.values.subscription_plan]?.name ??
                formik.values.subscription_plan
              }
            />
            <Row
              label="Platforms"
              value={formik.values.social_platforms.join(", ")}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmOpen(false)}
            >
              <X className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              onClick={handleConfirm}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" /> Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
