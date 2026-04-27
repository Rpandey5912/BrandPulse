import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { appParams } from "@/lib/app-params";

interface AuthError {
  type: string;
  message: string;
}

interface AppPublicSettings {
  id: string;
  public_settings: Record<string, any>;
}

interface User {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  company_name?: string;
  phone?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthError | null;
  appPublicSettings: AppPublicSettings | null;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user data
const MOCK_USER: User = {
  id: "1",
  email: "john.client@brandpulse.com",
  full_name: "John Client",
  role: "client",
  company_name: "TechCorp Solutions",
  phone: "+1 (555) 123-4567",
};

const MOCK_ADMIN_USER: User = {
  id: "2",
  email: "sarah.admin@brandpulse.com",
  full_name: "Sarah Admin",
  role: "admin",
  company_name: "BrandPulse",
  phone: "+1 (555) 987-6543",
};

// Mock public settings
const MOCK_PUBLIC_SETTINGS: AppPublicSettings = {
  id: "app_1",
  public_settings: {
    app_name: "BrandPulse",
    allow_registration: true,
    require_email_verification: false,
    supported_plans: ["trial", "silver", "gold", "platinum"],
    default_plan: "trial",
  },
};

// Store auth state in memory (simulating session)
let currentUser: User | null = null;
let isUserLoggedIn = false;

// Helper to get user role from localStorage (for demo)
const getStoredUserRole = (): string | null => {
  return localStorage.getItem("userRole");
};

// Helper to set user role (for demo)
const setStoredUserRole = (role: string): void => {
  localStorage.setItem("userRole", role);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] =
    useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [appPublicSettings, setAppPublicSettings] =
    useState<AppPublicSettings | null>(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async (): Promise<void> => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // Simulate API call for public settings
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if app params are valid (simplified check)
      if (!appParams.appId) {
        setAuthError({
          type: "auth_required",
          message: "App ID is required",
        });
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        return;
      }

      // Set mock public settings
      setAppPublicSettings(MOCK_PUBLIC_SETTINGS);

      // Check if user is authenticated (via localStorage for demo)
      const storedRole = getStoredUserRole();

      if (storedRole && storedRole !== "none") {
        // User is "logged in"
        if (storedRole === "admin") {
          currentUser = MOCK_ADMIN_USER;
        } else {
          currentUser = MOCK_USER;
        }
        isUserLoggedIn = true;
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setUser(null);
      }

      setIsLoadingPublicSettings(false);
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred",
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async (): Promise<void> => {
    try {
      setIsLoadingAuth(true);

      // Simulate API call for user auth
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (currentUser && isUserLoggedIn) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "auth_required",
          message: "Authentication required",
        });
      }

      setIsLoadingAuth(false);
    } catch (error: any) {
      console.error("User auth check failed:", error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      setAuthError({
        type: "auth_required",
        message: "Authentication required",
      });
    }
  };

  const logout = (shouldRedirect: boolean = true): void => {
    setUser(null);
    setIsAuthenticated(false);
    currentUser = null;
    isUserLoggedIn = false;

    // Clear stored user role
    setStoredUserRole("none");

    if (shouldRedirect) {
      // Redirect to home page
      window.location.href = "/";
    }
  };

  const navigateToLogin = (): void => {
    // For demo, redirect to a login page or home
    window.location.href = "/?login=true";
  };

  // Helper function to login (for demo purposes)
  const login = (role: "client" | "admin" = "client"): void => {
    setStoredUserRole(role);
    if (role === "admin") {
      currentUser = MOCK_ADMIN_USER;
    } else {
      currentUser = MOCK_USER;
    }
    isUserLoggedIn = true;
    setUser(currentUser);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export login helper for demo purposes (not part of original context)
export const useDemoAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useDemoAuth must be used within an AuthProvider");
  }

  const login = (role: "client" | "admin" = "client") => {
    const storedRole = role === "admin" ? "admin" : "client";
    localStorage.setItem("userRole", storedRole);
    context.checkAppState();
  };

  return { login };
};
