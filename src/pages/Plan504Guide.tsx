import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Clock,
  Download,
  ExternalLink,
  ArrowLeft,
  BookOpen,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Plan504Guide() {
  const { profile } = useAuth();
  const isAdvocateUser = profile?.role === 'advocate';
  const { toast } = useToast();

  const downloadChecklist = () => {
    const checklistContent = `504 ACCOMMODATION CHECKLIST

CLASSROOM ACCOMMODATIONS:
☐ Extended time on tests and assignments
☐ Preferential seating
☐ Reduced distractions
☐ Alternative testing location
☐ Breaks during long activities
☐ Modified assignments or expectations
☐ Use of assistive technology
☐ Note-taking assistance
☐ Audio recordings of lessons

TESTING ACCOMMODATIONS:
☐ Extended time (time and a half, double time)
☐ Small group testing
☐ Reading test questions aloud
☐ Large print or audio format
☐ Frequent breaks
☐ Alternative testing dates
☐ Use of word processor
☐ Calculator for non-math subjects

COMMUNICATION SUPPORTS:
☐ Regular progress monitoring
☐ Home-school communication log
☐ Modified homework assignments
☐ Visual schedules and reminders
☐ Social skills support
☐ Behavior intervention plan
☐ Crisis intervention plan

Remember: These accommodations must be:
- Necessary due to the disability
- Appropriate for the student's needs
- Effective in providing equal access
- Regularly reviewed and updated

Generated on: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([checklistContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `504-Accommodation-Checklist-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Checklist Downloaded",
      description: "504 accommodation checklist has been downloaded to your device."
    });
  };

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
                <Target className="h-8 w-8 text-primary" />
                504 Plan Guide
                {isAdvocateUser && (
                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                    Professional
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isAdvocateUser 
                  ? "Legal framework and advocacy strategies for Section 504 accommodations"
                  : "Understanding Section 504 plans and accommodations for your child"}
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
            {/* What is Section 504 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  What is Section 504?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Section 504 of the Rehabilitation Act is a federal civil rights law that prohibits discrimination 
                  based on disability and ensures students with disabilities have equal access to education through 
                  appropriate accommodations and modifications.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Equal Access
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Students receive accommodations to access the same educational opportunities as their peers.
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Civil Rights Protection
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Protection from disability-based discrimination in federally funded programs.
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* 504 vs IEP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  504 Plan vs. IEP: What's the Difference?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-600">504 Plan</h4>
                    <ul className="space-y-2">
                      {[
                        "Accommodations and modifications",
                        "General education with supports",
                        "Broader disability definition",
                        "Less detailed documentation",
                        "Annual review required",
                        "Civil rights protection"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">IEP</h4>
                    <ul className="space-y-2">
                      {[
                        "Special education services",
                        "Individualized instruction",
                        "13 specific disability categories",
                        "Detailed goals and objectives",
                        "Annual review + 3-year evaluation",
                        "Educational benefit guarantee"
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Accommodations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Common 504 Accommodations
                </CardTitle>
                <CardDescription>
                  Examples of accommodations that can help students succeed in the general education environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      category: "Testing Accommodations",
                      items: [
                        "Extended time on tests",
                        "Small group testing",
                        "Read aloud or audio format",
                        "Multiple session testing",
                        "Use of calculator or computer",
                        "Alternative test formats"
                      ]
                    },
                    {
                      category: "Classroom Accommodations",
                      items: [
                        "Preferential seating",
                        "Reduced assignments",
                        "Modified homework",
                        "Frequent breaks",
                        "Visual/audio cues",
                        "Organizational supports"
                      ]
                    },
                    {
                      category: "Behavioral Supports",
                      items: [
                        "Behavior intervention plan",
                        "Self-regulation strategies",
                        "Positive reinforcement",
                        "Clear expectations",
                        "Calm-down space",
                        "Regular check-ins"
                      ]
                    },
                    {
                      category: "Physical/Health Supports",
                      items: [
                        "Medication administration",
                        "Bathroom breaks as needed",
                        "Food/snack accommodations",
                        "Modified PE participation",
                        "Mobility assistance",
                        "Environmental modifications"
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

            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Getting a 504 Plan: Step by Step
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Request Evaluation",
                      description: "Submit written request for 504 evaluation. Include concerns about how your child's disability affects their education.",
                      timeline: "Immediately"
                    },
                    {
                      step: "2",
                      title: "Evaluation Process",
                      description: "School conducts evaluation to determine if student has a disability that substantially limits a major life activity.",
                      timeline: "Reasonable timeframe"
                    },
                    {
                      step: "3",
                      title: "Eligibility Meeting",
                      description: "504 team reviews evaluation data and determines eligibility. Parents are part of this team.",
                      timeline: "After evaluation"
                    },
                    {
                      step: "4",
                      title: "Plan Development",
                      description: "If eligible, team develops 504 plan with specific accommodations and modifications.",
                      timeline: "After eligibility"
                    },
                    {
                      step: "5",
                      title: "Implementation",
                      description: "All teachers and staff implement the accommodations outlined in the 504 plan.",
                      timeline: "Immediately"
                    },
                    {
                      step: "6",
                      title: "Annual Review",
                      description: "Plan is reviewed annually or more frequently if needed. Parents can request changes anytime.",
                      timeline: "Annually"
                    }
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-amber-600">{step.timeline}</span>
                        </div>
                      </div>
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
                <Link to="/parent/tools/smart-letter-generator?template=evaluation-request">
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Request 504 Evaluation
                  </Button>
                </Link>
                <Link to="/parent/tools/smart-letter-generator?template=accommodation-request">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Request Accommodations
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={downloadChecklist}>
                  <Download className="h-4 w-4 mr-2" />
                  Accommodation Checklist
                </Button>
              </CardContent>
            </Card>

            {/* Eligibility Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-semibold text-sm mb-1">Has a Disability</h5>
                    <p className="text-xs text-muted-foreground">Physical or mental impairment</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-semibold text-sm mb-1">Substantially Limits</h5>
                    <p className="text-xs text-muted-foreground">One or more major life activities</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-semibold text-sm mb-1">Educational Impact</h5>
                    <p className="text-xs text-muted-foreground">Affects school participation</p>
                  </div>
                </div>
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
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  {[
                    "Participate in all meetings",
                    "Receive notice of meetings",
                    "Access your child's records",
                    "Request independent evaluation",
                    "File grievance or complaint",
                    "Due process protections"
                  ].map((right, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{right}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* External Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Section 504 Regulations
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Office of Civil Rights
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Disability Rights Office
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}