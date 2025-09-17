import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Star, Sparkles } from 'lucide-react';

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'interactive';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function PremiumCard({ 
  children, 
  variant = 'default', 
  className, 
  onClick,
  disabled = false 
}: PremiumCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-200 ease-out";
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
    glass: "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-800/20 shadow-lg",
    elevated: "bg-white dark:bg-gray-900 shadow-lg shadow-gray-900/5 dark:shadow-black/20 border border-gray-100 dark:border-gray-800",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-md",
    interactive: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:shadow-gray-900/10 dark:hover:shadow-black/30 hover:border-gray-300 dark:hover:border-gray-700 active:scale-[0.98] cursor-pointer"
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </Component>
  );
}

// Tool Card for Professional Tools Hub
interface PremiumToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isLocked?: boolean;
  requiredPlan?: string;
  onClick?: () => void;
  className?: string;
}

export function PremiumToolCard({
  icon,
  title,
  description,
  badge,
  isPopular = false,
  isNew = false,
  isLocked = false,
  requiredPlan,
  onClick,
  className
}: PremiumToolCardProps) {
  return (
    <PremiumCard 
      variant={isLocked ? "default" : "interactive"}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
        "p-6 text-left relative overflow-hidden",
        isLocked && "opacity-60",
        className
      )}
    >
      {/* Background Pattern for Premium Tools */}
      {!isLocked && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent dark:from-blue-950/20 rounded-full transform translate-x-16 -translate-y-16" />
      )}
      
      <div className="relative z-10 space-y-4">
        {/* Header with Icon and Badges */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Icon */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isLocked 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400" 
                : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400"
            )}>
              {icon}
            </div>
            
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {badge && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {badge}
                </span>
              )}
              {isPopular && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                  <Star className="h-3 w-3" />
                  Popular
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <Sparkles className="h-3 w-3" />
                  New
                </span>
              )}
            </div>
          </div>
          
          {/* Action Indicator */}
          {!isLocked && (
            <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-tight">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Locked State */}
        {isLocked && requiredPlan && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 border-dashed">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Requires {requiredPlan}
              </span>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

// Feature Card for Marketing Sections
interface PremiumFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

export function PremiumFeatureCard({
  icon,
  title,
  description,
  accent = 'blue',
  className
}: PremiumFeatureCardProps) {
  const accentClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400",
    green: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-600 dark:text-green-400",
    purple: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-600 dark:text-purple-400",
    orange: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 text-orange-600 dark:text-orange-400"
  };

  return (
    <PremiumCard variant="elevated" className={cn("p-6 text-center space-y-4", className)}>
      <div className={cn(
        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto",
        accentClasses[accent]
      )}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </PremiumCard>
  );
}