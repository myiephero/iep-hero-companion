import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react";

const meetings = [
  {
    id: 1,
    title: "IEP Annual Review - Ava Peterson",
    date: "2024-01-15",
    time: "10:00 AM - 11:30 AM",
    type: "IEP Meeting",
    location: "Lincoln Elementary School",
    status: "confirmed",
    attendees: ["Jordan Peterson", "School Team", "Special Ed Coordinator"]
  },
  {
    id: 2,
    title: "Strategy Call - Liam Kelly",
    date: "2024-01-16",
    time: "2:00 PM - 3:00 PM",
    type: "Parent Consultation",
    location: "Video Call",
    status: "pending",
    attendees: ["Morgan Kelly"]
  },
  {
    id: 3,
    title: "504 Plan Review - Noah Rodriguez",
    date: "2024-01-18",
    time: "9:00 AM - 10:00 AM",
    type: "504 Meeting",
    location: "Washington Middle School",
    status: "confirmed",
    attendees: ["Pat Rodriguez", "School Counselor", "Teacher"]
  }
];

const upcomingTasks = [
  { task: "Prepare IEP draft for Ava", due: "Today", priority: "high" },
  { task: "Review evaluation for Liam", due: "Tomorrow", priority: "medium" },
  { task: "Send accommodation letter", due: "Jan 17", priority: "low" }
];

export default function AdvocateSchedule() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-muted-foreground">Manage your meetings and appointments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{meeting.title}</h3>
                      <Badge 
                        variant={meeting.status === 'confirmed' ? 'default' : 'secondary'}
                      >
                        {meeting.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{meeting.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {meeting.location === "Video Call" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span>{meeting.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        {meeting.type}
                      </Badge>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">
                        Attendees: {meeting.attendees.join(", ")}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="ghost" size="sm">Reschedule</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.task}</p>
                      <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                    </div>
                    <Badge 
                      variant={
                        task.priority === 'high' ? 'destructive' : 
                        task.priority === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">This Week</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Meetings</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>IEP Reviews</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Parent Calls</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours Scheduled</span>
                  <span className="font-semibold">12.5</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}