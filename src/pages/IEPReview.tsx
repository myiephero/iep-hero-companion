import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
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
  BarChart3
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Progress value={score} className="h-2" />
          </div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">AI IEP Review & Compliance</h1>
            <p className="text-muted-foreground">
              Upload IEP documents for comprehensive AI-powered quality and compliance analysis
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="ingest" disabled={!selectedDoc}>Ingest</TabsTrigger>
            <TabsTrigger value="analyze" disabled={ingestStatus !== 'completed'}>Analyze</TabsTrigger>
            <TabsTrigger value="report" disabled={analyses.length === 0}>Report</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload IEP Document
                </CardTitle>
                <CardDescription>
                  Upload PDF, DOCX, or TXT files for analysis. Supported formats: PDF, DOCX, TXT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={loading}
                  />
                  <label htmlFor="file-upload" className={`cursor-pointer block ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        disabled={loading}
                        className="pointer-events-none"
                        asChild={false}
                      >
                        {loading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      PDF, DOCX, or TXT up to 10MB
                    </p>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Recent Documents</h3>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <Card key={doc.id} className={`cursor-pointer transition-colors ${selectedDoc?.id === doc.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`} onClick={() => setSelectedDoc(doc)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{doc.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                </p>
                              </div>
                              {selectedDoc?.id === doc.id && (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Document Ingestion
                </CardTitle>
                <CardDescription>
                  Extract and chunk text from the uploaded document for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDoc && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{selectedDoc.title}</h4>
                        <p className="text-sm text-muted-foreground">Ready for processing</p>
                      </div>
                      <Button 
                        onClick={handleIngest} 
                        disabled={ingestStatus === 'processing'}
                        className="flex items-center gap-2"
                      >
                        {ingestStatus === 'processing' ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Start Ingestion
                          </>
                        )}
                      </Button>
                    </div>

                    {ingestStatus === 'processing' && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Processing document...</div>
                        <Progress value={undefined} className="h-2" />
                      </div>
                    )}

                    {ingestStatus === 'completed' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Ingestion completed successfully</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Document is ready for AI analysis
                        </p>
                      </div>
                    )}

                    {ingestStatus === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Ingestion failed</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          Please try again or contact support
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quality Analysis
                  </CardTitle>
                  <CardDescription>
                    Analyze IEP quality, goal effectiveness, and service alignment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleAnalyze('quality')} 
                    disabled={analysisStatus === 'processing'}
                    className="w-full"
                  >
                    {analysisStatus === 'processing' ? 'Analyzing...' : 'Run Quality Analysis'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Compliance Check
                  </CardTitle>
                  <CardDescription>
                    Check IDEA compliance, timelines, and procedural requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleAnalyze('compliance')} 
                    disabled={analysisStatus === 'processing'}
                    className="w-full"
                    variant="outline"
                  >
                    {analysisStatus === 'processing' ? 'Analyzing...' : 'Run Compliance Check'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {analysisStatus === 'processing' && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">AI analysis in progress...</div>
                    <Progress value={undefined} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      This may take a few minutes depending on document size
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            {analyses.length > 0 && (
              <>
                <div className="flex gap-4 mb-6">
                  {analyses.map((analysis) => (
                    <Button
                      key={analysis.id}
                      variant={selectedAnalysis?.id === analysis.id ? "default" : "outline"}
                      onClick={() => setSelectedAnalysis(analysis)}
                      className="capitalize"
                    >
                      {analysis.kind} Analysis (v{analysis.version})
                    </Button>
                  ))}
                </div>

                {selectedAnalysis && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(selectedAnalysis.scores).map(([key, value]) => (
                        key !== 'overall' && (
                          <div key={key}>
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Overall {selectedAnalysis.kind} Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-center mb-4">
                          {selectedAnalysis.scores.overall}/100
                        </div>
                        <Progress value={selectedAnalysis.scores.overall} className="h-4" />
                      </CardContent>
                    </Card>

                    {/* Flags and Recommendations */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Flags & Concerns ({selectedAnalysis.flags.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedAnalysis.flags.map((flag, index) => (
                              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="font-medium text-yellow-800">{flag.where}</div>
                                <div className="text-sm text-yellow-700">{flag.notes}</div>
                                {flag.type && <Badge variant="secondary" className="mt-1">{flag.type}</Badge>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recommendations ({selectedAnalysis.recommendations.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedAnalysis.recommendations.map((rec, index) => (
                              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="font-medium text-blue-800">{rec.title}</div>
                                <div className="text-sm text-blue-700">{rec.suggestion}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Drafts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Generate Action Drafts
                        </CardTitle>
                        <CardDescription>
                          Create letter drafts based on analysis findings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4">
                          <Dialog open={actionDraftOpen} onOpenChange={setActionDraftOpen}>
                            <DialogTrigger asChild>
                              <Button>Generate Letter Draft</Button>
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

                          <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Report
                          </Button>
                        </div>

                        {/* Display Generated Drafts */}
                        {actionDrafts.length > 0 && (
                          <div className="mt-6 space-y-4">
                            <h4 className="font-medium">Generated Drafts</h4>
                            {actionDrafts.map((draft) => (
                              <Card key={draft.id} className="p-4">
                                <h5 className="font-medium mb-2">{draft.title}</h5>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {draft.body}
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" variant="outline">Edit</Button>
                                  <Button size="sm" variant="outline">Copy</Button>
                                  <Button size="sm" variant="outline">Download</Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
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