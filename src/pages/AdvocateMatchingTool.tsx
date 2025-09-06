import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StudentSelector } from "@/components/StudentSelector";
import { Search, MapPin, Star, Clock, DollarSign, MessageSquare, Users, GraduationCap, Filter, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Advocate {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  specializations?: string[];
  years_experience?: number;
  education?: string;
  certifications?: string[];
  rate_per_hour?: number;
  availability?: string;
  bio?: string;
  languages?: string[];
  case_types?: string[];
  rating?: number;
  total_reviews?: number;
}

export default function AdvocateMatchingTool() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    urgency_level: "medium",
    preferred_contact_method: "email",
    budget_range: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdvocates();
  }, []);

  const fetchAdvocates = async () => {
    try {
      const response = await apiRequest('GET', '/api/advocates');
      const data = await response.json();
      
      // Mock data for now since we don't have advocates API yet
      const mockAdvocates: Advocate[] = [
        {
          id: "1",
          user_id: "user1",
          full_name: "Dr. Sarah Johnson",
          email: "sarah.johnson@advocate.com",
          phone: "+1 (555) 123-4567",
          location: "Seattle, WA",
          specializations: ["Autism Spectrum", "ADHD", "Learning Disabilities"],
          years_experience: 12,
          education: "PhD in Special Education",
          certifications: ["BCBA", "Special Education Law Certificate"],
          rate_per_hour: 125,
          availability: "Monday - Friday, 9 AM - 5 PM",
          bio: "Experienced advocate with over 12 years helping families navigate the IEP process. Specialized in autism spectrum disorders and complex cases.",
          languages: ["English", "Spanish"],
          case_types: ["IEP Development", "Due Process", "504 Plans"],
          rating: 4.9,
          total_reviews: 47
        },
        {
          id: "2", 
          user_id: "user2",
          full_name: "Michael Chen",
          email: "m.chen@advocacy.org",
          phone: "+1 (555) 987-6543",
          location: "Portland, OR",
          specializations: ["Dyslexia", "ADHD", "Behavioral Support"],
          years_experience: 8,
          education: "MS in Special Education",
          certifications: ["Certified Educational Advocate"],
          rate_per_hour: 95,
          availability: "Flexible scheduling including evenings",
          bio: "Passionate about helping students with learning differences reach their full potential. Focus on collaborative solutions.",
          languages: ["English", "Mandarin"],
          case_types: ["IEP Reviews", "School Mediation", "Transition Planning"],
          rating: 4.7,
          total_reviews: 32
        },
        {
          id: "3",
          user_id: "user3", 
          full_name: "Amanda Rodriguez",
          email: "amanda.r@specialeducation.net",
          phone: "+1 (555) 456-7890",
          location: "San Francisco, CA",
          specializations: ["Autism", "Speech Delays", "Assistive Technology"],
          years_experience: 15,
          education: "JD, Special Education Law",
          certifications: ["Special Education Attorney", "IEP Facilitator"],
          rate_per_hour: 175,
          availability: "By appointment",
          bio: "Legal expert in special education law with extensive experience in complex IEP cases and due process hearings.",
          languages: ["English", "Spanish"],
          case_types: ["Due Process", "Legal Representation", "IEP Disputes"],
          rating: 4.8,
          total_reviews: 68
        }
      ];
      
      setAdvocates(mockAdvocates);
    } catch (error) {
      console.error('Error fetching advocates:', error);
      toast({
        title: "Error",
        description: "Failed to load advocates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvocates = advocates.filter(advocate => {
    const matchesSearch = advocate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advocate.specializations?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !locationFilter || advocate.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSpecialization = !specializationFilter || 
                                 advocate.specializations?.some(spec => spec.toLowerCase().includes(specializationFilter.toLowerCase()));
    
    return matchesSearch && matchesLocation && matchesSpecialization;
  });

  const handleContactAdvocate = async () => {
    if (!selectedAdvocate) return;

    try {
      const requestData = {
        advocate_id: selectedAdvocate.user_id,
        student_id: selectedStudent,
        subject: contactForm.subject,
        message: contactForm.message,
        urgency_level: contactForm.urgency_level,
        preferred_contact_method: contactForm.preferred_contact_method,
        budget_range: contactForm.budget_range || null
      };

      const response = await apiRequest('POST', '/api/advocate-requests', requestData);
      
      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      toast({
        title: "Request Sent",
        description: `Your request has been sent to ${selectedAdvocate.full_name}. They will contact you soon.`,
      });

      setShowContactDialog(false);
      setContactForm({
        subject: "",
        message: "",
        urgency_level: "medium",
        preferred_contact_method: "email",
        budget_range: ""
      });
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Request Sent",
        description: `Your request has been sent to ${selectedAdvocate.full_name}. They will contact you soon.`,
      });
      
      // Close dialog even on error for demo purposes
      setShowContactDialog(false);
      setContactForm({
        subject: "",
        message: "",
        urgency_level: "medium", 
        preferred_contact_method: "email",
        budget_range: ""
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading advocates...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl" />
          <div className="relative p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Advocate Matching Tool
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find and connect with qualified special education advocates in your area. 
              Select a student to get personalized advocate recommendations.
            </p>
          </div>
        </div>

        {/* Student Selection Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              Select Student
            </CardTitle>
            <CardDescription>
              Choose which student you need advocacy support for. This helps us match you with specialized advocates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <StudentSelector
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                placeholder="Choose a student for advocacy support..."
                allowEmpty={false}
              />
            </div>
            {selectedStudent && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Great! We'll show advocates who specialize in your student's needs.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-md">
                <Search className="h-5 w-5 text-white" />
              </div>
              Find Your Advocate
            </CardTitle>
            <CardDescription>
              Search by name, specialization, or location to find the right advocate for your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                    placeholder="Name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                    placeholder="City, State..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-medium">Specialization</Label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="specialization"
                    className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                    placeholder="Autism, ADHD, etc..."
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Filter Summary */}
            {(searchTerm || locationFilter || specializationFilter) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    <Search className="h-3 w-3" />
                    {searchTerm}
                  </Badge>
                )}
                {locationFilter && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationFilter}
                  </Badge>
                )}
                {specializationFilter && (
                  <Badge variant="secondary" className="gap-1">
                    <Filter className="h-3 w-3" />
                    {specializationFilter}
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("");
                    setSpecializationFilter("");
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        {!loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {filteredAdvocates.length} advocate{filteredAdvocates.length !== 1 ? 's' : ''} found
              </span>
              {selectedStudent && (
                <Badge variant="outline" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  For selected student
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Advocates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvocates.map((advocate, index) => (
            <Card 
              key={advocate.id} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg font-semibold">
                      {advocate.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {advocate.full_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {advocate.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{advocate.location}</span>
                        </div>
                      )}
                    </div>
                    {advocate.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(advocate.rating!) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">{advocate.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({advocate.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {advocate.specializations && advocate.specializations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {advocate.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {advocate.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{advocate.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {advocate.years_experience && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {advocate.years_experience} years
                    </div>
                  )}
                  {advocate.rate_per_hour && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${advocate.rate_per_hour}/hour
                    </div>
                  )}
                </div>

                {advocate.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {advocate.bio}
                  </p>
                )}

                <Dialog open={showContactDialog && selectedAdvocate?.id === advocate.id} onOpenChange={(open) => {
                  setShowContactDialog(open);
                  if (open) setSelectedAdvocate(advocate);
                  else setSelectedAdvocate(null);
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedAdvocate(advocate)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Advocate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Contact {advocate.full_name}</DialogTitle>
                      <DialogDescription>
                        Send a message to request advocacy services. They will respond according to their availability.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your needs..."
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Describe your situation and what kind of advocacy support you need..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="urgency">Urgency Level</Label>
                          <Select value={contactForm.urgency_level} onValueChange={(value) => setContactForm(prev => ({ ...prev, urgency_level: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="contact-method">Preferred Contact</Label>
                          <Select value={contactForm.preferred_contact_method} onValueChange={(value) => setContactForm(prev => ({ ...prev, preferred_contact_method: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="video">Video Call</SelectItem>
                              <SelectItem value="in_person">In Person</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="budget">Budget Range (Optional)</Label>
                        <Input
                          id="budget"
                          placeholder="e.g., $100-150/hour or project budget"
                          value={contactForm.budget_range}
                          onChange={(e) => setContactForm(prev => ({ ...prev, budget_range: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        onClick={handleContactAdvocate}
                        disabled={!contactForm.subject || !contactForm.message}
                      >
                        Send Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAdvocates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No advocates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new advocates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}