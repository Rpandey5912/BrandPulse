import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SettingsAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Phone, Building, Lock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Settings() {
  const { toast } = useToast();
  const { user, tenant } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [pwForm, setPwForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pwSection, setPwSection] = useState(false);

  // Populate form from auth context
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name ?? "",
        phone: (user as any).phone ?? "",
      });
    }
  }, [user]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateProfile = useMutation({
    mutationFn: (body: any) => SettingsAPI.updateProfile(body),
    onSuccess: () => toast({ title: "Profile saved!" }),
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const updatePassword = useMutation({
    mutationFn: (body: any) => SettingsAPI.updatePassword(body),
    onSuccess: () => {
      toast({ title: "Password updated!" });
      setPwForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setPwSection(false);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.message ?? e.message,
        variant: "destructive",
      }),
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(profileForm);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    await updatePassword.mutateAsync(pwForm);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-heading font-bold text-lg">
              {user?.name ?? "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              Role: {user?.role ?? "user"}
              {tenant && ` · ${tenant.company_name}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </Label>
            <Input
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, name: e.target.value }))
              }
              className="rounded-xl"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input
              value={user?.email ?? ""}
              disabled
              className="rounded-xl bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>
          {tenant && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="w-4 h-4" /> Company
              </Label>
              <Input
                value={tenant.company_name}
                disabled
                className="rounded-xl bg-muted"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </Label>
            <Input
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+44 7700 000000"
              className="rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {updateProfile.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold flex items-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your login password
            </p>
          </div>
          {!pwSection && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setPwSection(true)}
            >
              Change
            </Button>
          )}
        </div>

        {pwSection && (
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password *</Label>
              <Input
                type="password"
                required
                value={pwForm.current_password}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, current_password: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password *</Label>
              <Input
                type="password"
                required
                value={pwForm.password}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, password: e.target.value }))
                }
                className="rounded-xl"
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password *</Label>
              <Input
                type="password"
                required
                value={pwForm.password_confirmation}
                onChange={(e) =>
                  setPwForm((p) => ({
                    ...p,
                    password_confirmation: e.target.value,
                  }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={updatePassword.isPending}
                className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {updatePassword.isPending ? "Updating…" : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setPwSection(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Subscription info — clients only */}
      {tenant && user?.role !== "admin" && (
        <div className="bg-card rounded-2xl border p-6">
          <h2 className="font-heading font-bold mb-3">Subscription</h2>
          <div className="flex items-center gap-3">
            <span className="capitalize font-semibold text-primary">
              {tenant.subscription_plan}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                tenant.subscription_status === "active"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {tenant.subscription_status}
            </span>
          </div>
          {tenant.trial_ends_at && (
            <p className="text-sm text-muted-foreground mt-1">
              Trial ends: {new Date(tenant.trial_ends_at).toLocaleDateString()}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl mt-3"
            onClick={() => (window.location.href = "/subscription")}
          >
            Manage Subscription
          </Button>
        </div>
      )}
    </div>
  );
}
