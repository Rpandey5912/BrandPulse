import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Check, Globe, X } from "lucide-react";
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

const validationSchema = Yup.object({
  full_name: Yup.string()
    .min(2, "Full name must be at least 2 characters")
    .required("Full name is required"),
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
  location: Yup.string(),
  niche: Yup.string()
    .oneOf(niches, "Please select a valid niche")
    .required("Please select your niche"),
  platforms: Yup.array()
    .of(Yup.string().required())
    .min(1, "Please select at least one platform"),
  follower_count: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .integer("Must be a whole number")
    .optional(),
  engagement_rate: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%")
    .optional(),
  rate_per_post: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .optional(),
  portfolio_url: Yup.string().test(
    "portfolio-optional",
    "Please enter a valid URL",
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
  bio: Yup.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

// ── Summary row used inside the modal ────────────────────────────────────
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

export default function InfluencerRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      phone: "",
      niche: "" as Niche | "",
      platforms: [] as Platform[],
      follower_count: "",
      engagement_rate: "",
      portfolio_url: "",
      bio: "",
      rate_per_post: "",
      location: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitting(false);
      // Save and show modal — actual submission happens on Confirm
      setSubmittedData(values);
      setShowModal(true);
    },
  });

  const handleConfirm = () => {
    if (!submittedData) return;
    setShowModal(false);

    const newInfluencer = {
      id: Math.random().toString(36).substr(2, 9),
      ...submittedData,
      follower_count: parseInt(submittedData.follower_count) || 0,
      engagement_rate: parseFloat(submittedData.engagement_rate) || 0,
      rate_per_post: parseFloat(submittedData.rate_per_post) || 0,
      status: "pending",
      created_date: new Date().toISOString(),
    };

    influencerApplications.push(newInfluencer);
    console.log("New influencer application submitted:", newInfluencer);

    toast({
      title: "Application Submitted!",
      description: "We'll review your profile and get back to you soon.",
    });

    navigate("/");
  };

  const handlePlatformToggle = (platform: Platform) => {
    const current = formik.values.platforms;
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    formik.setFieldValue("platforms", updated);
    formik.setFieldTouched("platforms", true, false);
  };

  const fieldError = (name: keyof typeof formik.values) =>
    formik.touched[name] && formik.errors[name]
      ? String(formik.errors[name])
      : null;

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

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Jane Smith"
                className={`rounded-xl h-11 ${fieldError("full_name") ? "border-red-500" : ""}`}
              />
              {fieldError("full_name") && (
                <p className="text-xs text-red-500">
                  {fieldError("full_name")}
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
                placeholder="jane@example.com"
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Los Angeles, CA"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {/* Niche */}
          <div className="space-y-2">
            <Label>Select Your Niche *</Label>
            <Select
              value={formik.values.niche}
              onValueChange={(v: Niche) => {
                formik.setFieldValue("niche", v);
                formik.setFieldTouched("niche", true, false);
              }}
            >
              <SelectTrigger
                className={`rounded-xl h-11 ${formik.touched.niche && formik.errors.niche ? "border-red-500" : ""}`}
              >
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
            {formik.touched.niche && formik.errors.niche && (
              <p className="text-xs text-red-500">{formik.errors.niche}</p>
            )}
          </div>

          {/* Platforms */}
          <div>
            <Label className="mb-3 block">Platforms *</Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    formik.values.platforms.includes(platform)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  {formik.values.platforms.includes(platform) && (
                    <Check className="w-4 h-4" />
                  )}
                  {platform}
                </button>
              ))}
            </div>
            {formik.touched.platforms && formik.errors.platforms && (
              <p className="text-xs text-red-500 mt-2">
                {String(formik.errors.platforms)}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="follower_count">Follower Count</Label>
              <Input
                id="follower_count"
                name="follower_count"
                type="number"
                value={formik.values.follower_count}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="50000"
                className={`rounded-xl h-11 ${fieldError("follower_count") ? "border-red-500" : ""}`}
              />
              {fieldError("follower_count") && (
                <p className="text-xs text-red-500">
                  {fieldError("follower_count")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
              <Input
                id="engagement_rate"
                name="engagement_rate"
                type="number"
                step="0.1"
                value={formik.values.engagement_rate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="3.5"
                className={`rounded-xl h-11 ${fieldError("engagement_rate") ? "border-red-500" : ""}`}
              />
              {fieldError("engagement_rate") && (
                <p className="text-xs text-red-500">
                  {fieldError("engagement_rate")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate_per_post">Rate Per Post ($)</Label>
              <Input
                id="rate_per_post"
                name="rate_per_post"
                type="number"
                value={formik.values.rate_per_post}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="500"
                className={`rounded-xl h-11 ${fieldError("rate_per_post") ? "border-red-500" : ""}`}
              />
              {fieldError("rate_per_post") && (
                <p className="text-xs text-red-500">
                  {fieldError("rate_per_post")}
                </p>
              )}
            </div>
          </div>

          {/* Portfolio URL */}
          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              id="portfolio_url"
              name="portfolio_url"
              value={formik.values.portfolio_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="https://your-portfolio.com"
              className={`rounded-xl h-11 ${fieldError("portfolio_url") ? "border-red-500" : ""}`}
            />
            {fieldError("portfolio_url") && (
              <p className="text-xs text-red-500">
                {fieldError("portfolio_url")}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio{" "}
              <span className="text-muted-foreground text-xs">
                ({formik.values.bio.length}/500)
              </span>
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Tell us about yourself and your content..."
              className={`rounded-xl ${fieldError("bio") ? "border-red-500" : ""}`}
              rows={4}
            />
            {fieldError("bio") && (
              <p className="text-xs text-red-500">{fieldError("bio")}</p>
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
              "Submit Application"
            )}
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-muted rounded-xl text-xs text-muted-foreground">
            <p className="font-medium mb-1">Debug Info:</p>
            <p>Total applications submitted: {influencerApplications.length}</p>
          </div>
        )}
      </div>

      {/* ── Submission Summary Modal ─────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              Review Your Application
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please confirm the information below before submitting.
            </p>
          </DialogHeader>

          {submittedData && (
            <div className="mt-2 rounded-xl border border-muted bg-muted/30 px-4 py-1 max-h-[60vh] overflow-y-auto">
              <Row label="Full Name" value={submittedData.full_name} />
              <Row label="Email" value={submittedData.email} />
              <Row label="Phone" value={submittedData.phone} />
              <Row label="Location" value={submittedData.location} />
              <Row label="Niche" value={submittedData.niche} />
              <Row
                label="Platforms"
                value={submittedData.platforms.join(", ")}
              />
              <Row
                label="Followers"
                value={
                  submittedData.follower_count
                    ? Number(submittedData.follower_count).toLocaleString()
                    : ""
                }
              />
              <Row
                label="Engagement"
                value={
                  submittedData.engagement_rate
                    ? `${submittedData.engagement_rate}%`
                    : ""
                }
              />
              <Row
                label="Rate/Post"
                value={
                  submittedData.rate_per_post
                    ? `$${submittedData.rate_per_post}`
                    : ""
                }
              />
              <Row label="Portfolio" value={submittedData.portfolio_url} />
              <Row label="Bio" value={submittedData.bio} />
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
