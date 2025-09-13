import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { Crown, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { normalizeSubscriptionPlan } from "@/lib/planAccess";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  // Determine user's subscription plan to conditionally show upgrade buttons
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan);
  const isPaidUser = userPlan !== 'free';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Dashboard Header */}
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger />
                <div className="font-semibold text-base md:text-lg">My IEP Hero</div>
              </div>
              <div className="flex items-center gap-1 md:gap-3">
                {/* Role-aware upgrade buttons */}
                {user?.role === 'parent' && userPlan !== 'hero' && (
                  <>
                    <Button asChild variant="hero" size="sm" className="hidden sm:flex" data-testid="button-parent-upgrade-header">
                      <Link to="/parent/pricing">
                        <Crown className="h-4 w-4 mr-1" />
                        {userPlan === 'free' ? 'HERO Plan' : 'Upgrade'}
                      </Link>
                    </Button>
                    
                    {/* Mobile Parent Upgrade Button */}
                    <Button asChild variant="hero" size="sm" className="sm:hidden" data-testid="button-parent-upgrade-header-mobile">
                      <Link to="/parent/pricing">
                        <Crown className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                
                {/* Advocate upgrade buttons */}
                {user?.role === 'advocate' && userPlan !== 'agency-plus' && (
                  <>
                    <Button asChild variant="outline" size="sm" className="hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50" data-testid="button-advocate-upgrade-header">
                      <Link to="/advocate/pricing">
                        <Crown className="h-4 w-4 mr-1" />
                        Upgrade Plan
                      </Link>
                    </Button>
                    
                    {/* Mobile Advocate Upgrade Button */}
                    <Button asChild variant="outline" size="sm" className="sm:hidden border-blue-200 text-blue-700 hover:bg-blue-50" data-testid="button-advocate-upgrade-header-mobile">
                      <Link to="/advocate/pricing">
                        <Crown className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      <User className="h-4 w-4" />
                      {(profile?.full_name || user?.email) && (
                        <span className="text-sm text-muted-foreground hidden lg:block">
                          {profile?.full_name || user?.email}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => {
                      const currentPath = window.location.pathname;
                      const isAdvocateRoute = currentPath.startsWith('/advocate');
                      navigate(isAdvocateRoute ? '/advocate/profile' : '/parent/profile');
                    }}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const currentPath = window.location.pathname;
                      const isAdvocateRoute = currentPath.startsWith('/advocate');
                      navigate(isAdvocateRoute ? '/advocate/settings' : '/parent/settings');
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Default export for compatibility
export default DashboardLayout;