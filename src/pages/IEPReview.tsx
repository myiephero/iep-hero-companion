import { useState } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Download,
  Eye,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const IEPReview = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const analysisResults = {
    overallScore: 85,
    strengths: [
      "Clear goal measurements",
      "Appropriate service hours",
      "Well-defined accommodations"
    ],
    concerns: [
      "Missing transition planning",
      "Limited progress monitoring",
      "Unclear evaluation timeline"
    ],
    recommendations: [
      "Add specific transition goals for post-secondary planning",
      "Include monthly progress review meetings",
      "Define clear evaluation criteria and timeline"
    ]
  };

  const mockAnalysis = () => {
    setUploadProgress(25);
    setTimeout(() => setUploadProgress(50), 1000);
    setTimeout(() => setUploadProgress(75), 2000);
    setTimeout(() => {
      setUploadProgress(100);
      setAnalysisComplete(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI IEP Review</h1>
                <p className="text-muted-foreground">
                  Upload your IEP document for intelligent analysis and compliance review
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
              <Badge variant="outline">FERPA Compliant</Badge>
              <Badge variant="outline">Secure Upload</Badge>
            </div>
          </div>

          {!analysisComplete ? (
            // Upload Section
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload IEP Document
                </CardTitle>
                <CardDescription>
                  Select your PDF IEP document for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {uploadProgress === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Drag and drop your IEP document</h3>
                      <p className="text-muted-foreground">or click to browse files</p>
                    </div>
                    <Button onClick={mockAnalysis} size="lg" variant="hero">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload IEP Document
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF files up to 10MB. Your document is encrypted and secure.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">Emma_Thompson_IEP_2024.pdf</span>
                      <Badge variant="secondary">2.4 MB</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analysis Progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {uploadProgress < 25 && "Uploading document..."}
                      {uploadProgress >= 25 && uploadProgress < 50 && "Extracting text content..."}
                      {uploadProgress >= 50 && uploadProgress < 75 && "Running compliance analysis..."}
                      {uploadProgress >= 75 && uploadProgress < 100 && "Generating recommendations..."}
                      {uploadProgress === 100 && "Analysis complete!"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Analysis Results
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="bg-gradient-hero text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">IEP Compliance Score</h3>
                      <p className="opacity-90">Overall assessment of your IEP document</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{analysisResults.overallScore}</div>
                      <div className="text-sm opacity-90">out of 100</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    Strengths Identified
                  </CardTitle>
                  <CardDescription>
                    Areas where your IEP meets or exceeds best practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResults.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-success-soft rounded-lg">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Concerns */}
              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                  <CardDescription>
                    Potential gaps that could strengthen your child's IEP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResults.concerns.map((concern, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-warning-soft rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                        <span>{concern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>
                    Specific actions to improve your child's IEP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-4 bg-surface rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <p>{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Analysis
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/upsell/hero-plan">
                    Get Expert Review
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Back Navigation */}
          <div className="flex justify-center pt-4">
            <Button asChild variant="ghost">
              <Link to="/parent/dashboard">
                ← Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IEPReview;