import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Download, FileText, Calendar, Plus, BookOpen, MessageSquare, Award, Users, HelpCircle, CheckCircle, Shield, Clock, Video, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Desktop meeting preparation interface
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
  const [checkedItems, setCheckedItems] = useState(new Set());
  const completedTasks = checkedItems.size;
  const progressPercentage = (completedTasks / checklistItems.length) * 100;

  // Fetch upcoming meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Desktop mock data
        const mockMeetings = [
          {
            id: '1',
            title: 'IEP Review Meeting',
            description: 'Annual IEP review',
            scheduled_date: '2024-03-15',
            location: 'School Conference Room',
            status: 'scheduled',
            meeting_type: 'iep',
            start_time: '10:00 AM',
            end_time: '11:30 AM'
          }
        ];
        setMeetings(mockMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleCheckboxChange = (itemId, checked) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meeting Preparation</h1>
            <p className="text-muted-foreground">Get ready for your upcoming IEP meeting</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Meeting
          </Button>
        </div>

        {/* Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meeting Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Meeting Overview</CardTitle>
                  <Badge variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    {meetings.length > 0 ? meetings[0].scheduled_date : 'No date set'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {meetings.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Meeting Title</p>
                      <p className="font-semibold">{meetings[0].title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold">{meetings[0].meeting_type?.toUpperCase() || 'IEP'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{meetings[0].location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold">{meetings[0].start_time} - {meetings[0].end_time}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 mb-6">
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
                )}

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Preparation Progress</span>
                    <span className="text-sm text-muted-foreground">{completedTasks}/{checklistItems.length} complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Preparation Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Preparation Checklist</CardTitle>
                <CardDescription>Essential steps to prepare for your meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors border">
                      <Checkbox 
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(item.id, checked)}
                        className="h-5 w-5"
                      />
                      <span className={`flex-1 ${checkedItems.has(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </span>
                      {checkedItems.has(item.id) && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Discussion Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Key Discussion Points</CardTitle>
                <CardDescription>Topics and concerns to address during the meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Discussion Points Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your concerns and goals for the meeting
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Discussion Point
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Documents</CardTitle>
                <CardDescription>Important documents for your meeting</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <Badge variant="secondary" className="text-xs">
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No documents uploaded</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
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
                          {meeting.start_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meeting.start_time}
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
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-3">No upcoming meetings</p>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Meeting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-3" />
                  Generate Questions List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  Request Advocate Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-3" />
                  Schedule Follow-up
                </Button>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Right to meaningful participation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Right to bring advocates/support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Right to request interpreters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Right to record meetings</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  📖 Full Rights Guide
                </Button>
              </CardContent>
            </Card>

            {/* Need Help? */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Get Hero Plan Support
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with Advocate
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Join Our Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}