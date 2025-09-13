import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tags, Loader2, Plus } from "lucide-react";
import { useConversationLabels, useAssignLabels, useConversationLabelsForConversation } from "@/hooks/useConversationLabels";

interface ConversationLabelSelectorProps {
  conversationId: string;
  trigger?: React.ReactNode;
  onLabelsChanged?: () => void;
}

export function ConversationLabelSelector({ 
  conversationId, 
  trigger,
  onLabelsChanged 
}: ConversationLabelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [initialLabels, setInitialLabels] = useState<string[]>([]);

  const { toast } = useToast();
  const { labels, loading: labelsLoading } = useConversationLabels();
  const { labels: currentLabels, loading: currentLabelsLoading, refetch: refetchCurrentLabels } = useConversationLabelsForConversation(conversationId);
  const { assign: assignLabels, assigning } = useAssignLabels();

  // Update selected labels when current labels change
  useEffect(() => {
    if (currentLabels) {
      const labelIds = currentLabels.map(label => label.id);
      setSelectedLabels(labelIds);
      setInitialLabels(labelIds);
    }
  }, [currentLabels]);

  const handleLabelToggle = (labelId: string, checked: boolean) => {
    setSelectedLabels(prev => {
      if (checked) {
        return [...prev, labelId];
      } else {
        return prev.filter(id => id !== labelId);
      }
    });
  };

  const handleSave = async () => {
    try {
      await assignLabels(conversationId, selectedLabels);
      
      toast({
        title: "Labels updated",
        description: "Conversation labels have been updated successfully."
      });
      
      // Refresh current labels and notify parent
      refetchCurrentLabels();
      onLabelsChanged?.();
      setIsOpen(false);
      setInitialLabels(selectedLabels);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation labels.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setSelectedLabels(initialLabels);
    setIsOpen(false);
  };

  const hasChanges = JSON.stringify(selectedLabels.sort()) !== JSON.stringify(initialLabels.sort());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-manage-conversation-labels">
            <Tags className="w-4 h-4 mr-2" />
            Labels
            {currentLabels && currentLabels.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {currentLabels.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Conversation Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Labels Preview */}
          {currentLabels && currentLabels.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Labels:</Label>
              <div className="flex flex-wrap gap-2">
                {currentLabels.map((label) => (
                  <Badge 
                    key={label.id}
                    style={{ 
                      backgroundColor: label.color, 
                      color: '#ffffff',
                      borderColor: label.color
                    }}
                    data-testid={`current-label-${label.id}`}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Label Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Labels:</Label>
            
            {labelsLoading || currentLabelsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : labels.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {labels.map((label) => (
                  <div key={label.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={`select-label-${label.id}`}
                      checked={selectedLabels.includes(label.id)}
                      onCheckedChange={(checked) => handleLabelToggle(label.id, checked as boolean)}
                      data-testid={`checkbox-select-label-${label.id}`}
                    />
                    <Label 
                      htmlFor={`select-label-${label.id}`}
                      className="flex items-center flex-1 cursor-pointer"
                    >
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="flex-1">{label.name}</span>
                      {label.is_default && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Default
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No labels available</p>
                <p className="text-sm">Create some labels first to organize your conversations</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-label-selection">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || assigning}
              data-testid="button-save-label-selection"
            >
              {assigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>

          {/* Selected Labels Preview */}
          {selectedLabels.length > 0 && hasChanges && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-medium">Selected Labels:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map((labelId) => {
                  const label = labels.find(l => l.id === labelId);
                  return label ? (
                    <Badge 
                      key={labelId}
                      style={{ 
                        backgroundColor: label.color, 
                        color: '#ffffff',
                        borderColor: label.color
                      }}
                      data-testid={`selected-label-${labelId}`}
                    >
                      {label.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}