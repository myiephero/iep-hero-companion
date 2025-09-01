import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Scale,
  Clock,
  Download,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function IDEARightsGuide() {
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
                <BookOpen className="h-8 w-8 text-primary" />
                IDEA Rights Guide
                {isAdvocateUser && (
                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                    Professional
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isAdvocateUser 
                  ? "Comprehensive legal framework and advocacy strategies under IDEA"
                  : "Understanding your child's rights under the Individuals with Disabilities Education Act"}
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
            {/* What is IDEA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  What is IDEA?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The Individuals with Disabilities Education Act (IDEA) is a federal law that ensures students 
                  with disabilities are provided with Free Appropriate Public Education (FAPE) tailored to their 
                  individual needs.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Free Appropriate Public Education
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your child has the right to receive special education and related services at no cost.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Least Restrictive Environment
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Students should be educated with their non-disabled peers to the maximum extent appropriate.
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Core Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Core Rights Under IDEA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Right to Evaluation",
                      description: "Free comprehensive evaluation to determine if your child needs special education services",
                      timeline: "60 days from consent"
                    },
                    {
                      title: "Right to an IEP",
                      description: "Individualized Education Program developed by a team including you",
                      timeline: "30 days from eligibility"
                    },
                    {
                      title: "Right to Participate",
                      description: "Meaningful participation in all IEP meetings and educational decisions",
                      timeline: "Ongoing"
                    },
                    {
                      title: "Right to Records",
                      description: "Access to all educational records related to your child",
                      timeline: "45 days from request"
                    },
                    {
                      title: "Right to Due Process",
                      description: "Legal procedures to resolve disputes with the school district",
                      timeline: "2 years from knowledge"
                    }
                  ].map((right, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{right.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{right.description}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-amber-600">{right.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Procedural Safeguards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Procedural Safeguards
                </CardTitle>
                <CardDescription>
                  Legal protections that ensure your rights are respected throughout the special education process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    "Prior Written Notice for all changes",
                    "Consent required for evaluations and services",
                    "Independent Educational Evaluation rights",
                    "Mediation and due process procedures",
                    "Stay-put provisions during disputes",
                    "Attorney fees recovery in certain cases"
                  ].map((safeguard, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{safeguard}</span>
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
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Request Records
                  </Button>
                </Link>
                <Link href="/parent/tools/smart-letter-generator?template=evaluation-request">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Request Evaluation
                  </Button>
                </Link>
                <Link href="/parent/tools/smart-letter-generator?template=iep-meeting-request">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Request IEP Meeting
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Important Timelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Key Timelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evaluation</span>
                    <Badge variant="outline">60 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IEP Development</span>
                    <Badge variant="outline">30 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Records Request</span>
                    <Badge variant="outline">45 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prior Written Notice</span>
                    <Badge variant="outline">10 days</Badge>
                  </div>
                </div>
                <Link href="/timeline-calculator">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Timeline Calculator
                  </Button>
                </Link>
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
                  IDEA Federal Regulations
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Department of Education
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  State Special Education Office
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}