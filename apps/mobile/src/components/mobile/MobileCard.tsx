import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outline" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

/**
 * Mobile-optimized card component that uses full width and provides native mobile feel.
 * Designed specifically for mobile-first layouts without desktop width constraints.
 */
export function MobileCard({ 
  children, 
  className, 
  variant = "default",
  padding = "md",
  interactive = false,
  fullWidth = true,
  onClick
}: MobileCardProps) {
  const baseStyles = cn(
    // Mobile-first: full width with edge-to-edge design
    {
      "w-full": fullWidth,
      "rounded-none": fullWidth, // Edge-to-edge on mobile
      "sm:rounded-lg": fullWidth, // Rounded on larger screens
    },
    // Variants
    {
      "bg-card border border-border shadow-sm": variant === "default",
      "bg-card border border-border shadow-md": variant === "elevated", 
      "bg-transparent border border-border": variant === "outline",
      "bg-transparent border-none shadow-none": variant === "ghost",
    },
    // Interactive states
    {
      "cursor-pointer active:scale-[0.98] transition-transform duration-150": interactive,
      "hover:shadow-md hover:bg-card/80": interactive && variant !== "ghost",
    },
    // Padding variants
    {
      "p-0": padding === "none",
      "p-3": padding === "sm",
      "p-4": padding === "md", 
      "p-6": padding === "lg",
    },
    className
  )

  if (interactive || onClick) {
    return (
      <div
        className={baseStyles}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        data-testid="mobile-card-interactive"
      >
        {children}
      </div>
    )
  }

  return (
    <div className={baseStyles} data-testid="mobile-card">
      {children}
    </div>
  )
}

/**
 * Pre-configured mobile card variants for common use cases
 */
export function MobileCardElevated({ children, className, ...props }: Omit<MobileCardProps, 'variant'>) {
  return (
    <MobileCard variant="elevated" className={className} {...props} data-testid="mobile-card-elevated">
      {children}
    </MobileCard>
  )
}

export function MobileCardInteractive({ children, className, onClick, ...props }: Omit<MobileCardProps, 'variant' | 'interactive'>) {
  return (
    <MobileCard 
      variant="elevated" 
      interactive 
      onClick={onClick}
      className={className} 
      {...props} 
      data-testid="mobile-card-interactive-preset"
    >
      {children}
    </MobileCard>
  )
}

/**
 * Mobile card with standard header/content structure
 */
interface MobileCardWithHeaderProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: MobileCardProps['variant'];
}

export function MobileCardWithHeader({
  title,
  description,
  children,
  className,
  headerAction,
  variant = "default"
}: MobileCardWithHeaderProps) {
  return (
    <MobileCard variant={variant} padding="none" className={className} data-testid="mobile-card-with-header">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </MobileCard>
  )
}