import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  BookOpen, 
  MapPin, 
  Search, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Download,
  Phone,
  Mail,
  Globe,
  HelpCircle,
  ArrowRight,
  Star,
  Info,
  Gavel,
  Scale,
  Clock,
  Building,
  UserCheck
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StateInfo {
  name: string;
  abbreviation: string;
  department: string;
  website: string;
  phone: string;
  email: string;
  specialFeatures: string[];
  resources: {
    name: string;
    url: string;
    description: string;
  }[];
}

const STATE_INFORMATION: Record<string, StateInfo> = {
  AL: {
    name: "Alabama",
    abbreviation: "AL",
    department: "Alabama State Department of Education",
    website: "https://www.alsde.edu/sec/ses/special-education-services",
    phone: "(334) 694-4900",
    email: "specialed@alsde.edu",
    specialFeatures: [
      "Strong autism support programs",
      "Transition services emphasis",
      "Parent training centers"
    ],
    resources: [
      {
        name: "Alabama Parent Training Center",
        url: "https://www.alabamaparentcenter.com/",
        description: "Free training and support for parents of children with disabilities"
      },
      {
        name: "Special Education Due Process",
        url: "https://www.alsde.edu/sec/ses/due-process",
        description: "Information about dispute resolution and due process rights"
      }
    ]
  },
  CA: {
    name: "California",
    abbreviation: "CA",
    department: "California Department of Education",
    website: "https://www.cde.ca.gov/sp/se/",
    phone: "(916) 319-0800",
    email: "specialeducation@cde.ca.gov",
    specialFeatures: [
      "Comprehensive transition services",
      "Extensive bilingual support",
      "Strong advocacy network",
      "Early intervention programs"
    ],
    resources: [
      {
        name: "Disability Rights California",
        url: "https://www.disabilityrightsca.org/",
        description: "Free legal advocacy and information for individuals with disabilities"
      },
      {
        name: "SELPA Directory",
        url: "https://www.cde.ca.gov/sp/se/as/",
        description: "Find your local Special Education Local Plan Area"
      }
    ]
  },
  FL: {
    name: "Florida",
    abbreviation: "FL",
    department: "Florida Department of Education",
    website: "https://www.fldoe.org/academics/exceptional-student-edu/",
    phone: "(850) 245-0475",
    email: "ese@fldoe.org",
    specialFeatures: [
      "McKay Scholarship Program",
      "Gardiner Scholarship for students with disabilities",
      "Strong inclusion programs"
    ],
    resources: [
      {
        name: "Family Network on Disabilities",
        url: "https://fndfl.org/",
        description: "Parent training and information center for Florida families"
      },
      {
        name: "Florida Diagnostic & Learning Resources System",
        url: "https://www.fdlrs.org/",
        description: "Professional development and technical assistance"
      }
    ]
  },
  NY: {
    name: "New York",
    abbreviation: "NY",
    department: "New York State Education Department",
    website: "http://www.p12.nysed.gov/specialed/",
    phone: "(518) 474-2714",
    email: "speced@nysed.gov",
    specialFeatures: [
      "Impartial hearing system",
      "Strong NYC special education services",
      "Committee on Special Education (CSE) structure"
    ],
    resources: [
      {
        name: "Advocates for Children of New York",
        url: "https://www.advocatesforchildren.org/",
        description: "Free advocacy and legal assistance for NYC families"
      },
      {
        name: "Resources for Children with Special Needs",
        url: "https://www.resourcesnyc.org/",
        description: "Comprehensive resource directory for NYC families"
      }
    ]
  },
  TX: {
    name: "Texas",
    abbreviation: "TX",
    department: "Texas Education Agency",
    website: "https://tea.texas.gov/academics/special-student-populations/special-education",
    phone: "(512) 463-9414",
    email: "specialeducation@tea.texas.gov",
    specialFeatures: [
      "ARD (Admission, Review, and Dismissal) committee process",
      "Strong transition planning",
      "Autism grant programs"
    ],
    resources: [
      {
        name: "Partners Resource Network",
        url: "https://www.partnerstx.org/",
        description: "Parent training and information throughout Texas"
      },
      {
        name: "Texas Project FIRST",
        url: "https://www.texasprojectfirst.org/",
        description: "Training and support for families of children with disabilities"
      }
    ]
  }
};

