import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal, Loader2, AlertCircle } from "lucide-react";

// Column definition interface
export interface ColumnDef<T = any> {
  header: string;
  accessor: keyof T | ((item: T) => any);
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  mobileLabel?: string; // Custom label for mobile view
  hiddenOnMobile?: boolean; // Hide this column on mobile
}

// Row action interface
export interface RowAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T, index: number) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

// Sort state interface
interface SortState {
  key: string | null;
  direction: "asc" | "desc";
}

// Main component props
export interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  actions?: RowAction<T>[];
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  tableClassName?: string;
  cardClassName?: string;
  testIdPrefix?: string;
  showHeader?: boolean;
  sortable?: boolean;
  mobileCardTitle?: (item: T) => string; // Function to generate card title
  mobileCardSubtitle?: (item: T) => string; // Function to generate card subtitle
}

// Value accessor helper
const getValue = <T,>(item: T, accessor: keyof T | ((item: T) => any)): any => {
  if (typeof accessor === "function") {
    return accessor(item);
  }
  return item[accessor];
};

// Format display values
const formatDisplayValue = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
};

// Default renderers for common data types
const defaultRenderer = (value: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === "boolean") {
    return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
  }
  if (value instanceof Date) {
    return <span>{value.toLocaleDateString()}</span>;
  }
  if (typeof value === "string" && value.includes("@")) {
    return <span className="font-mono text-sm">{value}</span>;
  }
  if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
    return <a href={value} className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); window.location.replace(value); }}>{value}</a>;
  }
  return <span>{String(value)}</span>;
};

// Loading skeleton component
const LoadingSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="hidden md:flex space-x-4">
        {[...Array(columns)].map((_, j) => (
          <div key={j} className="h-4 bg-muted rounded animate-pulse flex-1" />
        ))}
      </div>
    ))}
    {/* Mobile loading cards */}
    <div className="md:hidden space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ message?: string; icon?: React.ReactNode }> = ({ 
  message = "No data available", 
  icon = <AlertCircle className="h-12 w-12" />
}) => (
  <div className="text-center py-12">
    <div className="mx-auto text-muted-foreground mb-4">{icon}</div>
    <p className="text-muted-foreground">{message}</p>
  </div>
);

// Mobile card component
const MobileCard: React.FC<{
  item: any;
  index: number;
  columns: ColumnDef[];
  actions?: RowAction[];
  onRowClick?: (item: any, index: number) => void;
  testIdPrefix?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}> = ({ item, index, columns, actions, onRowClick, testIdPrefix, title, subtitle, className }) => {
  const visibleColumns = columns.filter(col => !col.hiddenOnMobile);
  
  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        onRowClick && "cursor-pointer hover:shadow-md hover:bg-muted/50",
        className
      )}
      onClick={() => onRowClick?.(item, index)}
      data-testid={testIdPrefix ? `${testIdPrefix}-card-${index}` : undefined}
    >
      {(title || subtitle) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {visibleColumns.map((column, colIndex) => {
          const value = getValue(item, column.accessor);
          const rendered = column.render ? column.render(value, item, index) : defaultRenderer(value);
          const label = column.mobileLabel || column.header;
          
          return (
            <div key={colIndex} className="flex justify-between items-start gap-3">
              <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
                {label}:
              </span>
              <div className="text-sm text-right min-w-0 flex-1">
                {rendered}
              </div>
            </div>
          );
        })}
        
        {actions && actions.length > 0 && (
          <div className="flex justify-end pt-2 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid={testIdPrefix ? `${testIdPrefix}-actions-${index}` : undefined}
                >
                  Actions
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, actionIndex) => {
                  const isDisabled = action.disabled?.(item) || false;
                  const isHidden = action.hidden?.(item) || false;
                  
                  if (isHidden) return null;
                  
                  return (
                    <DropdownMenuItem
                      key={actionIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          action.onClick(item, index);
                        }
                      }}
                      disabled={isDisabled}
                      data-testid={testIdPrefix ? `${testIdPrefix}-action-${actionIndex}-${index}` : undefined}
                      className={cn(
                        action.variant === "destructive" && "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main responsive table component
export const ResponsiveTable = <T,>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  emptyIcon,
  actions,
  onRowClick,
  className,
  tableClassName,
  cardClassName,
  testIdPrefix = "table",
  showHeader = true,
  sortable = true,
  mobileCardTitle,
  mobileCardSubtitle,
}: ResponsiveTableProps<T>) => {
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: "asc" });

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.key || !sortable) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => 
        typeof col.accessor === "string" ? col.accessor === sortState.key : false
      );
      
      if (!column) return 0;

      const aValue = getValue(a, column.accessor);
      const bValue = getValue(b, column.accessor);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortState.direction === "asc" ? -1 : 1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortState, columns, sortable]);

  // Handle sort
  const handleSort = (accessor: keyof T | ((item: T) => any)) => {
    if (!sortable || typeof accessor !== "string") return;

    setSortState(prev => ({
      key: accessor,
      direction: prev.key === accessor && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Render sort icon
  const renderSortIcon = (column: ColumnDef<T>) => {
    if (!sortable || !column.sortable || typeof column.accessor !== "string") return null;

    const isActive = sortState.key === column.accessor;
    if (!isActive) return <ChevronsUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;

    return sortState.direction === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <LoadingSkeleton columns={columns.length} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <EmptyState message={emptyMessage} icon={emptyIcon} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table className={cn("w-full", tableClassName)}>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index}
                    className={cn(
                      column.headerClassName,
                      column.sortable && sortable && "cursor-pointer select-none hover:bg-muted/50",
                      "transition-colors"
                    )}
                    onClick={() => column.sortable && handleSort(column.accessor)}
                    data-testid={`${testIdPrefix}-header-${index}`}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {renderSortIcon(column)}
                    </div>
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="w-16">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow 
                key={index}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-muted/50",
                  "transition-colors"
                )}
                onClick={() => onRowClick?.(item, index)}
                data-testid={`${testIdPrefix}-row-${index}`}
              >
                {columns.map((column, colIndex) => {
                  const value = getValue(item, column.accessor);
                  const rendered = column.render ? column.render(value, item, index) : defaultRenderer(value);
                  
                  return (
                    <TableCell 
                      key={colIndex}
                      className={column.className}
                      data-testid={`${testIdPrefix}-cell-${index}-${colIndex}`}
                    >
                      {rendered}
                    </TableCell>
                  );
                })}
                
                {actions && actions.length > 0 && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          data-testid={`${testIdPrefix}-actions-${index}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => {
                          const isDisabled = action.disabled?.(item) || false;
                          const isHidden = action.hidden?.(item) || false;
                          
                          if (isHidden) return null;
                          
                          return (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled) {
                                  action.onClick(item, index);
                                }
                              }}
                              disabled={isDisabled}
                              data-testid={`${testIdPrefix}-action-${actionIndex}-${index}`}
                              className={cn(
                                action.variant === "destructive" && "text-destructive focus:text-destructive"
                              )}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedData.map((item, index) => (
          <MobileCard
            key={index}
            item={item}
            index={index}
            columns={columns}
            actions={actions}
            onRowClick={onRowClick}
            testIdPrefix={testIdPrefix}
            title={mobileCardTitle?.(item)}
            subtitle={mobileCardSubtitle?.(item)}
            className={cardClassName}
          />
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;