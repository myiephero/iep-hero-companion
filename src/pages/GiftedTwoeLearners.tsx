import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentSelector } from "@/components/StudentSelector";
import { Brain, Plus, Star, BookOpen, Lightbulb, Zap, Users, Target, TrendingUp, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@shared/schema";

interface GiftedAssessment {
  id: string;
  student_id: string;
  assessment_type: string;
  giftedness_areas: string[];
  learning_differences?: string[];
  strengths: any;
  challenges?: any;
  recommendations?: any;
  acceleration_needs?: any;
  enrichment_activities?: any;
  social_emotional_needs?: any;
  twice_exceptional_profile?: any;
  assessment_scores?: any;
  evaluator_notes?: string;
  next_steps?: any;
  status: string;
  created_at: string;
}

const giftednessAreas = [
  'Intellectual/Academic',
  'Creative/Divergent Thinking',
  'Artistic/Visual Arts',
  'Musical',
  'Leadership',
  'Psychomotor',
  'Mathematical',
  'Scientific',
  'Linguistic/Verbal',
  'Spatial'
];

const learningDifferences = [
  'ADHD',
  'Autism Spectrum Disorder',
  'Dyslexia',
  'Dysgraphia',
  'Dyscalculia',
  'Executive Function Deficits',
  'Processing Speed Deficits',
  'Working Memory Challenges',
  'Sensory Processing Disorder',
  'Anxiety',
  'Depression'
];

const assessmentTypes = [
  { value: 'cognitive', label: 'Cognitive Assessment', description: 'IQ and cognitive abilities evaluation' },
  { value: 'academic', label: 'Academic Assessment', description: 'Subject-specific academic abilities' },
  { value: 'creative', label: 'Creative Assessment', description: 'Creative thinking and artistic abilities' },
  { value: 'leadership', label: 'Leadership Assessment', description: 'Leadership potential and skills' },
  { value: 'artistic', label: 'Artistic Assessment', description: 'Visual and performing arts talents' },
  { value: 'twice_exceptional', label: 'Twice-Exceptional Profile', description: 'Comprehensive 2e evaluation' }
];

interface Student {
  id: string;
  full_name: string;
  grade_level: string;
  school_name: string;
  disability_category: string;
  iep_status: string;
}

export default function GiftedTwoeLearners() {
  const [assessments, setAssessments] = useState<GiftedAssessment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiInsights, setAiInsights] = useState<Record<string, any>>({});
  const [userRole, setUserRole] = useState<'parent' | 'advocate'>('parent');
  const [formData, setFormData] = useState({
    assessment_type: "twice_exceptional",
    giftedness_areas: [] as string[],
    learning_differences: [] as string[],
    strengths: "",
    challenges: "",
    recommendations: "",
    acceleration_needs: "",
    enrichment_activities: "",
    social_emotional_needs: "",
    evaluator_notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchAssessments();
    // Detect user role from URL or context - for now defaulting to parent
    // In production, this should come from auth context
    setUserRole(window.location.pathname.includes('advocate') ? 'advocate' : 'parent');
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await apiRequest('GET', '/api/students');
      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const saveToStudentProfile = async (assessment: GiftedAssessment) => {
    try {
      const student = students.find(s => s.id === selectedStudent);
      if (!student) {
        toast({
          title: "Error",
          description: "Student not found",
          variant: "destructive",
        });
        return;
      }

      // Create assessment summary
      const assessmentSummary = `
Gifted Assessment - ${new Date(assessment.created_at).toLocaleDateString()}
Type: ${assessmentTypes.find(t => t.value === assessment.assessment_type)?.label}
Areas of Giftedness: ${assessment.giftedness_areas.join(', ')}
${assessment.learning_differences?.length ? `Learning Differences: ${assessment.learning_differences.join(', ')}` : ''}
${assessment.evaluator_notes ? `Notes: ${assessment.evaluator_notes}` : ''}
      `.trim();

      // Update student notes by appending the assessment summary
      const updateData = {
        notes: student.notes ? `${student.notes}\n\n${assessmentSummary}` : assessmentSummary
      };
      
      const response = await apiRequest('PUT', `/api/students/${selectedStudent}`, updateData);

      if (response.ok) {
        toast({
          title: "Assessment Saved",
          description: "Assessment profile has been saved to the student's profile",
        });
        // Refresh students data
        fetchStudents();
      } else {
        throw new Error('Failed to save assessment');
      }
    } catch (error) {
      console.error('Error saving assessment to profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save assessment to student profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateAIInsights = async (assessmentId: string) => {
    try {
      setAiLoading(prev => ({ ...prev, [assessmentId]: true }));
      
      const response = await apiRequest(
        'POST', 
        `/api/gifted-assessments/${assessmentId}/ai-analysis`,
        { role: userRole }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI insights');
      }
      
      const result = await response.json();
      setAiInsights(prev => ({ ...prev, [assessmentId]: result.ai_analysis }));
      
      toast({
        title: "AI Insights Generated",
        description: `Personalized insights for ${userRole}s have been created.`,
      });
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "AI Analysis Failed", 
        description: error instanceof Error ? error.message : "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(prev => ({ ...prev, [assessmentId]: false }));
    }
  };

  const fetchAssessments = async () => {
    try {
      if (!selectedStudent) {
        setAssessments([]);
        return;
      }

      const response = await apiRequest(
        'GET',
        `/api/gifted-assessments?student_id=${selectedStudent}`
      );
      const data = await response.json();
      
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load assessments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    try {
      if (!selectedStudent) throw new Error('No student selected');

      const assessmentData = {
        student_id: selectedStudent,
        assessment_type: formData.assessment_type,
        giftedness_areas: formData.giftedness_areas,
        learning_differences: formData.learning_differences.length > 0 ? formData.learning_differences : null,
        strengths: { notes: formData.strengths },
        challenges: formData.challenges ? { notes: formData.challenges } : null,
        recommendations: formData.recommendations ? { notes: formData.recommendations } : null,
        acceleration_needs: formData.acceleration_needs ? { notes: formData.acceleration_needs } : null,
        enrichment_activities: formData.enrichment_activities ? { notes: formData.enrichment_activities } : null,
        social_emotional_needs: formData.social_emotional_needs ? { notes: formData.social_emotional_needs } : null,
        twice_exceptional_profile: formData.learning_differences.length > 0 ? {
          giftedness: formData.giftedness_areas,
          learning_differences: formData.learning_differences,
          intersection_notes: formData.evaluator_notes
        } : null,
        evaluator_notes: formData.evaluator_notes || null,
        status: 'active'
      };

      const response = await apiRequest(
        'POST',
        '/api/gifted-assessments',
        assessmentData
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assessment');
      }

      toast({
        title: "Success",
        description: "Assessment profile created successfully!",
      });

      fetchAssessments();
      setShowCreateDialog(false);
      setFormData({
        assessment_type: "twice_exceptional",
        giftedness_areas: [],
        learning_differences: [],
        strengths: "",
        challenges: "",
        recommendations: "",
        acceleration_needs: "",
        enrichment_activities: "",
        social_emotional_needs: "",
        evaluator_notes: ""
      });
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGiftednessAreaChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      giftedness_areas: checked 
        ? [...prev.giftedness_areas, area]
        : prev.giftedness_areas.filter(a => a !== area)
    }));
  };

  const handleLearningDifferenceChange = (difference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      learning_differences: checked 
        ? [...prev.learning_differences, difference]
        : prev.learning_differences.filter(d => d !== difference)
    }));
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'cognitive': return Brain;
      case 'academic': return BookOpen;
      case 'creative': return Lightbulb;
      case 'leadership': return Users;
      case 'artistic': return Star;
      case 'twice_exceptional': return Zap;
      default: return Target;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gifted & Twice-Exceptional Learners</h1>
          <p className="text-muted-foreground">
            Create comprehensive profiles for gifted and twice-exceptional (2e) learners, including strengths, challenges, and specialized educational recommendations.
          </p>
        </div>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>
              Choose a student to create or view gifted education assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSelector
              selectedStudent={selectedStudent || ""}
              onStudentChange={(id) => setSelectedStudent(id || "")}
            />
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            {/* Create Assessment Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Assessment Profiles</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Gifted/2e Assessment Profile</DialogTitle>
                    <DialogDescription>
                      Document the student's giftedness, learning differences, and educational needs.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="assessment-type">Assessment Type</Label>
                      <Select value={formData.assessment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, assessment_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assessmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Areas of Giftedness</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select all areas where the student demonstrates exceptional ability.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {giftednessAreas.map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <Checkbox
                              id={area}
                              checked={formData.giftedness_areas.includes(area)}
                              onCheckedChange={(checked) => handleGiftednessAreaChange(area, checked as boolean)}
                            />
                            <Label htmlFor={area} className="text-sm font-normal">{area}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Learning Differences (2e Profile)</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select any learning differences or challenges (for twice-exceptional profile).</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {learningDifferences.map((difference) => (
                          <div key={difference} className="flex items-center space-x-2">
                            <Checkbox
                              id={difference}
                              checked={formData.learning_differences.includes(difference)}
                              onCheckedChange={(checked) => handleLearningDifferenceChange(difference, checked as boolean)}
                            />
                            <Label htmlFor={difference} className="text-sm font-normal">{difference}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="strengths">Strengths & Abilities</Label>
                        <Textarea
                          id="strengths"
                          placeholder="Describe the student's key strengths, talents, and exceptional abilities..."
                          value={formData.strengths}
                          onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="challenges">Challenges & Areas of Need</Label>
                        <Textarea
                          id="challenges"
                          placeholder="Describe areas where the student struggles or needs support..."
                          value={formData.challenges}
                          onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="recommendations">Educational Recommendations</Label>
                        <Textarea
                          id="recommendations"
                          placeholder="Recommend educational strategies, interventions, and supports..."
                          value={formData.recommendations}
                          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="acceleration">Acceleration Needs</Label>
                        <Textarea
                          id="acceleration"
                          placeholder="Describe any acceleration needs (grade skipping, subject acceleration, etc.)..."
                          value={formData.acceleration_needs}
                          onChange={(e) => setFormData(prev => ({ ...prev, acceleration_needs: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="enrichment">Enrichment Activities</Label>
                        <Textarea
                          id="enrichment"
                          placeholder="Suggest enrichment activities, programs, and opportunities..."
                          value={formData.enrichment_activities}
                          onChange={(e) => setFormData(prev => ({ ...prev, enrichment_activities: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="social-emotional">Social-Emotional Needs</Label>
                        <Textarea
                          id="social-emotional"
                          placeholder="Address social-emotional development, perfectionism, anxiety, etc..."
                          value={formData.social_emotional_needs}
                          onChange={(e) => setFormData(prev => ({ ...prev, social_emotional_needs: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="evaluator-notes">Additional Notes</Label>
                        <Textarea
                          id="evaluator-notes"
                          placeholder="Any additional observations, recommendations, or important information..."
                          value={formData.evaluator_notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, evaluator_notes: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateAssessment}
                      disabled={formData.giftedness_areas.length === 0 || !formData.strengths}
                    >
                      Create Assessment Profile
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Assessments Display */}
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-lg">Loading assessments...</div>
                </CardContent>
              </Card>
            ) : assessments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assessment profiles yet</h3>
                  <p className="text-muted-foreground">
                    Create an assessment profile to document this student's gifted abilities and learning needs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {assessments.map((assessment) => {
                  const IconComponent = getAssessmentTypeIcon(assessment.assessment_type);
                  return (
                    <Card key={assessment.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle>
                                {assessmentTypes.find(t => t.value === assessment.assessment_type)?.label}
                              </CardTitle>
                              <CardDescription>
                                {new Date(assessment.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assessment.learning_differences && assessment.learning_differences.length > 0 && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                2e Profile
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {assessment.giftedness_areas.length} Area{assessment.giftedness_areas.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {userRole} View
                            </Badge>
                            {selectedStudent && students.find(s => s.id === selectedStudent) && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                Student: {students.find(s => s.id === selectedStudent)?.full_name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            onClick={() => saveToStudentProfile(assessment)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save to Profile
                          </Button>
                        </div>
                        
                        <Tabs defaultValue="overview" className="space-y-4">
                          <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="strengths">Strengths</TabsTrigger>
                            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                            <TabsTrigger value="support">Support Needs</TabsTrigger>
                            <TabsTrigger value="ai-insights">🤖 AI Insights</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Areas of Giftedness
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {assessment.giftedness_areas.map((area) => (
                                  <Badge key={area} variant="secondary" className="bg-green-100 text-green-700">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {assessment.learning_differences && assessment.learning_differences.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Brain className="h-4 w-4" />
                                  Learning Differences
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {assessment.learning_differences.map((difference) => (
                                    <Badge key={difference} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                      {difference}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {assessment.twice_exceptional_profile && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-700">
                                  <Zap className="h-4 w-4" />
                                  Twice-Exceptional Profile
                                </h4>
                                <p className="text-sm text-blue-600">
                                  This student demonstrates both exceptional abilities and learning differences, requiring specialized educational approaches that address both their gifts and challenges.
                                </p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="strengths" className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Strengths & Abilities
                              </h4>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm leading-relaxed">
                                  {assessment.strengths?.notes || 'No strengths documented.'}
                                </p>
                              </div>
                            </div>

                            {assessment.challenges && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Challenges & Areas of Need
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">
                                    {assessment.challenges.notes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="recommendations" className="space-y-4">
                            {assessment.recommendations && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4" />
                                  Educational Recommendations
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">
                                    {assessment.recommendations.notes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {assessment.acceleration_needs && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Acceleration Needs
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">
                                    {assessment.acceleration_needs.notes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {assessment.enrichment_activities && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Star className="h-4 w-4" />
                                  Enrichment Activities
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">
                                    {assessment.enrichment_activities.notes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="support" className="space-y-4">
                            {assessment.social_emotional_needs && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Social-Emotional Needs
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">
                                    {assessment.social_emotional_needs.notes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {assessment.evaluator_notes && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Additional Notes
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">
                                    {assessment.evaluator_notes}
                                  </p>
                                </div>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="ai-insights" className="space-y-4">
                            {aiInsights[assessment.id] ? (
                              <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Brain className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">
                                      AI-Powered {userRole === 'parent' ? 'Parent' : 'Advocate'} Insights
                                    </h4>
                                  </div>
                                  
                                  {Object.entries(aiInsights[assessment.id]).map(([section, content]) => (
                                    content && (
                                      <div key={section} className="mb-4">
                                        <h5 className="font-medium text-sm text-gray-700 mb-2 capitalize">
                                          {section.replace(/_/g, ' ')}
                                        </h5>
                                        <div className="bg-white rounded-lg p-3 text-sm leading-relaxed">
                                          {typeof content === 'string' 
                                            ? content 
                                            : typeof content === 'object'
                                            ? Object.entries(content).map(([key, value]) => (
                                                <div key={key} className="mb-2">
                                                  <strong className="text-blue-800">{key.replace(/_/g, ' ')}:</strong>
                                                  <p className="mt-1 text-gray-700">{String(value)}</p>
                                                </div>
                                              ))
                                            : String(content)
                                          }
                                        </div>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h4 className="font-medium mb-2">No AI insights generated yet</h4>
                                <p className="text-muted-foreground text-sm mb-4">
                                  Click "Generate AI Insights" to get personalized recommendations 
                                  and analysis based on this assessment profile.
                                </p>
                                <Button
                                  onClick={() => generateAIInsights(assessment.id)}
                                  disabled={aiLoading[assessment.id]}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  {aiLoading[assessment.id] ? (
                                    <>
                                      <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Brain className="h-4 w-4" />
                                      Generate AI Insights
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}