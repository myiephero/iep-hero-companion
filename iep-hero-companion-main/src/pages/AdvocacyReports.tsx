import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, BarChart3, Target, Calendar, CheckCircle } from "lucide-react";

export default function AdvocacyReports() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Advocacy Reports</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate comprehensive client reports with professional analysis and actionable recommendations.
          </p>
          <Badge className="bg-gradient-to-r from-accent to-accent-light text-accent-foreground">
            Professional Reports
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                Progress Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Generate</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-primary" />
                Analytics Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Create</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                Goal Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Generate</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4 text-primary" />
                Export Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Export</Button>
            </CardContent>
          </Card>
        </div>

        {/* Report Templates */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Client Progress Report
              </CardTitle>
              <CardDescription>
                Comprehensive progress analysis with professional recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Goal progress analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Professional recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Action plan development
                </li>
              </ul>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Service Summary
              </CardTitle>
              <CardDescription>
                Professional service delivery documentation and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Service hours tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Outcome measurements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Billing documentation
                </li>
              </ul>
              <Button className="w-full" variant="outline">Create Summary</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                IEP Meeting Summary
              </CardTitle>
              <CardDescription>
                Meeting outcomes and follow-up action items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Meeting minutes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Decision tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Follow-up actions
                </li>
              </ul>
              <Button className="w-full" variant="outline">Generate Summary</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Your recently generated professional reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Student Progress Report - Sarah M.</h4>
                  <p className="text-xs text-muted-foreground">Generated Jan 15, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">IEP Meeting Summary - Alex T.</h4>
                  <p className="text-xs text-muted-foreground">Generated Jan 12, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Service Summary - Quarter 2</h4>
                  <p className="text-xs text-muted-foreground">Generated Jan 10, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}