import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  ArrowLeft,
  Key,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function FERPAOverview() {
  const { profile } = useAuth();
  const isAdvocateUser = profile?.role === 'advocate';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/parent/tools/smart-letter-generator">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tools
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                FERPA Overview
                {isAdvocateUser && (
                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                    Professional
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isAdvocateUser 
                  ? "Legal framework and advocacy strategies for educational records access"
                  : "Your rights to access and control your child's educational records"}
              </p>
            </div>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What is FERPA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  What is FERPA?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The Family Educational Rights and Privacy Act (FERPA) is a federal law that protects the privacy 
                  of student education records and gives parents specific rights regarding their child's educational information.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Right to Inspect
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Parents have the right to inspect and review their child's education records.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4 text-green-600" />
                      Right to Control
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Parents can control disclosure of their child's personally identifiable information.
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Types of Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Types of Educational Records You Can Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      category: "Academic Records",
                      items: [
                        "Report cards and transcripts",
                        "Standardized test scores",
                        "Class schedules and grades",
                        "Attendance records"
                      ]
                    },
                    {
                      category: "Special Education Records",
                      items: [
                        "IEP documents and evaluations",
                        "504 Plan documentation",
                        "Behavior intervention plans",
                        "Related service records"
                      ]
                    },
                    {
                      category: "Disciplinary Records",
                      items: [
                        "Suspension and expulsion records",
                        "Behavioral incident reports",
                        "Disciplinary action documentation",
                        "Safety and security records"
                      ]
                    },
                    {
                      category: "Health & Counseling Records",
                      items: [
                        "Health records maintained by school",
                        "Counseling session notes",
                        "Psychological evaluations",
                        "Medical accommodation records"
                      ]
                    }
                  ].map((category, index) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-semibold mb-3">{category.category}</h4>
                      <ul className="space-y-1">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How to Request Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  How to Request Records
                </CardTitle>
                <CardDescription>
                  Step-by-step process for requesting your child's educational records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Submit Written Request",
                      description: "Send a formal written request to the school or district. Include your child's name, your relationship, and specific records requested.",
                      action: "Use our FERPA Request Template"
                    },
                    {
                      step: "2",
                      title: "Wait for Response",
                      description: "Schools must respond within 45 days of receiving your request. They may charge reasonable fees for copies.",
                      action: "Track your request deadline"
                    },
                    {
                      step: "3",
                      title: "Review Records",
                      description: "You have the right to have someone explain the records and receive copies if needed for inspection.",
                      action: "Schedule review appointment"
                    },
                    {
                      step: "4",
                      title: "Request Corrections",
                      description: "If you find inaccurate information, you can request corrections through a formal process.",
                      action: "Submit correction request"
                    }
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <Button variant="outline" size="sm">
                          {step.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Limitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Important Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "Personal notes of teachers and staff (not shared with others) are not covered",
                    "Records of instructional, supervisory, and administrative personnel are generally not accessible",
                    "Employment records when student is an employee are not covered",
                    "Medical records may be reviewed only by appropriate professionals",
                    "Law enforcement records maintained separately may not be accessible"
                  ].map((limitation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/parent/tools/smart-letter-generator?template=ferpa-request">
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate FERPA Request
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Link href="/timeline-calculator">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Calculate Deadlines
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Key Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Key Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">School Response</span>
                    <Badge variant="outline">45 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hearing Request</span>
                    <Badge variant="outline">Reasonable time</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annual Directory Info</span>
                    <Badge variant="outline">Before disclosure</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Request */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sample Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="mb-2">
                    "I am writing to request copies of all educational records for my child, [Child's Name], 
                    DOB: [Date], Student ID: [ID#]."
                  </p>
                  <p>
                    "Please provide these records within the 45-day timeframe required by FERPA."
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  <Download className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
              </CardContent>
            </Card>

            {/* External Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Official Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  FERPA Federal Regulations
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Department of Education
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  FERPA Complaint Process
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}