import { useEffect, useState, memo } from 'react';

interface PerformanceMetrics {
  memoryUsage?: number;
  connectionType?: string;
  renderTime?: number;
  componentCount?: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  enableMemoryMonitoring?: boolean;
  enableRenderTimeMonitoring?: boolean;
}

const PerformanceMonitor = memo(function PerformanceMonitor({
  onMetricsUpdate,
  enableMemoryMonitoring = true,
  enableRenderTimeMonitoring = true
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    let animationFrame: number;
    let lastRenderTime = performance.now();

    const updateMetrics = () => {
      const newMetrics: PerformanceMetrics = {};

      // Memory usage monitoring
      if (enableMemoryMonitoring && 'memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      // Connection type for mobile optimization
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        newMetrics.connectionType = connection?.effectiveType || 'unknown';
      }

      // Render time monitoring
      if (enableRenderTimeMonitoring) {
        const currentTime = performance.now();
        newMetrics.renderTime = currentTime - lastRenderTime;
        lastRenderTime = currentTime;
      }

      // Component count (approximate)
      const componentCount = document.querySelectorAll('[data-react-component]').length;
      newMetrics.componentCount = componentCount;

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);

      // Continue monitoring
      animationFrame = requestAnimationFrame(updateMetrics);
    };

    // Start monitoring
    updateMetrics();

    // Cleanup
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onMetricsUpdate, enableMemoryMonitoring, enableRenderTimeMonitoring]);

  // Monitor Core Web Vitals
  useEffect(() => {
    const observeWebVitals = () => {
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            console.log('LCP:', lastEntry.startTime);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // FID (First Input Delay)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              console.log('FID:', entry.processingStart - entry.startTime);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // CLS (Cumulative Layout Shift)
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            console.log('CLS:', clsValue);
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          return () => {
            lcpObserver.disconnect();
            fidObserver.disconnect();
            clsObserver.disconnect();
          };
        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }
    };

    const cleanup = observeWebVitals();
    return cleanup;
  }, []);

  // PerformanceMonitor disabled for cleaner user experience
  return null;
});

export default PerformanceMonitor;