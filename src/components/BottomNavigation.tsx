import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { normalizeSubscriptionPlan } from "@/lib/planAccess";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  GraduationCap, 
  FileSearch,
  UserCheck,
  Home
} from "lucide-react";

interface BottomNavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  'data-testid'?: string;
}

export function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdvocate = user?.role === 'advocate';
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan);
  
  // Generate plan-specific dashboard URL using already normalized plan
  const advocatePlanMapping = {
    'starter': 'starter',
    'pro': 'pro', 
    'agency': 'agency',
    'agency-plus': 'agency-plus'
  };
  const advocatePlanSlug = advocatePlanMapping[userPlan] || 'starter';
  const dashboardUrl = isAdvocate ? `/advocate/dashboard-${advocatePlanSlug}` : `/parent/dashboard-${userPlan}`;

  // Define navigation items based on user role
  const getNavigationItems = (): BottomNavItem[] => {
    if (isAdvocate) {
      return [
        { title: "Cases", url: dashboardUrl, icon: LayoutDashboard, 'data-testid': 'bottom-nav-dashboard' },
        { title: "Parents", url: "/advocate/parents", icon: Users, 'data-testid': 'bottom-nav-parents' },
        { title: "Students", url: "/advocate/students", icon: GraduationCap, 'data-testid': 'bottom-nav-students' },
        { title: "Tools", url: "/advocate/tools", icon: FileSearch, 'data-testid': 'bottom-nav-tools' },
        { title: "Messages", url: "/advocate/messages", icon: MessageSquare, 'data-testid': 'bottom-nav-messages' }
      ];
    } else {
      return [
        { title: "Dashboard", url: dashboardUrl, icon: LayoutDashboard, 'data-testid': 'bottom-nav-dashboard' },
        { title: "Advocates", url: "/parent/matching", icon: UserCheck, 'data-testid': 'bottom-nav-matching' },
        { title: "Messages", url: "/parent/messages", icon: MessageSquare, 'data-testid': 'bottom-nav-messages' }
      ];
    }
  };

  const navigationItems = getNavigationItems();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    // Handle dashboard special case
    if (path === dashboardUrl) {
      return currentPath === path || currentPath.startsWith('/parent/dashboard') || currentPath.startsWith('/advocate/dashboard');
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden safe-area-inset">
      <div className="flex items-center justify-around px-2 py-1 pb-safe">
        {navigationItems.map((item) => {
          const isItemActive = isActive(item.url);
          
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-0 flex-1 min-h-[44px] ${
                isItemActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={item['data-testid']}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isItemActive ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium truncate w-full text-center ${
                isItemActive ? 'text-primary' : ''
              }`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}