// Add more states as needed
const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const CORE_IDEA_RIGHTS = [
  {
    title: "Free Appropriate Public Education (FAPE)",
    description: "Your child has the right to a free education that meets their unique needs at no cost to you.",
    details: [
      "Education must be provided at public expense",
      "Must meet your child's individual needs",
      "Must be appropriate to your child's age and grade level",
      "Must follow the IEP requirements"
    ]
  },
  {
    title: "Least Restrictive Environment (LRE)",
    description: "Your child should be educated with non-disabled peers to the maximum extent appropriate.",
    details: [
      "General education classroom is the preferred setting",
      "Special classes only when education in regular classes cannot be achieved satisfactorily",
      "Your child should participate in non-academic activities with peers",
      "Removal from regular education requires justification"
    ]
  },
  {
    title: "Individualized Education Program (IEP)",
    description: "Your child is entitled to an individualized plan designed to meet their specific needs.",
    details: [
      "Written document developed by the IEP team",
      "Must include measurable annual goals",
      "Must describe services and accommodations",
      "Must be reviewed and updated annually"
    ]
  },
  {
    title: "Procedural Safeguards",
    description: "You have specific rights to protect you and your child throughout the special education process.",
    details: [
      "Right to participate in all meetings",
      "Right to examine all records",
      "Right to obtain independent educational evaluation",
      "Right to prior written notice of changes"
    ]
  },
  {
    title: "Due Process Rights",
    description: "You have the right to resolve disputes through formal procedures.",
    details: [
      "Right to request mediation",
      "Right to file due process complaint",
      "Right to legal representation",
      "Right to appeal decisions"
    ]
  },
  {
    title: "Parent Participation",
    description: "You are an equal member of your child's IEP team with important rights.",
    details: [
      "Right to participate in all decisions",
      "Right to give or withhold consent",
      "Right to request IEP meetings",
      "Right to invite others to meetings"
    ]
  }
];

