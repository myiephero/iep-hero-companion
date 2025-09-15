import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  X, 
  LucideIcon
} from "lucide-react"

// Types for FAB actions
export interface FABAction {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "destructive"
  disabled?: boolean
  badge?: string | number
}

// Base FAB variants using CVA
const fabVariants = cva(
  "fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-glow shadow-button hover:shadow-button-hover",
        hero: "bg-gradient-hero text-primary-foreground hover:shadow-glow transform hover:scale-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        glass: "bg-surface-glass backdrop-blur-md border border-border-light text-foreground hover:bg-hover",
      },
      size: {
        sm: "h-12 w-12 [&_svg]:h-5 [&_svg]:w-5",
        default: "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6",
        lg: "h-16 w-16 [&_svg]:h-7 [&_svg]:w-7",
      },
      position: {
        "bottom-right": "bottom-6 right-6 safe-area-pb safe-area-pr",
        "bottom-left": "bottom-6 left-6 safe-area-pb safe-area-pl",
        "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2 safe-area-pb",
        "top-right": "top-6 right-6 safe-area-pt safe-area-pr",
        "top-left": "top-6 left-6 safe-area-pt safe-area-pl",
        custom: "", // For custom positioning
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "bottom-right",
    },
  }
)

// Action button variants for sub-actions
const actionButtonVariants = cva(
  "flex items-center justify-center rounded-full shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border border-border hover:bg-hover",
        primary: "bg-primary text-primary-foreground hover:bg-primary-glow",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-10 w-10 [&_svg]:h-4 [&_svg]:w-4",
        default: "h-12 w-12 [&_svg]:h-5 [&_svg]:w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Simple FAB Props
export interface SimpleFABProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "children">,
    VariantProps<typeof fabVariants> {
  icon?: LucideIcon
  label?: string
  badge?: string | number
  customPosition?: { top?: string; bottom?: string; left?: string; right?: string }
}

// Expandable FAB Props
export interface ExpandableFABProps
  extends Omit<SimpleFABProps, "onClick"> {
  actions: FABAction[]
  mainIcon?: LucideIcon
  expandDirection?: "up" | "down" | "left" | "right"
  spacing?: number
  onMainClick?: () => void
  defaultExpanded?: boolean
  closeOnActionClick?: boolean
}

// Badge Component for notifications
const FABBadge = ({ badge }: { badge?: string | number }) => {
  if (!badge) return null
  
  return (
    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
      {typeof badge === "number" && badge > 99 ? "99+" : badge}
    </div>
  )
}

// Action Item with Label (for expandable FAB)
interface ActionItemProps {
  action: FABAction
  size: "sm" | "default"
  style?: React.CSSProperties
  onActionClick: (action: FABAction) => void
}

const ActionItem = React.forwardRef<HTMLButtonElement, ActionItemProps>(
  ({ action, size, style, onActionClick }, ref) => {
    const Icon = action.icon

    return (
      <div 
        className="flex items-center gap-3 transition-all duration-300"
        style={style}
      >
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-medium text-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-border whitespace-nowrap">
            {action.label}
          </span>
          <button
            ref={ref}
            className={cn(actionButtonVariants({ variant: action.variant || "default", size }))}
            onClick={() => onActionClick(action)}
            disabled={action.disabled}
            aria-label={action.label}
            data-testid={`fab-action-${action.id}`}
          >
            <Icon />
            {action.badge && <FABBadge badge={action.badge} />}
          </button>
        </div>
      </div>
    )
  }
)
ActionItem.displayName = "ActionItem"

// Simple FAB Component
export const SimpleFAB = React.forwardRef<HTMLButtonElement, SimpleFABProps>(
  ({ 
    className, 
    variant, 
    size, 
    position, 
    icon: IconComponent = Plus,
    label,
    badge,
    customPosition,
    style,
    ...props 
  }, ref) => {
    const fabStyle = customPosition 
      ? { ...style, ...customPosition }
      : style

    return (
      <button
        className={cn(fabVariants({ variant, size, position, className }))}
        ref={ref}
        style={fabStyle}
        aria-label={label || "Floating action button"}
        data-testid="simple-fab"
        {...props}
      >
        <IconComponent />
        {badge && <FABBadge badge={badge} />}
      </button>
    )
  }
)
SimpleFAB.displayName = "SimpleFAB"

// Expandable FAB Component
export const ExpandableFAB = React.forwardRef<HTMLButtonElement, ExpandableFABProps>(
  ({ 
    className,
    variant,
    size,
    position,
    actions,
    mainIcon = Plus,
    expandDirection = "up",
    spacing = 16,
    onMainClick,
    defaultExpanded = false,
    closeOnActionClick = true,
    customPosition,
    label,
    badge,
    style,
    ...props
  }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
    
    const handleMainClick = () => {
      setIsExpanded(!isExpanded)
      onMainClick?.()
    }

    const handleActionClick = (action: FABAction) => {
      action.onClick()
      if (closeOnActionClick) {
        setIsExpanded(false)
      }
    }

    const getActionStyle = (index: number): React.CSSProperties => {
      const distance = (index + 1) * (spacing + (size === "lg" ? 64 : size === "sm" ? 48 : 56))
      
      switch (expandDirection) {
        case "up":
          return { 
            transform: isExpanded ? `translateY(-${distance}px)` : "translateY(0)",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }
        case "down":
          return { 
            transform: isExpanded ? `translateY(${distance}px)` : "translateY(0)",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }
        case "left":
          return { 
            transform: isExpanded ? `translateX(-${distance}px)` : "translateX(0)",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }
        case "right":
          return { 
            transform: isExpanded ? `translateX(${distance}px)` : "translateX(0)",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }
        default:
          return {}
      }
    }

    const MainIcon = isExpanded ? X : mainIcon
    const fabStyle = customPosition 
      ? { ...style, ...customPosition }
      : style

    // Close on escape key
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isExpanded) {
          setIsExpanded(false)
        }
      }

      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }, [isExpanded])

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isExpanded && !((event.target as Element)?.closest('[data-fab-container]'))) {
          setIsExpanded(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isExpanded])

    return (
      <div 
        data-fab-container
        className="fixed z-50"
        style={fabStyle}
      >
        {/* Backdrop for mobile */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 transition-opacity duration-300"
            onClick={() => setIsExpanded(false)}
            data-testid="fab-backdrop"
          />
        )}
        
        {/* Action Items */}
        {actions.map((action, index) => (
          <ActionItem
            key={action.id}
            action={action}
            size={size === "lg" ? "default" : "sm"}
            style={getActionStyle(index)}
            onActionClick={handleActionClick}
          />
        ))}

        {/* Main FAB Button */}
        <button
          ref={ref}
          className={cn(
            fabVariants({ variant, size, position: customPosition ? "custom" : position, className }),
            isExpanded && "rotate-45"
          )}
          onClick={handleMainClick}
          aria-label={label || "Floating action menu"}
          aria-expanded={isExpanded}
          aria-haspopup="menu"
          data-testid="expandable-fab"
          {...props}
        >
          <MainIcon />
          {badge && <FABBadge badge={badge} />}
        </button>
      </div>
    )
  }
)
ExpandableFAB.displayName = "ExpandableFAB"

// Positioned FAB - Wrapper for custom positioning
export interface PositionedFABProps extends SimpleFABProps {
  top?: string
  bottom?: string
  left?: string
  right?: string
  children?: React.ReactNode
}

export const PositionedFAB = React.forwardRef<HTMLButtonElement, PositionedFABProps>(
  ({ top, bottom, left, right, children, ...props }, ref) => {
    const customPosition = { top, bottom, left, right }
    
    if (children) {
      return (
        <div 
          className="fixed z-50"
          style={customPosition}
        >
          {children}
        </div>
      )
    }
    
    return (
      <SimpleFAB
        ref={ref}
        position="custom"
        customPosition={customPosition}
        {...props}
      />
    )
  }
)
PositionedFAB.displayName = "PositionedFAB"

// Export main components and types
export { fabVariants, actionButtonVariants }