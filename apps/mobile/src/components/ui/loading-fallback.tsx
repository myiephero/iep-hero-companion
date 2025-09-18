import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingFallbackProps {
  className?: string;
  message?: string;
  variant?: "default" | "minimal" | "skeleton";
}

export function LoadingFallback({ 
  className, 
  message = "Loading...", 
  variant = "default" 
}: LoadingFallbackProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4 p-6", className)}>
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Specific loading components for different route groups
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="ml-auto flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="w-64 border-r bg-background">
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolsLoading() {
  return (
    <LoadingFallback 
      variant="skeleton" 
      message="Loading tools..." 
      className="min-h-screen"
    />
  );
}

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Preparing authentication...</p>
      </div>
    </div>
  );
}

export function MessagesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-full">
        <div className="w-80 border-r bg-background">
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="border-b p-4">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentsLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}