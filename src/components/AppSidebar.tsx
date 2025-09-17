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
  Sparkles,
  Target,
  TrendingUp,
  Brain,
  Lightbulb,
  PenTool,
  Archive,
  FileBarChart,
  Shield
} from "lucide-react";
import iepHeroIcon from "@/assets/iep-hero-icon.png";
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

const getParentNavigation = (dashboardUrl: string, userPlan: string, canUse?: any): SidebarSection[] => {
  const baseItems: SidebarItem[] = [
    { title: "Dashboard", url: dashboardUrl, icon: LayoutDashboard, 'data-testid': 'nav-dashboard' },
    { title: "Students", url: "/parent/students", icon: GraduationCap, 'data-testid': 'nav-students' },
  ];

  // IEP Tools from EmergentToolsHub  
  const iepToolsItems: SidebarItem[] = [
    { title: "Unified IEP Review", url: "/parent/tools/unified-iep-review", icon: Brain, 'data-testid': 'nav-unified-iep-review' },
    { title: "Goal Generator", url: "/parent/tools/goal-generator", icon: Target, 'data-testid': 'nav-goal-generator' },
    { title: "Progress Notes", url: "/parent/tools/progress-notes", icon: TrendingUp, 'data-testid': 'nav-progress-notes' },
    { title: "Meeting Prep", url: "/parent/meeting-prep", icon: ClipboardCheck, 'data-testid': 'nav-meeting-prep' },
    { title: "IEP Master Suite", url: "/parent/tools/iep-master-suite", icon: Crown, 'data-testid': 'nav-iep-master-suite' },
  ];

  // Assessment Tools from EmergentToolsHub
  const assessmentToolsItems: SidebarItem[] = [
    { title: "Autism Accommodations", url: "/parent/tools/autism-accommodations", icon: Users, 'data-testid': 'nav-autism-accommodations' },
    { title: "Gifted & 2e Learners", url: "/parent/tools/gifted-2e-learners", icon: Sparkles, 'data-testid': 'nav-gifted-2e-learners' },
    { title: "Emotion Tracker", url: "/parent/tools/emotion-tracker", icon: User, 'data-testid': 'nav-emotion-tracker' },
  ];

  // Communication Tools from EmergentToolsHub
  const communicationItems: SidebarItem[] = [
    { title: "Smart Letter Generator", url: "/parent/tools/smart-letter-generator", icon: PenTool, 'data-testid': 'nav-smart-letter-generator' },
    { title: "Communication Tracker", url: "/parent/tools/communication-tracker", icon: MessageSquare, 'data-testid': 'nav-communication-tracker' },
    { title: "Find Advocates", url: "/parent/matching", icon: UserCheck, 'data-testid': 'nav-find-advocates' },
    { title: "Messages", url: "/parent/messages", icon: MessageSquare, 'data-testid': 'nav-messages' },
  ];

  // Digital Binder from EmergentToolsHub  
  const digitalBinderItems: SidebarItem[] = [
    { title: "Document Vault", url: "/tools/document-vault", icon: Archive, 'data-testid': 'nav-document-vault' },
    { title: "Student Profiles", url: "/parent/students", icon: GraduationCap, 'data-testid': 'nav-student-profiles' },
    { title: "Ask AI Documents", url: "/parent/tools/ask-ai-documents", icon: Brain, 'data-testid': 'nav-ask-ai-documents' },
  ];

  // Rights & Advocacy from EmergentToolsHub
  const rightsAdvocacyItems: SidebarItem[] = [
    { title: "IDEA Rights Guide", url: "/parent/tools/idea-rights-guide", icon: Shield, 'data-testid': 'nav-idea-rights-guide' },
    { title: "504 Plan Guide", url: "/parent/tools/plan-504-guide", icon: FileText, 'data-testid': 'nav-plan-504-guide' },
    { title: "Expert Analysis", url: "/parent/tools/expert-analysis", icon: Brain, 'data-testid': 'nav-expert-analysis' },
  ];

  return [
    {
      title: "DASHBOARD",
      items: baseItems
    },
    {
      title: "IEP TOOLS", 
      items: iepToolsItems
    },
    {
      title: "ASSESSMENT TOOLS",
      items: assessmentToolsItems
    },
    {
      title: "COMMUNICATION",
      items: communicationItems
    },
    {
      title: "DIGITAL BINDER",
      items: digitalBinderItems
    },
    {
      title: "RIGHTS & ADVOCACY",
      items: rightsAdvocacyItems
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
  const navigation = isAdvocate ? getAdvocateNavigation(dashboardUrl, pendingAssignmentsCount, canUse) : getParentNavigation(dashboardUrl, userPlan, canUse);
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <Sidebar className="border-r border-sidebar-border bg-gradient-sidebar">
      <SidebarContent className="p-4">
        {/* Brand */}
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={iepHeroIcon} alt="IEP Hero" className="w-8 h-8 object-contain" />
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
          <SidebarGroup key={sectionIndex} className="mb-8">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {section.items.map((item) => {
                  const ItemComponent = item.isLocked ? 'div' : Link;
                  const isItemActive = isActive(item.url);
                  const itemClass = `w-full justify-start gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-all ${
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
                          <div 
                            className="flex items-center gap-3 w-full" 
                            role="button" 
                            aria-disabled="true"
                            aria-label={`${item.title} - Requires ${item.requiredPlan} plan to access`}
                            tabIndex={0}
                          >
                            <div className="relative">
                              <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : ''}`} />
                              <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
                            </div>
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                <Badge variant="outline" className="text-xs px-2 py-0 border-dashed" aria-label={`Requires ${item.requiredPlan} plan`}>
                                  {item.requiredPlan}
                                </Badge>
                                {item.notificationCount && item.notificationCount > 0 && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0 ml-auto bg-red-500 text-white" data-testid="notification-badge" aria-label={`${item.notificationCount} pending notifications`}>
                                    {item.notificationCount}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <Link to={item.url} aria-label={`Navigate to ${item.title}${item.notificationCount ? ` (${item.notificationCount} pending)` : ''}`}>
                            <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : ''}`} />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0" aria-label={`Badge: ${item.badge}`}>
                                    {item.badge}
                                  </Badge>
                                )}
                                {item.notificationCount && item.notificationCount > 0 && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0 ml-auto bg-red-500 text-white" data-testid="notification-badge" aria-label={`${item.notificationCount} pending notifications`}>
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
