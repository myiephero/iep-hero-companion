import { useState } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Brain, 
  CheckCircle, 
  Users,
  BookOpen,
  Clock,
  Volume2,
  Eye,
  ArrowRight,
  Download,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const AutismAccommodations = () => {
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);

  const accommodationCategories = [
    {
      title: "Sensory Support",
      icon: <Volume2 className="h-5 w-5" />,
      items: [
        { id: "noise-canceling", text: "Noise-canceling headphones during tests", recommended: true },
        { id: "sensory-breaks", text: "Scheduled sensory breaks every 30 minutes", recommended: true },
        { id: "fidget-tools", text: "Access to fidget tools and stress balls", recommended: false },
        { id: "lighting", text: "Adjusted lighting or seating away from fluorescent lights", recommended: false },
        { id: "weighted-blanket", text: "Weighted lap pad for self-regulation", recommended: false }
      ]
    },
    {
      title: "Communication & Social",
      icon: <Users className="h-5 w-5" />,
      items: [
        { id: "visual-schedules", text: "Visual schedules and social stories", recommended: true },
        { id: "communication-device", text: "Access to AAC device or picture cards", recommended: false },
        { id: "peer-support", text: "Structured peer interaction opportunities", recommended: true },
        { id: "social-scripts", text: "Pre-written social scripts for common situations", recommended: false },
        { id: "quiet-space", text: "Access to quiet space for communication practice", recommended: false }
      ]
    },
    {
      title: "Learning & Processing",
      icon: <Brain className="h-5 w-5" />,
      items: [
        { id: "extended-time", text: "Extended time for assignments and tests (1.5x)", recommended: true },
        { id: "chunking", text: "Breaking assignments into smaller chunks", recommended: true },
        { id: "visual-supports", text: "Visual supports and graphic organizers", recommended: true },
        { id: "repetition", text: "Repeated instructions and clarification", recommended: false },
        { id: "alternative-response", text: "Alternative ways to demonstrate knowledge", recommended: false }
      ]
    },
    {
      title: "Environment & Structure",
      icon: <Building2 className="h-5 w-5" />,
      items: [
        { id: "predictable-routine", text: "Predictable daily routine and advance notice of changes", recommended: true },
        { id: "preferred-seating", text: "Preferred seating (front, away from distractions)", recommended: true },
        { id: "movement-breaks", text: "Scheduled movement breaks", recommended: false },
        { id: "transition-support", text: "Visual or verbal transition warnings", recommended: true },
        { id: "reduced-stimulation", text: "Reduced visual and auditory stimulation", recommended: false }
      ]
    }
  ];

  const handleAccommodationToggle = (id: string) => {
    setSelectedAccommodations(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const recommendedCount = accommodationCategories
    .flatMap(cat => cat.items)
    .filter(item => item.recommended).length;

  const selectedCount = selectedAccommodations.length;

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Autism Accommodation Builder</h1>
                <p className="text-muted-foreground">
                  Create personalized accommodations and supports for students with autism
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Evidence-Based
              </Badge>
              <Badge variant="outline">Customizable</Badge>
              <Badge variant="outline">IEP Ready</Badge>
            </div>
          </div>

          {/* Progress Summary */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Accommodation Selection</h3>
                  <p className="opacity-90">
                    {selectedCount} accommodations selected • {recommendedCount} recommended
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedCount}</div>
                  <div className="text-sm opacity-90">selected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Categories */}
          <div className="grid gap-6">
            {accommodationCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    Select accommodations that support this area of need
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                        <Checkbox
                          id={item.id}
                          checked={selectedAccommodations.includes(item.id)}
                          onCheckedChange={() => handleAccommodationToggle(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <label 
                            htmlFor={item.id}
                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            {item.text}
                            {item.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Accommodations Summary */}
          {selectedCount > 0 && (
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Selected Accommodations Summary
                </CardTitle>
                <CardDescription>
                  Review your selected accommodations before generating documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedAccommodations.map((id) => {
                    const accommodation = accommodationCategories
                      .flatMap(cat => cat.items)
                      .find(item => item.id === id);
                    return accommodation ? (
                      <div key={id} className="flex items-center gap-2 p-2 bg-success-soft rounded">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">{accommodation.text}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              disabled={selectedCount === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate IEP Language
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              disabled={selectedCount === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Document
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/upsell/hero-plan">
                Get Expert Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Tips */}
          <Card className="bg-surface border-0">
            <CardHeader>
              <CardTitle className="text-lg">💡 Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Start with recommended accommodations - they're based on research and best practices</p>
              <p>• Consider your child's specific sensory needs and learning style</p>
              <p>• Accommodations should be individualized to your child's unique profile</p>
              <p>• Include specific details about implementation (frequency, duration, settings)</p>
            </CardContent>
          </Card>

          {/* Back Navigation */}
          <div className="flex justify-center pt-4">
            <Button asChild variant="ghost">
              <Link to="/advocate/dashboard">
                ← Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutismAccommodations;