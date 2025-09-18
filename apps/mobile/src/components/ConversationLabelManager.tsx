import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tags, Plus, Edit2, Trash2, Palette, Loader2 } from "lucide-react";
import { useConversationLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from "@/hooks/useConversationLabels";

// Color palette for labels
const LABEL_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', 
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#374151'
];

interface ConversationLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

interface LabelFormData {
  name: string;
  color: string;
  description: string;
}

export function ConversationLabelManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<ConversationLabel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: LABEL_COLORS[0],
    description: ''
  });

  const { toast } = useToast();
  const { labels, loading, error, refetch } = useConversationLabels();
  const { create: createLabel, creating } = useCreateLabel();
  const { update: updateLabel, updating } = useUpdateLabel();
  const { delete: deleteLabel, deleting } = useDeleteLabel();

  const resetForm = () => {
    setFormData({
      name: '',
      color: LABEL_COLORS[0],
      description: ''
    });
    setEditingLabel(null);
    setShowForm(false);
  };

  const handleStartEdit = (label: ConversationLabel) => {
    if (label.is_default) {
      toast({
        title: "Cannot edit default label",
        description: "Default labels cannot be modified.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingLabel(label);
    setFormData({
      name: label.name,
      color: label.color,
      description: label.description || ''
    });
    setShowForm(true);
  };

  const handleStartCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a label name.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingLabel) {
        await updateLabel(editingLabel.id, {
          name: formData.name.trim(),
          color: formData.color,
          description: formData.description.trim() || undefined
        });
        toast({
          title: "Label updated",
          description: "The label has been updated successfully."
        });
      } else {
        await createLabel({
          name: formData.name.trim(),
          color: formData.color,
          description: formData.description.trim() || undefined
        });
        toast({
          title: "Label created",
          description: "New label has been created successfully."
        });
      }
      
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: editingLabel ? "Failed to update label." : "Failed to create label.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (labelId: string, labelName: string) => {
    if (!confirm(`Are you sure you want to delete the label "${labelName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteLabel(labelId);
      toast({
        title: "Label deleted",
        description: "The label has been deleted successfully."
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete label.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-manage-labels">
          <Tags className="w-4 h-4 mr-2" />
          Manage Labels
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Conversation Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Label Form */}
          {showForm && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {editingLabel ? 'Edit Label' : 'Create New Label'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    data-testid="button-cancel-label-form"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="label-name">Name</Label>
                    <Input
                      id="label-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter label name"
                      data-testid="input-label-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="label-color">Color</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {LABEL_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          data-testid={`color-option-${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="label-description">Description (Optional)</Label>
                  <Textarea
                    id="label-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when to use this label"
                    rows={2}
                    data-testid="textarea-label-description"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit}
                    disabled={creating || updating}
                    data-testid="button-save-label"
                  >
                    {(creating || updating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingLabel ? 'Update Label' : 'Create Label'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} data-testid="button-cancel-save">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Existing Labels */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Labels</h3>
              {!showForm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStartCreate}
                  data-testid="button-add-new-label"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Label
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Error loading labels: {error}
              </div>
            ) : labels.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {labels.map((label) => (
                  <Card key={label.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          style={{ 
                            backgroundColor: label.color, 
                            color: '#ffffff',
                            borderColor: label.color
                          }}
                          data-testid={`label-badge-${label.id}`}
                        >
                          {label.name}
                        </Badge>
                        {label.description && (
                          <span className="text-sm text-muted-foreground">
                            {label.description}
                          </span>
                        )}
                        {label.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      
                      {!label.is_default && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(label)}
                            data-testid={`button-edit-label-${label.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(label.id, label.name)}
                            disabled={deleting}
                            data-testid={`button-delete-label-${label.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No labels created yet</p>
                <p className="text-sm">Create your first label to organize conversations</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}