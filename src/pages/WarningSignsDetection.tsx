import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Eye, Brain, Heart, Phone, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";

const warningSignCategories = [
  {
    id: 1,
    title: "Behavioral Changes",
    icon: Brain,
    urgency: "Medium",
    signs: [
      "Sudden changes in behavior patterns",
      "Increased aggression or defiance",
      "Withdrawal from social activities",
      "Difficulty following instructions",
      "Regression in previously mastered skills",
      "Extreme mood swings"
    ]
  },
  {
    id: 2,
    title: "Academic Warning Signs",
    icon: Eye,
    urgency: "Medium",
    signs: [
      "Significant drop in academic performance",
      "Difficulty completing assignments",
      "Problems with focus and attention",
      "Avoidance of school activities",
      "Frequent complaints about school",
      "Learning gaps becoming wider"
    ]
  },
  {
    id: 3,
    title: "Emotional Distress",
    icon: Heart,
    urgency: "High",
    signs: [
      "Persistent sadness or anxiety",
      "Expressions of hopelessness",
      "Changes in sleep patterns",
      "Loss of interest in activities",
      "Self-harm behaviors or thoughts",
      "Eating pattern changes"
    ]
  },
  {
    id: 4,
    title: "Social Difficulties",
    icon: Phone,
    urgency: "Medium",
    signs: [
      "Isolation from peers",
      "Conflicts with friends or family",
      "Difficulty with social cues",
      "Bullying (as victim or perpetrator)",
      "Inappropriate social behaviors",
      "Loss of friendships"
    ]
  }
];

export default function WarningSignsDetection() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" data-testid="button-back-dashboard" asChild>
              <Link to="/parent/dashboard-free">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                Warning Signs Detection
              </h1>
              <p className="text-muted-foreground">
                Early intervention guidance and warning signals to watch for
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This tool provides general guidance only. Always consult with healthcare professionals, teachers, and your child's IEP team for specific concerns. Trust your parental instincts - you know your child best.
          </AlertDescription>
        </Alert>

        {/* Warning Signs Categories */}
        <div className="grid gap-6 md:grid-cols-2">
          {warningSignCategories.map((category) => {
            const Icon = category.icon;
            const urgencyColor = {
              High: "bg-red-100 text-red-800 border-red-300",
              Medium: "bg-orange-100 text-orange-800 border-orange-300",
              Low: "bg-yellow-100 text-yellow-800 border-yellow-300"
            }[category.urgency];

            return (
              <Card key={category.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <Badge className={urgencyColor}>
                      {category.urgency} Priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Signs to Watch For:</h4>
                    <div className="space-y-2">
                      {category.signs.map((sign, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 mt-1 text-orange-600 flex-shrink-0" />
                          <span>{sign}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Steps */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-blue-900">What to Do When You Notice Warning Signs</CardTitle>
            <CardDescription className="text-blue-700">
              Steps to take when you observe concerning behaviors or changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">Immediate Steps:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Document specific behaviors and when they occur</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Talk to your child in a supportive, non-judgmental way</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Ensure immediate safety if there are safety concerns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Contact school counselor or teacher</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">Follow-up Actions:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Schedule meeting with IEP team</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Consider professional evaluation if needed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Review and update IEP goals if necessary</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                    <span>Explore additional support services</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Resources */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-red-900">Crisis Resources</CardTitle>
            <CardDescription className="text-red-700">
              Immediate help for mental health emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Crisis Text Line</h4>
                <p className="text-sm text-red-700 mb-2">Text HOME to</p>
                <p className="font-mono text-lg text-red-900">741741</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Suicide Prevention</h4>
                <p className="text-sm text-red-700 mb-2">National Lifeline</p>
                <p className="font-mono text-lg text-red-900">988</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Emergency</h4>
                <p className="text-sm text-red-700 mb-2">Immediate danger</p>
                <p className="font-mono text-lg text-red-900">911</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}