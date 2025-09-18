import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { normalizeSubscriptionPlan } from "@/lib/planAccess";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isLast?: boolean;
}

interface BreadcrumbProps {
  className?: string;
  showBackButton?: boolean;
}

export function Breadcrumb({ className = "", showBackButton = false }: BreadcrumbProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan);
  const isAdvocate = user?.role === 'advocate';
  
  // Generate dashboard URL
  const advocatePlanMapping = {
    'starter': 'starter',
    'pro': 'pro', 
    'agency': 'agency',
    'agency-plus': 'agency-plus'
  };
  const advocatePlanSlug = advocatePlanMapping[userPlan] || 'starter';
  const dashboardUrl = isAdvocate ? `/advocate/dashboard-${advocatePlanSlug}` : `/parent/dashboard-${userPlan}`;

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home/dashboard
    breadcrumbs.push({
      label: "Dashboard",
      href: dashboardUrl
    });

    // Parse path segments for specific routes
    if (segments.length > 1) {
      const role = segments[0]; // 'parent' or 'advocate'
      const section = segments[1];
      
      // Map common sections to readable names
      const sectionMap: Record<string, string> = {
        'messages': 'Messages',
        'parents': 'Parent Clients',
        'students': 'Client Students', 
        'tools': '',
        'matching': isAdvocate ? 'Client Matching' : 'Find Advocates',
        'profile': 'Profile',
        'settings': 'Settings',
        'pricing': 'Pricing Plans'
      };

      if (sectionMap[section] && sectionMap[section] !== '') {
        breadcrumbs.push({
          label: sectionMap[section],
          href: `/${role}/${section}`
        });
      }

      // Add sub-sections if present
      if (segments.length > 2) {
        const subsection = segments[2];
        const subSectionMap: Record<string, string> = {
          'autism': 'Autism Tools',
          'gifted': 'Gifted Tools',
          'emergent': 'Emergent Tools'
        };

        if (subSectionMap[subsection]) {
          breadcrumbs.push({
            label: subSectionMap[subsection],
            href: `/${role}/${section}/${subsection}`
          });
        }
      }
    }

    // Mark the last item
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isLast = true;
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const showBreadcrumbs = breadcrumbs.length > 1;
  
  // Don't show on dashboard pages
  const isDashboardPage = location.pathname.includes('/dashboard');
  if (isDashboardPage) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mobile back button - DISABLED BY USER REQUEST */}
      
      {/* Desktop breadcrumbs */}
      {showBreadcrumbs && (
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link 
            to={dashboardUrl}
            className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded"
          >
            <Home className="h-4 w-4" />
          </Link>
          
          {breadcrumbs.slice(1).map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {item.isLast ? (
                <span className="font-medium text-foreground px-1 py-0.5 rounded">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href!}
                  className="hover:text-foreground transition-colors px-1 py-0.5 rounded"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}
      
      {/* Mobile page title */}
      <div className="md:hidden flex-1 min-w-0">
        <h1 className="font-semibold text-lg truncate">
          {breadcrumbs[breadcrumbs.length - 1]?.label || 'Page'}
        </h1>
      </div>
    </div>
  );
}