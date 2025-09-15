// Offline Indicator Component - Shows network status and sync information
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
  showDetails?: boolean;
}

export const OfflineIndicator = ({ 
  className, 
  variant = 'compact',
  showDetails = false 
}: OfflineIndicatorProps) => {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncErrors,
    forceSync,
    clearSyncErrors
  } = useOfflineSync();

  const [showBanner, setShowBanner] = useState(false);

  // Show banner when offline or when there are pending operations/errors
  useEffect(() => {
    const shouldShow = !isOnline || pendingCount > 0 || syncErrors.length > 0;
    setShowBanner(shouldShow && variant === 'banner');
  }, [isOnline, pendingCount, syncErrors.length, variant]);

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (isSyncing) return 'default';
    if (syncErrors.length > 0) return 'destructive';
    if (pendingCount > 0) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (syncErrors.length > 0) return <AlertCircle className="h-4 w-4" />;
    if (pendingCount > 0) return <Clock className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (syncErrors.length > 0) return 'Sync Issues';
    if (pendingCount > 0) return `${pendingCount} Pending`;
    return 'Online';
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  if (variant === 'compact') {
    return (
      <Badge 
        variant={getStatusColor()} 
        className={cn("flex items-center gap-1", className)}
        data-testid="offline-indicator-compact"
      >
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
    );
  }

  if (variant === 'banner' && showBanner) {
    return (
      <Card className={cn(
        "border-l-4 p-4 mb-4",
        !isOnline ? "border-l-red-500 bg-red-50 dark:bg-red-950" : 
        syncErrors.length > 0 ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950" :
        "border-l-blue-500 bg-blue-50 dark:bg-blue-950",
        className
      )} data-testid="offline-banner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h4 className="font-medium">
                {!isOnline ? 'You\'re offline' : 
                 syncErrors.length > 0 ? 'Sync issues detected' :
                 'Changes pending sync'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {!isOnline ? 
                  'Some features may be limited. Changes will sync when you\'re back online.' :
                  syncErrors.length > 0 ?
                  `${syncErrors.length} operations failed to sync. We'll keep trying.` :
                  `${pendingCount} changes are waiting to sync to the server.`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOnline && (pendingCount > 0 || syncErrors.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={forceSync}
                disabled={isSyncing}
                data-testid="button-force-sync"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry Sync
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              data-testid="button-dismiss-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'full') {
    return (
      <Card className={cn("p-4", className)} data-testid="offline-indicator-full">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-medium">{getStatusText()}</h3>
                <p className="text-sm text-muted-foreground">
                  Last sync: {formatLastSync()}
                </p>
              </div>
            </div>
            
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={forceSync}
                disabled={isSyncing}
                data-testid="button-manual-sync"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync Now
              </Button>
            )}
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Syncing changes...</span>
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}

          {/* Pending Operations */}
          {pendingCount > 0 && !isSyncing && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {pendingCount} change{pendingCount !== 1 ? 's' : ''} pending sync
                </span>
              </div>
              {isOnline && (
                <Button variant="ghost" size="sm" onClick={forceSync}>
                  Sync Now
                </Button>
              )}
            </div>
          )}

          {/* Sync Errors */}
          {syncErrors.length > 0 && showDetails && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-destructive">
                  Sync Errors ({syncErrors.length})
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearSyncErrors}
                  data-testid="button-clear-errors"
                >
                  Clear
                </Button>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {syncErrors.slice(0, 3).map((error, index) => (
                  <div 
                    key={error.id} 
                    className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm"
                  >
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{error.error}</p>
                      <p className="text-xs text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {syncErrors.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    And {syncErrors.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success State */}
          {isOnline && pendingCount === 0 && syncErrors.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">
                All changes synced successfully
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return null;
};

// Simple network status hook for other components
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Offline badge for data items
export const OfflineBadge = ({ className }: { className?: string }) => (
  <Badge 
    variant="secondary" 
    className={cn("text-xs", className)}
    data-testid="offline-badge"
  >
    <WifiOff className="h-3 w-3 mr-1" />
    Offline
  </Badge>
);