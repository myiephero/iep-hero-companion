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
import { Search, MapPin, Star, Clock, DollarSign, MessageSquare, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      const { data, error } = await supabase
        .from('advocates')
        .select('*')
        .eq('status', 'active')
        .eq('verification_status', 'verified')
        .order('rating', { ascending: false });

      if (error) throw error;
      setAdvocates(data || []);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('advocate_requests')
        .insert({
          parent_id: user.id,
          advocate_id: selectedAdvocate.user_id,
          subject: contactForm.subject,
          message: contactForm.message,
          urgency_level: contactForm.urgency_level,
          preferred_contact_method: contactForm.preferred_contact_method,
          budget_range: contactForm.budget_range || null
        });

      if (error) throw error;

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
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Advocate Matching Tool</h1>
          <p className="text-muted-foreground">
            Find and connect with qualified special education advocates in your area.
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Advocate
            </CardTitle>
            <CardDescription>
              Search by name, specialization, or location to find the right advocate for your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="Autism, ADHD, etc..."
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advocates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvocates.map((advocate) => (
            <Card key={advocate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {advocate.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{advocate.full_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {advocate.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {advocate.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {advocate.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{advocate.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({advocate.total_reviews} reviews)
                    </span>
                  </div>
                )}
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