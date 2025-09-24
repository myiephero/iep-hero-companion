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
import { AccountDeletion } from "@/components/AccountDeletion";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, User, Bell, Shield, Briefcase, Calendar, MapPin, Clock, DollarSign, GraduationCap, Star, X, CheckCircle } from "lucide-react";

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
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/advocates/profile');
      return response.json();
    }
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
                <div className="text-sm text-muted-foreground mb-3">
                  Select all areas where you have expertise (multiple selections allowed)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Autism Spectrum Disorders", "ADHD", "Learning Disabilities", "Intellectual Disabilities",
                    "Emotional/Behavioral Disorders", "Speech/Language Disorders", "Physical Disabilities",
                    "Gifted & Talented", "Twice Exceptional (2e)", "Transition Planning",
                    "Behavioral Interventions", "Assistive Technology"
                  ].map((spec) => {
                    const isSelected = profile.specializations?.includes(spec) || false;
                    return (
                      <label
                        key={spec}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-muted/50'
                          }
                        `}
                        data-testid={`checkbox-specialization-${spec.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (!profile.specializations?.includes(spec)) {
                                addItem('specializations', spec);
                              }
                            } else {
                              const index = profile.specializations?.indexOf(spec);
                              if (index !== undefined && index > -1) {
                                removeItem('specializations', index);
                              }
                            }
                          }}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium">{spec}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {profile.specializations && profile.specializations.length > 0 && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="text-sm font-medium text-primary mb-2">
                      Selected Specializations ({profile.specializations.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {spec}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeItem('specializations', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Case Types */}
              <div className="space-y-3">
                <Label>Case Types</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  What types of IEP cases do you handle? (select all that apply)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Initial IEP Development", "IEP Review & Updates", "Due Process Hearings", 
                    "Mediation", "Evaluation Disputes", "Placement Disputes", "Transition Planning",
                    "Behavioral Support Plans", "School District Negotiations"
                  ].map((type) => {
                    const isSelected = profile.case_types?.includes(type) || false;
                    return (
                      <label
                        key={type}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-secondary bg-secondary/5 text-secondary' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-secondary/50 hover:bg-muted/50'
                          }
                        `}
                        data-testid={`checkbox-case-type-${type.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (!profile.case_types?.includes(type)) {
                                addItem('case_types', type);
                              }
                            } else {
                              const index = profile.case_types?.indexOf(type);
                              if (index !== undefined && index > -1) {
                                removeItem('case_types', index);
                              }
                            }
                          }}
                          className="w-4 h-4 text-secondary rounded focus:ring-secondary"
                        />
                        <span className="text-sm font-medium">{type}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-secondary ml-auto" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {profile.case_types && profile.case_types.length > 0 && (
                  <div className="mt-4 p-3 bg-secondary/5 rounded-lg">
                    <div className="text-sm font-medium text-secondary mb-2">
                      Selected Case Types ({profile.case_types.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.case_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {type}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeItem('case_types', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Languages */}
              <div className="space-y-3">
                <Label>Languages Spoken</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  What languages can you communicate in with families?
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "English", "Spanish", "French", "German", "Chinese (Mandarin)", "ASL (American Sign Language)",
                    "Italian", "Portuguese", "Russian", "Japanese", "Korean", "Arabic"
                  ].map((lang) => {
                    const isSelected = profile.languages?.includes(lang) || false;
                    return (
                      <label
                        key={lang}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-accent bg-accent/5 text-accent' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-accent/50 hover:bg-muted/50'
                          }
                        `}
                        data-testid={`checkbox-language-${lang.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (!profile.languages?.includes(lang)) {
                                addItem('languages', lang);
                              }
                            } else {
                              const index = profile.languages?.indexOf(lang);
                              if (index !== undefined && index > -1) {
                                removeItem('languages', index);
                              }
                            }
                          }}
                          className="w-4 h-4 text-accent rounded focus:ring-accent"
                        />
                        <span className="text-sm font-medium">{lang}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-accent ml-auto" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {profile.languages && profile.languages.length > 0 && (
                  <div className="mt-4 p-3 bg-accent/5 rounded-lg">
                    <div className="text-sm font-medium text-accent mb-2">
                      Languages Spoken ({profile.languages.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, index) => (
                        <Badge key={index} variant="default" className="flex items-center gap-1">
                          {lang}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeItem('languages', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <Label>Certifications & Credentials</Label>
                <div className="text-sm text-muted-foreground mb-3">
                  Select your professional certifications and qualifications
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Licensed Attorney", "Educational Advocate Certification", "Special Education Certification",
                    "M.Ed. Special Education", "Behavior Analyst (BCBA)", "Speech-Language Pathologist",
                    "School Psychology", "Educational Leadership", "Disability Rights Law"
                  ].map((cert) => {
                    const isSelected = profile.certifications?.includes(cert) || false;
                    return (
                      <label
                        key={cert}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-muted/50'
                          }
                        `}
                        data-testid={`checkbox-certification-${cert.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (!profile.certifications?.includes(cert)) {
                                addItem('certifications', cert);
                              }
                            } else {
                              const index = profile.certifications?.indexOf(cert);
                              if (index !== undefined && index > -1) {
                                removeItem('certifications', index);
                              }
                            }
                          }}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium">{cert}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="text-sm font-medium text-primary mb-2">
                      Selected Certifications ({profile.certifications.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {cert}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeItem('certifications', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
              <AccountDeletion />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}