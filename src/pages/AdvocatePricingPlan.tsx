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
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Crown, 
  Zap, 
  Star, 
  Users, 
  UserPlus,
  Building,
  GraduationCap,
  Heart,
  Shield,
  Calendar,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdvocatePricingPlan = () => {
  const [showParentDialog, setShowParentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  // Parent/Guardian creation form state
  const [parentForm, setParentForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    relationship: '',
    preferred_contact: '',
    emergency_contact: '',
    notes: '',
    send_welcome_email: true,
    grant_document_access: true,
    allow_meeting_scheduling: true
  });

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49',
      period: '/month',
      seats: '1 Seat',
      description: 'Essential tools for solo advocates',
      features: [
        'CRM for client management',
        'Letter Generator',
        'Basic document storage',
        'Email support',
        'Standard compliance updates'
      ],
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$75',
      period: '/month',
      seats: '1 Seat',
      description: 'Adds scheduling and intake capabilities',
      features: [
        'Everything in Starter',
        'Scheduling system',
        'Intake forms',
        'Enhanced CRM features',
        'Priority email support',
        'Advanced reporting'
      ],
      icon: <Star className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      popular: true
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '$149',
      period: '/month',
      seats: '2 Seats',
      description: 'Team collaboration with billing tools',
      features: [
        'Everything in Pro',
        'Team CRM access',
        'Billing tools',
        'Shared client management',
        'Team collaboration features',
        'Advanced analytics',
        'Phone support'
      ],
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-green-500 to-green-600',
      popular: false
    },
    {
      id: 'agency-plus',
      name: 'Agency+',
      price: '$249',
      period: '/month',
      seats: '5 Seats',
      description: 'Premium features with AI and training',
      features: [
        'Everything in Agency',
        'AI Credits included',
        'Training Hub access',
        'Premium support',
        'White-label options',
        'Custom integrations',
        'Dedicated account manager'
      ],
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-amber-500 to-amber-600',
      popular: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan Selected",
      description: `You've selected the ${pricingTiers.find(p => p.id === planId)?.name}. Contact our team to upgrade.`,
    });
  };

  const handleCreateParent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create parent/guardian accounts.",
          variant: "destructive",
        });
        return;
      }

      // Here you would typically create the parent/guardian in your database
      // For now, we'll just show a success message
      toast({
        title: "Parent/Guardian Created",
        description: `Successfully created account for ${parentForm.full_name}.`,
      });

      setShowParentDialog(false);
      setParentForm({
        full_name: '',
        email: '',
        phone: '',
        relationship: '',
        preferred_contact: '',
        emergency_contact: '',
        notes: '',
        send_welcome_email: true,
        grant_document_access: true,
        allow_meeting_scheduling: true
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create parent/guardian account. Please try again.",
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
                <Crown className="h-4 w-4 mr-2" />
                Professional Advocate Pricing
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient text-glow">
                  Scale Your Advocacy Practice
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Choose the perfect plan to grow your advocacy business with professional-grade tools and support
              </p>

              {/* Create Parent/Guardian Button */}
              <div className="mb-12">
                <Dialog open={showParentDialog} onOpenChange={setShowParentDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="button-premium text-lg px-8 py-4 h-auto font-semibold mr-4"
                    >
                      <UserPlus className="h-5 w-5 mr-3" />
                      Create Parent/Guardian
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
            {/* Extra Seats Notice */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <strong>Extra Seats:</strong> $29-$39/month each - Flexible expansion for larger teams
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                 style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
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
                  
                  <CardHeader className="text-center pb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${tier.gradient} rounded-2xl mb-4 mx-auto`}>
                      {tier.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <div className="text-sm text-muted-foreground mb-2">{tier.seats}</div>
                    <CardDescription className="text-muted-foreground text-sm">
                      {tier.description}
                    </CardDescription>
                    <div className="flex items-baseline justify-center gap-1 mt-4">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
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

        {/* Parent/Guardian Creation Dialog */}
        <Dialog open={showParentDialog} onOpenChange={setShowParentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Create Parent/Guardian Account
              </DialogTitle>
              <DialogDescription>
                Set up a new parent or guardian account with customizable access permissions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={parentForm.full_name}
                      onChange={(e) => setParentForm({...parentForm, full_name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={parentForm.email}
                      onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={parentForm.phone}
                      onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="relationship">Relationship to Student</Label>
                    <Select value={parentForm.relationship} onValueChange={(value) => setParentForm({...parentForm, relationship: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="guardian">Legal Guardian</SelectItem>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        <SelectItem value="foster_parent">Foster Parent</SelectItem>
                        <SelectItem value="other_family">Other Family Member</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Contact Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
                    <Select value={parentForm.preferred_contact} onValueChange={(value) => setParentForm({...parentForm, preferred_contact: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="portal">Portal Messages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={parentForm.emergency_contact}
                      onChange={(e) => setParentForm({...parentForm, emergency_contact: e.target.value})}
                      placeholder="Emergency contact info"
                    />
                  </div>
                </div>
              </div>

              {/* Access Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Permissions
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Send Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">Send account setup instructions via email</p>
                    </div>
                    <Switch
                      checked={parentForm.send_welcome_email}
                      onCheckedChange={(checked) => setParentForm({...parentForm, send_welcome_email: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Grant Document Access</Label>
                      <p className="text-sm text-muted-foreground">Allow access to IEP documents and reports</p>
                    </div>
                    <Switch
                      checked={parentForm.grant_document_access}
                      onCheckedChange={(checked) => setParentForm({...parentForm, grant_document_access: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Allow Meeting Scheduling</Label>
                      <p className="text-sm text-muted-foreground">Enable parent to schedule meetings independently</p>
                    </div>
                    <Switch
                      checked={parentForm.allow_meeting_scheduling}
                      onCheckedChange={(checked) => setParentForm({...parentForm, allow_meeting_scheduling: checked})}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={parentForm.notes}
                  onChange={(e) => setParentForm({...parentForm, notes: e.target.value})}
                  placeholder="Any additional notes or special instructions..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowParentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateParent} className="button-premium">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdvocatePricingPlan;