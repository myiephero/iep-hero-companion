import { memo, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

function VirtualizedListComponent<T extends { id: string | number }>({
  items,
  renderItem,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [endRef, isEndVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  }) as [React.RefObject<HTMLDivElement>, boolean];

  // Calculate visible items based on scroll position
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1),
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle end reached for infinite loading
  useEffect(() => {
    if (isEndVisible && onEndReached) {
      onEndReached();
    }
  }, [isEndVisible, onEndReached]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      data-testid="virtualized-list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleItems.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.items.map((item, index) => (
            <div key={item.id} style={{ height: itemHeight }}>
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
        {/* End detector for infinite scroll */}
        <div
          ref={endRef}
          style={{
            position: 'absolute',
            bottom: `${totalHeight * (1 - endReachedThreshold)}px`,
            height: 1,
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as <T extends { id: string | number }>(
  props: VirtualizedListProps<T>
) => JSX.Element;