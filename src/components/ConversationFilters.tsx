import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, ChevronDown, ChevronUp, X, Archive, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { useConversationLabels } from "@/hooks/useConversationLabels";

interface ConversationFilter {
  status: string[];
  priority: string[];
  archived: boolean | null;
  labels: string[];
}

interface ConversationFiltersProps {
  filters: ConversationFilter;
  onFiltersChange: (filters: ConversationFilter) => void;
  conversationCount?: number;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', icon: MessageSquare },
  { value: 'archived', label: 'Archived', icon: Archive },
  { value: 'closed', label: 'Closed', icon: X }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: ChevronDown },
  { value: 'normal', label: 'Normal', icon: MessageSquare },
  { value: 'high', label: 'High', icon: ChevronUp },
  { value: 'urgent', label: 'Urgent', icon: AlertTriangle }
];

export function ConversationFilters({ 
  filters, 
  onFiltersChange, 
  conversationCount = 0,
  className = ""
}: ConversationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { labels, loading: labelsLoading } = useConversationLabels();

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.archived !== null) count++;
    if (filters.labels.length > 0) count++;
    return count;
  }, [filters]);

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatus
    });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriority = checked
      ? [...filters.priority, priority]
      : filters.priority.filter(p => p !== priority);
    
    onFiltersChange({
      ...filters,
      priority: newPriority
    });
  };

  const handleArchivedChange = (value: string) => {
    const archived = value === 'all' ? null : value === 'archived';
    onFiltersChange({
      ...filters,
      archived
    });
  };

  const handleLabelChange = (labelId: string, checked: boolean) => {
    const newLabels = checked
      ? [...filters.labels, labelId]
      : filters.labels.filter(l => l !== labelId);
    
    onFiltersChange({
      ...filters,
      labels: newLabels
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      archived: null,
      labels: []
    });
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Card className={`p-4 ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 font-medium" data-testid="button-toggle-filters">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs" data-testid="badge-active-filters">
                  {activeFilterCount}
                </Badge>
              )}
              {isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </CollapsibleTrigger>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground" data-testid="text-conversation-count">
              {conversationCount} conversations
            </span>
          </div>
        </div>

        <CollapsibleContent className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Archive Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Archive Status</Label>
              <Select 
                value={filters.archived === null ? 'all' : filters.archived ? 'archived' : 'active'} 
                onValueChange={handleArchivedChange}
              >
                <SelectTrigger data-testid="select-archive-status">
                  <SelectValue placeholder="All conversations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conversations</SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Active only
                    </div>
                  </SelectItem>
                  <SelectItem value="archived">
                    <div className="flex items-center">
                      <Archive className="w-4 h-4 mr-2" />
                      Archived only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleStatusChange(option.value, checked as boolean)
                        }
                        data-testid={`checkbox-status-${option.value}`}
                      />
                      <Label 
                        htmlFor={`status-${option.value}`}
                        className="flex items-center text-sm font-normal cursor-pointer"
                      >
                        <IconComponent className="w-3 h-3 mr-1" />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <div className="space-y-2">
                {PRIORITY_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priority.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handlePriorityChange(option.value, checked as boolean)
                        }
                        data-testid={`checkbox-priority-${option.value}`}
                      />
                      <Label 
                        htmlFor={`priority-${option.value}`}
                        className="flex items-center text-sm font-normal cursor-pointer"
                      >
                        <IconComponent className={`w-3 h-3 mr-1 ${
                          option.value === 'urgent' ? 'text-red-500' : 
                          option.value === 'high' ? 'text-orange-500' : 
                          option.value === 'low' ? 'text-gray-500' : 'text-blue-500'
                        }`} />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Labels</Label>
              {labelsLoading ? (
                <div className="text-sm text-muted-foreground">Loading labels...</div>
              ) : labels.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {labels.map((label) => (
                    <div key={label.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`label-${label.id}`}
                        checked={filters.labels.includes(label.id)}
                        onCheckedChange={(checked) => 
                          handleLabelChange(label.id, checked as boolean)
                        }
                        data-testid={`checkbox-label-${label.id}`}
                      />
                      <Label 
                        htmlFor={`label-${label.id}`}
                        className="flex items-center text-sm font-normal cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No labels available</div>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Active Filters:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.archived !== null && (
                  <Badge variant="secondary" data-testid="filter-badge-archived">
                    {filters.archived ? 'Archived' : 'Active'}
                  </Badge>
                )}
                {filters.status.map(status => (
                  <Badge key={status} variant="secondary" data-testid={`filter-badge-status-${status}`}>
                    Status: {status}
                  </Badge>
                ))}
                {filters.priority.map(priority => (
                  <Badge key={priority} variant="secondary" data-testid={`filter-badge-priority-${priority}`}>
                    Priority: {priority}
                  </Badge>
                ))}
                {filters.labels.map(labelId => {
                  const label = labels.find(l => l.id === labelId);
                  return label ? (
                    <Badge 
                      key={labelId} 
                      style={{ backgroundColor: label.color, color: '#ffffff' }}
                      data-testid={`filter-badge-label-${labelId}`}
                    >
                      {label.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}