import { cn } from "@/lib/utils"
import { ContainerMobile } from "./ContainerMobile"

interface MobilePageProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  scrollable?: boolean;
}

/**
 * Full-page mobile wrapper with safe area handling and optional header/footer sections.
 * Designed for mobile-first, native-feeling page layouts.
 */
export function MobilePage({ 
  children, 
  className,
  header,
  footer,
  padding = "md",
  scrollable = true
}: MobilePageProps) {
  return (
    <div 
      className={cn(
        "min-h-screen min-h-dvh w-full flex flex-col bg-background",
        "safe-area-inset", // Add safe area insets
        className
      )}
      data-testid="mobile-page"
    >
      {/* Header section with safe area top */}
      {header && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="pt-safe">
            {header}
          </div>
        </div>
      )}

      {/* Main content area */}
      <main 
        className={cn(
          "flex-1 w-full",
          {
            "overflow-y-auto": scrollable,
            "overflow-hidden": !scrollable,
          }
        )}
      >
        <ContainerMobile padding={padding}>
          {children}
        </ContainerMobile>
      </main>

      {/* Footer section with safe area bottom */}
      {footer && (
        <div className="sticky bottom-0 z-50 bg-background/95 backdrop-blur border-t border-border pb-safe">
          {footer}
        </div>
      )}
    </div>
  )
}