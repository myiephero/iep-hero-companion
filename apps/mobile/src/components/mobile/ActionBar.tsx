import { cn } from "@/lib/utils"
import { SafeAreaBottom } from "./SafeArea"

interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "floating";
  fullWidth?: boolean;
}

/**
 * Mobile-optimized sticky bottom action bar for primary actions.
 * Uses safe area handling and provides native mobile feel.
 */
export function ActionBar({ 
  children, 
  className, 
  variant = "default",
  fullWidth = true 
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-50",
        {
          // Default: attached to bottom
          "bg-background/95 backdrop-blur border-t border-border": variant === "default",
          // Elevated: with shadow
          "bg-background shadow-lg border-t border-border": variant === "elevated",
          // Floating: detached with rounded corners
          "p-4": variant === "floating",
        },
        className
      )}
      data-testid="action-bar"
    >
      <SafeAreaBottom>
        <div
          className={cn(
            "flex items-center gap-3",
            {
              "p-4": variant !== "floating",
              "bg-card rounded-lg shadow-md border border-border p-4": variant === "floating",
              "justify-center": fullWidth,
              "justify-end": !fullWidth,
            }
          )}
        >
          {children}
        </div>
      </SafeAreaBottom>
    </div>
  )
}

/**
 * Pre-configured action bar variants
 */
export function ActionBarFloating({ children, className, ...props }: Omit<ActionBarProps, 'variant'>) {
  return (
    <ActionBar variant="floating" className={className} {...props} data-testid="action-bar-floating">
      {children}
    </ActionBar>
  )
}

export function ActionBarElevated({ children, className, ...props }: Omit<ActionBarProps, 'variant'>) {
  return (
    <ActionBar variant="elevated" className={className} {...props} data-testid="action-bar-elevated">
      {children}
    </ActionBar>
  )
}