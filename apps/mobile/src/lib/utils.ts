import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Centralized IEP status color utility function
 * Provides consistent color mapping across all views for IEP status tags
 */
export function getIEPStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-muted text-muted-foreground";
  
  switch (status.toLowerCase()) {
    case "active": return "bg-success text-success-foreground";
    case "review": return "bg-warning text-warning-foreground";
    case "developing": return "bg-warning text-warning-foreground"; // Alias for backward compatibility
    case "expired": return "bg-destructive text-destructive-foreground";
    case "inactive": return "bg-destructive text-destructive-foreground"; // Alias for backward compatibility
    default: return "bg-muted text-muted-foreground";
  }
}
