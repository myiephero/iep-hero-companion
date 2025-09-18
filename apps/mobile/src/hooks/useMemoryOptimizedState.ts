import { useState, useCallback, useRef, useEffect } from 'react';

interface MemoryOptimizedOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
}

export function useMemoryOptimizedState<T>(
  initialValue: T,
  options: MemoryOptimizedOptions = {}
) {
  const { maxSize = 1000, ttl } = options;
  const [value, setValue] = useState<T>(initialValue);
  const cache = useRef(new Map<string, { value: T; timestamp: number }>());
  const keyCounter = useRef(0);

  const optimizedSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const finalValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue;
      
      // Cache management
      if (cache.current.size >= maxSize) {
        // Remove oldest entry
        const firstKey = cache.current.keys().next().value;
        if (firstKey) {
          cache.current.delete(firstKey);
        }
      }
      
      // Store with timestamp for TTL
      const key = `${keyCounter.current++}`;
      cache.current.set(key, {
        value: finalValue,
        timestamp: Date.now()
      });
      
      return finalValue;
    });
  }, [maxSize]);

  // Cleanup expired entries
  useEffect(() => {
    if (!ttl) return;

    const cleanup = () => {
      const now = Date.now();
      for (const [key, entry] of cache.current.entries()) {
        if (now - entry.timestamp > ttl) {
          cache.current.delete(key);
        }
      }
    };

    const interval = setInterval(cleanup, ttl / 2);
    return () => clearInterval(interval);
  }, [ttl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cache.current.clear();
    };
  }, []);

  return [value, optimizedSetValue] as const;
}

export function useObjectPool<T>(
  factory: () => T,
  reset: (obj: T) => void,
  maxSize: number = 50
) {
  const pool = useRef<T[]>([]);

  const acquire = useCallback((): T => {
    if (pool.current.length > 0) {
      return pool.current.pop()!;
    }
    return factory();
  }, [factory]);

  const release = useCallback((obj: T) => {
    if (pool.current.length < maxSize) {
      reset(obj);
      pool.current.push(obj);
    }
  }, [reset, maxSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pool.current.length = 0;
    };
  }, []);

  return { acquire, release };
}