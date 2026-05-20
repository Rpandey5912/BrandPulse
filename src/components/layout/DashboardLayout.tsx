import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";

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
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/payments", label: "Payments", icon: DollarSign },
  { to: "/admin/reports", label: "All Reports", icon: FileText },
  { to: "/admin/users", label: "User Management", icon: UserCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tenant, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : clientLinks;
  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    logout(); // clears token + redirects to /
  };

  return (
    <div className="flex h-screen bg-background">
      {/* ── Sidebar (desktop) ─────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        {/* Logo */}
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

        {/* Nav links */}
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

        {/* Bottom — user + logout */}
        <div className="border-t p-3 space-y-2">
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* User info + logout dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-primary capitalize mt-0.5">
                      {user?.role === "user" ? "Client" : user?.role}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
              {/* User info header */}
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {tenant && (
                  <p className="text-xs text-primary mt-0.5">
                    {tenant.company_name}
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ── Mobile header ─────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-card border-b flex items-center px-4 gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-base">BrandPulse</span>
        </Link>
        <div className="flex-1" />

        {/* Mobile logout dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t flex">
        {links.slice(0, 4).map((link) => {
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
        {/* Logout button in mobile bottom nav */}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Logout</span>
        </button>
      </div>
    </div>
  );
}
