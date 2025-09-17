import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SafeAreaBottom } from "./SafeArea"

interface BottomSheetProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Mobile-optimized bottom sheet using Dialog primitives.
 * Provides native mobile feel with proper safe area handling.
 */
export function BottomSheet({ 
  children, 
  trigger, 
  title, 
  description, 
  className, 
  open, 
  onOpenChange 
}: BottomSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild data-testid="bottom-sheet-trigger">
        {trigger}
      </DialogTrigger>
      <DialogContent
        className={cn(
          // Mobile-first positioning
          "fixed inset-x-0 bottom-0 top-auto",
          "translate-y-0 translate-x-0",
          "data-[state=closed]:slide-in-from-bottom-full",
          "data-[state=open]:slide-in-from-bottom-0",
          // Mobile-optimized styling
          "w-full max-w-none rounded-t-2xl rounded-b-none",
          "border-t border-l border-r border-b-0",
          "max-h-[85vh] overflow-hidden",
          "p-0",
          className
        )}
        data-testid="bottom-sheet-content"
      >
        {/* Handle bar for swipe indication */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <DialogHeader className="px-6 pb-4">
            {title && (
              <DialogTitle className="text-lg font-semibold text-left">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground text-left">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content with safe area bottom */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <SafeAreaBottom>
            {children}
          </SafeAreaBottom>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Controlled bottom sheet variant
 */
interface BottomSheetControlledProps extends Omit<BottomSheetProps, 'trigger'> {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomSheetControlled({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  description, 
  className 
}: BottomSheetControlledProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto",
          "translate-y-0 translate-x-0",
          "data-[state=closed]:slide-in-from-bottom-full",
          "data-[state=open]:slide-in-from-bottom-0",
          "w-full max-w-none rounded-t-2xl rounded-b-none",
          "border-t border-l border-r border-b-0",
          "max-h-[85vh] overflow-hidden",
          "p-0",
          className
        )}
        data-testid="bottom-sheet-controlled"
      >
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {(title || description) && (
          <DialogHeader className="px-6 pb-4">
            {title && (
              <DialogTitle className="text-lg font-semibold text-left">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground text-left">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <SafeAreaBottom>
            {children}
          </SafeAreaBottom>
        </div>
      </DialogContent>
    </Dialog>
  )
}