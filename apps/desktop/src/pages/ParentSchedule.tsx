import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin, Plus, CalendarX, MessageCircle, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ParentSchedule() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real meetings data
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/meetings', {
          credentials: 'include',
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setMeetings(data || []);
        } else {
          console.error('Failed to fetch meetings:', response.status);
          setMeetings([]);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Filter for upcoming meetings only
  const today = new Date().toISOString().split('T')[0];
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.scheduled_date >= today && 
    (meeting.status === 'scheduled' || meeting.status === 'confirmed')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">View your meetings and appointments</p>
          </div>
          <Button onClick={() => navigate('/parent/schedule/request')} data-testid="button-request-meeting">
            <Plus className="h-4 w-4 mr-2" />
            Request Meeting
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
              
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
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/parent/meeting-prep')}
                          data-testid={`button-prep-${meeting.id}`}
                        >
                          Prepare
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-reschedule-${meeting.id}`}
                        >
                          Reschedule
                        </Button>
                        {meeting.advocate_id && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate('/parent/messages')}
                            data-testid={`button-message-${meeting.id}`}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Meetings</h3>
                  <p className="text-muted-foreground mb-4">Request a meeting with your advocate</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/parent/schedule/request')}
                    data-testid="button-request-first-meeting"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Meeting
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/meeting-prep')}
                  data-testid="button-quick-prep"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Meeting Preparation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/messages')}
                  data-testid="button-quick-messages"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Advocate
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/parent/tools/document-vault')}
                  data-testid="button-quick-documents"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Document Vault
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">This Month</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Meetings</span>
                  <span className="font-semibold">{meetings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>IEP Reviews</span>
                  <span className="font-semibold">
                    {meetings.filter(m => m.meeting_type === 'iep_review').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Consultations</span>
                  <span className="font-semibold">
                    {meetings.filter(m => m.meeting_type === 'consultation').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upcoming</span>
                  <span className="font-semibold">{upcomingMeetings.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}