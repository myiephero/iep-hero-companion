import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MessageSquare, Calendar, FileText, AlertTriangle } from "lucide-react";

export default function CommunicationTracker() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Phone className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Communication Tracker</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Monitor and document all parent-school communications with professional analysis and recommendations.
          </p>
          <Badge className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground">
            Monitor & Track
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                Log Phone Call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Record Call</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                Log Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Add Email</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Schedule Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Schedule</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                Generate Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Create</Button>
            </CardContent>
          </Card>
        </div>

        {/* Communication Log */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>
                Latest interactions with school personnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Call with Special Ed Teacher</p>
                      <span className="text-xs text-muted-foreground">Jan 15, 2:30 PM</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discussed reading progress and upcoming IEP meeting
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-green-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Email from Principal</p>
                      <span className="text-xs text-muted-foreground">Jan 14, 10:15 AM</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Response to concerns about behavior support plan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Follow-up Required</p>
                      <span className="text-xs text-muted-foreground">Due: Jan 16</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Waiting for response on accommodation request
                    </p>
                  </div>
                </div>
              </div>
              <Button className="w-full" variant="outline">View All Communications</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Analysis</CardTitle>
              <CardDescription>
                AI-powered insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Response Time Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    School typically responds to emails within 2-3 business days. Consider following up if no response after 4 days.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Communication Patterns</h4>
                  <p className="text-xs text-muted-foreground">
                    Best contact method: Email (85% response rate). Optimal timing: Tuesday-Thursday mornings.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Action Items</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Follow up on accommodation request</li>
                    <li>• Schedule IEP meeting (due in 3 weeks)</li>
                    <li>• Request progress data update</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                Smart Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs">
                <li>• Automatic follow-up reminders</li>
                <li>• Response time tracking</li>
                <li>• Communication preferences</li>
                <li>• Pattern recognition</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs">
                <li>• Legal compliance records</li>
                <li>• Timestamped communications</li>
                <li>• Professional summaries</li>
                <li>• Evidence collection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Planning Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs">
                <li>• Follow-up scheduling</li>
                <li>• Meeting coordination</li>
                <li>• Deadline tracking</li>
                <li>• Action item management</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}