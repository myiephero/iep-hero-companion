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
  UserPlus
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

const parentNavigation: SidebarSection[] = [
  {
    title: "Parent Portal",
    items: [
      { title: "Dashboard", url: "/parent/dashboard", icon: LayoutDashboard },
      { title: "Create Student", url: "/parent-pricing-plan", icon: GraduationCap },
      { title: "Tools Hub", url: "/tools/hub", icon: FileSearch },
      { title: "Document Vault", url: "/tools/document-vault", icon: FileText },
      { title: "HERO Plan", url: "/upsell/hero-plan", icon: Crown, badge: "Premium" },
    ]
  },
  {
    title: "Quick Tools",
    items: [
      { title: "IEP Review", url: "/tools/iep-review", icon: FileSearch, badge: "AI" },
      { title: "Accommodations", url: "/tools/autism-accommodations", icon: Building2 },
      { title: "Meeting Prep", url: "/parent/meeting-prep", icon: Calendar },
    ]
  }
];

const advocateNavigation: SidebarSection[] = [
  {
    title: "Advocate Portal", 
    items: [
      { title: "My Cases", url: "/advocate/dashboard", icon: LayoutDashboard },
      { title: "Tools Hub", url: "/tools/hub", icon: FileSearch },
      { title: "Document Vault", url: "/tools/document-vault", icon: FileText },
      { title: "Schedule", url: "/advocate/schedule", icon: Calendar },
      { title: "Messages", url: "/advocate/messages", icon: MessageSquare },
    ]
  },
  {
    title: "Quick Tools",
    items: [
      { title: "IEP Review", url: "/tools/iep-review", icon: FileSearch },
      { title: "Accommodations", url: "/tools/autism-accommodations", icon: Building2 },
    ]
  }
];

const accountItems: SidebarItem[] = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Determine which navigation to show based on current route
  const isAdvocateRoute = currentPath.startsWith('/advocate');
  const navigation = isAdvocateRoute ? advocateNavigation : parentNavigation;
  
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
                <p className="text-xs text-muted-foreground">
                  {isAdvocateRoute ? 'Advocate Portal' : 'Parent Portal'}
                </p>
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
