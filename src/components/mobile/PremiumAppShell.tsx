import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Wrench, 
  FileText, 
  MessageCircle, 
  Mail,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SafeAreaBottom } from './SafeArea';

interface PremiumBottomNavProps {
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  isActive?: boolean;
  roles: ('parent' | 'advocate')[];
}

export function PremiumBottomNav({ className }: PremiumBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdvocate = user?.role === 'advocate';
  const isParent = user?.role === 'parent';

  // Premium navigation items based on user role
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      href: isAdvocate ? '/advocate/dashboard-pro' : '/parent/dashboard-free',
      roles: ['parent', 'advocate'],
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      href: isAdvocate ? '/advocate/tools' : '/parent/tools',
      badge: isAdvocate ? '21' : '12',
      roles: ['parent', 'advocate'],
    },
    {
      id: 'documents',
      label: 'Docs',
      icon: FileText,
      href: isAdvocate ? '/advocate/documents' : '/parent/documents',
      roles: ['parent', 'advocate'],
    },
    {
      id: 'messages',
      label: 'Chat',
      icon: MessageCircle,
      href: isAdvocate ? '/advocate/messages' : '/parent/messages',
      roles: ['parent', 'advocate'],
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      href: '/advocate/clients',
      roles: ['advocate'],
    },
    {
      id: 'analytics',
      label: 'Insights',
      icon: BarChart3,
      href: isAdvocate ? '/advocate/analytics' : '/parent/progress',
      roles: ['parent', 'advocate'],
    },
  ];

  // Filter items based on user role
  const visibleItems = navItems.filter(item => 
    item.roles.includes(user?.role as 'parent' | 'advocate')
  );

  // Determine active item
  const activeItem = visibleItems.find(item => {
    const currentPath = location.pathname;
    if (item.id === 'dashboard') {
      return currentPath.includes('/dashboard');
    }
    return currentPath.includes(item.href.split('/').pop() || '');
  });

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-800/20",
      "supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-950/80",
      className
    )}>
      <SafeAreaBottom className="px-2 pt-2">
        <nav className="flex items-center justify-around max-w-md mx-auto">
          {visibleItems.map((item) => {
            const isActive = activeItem?.id === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "px-3 py-2 rounded-xl transition-all duration-200 ease-out",
                  "min-w-[60px] min-h-[60px] group",
                  "active:scale-95 active:bg-gray-100 dark:active:bg-gray-800",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                data-testid={`nav-${item.id}`}
              >
                {/* Premium Active Indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                )}
                
                {/* Icon Container with Badge */}
                <div className="relative mb-1">
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400 scale-110" 
                      : "text-gray-500 dark:text-gray-400 group-hover:scale-105"
                  )} />
                  
                  {/* Premium Badge */}
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg">
                      {item.badge}
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium leading-none transition-all duration-200",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </SafeAreaBottom>
    </div>
  );
}

// Premium Mobile App Shell
interface MobileAppShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileAppShell({ 
  children, 
  showBottomNav = true, 
  className 
}: MobileAppShellProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-950",
      "relative overflow-x-hidden",
      className
    )}>
      {/* Main Content */}
      <main className={cn(
        "relative z-10",
        showBottomNav ? "pb-20" : "pb-4"
      )}>
        {children}
      </main>
      
      {/* Premium Bottom Navigation */}
      {showBottomNav && <PremiumBottomNav />}
    </div>
  );
}