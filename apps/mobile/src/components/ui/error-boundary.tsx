import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LazyLoadErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface LazyLoadErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class LazyLoadErrorBoundary extends React.Component<
  LazyLoadErrorBoundaryProps,
  LazyLoadErrorBoundaryState
> {
  constructor(props: LazyLoadErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyLoadErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy load error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultLazyLoadError;
      return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
}

function DefaultLazyLoadError({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">Failed to Load Page</CardTitle>
          <CardDescription>
            There was an error loading this page. This might be due to a network issue or temporary problem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Technical details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error boundaries for different route types
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LazyLoadErrorBoundary
      fallback={({ error, retry }) => (
        <div className="min-h-screen bg-background">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
              <div className="h-6 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="flex items-center justify-center p-6 flex-1">
            <DefaultLazyLoadError error={error} retry={retry} />
          </div>
        </div>
      )}
    >
      {children}
    </LazyLoadErrorBoundary>
  );
}

export function ToolsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LazyLoadErrorBoundary
      fallback={({ error, retry }) => (
        <div className="min-h-screen bg-background p-6">
          <DefaultLazyLoadError error={error} retry={retry} />
        </div>
      )}
    >
      {children}
    </LazyLoadErrorBoundary>
  );
}

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LazyLoadErrorBoundary
      fallback={({ error, retry }) => (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <DefaultLazyLoadError error={error} retry={retry} />
        </div>
      )}
    >
      {children}
    </LazyLoadErrorBoundary>
  );
}

export default LazyLoadErrorBoundary;