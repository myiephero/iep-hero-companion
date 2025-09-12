import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  ClipboardCheck,
  Lock,
  Sparkles
} from "lucide-react";
import { allAdvocateTools, getToolsByCategory } from "@/lib/advocateToolsRegistry";
import { useToolAccess } from "@/hooks/useToolAccess";

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
  notificationCount?: number;
  isLocked?: boolean;
  requiredPlan?: string;
  'data-testid'?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const getParentNavigation = (dashboardUrl: string, userPlan: string, isAdvocate: boolean): SidebarSection[] => {
  const baseItems: SidebarItem[] = [
    { title: "Dashboard", url: dashboardUrl, icon: LayoutDashboard },
  ];


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

const getAdvocateNavigation = (dashboardUrl: string, pendingCount?: number, canUse?: any): SidebarSection[] => {
  // Core navigation items (always available)
  const coreItems: SidebarItem[] = [
    { title: "My Cases", url: dashboardUrl, icon: LayoutDashboard, notificationCount: pendingCount, 'data-testid': 'nav-dashboard' },
    { title: "Parent Clients", url: "/advocate/parents", icon: Users, 'data-testid': 'nav-parents' },
    { title: "Client Students", url: "/advocate/students", icon: GraduationCap, 'data-testid': 'nav-students' },
    { title: "Tools Hub", url: "/advocate/tools", icon: FileSearch, badge: "All Tools", 'data-testid': 'nav-tools-hub' },
    { title: "Messages", url: "/advocate/messages", icon: MessageSquare, 'data-testid': 'nav-messages' },
  ];

  // Quick Tools from registry - show popular/frequently used tools
  const popularTools = allAdvocateTools
    .filter(tool => tool.isPopular)
    .slice(0, 4)
    .map(tool => {
      const hasAccess = canUse ? canUse(tool.requiredFeature) : false;
      return {
        title: tool.title,
        url: tool.route,
        icon: tool.icon,
        badge: hasAccess ? undefined : tool.badge,
        isLocked: !hasAccess,
        requiredPlan: hasAccess ? undefined : tool.requiredPlan,
        'data-testid': `nav-tool-${tool.id}`
      };
    });

  // Additional tools from registry for quick access
  const quickAccessTools: SidebarItem[] = [
    { title: "Client Matching", url: "/advocate/matching", icon: UserCheck, 'data-testid': 'nav-matching' },
    { title: "Schedule", url: "/advocate/schedule", icon: Calendar, 'data-testid': 'nav-schedule' },
    ...popularTools
  ];

  return [
    {
      title: "Advocate Portal", 
      items: coreItems
    },
    {
      title: "Quick Tools",
      items: quickAccessTools
    }
  ];
};

// Account items moved to top right dropdown

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
  
  // Use TanStack Query for real-time pending assignments count sync
  const { data: pendingData } = useQuery({
    queryKey: ['/api/match/pending-assignments'],
    enabled: isAdvocate && !!user,
    refetchInterval: 30000, // Backup polling every 30 seconds
    staleTime: 5000, // Consider data stale after 5 seconds for immediate updates
    retry: (failureCount, error) => {
      // Don't retry on 403/404 errors (advocate not found)
      if (error?.message?.includes('403') || error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 3;
    }
  });
  
  const pendingAssignmentsCount = (pendingData as any)?.total_pending || 0;
  
  const { canUse, requiredPlanFor } = useToolAccess();
  const navigation = isAdvocate ? getAdvocateNavigation(dashboardUrl, pendingAssignmentsCount, canUse) : getParentNavigation(dashboardUrl, userPlan, isAdvocate);
  
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
                {section.items.map((item) => {
                  const ItemComponent = item.isLocked ? 'div' : Link;
                  const isItemActive = isActive(item.url);
                  const itemClass = `w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all ${
                    isItemActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : item.isLocked 
                        ? 'text-muted-foreground hover:bg-muted/20 cursor-not-allowed opacity-70'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild={!item.isLocked}
                        className={itemClass}
                        data-testid={item['data-testid']}
                      >
                        {item.isLocked ? (
                          <div className="flex items-center gap-3 w-full">
                            <div className="relative">
                              <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : ''}`} />
                              <Lock className="h-2 w-2 absolute -top-1 -right-1 text-muted-foreground" />
                            </div>
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                <Badge variant="outline" className="text-xs px-2 py-0 border-dashed">
                                  {item.requiredPlan}
                                </Badge>
                                {item.notificationCount && item.notificationCount > 0 && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0 ml-auto bg-red-500 text-white" data-testid="notification-badge">
                                    {item.notificationCount}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
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
                                {item.notificationCount && item.notificationCount > 0 && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0 ml-auto bg-red-500 text-white" data-testid="notification-badge">
                                    {item.notificationCount}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

      </SidebarContent>
    </Sidebar>
  );
}
