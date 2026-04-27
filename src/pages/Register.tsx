import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BarChart3, ArrowLeft, Check, X } from "lucide-react";
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

interface FormValues {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  subscription_plan: string;
  social_platforms: string[];
}

let registeredClients: StoredClient[] = [];

const validationSchema = Yup.object({
  company_name: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .required("Company name is required"),
  contact_name: Yup.string()
    .min(2, "Contact name must be at least 2 characters")
    .required("Contact name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: Yup.string().test(
    "phone-optional",
    "Please enter a valid phone number",
    (value) => {
      if (!value || value.trim() === "") return true;
      return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/.test(value);
    },
  ),
  industry: Yup.string(),
  website: Yup.string().test(
    "website-optional",
    "Please enter a valid URL (e.g. https://acme.com)",
    (value) => {
      if (!value || value.trim() === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  ),
  subscription_plan: Yup.string()
    .oneOf(["trial", "silver", "gold", "platinum"])
    .required("Please select a plan"),
  social_platforms: Yup.array()
    .of(Yup.string().required())
    .min(1, "Please select at least one platform"),
});

// ── Summary row component used inside the modal ───────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-muted last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-muted-foreground uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-sm text-foreground break-all">{value || "—"}</span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      industry: "",
      website: "",
      subscription_plan: "trial",
      social_platforms: [],
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitting(false);
      // Save data and open modal — navigation happens from modal confirm button
      setSubmittedData(values);
      setShowModal(true);
    },
  });

  const handleConfirm = async () => {
    if (!submittedData) return;
    setShowModal(false);

    const now = new Date().toISOString();
    const endDate = new Date();
    if (submittedData.subscription_plan === "trial") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newClient: StoredClient = {
      id: Math.random().toString(36).substr(2, 9),
      ...submittedData,
      subscription_status:
        submittedData.subscription_plan === "trial"
          ? "active"
          : "pending_payment",
      instance_status:
        submittedData.subscription_plan === "trial" ? "active" : "pending",
      subscription_start_date: now,
      subscription_end_date: endDate.toISOString(),
      created_date: now,
    };

    registeredClients.push(newClient);
    console.log("New client registered:", newClient);

    if (submittedData.subscription_plan === "trial") {
      toast({
        title: "Welcome to BrandPulse!",
        description: "Your 3-month free trial has started.",
      });
      navigate("/dashboard");
    } else {
      sessionStorage.setItem("pendingClientId", newClient.id);
      navigate(
        `/payment?plan=${submittedData.subscription_plan}&client_id=${newClient.id}`,
      );
    }
  };

  const handlePlatformToggle = (platform: string) => {
    const current = formik.values.social_platforms;
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    formik.setFieldValue("social_platforms", updated);
    formik.setFieldTouched("social_platforms", true, false);
  };

  const fieldError = (name: keyof FormValues) =>
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

  const selectedPlan =
    planDetails[submittedData?.subscription_plan as keyof typeof planDetails];

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

        <form onSubmit={formik.handleSubmit} className="space-y-8">
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
                  onClick={() => formik.setFieldValue("subscription_plan", key)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    formik.values.subscription_plan === key
                      ? `${plan.color} bg-primary/5`
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {formik.values.subscription_plan === key && (
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
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Acme Inc."
                className={`rounded-xl h-11 ${fieldError("company_name") ? "border-red-500" : ""}`}
              />
              {fieldError("company_name") && (
                <p className="text-xs text-red-500">
                  {fieldError("company_name")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name *</Label>
              <Input
                id="contact_name"
                name="contact_name"
                value={formik.values.contact_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="John Doe"
                className={`rounded-xl h-11 ${fieldError("contact_name") ? "border-red-500" : ""}`}
              />
              {fieldError("contact_name") && (
                <p className="text-xs text-red-500">
                  {fieldError("contact_name")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="john@acme.com"
                className={`rounded-xl h-11 ${fieldError("email") ? "border-red-500" : ""}`}
              />
              {fieldError("email") && (
                <p className="text-xs text-red-500">{fieldError("email")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="+1 (555) 000-0000"
                className={`rounded-xl h-11 ${fieldError("phone") ? "border-red-500" : ""}`}
              />
              {fieldError("phone") && (
                <p className="text-xs text-red-500">{fieldError("phone")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Industry</Label>
              <Select
                value={formik.values.industry}
                onValueChange={(v: string) =>
                  formik.setFieldValue("industry", v)
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
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="https://acme.com"
                className={`rounded-xl h-11 ${fieldError("website") ? "border-red-500" : ""}`}
              />
              {fieldError("website") && (
                <p className="text-xs text-red-500">{fieldError("website")}</p>
              )}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <Label className="text-base font-heading font-bold mb-3 block">
              Social Media Platforms *
            </Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    formik.values.social_platforms.includes(platform)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {formik.values.social_platforms.includes(platform) && (
                    <Check className="w-4 h-4" />
                  )}
                  {platform}
                </button>
              ))}
            </div>
            {formik.touched.social_platforms &&
              formik.errors.social_platforms && (
                <p className="text-xs text-red-500 mt-2">
                  {String(formik.errors.social_platforms)}
                </p>
              )}
          </div>

          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full h-13 rounded-xl text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {formik.isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              "Create Account & Start Free Trial"
            )}
          </Button>
        </form>
      </div>

      {/* ── Submission Summary Modal ─────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              Review Your Details
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please confirm the information below before creating your account.
            </p>
          </DialogHeader>

          {submittedData && (
            <div className="mt-2 rounded-xl border border-muted bg-muted/30 px-4 py-1 max-h-[60vh] overflow-y-auto">
              <Row label="Company" value={submittedData.company_name} />
              <Row label="Contact" value={submittedData.contact_name} />
              <Row label="Email" value={submittedData.email} />
              <Row label="Phone" value={submittedData.phone} />
              <Row label="Industry" value={submittedData.industry} />
              <Row label="Website" value={submittedData.website} />
              <Row
                label="Plan"
                value={`${selectedPlan?.name} — ${selectedPlan?.price}`}
              />
              <Row
                label="Platforms"
                value={submittedData.social_platforms.join(", ")}
              />
            </div>
          )}

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setShowModal(false)}
            >
              <X className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={handleConfirm}
            >
              <Check className="w-4 h-4 mr-1" /> Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
