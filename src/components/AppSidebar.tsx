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
  return [];
};

const getAdvocateNavigation = (dashboardUrl: string, pendingCount?: number, canUse?: any): SidebarSection[] => {
  return [];
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const { canUse } = useToolAccess();
  
  // Get user plan info
  const userPlan = normalizeSubscriptionPlan(user?.subscriptionPlan as any || 'free');
  const dashboardRoute = getPlanDashboardRoute(user?.role || 'parent');
  
  // Get pending message count for advocate notifications
  const { data: pendingCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: user?.role === 'advocate'
  });
  
  const isAdvocate = user?.role === 'advocate';
  const navigation = isAdvocate 
    ? getAdvocateNavigation(dashboardRoute, Number(pendingCount) || 0, canUse)
    : getParentNavigation(dashboardRoute, userPlan, canUse);

  return (
    <Sidebar className="w-64">
      <SidebarContent className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={iepHeroIcon}
              alt="My IEP Hero"
              className="h-8 w-8 rounded-lg shadow-sm"
            />
            <div className="flex flex-col">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                My IEP Hero
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                {isAdvocate ? 'Advocate Portal' : 'Parent Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Empty for now */}
        <div className="flex-1">
          {/* Navigation will be empty as requested */}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {userPlan} Plan
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}