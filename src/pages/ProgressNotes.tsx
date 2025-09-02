import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Clock, FileText, User, Calendar, CheckCircle } from "lucide-react";

export default function ProgressNotes() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clipboard className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Progress Notes & Service Log</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tracking of service delivery, client interactions, and professional outcomes.
          </p>
          <Badge className="bg-success/10 text-success border-success/20">
            Tracking System
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                New Progress Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Note</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                Log Service Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Log Hours</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                Client Interaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Record</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                View Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Reports</Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Delivery Tracking</CardTitle>
              <CardDescription>
                Document and track all professional services provided
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Individual Advocacy Session</p>
                    <p className="text-xs text-muted-foreground">IEP Meeting Preparation</p>
                  </div>
                  <Badge variant="outline">2 hours</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Document Review</p>
                    <p className="text-xs text-muted-foreground">IEP Analysis & Recommendations</p>
                  </div>
                  <Badge variant="outline">1.5 hours</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Family Consultation</p>
                    <p className="text-xs text-muted-foreground">Strategy Planning Session</p>
                  </div>
                  <Badge variant="outline">1 hour</Badge>
                </div>
              </div>
              <Button className="w-full" variant="outline">View All Service Logs</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Documentation</CardTitle>
              <CardDescription>
                Professional progress notes and outcome tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Student Progress Review</h4>
                    <span className="text-xs text-muted-foreground">Jan 15, 2024</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Significant improvement in reading comprehension goals. Recommend adjusting targets for next quarter.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">IEP Meeting Outcome</h4>
                    <span className="text-xs text-muted-foreground">Jan 12, 2024</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Team agreed on new math goals. Services increased from 2 to 3 times per week.
                  </p>
                </div>
              </div>
              <Button className="w-full" variant="outline">View All Notes</Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Professional Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• IDEA compliance documentation</li>
                <li>• Professional ethical standards</li>
                <li>• Billing and timesheet integration</li>
                <li>• Confidentiality protection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Reporting Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Monthly service summaries</li>
                <li>• Progress outcome reports</li>
                <li>• Billing documentation</li>
                <li>• Professional portfolios</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}