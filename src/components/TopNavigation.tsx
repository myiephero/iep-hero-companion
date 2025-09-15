import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  User,
  Menu,
  Crown,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import iepHeroIcon from "@/assets/iep-hero-icon.png";

export function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdvocateRoute = location.pathname.startsWith('/advocate');
  const isDashboardRoute = location.pathname.includes('/dashboard');
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={iepHeroIcon} alt="IEP Hero" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-lg">My IEP Hero</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 min-h-[44px] flex items-center ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
            data-testid="nav-home"
          >
            Home
          </Link>
          <Link 
            to="/parent/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 min-h-[44px] flex items-center ${
              location.pathname.startsWith('/parent') ? 'text-primary' : 'text-muted-foreground'
            }`}
            data-testid="nav-parent-portal"
          >
            Parent Portal
          </Link>
          <Link 
            to="#" // Will redirect to plan-specific dashboard 
            className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 min-h-[44px] flex items-center ${
              location.pathname.startsWith('/advocate') ? 'text-primary' : 'text-muted-foreground'
            }`}
            data-testid="nav-advocate-portal"
          >
            Advocate Portal
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-4 w-4" />
          </Button>
          
          {/* SECURITY: Only show Hero Plan to parents, never advocates */}
          {!location.pathname.startsWith('/advocate') && user?.role === 'parent' && (
            <Button asChild variant="hero" size="sm">
              <Link to="/upsell/hero-plan">
                <Crown className="h-4 w-4 mr-1" />
                HERO Plan
              </Link>
            </Button>
          )}

          {profile?.full_name && (
            <span className="text-sm text-muted-foreground hidden md:block">
              {profile.full_name}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={() => {
            const isAdvocateRoute = location.pathname.startsWith('/advocate');
            navigate(isAdvocateRoute ? '/advocate/profile' : '/parent/profile');
          }}>
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}