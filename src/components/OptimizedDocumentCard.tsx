import { memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Download, Edit, Trash2, MoreVertical, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import LazyImage from './LazyImage';

interface Document {
  id: string;
  title: string;
  category?: string;
  created_at: string;
  file_size?: number;
  student_id?: string;
  file_url?: string;
}

interface OptimizedDocumentCardProps {
  document: Document;
  studentName?: string;
  onView: (doc: Document) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string, title: string) => void;
  onDownload: (doc: Document) => void;
  onAssignStudent: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

const OptimizedDocumentCard = memo(function OptimizedDocumentCard({
  document,
  studentName,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onAssignStudent,
  isSelected = false,
  onSelect,
  viewMode = 'grid'
}: OptimizedDocumentCardProps) {
  
  const handleView = useCallback(() => {
    onView(document);
  }, [onView, document]);

  const handleEdit = useCallback(() => {
    onEdit(document.id, document.title);
  }, [onEdit, document.id, document.title]);

  const handleDelete = useCallback(() => {
    onDelete(document.id, document.title);
  }, [onDelete, document.id, document.title]);

  const handleDownload = useCallback(() => {
    onDownload(document);
  }, [onDownload, document]);

  const handleAssignStudent = useCallback(() => {
    onAssignStudent(document.id);
  }, [onAssignStudent, document.id]);

  const handleSelect = useCallback(() => {
    onSelect?.(document.id);
  }, [onSelect, document.id]);

  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const getCategoryColor = useCallback((category?: string): string => {
    const colors: { [key: string]: string } = {
      'iep': 'bg-blue-100 text-blue-800',
      'assessment': 'bg-green-100 text-green-800',
      'report': 'bg-purple-100 text-purple-800',
      'communication': 'bg-orange-100 text-orange-800',
      'medical': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category?.toLowerCase() || 'default'] || colors.default;
  }, []);

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center p-4 border rounded-lg transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
        }`}
        data-testid={`document-list-item-${document.id}`}
      >
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="mr-3"
            data-testid={`checkbox-${document.id}`}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium truncate" title={document.title}>
              {document.title}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              {document.category && (
                <Badge className={getCategoryColor(document.category)} variant="secondary">
                  {document.category}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid={`actions-${document.id}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleView} data-testid={`view-${document.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload} data-testid={`download-${document.id}`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit} data-testid={`edit-${document.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAssignStudent} data-testid={`assign-${document.id}`}>
                    <User className="h-4 w-4 mr-2" />
                    Assign to Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600" data-testid={`delete-${document.id}`}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-4">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(document.created_at), 'MMM d, yyyy')}
            </span>
            {studentName && (
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {studentName}
              </span>
            )}
            {document.file_size && (
              <span>{formatFileSize(document.file_size)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      data-testid={`document-card-${document.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelect}
                className="mb-2"
                data-testid={`checkbox-${document.id}`}
              />
            )}
            <CardTitle className="text-sm truncate" title={document.title}>
              {document.title}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center text-xs space-x-2">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(document.created_at), 'MMM d, yyyy')}</span>
              </div>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid={`actions-${document.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleView} data-testid={`view-${document.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} data-testid={`download-${document.id}`}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit} data-testid={`edit-${document.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAssignStudent} data-testid={`assign-${document.id}`}>
                <User className="h-4 w-4 mr-2" />
                Assign to Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600" data-testid={`delete-${document.id}`}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {document.category && (
            <Badge className={getCategoryColor(document.category)} variant="secondary">
              {document.category}
            </Badge>
          )}
          
          {studentName && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span>Assigned to {studentName}</span>
            </div>
          )}
          
          {document.file_size && (
            <div className="text-xs text-muted-foreground">
              {formatFileSize(document.file_size)}
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex-1"
              data-testid={`view-button-${document.id}`}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              data-testid={`download-button-${document.id}`}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default OptimizedDocumentCard;