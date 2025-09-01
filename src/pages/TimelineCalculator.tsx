import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Calculator,
  Download,
  Share
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { format, addDays, addBusinessDays, isWeekend } from "date-fns";

export default function TimelineCalculator() {
  const { profile } = useAuth();
  const isAdvocateUser = profile?.role === 'advocate';
  const [requestType, setRequestType] = useState<string>("");
  const [requestDate, setRequestDate] = useState<string>("");
  const [calculatedDeadlines, setCalculatedDeadlines] = useState<any[]>([]);

  const requestTypes = [
    { value: 'ferpa', label: 'FERPA Records Request', days: 45, businessDays: false },
    { value: 'evaluation', label: 'Special Education Evaluation', days: 60, businessDays: false },
    { value: 'iep_development', label: 'IEP Development', days: 30, businessDays: false },
    { value: 'prior_notice', label: 'Prior Written Notice', days: 10, businessDays: true },
    { value: 'due_process', label: 'Due Process Complaint', days: 30, businessDays: false },
    { value: 'mediation', label: 'Mediation Request', days: 30, businessDays: false },
    { value: '504_evaluation', label: '504 Plan Evaluation', days: 'reasonable', businessDays: false }
  ];

  const calculateDeadlines = () => {
    if (!requestType || !requestDate) return;

    const selectedType = requestTypes.find(type => type.value === requestType);
    if (!selectedType) return;

    const startDate = new Date(requestDate);
    let deadlineDate: Date;
    let warningDate: Date;
    let urgentDate: Date;

    if (selectedType.days === 'reasonable') {
      // For "reasonable timeframe" use 30 days as estimate
      deadlineDate = addDays(startDate, 30);
      warningDate = addDays(startDate, 21); // 70% mark
      urgentDate = addDays(startDate, 28); // Last 2 days
    } else {
      if (selectedType.businessDays) {
        deadlineDate = addBusinessDays(startDate, selectedType.days as number);
        warningDate = addBusinessDays(startDate, Math.floor((selectedType.days as number) * 0.7));
        urgentDate = addBusinessDays(startDate, (selectedType.days as number) - 2);
      } else {
        deadlineDate = addDays(startDate, selectedType.days as number);
        warningDate = addDays(startDate, Math.floor((selectedType.days as number) * 0.7));
        urgentDate = addDays(startDate, (selectedType.days as number) - 3);
      }
    }

    const today = new Date();
    const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = 'upcoming';
    if (daysRemaining < 0) status = 'overdue';
    else if (daysRemaining <= 3) status = 'urgent';
    else if (daysRemaining <= 7) status = 'warning';

    setCalculatedDeadlines([{
      type: selectedType.label,
      requestDate: startDate,
      deadlineDate,
      warningDate,
      urgentDate,
      daysRemaining,
      status,
      businessDays: selectedType.businessDays,
      totalDays: selectedType.days
    }]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
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
                <Calendar className="h-8 w-8 text-primary" />
                Timeline Calculator
                {isAdvocateUser && (
                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                    Professional
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isAdvocateUser 
                  ? "Calculate legal deadlines and compliance timeframes for special education processes"
                  : "Track important deadlines for special education requests and processes"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calculator Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Deadlines
                </CardTitle>
                <CardDescription>
                  Enter your request details to calculate important deadlines and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="requestType">Request Type</Label>
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requestDate">Request Date</Label>
                    <Input
                      id="requestDate"
                      type="date"
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={calculateDeadlines} disabled={!requestType || !requestDate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Timeline
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {calculatedDeadlines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calculatedDeadlines.map((deadline, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{deadline.type}</h4>
                        <Badge className={getStatusColor(deadline.status)}>
                          {deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Request Submitted</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {format(deadline.requestDate, 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(deadline.requestDate, 'EEEE')}
                          </p>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(deadline.status)}
                            <span className="font-medium">Response Due</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {format(deadline.deadlineDate, 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(deadline.deadlineDate, 'EEEE')}
                          </p>
                        </Card>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Timeline Summary</span>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total timeframe:</span>
                            <p className="font-semibold">
                              {deadline.totalDays === 'reasonable' ? 'Reasonable time' : `${deadline.totalDays} ${deadline.businessDays ? 'business' : 'calendar'} days`}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Days remaining:</span>
                            <p className={`font-semibold ${deadline.daysRemaining < 0 ? 'text-red-600' : deadline.daysRemaining <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                              {deadline.daysRemaining < 0 ? `${Math.abs(deadline.daysRemaining)} days overdue` : `${deadline.daysRemaining} days left`}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-semibold capitalize">{deadline.status}</p>
                          </div>
                        </div>
                      </div>

                      {deadline.status !== 'overdue' && (
                        <div className="space-y-3">
                          <h5 className="font-medium">Upcoming Reminders</h5>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <CheckCircle className="h-4 w-4 text-yellow-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Warning Reminder</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(deadline.warningDate, 'MMM dd, yyyy')} - Follow up if no response
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Urgent Reminder</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(deadline.urgentDate, 'MMM dd, yyyy')} - Escalation may be needed
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Timeline Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requestTypes.map(type => (
                  <div key={type.value} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm font-medium">{type.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {type.days === 'reasonable' ? 'Reasonable' : `${type.days} ${type.businessDays ? 'bus.' : 'cal.'} days`}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Business Days:</strong> Exclude weekends and federal holidays.
                  </p>
                  <p>
                    <strong>Calendar Days:</strong> Include all days including weekends.
                  </p>
                  <p>
                    <strong>Reasonable Time:</strong> No specific deadline, but should be prompt and appropriate.
                  </p>
                  <p>
                    <strong>State Variations:</strong> Some states have shorter timeframes than federal requirements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/parent/tools/smart-letter-generator">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Generate Follow-up Letter
                  </Button>
                </Link>
                <Link href="/idea-rights-guide">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    IDEA Rights Guide
                  </Button>
                </Link>
                <Link href="/ferpa-overview">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    FERPA Overview
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}