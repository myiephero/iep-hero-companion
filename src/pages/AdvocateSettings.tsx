import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, User, Bell, Shield, Briefcase, Calendar, MapPin, Clock, DollarSign, GraduationCap, Star, X } from "lucide-react";

interface AdvocateProfile {
  bio?: string;
  location?: string;
  specializations?: string[];
  certifications?: string[];
  education?: string;
  years_experience?: number;
  languages?: string[];
  case_types?: string[];
  rate_per_hour?: number;
  availability?: string;
}

export default function AdvocateSettings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Profile state
  const [profile, setProfile] = useState<AdvocateProfile>({
    bio: '',
    location: '',
    specializations: [],
    certifications: [],
    education: '',
    years_experience: 0,
    languages: [],
    case_types: [],
    rate_per_hour: 150,
    availability: 'weekdays'
  });

  const [openDropdowns, setOpenDropdowns] = useState({
    specializations: false,
    case_types: false,
    languages: false,
    certifications: false
  });
  
  // Load existing profile
  const { data: existingProfile } = useQuery({
    queryKey: ['/api/advocates/profile', user?.id],
    enabled: !!user?.id
  });
  
  useEffect(() => {
    if (existingProfile) {
      setProfile({
        bio: existingProfile.bio || '',
        location: existingProfile.location || '',
        specializations: existingProfile.specializations || [],
        certifications: existingProfile.certifications || [],
        education: existingProfile.education || '',
        years_experience: existingProfile.years_experience || 0,
        languages: existingProfile.languages || [],
        case_types: existingProfile.case_types || [],
        rate_per_hour: existingProfile.rate_per_hour || 150,
        availability: existingProfile.availability || 'weekdays'
      });
    }
  }, [existingProfile]);
  
  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: AdvocateProfile) => {
      const response = await apiRequest('PUT', '/api/advocates/profile', profileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your professional profile has been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advocates/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSaveProfile = () => {
    saveProfileMutation.mutate(profile);
  };
  
  // Helper functions for managing arrays
  const addItem = (field: keyof AdvocateProfile, value: string) => {
    if (Array.isArray(profile[field]) && value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };
  
  const removeItem = (field: keyof AdvocateProfile, index: number) => {
    if (Array.isArray(profile[field])) {
      setProfile(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your advocate account settings and professional preferences
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Professional Bio Section */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Professional Bio
              </CardTitle>
              <CardDescription>
                Tell parents about your experience and approach to IEP advocacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Share your experience, philosophy, and what makes you unique as an IEP advocate..."
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[120px]"
                  data-testid="textarea-bio"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="City, State"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    data-testid="input-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input 
                    id="education" 
                    placeholder="Your highest degree or relevant education"
                    value={profile.education}
                    onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                    data-testid="input-education"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input 
                    id="experience" 
                    type="number" 
                    min="0"
                    max="50"
                    placeholder="Years in IEP advocacy"
                    value={profile.years_experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                    data-testid="input-experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input 
                    id="hourlyRate" 
                    type="number" 
                    min="0"
                    step="25"
                    placeholder="150"
                    value={profile.rate_per_hour}
                    onChange={(e) => setProfile(prev => ({ ...prev, rate_per_hour: parseInt(e.target.value) || 0 }))}
                    data-testid="input-hourly-rate"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select value={profile.availability} onValueChange={(value) => setProfile(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger data-testid="select-availability">
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                    <SelectItem value="evenings">Evenings & Weekends</SelectItem>
                    <SelectItem value="flexible">Flexible Schedule</SelectItem>
                    <SelectItem value="emergency">Emergency Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Specializations Section */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Specializations & Expertise
              </CardTitle>
              <CardDescription>
                What areas of special education do you specialize in?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Specializations */}
              <div className="space-y-3">
                <Label>Specializations</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.specializations?.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {spec}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('specializations', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select open={openDropdowns.specializations} onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, specializations: open }))}>
                  <SelectTrigger data-testid="select-specializations">
                    <SelectValue placeholder="Add specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Autism Spectrum Disorders", "ADHD", "Learning Disabilities", "Intellectual Disabilities",
                      "Emotional/Behavioral Disorders", "Speech/Language Disorders", "Physical Disabilities",
                      "Gifted & Talented", "Twice Exceptional (2e)", "Transition Planning",
                      "Behavioral Interventions", "Assistive Technology"
                    ].map((spec) => (
                      <SelectItem 
                        key={spec} 
                        value={spec}
                        onSelect={(e) => {
                          e.preventDefault();
                          if (!profile.specializations?.includes(spec)) {
                            addItem('specializations', spec);
                          }
                        }}
                        className={`flex items-center gap-2 ${profile.specializations?.includes(spec) ? 'bg-primary/10' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={profile.specializations?.includes(spec) || false}
                          onChange={() => {}}
                          className="rounded"
                        />
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Case Types */}
              <div className="space-y-3">
                <Label>Case Types</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.case_types?.map((type, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {type}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('case_types', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select open={openDropdowns.case_types} onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, case_types: open }))}>
                  <SelectTrigger data-testid="select-case-types">
                    <SelectValue placeholder="Add case types" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Initial IEP Development", "IEP Review & Updates", "Due Process Hearings", 
                      "Mediation", "Evaluation Disputes", "Placement Disputes", "Transition Planning",
                      "Behavioral Support Plans", "School District Negotiations"
                    ].map((type) => (
                      <SelectItem 
                        key={type} 
                        value={type}
                        onSelect={(e) => {
                          e.preventDefault();
                          if (!profile.case_types?.includes(type)) {
                            addItem('case_types', type);
                          }
                        }}
                        className={`flex items-center gap-2 ${profile.case_types?.includes(type) ? 'bg-primary/10' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={profile.case_types?.includes(type) || false}
                          onChange={() => {}}
                          className="rounded"
                        />
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Languages */}
              <div className="space-y-3">
                <Label>Languages Spoken</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.languages?.map((lang, index) => (
                    <Badge key={index} variant="default" className="flex items-center gap-1">
                      {lang}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('languages', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select open={openDropdowns.languages} onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, languages: open }))}>
                  <SelectTrigger data-testid="select-languages">
                    <SelectValue placeholder="Add languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "English", "Spanish", "French", "German", "Chinese (Mandarin)", "ASL (American Sign Language)"
                    ].map((lang) => (
                      <SelectItem 
                        key={lang} 
                        value={lang}
                        onSelect={(e) => {
                          e.preventDefault();
                          if (!profile.languages?.includes(lang)) {
                            addItem('languages', lang);
                          }
                        }}
                        className={`flex items-center gap-2 ${profile.languages?.includes(lang) ? 'bg-primary/10' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={profile.languages?.includes(lang) || false}
                          onChange={() => {}}
                          className="rounded"
                        />
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <Label>Certifications & Credentials</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.certifications?.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('certifications', index)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select open={openDropdowns.certifications} onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, certifications: open }))}>
                  <SelectTrigger data-testid="select-certifications">
                    <SelectValue placeholder="Add certifications" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Licensed Attorney", "Educational Advocate Certification", "Special Education Certification",
                      "M.Ed. Special Education", "Behavior Analyst (BCBA)", "Speech-Language Pathologist"
                    ].map((cert) => (
                      <SelectItem 
                        key={cert} 
                        value={cert}
                        onSelect={(e) => {
                          e.preventDefault();
                          if (!profile.certifications?.includes(cert)) {
                            addItem('certifications', cert);
                          }
                        }}
                        className={`flex items-center gap-2 ${profile.certifications?.includes(cert) ? 'bg-primary/10' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={profile.certifications?.includes(cert) || false}
                          onChange={() => {}}
                          className="rounded"
                        />
                        {cert}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleSaveProfile}
                disabled={saveProfileMutation.isPending}
                className="w-full button-premium"
                data-testid="button-save-professional-profile"
              >
                {saveProfileMutation.isPending ? 'Saving...' : 'Save Professional Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive client and case updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch data-testid="switch-email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>New Client Requests</Label>
                  <p className="text-sm text-muted-foreground">Get notified when parents request your services</p>
                </div>
                <Switch data-testid="switch-client-requests" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Case Updates</Label>
                  <p className="text-sm text-muted-foreground">Notifications for case progress and deadlines</p>
                </div>
                <Switch data-testid="switch-case-updates" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Meeting Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded before IEP meetings</p>
                </div>
                <Switch data-testid="switch-meeting-reminders" />
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={toggleTheme}
                  data-testid="switch-dark-mode"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Settings
              </CardTitle>
              <CardDescription>
                Set your availability for client meetings and consultations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working Hours</Label>
                  <Input id="workingHours" placeholder="9:00 AM - 5:00 PM" data-testid="input-working-hours" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Input id="timezone" placeholder="Eastern Time (ET)" data-testid="input-timezone" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Weekend Availability</Label>
                  <p className="text-sm text-muted-foreground">Accept meetings on weekends</p>
                </div>
                <Switch data-testid="switch-weekend-availability" />
              </div>
              <Button variant="outline" data-testid="button-save-availability">
                Update Availability
              </Button>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" data-testid="button-change-password">
                Change Password
              </Button>
              <Button variant="outline" data-testid="button-two-factor">
                Enable Two-Factor Authentication
              </Button>
              <Separator />
              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <Button variant="destructive" data-testid="button-delete-account">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}