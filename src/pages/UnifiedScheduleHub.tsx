import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  CalendarX, 
  MessageCircle, 
  FileText,
  Users,
  Target,
  BookOpen,
  Wand2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Settings
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface Meeting {
  id: string;
  title: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_type: string;
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  advocate_id?: string;
  client_id?: string;
}

interface TimelineDeadline {
  id: string;
  title: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  type: 'evaluation' | 'meeting' | 'response' | 'placement';
  student_id: string;
  imported_from_timeline: boolean;
}

export default function UnifiedScheduleHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const isAdvocate = profile?.role === 'advocate';
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [timelineDeadlines, setTimelineDeadlines] = useState<TimelineDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(false);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<'quick' | 'formal' | null>(null);

  // Form data for quick scheduling
  const [quickFormData, setQuickFormData] = useState({
    title: "",
    meeting_type: "",
    scheduled_date: "",
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
    priority: "normal" as 'low' | 'normal' | 'high' | 'urgent'
  });

  // Handle incoming timeline data from Timeline Calculator
  useEffect(() => {
    if (location.state?.newItem) {
      const newDeadline: TimelineDeadline = {
        id: `timeline-${Date.now()}`,
        title: location.state.newItem.title,
        date: location.state.newItem.dates[0]?.date || '',
        priority: location.state.newItem.dates[0]?.type === 'urgent' ? 'high' : 'medium',
        type: location.state.newItem.type || 'meeting',
        student_id: location.state.newItem.student_id || 'default',
        imported_from_timeline: true
      };
      
      setTimelineDeadlines(prev => [newDeadline, ...prev]);
      
      toast({
        title: "Timeline Added",
        description: "Timeline deadline has been added to your schedule.",
      });
      
      // Clear the state to prevent re-adding on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Fetch meetings and timeline data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsData, timelinesData] = await Promise.all([
          api.getMeetings(),
          // Fetch any timeline deadlines that were imported
          fetch('/api/timeline-deadlines', { 
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          }).then(res => res.ok ? res.json() : []).catch(() => [])
        ]);
        
        setMeetings(meetingsData || []);
        // Only set if we don't have timeline data from location state
        if (!location.state?.newItem) {
          setTimelineDeadlines(timelinesData || []);
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        toast({
          title: "Error",
          description: "Failed to load schedule data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, location.state]);

  // Filter for upcoming meetings and deadlines
  const today = new Date().toISOString().split('T')[0];
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.scheduled_date >= today && 
    (meeting.status === 'scheduled' || meeting.status === 'confirmed')
  );
  
  const upcomingDeadlines = timelineDeadlines.filter(deadline => 
    deadline.date >= today
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleWorkflowSelection = (workflow: 'quick' | 'formal') => {
    setSelectedWorkflow(workflow);
    setShowWorkflowSelector(false);
    
    if (workflow === 'quick') {
      setShowQuickSchedule(true);
    } else {
      // Navigate to Smart Letter Generator for formal requests
      navigate('/parent/tools/smart-letter-generator?type=meeting-request');
    }
  };

  const handleQuickSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = isAdvocate ? '/api/meetings' : '/api/meeting-requests';
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...quickFormData,
          status: isAdvocate ? 'scheduled' : 'pending',
          requested_by: user?.id,
          client_id: isAdvocate ? quickFormData.notes : undefined // Handle client selection for advocates
        })
      });

      if (response.ok) {
        toast({
          title: isAdvocate ? "Meeting Scheduled" : "Meeting Request Sent",
          description: isAdvocate 
            ? "Your meeting has been successfully scheduled."
            : "Your advocate will review your request and respond soon."
        });
        
        setShowQuickSchedule(false);
        setQuickFormData({
          title: "",
          meeting_type: "",
          scheduled_date: "",
          start_time: "",
          end_time: "",
          location: "",
          notes: "",
          priority: "normal"
        });
        
        // Refresh data
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error with meeting request:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Failed to process meeting request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setQuickFormData(prev => ({ ...prev, [field]: value }));
  };

  const navigateToMeetingPrep = (meetingId: string) => {
    navigate(`/parent/tools/meeting-prep?meeting=${meetingId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schedule Hub</h1>
            <p className="text-muted-foreground">
              {isAdvocate 
                ? "Manage your meetings and client appointments" 
                : "View your meetings, deadlines, and request new meetings"
              }
            </p>
          </div>
          
          {/* Smart Workflow Selector */}
          <Dialog open={showWorkflowSelector} onOpenChange={setShowWorkflowSelector}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-meeting">
                <Plus className="h-4 w-4 mr-2" />
                {isAdvocate ? "Schedule Meeting" : "Request Meeting"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>How would you like to proceed?</DialogTitle>
                <DialogDescription>
                  Choose the best approach for your meeting request
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start"
                  onClick={() => handleWorkflowSelection('quick')}
                  data-testid="button-quick-schedule"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">Quick Schedule</span>
                  </div>
                  <span className="text-sm text-muted-foreground text-left">
                    Fast scheduling for routine meetings and consultations
                  </span>
                </Button>
                
                {!isAdvocate && (
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 flex flex-col items-start"
                    onClick={() => handleWorkflowSelection('formal')}
                    data-testid="button-formal-request"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold">Formal Request Letter</span>
                    </div>
                    <span className="text-sm text-muted-foreground text-left">
                      Generate a professional letter for formal IEP meetings
                    </span>
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Schedule Dialog */}
        <Dialog open={showQuickSchedule} onOpenChange={setShowQuickSchedule}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isAdvocate ? "Schedule New Meeting" : "Request Meeting"}
              </DialogTitle>
              <DialogDescription>
                {isAdvocate 
                  ? "Schedule a meeting with your client"
                  : "Request a meeting with your advocate"
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleQuickSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={quickFormData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., IEP Review Meeting"
                    required
                    data-testid="input-title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meeting_type">Meeting Type</Label>
                  <Select 
                    value={quickFormData.meeting_type} 
                    onValueChange={(value) => handleInputChange('meeting_type', value)}
                  >
                    <SelectTrigger data-testid="select-meeting-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iep_review">IEP Review</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="504_meeting">504 Meeting</SelectItem>
                      <SelectItem value="progress_review">Progress Review</SelectItem>
                      <SelectItem value="initial_meeting">Initial Meeting</SelectItem>
                      <SelectItem value="strategy_session">Strategy Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={quickFormData.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    required
                    data-testid="input-date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={quickFormData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    required
                    data-testid="input-start-time"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={quickFormData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    required
                    data-testid="input-end-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={quickFormData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., School conference room or video call link"
                  data-testid="input-location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={quickFormData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional details, agenda items, or special requirements"
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowQuickSchedule(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit">
                  {isAdvocate ? "Schedule Meeting" : "Send Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : upcomingMeetings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <Badge variant={getStatusColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{meeting.scheduled_date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.start_time} - {meeting.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {meeting.meeting_type === "video_call" ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            <span>{meeting.location || 'TBD'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            {meeting.meeting_type?.replace('_', ' ') || 'Meeting'}
                          </Badge>
                        </div>
                        
                        {!isAdvocate && meeting.status === 'confirmed' && (
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigateToMeetingPrep(meeting.id)}
                              data-testid={`button-prep-${meeting.id}`}
                            >
                              <BookOpen className="h-4 w-4 mr-1" />
                              Prepare
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/parent/messaging?advocate=${meeting.advocate_id}`)}
                              data-testid={`button-message-${meeting.id}`}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <CalendarX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Meetings</h3>
                    <p className="text-muted-foreground mb-4">
                      {isAdvocate 
                        ? "Schedule a meeting with your clients"
                        : "Request a meeting with your advocate"
                      }
                    </p>
                    <Button onClick={() => setShowWorkflowSelector(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {isAdvocate ? "Schedule Meeting" : "Request Meeting"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline Deadlines */}
            {upcomingDeadlines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Important Deadlines
                    <Badge variant="secondary" className="ml-2">
                      Timeline Calculator
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Deadlines imported from your timeline calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${deadline.priority === 'high' ? 'bg-destructive' : deadline.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`} />
                          <div>
                            <p className="font-medium">{deadline.title}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{deadline.date}</span>
                              <Badge variant={getPriorityColor(deadline.priority)} className="text-xs">
                                {deadline.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/parent/tools/smart-letter-generator?type=deadline-response')}
                          data-testid={`button-respond-${deadline.id}`}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Generate Response
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/meeting-prep')}
                  data-testid="button-meeting-prep"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Meeting Preparation
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/messaging')}
                  data-testid="button-message-advocate"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Advocate
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/smart-letter-generator')}
                  data-testid="button-smart-letters"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Smart Letters
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/timeline-calculator')}
                  data-testid="button-timeline-calculator"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Timeline Calculator
                </Button>
              </CardContent>
            </Card>

            {/* This Month Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Meetings</span>
                  <span className="font-semibold">{meetings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="font-semibold text-green-600">
                    {meetings.filter(m => m.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-orange-600">
                    {meetings.filter(m => m.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Upcoming Deadlines</span>
                  <span className="font-semibold text-blue-600">{upcomingDeadlines.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}