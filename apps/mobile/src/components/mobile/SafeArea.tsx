import { cn } from "@/lib/utils"

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

/**
 * Safe area wrapper component for handling iOS notch, home indicator, and other device-specific insets.
 * Essential for proper mobile layout on modern devices.
 */
export function SafeArea({ 
  children, 
  className, 
  top = false,
  bottom = false,
  left = false,
  right = false 
}: SafeAreaProps) {
  return (
    <div
      className={cn(
        {
          "pt-safe": top,
          "pb-safe": bottom,
          "pl-safe": left,
          "pr-safe": right,
        },
        className
      )}
      data-testid="safe-area"
    >
      {children}
    </div>
  )
}

/**
 * Common safe area patterns
 */
export function SafeAreaTop({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SafeArea top className={className} data-testid="safe-area-top">
      {children}
    </SafeArea>
  )
}

export function SafeAreaBottom({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SafeArea bottom className={className} data-testid="safe-area-bottom">
      {children}
    </SafeArea>
  )
}

export function SafeAreaHorizontal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SafeArea left right className={className} data-testid="safe-area-horizontal">
      {children}
    </SafeArea>
  )
}

export function SafeAreaFull({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SafeArea top bottom left right className={className} data-testid="safe-area-full">
      {children}
    </SafeArea>
  )
}