import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { SafeAreaTop } from "./SafeArea"

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  sticky?: boolean;
}

/**
 * Mobile-optimized header with back navigation, title, and optional right action.
 * Designed for native mobile feel with proper safe area handling.
 */
export function MobileHeader({ 
  title,
  subtitle,
  className, 
  onBack,
  backLabel = "Back",
  rightAction,
  transparent = false,
  sticky = true
}: MobileHeaderProps) {
  return (
    <div
      className={cn(
        "w-full z-50",
        {
          "sticky top-0": sticky,
          "bg-background/95 backdrop-blur border-b border-border": !transparent,
          "bg-transparent": transparent,
        },
        className
      )}
      data-testid="mobile-header"
    >
      <SafeAreaTop>
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left section - Back button */}
          <div className="flex-shrink-0">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2 h-auto min-h-[44px] min-w-[44px] p-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  {backLabel}
                </span>
              </Button>
            )}
          </div>

          {/* Center section - Title */}
          <div className="flex-1 min-w-0 px-4">
            <div className="text-center">
              <h1 className="text-lg font-semibold leading-tight truncate text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right section - Action */}
          <div className="flex-shrink-0">
            {rightAction || (
              <div className="w-11 h-11" /> // Spacer to maintain center alignment
            )}
          </div>
        </div>
      </SafeAreaTop>
    </div>
  )
}

/**
 * Pre-configured mobile header variants
 */
export function MobileHeaderSimple({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <MobileHeader
      title={title}
      onBack={onBack}
      data-testid="mobile-header-simple"
    />
  )
}

export function MobileHeaderWithAction({ 
  title, 
  onBack, 
  rightAction 
}: { 
  title: string; 
  onBack?: () => void;
  rightAction: React.ReactNode;
}) {
  return (
    <MobileHeader
      title={title}
      onBack={onBack}
      rightAction={rightAction}
      data-testid="mobile-header-with-action"
    />
  )
}

export function MobileHeaderTransparent({ 
  title, 
  onBack 
}: { 
  title: string; 
  onBack?: () => void;
}) {
  return (
    <MobileHeader
      title={title}
      onBack={onBack}
      transparent
      data-testid="mobile-header-transparent"
    />
  )
}