import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileSearch, 
  Users, 
  Crown, 
  Settings, 
  User,
  Building2,
  MessageSquare,
  Calendar,
  ChevronRight,
  Menu,
  FileText,
  GraduationCap,
  UserPlus,
  UserCheck,
  ClipboardCheck
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { setRole } from "@/lib/session";
import { normalizeSubscriptionPlan, getPlanDashboardRoute } from "@/lib/planAccess";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const getParentNavigation = (dashboardUrl: string, userPlan: string, isAdvocate: boolean): SidebarSection[] => {
  const baseItems: SidebarItem[] = [
    { title: "Dashboard", url: dashboardUrl, icon: LayoutDashboard },
  ];

  // Only show HERO Plan upgrade if user is PARENT and not already on Hero plan
  if (!isAdvocate && userPlan !== 'hero') {
    baseItems.push({ title: "HERO Plan", url: "/upsell/hero-plan", icon: Crown, badge: "Premium" });
  }

  return [
    {
      title: "Parent Portal",
      items: baseItems
    },
    {
      title: "Quick Tools",
      items: [
        { title: "Find Advocates", url: "/parent/matching", icon: UserCheck },
        { title: "Messages", url: "/parent/messages", icon: MessageSquare },
      ]
    }
  ];
};

const getAdvocateNavigation = (dashboardUrl: string): SidebarSection[] => [
  {
    title: "Advocate Portal", 
    items: [
      { title: "My Cases", url: dashboardUrl, icon: LayoutDashboard },
      { title: "Parent Clients", url: "/advocate/parents", icon: Users },
      { title: "Client Students", url: "/advocate/students", icon: GraduationCap },
      { title: "Tools Hub", url: "/advocate/tools", icon: FileSearch },
      { title: "Document Vault", url: "/tools/document-vault", icon: FileText },
      { title: "Schedule", url: "/advocate/schedule", icon: Calendar },
      { title: "Messages", url: "/advocate/messages", icon: MessageSquare },
    ]
  },
  {
    title: "Quick Tools",
    items: [
      { title: "Unified IEP Review", url: "/advocate/tools/unified-iep-review", icon: FileSearch, badge: "Enhanced" },
      { title: "Client Matching", url: "/advocate/matching", icon: UserCheck },
    ]
  }
];

// Dynamic account items based on role
const getAccountItems = (isAdvocateRoute: boolean): SidebarItem[] => [
  { title: "Profile", url: isAdvocateRoute ? "/advocate/profile" : "/parent/profile", icon: User },
  { title: "Settings", url: isAdvocateRoute ? "/advocate/settings" : "/parent/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Determine which navigation to show based on user's actual role from database
  const { profile, user } = useAuth();
  const isAdvocate = user?.role === 'advocate';
  
  // Generate plan-specific dashboard URL for both roles
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan);
  const advocatePlanMapping = {
    'starter': 'starter',
    'pro': 'pro', 
    'agency': 'agency',
    'agencyplus': 'agency-plus',
    'agency plus': 'agency-plus'
  };
  const advocatePlanSlug = advocatePlanMapping[user?.subscriptionPlan?.toLowerCase()] || 'starter';
  const dashboardUrl = isAdvocate ? `/advocate/dashboard-${advocatePlanSlug}` : `/parent/dashboard-${userPlan}`;
  
  const navigation = isAdvocate ? getAdvocateNavigation(dashboardUrl) : getParentNavigation(dashboardUrl, userPlan, isAdvocate);
  const accountItems = getAccountItems(isAdvocate);
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <Sidebar className="border-r border-sidebar-border bg-gradient-sidebar">
      <SidebarContent className="p-4">
        {/* Brand */}
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">My IEP Hero</h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {isAdvocate ? 'Advocate Portal' : 'Parent Portal'}
                  </p>
                  {/* SECURITY: NO ROLE SWITCHING ALLOWED - Users can only access their assigned role */}
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        {navigation.map((section, sectionIndex) => (
          <SidebarGroup key={sectionIndex} className="mb-6">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all ${
                        isActive(item.url)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Link to={item.url}>
                        <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : ''}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Account Section */}
        <SidebarGroup className="mt-auto">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Account
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.url)
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : ''}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
