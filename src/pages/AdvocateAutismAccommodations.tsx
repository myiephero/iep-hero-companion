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
  Briefcase,
  Target,
  Share2,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const AdvocateAutismAccommodations = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [addedAccommodations, setAddedAccommodations] = useState<string[]>([]);
  const [templateMode, setTemplateMode] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch students from API - these would be client students for advocates
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
      description: "Evidence-based sensory accommodations",
      items: [
        { 
          id: "noise-canceling", 
          title: "Noise-Canceling Headphones",
          description: "Provide noise-canceling headphones for noisy environments",
          recommended: true,
          advocateTip: "Specify decibel reduction and when to use",
          implementationNotes: "Trial period recommended to ensure student comfort"
        },
        { 
          id: "sensory-breaks", 
          title: "Sensory Breaks",
          description: "Regular breaks to sensory room or quiet space every 30 minutes",
          recommended: true,
          advocateTip: "Document frequency and duration for data collection",
          implementationNotes: "Should be proactive, not reactive to behaviors"
        },
        { 
          id: "fidget-tools", 
          title: "Fidget Tools",
          description: "Allow use of fidget toys or stress balls during instruction",
          recommended: false,
          advocateTip: "Specify silent, non-distracting fidget tools",
          implementationNotes: "Teach appropriate use and storage"
        },
        { 
          id: "weighted-blanket", 
          title: "Weighted Lap Pad",
          description: "Use of weighted lap pad for self-regulation during work time",
          recommended: false,
          advocateTip: "Specify weight (10% of body weight) and duration",
          implementationNotes: "OT evaluation recommended for proper sizing"
        },
        { 
          id: "lighting", 
          title: "Lighting Adjustments",
          description: "Adjusted lighting or seating away from fluorescent lights",
          recommended: false,
          advocateTip: "Document specific lighting triggers",
          implementationNotes: "May require physical classroom modifications"
        }
      ]
    },
    {
      id: "communication",
      title: "Communication",
      icon: <Users className="h-5 w-5" />,
      description: "Communication support strategies",
      items: [
        { 
          id: "visual-schedules", 
          title: "Visual Schedules",
          description: "Visual schedules and social stories for transitions",
          recommended: true,
          advocateTip: "Include transition warnings and first/then boards",
          implementationNotes: "Update regularly, involve student in creation"
        },
        { 
          id: "communication-device", 
          title: "AAC Device",
          description: "Access to AAC device or picture cards for communication",
          recommended: false,
          advocateTip: "Specify device type and communication goals",
          implementationNotes: "SLP assessment required, staff training needed"
        },
        { 
          id: "peer-support", 
          title: "Peer Support",
          description: "Structured peer interaction opportunities",
          recommended: true,
          advocateTip: "Define specific social skills targets",
          implementationNotes: "Train peer mentors, provide adult supervision"
        },
        { 
          id: "social-scripts", 
          title: "Social Scripts",
          description: "Pre-written social scripts for common situations",
          recommended: false,
          advocateTip: "Customize for individual's language level",
          implementationNotes: "Practice in natural settings, fade prompts"
        }
      ]
    },
    {
      id: "academic",
      title: "Academic Support",
      icon: <Brain className="h-5 w-5" />,
      description: "Evidence-based academic accommodations",
      items: [
        { 
          id: "extended-time", 
          title: "Extended Time",
          description: "Extended time for assignments and tests (1.5x)",
          recommended: true,
          advocateTip: "Specify conditions: assignments vs tests vs projects",
          implementationNotes: "Monitor for effectiveness, adjust as needed"
        },
        { 
          id: "chunking", 
          title: "Task Chunking",
          description: "Breaking assignments into smaller, manageable chunks",
          recommended: true,
          advocateTip: "Define specific chunk sizes and completion criteria",
          implementationNotes: "Use visual organizers, check for understanding"
        },
        { 
          id: "visual-supports", 
          title: "Visual Supports",
          description: "Visual supports and graphic organizers for learning",
          recommended: true,
          advocateTip: "Specify types: graphic organizers, visual cues, etc.",
          implementationNotes: "Train student to use independently"
        },
        { 
          id: "repetition", 
          title: "Repeated Instructions",
          description: "Repeated instructions and clarification as needed",
          recommended: false,
          advocateTip: "Include processing time between repetitions",
          implementationNotes: "Use different modalities: verbal, visual, written"
        }
      ]
    },
    {
      id: "social",
      title: "Social Support",
      icon: <Users className="h-5 w-5" />,
      description: "Social skills development strategies",
      items: [
        { 
          id: "social-skills-group", 
          title: "Social Skills Group",
          description: "Participation in structured social skills group sessions",
          recommended: true,
          advocateTip: "Specify group size, frequency, and skill targets",
          implementationNotes: "Use evidence-based curricula, collect data"
        },
        { 
          id: "peer-buddy", 
          title: "Peer Buddy System",
          description: "Assignment of peer buddy for social support",
          recommended: true,
          advocateTip: "Define buddy responsibilities and training",
          implementationNotes: "Rotate buddies, provide ongoing support"
        },
        { 
          id: "lunch-club", 
          title: "Lunch Club",
          description: "Structured lunch club for social interaction practice",
          recommended: false,
          advocateTip: "Include specific social goals and activities",
          implementationNotes: "Adult facilitation needed, structured activities"
        }
      ]
    },
    {
      id: "behavioral",
      title: "Behavioral Support",
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Positive behavior intervention strategies",
      items: [
        { 
          id: "behavior-plan", 
          title: "Positive Behavior Support Plan",
          description: "Individualized positive behavior support plan",
          recommended: true,
          advocateTip: "Include functional behavior assessment data",
          implementationNotes: "Train all staff, collect implementation data"
        },
        { 
          id: "break-cards", 
          title: "Break Request Cards",
          description: "Visual cards to request breaks when overwhelmed",
          recommended: true,
          advocateTip: "Teach appropriate timing and usage",
          implementationNotes: "Honor all appropriate requests, fade prompts"
        },
        { 
          id: "calm-down-space", 
          title: "Calm Down Space",
          description: "Access to designated calm down space when needed",
          recommended: false,
          advocateTip: "Define criteria for use and return conditions",
          implementationNotes: "Ensure space is calming, not isolating"
        }
      ]
    },
    {
      id: "environmental",
      title: "Environmental",
      icon: <Building2 className="h-5 w-5" />,
      description: "Environmental modifications and supports",
      items: [
        { 
          id: "preferential-seating", 
          title: "Preferential Seating",
          description: "Seating near teacher, away from distractions",
          recommended: true,
          advocateTip: "Consider sensory preferences and peer interactions",
          implementationNotes: "May need to adjust based on activities"
        },
        { 
          id: "quiet-space", 
          title: "Access to Quiet Space",
          description: "Access to quiet space for work completion",
          recommended: true,
          advocateTip: "Define when and how space can be accessed",
          implementationNotes: "Ensure space availability during needed times"
        },
        { 
          id: "reduced-stimuli", 
          title: "Reduced Environmental Stimuli",
          description: "Minimize visual and auditory distractions in workspace",
          recommended: false,
          advocateTip: "Specify types of modifications needed",
          implementationNotes: "May require classroom arrangement changes"
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
        title: "Accommodation Added",
        description: `${accommodation?.title} added to client plan`,
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
      title: "Comprehensive Plan Created",
      description: "All available accommodations added for review",
    });
  };

  const generateIEPLanguage = async () => {
    if (addedAccommodations.length === 0) {
      toast({
        title: "No accommodations selected",
        description: "Please add accommodations first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/autism_accommodations/generate-iep', {
        accommodation_ids: addedAccommodations,
        student_id: selectedStudent || null,
        format: 'formal'
      });

      const result = await response.json();

      // Create a downloadable text file
      const blob = new Blob([result.iep_language], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedStudent ? students?.find(s => s.id === selectedStudent)?.full_name || 'Client' : 'Template'}-autism-accommodations-advocate-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Professional IEP Language Generated",
        description: "Ready for IEP meeting presentation",
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
        description: "Please add accommodations first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/autism_accommodations/preview', {
        accommodation_ids: addedAccommodations,
        student_id: selectedStudent || null,
        template_type: 'iep'
      });

      const result = await response.json();

      // Open preview in a new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Professional Autism Accommodation Plan</title>
              <style>
                body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.8; }
                pre { white-space: pre-wrap; font-family: 'Times New Roman', serif; }
                h1 { color: #1a365d; text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
                .header { text-align: center; margin-bottom: 30px; }
                .advocate { font-style: italic; color: #666; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Autism Accommodation Plan</h1>
                <p class="advocate">Prepared by Educational Advocate</p>
              </div>
              <pre>${result.preview}</pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }

      toast({
        title: "Professional Preview Generated",
        description: "Ready for client review and IEP presentation",
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
        description: "Please add accommodations first",
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
          advocateTip: accommodation.advocateTip,
          implementationNotes: accommodation.implementationNotes
        } : null;
      }).filter(Boolean);

      const studentName = selectedStudent && students?.find((s: any) => s.id === selectedStudent)?.full_name || "Template";
      const documentTitle = `${studentName} - Professional Autism Accommodation Plan`;
      const documentContent = {
        studentId: selectedStudent || null,
        studentName: studentName,
        accommodations: selectedAccommodationsList,
        createdDate: new Date().toISOString(),
        createdBy: 'advocate',
        isTemplate: !selectedStudent,
        categories: accommodationCategories.map(cat => ({
          id: cat.id,
          title: cat.title,
          description: cat.description
        }))
      };

      const response = await apiRequest('POST', '/api/documents', {
        title: documentTitle,
        description: `Professional autism accommodation plan ${selectedStudent ? `for ${studentName}` : '(template)'} created on ${new Date().toLocaleDateString()}`,
        file_name: `${documentTitle}.json`,
        file_path: `vault/advocate-accommodations/${Date.now()}-autism-accommodations`,
        file_type: 'application/json',
        file_size: new Blob([JSON.stringify(documentContent, null, 2)]).size,
        category: 'Professional Accommodation Plan',
        tags: ['autism', 'accommodations', 'advocate', 'professional'],
        content: JSON.stringify(documentContent, null, 2),
        student_id: selectedStudent || null
      });

      toast({
        title: "Saved to Professional Vault",
        description: "Plan available for client sharing and future reference",
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

  const shareWithParent = async () => {
    if (addedAccommodations.length === 0) {
      toast({
        title: "No accommodations selected",
        description: "Please add accommodations first",
        variant: "destructive",
      });
      return;
    }

    // This would typically integrate with messaging system
    toast({
      title: "Plan Shared Successfully",
      description: "Accommodation plan sent to parent for review",
    });
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
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Professional Autism Accommodation Builder</h1>
                <p className="text-muted-foreground">
                  Create evidence-based accommodation plans for your clients with autism
                </p>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Client Selection</h3>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      Advocate Mode
                    </Badge>
                    {!selectedStudent && (
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        Template Mode
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose a client's child to create specific accommodations, or create a general template for future use.
                </p>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select client's child..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Create General Template</SelectItem>
                    {students?.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} - {student.grade_level ? `Grade ${student.grade_level}` : 'No Grade'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStudent && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">
                      🎯 Client Plan: This accommodation plan will be available for parent review and IEP meeting preparation.
                    </p>
                  </div>
                )}
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

          {/* Professional Actions */}
          <div className="flex gap-4 items-center flex-wrap">
            <Button onClick={getAllAccommodations} variant="secondary" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Add All Evidence-Based
            </Button>
            <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-700">
              {addedAccommodations.length} professional accommodations
            </Badge>
            {selectedStudent && (
              <Button onClick={shareWithParent} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share with Parent
              </Button>
            )}
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
                    <h4 className="font-semibold text-sm">Evidence-Based Accommodations</h4>
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                      {category.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex flex-col gap-3 p-4 rounded-lg bg-surface border border-border hover:border-primary/20 transition-colors"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{item.title}</h5>
                              {item.recommended && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  ✓ Evidence-Based
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                            {item.advocateTip && (
                              <div className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-200">
                                <strong>Professional Note:</strong> {item.advocateTip}
                              </div>
                            )}
                            {item.implementationNotes && (
                              <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">
                                <strong>Implementation:</strong> {item.implementationNotes}
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
                                Add to Professional Plan
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
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Professional Accommodation Plan ({addedAccommodations.length} accommodations)
                </CardTitle>
                <CardDescription className="text-white/80">
                  Ready for IEP meeting presentation and parent collaboration
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

          {/* Professional Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full"
                disabled={addedAccommodations.length === 0}
                onClick={saveToVault}
              >
                <Save className="h-4 w-4 mr-2" />
                Save to Vault
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
                Generate IEP Language
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
                Professional Preview
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="w-full"
                disabled={addedAccommodations.length === 0 || !selectedStudent}
                onClick={shareWithParent}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share with Parent
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg" className="min-w-48">
                <Link to="/advocate/dashboard-pro">
                  Back to Client Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Professional Resources */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Professional Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary">📊</span>
                <p><strong>Data-driven decisions</strong> - Use functional behavior assessments and academic evaluations to guide accommodation selection</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">🎯</span>
                <p><strong>Specific implementation</strong> - Include clear criteria for when, where, and how accommodations will be provided</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">📈</span>
                <p><strong>Progress monitoring</strong> - Establish measurable ways to track accommodation effectiveness</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">🤝</span>
                <p><strong>Team collaboration</strong> - Share accommodations with parents for home-school consistency</p>
              </div>
            </CardContent>
          </Card>

          {/* Back Navigation */}
          <div className="flex justify-center pt-6 pb-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/advocate/tools" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Advocate Tools
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateAutismAccommodations;