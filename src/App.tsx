import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import DashboardLayout from "./components/layout/DashboardLayout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Reports from "./pages/Reports";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import InfluencerRegister from "./pages/InfluencerRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageClients from "./pages/admin/ManageClients";
import ManageInfluencers from "./pages/admin/ManageInfluencers";
import AdminReports from "./pages/admin/AdminReports";
import Influencers from "./pages/Influencers";
import Payment from "./pages/Payment";
import ClientDemo from "./pages/ClientDemo";
import SignIn from "./pages/SignIn";
import UserManagement from "./pages/admin/UserManagement";

// Mock authentication hook for development
const useMockAuth = () => {
  // Check if user is authenticated via localStorage
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  // Mock loading states (set to false for static demo)
  const isLoadingAuth = false;
  const isLoadingPublicSettings = false;

  type AuthError = { type: "user_not_registered" | "auth_required" } | null;

  // Mock auth error
  const authError: AuthError = null as AuthError;

  const navigateToLogin = () => {
    window.location.href = "/signin";
  };

  return {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
    user: isAuthenticated ? { role: userRole, name: userName } : null,
    isAuthenticated,
  };
};

const AuthenticatedApp = () => {
  // Use mock auth for static demo, replace with useAuth() when backend is ready
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useMockAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError?.type === "user_not_registered") {
    return <UserNotRegisteredError />;
  } else if (authError?.type === "auth_required") {
    // Redirect to login automatically
    navigateToLogin();
    return null;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/influencers/register" element={<InfluencerRegister />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/demo" element={<ClientDemo />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/influencers" element={<Influencers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/clients" element={<ManageClients />} />
        <Route path="/admin/influencers" element={<ManageInfluencers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
