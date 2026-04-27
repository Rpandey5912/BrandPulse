import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Megaphone,
  FileText,
  CreditCard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Globe,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "client";
  company_name?: string;
  phone?: string;
}

const clientLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/influencers", label: "Influencers", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { to: "/admin", label: "Admin Dashboard", icon: Shield },
  { to: "/admin/clients", label: "Manage Clients", icon: Users },
  { to: "/admin/influencers", label: "Influencers", icon: Globe },
  { to: "/admin/reports", label: "All Reports", icon: FileText },
  { to: "/admin/users", label: "User Management", icon: UserCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Mock user data based on role
const MOCK_CLIENT_USER: User = {
  id: "1",
  full_name: "John Client",
  email: "john.client@brandpulse.com",
  role: "client",
  company_name: "TechCorp Solutions",
  phone: "+1 (555) 123-4567",
};

const MOCK_ADMIN_USER: User = {
  id: "2",
  full_name: "Sarah Admin",
  email: "sarah.admin@brandpulse.com",
  role: "admin",
  company_name: "BrandPulse",
  phone: "+1 (555) 987-6543",
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to get current user
    const loadUser = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get user role from localStorage (set during login)
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";

      if (isAuthenticated && userRole) {
        if (userRole === "admin") {
          setUser({
            ...MOCK_ADMIN_USER,
            email: userEmail || MOCK_ADMIN_USER.email,
            full_name: userName || MOCK_ADMIN_USER.full_name,
          });
        } else {
          setUser({
            ...MOCK_CLIENT_USER,
            email: userEmail || MOCK_CLIENT_USER.email,
            full_name: userName || MOCK_CLIENT_USER.full_name,
          });
        }
      } else {
        // Default to client view for demo
        setUser(MOCK_CLIENT_USER);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : clientLinks;
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("pendingClientId");

    // Navigate to home page
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <div className="h-16 flex items-center px-4 border-b">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-heading font-extrabold text-lg truncate">
                BrandPulse
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" /> <span>Collapse</span>
              </>
            )}
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-primary capitalize mt-0.5">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-card border-b flex items-center px-4 gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-base">BrandPulse</span>
        </Link>
        <div className="flex-1" />
        <Avatar className="w-8 h-8" onClick={() => navigate("/settings")}>
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t flex">
        {links.slice(0, 5).map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="truncate text-[10px]">
                {link.label.split(" ").pop()}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Optional: Demo role indicator */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 px-2 py-1 bg-black/80 text-white text-xs rounded-md">
          {user?.role === "admin" ? "👑 Admin Mode" : "👤 Client Mode"}
        </div>
      )}
    </div>
  );
}
