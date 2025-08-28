import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  User,
  Menu,
  Crown
} from "lucide-react";

export function TopNavigation() {
  const location = useLocation();
  const isAdvocateRoute = location.pathname.startsWith('/advocate');
  const isDashboardRoute = location.pathname.includes('/dashboard');

  // Don't show top nav on home page
  if (location.pathname === '/') {
    return null;
  }

  // For dashboard routes, don't render the full navigation since DashboardLayout handles it
  if (isDashboardRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">My IEP Hero</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/parent/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname.startsWith('/parent') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Parent Portal
          </Link>
          <Link 
            to="/advocate/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname.startsWith('/advocate') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Advocate Portal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button asChild variant="hero" size="sm">
            <Link to="/upsell/hero-plan">
              <Crown className="h-4 w-4 mr-1" />
              HERO Plan
            </Link>
          </Button>

          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}