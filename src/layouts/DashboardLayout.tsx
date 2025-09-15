import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Crown, User, LogOut, Settings, CreditCard, Menu, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { normalizeSubscriptionPlan } from "@/lib/planAccess";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  // Determine user's subscription plan to conditionally show upgrade buttons
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan);
  const isPaidUser = userPlan !== 'free';
  
  // Check if we should show back button on mobile (not on dashboard/main pages)
  const currentPath = location.pathname;
  const isDashboardPage = currentPath.includes('/dashboard') || 
                         currentPath === '/parent/matching' || 
                         currentPath === '/advocate/parents' || 
                         currentPath === '/parent/messages' || 
                         currentPath === '/advocate/messages';
  const showMobileBackButton = !isDashboardPage;

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
      <div className="min-h-screen flex w-full bg-background relative overflow-x-hidden">
        {/* Sidebar - Responsive */}
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Dashboard Header */}
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile Back Button or Sidebar Trigger */}
                {showMobileBackButton ? (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden min-h-[44px] min-w-[44px] p-2"
                    onClick={() => navigate(-1)}
                    data-testid="button-mobile-back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Go back</span>
                  </Button>
                ) : (
                  <div className="md:hidden">
                    <SidebarTrigger className="min-h-[44px] min-w-[44px] p-2" />
                  </div>
                )}
                
                {/* Desktop sidebar trigger */}
                <div className="hidden md:block">
                  <SidebarTrigger />
                </div>
                
                <div className="font-semibold text-base md:text-lg">My IEP Hero</div>
              </div>
              <div className="flex items-center gap-1 md:gap-3">
                {/* Role-aware upgrade buttons */}
                {user?.role === 'parent' && userPlan !== 'hero' && (
                  <>
                    <Button asChild variant="hero" className="hidden sm:flex min-h-[44px]" data-testid="button-parent-upgrade-header">
                      <Link to="/parent/pricing">
                        <Crown className="h-4 w-4 mr-1" />
                        {userPlan === 'free' ? 'HERO Plan' : 'Upgrade'}
                      </Link>
                    </Button>
                    
                    {/* Mobile Parent Upgrade Button */}
                    <Button asChild variant="hero" className="sm:hidden min-h-[44px] min-w-[44px]" data-testid="button-parent-upgrade-header-mobile">
                      <Link to="/parent/pricing">
                        <Crown className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                
                {/* Advocate upgrade buttons */}
                {user?.role === 'advocate' && userPlan !== 'agency-plus' && (
                  <>
                    <Button asChild variant="outline" className="hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50 min-h-[44px]" data-testid="button-advocate-upgrade-header">
                      <Link to="/advocate/pricing">
                        <Crown className="h-4 w-4 mr-1" />
                        Upgrade Plan
                      </Link>
                    </Button>
                    
                    {/* Mobile Advocate Upgrade Button */}
                    <Button asChild variant="outline" className="sm:hidden border-blue-200 text-blue-700 hover:bg-blue-50 min-h-[44px] min-w-[44px]" data-testid="button-advocate-upgrade-header-mobile">
                      <Link to="/advocate/pricing">
                        <Crown className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 px-3 min-h-[44px] min-w-[44px] active:scale-95 transition-transform duration-150"
                      aria-label="User menu"
                    >
                      <User className="h-5 w-5" />
                      {(profile?.full_name || user?.email) && (
                        <span className="text-sm text-muted-foreground hidden lg:block truncate max-w-[120px]">
                          {profile?.full_name || user?.email}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 max-w-[calc(100vw-1rem)] mr-2 md:mr-0 md:w-56 shadow-lg border-2 md:border"
                    sideOffset={12}
                    alignOffset={0}
                    collisionPadding={8}
                    avoidCollisions={true}
                  >
                    <DropdownMenuItem 
                      onClick={() => {
                        const currentPath = window.location.pathname;
                        const isAdvocateRoute = currentPath.startsWith('/advocate');
                        navigate(isAdvocateRoute ? '/advocate/profile' : '/parent/profile');
                      }} 
                      className="min-h-[48px] px-4 py-3 active:bg-accent/80 transition-colors cursor-pointer"
                      data-testid="dropdown-profile"
                    >
                      <User className="h-5 w-5 mr-3" />
                      <span className="font-medium">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        const currentPath = window.location.pathname;
                        const isAdvocateRoute = currentPath.startsWith('/advocate');
                        navigate(isAdvocateRoute ? '/advocate/settings' : '/parent/settings');
                      }} 
                      className="min-h-[48px] px-4 py-3 active:bg-accent/80 transition-colors cursor-pointer"
                      data-testid="dropdown-settings"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Plan Information */}
                    <div className="px-4 py-3 text-sm text-muted-foreground border-b border-border bg-muted/20">
                      Current Plan: <span className="font-semibold capitalize text-foreground">{userPlan}</span>
                    </div>
                    
                    {/* Manage Plan - Always show for paid users */}
                    {isPaidUser && (
                      <DropdownMenuItem 
                        onClick={() => {
                          const currentPath = window.location.pathname;
                          const isAdvocateRoute = currentPath.startsWith('/advocate');
                          // Route to pricing pages with manage parameter for now
                          navigate(isAdvocateRoute ? '/advocate/pricing?manage=true' : '/parent/pricing?manage=true');
                        }} 
                        className="min-h-[48px] px-4 py-3 active:bg-accent/80 transition-colors cursor-pointer"
                        data-testid="dropdown-manage-plan"
                      >
                        <CreditCard className="h-5 w-5 mr-3" />
                        <span className="font-medium">Manage Plan</span>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Upgrade Plan - Same logic as header buttons */}
                    {user?.role === 'parent' && userPlan !== 'hero' && (
                      <DropdownMenuItem 
                        onClick={() => {
                          navigate('/parent/pricing');
                        }} 
                        className="min-h-[48px] px-4 py-3 active:bg-accent/80 transition-colors cursor-pointer"
                        data-testid="dropdown-upgrade-plan-parent"
                      >
                        <Crown className="h-5 w-5 mr-3 text-yellow-500" />
                        <span className="font-medium">Upgrade Plan</span>
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role === 'advocate' && userPlan !== 'agency-plus' && (
                      <DropdownMenuItem 
                        onClick={() => {
                          navigate('/advocate/pricing');
                        }} 
                        className="min-h-[48px] px-4 py-3 active:bg-accent/80 transition-colors cursor-pointer"
                        data-testid="dropdown-upgrade-plan-advocate"
                      >
                        <Crown className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="font-medium">Upgrade Plan</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="min-h-[48px] px-4 py-3 active:bg-accent/80 transition-colors cursor-pointer text-destructive focus:text-destructive"
                      data-testid="dropdown-sign-out"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 max-w-full pb-20 md:pb-6 min-h-0">
              {/* Breadcrumb Navigation */}
              <div className="mb-4 md:mb-6">
                <Breadcrumb showBackButton={false} className="md:mb-0" />
              </div>
              
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
}

// Default export for compatibility
export default DashboardLayout;