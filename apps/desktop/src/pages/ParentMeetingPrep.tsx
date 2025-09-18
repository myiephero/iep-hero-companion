import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressSteps } from "@/components/ProgressSteps";
import { CheckCircle2, Circle, Download, FileText, Calendar, Plus, BookOpen, MessageSquare, Award, Users, HelpCircle, CheckCircle, Shield, Clock, Video, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// These would be fetched from the API based on the selected meeting/student
const checklistItems = [
  { id: 1, task: "Review current IEP goals and progress", completed: false },
  { id: 2, task: "Gather recent evaluation reports", completed: false },
  { id: 3, task: "List questions and concerns", completed: false },
  { id: 4, task: "Prepare examples of challenges at home", completed: false },
  { id: 5, task: "Review proposed accommodations", completed: false },
  { id: 6, task: "Confirm meeting attendance", completed: false }
];

const documents = [];

export default function ParentMeetingPrep() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const completedTasks = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedTasks / checklistItems.length) * 100;

  // Fetch upcoming meetings
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
          // Filter for upcoming meetings
          const today = new Date().toISOString().split('T')[0];
          const upcomingMeetings = (data || []).filter(meeting => 
            meeting.scheduled_date >= today && 
            (meeting.status === 'scheduled' || meeting.status === 'confirmed')
          );
          setMeetings(upcomingMeetings);
        } else {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meeting Preparation</h1>
          <p className="text-muted-foreground">Get ready for your upcoming IEP meeting</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Meeting Overview</h2>
                <Badge variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  No date set
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-semibold">Select a student</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meeting Type</p>
                  <p className="font-semibold">Select meeting type</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">School</p>
                  <p className="font-semibold">TBD</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">Not scheduled</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Preparation Progress</span>
                  <span className="text-sm text-muted-foreground">{completedTasks}/{checklistItems.length} complete</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preparation Checklist</h3>
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      checked={item.completed}
                      className="h-5 w-5"
                    />
                    <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.task}
                    </span>
                    {item.completed && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Discussion Points</h3>
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  <p className="text-sm">No discussion points prepared yet</p>
                  <p className="text-xs mt-1">Add your concerns and goals for the meeting</p>
                </div>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Discussion Point
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documents</h3>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        doc.status === 'uploaded' ? 'default' : 
                        doc.status === 'generated' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : meetings.length > 0 ? (
                <div className="space-y-3">
                  {meetings.slice(0, 3).map((meeting, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{meeting.title || 'IEP Meeting'}</h4>
                        <Badge variant={meeting.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(meeting.scheduled_date).toLocaleDateString()}
                        </div>
                        {meeting.scheduled_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.scheduled_time}
                          </div>
                        )}
                        {meeting.meeting_type === 'video' && (
                          <div className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Virtual
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {meetings.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">+{meetings.length - 3} more meetings</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No upcoming meetings</p>
                  <Link to="/parent/schedule/request">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Meeting
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Generate Questions List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Request Advocate Support
                </Button>
                <Link to="/parent/schedule/request">
                  <Button variant="outline" className="w-full justify-start">
                    Schedule Follow-up
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Meeting Tips</h3>
              <div className="space-y-2 text-sm">
                <p>✓ Arrive 10 minutes early</p>
                <p>✓ Bring a notebook for notes</p>
                <p>✓ Ask for clarification if needed</p>
                <p>✓ Request a copy of the final IEP</p>
                <p>✓ Don't sign if you need time to review</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Rights
              </h3>
              <div className="text-sm space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>Right to meaningful participation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>Right to bring advocates/support</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>Right to request interpreters</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>Right to record meetings</span>
                </div>
              </div>
              <Link to="/parent/tools/idea-rights-guide">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 text-blue-900 font-medium shadow-sm transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                  📖 Full Rights Guide
                </Button>
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Need Help?
              </h3>
              <div className="space-y-2">
                <a href="mailto:info@myiephero.com">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Get Hero Plan Support
                  </Button>
                </a>
                <Link to="/parent/matching">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with Advocate
                  </Button>
                </Link>
                <a href="https://www.facebook.com/myiephero" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Join Our Community
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}