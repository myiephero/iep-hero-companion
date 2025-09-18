import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentSelector } from "@/components/StudentSelector";
import { 
  Brain,
  Lightbulb,
  Target,
  Sparkles,
  BookOpen,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/queryClient";

const AdvocateGiftedToolsHub = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // Fetch students
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  const giftedCards = [
    {
      id: "cognitive-assessment",
      title: "Cognitive Assessment",
      description: "Track intellectual abilities and learning patterns",
      icon: Brain,
      iconColor: "text-pink-400",
      bgColor: "bg-gray-700",
      route: "/advocate/gifted-tools/cognitive"
    },
    {
      id: "enrichment-needs",
      title: "Enrichment Needs", 
      description: "Document advanced learning opportunities",
      icon: Lightbulb,
      iconColor: "text-yellow-400", 
      bgColor: "bg-gray-700",
      route: "/advocate/gifted-tools/enrichment"
    },
    {
      id: "2e-support",
      title: "2E Support",
      description: "Address unique twice-exceptional needs", 
      icon: Target,
      iconColor: "text-red-400",
      bgColor: "bg-gray-700", 
      route: "/advocate/gifted-tools/2e-support"
    },
    {
      id: "ai-insights", 
      title: "AI Insights",
      description: "Get intelligent analysis and recommendations",
      icon: Sparkles,
      iconColor: "text-white",
      bgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      route: "/advocate/gifted-tools/ai-insights",
      isNew: true
    },
    {
      id: "quick-assessment",
      title: "Quick Assessment", 
      description: "Create a comprehensive assessment",
      icon: BookOpen,
      iconColor: "text-orange-300",
      bgColor: "bg-orange-800",
      route: "/advocate/gifted-tools/quick-assessment"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">
              Gifted & Twice-Exceptional Support
            </h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>

        <p className="text-gray-300 text-lg mb-8">
          Advanced learning assessments and support for gifted and 2E learners
        </p>

        {/* Integrated Support Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Integrated Gifted Support
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Comprehensive gifted and twice-exceptional assessment tools are now seamlessly integrated into your client's profile.
          </p>
        </div>

        {/* Student Selection */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Student Selection</h3>
            <p className="text-gray-300 mb-4">Choose a student to view their gifted assessment profile progress</p>
            <StudentSelector
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              students={students}
              placeholder="Select student to view gifted tools progress"
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* 5-Card Grid - Exact Layout from Parent Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {giftedCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <Card 
                key={card.id}
                className={`${card.bgColor} border-gray-600 hover:shadow-lg transition-all cursor-pointer text-white h-[140px] relative`}
                onClick={() => navigate(card.route)}
              >
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                    {card.isNew && (
                      <Badge className="bg-orange-500 text-white text-xs font-bold px-2 py-1">
                        NEW
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      {card.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center text-gray-400 text-sm">
          <span>Part of the <strong>IEP Hero</strong> educational toolkit</span>
          <button 
            onClick={() => navigate('/advocate/tools')}
            className="text-blue-400 hover:underline"
          >
            ← Back to All Tools
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvocateGiftedToolsHub;