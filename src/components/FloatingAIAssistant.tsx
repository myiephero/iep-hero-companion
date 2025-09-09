import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, User, Loader2, X, Minimize2, Maximize2 } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface FloatingAIAssistantProps {
  uploadedDocument?: any;
  analysisResult?: any;
  selectedStudent?: string;
}

export function FloatingAIAssistant({ 
  uploadedDocument, 
  analysisResult, 
  selectedStudent 
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize welcome message when component receives document/analysis
  const initializeChat = () => {
    if (hasInitialized) return;
    
    let welcomeContent = "";
    
    if (uploadedDocument && analysisResult) {
      welcomeContent = `Hi! I've analyzed ${selectedStudent ? selectedStudent + "'s" : "your child's"} IEP document "${uploadedDocument.name}". I found an overall score of ${analysisResult.overallScore}% with some great strengths and areas for improvement. I can help you understand the analysis results, explain any confusing parts, or answer questions about what this means for your child's education. What would you like to know?`;
    } else if (uploadedDocument) {
      welcomeContent = `Hi! I can see you've uploaded "${uploadedDocument.name}" for ${selectedStudent || "your child"}. I can help you understand its content, explain complex terms, identify key points, and answer questions about what it means for your child's education. What would you like to know?`;
    } else {
      welcomeContent = `Hi! I'm your IEP assistant. I can help you understand IEP documents, explain analysis results, clarify educational terms, and answer questions about your child's special education needs. How can I help you today?`;
    }

    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'ai',
      content: welcomeContent,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setHasInitialized(true);
  };

  const handleSendQuestion = async () => {
    if (!currentQuestion.trim()) return;
    
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
    
    // Simulate AI response with context awareness
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'ai',
        content: generateContextualAIResponse(currentQuestion, analysisResult, uploadedDocument),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateContextualAIResponse = (question: string, analysis?: any, document?: any): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Context-aware responses based on analysis results
    if (analysis) {
      if (lowerQuestion.includes('score') || lowerQuestion.includes('overall')) {
        return `Your child's IEP received an overall score of ${analysis.overallScore}%. This is ${analysis.overallScore >= 85 ? 'excellent' : analysis.overallScore >= 75 ? 'good' : analysis.overallScore >= 65 ? 'fair' : 'an area that needs improvement'}. The analysis found that goals are ${analysis.qualityChecks?.measurable ? 'measurable' : 'not clearly measurable'} and ${analysis.qualityChecks?.timebound ? 'have clear timelines' : 'lack clear timelines'}.`;
      }
      
      if (lowerQuestion.includes('strength') || lowerQuestion.includes('good')) {
        return `Great question! The analysis identified these strengths in your child's IEP: ${analysis.strengths?.join(', ')}. These are solid foundations that show the IEP team is on the right track in these areas.`;
      }
      
      if (lowerQuestion.includes('improve') || lowerQuestion.includes('recommendation')) {
        return `Based on the analysis, here are the key areas for improvement: ${analysis.recommendations?.join('; ')}. These suggestions can help make your child's IEP even more effective.`;
      }
      
      if (lowerQuestion.includes('goal')) {
        return `Looking at your child's IEP goals, they ${analysis.qualityChecks?.specific ? 'are specific about what your child will do' : 'could be more specific about exactly what your child will accomplish'}. The goals ${analysis.qualityChecks?.achievable ? 'appear appropriate for your child\'s level' : 'may need adjustment to be more achievable'}. Would you like me to explain what makes a strong IEP goal?`;
      }
    }
    
    // General educational responses
    const responses = [
      "That's an important question about your child's education. Based on what I can see, this relates to ensuring your child gets appropriate support and services. The key is making sure everything is specific and measurable.",
      "This is about your child's educational rights and services. Remember, you're an equal member of the IEP team, and your input matters. You have the right to ask questions and request changes if something doesn't seem right.",
      "This appears to be about accommodations or modifications. Accommodations change HOW your child learns (like extra time), while modifications change WHAT they learn. Both are tools to help your child succeed.",
      "This relates to your child's progress and goals. The important thing is that goals should be specific enough that anyone can understand them and measure progress. If something seems vague, it's okay to ask for clarification.",
      "This is about services your child will receive. Make sure frequency and duration are clearly specified - for example, '30 minutes twice per week' rather than just 'speech therapy'. You have the right to understand exactly what your child will get."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const suggestedQuestions = [
    "What does my child's overall score mean?",
    "What are the main strengths in this IEP?", 
    "What should I focus on improving?",
    "Are these goals appropriate for my child?",
    "What questions should I ask at the next meeting?",
    "How do I advocate for better services?",
    "What are my rights as a parent?",
    "Can you explain this in simple terms?"
  ];

  // Show floating button if not open
  if (!isOpen) {
    const showNotification = uploadedDocument || analysisResult;
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setIsOpen(true);
            initializeChat();
          }}
          className="h-14 w-14 rounded-full shadow-lg bg-violet-600 hover:bg-violet-700 relative"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
          {showNotification && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping"></span>
            </div>
          )}
        </Button>
        
        {showNotification && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-xs">
            <p className="text-sm font-medium">💡 Have questions about your analysis?</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Click to chat with AI!</p>
          </div>
        )}
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`shadow-2xl border-2 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
      }`}>
        <CardHeader className="p-3 bg-violet-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <CardTitle className="text-sm">IEP AI Assistant</CardTitle>
                {selectedStudent && (
                  <p className="text-xs opacity-90">Helping with {selectedStudent}'s IEP</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-violet-700"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-violet-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 h-[calc(100%-60px)] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' ? 'bg-primary text-white' : 'bg-violet-100 text-violet-600'
                    }`}>
                      {message.type === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    </div>
                    <div className={`p-2 rounded-lg text-sm ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p>{message.content}</p>
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
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="p-3 border-t bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick questions:</p>
                <div className="grid grid-cols-1 gap-1">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs justify-start text-left"
                      onClick={() => setCurrentQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your child's IEP..."
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button 
                  onClick={handleSendQuestion}
                  disabled={!currentQuestion.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}