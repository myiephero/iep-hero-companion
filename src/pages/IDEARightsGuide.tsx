import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ArrowLeft,
  MapPin,
  Phone,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

// State-specific special education information
const STATE_INFO = {
  'California': {
    name: 'California',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'California Education Code Section 56000-56885',
      'California Code of Regulations Title 5 Section 3000-3088'
    ],
    contacts: {
      seaOffice: 'California Department of Education - Special Education Division',
      phone: '(916) 445-4613',
      website: 'https://www.cde.ca.gov/sp/se/',
      email: 'speced@cde.ca.gov'
    },
    uniqueRights: [
      'Right to independent educational evaluation at public expense under specific conditions',
      'Enhanced transition planning requirements starting at age 16',
      'Additional protections for English language learners with disabilities'
    ],
    resources: [
      {
        name: 'California Parents Rights Guide',
        url: 'https://www.cde.ca.gov/sp/se/lr/parentsrights.asp',
        description: 'Comprehensive guide to parent rights in California'
      },
      {
        name: 'Disability Rights California',
        url: 'https://www.disabilityrightsca.org/',
        description: 'Legal advocacy organization for disability rights'
      }
    ]
  },
  'Texas': {
    name: 'Texas',
    evaluationDays: 45,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Texas Education Code Chapter 29',
      'Texas Administrative Code Title 19 Part 2 Chapter 89'
    ],
    contacts: {
      seaOffice: 'Texas Education Agency - Special Education',
      phone: '(512) 463-9414',
      website: 'https://tea.texas.gov/academics/special-student-populations/special-education',
      email: 'specialeducation@tea.texas.gov'
    },
    uniqueRights: [
      'Right to supplementary aids and services in general education',
      'Enhanced behavioral intervention plan requirements',
      'Specific provisions for students with autism spectrum disorders'
    ],
    resources: [
      {
        name: 'Texas Project First',
        url: 'https://www.texasprojectfirst.org/',
        description: 'Parent training and information center for Texas'
      },
      {
        name: 'Disability Rights Texas',
        url: 'https://disabilityrightstx.org/',
        description: 'Protection and advocacy services for people with disabilities'
      }
    ]
  },
  'Florida': {
    name: 'Florida',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Florida Statutes Chapter 1003',
      'Florida Administrative Code Chapter 6A-6'
    ],
    contacts: {
      seaOffice: 'Florida Department of Education - Bureau of Exceptional Education',
      phone: '(850) 245-0475',
      website: 'https://www.fldoe.org/academics/exceptional-student-edu/',
      email: 'ESE@fldoe.org'
    },
    uniqueRights: [
      'Matrix of services for determining appropriate services',
      'Enhanced requirements for students with significant cognitive disabilities',
      'Specific protections for students in restraint and seclusion situations'
    ],
    resources: [
      {
        name: 'Florida Diagnostic & Learning Resources System',
        url: 'https://www.fdlrs.org/',
        description: 'Statewide network providing services to students with disabilities'
      },
      {
        name: 'Disability Rights Florida',
        url: 'https://disabilityrightsflorida.org/',
        description: 'Legal advocacy for people with disabilities in Florida'
      }
    ]
  },
  'New York': {
    name: 'New York',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'New York Education Law Article 89',
      'New York Code of Rules and Regulations Part 200'
    ],
    contacts: {
      seaOffice: 'New York State Education Department - Office of Special Education',
      phone: '(518) 473-2878',
      website: 'http://www.p12.nysed.gov/specialed/',
      email: 'specialed@nysed.gov'
    },
    uniqueRights: [
      'Enhanced pendency rights during due process proceedings',
      'Specific requirements for students with autism',
      'Additional protections for English language learners with disabilities'
    ],
    resources: [
      {
        name: 'Resources for Children with Special Needs',
        url: 'https://www.resourcesnyc.org/',
        description: 'New York City resource guide for families'
      },
      {
        name: 'Advocates for Children of New York',
        url: 'https://www.advocatesforchildren.org/',
        description: 'Legal advocacy for New York students'
      }
    ]
  }
};

export default function IDEARightsGuide() {
  const { profile } = useAuth();
  const isAdvocateUser = profile?.role === 'advocate';
  const [selectedState, setSelectedState] = useState('California');
  
  const stateData = STATE_INFO[selectedState as keyof typeof STATE_INFO];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={isAdvocateUser ? "/advocate/tools" : "/parent/tools"}>
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

          {/* State Selection */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Select Your State for Specific Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get state-specific laws, timelines, and contact information
                  </p>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATE_INFO).map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    {stateData?.name} Selected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  Your Core Rights Under IDEA - {stateData?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Right to Evaluation",
                      description: "Free comprehensive evaluation to determine if your child needs special education services",
                      timeline: `${stateData?.evaluationDays} days from consent`
                    },
                    {
                      title: "Right to an IEP",
                      description: "Individualized Education Program developed by a team including you",
                      timeline: `${stateData?.iepDays} days from eligibility`
                    },
                    {
                      title: "Right to Participate",
                      description: "Meaningful participation in all IEP meetings and educational decisions",
                      timeline: "Ongoing"
                    },
                    {
                      title: "Right to Records",
                      description: "Access to all educational records related to your child",
                      timeline: `${stateData?.recordsDays} days from request`
                    },
                    {
                      title: "Right to Due Process",
                      description: "Legal procedures to resolve disputes with the school district",
                      timeline: stateData?.duProcessTimeline
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

            {/* State-Specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {stateData?.name}-Specific Laws & Rights
                </CardTitle>
                <CardDescription>
                  Additional protections and requirements specific to {stateData?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* State Laws */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    State Laws & Regulations
                  </h4>
                  <div className="space-y-2">
                    {stateData?.specificLaws.map((law, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{law}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unique Rights */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Additional {stateData?.name} Rights
                  </h4>
                  <div className="space-y-2">
                    {stateData?.uniqueRights.map((right, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{right}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* State Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {stateData?.name} Special Education Office
                  </h4>
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{stateData?.contacts.seaOffice}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{stateData?.contacts.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <a href={stateData?.contacts.website} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-blue-600 hover:underline">
                        {stateData?.contacts.website}
                      </a>
                    </div>
                  </div>
                </div>

                {/* State Resources */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {stateData?.name} Resources
                  </h4>
                  <div className="space-y-3">
                    {stateData?.resources.map((resource, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm mb-1">{resource.name}</h5>
                            <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <Link to={`${isAdvocateUser ? '/advocate' : '/parent'}/tools/smart-letter-generator?template=ferpa-request`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Request Records
                  </Button>
                </Link>
                <Link to={`${isAdvocateUser ? '/advocate' : '/parent'}/tools/smart-letter-generator?template=evaluation-request`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Request Evaluation
                  </Button>
                </Link>
                <Link to={`${isAdvocateUser ? '/advocate' : '/parent'}/tools/smart-letter-generator?template=iep-meeting-request`}>
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
                    <Badge variant="outline">{stateData?.evaluationDays} days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IEP Development</span>
                    <Badge variant="outline">{stateData?.iepDays} days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Records Request</span>
                    <Badge variant="outline">{stateData?.recordsDays} days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prior Written Notice</span>
                    <Badge variant="outline">{stateData?.priorNoticeDays} days</Badge>
                  </div>
                </div>
                <Link to="/timeline-calculator">
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