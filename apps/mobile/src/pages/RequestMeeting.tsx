import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, MessageCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function RequestMeeting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [advocates, setAdvocates] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    meeting_type: "",
    requested_date: "",
    preferred_time: "",
    meeting_format: "",
    advocate_id: "",
    notes: "",
    priority: "normal"
  });

  // Fetch available advocates
  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/advocate-clients', {
          credentials: 'include',
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdvocates(data || []);
        }
      } catch (error) {
        console.error('Error fetching advocates:', error);
      }
    };

    fetchAdvocates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/meeting-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          status: 'pending',
          requested_by: user?.id
        })
      });

      if (response.ok) {
        toast({
          title: "Meeting Request Sent",
          description: "Your advocate will review your request and respond soon."
        });
        navigate('/parent/schedule');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send meeting request');
      }
    } catch (error) {
      console.error('Error requesting meeting:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send meeting request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/parent/schedule')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Request Meeting</h1>
            <p className="text-muted-foreground">Request a meeting with your advocate</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Meeting Request Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Subject</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Discuss IEP goals for next semester"
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting_type">Meeting Type</Label>
                    <Select 
                      value={formData.meeting_type} 
                      onValueChange={(value) => handleInputChange('meeting_type', value)}
                    >
                      <SelectTrigger data-testid="select-meeting-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iep_review">IEP Review</SelectItem>
                        <SelectItem value="consultation">General Consultation</SelectItem>
                        <SelectItem value="504_meeting">504 Plan Meeting</SelectItem>
                        <SelectItem value="progress_review">Progress Review</SelectItem>
                        <SelectItem value="urgent_concern">Urgent Concern</SelectItem>
                        <SelectItem value="advocacy_support">Advocacy Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Routine discussion</SelectItem>
                        <SelectItem value="normal">Normal - Standard meeting</SelectItem>
                        <SelectItem value="high">High - Important issue</SelectItem>
                        <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requested_date">Preferred Date</Label>
                    <Input
                      id="requested_date"
                      type="date"
                      value={formData.requested_date}
                      onChange={(e) => handleInputChange('requested_date', e.target.value)}
                      required
                      data-testid="input-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_time">Preferred Time</Label>
                    <Select 
                      value={formData.preferred_time} 
                      onValueChange={(value) => handleInputChange('preferred_time', value)}
                    >
                      <SelectTrigger data-testid="select-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                        <SelectItem value="flexible">Flexible - Any time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_format">Meeting Format</Label>
                  <Select 
                    value={formData.meeting_format} 
                    onValueChange={(value) => handleInputChange('meeting_format', value)}
                  >
                    <SelectTrigger data-testid="select-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_call">Video Call (Zoom/Teams)</SelectItem>
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="school_meeting">At School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {advocates.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="advocate_id">Select Advocate</Label>
                    <Select 
                      value={formData.advocate_id} 
                      onValueChange={(value) => handleInputChange('advocate_id', value)}
                    >
                      <SelectTrigger data-testid="select-advocate">
                        <SelectValue placeholder="Select your advocate" />
                      </SelectTrigger>
                      <SelectContent>
                        {advocates.map((advocate) => (
                          <SelectItem key={advocate.advocate_id} value={advocate.advocate_id}>
                            {advocate.advocate_name || `Advocate ${advocate.advocate_id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Details</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Describe what you'd like to discuss, any concerns, questions, or specific topics..."
                    rows={4}
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                    data-testid="button-request"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                        Sending Request...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Send Meeting Request
                      </div>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/parent/schedule')}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}