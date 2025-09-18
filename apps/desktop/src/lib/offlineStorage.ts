// Offline Storage Utilities for My IEP Hero
// Provides IndexedDB-based storage for offline functionality

interface OfflineData {
  id: string;
  type: 'student' | 'document' | 'goal' | 'message' | 'settings' | 'draft';
  data: any;
  timestamp: number;
  userId: string;
  lastModified?: number;
  syncStatus: 'synced' | 'pending' | 'error';
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

class OfflineStorageManager {
  private dbName = 'IEPHeroOfflineStorage';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize the database
  async initialize(): Promise<boolean> {
    try {
      this.db = await this.openDatabase();
      console.log('✅ Offline Storage: Database initialized');
      return true;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to initialize database', error);
      return false;
    }
  }

  // Open IndexedDB connection
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create offline data store
        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('type', 'type', { unique: false });
          dataStore.createIndex('userId', 'userId', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
          dataStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create queued operations store
        if (!db.objectStoreNames.contains('queuedOperations')) {
          const operationStore = db.createObjectStore('queuedOperations', { keyPath: 'id' });
          operationStore.createIndex('userId', 'userId', { unique: false });
          operationStore.createIndex('timestamp', 'timestamp', { unique: false });
          operationStore.createIndex('type', 'type', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Store offline data
  async storeData(type: OfflineData['type'], id: string, data: any, userId: string): Promise<boolean> {
    if (!this.db) {
      console.warn('⚠️ Offline Storage: Database not initialized');
      return false;
    }

    try {
      const offlineData: OfflineData = {
        id: `${type}-${id}`,
        type,
        data,
        timestamp: Date.now(),
        userId,
        syncStatus: 'synced'
      };

      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      await this.promisifyRequest(store.put(offlineData));

      console.log(`📱 Offline Storage: Stored ${type} data for ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to store data', error);
      return false;
    }
  }

  // Retrieve offline data
  async getData(type: OfflineData['type'], id: string): Promise<any | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const result = await this.promisifyRequest(store.get(`${type}-${id}`));

      if (result) {
        console.log(`📱 Offline Storage: Retrieved ${type} data for ${id}`);
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to retrieve data', error);
      return null;
    }
  }

  // Get all data by type for a user
  async getDataByType(type: OfflineData['type'], userId: string): Promise<any[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      const results = await this.promisifyRequest(index.getAll(type));

      const userResults = results
        .filter(item => item.userId === userId)
        .map(item => ({ ...item.data, _offlineId: item.id, _timestamp: item.timestamp }));

      console.log(`📱 Offline Storage: Retrieved ${userResults.length} ${type} items for user`);
      return userResults;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to retrieve data by type', error);
      return [];
    }
  }

  // Queue operation for offline sync
  async queueOperation(type: QueuedOperation['type'], endpoint: string, data: any, userId: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      const operation: QueuedOperation = {
        id: `${type}-${endpoint}-${Date.now()}`,
        type,
        endpoint,
        data,
        timestamp: Date.now(),
        userId,
        retryCount: 0
      };

      const transaction = this.db.transaction(['queuedOperations'], 'readwrite');
      const store = transaction.objectStore('queuedOperations');
      await this.promisifyRequest(store.put(operation));

      console.log(`🔄 Offline Storage: Queued ${type} operation for ${endpoint}`);
      return true;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to queue operation', error);
      return false;
    }
  }

  // Get pending operations for sync
  async getPendingOperations(userId: string): Promise<QueuedOperation[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction(['queuedOperations'], 'readonly');
      const store = transaction.objectStore('queuedOperations');
      const index = store.index('userId');
      const results = await this.promisifyRequest(index.getAll(userId));

      console.log(`🔄 Offline Storage: Found ${results.length} pending operations`);
      return results.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('❌ Offline Storage: Failed to get pending operations', error);
      return [];
    }
  }

  // Remove completed operation
  async removeOperation(operationId: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction(['queuedOperations'], 'readwrite');
      const store = transaction.objectStore('queuedOperations');
      await this.promisifyRequest(store.delete(operationId));

      console.log(`✅ Offline Storage: Removed completed operation ${operationId}`);
      return true;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to remove operation', error);
      return false;
    }
  }

  // Update operation retry count
  async updateOperationRetryCount(operationId: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction(['queuedOperations'], 'readwrite');
      const store = transaction.objectStore('queuedOperations');
      const operation = await this.promisifyRequest(store.get(operationId));

      if (operation) {
        operation.retryCount += 1;
        await this.promisifyRequest(store.put(operation));
        console.log(`🔄 Offline Storage: Updated retry count for ${operationId} to ${operation.retryCount}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to update retry count', error);
      return false;
    }
  }

  // Store settings
  async storeSetting(key: string, value: any): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      await this.promisifyRequest(store.put({ key, value, timestamp: Date.now() }));

      console.log(`⚙️ Offline Storage: Stored setting ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to store setting', error);
      return false;
    }
  }

  // Get setting
  async getSetting(key: string): Promise<any | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const result = await this.promisifyRequest(store.get(key));

      return result ? result.value : null;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to get setting', error);
      return null;
    }
  }

  // Clear all data for a user
  async clearUserData(userId: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction(['offlineData', 'queuedOperations'], 'readwrite');
      
      // Clear offline data
      const dataStore = transaction.objectStore('offlineData');
      const dataIndex = dataStore.index('userId');
      const dataRequest = dataIndex.openCursor(userId);
      await new Promise<void>((resolve, reject) => {
        dataRequest.onsuccess = async () => {
          const cursor = dataRequest.result;
          if (cursor) {
            await this.promisifyRequest(cursor.delete());
            cursor.continue();
          } else {
            resolve();
          }
        };
        dataRequest.onerror = () => reject(dataRequest.error);
      });

      // Clear queued operations
      const operationStore = transaction.objectStore('queuedOperations');
      const operationIndex = operationStore.index('userId');
      const operationRequest = operationIndex.openCursor(userId);
      await new Promise<void>((resolve, reject) => {
        operationRequest.onsuccess = async () => {
          const cursor = operationRequest.result;
          if (cursor) {
            await this.promisifyRequest(cursor.delete());
            cursor.continue();
          } else {
            resolve();
          }
        };
        operationRequest.onerror = () => reject(operationRequest.error);
      });

      console.log(`🗑️ Offline Storage: Cleared all data for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Offline Storage: Failed to clear user data', error);
      return false;
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{ size: number; itemCount: number } | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const results = await this.promisifyRequest(store.getAll());

      const size = JSON.stringify(results).length;
      return {
        size,
        itemCount: results.length
      };
    } catch (error) {
      console.error('❌ Offline Storage: Failed to get storage stats', error);
      return null;
    }
  }

  // Clean up old data (older than 30 days)
  async cleanupOldData(): Promise<void> {
    if (!this.db) return;

    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(thirtyDaysAgo);
      const cursor = await this.promisifyRequest(index.openCursor(range));
      
      let deletedCount = 0;
      const cursorRequest = index.openCursor(range);
      await new Promise<void>((resolve, reject) => {
        cursorRequest.onsuccess = async () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            await this.promisifyRequest(cursor.delete());
            deletedCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });

      console.log(`🧹 Offline Storage: Cleaned up ${deletedCount} old items`);
    } catch (error) {
      console.error('❌ Offline Storage: Failed to cleanup old data', error);
    }
  }

  // Helper method to promisify IndexedDB requests
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageManager();

// Helper functions for common operations
export const storeStudentData = (studentId: string, data: any, userId: string) =>
  offlineStorage.storeData('student', studentId, data, userId);

export const getStudentData = (studentId: string) =>
  offlineStorage.getData('student', studentId);

export const getAllStudents = (userId: string) =>
  offlineStorage.getDataByType('student', userId);

export const storeDocumentData = (documentId: string, data: any, userId: string) =>
  offlineStorage.storeData('document', documentId, data, userId);

export const getDocumentData = (documentId: string) =>
  offlineStorage.getData('document', documentId);

export const getAllDocuments = (userId: string) =>
  offlineStorage.getDataByType('document', userId);

export const storeGoalData = (goalId: string, data: any, userId: string) =>
  offlineStorage.storeData('goal', goalId, data, userId);

export const getGoalData = (goalId: string) =>
  offlineStorage.getData('goal', goalId);

export const getAllGoals = (userId: string) =>
  offlineStorage.getDataByType('goal', userId);

export const storeMessageData = (messageId: string, data: any, userId: string) =>
  offlineStorage.storeData('message', messageId, data, userId);

export const getMessageData = (messageId: string) =>
  offlineStorage.getData('message', messageId);

export const getAllMessages = (userId: string) =>
  offlineStorage.getDataByType('message', userId);

export const storeDraftData = (draftId: string, data: any, userId: string) =>
  offlineStorage.storeData('draft', draftId, data, userId);

export const getDraftData = (draftId: string) =>
  offlineStorage.getData('draft', draftId);

export const getAllDrafts = (userId: string) =>
  offlineStorage.getDataByType('draft', userId);