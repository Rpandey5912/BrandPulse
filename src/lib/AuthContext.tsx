/**
 * Updated AuthContext.tsx — replaces mock auth with real API
 * Drop this at: src/lib/AuthContext.tsx
 */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  AuthAPI,
  SettingsAPI,
  setToken,
  clearToken,
  getToken,
  type User,
  type Tenant,
  type AppPublicSettings,
} from "./api";

interface AuthError {
  type: "user_not_registered" | "auth_required" | "unknown";
  message: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthError | null;
  appPublicSettings: AppPublicSettings | null;
  login: (email: string, password: string) => Promise<void>;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [appPublicSettings, setAppPublicSettings] =
    useState<AppPublicSettings | null>(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // Load public settings (unauthenticated)
      const settingsRes = await SettingsAPI.getPublic();
      setAppPublicSettings(settingsRes);
      setIsLoadingPublicSettings(false);

      // If we have a stored token, verify it
      if (getToken()) {
        setIsLoadingAuth(true);
        try {
          const meRes = await AuthAPI.me();
          setUser(meRes.user);
          setTenant(meRes.tenant);
          setIsAuthenticated(true);
        } catch {
          clearToken();
          setIsAuthenticated(false);
          setUser(null);
          setTenant(null);
        }
      }
    } catch (err: any) {
      setAuthError({
        type: "unknown",
        message: err.message ?? "Unexpected error",
      });
      setIsLoadingPublicSettings(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await AuthAPI.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthError(null);

    // FastAPI login doesn't return tenant — fetch it from /auth/me
    try {
      const meRes = await AuthAPI.me();
      setTenant(meRes.tenant);
    } catch {
      // non-critical, tenant will be null until page refresh
    }

    localStorage.setItem("userRole", res.user.role);
  };

  const logout = (shouldRedirect = true) => {
    AuthAPI.logout().catch(() => {});
    clearToken();
    localStorage.removeItem("userRole");
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = "/";
  };

  const navigateToLogin = () => {
    window.location.href = "/signin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        login,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
