import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Heart, Play, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";

const copingStrategies = [
  {
    id: 1,
    title: "Deep Breathing Exercise",
    description: "Simple breathing technique to reduce anxiety and stress",
    duration: "3-5 minutes",
    difficulty: "Easy",
    category: "Breathing",
    instructions: [
      "Find a comfortable sitting position",
      "Place one hand on chest, one on belly",
      "Breathe in slowly through nose for 4 counts",
      "Hold breath for 4 counts", 
      "Breathe out through mouth for 6 counts",
      "Repeat 5-10 times"
    ]
  },
  {
    id: 2,
    title: "Progressive Muscle Relaxation",
    description: "Tension and relaxation technique for physical stress relief",
    duration: "10-15 minutes",
    difficulty: "Medium",
    category: "Physical",
    instructions: [
      "Start with your toes, tense for 5 seconds",
      "Release and notice the relaxation",
      "Move up to calves, thighs, abdomen",
      "Continue through arms, shoulders, face",
      "Focus on the contrast between tension and relaxation",
      "End with full body relaxation"
    ]
  },
  {
    id: 3,
    title: "5-4-3-2-1 Grounding",
    description: "Sensory grounding technique for anxiety and overwhelm",
    duration: "2-3 minutes",
    difficulty: "Easy",
    category: "Mindfulness",
    instructions: [
      "Name 5 things you can see",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
      "Take a deep breath and center yourself"
    ]
  }
];

export default function CopingStrategies() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" data-testid="button-back-dashboard" asChild>
              <Link to="/parent/dashboard-free">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                Coping Strategies
              </h1>
              <p className="text-muted-foreground">
                Breathing exercises and relaxation techniques for stress management
              </p>
            </div>
          </div>
        </div>

        {/* Strategies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {copingStrategies.map((strategy) => (
            <Card key={strategy.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <Badge variant="outline" className="text-xs">
                      {strategy.difficulty}
                    </Badge>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {strategy.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                <CardDescription className="text-sm">
                  {strategy.description}
                </CardDescription>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {strategy.duration}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Instructions:</h4>
                  <div className="space-y-2">
                    {strategy.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4"
                    variant="outline"
                    data-testid={`button-start-${strategy.id}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Resources */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-red-900">Emergency Resources</CardTitle>
            <CardDescription className="text-red-700">
              If you or your child are in crisis, please contact these resources immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Crisis Hotline</h4>
                <p className="text-sm text-red-700 mb-2">National Suicide Prevention Lifeline</p>
                <p className="font-mono text-lg text-red-900">988</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Emergency Services</h4>
                <p className="text-sm text-red-700 mb-2">For immediate medical emergencies</p>
                <p className="font-mono text-lg text-red-900">911</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}