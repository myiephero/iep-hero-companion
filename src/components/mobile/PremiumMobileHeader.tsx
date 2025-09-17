import React from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SafeAreaTop } from './SafeArea';

interface PremiumMobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'large' | 'transparent' | 'elevated';
  className?: string;
  children?: React.ReactNode;
}

export function PremiumMobileHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  variant = 'default',
  className,
  children
}: PremiumMobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const baseClasses = cn(
    "sticky top-0 z-40 w-full transition-all duration-200",
    variant === 'transparent' 
      ? "bg-transparent" 
      : variant === 'elevated'
      ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 shadow-sm"
      : "bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
  );

  const contentClasses = cn(
    "flex items-center justify-between px-4",
    variant === 'large' ? "py-6" : "py-4"
  );

  return (
    <header className={cn(baseClasses, className)}>
      <SafeAreaTop>
        <div className={contentClasses}>
          {/* Left Side - Back Button */}
          <div className="flex items-center min-w-[44px]">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-150"
                data-testid="header-back-button"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center px-4">
            {children || (
              <div className="space-y-0.5">
                {title && (
                  <h1 className={cn(
                    "font-semibold text-gray-900 dark:text-gray-100 leading-tight",
                    variant === 'large' ? "text-2xl" : "text-lg"
                  )}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Action */}
          <div className="flex items-center justify-end min-w-[44px]">
            {rightAction || (
              <div className="w-10 h-10" /> // Spacer for balance
            )}
          </div>
        </div>
      </SafeAreaTop>
    </header>
  );
}

// Pre-built Header Variants
export function PremiumLargeHeader({ title, subtitle, ...props }: Omit<PremiumMobileHeaderProps, 'variant'>) {
  return (
    <PremiumMobileHeader
      {...props}
      title={title}
      subtitle={subtitle}
      variant="large"
    />
  );
}

export function PremiumElevatedHeader({ ...props }: Omit<PremiumMobileHeaderProps, 'variant'>) {
  return (
    <PremiumMobileHeader
      {...props}
      variant="elevated"
    />
  );
}

export function PremiumTransparentHeader({ ...props }: Omit<PremiumMobileHeaderProps, 'variant'>) {
  return (
    <PremiumMobileHeader
      {...props}
      variant="transparent"
    />
  );
}