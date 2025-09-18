import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
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
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Header */}
        <PremiumLargeHeader
          title="My Schedule"
          subtitle="View your meetings and appointments"
          rightAction={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Filter className="h-5 w-5" />
            </Button>
          }
        />

        <ContainerMobile padding="md" className="space-y-8 pb-32">
          {/* Premium Primary Action Section */}
          <div className="space-y-4">
            {/* Primary Action Button */}
            <PremiumCard variant="gradient" className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Request Meeting
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Schedule time with your advocate
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/parent/schedule/request')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
                  data-testid="button-request-meeting"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request
                </Button>
              </div>
            </PremiumCard>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <PremiumCard variant="elevated" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {meetings.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Meetings
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard variant="elevated" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {upcomingMeetings.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    This Week
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>

          {/* Upcoming Meetings Section */}
          <PremiumCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Upcoming Meetings
              </h2>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {upcomingMeetings.length} upcoming
              </Badge>
            </div>
              
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="space-y-4 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading meetings...</p>
                </div>
              </div>
            ) : upcomingMeetings.length > 0 ? (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <PremiumCard key={meeting.id} variant="interactive" className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-tight">
                            {meeting.title}
                          </h3>
                          <Badge 
                            variant={meeting.status === 'confirmed' ? 'default' : 'secondary'}
                            className={cn(
                              "ml-3 font-medium",
                              meeting.status === 'confirmed' 
                                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            )}
                          >
                            {meeting.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{meeting.scheduled_date}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Clock className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{meeting.start_time} - {meeting.end_time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {meeting.meeting_type === "video_call" ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
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
                            size="sm"
                            onClick={() => navigate('/parent/meeting-prep')}
                            className="flex-1 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                            data-testid={`button-prep-${meeting.id}`}
                          >
                            Prepare
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 h-11 hover:bg-gray-100 dark:hover:bg-gray-800"
                            data-testid={`button-reschedule-${meeting.id}`}
                          >
                            Reschedule
                          </Button>
                          {meeting.advocate_id && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate('/parent/messages')}
                              className="px-4 h-11 hover:bg-gray-100 dark:hover:bg-gray-800"
                              data-testid={`button-message-${meeting.id}`}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-2 ml-3" />
                    </div>
                  </PremiumCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <CalendarX className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-4 max-w-sm mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    No Meetings Scheduled
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    Your calendar is clear. Ready to schedule your first meeting with your advocate?
                  </p>
                  <Button 
                    onClick={() => navigate('/parent/schedule/request')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/25"
                    data-testid="button-request-first-meeting"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Request Your First Meeting
                  </Button>
                </div>
              </div>
            )}
          </PremiumCard>

          {/* Premium Quick Actions Section */}
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Essential tools for parents
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                onClick={() => navigate('/parent/meeting-prep')}
                data-testid="button-quick-prep"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Meeting Preparation</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Get ready for your next meeting</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                onClick={() => navigate('/parent/messages')}
                data-testid="button-quick-messages"
              >
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                  <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Message Advocate</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Chat with your advocate</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                onClick={() => navigate('/parent/tools/document-vault')}
                data-testid="button-quick-documents"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Document Vault</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Access your documents</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </PremiumCard>

          {/* Premium Monthly Insights */}
          <PremiumCard variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Monthly Insights
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your meeting analytics this month
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Meetings</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{meetings.length}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">IEP Reviews</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {meetings.filter(m => m.meeting_type === 'iep_review').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Consultations</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {meetings.filter(m => m.meeting_type === 'consultation').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">Upcoming</span>
                </div>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{upcomingMeetings.length}</span>
              </div>
            </div>
          </PremiumCard>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}