export default function ParentIDEARightsGuide() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRightIndex, setSelectedRightIndex] = useState(0);

  const filteredStates = useMemo(() => {
    if (!searchTerm) return ALL_STATES;
    
    return ALL_STATES.filter(state => {
      const stateInfo = STATE_INFORMATION[state];
      if (!stateInfo) return state.toLowerCase().includes(searchTerm.toLowerCase());
      
      return stateInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             state.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const selectedStateInfo = selectedState ? STATE_INFORMATION[selectedState] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-10 w-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                IDEA Rights Guide
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Understanding your rights under the Individuals with Disabilities Education Act (IDEA)
            </p>
            <div className="flex justify-center space-x-2">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-300">
                Federal Law
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                State Specific
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Parent Rights
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Core IDEA Rights Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-6 w-6 text-purple-600" />
                  Your Core Rights Under IDEA
                </CardTitle>
                <CardDescription>
                  These are the fundamental rights guaranteed to you and your child by federal law
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Rights Navigation */}
                  <div className="space-y-2">
                    {CORE_IDEA_RIGHTS.map((right, index) => (
                      <Button
                        key={index}
                        variant={selectedRightIndex === index ? "default" : "outline"}
                        onClick={() => setSelectedRightIndex(index)}
                        className={cn(
                          "w-full justify-start text-left h-auto p-4",
                          selectedRightIndex === index 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                        data-testid={`button-right-${index}`}
                      >
                        <div>
                          <div className="font-medium text-sm">{right.title}</div>
                          <div className="text-xs opacity-80 mt-1 line-clamp-2">
                            {right.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Rights Details */}
                  <div className="lg:col-span-2">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-xl text-blue-700 dark:text-blue-300">
                          {CORE_IDEA_RIGHTS[selectedRightIndex].title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {CORE_IDEA_RIGHTS[selectedRightIndex].description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Key Points:</h4>
                          <ul className="space-y-2">
                            {CORE_IDEA_RIGHTS[selectedRightIndex].details.map((detail, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* State-Specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-green-600" />
                  State-Specific Information
                </CardTitle>
                <CardDescription>
                  Find information specific to your state's implementation of IDEA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* State Selection */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="state-search">Search for Your State</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="state-search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Type state name..."
                          className="pl-10"
                          data-testid="input-state-search"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="state-select">Or Select from List</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger data-testid="select-state">
                          <SelectValue placeholder="Choose your state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {filteredStates.map(state => (
                            <SelectItem key={state} value={state}>
                              {STATE_INFORMATION[state]?.name || state} ({state})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* State Information Display */}
                {selectedStateInfo && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xl">{selectedStateInfo.name} Special Education</span>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          {selectedStateInfo.abbreviation}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{selectedStateInfo.department}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-700 dark:text-blue-300">Website</span>
                            </div>
                            <Button
                              variant="link"
                              className="h-auto p-0 text-sm text-blue-600 hover:text-blue-700"
                              onClick={() => window.open(selectedStateInfo.website, '_blank')}
                              data-testid="button-state-website"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit State Website
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700 dark:text-green-300">Phone</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedStateInfo.phone}</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-700 dark:text-purple-300">Email</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedStateInfo.email}</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Special Features */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Special Features in {selectedStateInfo.name}:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedStateInfo.specialFeatures.map((feature, index) => (
                            <Badge key={index} variant="outline" className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300">
                              <Star className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* State Resources */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Helpful Resources:</h4>
                        <div className="space-y-3">
                          {selectedStateInfo.resources.map((resource, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 dark:text-gray-100">{resource.name}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{resource.description}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(resource.url, '_blank')}
                                    data-testid={`button-resource-${index}`}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Visit
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedState && (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Select Your State
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose your state to see specific information about rights, resources, and contacts
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Quick Reference Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Know Your Timeline:</strong> You have specific deadlines for requesting evaluations, appealing decisions, and filing complaints.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <UserCheck className="h-4 w-4" />
                  <AlertDescription>
                    <strong>You Are an Equal Team Member:</strong> Your input and decisions carry the same weight as school professionals.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Document Everything:</strong> Keep records of all communications, meetings, and decisions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Key Contacts Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Key Contacts
                </CardTitle>
                <CardDescription>Important numbers to keep handy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="font-medium text-blue-700 dark:text-blue-300">National Disability Rights Network</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">(202) 408-9514</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Free legal advocacy nationwide</div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="font-medium text-green-700 dark:text-green-300">Parent Training Centers</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Find your local center</div>
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => window.open('https://www.parentcenterhub.org/find-your-center/', '_blank')}
                      data-testid="button-parent-centers"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Find Centers
                    </Button>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <div className="font-medium text-purple-700 dark:text-purple-300">IDEA Information Line</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">(202) 245-7468</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">U.S. Department of Education</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Related Tools
                </CardTitle>
                <CardDescription>Other resources to help you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => navigate('/parent/tools/goal-generator')}
                  data-testid="button-goal-generator"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Goal Generator</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Create compliant IEP goals</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => navigate('/parent/tools/iep-master-suite')}
                  data-testid="button-iep-suite"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">IEP Master Suite</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Comprehensive IEP tools</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => navigate('/parent/tools/document-vault')}
                  data-testid="button-document-vault"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Document Vault</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Organize important documents</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Contact Card */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-5 w-5" />
                  Need Immediate Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div className="font-medium text-red-700 dark:text-red-300">Crisis Situations</div>
                    <div className="text-red-600 dark:text-red-400">Contact your state's protection & advocacy organization</div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="font-medium text-yellow-700 dark:text-yellow-300">Legal Questions</div>
                    <div className="text-yellow-600 dark:text-yellow-400">Consult with a special education attorney</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}