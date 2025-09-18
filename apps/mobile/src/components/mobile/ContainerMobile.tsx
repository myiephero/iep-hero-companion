import { cn } from "@/lib/utils"

interface ContainerMobileProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  fullHeight?: boolean;
}

/**
 * Mobile-first container that uses full screen width without max-width constraints.
 * Perfect for creating native-feeling mobile layouts.
 */
export function ContainerMobile({ 
  children, 
  className, 
  padding = "md",
  fullHeight = false 
}: ContainerMobileProps) {
  return (
    <div
      className={cn(
        "w-full", // Full width, no constraints
        {
          "px-0": padding === "none",
          "px-3": padding === "sm",
          "px-4": padding === "md",
          "px-6": padding === "lg",
          "min-h-screen min-h-dvh": fullHeight,
        },
        className
      )}
      data-testid="container-mobile"
    >
      {children}
    </div>
  )
}