import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  GraduationCap, 
  Award, 
  CheckCircle,
  MessageCircle,
  Video,
  Phone,
  Mail,
  Filter,
  Sliders,
  Heart,
  ThumbsUp,
  Quote,
  Shield,
  DollarSign,
  Languages,
  Target,
  BookOpen,
  Briefcase,
  TrendingUp,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Crown,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdvocateDiscovery = () => {
  const { toast } = useToast();
  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    specialty: "",
    experience: "",
    availability: "",
    rate: "",
    language: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [showMatchWizard, setShowMatchWizard] = useState(false);

  const advocates = [
    {
      id: 1,
      name: "Dr. Amanda Chen",
      title: "Special Education Attorney & Advocate",
      location: "Springfield, IL",
      distance: "2.3 miles",
      rating: 4.9,
      reviews: 147,
      experience: 15,
      hourlyRate: 125,
      availability: "Available Today",
      specialties: ["Autism Spectrum", "Learning Disabilities", "IEP Compliance", "Due Process"],
      languages: ["English", "Mandarin"],
      bio: "Dr. Chen specializes in autism advocacy and IEP compliance. She has successfully helped over 500 families secure appropriate educational services.",
      credentials: ["JD Stanford Law", "MEd Special Education", "Certified IEP Advocate"],
      successRate: 96,
      avatar: "/placeholder-advocate1.jpg",
      initials: "AC",
      featured: true,
      heroPartner: true,
      responseTime: "< 2 hours",
      consultationType: ["Phone", "Video", "In-Person"],
      recentSuccess: "Secured 1:1 aide for non-verbal student",
      caseTypes: ["IEP Meetings", "504 Plans", "Dispute Resolution", "Transition Planning"]
    },
    {
      id: 2,
      name: "Robert Martinez",
      title: "IEP Compliance Specialist",
      location: "Springfield, IL", 
      distance: "4.1 miles",
      rating: 5.0,
      reviews: 203,
      experience: 12,
      hourlyRate: 150,
      availability: "Next Week",
      specialties: ["IEP Compliance", "Behavioral Support", "ADHD", "Executive Function"],
      languages: ["English", "Spanish"],
      bio: "Former special education director with extensive experience in IEP development and compliance. Known for collaborative approach.",
      credentials: ["MEd Administration", "Certified Behavior Analyst", "IEP Compliance Specialist"],
      successRate: 98,
      avatar: "/placeholder-advocate2.jpg",
      initials: "RM",
      featured: false,
      heroPartner: true,
      responseTime: "< 4 hours",
      consultationType: ["Phone", "Video"],
      recentSuccess: "Increased speech therapy from 1x to 3x weekly",
      caseTypes: ["Annual Reviews", "Behavioral Plans", "Service Increases"]
    },
    {
      id: 3,
      name: "Sarah Johnson",
      title: "Parent Advocate & Trainer",
      location: "Nearby County",
      distance: "12.8 miles",
      rating: 4.8,
      reviews: 89,
      experience: 8,
      hourlyRate: 95,
      availability: "Tomorrow",
      specialties: ["Dyslexia", "Reading Disabilities", "Parent Training", "Self-Advocacy"],
      languages: ["English"],
      bio: "Parent of two children with learning disabilities. Passionate about empowering other parents through education and advocacy training.",
      credentials: ["BS Psychology", "Certified Parent Advocate", "Dyslexia Specialist"],
      successRate: 92,
      avatar: "/placeholder-advocate3.jpg", 
      initials: "SJ",
      featured: false,
      heroPartner: false,
      responseTime: "< 6 hours",
      consultationType: ["Phone", "Video", "In-Person"],
      recentSuccess: "Implemented reading intervention program",
      caseTypes: ["Reading Support", "Parent Training", "Educational Planning"]
    },
    {
      id: 4,
      name: "Michael Thompson",
      title: "Transition Specialist",
      location: "Downtown Springfield",
      distance: "8.5 miles",
      rating: 4.7,
      reviews: 156,
      experience: 20,
      hourlyRate: 140,
      availability: "This Week",
      specialties: ["Transition Planning", "Post-Secondary", "Employment", "Independent Living"],
      languages: ["English"],
      bio: "Specializes in transition planning for students 14-22. Helps families navigate post-secondary education and employment options.",
      credentials: ["MEd Transition Services", "Certified Transition Specialist", "VR Counselor"],
      successRate: 94,
      avatar: "/placeholder-advocate4.jpg",
      initials: "MT", 
      featured: false,
      heroPartner: true,
      responseTime: "< 8 hours",
      consultationType: ["Phone", "Video", "In-Person"],
      recentSuccess: "Secured college accommodations and supports",
      caseTypes: ["Transition Planning", "College Prep", "Employment Services"]
    }
  ];

  const testimonials = [
    {
      advocate: "Dr. Amanda Chen",
      parent: "Jennifer M.",
      text: "Dr. Chen helped us get the autism supports my son needed. Her expertise was invaluable during our IEP meeting.",
      rating: 5,
      outcome: "Secured comprehensive autism program"
    },
    {
      advocate: "Robert Martinez",
      parent: "Carlos R.",
      text: "Robert's knowledge of IEP compliance caught errors that would have hurt my daughter's education.",
      rating: 5,
      outcome: "Fixed non-compliant IEP goals"
    }
  ];

  const filterOptions = {
    specialty: [
      "Autism Spectrum Disorders",
      "Learning Disabilities", 
      "ADHD/Executive Function",
      "Behavioral Support",
      "Intellectual Disabilities",
      "Speech/Language",
      "Transition Planning",
      "Gifted Education",
      "504 Plans",
      "Due Process/Legal"
    ],
    experience: [
      "0-2 years",
      "3-5 years", 
      "6-10 years",
      "11-15 years",
      "16+ years"
    ],
    availability: [
      "Available Today",
      "Available This Week",
      "Available Next Week",
      "Available This Month"
    ],
    rate: [
      "Under $100/hour",
      "$100-125/hour",
      "$126-150/hour", 
      "$151-200/hour",
      "Over $200/hour"
    ],
    language: [
      "English",
      "Spanish",
      "Mandarin",
      "French",
      "ASL"
    ]
  };

  const matchingQuestions = [
    {
      id: "student-age",
      type: "select",
      label: "Student's Age",
      options: ["3-5", "6-8", "9-11", "12-14", "15-18", "19-22"]
    },
    {
      id: "primary-disability",
      type: "select", 
      label: "Primary Disability Category",
      options: ["Autism", "Learning Disability", "ADHD", "Intellectual Disability", "Multiple Disabilities", "Speech/Language", "Other"]
    },
    {
      id: "main-concerns",
      type: "checkbox-group",
      label: "Main Areas of Concern",
      options: ["Academic Progress", "Behavioral Issues", "Social Skills", "Communication", "Transition Planning", "Service Adequacy", "Placement Issues"]
    },
    {
      id: "meeting-type",
      type: "select",
      label: "Upcoming Meeting Type",
      options: ["Annual IEP Review", "Initial IEP", "IEP Amendment", "504 Plan", "Dispute Resolution", "Evaluation Planning"]
    },
    {
      id: "urgency",
      type: "select",
      label: "How urgent is your need?",
      options: ["Immediate (within days)", "Soon (within 2 weeks)", "Planning ahead (within month)", "Not urgent"]
    }
  ];

  const requestIntroCall = (advocate) => {
    toast({
      title: "Intro Call Requested",
      description: `We've sent your request to ${advocate.name}. You'll hear back within ${advocate.responseTime}.`
    });
  };

  const startMatching = () => {
    setShowMatchWizard(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Find Your Advocate</h1>
            <p className="text-muted-foreground">
              Connect with certified special education advocates in your area
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={startMatching}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Matching
            </Button>
            <Button asChild>
              <Link to="/parent-hero-plan">
                <Crown className="h-4 w-4 mr-2" />
                Get Hero Plan
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">47</div>
                <div className="text-sm text-muted-foreground">Certified Advocates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">&lt; 24hr</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Search by Name</Label>
                  <Input
                    placeholder="Search advocates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Location Radius</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Within 25 miles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Within 5 miles</SelectItem>
                      <SelectItem value="10">Within 10 miles</SelectItem>
                      <SelectItem value="25">Within 25 miles</SelectItem>
                      <SelectItem value="50">Within 50 miles</SelectItem>
                      <SelectItem value="virtual">Virtual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Specialty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.specialty.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Experience Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.experience.map((exp) => (
                        <SelectItem key={exp} value={exp}>
                          {exp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Availability</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any availability" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.availability.map((avail) => (
                        <SelectItem key={avail} value={avail}>
                          {avail}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Hourly Rate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.rate.map((rate) => (
                        <SelectItem key={rate} value={rate}>
                          {rate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Languages</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any language" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.language.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Advocate Listings */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Featured Advocates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Featured Advocates</h2>
                  <Badge variant="secondary">Hero Plan Partners</Badge>
                </div>
                
                {advocates.filter(advocate => advocate.featured).map((advocate) => (
                  <Card key={advocate.id} className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={advocate.avatar} />
                          <AvatarFallback className="text-lg">{advocate.initials}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold flex items-center gap-2">
                                {advocate.name}
                                {advocate.heroPartner && (
                                  <Badge variant="default" className="bg-primary/10 text-primary">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Hero Partner
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-muted-foreground">{advocate.title}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{advocate.rating}</span>
                                <span className="text-sm text-muted-foreground">({advocate.reviews})</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{advocate.experience} years exp</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{advocate.distance}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">${advocate.hourlyRate}/hr</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{advocate.availability}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{advocate.successRate}% success</span>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3">{advocate.bio}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {advocate.specialties.slice(0, 4).map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {advocate.specialties.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{advocate.specialties.length - 4} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={() => requestIntroCall(advocate)}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Request Intro Call
                            </Button>
                            <Button variant="outline">
                              <UserCheck className="h-4 w-4 mr-2" />
                              View Full Profile
                            </Button>
                            <Button variant="outline">
                              <Heart className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* All Advocates */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Advocates</h2>
                
                {advocates.filter(advocate => !advocate.featured).map((advocate) => (
                  <Card key={advocate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={advocate.avatar} />
                          <AvatarFallback>{advocate.initials}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                {advocate.name}
                                {advocate.heroPartner && (
                                  <Badge variant="secondary">Hero Partner</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">{advocate.title}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{advocate.rating}</span>
                                <span className="text-sm text-muted-foreground">({advocate.reviews})</span>
                              </div>
                              <p className="text-sm text-muted-foreground">${advocate.hourlyRate}/hr</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {advocate.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {advocate.availability}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {advocate.responseTime}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {advocate.specialties.slice(0, 3).map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => requestIntroCall(advocate)}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Load More */}
              <div className="text-center py-6">
                <Button variant="outline">
                  Load More Advocates
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5" />
              Recent Success Stories
            </CardTitle>
            <CardDescription>
              Real outcomes from families who found their perfect advocate match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="font-medium text-sm">{testimonial.parent}</span>
                  </div>
                  <p className="text-sm mb-2">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Worked with {testimonial.advocate}</span>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {testimonial.outcome}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdvocateDiscovery;