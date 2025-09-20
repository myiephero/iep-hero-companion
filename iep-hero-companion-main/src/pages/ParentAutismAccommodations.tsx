import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Brain, 
  CheckCircle, 
  Users,
  BookOpen,
  Volume2,
  Eye,
  ArrowRight,
  Download,
  Sparkles,
  Plus,
  Check,
  Save,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const ParentAutismAccommodations = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [addedAccommodations, setAddedAccommodations] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch students from API
  const { data: students } = useQuery({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/students');
      return response.json();
    },
  });

  const accommodationCategories = [
    {
      id: "sensory",
      title: "Sensory Support",
      icon: <Volume2 className="h-5 w-5" />,
      description: "Help your child manage sensory processing challenges",
      items: [
        { 
          id: "noise-canceling", 
          title: "Noise-Canceling Headphones",
          description: "Provide noise-canceling headphones for noisy environments",
          recommended: true,
          parentTip: "Great for cafeteria, assemblies, and classroom noise"
        },
        { 
          id: "sensory-breaks", 
          title: "Sensory Breaks",
          description: "Regular breaks to sensory room or quiet space every 30 minutes",
          recommended: true,
          parentTip: "Helps prevent sensory overload and meltdowns"
        },
        { 
          id: "fidget-tools", 
          title: "Fidget Tools",
          description: "Allow use of fidget toys or stress balls during instruction",
          recommended: false,
          parentTip: "Can help with focus and self-regulation"
        },
        { 
          id: "weighted-blanket", 
          title: "Weighted Lap Pad",
          description: "Use of weighted lap pad for self-regulation during work time",
          recommended: false,
          parentTip: "Provides calming deep pressure input"
        },
        { 
          id: "lighting", 
          title: "Lighting Adjustments",
          description: "Adjusted lighting or seating away from fluorescent lights",
          recommended: false,
          parentTip: "Helps children sensitive to harsh lighting"
        }
      ]
    },
    {
      id: "communication",
      title: "Communication",
      icon: <Users className="h-5 w-5" />,
      description: "Support your child's communication and social needs",
      items: [
        { 
          id: "visual-schedules", 
          title: "Visual Schedules",
          description: "Visual schedules and social stories for transitions",
          recommended: true,
          parentTip: "Reduces anxiety about schedule changes"
        },
        { 
          id: "communication-device", 
          title: "AAC Device",
          description: "Access to AAC device or picture cards for communication",
          recommended: false,
          parentTip: "Essential for non-speaking children"
        },
        { 
          id: "peer-support", 
          title: "Peer Support",
          description: "Structured peer interaction opportunities",
          recommended: true,
          parentTip: "Builds social skills in supported settings"
        },
        { 
          id: "social-scripts", 
          title: "Social Scripts",
          description: "Pre-written social scripts for common situations",
          recommended: false,
          parentTip: "Helps with social interactions and greetings"
        }
      ]
    },
    {
      id: "academic",
      title: "Academic Support",
      icon: <Brain className="h-5 w-5" />,
      description: "Academic accommodations to help your child succeed",
      items: [
        { 
          id: "extended-time", 
          title: "Extended Time",
          description: "Extended time for assignments and tests (1.5x)",
          recommended: true,
          parentTip: "Accounts for processing differences and anxiety"
        },
        { 
          id: "chunking", 
          title: "Task Chunking",
          description: "Breaking assignments into smaller, manageable chunks",
          recommended: true,
          parentTip: "Prevents overwhelm and builds success"
        },
        { 
          id: "visual-supports", 
          title: "Visual Supports",
          description: "Visual supports and graphic organizers for learning",
          recommended: true,
          parentTip: "Helps with organization and understanding"
        },
        { 
          id: "repetition", 
          title: "Repeated Instructions",
          description: "Repeated instructions and clarification as needed",
          recommended: false,
          parentTip: "Ensures understanding before starting tasks"
        }
      ]
    },
    {
      id: "social",
      title: "Social Support",
      icon: <Users className="h-5 w-5" />,
      description: "Help your child build meaningful relationships",
      items: [
        { 
          id: "social-skills-group", 
          title: "Social Skills Group",
          description: "Participation in structured social skills group sessions",
          recommended: true,
          parentTip: "Teaches social skills in small, safe groups"
        },
        { 
          id: "peer-buddy", 
          title: "Peer Buddy System",
          description: "Assignment of peer buddy for social support",
          recommended: true,
          parentTip: "Provides natural social modeling and friendship"
        },
        { 
          id: "lunch-club", 
          title: "Lunch Club",
          description: "Structured lunch club for social interaction practice",
          recommended: false,
          parentTip: "Makes lunchtime less overwhelming and more social"
        }
      ]
    },
    {
      id: "behavioral",
      title: "Behavioral Support",
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Positive strategies for behavior and self-regulation",
      items: [
        { 
          id: "behavior-plan", 
          title: "Positive Behavior Support Plan",
          description: "Individualized positive behavior support plan",
          recommended: true,
          parentTip: "Focuses on teaching replacement behaviors"
        },
        { 
          id: "break-cards", 
          title: "Break Request Cards",
          description: "Visual cards to request breaks when overwhelmed",
          recommended: true,
          parentTip: "Gives your child a way to communicate needs"
        },
        { 
          id: "calm-down-space", 
          title: "Calm Down Space",
          description: "Access to designated calm down space when needed",
          recommended: false,
          parentTip: "Provides a safe space for self-regulation"
        }
      ]
    },
    {
      id: "environmental",
      title: "Environmental",
      icon: <Building2 className="h-5 w-5" />,
      description: "Classroom and environment modifications",
      items: [
        { 
          id: "preferential-seating", 
          title: "Preferential Seating",
          description: "Seating near teacher, away from distractions",
          recommended: true,
          parentTip: "Helps with attention and reduces distractions"
        },
        { 
          id: "quiet-space", 
          title: "Access to Quiet Space",
          description: "Access to quiet space for work completion",
          recommended: true,
          parentTip: "Reduces sensory overload during work time"
        },
        { 
          id: "reduced-stimuli", 
          title: "Reduced Environmental Stimuli",
          description: "Minimize visual and auditory distractions in workspace",
          recommended: false,
          parentTip: "Creates a calm learning environment"
        }
      ]
    }
  ];

  const handleAddAccommodation = (accommodationId: string) => {
    if (!addedAccommodations.includes(accommodationId)) {
      setAddedAccommodations(prev => [...prev, accommodationId]);
      const accommodation = accommodationCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === accommodationId);
      
      toast({
        title: "Accommodation Added! 🎉",
        description: `${accommodation?.title} has been added to your plan`,
      });
    }
  };

  const handleRemoveAccommodation = (accommodationId: string) => {
    setAddedAccommodations(prev => prev.filter(id => id !== accommodationId));
  };

  const filteredCategories = activeCategory === "all" 
    ? accommodationCategories 
    : accommodationCategories.filter(cat => cat.id === activeCategory);

  const getAllAccommodations = () => {
    accommodationCategories.forEach(category => {
      category.items.forEach(item => {
        if (!addedAccommodations.includes(item.id)) {
          setAddedAccommodations(prev => [...prev, item.id]);
        }
      });
    });
    toast({
      title: "Amazing! All accommodations added! 🚀",
      description: "You've created a comprehensive plan for your child",
    });
  };

  const generateIEPLanguage = async () => {
    if (addedAccommodations.length === 0) {
      toast({
        title: "No accommodations selected",
        description: "Please add some accommodations first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/autism_accommodations/generate-iep', {
        accommodation_ids: addedAccommodations,
        student_id: selectedStudent === "general" ? null : selectedStudent,
        format: 'formal'
      });

      const result = await response.json();

      // Create a downloadable text file
      const blob = new Blob([result.iep_language], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStudent ? students?.find(s => s.id === selectedStudent)?.full_name || 'Student' : 'General'}-autism-accommodations-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "IEP Language Generated! 📝",
        description: "Ready-to-use IEP language has been downloaded",
      });

    } catch (error) {
      console.error('Error generating IEP language:', error);
      toast({
        title: "Error",
        description: "Failed to generate IEP language. Please try again.",
        variant: "destructive",
      });
    }
  };

  const previewDocument = async () => {
    if (addedAccommodations.length === 0) {
      toast({
        title: "No accommodations selected",
        description: "Please add some accommodations first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/autism_accommodations/preview', {
        accommodation_ids: addedAccommodations,
        student_id: selectedStudent === "general" ? null : selectedStudent,
        template_type: 'iep'
      });

      const result = await response.json();

      // Open preview in a new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Autism Accommodation Plan Preview</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                pre { white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 8px; }
                h1 { color: #2563eb; }
              </style>
            </head>
            <body>
              <h1>🌟 Your Child's Accommodation Plan Preview</h1>
              <pre>${result.preview}</pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }

      toast({
        title: "Preview Generated! 👀",
        description: "Your accommodation plan preview is ready to view",
      });

    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveToVault = async () => {
    if (addedAccommodations.length === 0) {
      toast({
        title: "No accommodations selected",
        description: "Please add some accommodations first",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedAccommodationsList = addedAccommodations.map((id) => {
        const accommodation = accommodationCategories
          .flatMap(cat => cat.items)
          .find(item => item.id === id);
        return accommodation ? {
          id: accommodation.id,
          title: accommodation.title,
          description: accommodation.description,
          category: accommodationCategories.find(cat => cat.items.some(item => item.id === id))?.title || 'Unknown',
          parentTip: accommodation.parentTip
        } : null;
      }).filter(Boolean);

      const studentName = (selectedStudent && selectedStudent !== "general") && students?.find((s: any) => s.id === selectedStudent)?.full_name || "General";
      const documentTitle = `${studentName} - Autism Accommodations Plan`;
      const documentContent = {
        studentId: selectedStudent || null,
        studentName: studentName,
        accommodations: selectedAccommodationsList,
        createdDate: new Date().toISOString(),
        createdBy: 'parent',
        categories: accommodationCategories.map(cat => ({
          id: cat.id,
          title: cat.title,
          description: cat.description
        }))
      };

      const response = await apiRequest('POST', '/api/documents', {
        title: documentTitle,
        description: `Comprehensive autism accommodation plan for ${studentName} created on ${new Date().toLocaleDateString()}`,
        file_name: `${documentTitle}.json`,
        file_path: `vault/accommodations/${Date.now()}-autism-accommodations`,
        file_type: 'application/json',
        file_size: new Blob([JSON.stringify(documentContent, null, 2)]).size,
        category: 'Accommodation Plan',
        tags: ['autism', 'accommodations', 'plan', 'parent'],
        content: JSON.stringify(documentContent, null, 2),
        student_id: selectedStudent === "general" ? null : selectedStudent
      });

      toast({
        title: "Saved to Your Vault! 💾",
        description: "Your accommodation plan is safely stored and ready to share",
      });

    } catch (error) {
      console.error('Error saving to vault:', error);
      toast({
        title: "Error",
        description: "Failed to save to vault. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Autism Accommodation Builder</h1>
                <p className="text-muted-foreground">
                  Create a personalized accommodation plan to help your child succeed in school
                </p>
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Choose Your Child</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Parent View
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select which child you're creating accommodations for, or create a general plan.
                </p>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select your child..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Accommodations</SelectItem>
                    {students?.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} - {student.grade_level ? `Grade ${student.grade_level}` : 'No Grade'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className="rounded-full"
            >
              All Categories
            </Button>
            {accommodationCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="rounded-full"
              >
                <span className="mr-2">{category.icon}</span>
                {category.title}
              </Button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 items-center">
            <Button onClick={getAllAccommodations} variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add All Accommodations
            </Button>
            <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-700">
              {addedAccommodations.length} accommodations selected
            </Badge>
          </div>

          {/* Accommodations Grid */}
          <div className="grid gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Accommodations for Your Child</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex flex-col gap-3 p-4 rounded-lg bg-surface border border-border hover:border-primary/20 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{item.title}</h5>
                              {item.recommended && (
                                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                  ⭐ Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                            {item.parentTip && (
                              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                💡 Parent Tip: {item.parentTip}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleAddAccommodation(item.id)}
                            disabled={addedAccommodations.includes(item.id)}
                            size="sm"
                            variant={addedAccommodations.includes(item.id) ? "secondary" : "default"}
                            className="w-full"
                            data-testid={`button-add-accommodation-${item.id}`}
                          >
                            {addedAccommodations.includes(item.id) ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Added to Plan
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Plan
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Accommodations Summary */}
          {addedAccommodations.length > 0 && (
            <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Your Child's Accommodation Plan ({addedAccommodations.length} accommodations)
                </CardTitle>
                <CardDescription className="text-white/80">
                  Review and manage your selected accommodations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {addedAccommodations.map((id) => {
                    const accommodation = accommodationCategories
                      .flatMap(cat => cat.items)
                      .find(item => item.id === id);
                    return accommodation ? (
                      <div key={id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">{accommodation.title}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveAccommodation(id)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full"
                disabled={addedAccommodations.length === 0}
                onClick={saveToVault}
              >
                <Save className="h-4 w-4 mr-2" />
                Save to My Vault
              </Button>
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={addedAccommodations.length === 0}
                onClick={generateIEPLanguage}
                data-testid="button-generate-iep"
              >
                <Download className="h-4 w-4 mr-2" />
                Download IEP Language
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
                disabled={addedAccommodations.length === 0}
                onClick={previewDocument}
                data-testid="button-preview-document"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Plan
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button asChild variant="secondary" size="lg" className="min-w-48">
                <Link to="/upsell/hero-plan">
                  Get Expert Review
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Parent Tips */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tips for Parent Advocates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary">💪</span>
                <p><strong>Start with recommended accommodations</strong> - they're based on research and best practices for children with autism</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">🎯</span>
                <p><strong>Focus on your child's specific needs</strong> - consider their sensory preferences, communication style, and learning strengths</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">📋</span>
                <p><strong>Be specific in IEP meetings</strong> - include details about frequency, duration, and settings for each accommodation</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">🤝</span>
                <p><strong>Collaborate with teachers</strong> - share what works at home and ask for their observations and suggestions</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ParentAutismAccommodations;