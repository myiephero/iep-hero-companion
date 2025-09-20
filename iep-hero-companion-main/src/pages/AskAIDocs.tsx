import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload, MessageSquare, Search, FileText, Zap } from "lucide-react";

export default function AskAIDocs() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Ask AI About Docs</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Query uploaded documents with AI assistance for quick insights and professional analysis.
          </p>
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            AI-Powered
          </Badge>
        </div>

        {/* Main Interface */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Document Upload */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload IEP documents, evaluations, or reports for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your documents here, or click to browse
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
              </p>
            </CardContent>
          </Card>

          {/* AI Query Interface */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Ask Questions
              </CardTitle>
              <CardDescription>
                Query your documents using natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Ask questions about your documents... (e.g., 'What are the current reading goals?' or 'Summarize the evaluation results')"
                className="min-h-[100px]"
              />
              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4" />
                Quick Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Search document content..." className="mb-3" />
              <Button size="sm" variant="outline" className="w-full">Search</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Document Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Get AI-generated summaries of your documents
              </p>
              <Button size="sm" variant="outline" className="w-full">Summarize</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Extract important findings and recommendations
              </p>
              <Button size="sm" variant="outline" className="w-full">Extract</Button>
            </CardContent>
          </Card>
        </div>

        {/* Sample Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Questions</CardTitle>
            <CardDescription>
              Try these example queries to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">IEP Analysis</h4>
                <div className="space-y-1">
                  <p className="text-xs bg-gray-100 p-2 rounded">"What are the current reading goals?"</p>
                  <p className="text-xs bg-gray-100 p-2 rounded">"List all accommodations and modifications"</p>
                  <p className="text-xs bg-gray-100 p-2 rounded">"When is the next annual review due?"</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Evaluation Review</h4>
                <div className="space-y-1">
                  <p className="text-xs bg-gray-100 p-2 rounded">"Summarize assessment results"</p>
                  <p className="text-xs bg-gray-100 p-2 rounded">"What are the identified areas of need?"</p>
                  <p className="text-xs bg-gray-100 p-2 rounded">"Compare current vs. previous evaluations"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}