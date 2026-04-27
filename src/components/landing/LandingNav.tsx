import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <nav className="sticky top-0 z-50 bg-[rgb(246,246,249)] backdrop-blur-xl border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight ">
            BrandPulse
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <Link
            to="/influencers/register"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Influencers
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/demo">
            <Button variant="ghost" size="sm" className="rounded-lg">
              View Demo
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="rounded-lg">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button
              size="sm"
              className="rounded-lg bg-primary text-white hover:opacity-90"
            >
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-6 py-4 space-y-3">
          <a
            href="#features"
            className="block text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="block text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </a>
          <Link
            to="/influencers/register"
            className="block text-sm py-2"
            onClick={() => setMobileOpen(false)}
          >
            Influencers
          </Link>
          <div className="flex gap-3 pt-2">
            <Link to="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full rounded-lg">
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full rounded-lg bg-gradient-to-r from-primary to-accent">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
