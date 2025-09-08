import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Globe,
  Heart,
  Shield,
  Star,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";

// Parent-friendly state information
const PARENT_STATE_INFO = {
  'California': {
    name: 'California',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'California Special Education Department',
      phone: '(916) 445-4613',
      website: 'https://www.cde.ca.gov/sp/se/',
      parentCenter: 'MATRIX Parent Network',
      parentPhone: '(800) 578-2592'
    },
    parentRights: [
      'You have the right to be part of all meetings about your child',
      'The school must get your permission before testing your child',
      'You can ask for a free evaluation if you think your child needs help',
      'You can see all of your child\'s school records',
      'The school must tell you about changes to your child\'s program in writing'
    ],
    helpfulTips: [
      'Keep copies of all paperwork about your child',
      'Ask questions during meetings - your voice matters',
      'Bring a friend or advocate to meetings for support',
      'Know that evaluations should be done in your child\'s native language'
    ]
  },
  'Texas': {
    name: 'Texas',
    evaluationDays: 45,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Texas Special Education Services',
      phone: '(512) 463-9414',
      website: 'https://tea.texas.gov/academics/special-student-populations/special-education',
      parentCenter: 'Partners Resource Network',
      parentPhone: '(800) 866-4726'
    },
    parentRights: [
      'You can request help for your child at any time',
      'The school must involve you in planning your child\'s education',
      'You have the right to disagree with the school\'s decisions',
      'Your child should learn alongside other children whenever possible',
      'You can get a second opinion about your child\'s needs'
    ],
    helpfulTips: [
      'Texas has shorter evaluation timelines - only 45 days',
      'Ask about behavioral support if your child needs it',
      'Know that children with autism get special considerations',
      'You can request translation services for meetings'
    ]
  },
  'Florida': {
    name: 'Florida',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Florida Exceptional Student Education',
      phone: '(850) 245-0475',
      website: 'https://www.fldoe.org/academics/exceptional-student-edu/',
      parentCenter: 'Family Network on Disabilities',
      parentPhone: '(800) 825-5736'
    },
    parentRights: [
      'You are your child\'s best advocate',
      'The school must provide services that help your child learn',
      'You can ask for specific teaching methods for your child',
      'Your child has the right to safe learning environment',
      'You can request changes to your child\'s program'
    ],
    helpfulTips: [
      'Florida has a Matrix of Services to help determine what your child needs',
      'Ask about the least restrictive environment for your child',
      'Know your rights if your child is restrained or secluded',
      'The state has many support networks for families'
    ]
  },
  'New York': {
    name: 'New York',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'New York Special Education Office',
      phone: '(518) 473-2878',
      website: 'http://www.p12.nysed.gov/specialed/',
      parentCenter: 'Resources for Children with Special Needs',
      parentPhone: '(212) 677-4650'
    },
    parentRights: [
      'You have strong rights during disputes with the school',
      'Your child can stay in their current program during disagreements',
      'You can get help in your native language',
      'The school must consider your child\'s cultural background',
      'You can request specific services for children with autism'
    ],
    helpfulTips: [
      'New York has strong pendency rights - your child stays put during disputes',
      'Ask about autism-specific services if your child has autism',
      'Language services are available for non-English speakers',
      'NYC has many additional resources for families'
    ]
  }
};

export default function ParentIDEARightsGuide() {
  const [selectedState, setSelectedState] = useState('California');
  
  const stateData = PARENT_STATE_INFO[selectedState as keyof typeof PARENT_STATE_INFO];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/parent/tools/emergent">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tools
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Heart className="h-8 w-8 text-primary" />
                  Your Child's Rights Guide
                  <Badge variant="outline" className="ml-2 bg-pink-50 text-pink-700 border-pink-200">
                    Parent-Friendly
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Simple explanations of your child's rights and how to advocate for them
                </p>
              </div>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Guide
            </Button>
          </div>

          {/* Welcome Message */}
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Welcome!</strong> This guide explains your child's rights in simple terms. You are your child's best advocate, 
              and understanding these rights will help you get the support your child needs to succeed in school.
            </AlertDescription>
          </Alert>

          {/* State Selection */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Choose Your State</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Each state has slightly different rules and timelines. Select your state to get the right information.
                  </p>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PARENT_STATE_INFO).map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    {stateData?.name} Info
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What This Means for You */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  What Does IDEA Mean for Your Child?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  IDEA is a law that makes sure children with disabilities get the education they need. 
                  If your child has a disability, the school must provide special help for free.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4 bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Free Help for Your Child
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      The school must provide special education and support services at no cost to you.
                    </p>
                  </Card>
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Learning with Other Kids
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your child should learn with other children as much as possible.
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights as a Parent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Rights as a Parent in {stateData?.name}
                </CardTitle>
                <CardDescription>
                  These are the most important rights you have when advocating for your child
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stateData?.parentRights.map((right, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{right}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Timelines Made Simple */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Important Timelines in {stateData?.name}
                </CardTitle>
                <CardDescription>
                  How long the school has to respond to your requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Testing Your Child</span>
                      <Badge variant="outline">{stateData?.evaluationDays} days</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      How long the school has to complete testing after you give permission
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Creating an IEP</span>
                      <Badge variant="outline">{stateData?.iepDays} days</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      How long to create an education plan after testing shows your child needs help
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Getting School Records</span>
                      <Badge variant="outline">{stateData?.recordsDays} days</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      How long the school has to give you copies of your child's records
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Notice of Changes</span>
                      <Badge variant="outline">{stateData?.priorNoticeDays} days</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      How much notice the school must give you before making changes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Helpful Tips for Your State */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Helpful Tips for {stateData?.name} Parents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stateData?.helpfulTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Help Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Get Help Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/parent/tools/smart-letter-generator?template=ferpa-request">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Request My Child's Records
                  </Button>
                </Link>
                <Link to="/parent/tools/smart-letter-generator?template=evaluation-request">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Ask for Testing
                  </Button>
                </Link>
                <Link to="/parent/tools/smart-letter-generator?template=iep-meeting-request">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Request a Meeting
                  </Button>
                </Link>
                <Link to="/parent/tools/goal-generator">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Create Better Goals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Who to Call for Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Who to Call in {stateData?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    State Special Education Office
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs">{stateData?.helpfulContacts.office}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-blue-600" />
                      <span className="text-xs">{stateData?.helpfulContacts.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-green-600" />
                    Parent Support Center
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs">{stateData?.helpfulContacts.parentCenter}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-green-600" />
                      <span className="text-xs">{stateData?.helpfulContacts.parentPhone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Remember */}
            <Card className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Heart className="h-5 w-5" />
                  Remember
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You know your child best</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You have the right to ask questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You can bring support to meetings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your voice matters in your child's education</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}