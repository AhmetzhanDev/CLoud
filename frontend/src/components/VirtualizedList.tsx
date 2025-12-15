import { memo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

// Simplified version without react-window for build compatibility
// TODO: Fix react-window types issue
function VirtualizedListComponent<T>({
  items,
  height,
  renderItem,
  className = '',
}: VirtualizedListProps<T>) {
  return (
    <div className={className} style={{ height, overflowY: 'auto' }}>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;
