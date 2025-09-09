import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { MessageSquare, Upload, FileText, Send, Bot, User, Loader2, CheckCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface UploadedDocument {
  name: string;
  size: number;
  type: string;
  content?: string;
}

export default function AskAIDocuments() {
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDoc({
        name: file.name,
        size: file.size,
        type: file.type,
        content: "Document content would be extracted here..."
      });
      
      // Add welcome message when document is uploaded
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'ai',
        content: `I've received your document "${file.name}". I can help you understand its content, explain complex terms, identify key points, and answer questions about what it means for your child's education. What would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSendQuestion = async () => {
    if (!currentQuestion.trim() || !uploadedDoc) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: currentQuestion,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);
    
    // Simulate AI response (in real app, this would call the AI service)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'ai',
        content: generateAIResponse(currentQuestion),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAIResponse = (question: string): string => {
    // This would be replaced with actual AI analysis
    const responses = [
      "Based on your document, this refers to accommodations that help level the playing field for your child. These are changes to how your child accesses learning, not what they learn.",
      "This section outlines your child's current performance levels. It's important because it shows where your child is now and helps determine appropriate goals.",
      "The goals mentioned here should be specific, measurable, and achievable within a year. If they seem too vague, you have the right to request more specific language.",
      "This relates to the services your child will receive. Make sure the frequency and duration are clearly specified - for example, '30 minutes twice per week' rather than just 'speech therapy'.",
      "This appears to be about transition planning, which is required for students 16 and older. It focuses on preparing your child for life after high school."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const suggestedQuestions = [
    "What are the key points in this document?",
    "What do these accommodations mean?",
    "Are these goals appropriate for my child?",
    "What services is my child entitled to?",
    "What should I ask about at the next meeting?",
    "Is there anything concerning in this document?",
    "How do these recommendations compare to best practices?",
    "What are my rights regarding these decisions?"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-violet-100 dark:bg-violet-900">
            <MessageSquare className="h-8 w-8 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ask AI About Documents</h1>
            <p className="text-muted-foreground">Upload educational documents and get instant AI-powered explanations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Upload */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Upload IEP, 504 plan, evaluation, or any educational document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uploadedDoc ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drag & drop or click to upload</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-violet-50 file:text-violet-700"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{uploadedDoc.name}</p>
                        <p className="text-sm text-green-600">
                          {(uploadedDoc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setUploadedDoc(null)}
                      className="w-full"
                    >
                      Upload Different Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {uploadedDoc && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2 whitespace-normal"
                        onClick={() => setCurrentQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your uploaded document
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {!uploadedDoc ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-600">Upload a Document to Start</h3>
                        <p className="text-sm text-gray-500">
                          Once you upload a document, you can ask questions and get instant explanations
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === 'user' ? 'bg-primary text-white' : 'bg-violet-100 text-violet-600'
                            }`}>
                              {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`p-3 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.type === 'user' ? 'text-primary-foreground/70' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">AI is analyzing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question about your document..."
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSendQuestion}
                        disabled={!currentQuestion.trim() || isLoading}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}