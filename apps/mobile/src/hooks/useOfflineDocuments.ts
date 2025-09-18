// Offline-aware hook for document management
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync, useOfflineAwareAPI } from '@/hooks/useOfflineSync';
import { storeDocumentData, getAllDocuments, getDocumentData } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'iep' | 'evaluation' | 'report' | 'other';
  size?: number;
  uploadDate: string;
  studentId?: string;
  url?: string;
  status: 'pending' | 'processed' | 'error';
  analysis?: any;
  lastAccessed?: string;
}

export const useOfflineDocuments = () => {
  const { user } = useAuth();
  const { isOnline, queueOperation } = useOfflineSync();
  const { makeRequest } = useOfflineAwareAPI();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents (online + offline)
  const loadDocuments = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from server first
        try {
          const response = await makeRequest('GET', '/api/documents');
          const serverDocuments = response.documents || [];
          
          // Store in offline cache (but not the actual file content for now)
          await Promise.all(
            serverDocuments.map((doc: Document) =>
              storeDocumentData(doc.id, doc, user.id)
            )
          );
          
          setDocuments(serverDocuments);
        } catch (networkError) {
          console.warn('Network request failed, falling back to offline data');
          // Fall back to offline data
          const offlineDocuments = await getAllDocuments(user.id);
          setDocuments(offlineDocuments);
        }
      } else {
        // Load from offline storage
        const offlineDocuments = await getAllDocuments(user.id);
        setDocuments(offlineDocuments);
        
        if (offlineDocuments.length === 0) {
          setError('No document data available offline. Please connect to load your documents.');
        }
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load document data');
      
      // Try to load any available offline data as fallback
      try {
        const offlineDocuments = await getAllDocuments(user.id);
        setDocuments(offlineDocuments);
      } catch (offlineError) {
        console.error('Failed to load offline documents:', offlineError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload document (queue for offline)
  const uploadDocument = async (file: File, studentId?: string, type: Document['type'] = 'other') => {
    if (!user?.id) throw new Error('User not authenticated');

    // For offline uploads, we'll store metadata and queue the upload
    const tempId = `temp-${Date.now()}`;
    const documentMetadata: Document = {
      id: tempId,
      name: file.name,
      type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      studentId,
      status: isOnline ? 'pending' : 'pending', // Will be processed when synced
    };

    try {
      if (isOnline) {
        // Try to upload immediately
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (studentId) formData.append('studentId', studentId);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const serverDocument = result.document;
          
          // Store in offline cache
          await storeDocumentData(serverDocument.id, serverDocument, user.id);
          
          // Update local state
          setDocuments(prev => [...prev, serverDocument]);
          
          toast({
            title: "Document Uploaded",
            description: `${file.name} has been uploaded successfully.`,
            duration: 3000,
          });
          
          return serverDocument;
        } else {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
      } else {
        // Store metadata offline and queue for upload
        await storeDocumentData(tempId, documentMetadata, user.id);
        
        // Queue the upload operation with file data
        // Note: In a real implementation, you'd need to handle file storage differently
        await queueOperation('create', '/api/documents/upload', {
          metadata: documentMetadata,
          fileName: file.name,
          fileSize: file.size
        });
        
        // Update local state
        setDocuments(prev => [...prev, documentMetadata]);
        
        toast({
          title: "Document Queued (Offline)",
          description: `${file.name} will be uploaded when you're back online.`,
          duration: 3000,
        });
        
        return documentMetadata;
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      if (isOnline) {
        // Try to delete on server
        await makeRequest('DELETE', `/api/documents/${documentId}`);
        
        // Update local state
        setDocuments(prev => prev.filter(d => d.id !== documentId));
        
        toast({
          title: "Document Deleted",
          description: "Document has been deleted successfully.",
          duration: 3000,
        });
      } else {
        // Queue for sync and remove locally
        await queueOperation('delete', `/api/documents/${documentId}`, { id: documentId });
        
        // Update local state
        setDocuments(prev => prev.filter(d => d.id !== documentId));
        
        toast({
          title: "Document Deleted (Offline)",
          description: "Deletion will sync when you're back online.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  // Get document details (with offline fallback)
  const getDocument = async (documentId: string): Promise<Document | null> => {
    try {
      // Update last accessed time
      const document = documents.find(d => d.id === documentId);
      if (document && user?.id) {
        const updatedDoc = { ...document, lastAccessed: new Date().toISOString() };
        await storeDocumentData(documentId, updatedDoc, user.id);
      }

      // First check local state
      if (document) return document;

      if (isOnline) {
        // Try to fetch from server
        try {
          const response = await makeRequest('GET', `/api/documents/${documentId}`);
          const serverDocument = response.document;
          
          // Store in offline cache
          if (user?.id) {
            await storeDocumentData(serverDocument.id, serverDocument, user.id);
          }
          
          return serverDocument;
        } catch (networkError) {
          console.warn('Network request failed, checking offline storage');
        }
      }

      // Check offline storage
      const offlineDocument = await getDocumentData(documentId);
      return offlineDocument;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  };

  // Get documents for a specific student
  const getStudentDocuments = (studentId: string) => {
    return documents.filter(doc => doc.studentId === studentId);
  };

  // Load documents on mount and when user/online status changes
  useEffect(() => {
    loadDocuments();
  }, [user?.id, isOnline]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    getDocument,
    getStudentDocuments,
    refreshDocuments: loadDocuments,
    isOffline: !isOnline
  };
};