// Offline Test Component - Demonstrates offline functionality
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useOfflineStudents } from '@/hooks/useOfflineStudents';
import { offlineStorage } from '@/lib/offlineStorage';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const OfflineTestComponent = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'pass' | 'fail';
    message: string;
  }>>([]);
  
  const { isOnline, pendingCount, queueOperation, forceSync } = useOfflineSync();
  const { students, isOffline: studentsOffline } = useOfflineStudents();

  // Run offline functionality tests
  const runOfflineTests = async () => {
    setTestResults([]);
    const results: typeof testResults = [];

    // Test 1: Service Worker Registration
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        results.push({
          test: 'Service Worker',
          status: registration ? 'pass' : 'fail',
          message: registration ? 'Service worker registered and active' : 'Service worker not found'
        });
      } else {
        results.push({
          test: 'Service Worker',
          status: 'fail',
          message: 'Service workers not supported'
        });
      }
    } catch (error) {
      results.push({
        test: 'Service Worker',
        status: 'fail',
        message: `Service worker error: ${error}`
      });
    }

    // Test 2: IndexedDB Storage
    try {
      const initialized = await offlineStorage.initialize();
      results.push({
        test: 'IndexedDB Storage',
        status: initialized ? 'pass' : 'fail',
        message: initialized ? 'Offline storage initialized successfully' : 'Storage initialization failed'
      });
    } catch (error) {
      results.push({
        test: 'IndexedDB Storage',
        status: 'fail',
        message: `Storage error: ${error}`
      });
    }

    // Test 3: Network Status Detection
    results.push({
      test: 'Network Detection',
      status: 'pass',
      message: `Network status: ${isOnline ? 'Online' : 'Offline'}`
    });

    // Test 4: Offline Data Storage
    try {
      const testData = { test: 'data', timestamp: Date.now() };
      const stored = await offlineStorage.storeData('draft', 'test-item', testData, 'test-user');
      const retrieved = await offlineStorage.getData('draft', 'test-item');
      
      results.push({
        test: 'Data Storage',
        status: stored && retrieved ? 'pass' : 'fail',
        message: stored && retrieved ? 'Data storage and retrieval working' : 'Data storage failed'
      });
    } catch (error) {
      results.push({
        test: 'Data Storage',
        status: 'fail',
        message: `Data storage error: ${error}`
      });
    }

    // Test 5: Offline Queue
    try {
      const queued = await queueOperation('create', '/api/test', { test: 'offline' });
      results.push({
        test: 'Offline Queue',
        status: queued ? 'pass' : 'fail',
        message: queued ? `Operation queued successfully (${pendingCount} pending)` : 'Queue operation failed'
      });
    } catch (error) {
      results.push({
        test: 'Offline Queue',
        status: 'fail',
        message: `Queue error: ${error}`
      });
    }

    // Test 6: Cache Storage
    try {
      const cacheNames = await caches.keys();
      const hasCache = cacheNames.length > 0;
      results.push({
        test: 'Cache Storage',
        status: hasCache ? 'pass' : 'fail',
        message: hasCache ? `${cacheNames.length} cache(s) active: ${cacheNames.join(', ')}` : 'No caches found'
      });
    } catch (error) {
      results.push({
        test: 'Cache Storage',
        status: 'fail',
        message: `Cache error: ${error}`
      });
    }

    setTestResults(results);
  };

  // Test offline student data
  const testOfflineStudents = async () => {
    try {
      // This will test the offline students hook
      console.log('Testing offline students functionality');
      console.log('Students available:', students.length);
      console.log('Students offline mode:', studentsOffline);
    } catch (error) {
      console.error('Offline students test failed:', error);
    }
  };

  useEffect(() => {
    // Run tests on component mount
    runOfflineTests();
  }, []);

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Offline Functionality Test</h2>
        <p className="text-muted-foreground">
          Testing offline capabilities and service worker functionality
        </p>
      </div>

      {/* Network Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Network Status</h3>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        <OfflineIndicator variant="full" showDetails={true} />
      </Card>

      {/* Test Results */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Test Results</h3>
          <Button onClick={runOfflineTests} size="sm" data-testid="button-run-tests">
            <TestTube className="h-4 w-4 mr-1" />
            Run Tests
          </Button>
        </div>
        
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {getTestIcon(result.status)}
                <span className="font-medium">{result.test}</span>
              </div>
              <div className="text-sm text-muted-foreground max-w-md text-right">
                {result.message}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Offline Actions */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">Offline Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={testOfflineStudents}
            variant="outline"
            className="w-full"
            data-testid="button-test-students"
          >
            <Database className="h-4 w-4 mr-2" />
            Test Student Data ({students.length} loaded)
          </Button>
          
          <Button
            onClick={() => queueOperation('create', '/api/test-offline', { test: true })}
            variant="outline"
            className="w-full"
            data-testid="button-queue-operation"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Queue Test Operation
          </Button>
          
          <Button
            onClick={forceSync}
            variant="outline"
            className="w-full"
            disabled={!isOnline}
            data-testid="button-force-sync"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Sync ({pendingCount} pending)
          </Button>
          
          <Button
            onClick={() => offlineStorage.getStorageStats().then(stats => 
              alert(`Storage: ${stats?.itemCount || 0} items, ${Math.round((stats?.size || 0) / 1024)}KB`)
            )}
            variant="outline"
            className="w-full"
            data-testid="button-storage-stats"
          >
            <Database className="h-4 w-4 mr-2" />
            Storage Stats
          </Button>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950">
        <h3 className="font-medium mb-2">Testing Instructions</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
          <li>All tests should show "pass" status when online</li>
          <li>Try turning off your network connection</li>
          <li>Navigate to different pages - they should still load from cache</li>
          <li>Try creating/editing data - it should queue for sync</li>
          <li>Turn network back on - queued operations should sync automatically</li>
          <li>Check the network status indicator updates correctly</li>
        </ol>
      </Card>
    </div>
  );
};