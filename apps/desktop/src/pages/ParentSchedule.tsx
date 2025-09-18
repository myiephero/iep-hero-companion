import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  CalendarX, 
  MessageCircle, 
  FileText,
  ChevronRight,
  TrendingUp,
  Users,
  CheckCircle2,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                My Schedule
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                View your meetings and appointments with your advocate
              </p>
            </div>
            <Button variant="outline" size="lg" className="gap-2" data-testid="button-filter">
              <Filter className="h-5 w-5" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Quick Action Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Request Meeting
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Schedule time with your advocate
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/parent/schedule/request')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium"
                    data-testid="button-request-meeting"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Request Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Meetings Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Upcoming Meetings</CardTitle>
                    <CardDescription>Your scheduled appointments and consultations</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {upcomingMeetings.length} upcoming
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="space-y-4 text-center">
                      <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading meetings...</p>
                    </div>
                  </div>
                ) : upcomingMeetings.length > 0 ? (
                  <div className="space-y-6">
                    {upcomingMeetings.map((meeting) => (
                      <Card key={meeting.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 leading-tight">
                                  {meeting.title}
                                </h3>
                                <Badge 
                                  variant={meeting.status === 'confirmed' ? 'default' : 'secondary'}
                                  className={cn(
                                    "font-medium",
                                    meeting.status === 'confirmed' 
                                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                      : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                  )}
                                >
                                  {meeting.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Calendar className="h-5 w-5" />
                                  </div>
                                  <span className="font-medium">{meeting.scheduled_date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                  </div>
                                  <span className="font-medium">{meeting.start_time} - {meeting.end_time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    {meeting.meeting_type === "video_call" ? (
                                      <Video className="h-5 w-5" />
                                    ) : (
                                      <MapPin className="h-5 w-5" />
                                    )}
                                  </div>
                                  <span className="font-medium">{meeting.location || 'TBD'}</span>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                                  {meeting.meeting_type?.replace('_', ' ') || 'Meeting'}
                                </Badge>
                              </div>
                              
                              <div className="flex gap-3 pt-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => navigate('/parent/meeting-prep')}
                                  className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  data-testid={`button-prep-${meeting.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Prepare
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  data-testid={`button-reschedule-${meeting.id}`}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Reschedule
                                </Button>
                                {meeting.advocate_id && (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => navigate('/parent/messages')}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                    data-testid={`button-message-${meeting.id}`}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message
                                  </Button>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-6 w-6 text-gray-400 dark:text-gray-500 ml-4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="relative mb-8">
                      <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <CalendarX className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-4 max-w-md mx-auto">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        No Meetings Scheduled
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        Your calendar is clear. Ready to schedule your first meeting with your advocate?
                      </p>
                      <Button 
                        onClick={() => navigate('/parent/schedule/request')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
                        data-testid="button-request-first-meeting"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Request Your First Meeting
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Meeting Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-300" />
                      </div>
                      <span className="font-medium text-green-800 dark:text-green-200">Total</span>
                    </div>
                    <span className="text-2xl font-bold text-green-900 dark:text-green-100">{meetings.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">Upcoming</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">{upcomingMeetings.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                        <Video className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      </div>
                      <span className="font-medium text-purple-800 dark:text-purple-200">IEP Reviews</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {meetings.filter(m => m.meeting_type === 'iep_review').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Essential tools for parents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                  onClick={() => navigate('/parent/meeting-prep')}
                  data-testid="button-quick-prep"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Meeting Preparation</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Get ready for your next meeting</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                  onClick={() => navigate('/parent/messages')}
                  data-testid="button-quick-messages"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Message Advocate</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Chat with your advocate</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                  onClick={() => navigate('/parent/tools/document-vault')}
                  data-testid="button-quick-documents"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Document Vault</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Access your documents</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}