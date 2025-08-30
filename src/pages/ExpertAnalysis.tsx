import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Brain, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/layouts/DashboardLayout';

interface ExpertAnalysisResult {
  id: string;
  student_name: string;
  analysis_type: 'comprehensive' | 'focused' | 'compliance';
  overall_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  compliance_issues: string[];
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function ExpertAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<ExpertAnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState('request');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalysisRequest = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an IEP document first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('analysis_type', analysisType);

      // TODO: Replace with actual API endpoint when backend is implemented
      const response = await fetch('/api/expert-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const result = await response.json();

      toast({
        title: "Analysis Requested",
        description: "Your expert analysis has been submitted and will be completed within 24-48 hours.",
      });

      // Mock result for now
      const mockAnalysis: ExpertAnalysisResult = {
        id: Date.now().toString(),
        student_name: 'Student Analysis',
        analysis_type: analysisType as any,
        overall_score: 0,
        strengths: [],
        areas_for_improvement: [],
        recommendations: [],
        compliance_issues: [],
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      setAnalyses(prev => [mockAnalysis, ...prev]);
      setActiveTab('results');
      setSelectedFile(null);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to submit analysis request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert IEP Analysis</h1>
        <p className="text-lg text-gray-600">
          Get professional analysis of your IEP documents from certified special education experts
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request Analysis</TabsTrigger>
          <TabsTrigger value="results">My Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Request Expert Analysis
              </CardTitle>
              <CardDescription>
                Upload your IEP document and select the type of analysis you need
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">IEP Document</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOC, or DOCX files up to 50MB
                    </p>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Analysis Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-colors ${analysisType === 'comprehensive' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setAnalysisType('comprehensive')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5" />
                        <h3 className="font-semibold">Comprehensive</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Full review of goals, services, accommodations, and legal compliance
                      </p>
                      <Badge variant="secondary" className="mt-2">Most Popular</Badge>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${analysisType === 'focused' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setAnalysisType('focused')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <h3 className="font-semibold">Focused</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Targeted review of specific areas or goals you're concerned about
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${analysisType === 'compliance' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setAnalysisType('compliance')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-semibold">Compliance</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Legal compliance check focusing on procedural requirements
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Expert analyses are completed by certified special education professionals within 24-48 hours.
                  Cost: $150 for comprehensive, $75 for focused, $50 for compliance review.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleAnalysisRequest}
                disabled={!selectedFile || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Submitting...' : 'Request Expert Analysis'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Expert Analyses</h2>
          </div>

          {analyses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-gray-600 mb-4">
                  Request your first expert analysis to get professional insights on your IEP
                </p>
                <Button onClick={() => setActiveTab('request')}>
                  Request Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{analysis.student_name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={analysis.analysis_type === 'comprehensive' ? 'default' : 'secondary'}>
                            {analysis.analysis_type}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          analysis.status === 'completed' ? 'default' :
                          analysis.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                      >
                        {analysis.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {analysis.status === 'completed' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{analysis.overall_score}%</div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{analysis.strengths.length}</div>
                            <div className="text-sm text-gray-600">Strengths</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{analysis.areas_for_improvement.length}</div>
                            <div className="text-sm text-gray-600">Improvements</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{analysis.compliance_issues.length}</div>
                            <div className="text-sm text-gray-600">Issues</div>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          View Full Analysis Report
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          Your analysis is {analysis.status}. You'll receive an email when it's complete.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}