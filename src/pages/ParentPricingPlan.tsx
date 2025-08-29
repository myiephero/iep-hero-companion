import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  Crown, 
  Heart, 
  Star, 
  UserPlus,
  Building,
  GraduationCap,
  Calendar,
  FileText,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ParentPricingPlan = () => {
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  // Student creation form state
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    date_of_birth: '',
    grade_level: '',
    school_name: '',
    district: '',
    disability_category: '',
    iep_status: 'active',
    case_manager: '',
    case_manager_email: '',
    iep_date: '',
    next_review_date: '',
    emergency_contact: '',
    emergency_phone: '',
    medical_info: '',
    notes: ''
  });

  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$29',
      period: '/month',
      description: 'Essential tools for IEP management',
      features: [
        'Document storage (2GB)',
        'Basic IEP tracking',
        'Meeting reminders',
        'Progress monitoring',
        'Email support',
        'Mobile app access'
      ],
      icon: <Heart className="h-6 w-6" />,
      gradient: 'from-pink-500 to-rose-600',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$59',
      period: '/month',
      description: 'Advanced advocacy tools for proactive parents',
      features: [
        'Everything in Basic',
        'AI-powered IEP analysis',
        'Smart letter generator',
        'Advocate matching service',
        'Document storage (10GB)',
        'Priority support',
        'Meeting prep wizard',
        'Goal tracking dashboard',
        'Compliance alerts'
      ],
      icon: <Star className="h-6 w-6" />,
      gradient: 'from-blue-500 to-indigo-600',
      popular: true
    },
    {
      id: 'champion',
      name: 'Champion Plan',
      price: '$99',
      period: '/month',
      description: 'Complete advocacy suite with expert support',
      features: [
        'Everything in Premium',
        'Unlimited document storage',
        'Direct advocate consultation',
        'Custom report generation',
        'Family advocacy training',
        'Emergency support hotline',
        'White-glove onboarding',
        'Quarterly strategy sessions',
        'Advanced analytics'
      ],
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-amber-500 to-orange-600',
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan Selected",
      description: `You've selected the ${pricingTiers.find(p => p.id === planId)?.name}. Redirecting to checkout...`,
    });
  };

  const handleCreateStudent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create student profiles.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('students')
        .insert({
          ...studentForm,
          user_id: user.id,
          parent_id: user.id,
          iep_date: studentForm.iep_date || null,
          next_review_date: studentForm.next_review_date || null,
          date_of_birth: studentForm.date_of_birth || null
        });

      if (error) throw error;

      toast({
        title: "Student Created",
        description: `Successfully created profile for ${studentForm.full_name}.`,
      });

      setShowStudentDialog(false);
      setStudentForm({
        full_name: '',
        date_of_birth: '',
        grade_level: '',
        school_name: '',
        district: '',
        disability_category: '',
        iep_status: 'active',
        case_manager: '',
        case_manager_email: '',
        iep_date: '',
        next_review_date: '',
        emergency_contact: '',
        emergency_phone: '',
        medical_info: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create student profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-10" />
          <div className="relative px-6 py-16 text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-6 py-3 glass-card text-sm font-medium text-primary-glow mb-8 animate-float">
                <Heart className="h-4 w-4 mr-2" />
                Parent Advocacy Pricing
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient text-glow">
                  Empower Your Child's Future
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Choose the perfect plan to advocate effectively for your child's educational needs
              </p>

              {/* Create Student Button */}
              <div className="mb-12">
                <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="button-premium text-lg px-8 py-4 h-auto font-semibold"
                    >
                      <UserPlus className="h-5 w-5 mr-3" />
                      Create Student Profile
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`premium-card card-hover relative ${
                    tier.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${tier.gradient} rounded-2xl mb-4 mx-auto`}>
                      {tier.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {tier.description}
                    </CardDescription>
                    <div className="flex items-baseline justify-center gap-1 mt-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        tier.popular 
                          ? 'button-premium' 
                          : 'bg-gradient-to-r hover:opacity-90'
                      }`}
                      onClick={() => handlePlanSelection(tier.id)}
                    >
                      {selectedPlan === tier.id ? 'Selected' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Student Creation Dialog */}
        <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Create Student Profile
              </DialogTitle>
              <DialogDescription>
                Set up a comprehensive profile for your student to track their IEP journey.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={studentForm.full_name}
                      onChange={(e) => setStudentForm({...studentForm, full_name: e.target.value})}
                      placeholder="Enter student's full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={studentForm.date_of_birth}
                      onChange={(e) => setStudentForm({...studentForm, date_of_birth: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="grade_level">Grade Level</Label>
                    <Select value={studentForm.grade_level} onValueChange={(value) => setStudentForm({...studentForm, grade_level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-k">Pre-K</SelectItem>
                        <SelectItem value="kindergarten">Kindergarten</SelectItem>
                        <SelectItem value="1st">1st Grade</SelectItem>
                        <SelectItem value="2nd">2nd Grade</SelectItem>
                        <SelectItem value="3rd">3rd Grade</SelectItem>
                        <SelectItem value="4th">4th Grade</SelectItem>
                        <SelectItem value="5th">5th Grade</SelectItem>
                        <SelectItem value="6th">6th Grade</SelectItem>
                        <SelectItem value="7th">7th Grade</SelectItem>
                        <SelectItem value="8th">8th Grade</SelectItem>
                        <SelectItem value="9th">9th Grade</SelectItem>
                        <SelectItem value="10th">10th Grade</SelectItem>
                        <SelectItem value="11th">11th Grade</SelectItem>
                        <SelectItem value="12th">12th Grade</SelectItem>
                        <SelectItem value="post-secondary">Post-Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="disability_category">Disability Category</Label>
                    <Select value={studentForm.disability_category} onValueChange={(value) => setStudentForm({...studentForm, disability_category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select disability category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autism">Autism</SelectItem>
                        <SelectItem value="intellectual_disability">Intellectual Disability</SelectItem>
                        <SelectItem value="specific_learning_disability">Specific Learning Disability</SelectItem>
                        <SelectItem value="emotional_disturbance">Emotional Disturbance</SelectItem>
                        <SelectItem value="speech_language_impairment">Speech or Language Impairment</SelectItem>
                        <SelectItem value="visual_impairment">Visual Impairment</SelectItem>
                        <SelectItem value="hearing_impairment">Hearing Impairment</SelectItem>
                        <SelectItem value="orthopedic_impairment">Orthopedic Impairment</SelectItem>
                        <SelectItem value="other_health_impairment">Other Health Impairment</SelectItem>
                        <SelectItem value="multiple_disabilities">Multiple Disabilities</SelectItem>
                        <SelectItem value="developmental_delay">Developmental Delay</SelectItem>
                        <SelectItem value="traumatic_brain_injury">Traumatic Brain Injury</SelectItem>
                        <SelectItem value="deaf_blindness">Deaf-Blindness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  School Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                      id="school_name"
                      value={studentForm.school_name}
                      onChange={(e) => setStudentForm({...studentForm, school_name: e.target.value})}
                      placeholder="Enter school name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="district">School District</Label>
                    <Input
                      id="district"
                      value={studentForm.district}
                      onChange={(e) => setStudentForm({...studentForm, district: e.target.value})}
                      placeholder="Enter school district"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="case_manager">Case Manager</Label>
                    <Input
                      id="case_manager"
                      value={studentForm.case_manager}
                      onChange={(e) => setStudentForm({...studentForm, case_manager: e.target.value})}
                      placeholder="Enter case manager name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="case_manager_email">Case Manager Email</Label>
                    <Input
                      id="case_manager_email"
                      type="email"
                      value={studentForm.case_manager_email}
                      onChange={(e) => setStudentForm({...studentForm, case_manager_email: e.target.value})}
                      placeholder="Enter case manager email"
                    />
                  </div>
                </div>
              </div>

              {/* IEP Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  IEP Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="iep_status">IEP Status</Label>
                    <Select value={studentForm.iep_status} onValueChange={(value) => setStudentForm({...studentForm, iep_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select IEP status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="iep_date">Current IEP Date</Label>
                    <Input
                      id="iep_date"
                      type="date"
                      value={studentForm.iep_date}
                      onChange={(e) => setStudentForm({...studentForm, iep_date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="next_review_date">Next Review Date</Label>
                    <Input
                      id="next_review_date"
                      type="date"
                      value={studentForm.next_review_date}
                      onChange={(e) => setStudentForm({...studentForm, next_review_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency & Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency & Medical Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={studentForm.emergency_contact}
                      onChange={(e) => setStudentForm({...studentForm, emergency_contact: e.target.value})}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                    <Input
                      id="emergency_phone"
                      value={studentForm.emergency_phone}
                      onChange={(e) => setStudentForm({...studentForm, emergency_phone: e.target.value})}
                      placeholder="Emergency phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="medical_info">Medical Information</Label>
                  <Textarea
                    id="medical_info"
                    value={studentForm.medical_info}
                    onChange={(e) => setStudentForm({...studentForm, medical_info: e.target.value})}
                    placeholder="Any relevant medical information, allergies, or health concerns..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={studentForm.notes}
                  onChange={(e) => setStudentForm({...studentForm, notes: e.target.value})}
                  placeholder="Any additional notes about the student..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStudent} className="button-premium">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Student Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ParentPricingPlan;