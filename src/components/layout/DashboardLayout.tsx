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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface User {
  role?: string;
  full_name?: string;
  email?: string;
}

// Mock user data
const MOCK_USER: User = {
  role: "admin", // Change to "client" for client view
  full_name: "John Admin",
  email: "admin@brandpulse.com",
};

// Alternative client user for testing
const MOCK_CLIENT_USER: User = {
  role: "client",
  full_name: "Sarah Client",
  email: "client@brandpulse.com",
};

const clientLinks: NavLink[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/influencers", label: "Influencers", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

const adminLinks: NavLink[] = [
  { to: "/admin", label: "Admin Dashboard", icon: Shield },
  { to: "/admin/clients", label: "Manage Clients", icon: Users },
  { to: "/admin/influencers", label: "Influencers", icon: Globe },
  { to: "/admin/reports", label: "All Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to get current user
    const loadUser = async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // You can switch between admin and client by changing which user you return
      // For demo purposes, let's check localStorage or use a default
      const savedRole = localStorage.getItem("userRole");

      if (savedRole === "client") {
        setUser(MOCK_CLIENT_USER);
      } else {
        // Default to admin
        setUser(MOCK_USER);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const isAdmin = user?.role === "admin";
  const links: NavLink[] = isAdmin ? adminLinks : clientLinks;
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem("userRole");
    // Navigate to home page
    navigate("/");
  };

  // Function to switch between admin and client for demo purposes
  const toggleUserRole = () => {
    if (user?.role === "admin") {
      localStorage.setItem("userRole", "client");
      setUser(MOCK_CLIENT_USER);
    } else {
      localStorage.setItem("userRole", "admin");
      setUser(MOCK_USER);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
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
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
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
          {/* Demo role switcher - remove in production */}
          <button
            onClick={toggleUserRole}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors mb-2"
          >
            <UserCircle className="w-4 h-4" />
            {!collapsed && (
              <span>
                Switch to {user?.role === "admin" ? "Client" : "Admin"} View
              </span>
            )}
          </button>

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
                <p className="text-xs text-primary mt-0.5 capitalize">
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
    </div>
  );
}
