// Offline Sync Service Hook for My IEP Hero
// Manages offline operations queuing and synchronization

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage } from '@/lib/offlineStorage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  syncErrors: Array<{ id: string; error: string; timestamp: Date }>;
}

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  userId: string;
  retryCount: number;
}

export const useOfflineSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncState, setSyncState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    syncErrors: []
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize offline storage and check for pending operations
  useEffect(() => {
    const initializeOfflineSync = async () => {
      const initialized = await offlineStorage.initialize();
      if (initialized && user?.id) {
        await updatePendingCount();
        
        // Get last sync time
        const lastSync = await offlineStorage.getSetting('lastSyncTime');
        if (lastSync) {
          setSyncState(prev => ({ ...prev, lastSyncTime: new Date(lastSync) }));
        }
      }
    };

    initializeOfflineSync();
  }, [user?.id]);

  // Update pending operations count
  const updatePendingCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const operations = await offlineStorage.getPendingOperations(user.id);
      setSyncState(prev => ({ ...prev, pendingCount: operations.length }));
    } catch (error) {
      console.error('❌ Failed to update pending count:', error);
    }
  }, [user?.id]);

  // Queue operation for offline sync
  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    endpoint: string,
    data: any
  ): Promise<boolean> => {
    if (!user?.id) {
      console.warn('⚠️ Cannot queue operation: user not authenticated');
      return false;
    }

    try {
      const success = await offlineStorage.queueOperation(type, endpoint, data, user.id);
      if (success) {
        await updatePendingCount();
        
        // Show toast notification for queued operation
        toast({
          title: "Action Queued",
          description: "Your changes will sync when you're back online.",
          duration: 3000,
        });

        // Try to sync if online
        if (syncState.isOnline) {
          scheduleSync();
        }
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to queue operation:', error);
      return false;
    }
  }, [user?.id, syncState.isOnline, updatePendingCount, toast]);

  // Perform sync operation
  const performSync = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !syncState.isOnline || syncState.isSyncing) {
      return false;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true }));

    try {
      const operations = await offlineStorage.getPendingOperations(user.id);
      console.log(`🔄 Starting sync of ${operations.length} operations`);

      let successCount = 0;
      let errorCount = 0;
      const newErrors: Array<{ id: string; error: string; timestamp: Date }> = [];

      for (const operation of operations) {
        try {
          // Check if we should skip this operation due to too many retries
          if (operation.retryCount >= 3) {
            console.warn(`⚠️ Skipping operation ${operation.id} - too many retries`);
            newErrors.push({
              id: operation.id,
              error: 'Too many retry attempts',
              timestamp: new Date()
            });
            continue;
          }

          // Attempt to sync the operation
          const response = await fetch(operation.endpoint, {
            method: operation.type === 'create' ? 'POST' : 
                   operation.type === 'update' ? 'PUT' : 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: operation.data ? JSON.stringify(operation.data) : undefined,
          });

          if (response.ok) {
            // Operation successful - remove from queue
            await offlineStorage.removeOperation(operation.id);
            successCount++;
            console.log(`✅ Synced operation: ${operation.endpoint}`);
          } else {
            // Operation failed - increment retry count
            await offlineStorage.updateOperationRetryCount(operation.id);
            errorCount++;
            newErrors.push({
              id: operation.id,
              error: `HTTP ${response.status}: ${response.statusText}`,
              timestamp: new Date()
            });
            console.warn(`⚠️ Failed to sync operation: ${operation.endpoint}`, response.status);
          }
        } catch (error) {
          // Network or other error - increment retry count
          await offlineStorage.updateOperationRetryCount(operation.id);
          errorCount++;
          newErrors.push({
            id: operation.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          });
          console.error(`❌ Error syncing operation: ${operation.endpoint}`, error);
        }
      }

      // Update sync state
      await offlineStorage.storeSetting('lastSyncTime', Date.now());
      await updatePendingCount();

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        syncErrors: newErrors
      }));

      // Show sync completion toast
      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${successCount} changes.`,
          duration: 3000,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Sync Issues",
          description: `${errorCount} operations failed to sync. Will retry later.`,
          variant: "destructive",
          duration: 5000,
        });
      }

      console.log(`🔄 Sync complete: ${successCount} successful, ${errorCount} failed`);
      return errorCount === 0;
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncState(prev => ({ 
        ...prev, 
        isSyncing: false,
        syncErrors: [{
          id: 'sync-error',
          error: error instanceof Error ? error.message : 'Sync failed',
          timestamp: new Date()
        }]
      }));

      toast({
        title: "Sync Failed",
        description: "Unable to sync your changes. Will retry automatically.",
        variant: "destructive",
        duration: 5000,
      });

      return false;
    }
  }, [user?.id, syncState.isOnline, syncState.isSyncing, updatePendingCount, toast]);

  // Schedule sync with debouncing
  const scheduleSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      performSync();
    }, 2000); // Wait 2 seconds before syncing
  }, [performSync]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network: Back online');
      setSyncState(prev => ({ ...prev, isOnline: true }));
      
      // Schedule sync when coming back online
      scheduleSync();
    };

    const handleOffline = () => {
      console.log('📱 Network: Gone offline');
      setSyncState(prev => ({ ...prev, isOnline: false, isSyncing: false }));
      
      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [scheduleSync]);

  // Periodic sync retry for failed operations
  useEffect(() => {
    if (syncState.isOnline && syncState.pendingCount > 0 && !syncState.isSyncing) {
      retryTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Retrying sync for pending operations');
        performSync();
      }, 30000); // Retry every 30 seconds
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [syncState.isOnline, syncState.pendingCount, syncState.isSyncing, performSync]);

  // Clear sync errors
  const clearSyncErrors = useCallback(() => {
    setSyncState(prev => ({ ...prev, syncErrors: [] }));
  }, []);

  // Force sync (manual trigger)
  const forceSync = useCallback(() => {
    if (syncState.isOnline && !syncState.isSyncing) {
      performSync();
    }
  }, [syncState.isOnline, syncState.isSyncing, performSync]);

  // Get storage statistics
  const getStorageStats = useCallback(async () => {
    return await offlineStorage.getStorageStats();
  }, []);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      await offlineStorage.clearUserData(user.id);
      await updatePendingCount();
      
      toast({
        title: "Offline Data Cleared",
        description: "All offline data has been removed.",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
      return false;
    }
  }, [user?.id, updatePendingCount, toast]);

  return {
    // State
    ...syncState,
    
    // Actions
    queueOperation,
    performSync,
    forceSync,
    clearSyncErrors,
    clearOfflineData,
    getStorageStats,
    
    // Utilities
    isInitialized: !!user?.id,
    canSync: syncState.isOnline && !syncState.isSyncing,
  };
};

// Helper hook for components that need offline-aware API calls
export const useOfflineAwareAPI = () => {
  const { queueOperation, isOnline } = useOfflineSync();
  const { toast } = useToast();

  const makeRequest = useCallback(async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ) => {
    try {
      // Always try network first
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // If offline and this is a write operation, queue it
      if (!isOnline && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        const operationType = method === 'POST' ? 'create' : 
                             method === 'PUT' ? 'update' : 'delete';
        
        const queued = await queueOperation(operationType, endpoint, data);
        
        if (queued) {
          return { 
            success: true, 
            offline: true, 
            message: 'Operation queued for sync when online' 
          };
        }
      }

      // For read operations or if queueing failed, throw the error
      throw error;
    }
  }, [queueOperation, isOnline]);

  return { makeRequest, isOnline };
};