import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    meeting_type: "",
    scheduled_date: "",
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
    client_id: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          status: 'scheduled'
        })
      });

      if (response.ok) {
        toast({
          title: "Meeting Scheduled",
          description: "Your meeting has been successfully scheduled."
        });
        navigate('/advocate/schedule');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Schedule Failed",
        description: error.message || "Failed to schedule meeting. Please try again.",
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
            onClick={() => navigate('/advocate/schedule')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Schedule Meeting</h1>
            <p className="text-muted-foreground">Schedule a new meeting with a family</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., IEP Review Meeting"
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
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="504_meeting">504 Meeting</SelectItem>
                        <SelectItem value="progress_review">Progress Review</SelectItem>
                        <SelectItem value="initial_meeting">Initial Meeting</SelectItem>
                        <SelectItem value="strategy_session">Strategy Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Date</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                      required
                      data-testid="input-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
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
                      value={formData.end_time}
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
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., School conference room, Zoom call, etc."
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Meeting Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any preparation notes or agenda items..."
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                    data-testid="button-schedule"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                        Scheduling...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule Meeting
                      </div>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/advocate/schedule')}
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