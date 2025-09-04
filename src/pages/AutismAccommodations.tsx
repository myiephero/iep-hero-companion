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
  Clock,
  Volume2,
  Eye,
  ArrowRight,
  Download,
  Sparkles,
  Plus,
  Check,
  Save
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const AutismAccommodations = () => {
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
      description: "Accommodations for sensory support support",
      items: [
        { 
          id: "noise-canceling", 
          title: "Noise-Canceling Headphones",
          description: "Provide noise-canceling headphones for noisy environments",
          recommended: true 
        },
        { 
          id: "sensory-breaks", 
          title: "Sensory Breaks",
          description: "Scheduled sensory breaks every 30 minutes",
          recommended: true 
        },
        { 
          id: "fidget-tools", 
          title: "Fidget Tools",
          description: "Allow use of fidget tools and stress balls during instruction",
          recommended: false 
        },
        { 
          id: "lighting", 
          title: "Lighting Adjustments",
          description: "Adjusted lighting or seating away from fluorescent lights",
          recommended: false 
        },
        { 
          id: "weighted-blanket", 
          title: "Weighted Lap Pad",
          description: "Weighted lap pad for self-regulation during work time",
          recommended: false 
        }
      ]
    },
    {
      id: "communication",
      title: "Communication",
      icon: <Users className="h-5 w-5" />,
      description: "Communication and social interaction supports",
      items: [
        { 
          id: "visual-schedules", 
          title: "Visual Schedules",
          description: "Visual schedules and social stories for transitions",
          recommended: true 
        },
        { 
          id: "communication-device", 
          title: "AAC Device",
          description: "Access to AAC device or picture cards for communication",
          recommended: false 
        },
        { 
          id: "peer-support", 
          title: "Peer Support",
          description: "Structured peer interaction opportunities",
          recommended: true 
        },
        { 
          id: "social-scripts", 
          title: "Social Scripts",
          description: "Pre-written social scripts for common situations",
          recommended: false 
        }
      ]
    },
    {
      id: "academic",
      title: "Academic Support",
      icon: <Brain className="h-5 w-5" />,
      description: "Learning and processing accommodations",
      items: [
        { 
          id: "extended-time", 
          title: "Extended Time",
          description: "Extended time for assignments and tests (1.5x)",
          recommended: true 
        },
        { 
          id: "chunking", 
          title: "Task Chunking",
          description: "Breaking assignments into smaller, manageable chunks",
          recommended: true 
        },
        { 
          id: "visual-supports", 
          title: "Visual Supports",
          description: "Visual supports and graphic organizers for learning",
          recommended: true 
        },
        { 
          id: "repetition", 
          title: "Repeated Instructions",
          description: "Repeated instructions and clarification as needed",
          recommended: false 
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
        description: `${accommodation?.title} has been added to your list`,
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
      title: "All Accommodations Added",
      description: "All available accommodations have been added to your list",
    });
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
          category: accommodationCategories.find(cat => cat.items.some(item => item.id === id))?.title || 'Unknown'
        } : null;
      }).filter(Boolean);

      const studentName = selectedStudent && students?.find((s: any) => s.id === selectedStudent)?.full_name || "General";
      const documentTitle = `Autism Accommodations - ${studentName}`;
      const documentContent = {
        studentId: selectedStudent || null,
        studentName: studentName,
        accommodations: selectedAccommodationsList,
        createdDate: new Date().toISOString(),
        categories: accommodationCategories.map(cat => ({
          id: cat.id,
          title: cat.title,
          description: cat.description
        }))
      };

      const response = await apiRequest('POST', '/api/documents', {
        title: documentTitle,
        description: `Autism accommodation plan created on ${new Date().toLocaleDateString()}`,
        file_name: `${documentTitle}.json`,
        file_path: `vault/accommodations/${Date.now()}-autism-accommodations`,
        file_type: 'application/json',
        file_size: new Blob([JSON.stringify(documentContent, null, 2)]).size,
        category: 'Accommodation Plan',
        tags: ['autism', 'accommodations', 'plan'],
        content: JSON.stringify(documentContent, null, 2),
        student_id: selectedStudent || null
      });

      toast({
        title: "Saved to Vault",
        description: "Accommodation plan has been saved to your document vault",
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
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Autism Accommodation Builder</h1>
                <p className="text-muted-foreground">
                  Create personalized accommodations and supports for students with autism
                </p>
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <Card className="bg-gradient-card border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a student to create accommodations for, or leave blank for general accommodations.
                </p>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General Accommodations</SelectItem>
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
              All
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
          <div className="flex gap-4">
            <Button onClick={getAllAccommodations} variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add All Accommodations
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              {addedAccommodations.length} accommodations added
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
                    <h4 className="font-semibold text-sm">Suggested Accommodations</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-start justify-between p-4 rounded-lg bg-surface border border-border hover:border-primary/20 transition-colors"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{item.title}</h5>
                              {item.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleAddAccommodation(item.id)}
                            disabled={addedAccommodations.includes(item.id)}
                            size="sm"
                            variant={addedAccommodations.includes(item.id) ? "secondary" : "default"}
                            className="ml-4 min-w-[140px]"
                          >
                            {addedAccommodations.includes(item.id) ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add This Accommodation
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
            <Card className="bg-gradient-hero text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Added Accommodations ({addedAccommodations.length})
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
                Save to Vault
              </Button>
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={addedAccommodations.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate IEP Language
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
                disabled={addedAccommodations.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Document
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

          {/* Tips */}
          <Card className="bg-surface border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Start with recommended accommodations - they're based on research and best practices</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Consider your child's specific sensory needs and learning style</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Accommodations should be individualized to your child's unique profile</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Include specific details about implementation (frequency, duration, settings)</p>
              </div>
            </CardContent>
          </Card>

          {/* Back Navigation */}
          <div className="flex justify-center pt-6 pb-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/tools/hub" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Tools Hub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutismAccommodations;