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
import { supabase } from "@/integrations/supabase/client";
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
  Shield,
  Scale,
  BookOpen,
  Users,
  Flag
} from "lucide-react";

interface IEPDocument {
  id: string;
  title: string;
  storage_path: string;
  pages?: number;
  uploaded_at: string;
}

interface ExpertAnalysisResult {
  id: string;
  document_id: string;
  user_id: string;
  analysis_data: any;
  created_at: string;
  updated_at: string;
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
  evidence?: string[]; // Array of chunk IDs that support this analysis
  created_at: string;
  model: string;
}

interface ActionDraft {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function IEPReview() {
  const [documents, setDocuments] = useState<IEPDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<IEPDocument | null>(null);
  const [analyses, setAnalyses] = useState<IEPAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<IEPAnalysis | null>(null);
  const [expertAnalysisResult, setExpertAnalysisResult] = useState<ExpertAnalysisResult | null>(null);
  const [expertAnalysisAvailable, setExpertAnalysisAvailable] = useState(false);
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
      const { data, error } = await supabase
        .from('iep_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchAnalyses = async (docId: string) => {
    try {
      const { data, error } = await supabase
        .from('iep_analysis')
        .select('*')
        .eq('doc_id', docId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses((data || []) as IEPAnalysis[]);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('iep-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('iep_documents')
        .insert({
          user_id: user.id,
          title: file.name,
          storage_path: fileName,
          pages: null
        })
        .select()
        .single();

      if (docError) throw docError;

      await fetchDocuments();
      setSelectedDoc(docData);
      setActiveTab('ingest');
      
      toast({
        title: "Upload successful",
        description: "Document uploaded successfully. Ready for ingestion.",
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
      const { data, error } = await supabase.functions.invoke('iep-ingest', {
        body: { docId: selectedDoc.id }
      });

      if (error) throw error;

      setIngestStatus('completed');
      setActiveTab('analyze');
      
      toast({
        title: "Ingestion complete",
        description: `Extracted ${data.extractedTextLength} characters, created ${data.chunksCreated} chunks${data.sectionsIdentified ? ` with ${data.sectionsIdentified} sections identified` : ''}.`,
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
      const { data, error } = await supabase.functions.invoke('iep-analyze', {
        body: { 
          docId: selectedDoc.id, 
          kind,
          studentContext: {} // Could be populated from student data
        }
      });

      if (error) throw error;

      setAnalysisStatus('completed');
      await fetchAnalyses(selectedDoc.id);
      setActiveTab('report');
      
      toast({
        title: "Analysis complete",
        description: `Two-pass ${kind} analysis completed${data.sectionsAnalyzed ? ` - analyzed ${data.sectionsAnalyzed} sections` : ''}.`,
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
      const { data, error } = await supabase.functions.invoke('iep-action-draft', {
        body: { 
          analysisId: selectedAnalysis.id, 
          templateType,
          userInputs
        }
      });

      if (error) throw error;

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="ingest" disabled={!selectedDoc}>Ingest</TabsTrigger>
            <TabsTrigger value="analyze" disabled={ingestStatus !== 'completed'}>Analyze</TabsTrigger>
            <TabsTrigger value="expert" disabled={ingestStatus !== 'completed'}>Expert Analysis</TabsTrigger>
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
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Enhanced Two-Pass AI Analysis in Progress...</div>
                    <Progress value={undefined} className="h-2" />
                    <div className="grid gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Pass 1: Document structure analysis with GPT-4o-mini</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Pass 2: Detailed compliance analysis with Claude Sonnet-4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Evidence collection and structured output generation</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Advanced analysis may take 2-4 minutes for comprehensive IEP review
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expert" className="space-y-6">
            <ExpertAnalysisTab 
              selectedDoc={selectedDoc} 
              userRole={user?.user_metadata?.role || 'parent'} 
            />
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

// Expert Analysis Tab Component
function ExpertAnalysisTab({ selectedDoc, userRole }: { selectedDoc: IEPDocument | null, userRole: string }) {
  const [expertAnalysis, setExpertAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'advocate' | 'parent'>(userRole === 'advocate' ? 'advocate' : 'parent');
  const { toast } = useToast();

  const runExpertAnalysis = async () => {
    if (!selectedDoc) return;
    
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      
      // For now, fetch sample data to demonstrate the UI
      const response = await fetch(`${backendUrl}/api/expert-analysis-sample?user_role=${analysisMode}`);
      const data = await response.json();
      
      if (data.success) {
        setExpertAnalysis(data.analysis);
        toast({
          title: "Expert Analysis Complete",
          description: `Professional ${analysisMode} analysis with legal compliance review completed.`,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Expert analysis error:', error);
      toast({
        title: "Analysis Error", 
        description: "Failed to complete expert analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500'; 
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!selectedDoc) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
          <p className="text-muted-foreground">Please upload and ingest a document first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expert Analysis Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Expert IEP Analysis & Legal Compliance Review
          </CardTitle>
          <CardDescription>
            Professional-grade analysis with IDEA compliance scoring, legal citations, and advocate-level recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="analysis-mode">Analysis Mode:</Label>
              <Select value={analysisMode} onValueChange={(value: 'advocate' | 'parent') => setAnalysisMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="advocate">Advocate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={runExpertAnalysis} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Running Expert Analysis..." : "Run Expert Analysis"}
          </Button>
        </CardContent>
      </Card>

      {/* Expert Analysis Results */}
      {expertAnalysis && (
        <div className="space-y-6">
          {/* Overall Compliance Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Legal Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expertAnalysis.overall_scores.compliance}/100</div>
                <Progress value={expertAnalysis.overall_scores.compliance} className="h-2 mt-2" />
                <Badge className={`mt-2 ${expertAnalysis.overall_scores.compliance >= 80 ? 'bg-green-500' : expertAnalysis.overall_scores.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  {expertAnalysis.overall_scores.compliance >= 80 ? 'Compliant' : expertAnalysis.overall_scores.compliance >= 60 ? 'Needs Improvement' : 'Non-Compliant'}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Educational Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expertAnalysis.overall_scores.quality}/100</div>
                <Progress value={expertAnalysis.overall_scores.quality} className="h-2 mt-2" />
                <Badge className={`mt-2 ${expertAnalysis.overall_scores.quality >= 80 ? 'bg-green-500' : expertAnalysis.overall_scores.quality >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                  {expertAnalysis.overall_scores.quality >= 80 ? 'High Quality' : expertAnalysis.overall_scores.quality >= 60 ? 'Adequate' : 'Needs Work'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Flag className={`h-8 w-8 ${getRiskBadgeColor(expertAnalysis.overall_scores.risk_level)}`} />
                  <div>
                    <div className="text-xl font-bold capitalize">{expertAnalysis.overall_scores.risk_level}</div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Section-Level Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expertAnalysis.section_analyses?.map((section: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{section.section}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">Compliance: {section.compliance_score}/100</Badge>
                        <Badge variant="outline">Quality: {section.quality_score}/100</Badge>
                      </div>
                    </div>
                    
                    {section.traceability && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Traceability:</strong> {section.traceability}
                      </p>
                    )}
                    
                    {section.flags && section.flags.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Issues Found:</div>
                        <div className="flex flex-wrap gap-1">
                          {section.flags.map((flag: string, i: number) => (
                            <Badge key={i} variant="destructive" className="text-xs">{flag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {section.evidence && section.evidence.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Evidence:</div>
                        {section.evidence.map((evidence: any, i: number) => (
                          <div key={i} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-500">
                            "{evidence.snippet}"
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-sm">
                      <strong>Recommendation:</strong> {section.recommendation}
                    </div>
                    
                    {section.idea_citations && section.idea_citations.length > 0 && (
                      <div className="mt-2 text-xs text-blue-600">
                        <strong>Legal Citations:</strong> {section.idea_citations.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          {expertAnalysis.red_flags && expertAnalysis.red_flags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Critical Red Flags ({expertAnalysis.red_flags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expertAnalysis.red_flags.map((flag: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      flag.risk_level === 'high' ? 'bg-red-50 border-red-500' :
                      flag.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-500' : 
                      'bg-green-50 border-green-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getRiskBadgeColor(flag.risk_level)}>{flag.risk_level.toUpperCase()}</Badge>
                            <span className="font-medium">{flag.type.replace(/_/g, ' ')}</span>
                            <Badge variant="outline">{flag.section}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">"{flag.snippet}"</p>
                          <p className="text-sm">{flag.evidence}</p>
                          {flag.idea_citation && (
                            <p className="text-xs text-blue-600 mt-1">Citation: {flag.idea_citation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          {expertAnalysis.action_plan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  {analysisMode === 'advocate' ? 'Legal Action Plan' : 'Parent Action Guide'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Priority Issues</h4>
                    <ul className="space-y-2">
                      {expertAnalysis.action_plan.priority_issues?.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">
                      {analysisMode === 'advocate' ? 'Meeting Requests' : 'What to Ask For'}
                    </h4>
                    <ul className="space-y-2">
                      {(expertAnalysis.action_plan.meeting_requests || expertAnalysis.action_plan.what_to_ask)?.map((request: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{request}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {expertAnalysis.action_plan.specific_language && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
                    <h4 className="font-semibold mb-3">Specific Language to Use</h4>
                    <ul className="space-y-1">
                      {expertAnalysis.action_plan.specific_language.map((language: string, index: number) => (
                        <li key={index} className="text-sm font-mono bg-white p-2 rounded border">
                          "{language}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}