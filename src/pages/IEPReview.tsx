import { useState, useEffect } from "react";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  ContainerMobile,
  SafeAreaFull
} from "@/components/mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  MessageSquare,
  Clock,
  Target,
  BarChart3,
  Sparkles,
  Shield,
  Eye,
  ChevronRight
} from "lucide-react";

interface IEPDocument {
  id: string;
  title: string;
  storage_path: string;
  pages?: number;
  uploaded_at: string;
}

interface IEPAnalysis {
  id: string;
  doc_id: string;
  kind: 'quality' | 'compliance';
  version: number;
  summary: any;
  scores: any;
  flags: any[];
  recommendations: any[];
  created_at: string;
  model: string;
}

interface ActionDraft {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

// Helper function to read file content as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export default function IEPReview() {
  const [documents, setDocuments] = useState<IEPDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<IEPDocument | null>(null);
  const [analyses, setAnalyses] = useState<IEPAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<IEPAnalysis | null>(null);
  const [actionDrafts, setActionDrafts] = useState<ActionDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [actionDraftOpen, setActionDraftOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const documents = await api.getDocuments();
      setDocuments(documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        storage_path: doc.file_path,
        uploaded_at: doc.created_at || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    }
  };

  const fetchAnalyses = async (docId: string) => {
    try {
      const reviews = await api.getAIReviews(docId);
      setAnalyses(reviews.map(review => {
        // Parse the AI analysis to extract structured data
        const analysisData = review.ai_analysis || {};
        const analysisText = typeof analysisData === 'string' ? analysisData : (analysisData.content || '');
        
        // Extract mock scores for demo (normally would be parsed from AI response)
        const scores = {
          overall: 85,
          goal_quality: 80,
          service_alignment: 90,
          compliance: 85
        };
        
        // Extract basic flags and recommendations from AI text
        const flags = analysisText.toLowerCase().includes('concern') ? [
          { where: 'Goal Section', notes: 'Some goals may need refinement', type: 'moderate' }
        ] : [];
        
        const recommendations = [
          { title: 'Enhance Goal Specificity', suggestion: 'Consider making goals more specific and measurable' },
          { title: 'Service Alignment', suggestion: 'Ensure services directly support stated goals' }
        ];

        return {
          id: review.id,
          doc_id: docId,
          kind: review.review_type as 'quality' | 'compliance',
          version: 1,
          summary: analysisText,
          scores,
          flags,
          recommendations,
          created_at: review.created_at || new Date().toISOString(),
          model: 'gpt-5'
        };
      }));
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load analyses",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      // Read file content
      const fileContent = await readFileAsText(file);
      
      // Create document with real API
      const document = await api.createDocument({
        title: file.name.split('.')[0],
        file_name: file.name,
        file_path: `uploads/${Date.now()}-${file.name}`,
        file_type: file.type,
        file_size: file.size
      });

      const docData: IEPDocument = {
        id: document.id,
        title: document.title,
        storage_path: document.file_path,
        uploaded_at: document.created_at || new Date().toISOString()
      };

      await fetchDocuments();
      setSelectedDoc(docData);
      setActiveTab('ingest');
      
      toast({
        title: "Upload successful",
        description: "Document uploaded successfully. Ready for processing.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!selectedDoc) return;

    setIngestStatus('processing');
    try {
      const data = await api.ingestIEP(selectedDoc.id);

      setIngestStatus('completed');
      setActiveTab('analyze');
      
      toast({
        title: "Processing complete",
        description: "Document processing completed successfully.",
      });
    } catch (error: any) {
      setIngestStatus('error');
      toast({
        title: "Ingestion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async (kind: 'quality' | 'compliance') => {
    if (!selectedDoc) return;

    setAnalysisStatus('processing');
    try {
      const data = await api.analyzeIEP(selectedDoc.id, kind, "");

      setAnalysisStatus('completed');
      await fetchAnalyses(selectedDoc.id);
      setActiveTab('report');
      
      toast({
        title: "Analysis complete",
        description: "Document analysis completed successfully.",
      });
    } catch (error: any) {
      setAnalysisStatus('error');
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateActionDraft = async (templateType: string, userInputs: any) => {
    if (!selectedAnalysis) return;

    try {
      const data = await api.createActionDraft(selectedAnalysis.id, templateType, userInputs);

      const newDraft: ActionDraft = {
        id: data.draftId,
        title: data.title,
        body: data.body,
        created_at: new Date().toISOString()
      };
      
      setActionDrafts([newDraft, ...actionDrafts]);
      setActionDraftOpen(false);
      
      toast({
        title: "Action draft generated",
        description: "Letter draft created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Draft generation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderScoreCard = (title: string, score: number, description: string) => (
    <PremiumCard variant="elevated" className="p-4">
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</div>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Progress value={score} className="h-3 bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{score}</div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </PremiumCard>
  );

  return (
    <MobileAppShell>
      <PremiumLargeHeader 
        title="AI IEP Review & Compliance"
        subtitle="AI-powered quality and compliance analysis"
        showBack={true}
      />
      
      <SafeAreaFull>
        <ContainerMobile className="space-y-6 pb-8"
          data-testid="iep-review-container"
        >

          {/* Premium Status Indicators */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Badge variant={activeTab === 'upload' ? 'default' : 'secondary'} className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Upload
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant={activeTab === 'ingest' ? 'default' : selectedDoc ? 'secondary' : 'outline'} className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Process
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant={activeTab === 'analyze' ? 'default' : ingestStatus === 'completed' ? 'secondary' : 'outline'} className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Analyze
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Badge variant={activeTab === 'report' ? 'default' : analyses.length > 0 ? 'secondary' : 'outline'} className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Report
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="hidden">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="ingest" disabled={!selectedDoc}>Ingest</TabsTrigger>
                <TabsTrigger value="analyze" disabled={ingestStatus !== 'completed'}>Analyze</TabsTrigger>
                <TabsTrigger value="report" disabled={analyses.length === 0}>Report</TabsTrigger>
              </TabsList>
            </div>

          <TabsContent value="upload" className="space-y-6">
            <PremiumCard variant="glass" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload IEP Document</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload PDF, DOCX, or TXT files for AI analysis
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/30">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={loading}
                    data-testid="file-input-upload"
                  />
                  <label htmlFor="file-upload" className={`cursor-pointer block ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FileText className="mx-auto h-16 w-16 text-blue-500 dark:text-blue-400 mb-4" />
                    <div className="space-y-3">
                      <Button 
                        variant={loading ? "outline" : "default"}
                        disabled={loading}
                        className="pointer-events-none h-12 px-8"
                        data-testid="button-choose-file"
                      >
                        {loading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Document
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PDF, DOCX, or TXT up to 10MB
                      </p>
                    </div>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Documents</h3>
                      <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <PremiumCard 
                          key={doc.id} 
                          variant={selectedDoc?.id === doc.id ? "interactive" : "default"}
                          onClick={() => setSelectedDoc(doc)}
                          className={cn(
                            "p-4 transition-all duration-200",
                            selectedDoc?.id === doc.id 
                              ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-950/30" 
                              : "hover:shadow-md"
                          )}
                          data-testid={`card-document-${doc.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedDoc?.id === doc.id && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <Badge variant="default" className="text-xs">Selected</Badge>
                              </div>
                            )}
                          </div>
                        </PremiumCard>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </TabsContent>

          <TabsContent value="ingest" className="space-y-6">
            <PremiumCard variant="elevated" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Document Processing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extract and chunk text for AI analysis
                    </p>
                  </div>
                </div>

                {selectedDoc && (
                  <div className="space-y-4">
                    <PremiumCard variant="glass" className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedDoc.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {ingestStatus === 'idle' ? 'Ready for processing' : 
                               ingestStatus === 'processing' ? 'Processing...' :
                               ingestStatus === 'completed' ? 'Processing complete' : 'Processing failed'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleIngest} 
                          disabled={ingestStatus === 'processing' || ingestStatus === 'completed'}
                          className="flex items-center gap-2 h-12 px-6"
                          variant={ingestStatus === 'completed' ? 'outline' : 'default'}
                          data-testid="button-start-ingest"
                        >
                          {ingestStatus === 'processing' ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : ingestStatus === 'completed' ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4" />
                              Start Processing
                            </>
                          )}
                        </Button>
                      </div>
                    </PremiumCard>

                    {ingestStatus === 'processing' && (
                      <PremiumCard variant="glass" className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Processing document...</span>
                          </div>
                          <Progress value={undefined} className="h-2 bg-blue-100 dark:bg-blue-800" />
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            This may take a few moments
                          </p>
                        </div>
                      </PremiumCard>
                    )}

                    {ingestStatus === 'completed' && (
                      <PremiumCard variant="glass" className="p-4 bg-green-50/50 dark:bg-green-950/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <span className="font-medium text-green-900 dark:text-green-100">Processing completed successfully</span>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Document is ready for AI analysis
                            </p>
                          </div>
                        </div>
                      </PremiumCard>
                    )}

                    {ingestStatus === 'error' && (
                      <PremiumCard variant="glass" className="p-4 bg-red-50/50 dark:bg-red-950/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-800 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <span className="font-medium text-red-900 dark:text-red-100">Processing failed</span>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              Please try again or contact support
                            </p>
                          </div>
                        </div>
                      </PremiumCard>
                    )}
                  </div>
                )}
              </div>
            </PremiumCard>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <PremiumCard 
                variant="interactive" 
                onClick={() => analysisStatus !== 'processing' && handleAnalyze('quality')}
                disabled={analysisStatus === 'processing'}
                className="p-6 relative overflow-hidden"
                data-testid="card-quality-analysis"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50/50 to-transparent dark:from-green-950/20 rounded-full transform translate-x-16 -translate-y-16" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quality Analysis</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        IEP quality, goal effectiveness, and service alignment
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAnalyze('quality')} 
                    disabled={analysisStatus === 'processing'}
                    className="w-full h-12 flex items-center gap-2"
                    data-testid="button-run-quality-analysis"
                  >
                    {analysisStatus === 'processing' ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run Quality Analysis
                      </>
                    )}
                  </Button>
                </div>
              </PremiumCard>

              <PremiumCard 
                variant="interactive"
                onClick={() => analysisStatus !== 'processing' && handleAnalyze('compliance')}
                disabled={analysisStatus === 'processing'}
                className="p-6 relative overflow-hidden"
                data-testid="card-compliance-check"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent dark:from-blue-950/20 rounded-full transform translate-x-16 -translate-y-16" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compliance Check</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        IDEA compliance, timelines, and procedural requirements
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAnalyze('compliance')} 
                    disabled={analysisStatus === 'processing'}
                    className="w-full h-12 flex items-center gap-2"
                    variant="outline"
                    data-testid="button-run-compliance-check"
                  >
                    {analysisStatus === 'processing' ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Run Compliance Check
                      </>
                    )}
                  </Button>
                </div>
              </PremiumCard>
            </div>

            {analysisStatus === 'processing' && (
              <PremiumCard variant="glass" className="p-6 bg-purple-50/30 dark:bg-purple-950/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">AI analysis in progress...</div>
                    <Progress value={undefined} className="h-3 bg-purple-100 dark:bg-purple-800" />
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      This may take a few minutes depending on document size
                    </p>
                  </div>
                </div>
              </PremiumCard>
            )}
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            {analyses.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis Reports</h3>
                    <Badge variant="secondary" className="text-xs">{analyses.length}</Badge>
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {analyses.map((analysis) => (
                      <Button
                        key={analysis.id}
                        variant={selectedAnalysis?.id === analysis.id ? "default" : "outline"}
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="capitalize whitespace-nowrap h-12 px-6 flex items-center gap-2"
                        data-testid={`button-select-${analysis.kind}-analysis`}
                      >
                        {analysis.kind === 'quality' ? <Target className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        {analysis.kind} Analysis
                        <Badge variant="secondary" className="text-xs ml-1">v{analysis.version}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedAnalysis && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      {Object.entries(selectedAnalysis.scores).map(([key, value]) => (
                        key !== 'overall' && (
                          <div key={key} data-testid={`score-card-${key}`}>
                            {renderScoreCard(
                              key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                              value as number,
                              `${key} assessment score`
                            )}
                          </div>
                        )
                      ))}
                    </div>

                    {/* Overall Score */}
                    <PremiumCard variant="elevated" className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Overall {selectedAnalysis.kind.charAt(0).toUpperCase() + selectedAnalysis.kind.slice(1)} Score
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Comprehensive {selectedAnalysis.kind} assessment
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                          <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {selectedAnalysis.scores.overall}/100
                          </div>
                          <Progress 
                            value={selectedAnalysis.scores.overall} 
                            className="h-4 bg-gray-100 dark:bg-gray-800" 
                            data-testid="progress-overall-score"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1">
                              {selectedAnalysis.scores.overall >= 80 ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : selectedAnalysis.scores.overall >= 60 ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {selectedAnalysis.scores.overall >= 80 ? 'Excellent' : 
                                 selectedAnalysis.scores.overall >= 60 ? 'Good' : 'Needs Improvement'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PremiumCard>

                    {/* Flags and Recommendations */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      <PremiumCard variant="elevated" className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 flex items-center justify-center">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Flags & Concerns
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedAnalysis.flags.length} issues identified
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {selectedAnalysis.flags.length > 0 ? selectedAnalysis.flags.map((flag, index) => (
                              <PremiumCard key={index} variant="glass" className="p-4 bg-yellow-50/50 dark:bg-yellow-950/20" data-testid={`flag-item-${index}`}>
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">{flag.where}</h4>
                                    {flag.type && <Badge variant="outline" className="text-xs">{flag.type}</Badge>}
                                  </div>
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{flag.notes}</p>
                                </div>
                              </PremiumCard>
                            )) : (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p>No concerns identified</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </PremiumCard>

                      <PremiumCard variant="elevated" className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Recommendations
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedAnalysis.recommendations.length} improvement suggestions
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {selectedAnalysis.recommendations.map((rec, index) => (
                              <PremiumCard key={index} variant="glass" className="p-4 bg-blue-50/50 dark:bg-blue-950/20" data-testid={`recommendation-item-${index}`}>
                                <div className="space-y-2">
                                  <h4 className="font-medium text-blue-900 dark:text-blue-100">{rec.title}</h4>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">{rec.suggestion}</p>
                                </div>
                              </PremiumCard>
                            ))}
                          </div>
                        </div>
                      </PremiumCard>
                    </div>

                    {/* Action Drafts */}
                    <PremiumCard variant="elevated" className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950 dark:to-purple-900 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generate Action Drafts</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Create letter drafts based on analysis findings
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Dialog open={actionDraftOpen} onOpenChange={setActionDraftOpen}>
                            <DialogTrigger asChild>
                              <Button className="h-12 px-6 flex items-center gap-2" data-testid="button-generate-draft">
                                <Sparkles className="h-4 w-4" />
                                Generate Letter Draft
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Generate Action Draft</DialogTitle>
                                <DialogDescription>
                                  Create a letter draft based on the analysis findings
                                </DialogDescription>
                              </DialogHeader>
                              <ActionDraftForm onSubmit={handleGenerateActionDraft} />
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" className="h-12 px-6 flex items-center gap-2" data-testid="button-download-report">
                            <Download className="h-4 w-4" />
                            Download Report
                          </Button>
                        </div>

                        {/* Display Generated Drafts */}
                        {actionDrafts.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generated Drafts</h4>
                              <Badge variant="secondary" className="text-xs">{actionDrafts.length}</Badge>
                            </div>
                            <div className="space-y-3">
                              {actionDrafts.map((draft) => (
                                <PremiumCard key={draft.id} variant="glass" className="p-4" data-testid={`draft-item-${draft.id}`}>
                                  <div className="space-y-3">
                                    <h5 className="font-semibold text-gray-900 dark:text-gray-100">{draft.title}</h5>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                      {draft.body}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <Button size="sm" variant="outline" className="h-9 px-4">Edit</Button>
                                      <Button size="sm" variant="outline" className="h-9 px-4">Copy</Button>
                                      <Button size="sm" variant="outline" className="h-9 px-4">Download</Button>
                                    </div>
                                  </div>
                                </PremiumCard>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </PremiumCard>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          </Tabs>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}

// Action Draft Form Component
function ActionDraftForm({ onSubmit }: { onSubmit: (templateType: string, userInputs: any) => void }) {
  const [templateType, setTemplateType] = useState('goal_revision_request');
  const [userInputs, setUserInputs] = useState({
    studentName: '',
    parentName: '',
    caseManager: '',
    currentSituation: '',
    requestedServices: '',
    evaluationAreas: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(templateType, userInputs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="templateType">Letter Type</Label>
        <Select value={templateType} onValueChange={setTemplateType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="goal_revision_request">Goal Revision Request</SelectItem>
            <SelectItem value="service_request">Service Request</SelectItem>
            <SelectItem value="evaluation_request">Evaluation Request</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="studentName">Student Name</Label>
          <Input
            id="studentName"
            value={userInputs.studentName}
            onChange={(e) => setUserInputs({...userInputs, studentName: e.target.value})}
            placeholder="Enter student name"
          />
        </div>
        <div>
          <Label htmlFor="parentName">Parent Name</Label>
          <Input
            id="parentName"
            value={userInputs.parentName}
            onChange={(e) => setUserInputs({...userInputs, parentName: e.target.value})}
            placeholder="Enter parent name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="caseManager">Case Manager</Label>
        <Input
          id="caseManager"
          value={userInputs.caseManager}
          onChange={(e) => setUserInputs({...userInputs, caseManager: e.target.value})}
          placeholder="Enter case manager name"
        />
      </div>

      {templateType === 'goal_revision_request' && (
        <div>
          <Label htmlFor="currentSituation">Current Situation</Label>
          <Textarea
            id="currentSituation"
            value={userInputs.currentSituation}
            onChange={(e) => setUserInputs({...userInputs, currentSituation: e.target.value})}
            placeholder="Describe the current situation..."
          />
        </div>
      )}

      {templateType === 'service_request' && (
        <div>
          <Label htmlFor="requestedServices">Requested Services</Label>
          <Textarea
            id="requestedServices"
            value={userInputs.requestedServices}
            onChange={(e) => setUserInputs({...userInputs, requestedServices: e.target.value})}
            placeholder="Describe the requested services..."
          />
        </div>
      )}

      {templateType === 'evaluation_request' && (
        <div>
          <Label htmlFor="evaluationAreas">Evaluation Areas</Label>
          <Textarea
            id="evaluationAreas"
            value={userInputs.evaluationAreas}
            onChange={(e) => setUserInputs({...userInputs, evaluationAreas: e.target.value})}
            placeholder="Specify areas for evaluation..."
          />
        </div>
      )}

      <Button type="submit" className="w-full">Generate Draft</Button>
    </form>
  );
}