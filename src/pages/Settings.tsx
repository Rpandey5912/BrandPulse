import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Phone, Building } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  company_name?: string;
  phone?: string;
}

// Mock user data
const MOCK_USER: User = {
  id: "1",
  full_name: "John Client",
  email: "john.client@brandpulse.com",
  role: "client",
  company_name: "TechCorp Solutions",
  phone: "+1 (555) 123-4567",
};

// Alternative admin user for testing
const MOCK_ADMIN_USER: User = {
  id: "2",
  full_name: "Sarah Admin",
  email: "sarah.admin@brandpulse.com",
  role: "admin",
  company_name: "BrandPulse",
  phone: "+1 (555) 987-6543",
};

// Store user settings in memory (simulating database)
let userSettings: Partial<User> = {};

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company_name: "", phone: "" });
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to get current user
    const loadUser = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // You can switch between client and admin by changing which user you return
      // For demo purposes, let's check localStorage or use a default
      const savedRole = localStorage.getItem("userRole");
      let currentUser: User;

      if (savedRole === "admin") {
        currentUser = MOCK_ADMIN_USER;
      } else {
        currentUser = MOCK_USER;
      }

      setUser(currentUser);
      setForm({
        company_name: currentUser.company_name || "",
        phone: currentUser.phone || "",
      });
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user settings in memory
    if (user) {
      userSettings = {
        ...userSettings,
        company_name: form.company_name,
        phone: form.phone,
      };

      console.log("Settings saved:", {
        company_name: form.company_name,
        phone: form.phone,
      });
    }

    toast({ title: "Settings saved!" });
    setSaving(false);
  };

  // Function to toggle between admin and client for demo purposes
  const toggleUserRole = () => {
    if (user?.role === "admin") {
      localStorage.setItem("userRole", "client");
      setUser(MOCK_USER);
      setForm({
        company_name: MOCK_USER.company_name || "",
        phone: MOCK_USER.phone || "",
      });
    } else {
      localStorage.setItem("userRole", "admin");
      setUser(MOCK_ADMIN_USER);
      setForm({
        company_name: MOCK_ADMIN_USER.company_name || "",
        phone: MOCK_ADMIN_USER.phone || "",
      });
    }
    toast({
      title: `Switched to ${user?.role === "admin" ? "Client" : "Admin"} view`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

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

      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-heading font-bold text-lg">
              {user?.full_name || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              Role: {user?.role || "client"}
            </p>
          </div>
        </div>

        {/* Demo role switcher - remove in production */}
        <div className="mb-6 p-3 bg-muted/50 rounded-xl">
          <p className="text-xs text-muted-foreground mb-2">Demo Mode:</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleUserRole}
            className="rounded-lg text-xs w-full"
          >
            Switch to {user?.role === "admin" ? "Client" : "Admin"} View
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </Label>
            <Input
              value={user?.full_name || ""}
              disabled
              className="rounded-xl bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Name cannot be changed here.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input
              value={user?.email || ""}
              disabled
              className="rounded-xl bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="w-4 h-4" /> Company Name
            </Label>
            <Input
              value={form.company_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, company_name: e.target.value }))
              }
              placeholder="Your company"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </Label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+1 (555) 000-0000"
              className="rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>

      {/* Optional: Display debug info in development */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-3 bg-muted rounded-xl text-xs text-muted-foreground text-center">
          <p>Settings are stored in memory and will reset on page refresh.</p>
          <p className="mt-1">
            Use the demo switcher to toggle between client and admin views.
          </p>
        </div>
      )}
    </div>
  );
}
