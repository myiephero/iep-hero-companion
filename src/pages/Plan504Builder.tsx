import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Scale, FileText, CheckCircle, AlertTriangle, Users } from "lucide-react";

export default function Plan504Builder() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">504 Plan Builder</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Section 504 accommodation planning with legal compliance and professional documentation.
          </p>
          <Badge className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground">
            504 Compliance
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                New 504 Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Plan</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Scale className="h-4 w-4 text-primary" />
                Compliance Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Verify</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Team Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Schedule</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-primary" />
                Review Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Review</Button>
            </CardContent>
          </Card>
        </div>

        {/* 504 Plan Components */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Disability Assessment
              </CardTitle>
              <CardDescription>
                Document qualifying disability and functional impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Disability documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Functional limitations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Academic impact analysis
                </li>
              </ul>
              <Button className="w-full">Start Assessment</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Accommodations
              </CardTitle>
              <CardDescription>
                Develop appropriate accommodations and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Academic accommodations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Testing modifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Environmental supports
                </li>
              </ul>
              <Button className="w-full" variant="outline">Build Accommodations</Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Legal Compliance
              </CardTitle>
              <CardDescription>
                Ensure plan meets Section 504 requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Section 504 compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  FAPE requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Due process rights
                </li>
              </ul>
              <Button className="w-full" variant="outline">Check Compliance</Button>
            </CardContent>
          </Card>
        </div>

        {/* Common Accommodations */}
        <Card>
          <CardHeader>
            <CardTitle>Common 504 Accommodations</CardTitle>
            <CardDescription>
              Frequently used accommodations by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Academic Support</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Extended time for assignments</li>
                  <li>• Modified homework load</li>
                  <li>• Alternative formats for materials</li>
                  <li>• Note-taking assistance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Testing Accommodations</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Extended testing time</li>
                  <li>• Separate testing room</li>
                  <li>• Alternative test formats</li>
                  <li>• Frequent breaks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Environmental</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Preferential seating</li>
                  <li>• Reduced distractions</li>
                  <li>• Access to quiet space</li>
                  <li>• Assistive technology</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Implementation Guidelines
            </CardTitle>
            <CardDescription>
              Key steps and timeline for 504 plan development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">1</div>
                <div>
                  <h4 className="font-semibold">Referral & Evaluation</h4>
                  <p className="text-sm text-muted-foreground">Request evaluation and gather documentation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-600">2</div>
                <div>
                  <h4 className="font-semibold">Eligibility Determination</h4>
                  <p className="text-sm text-muted-foreground">504 team reviews evaluation and determines eligibility</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">3</div>
                <div>
                  <h4 className="font-semibold">Plan Development</h4>
                  <p className="text-sm text-muted-foreground">Team develops appropriate accommodations and services</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">4</div>
                <div>
                  <h4 className="font-semibold">Implementation & Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Implement plan and monitor effectiveness regularly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}