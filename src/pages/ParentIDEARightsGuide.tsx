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
import { useToolAccess } from "@/hooks/useToolAccess";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlanFeatures, SubscriptionPlan } from "@/lib/planAccess";

// Access-controlled tool button component
interface AccessControlledToolButtonProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requiredFeature: keyof PlanFeatures;
  requiredPlan: SubscriptionPlan;
}

function AccessControlledToolButton({ title, icon: Icon, path, requiredFeature, requiredPlan }: AccessControlledToolButtonProps) {
  const { hasAccess, currentPlan } = useToolAccess();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  const isAccessible = hasAccess(requiredFeature);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isAccessible) {
      e.preventDefault();
      setShowUpgradeDialog(true);
    }
  };

  if (isAccessible) {
    return (
      <Link to={path}>
        <Button variant="outline" className="w-full justify-start">
          <Icon className="h-4 w-4 mr-2" />
          {title}
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full justify-start opacity-60 cursor-pointer" 
        onClick={handleClick}
        data-testid={`button-upgrade-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {title}
        <Badge className="ml-auto text-xs">Premium</Badge>
      </Button>
      
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              This tool requires a {requiredPlan} plan or higher. Your current plan is {currentPlan}.
            </DialogDescription>
          </DialogHeader>
          <UpgradePrompt 
            toolName={title}
            benefits={[`Access to ${title}`, "Enhanced features", "Priority support"]}
            currentValue={currentPlan}
            requiredPlan={requiredPlan}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Parent-friendly state information for all 50 states
const PARENT_STATE_INFO = {
  'Alabama': {
    name: 'Alabama',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Alabama State Department of Education - Special Education',
      phone: '(334) 694-4783',
      website: 'https://www.alsde.edu/sec/se/',
      parentCenter: 'Special Education Action Committee',
      parentPhone: '(334) 262-9300'
    },
    parentRights: [
      'You have the right to participate in all decisions about your child\'s education',
      'The school must get your written consent before testing your child',
      'You can request an evaluation if you think your child needs special education',
      'You have the right to see all educational records about your child',
      'The school must give you prior written notice before making changes'
    ],
    helpfulTips: [
      'Alabama follows federal IDEA timelines closely',
      'Document all communications with the school in writing',
      'Ask about assistive technology if your child could benefit',
      'Connect with other parents through local support groups'
    ]
  },
  'Alaska': {
    name: 'Alaska',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Alaska Department of Education - Special Education',
      phone: '(907) 465-2972',
      website: 'https://education.alaska.gov/tls/sped/',
      parentCenter: 'STEP (Special Education Training & Information)',
      parentPhone: '(800) 478-7678'
    },
    parentRights: [
      'You have the right to meaningful participation in your child\'s education',
      'The school must consider your child\'s unique cultural and linguistic needs',
      'You can request services in your native language if needed',
      'Your child has the right to learn in the least restrictive environment',
      'You can challenge school decisions through due process'
    ],
    helpfulTips: [
      'Alaska serves many remote communities - know your distance education rights',
      'Cultural considerations are important - advocate for culturally responsive services',
      'Weather may affect service delivery - ask about contingency plans',
      'Telehealth and distance services may be available for your child'
    ]
  },
  'Arizona': {
    name: 'Arizona',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Arizona Department of Education - Exceptional Student Services',
      phone: '(602) 542-4013',
      website: 'https://www.azed.gov/specialeducation/',
      parentCenter: 'Raising Special Kids',
      parentPhone: '(602) 242-4366'
    },
    parentRights: [
      'You have the right to be an equal partner in educational decisions',
      'The school must provide services in your preferred language when possible',
      'You can request independent educational evaluations',
      'Your child has the right to appropriate behavioral supports',
      'You can request mediation before due process hearings'
    ],
    helpfulTips: [
      'Arizona has Empowerment Scholarship Accounts for special needs students',
      'Hot weather may affect outdoor activities - ensure accommodations',
      'Many bilingual families - know your language rights',
      'Desert safety should be considered for field trips and outdoor activities'
    ]
  },
  'Arkansas': {
    name: 'Arkansas',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Arkansas Department of Education - Special Education Unit',
      phone: '(501) 682-4225',
      website: 'https://dese.ade.arkansas.gov/Offices/special-education',
      parentCenter: 'Partners for Inclusive Communities',
      parentPhone: '(501) 614-7020'
    },
    parentRights: [
      'You have the right to receive information about your child\'s progress',
      'The school must include you in planning your child\'s transition services',
      'You can request compensatory services if the school failed to provide FAPE',
      'Your child has the right to continue receiving services during disputes',
      'You can request that meetings be scheduled at mutually convenient times'
    ],
    helpfulTips: [
      'Arkansas has strong rural communities - know your transportation rights',
      'Ask about career and technical education opportunities for older students',
      'Family engagement is highly valued - participate actively in school activities',
      'Connect with Arkansas Parent Information and Resource Center'
    ]
  },
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
  'Colorado': {
    name: 'Colorado',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Colorado Department of Education - Exceptional Student Services',
      phone: '(303) 866-6694',
      website: 'https://www.cde.state.co.us/cdesped/',
      parentCenter: 'PEAK Parent Center',
      parentPhone: '(719) 531-9400'
    },
    parentRights: [
      'You have the right to be treated as an equal partner in your child\'s education',
      'The school must consider your input about your child\'s needs and strengths',
      'You can request specific accommodations and modifications',
      'Your child has the right to participate in state and district assessments',
      'You can request facilitated IEP meetings if needed'
    ],
    helpfulTips: [
      'Colorado emphasizes family-centered planning',
      'High altitude may affect some children - discuss with medical providers',
      'Many outdoor education opportunities - ensure safety accommodations',
      'Connect with local disability resource centers'
    ]
  },
  'Connecticut': {
    name: 'Connecticut',
    evaluationDays: 45,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Connecticut State Department of Education - Bureau of Special Education',
      phone: '(860) 713-6910',
      website: 'https://portal.ct.gov/SDE/Special-Education/',
      parentCenter: 'Connecticut Parent Information Center',
      parentPhone: '(203) 739-3089'
    },
    parentRights: [
      'You have the right to participate in planning your child\'s program',
      'The school must provide you with progress reports on IEP goals',
      'You can request additional services if your child needs them',
      'Your child has the right to receive services in the least restrictive environment',
      'You can appeal school decisions through state complaint procedures'
    ],
    helpfulTips: [
      'Connecticut has a 45-day evaluation timeline - shorter than federal requirements',
      'Strong special education advocacy community - connect with local groups',
      'Many private schools with special education programs if needed',
      'Early intervention services transition well into school programs'
    ]
  },
  'Delaware': {
    name: 'Delaware',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Delaware Department of Education - Exceptional Children Resources',
      phone: '(302) 735-4210',
      website: 'https://www.doe.k12.de.us/Page/316',
      parentCenter: 'Parent Information Center of Delaware',
      parentPhone: '(302) 999-7394'
    },
    parentRights: [
      'You have the right to be involved in all educational decisions',
      'The school must provide you with a copy of your child\'s IEP',
      'You can request that your child be educated with non-disabled peers',
      'Your child has the right to receive related services as needed',
      'You can request independent educational evaluations'
    ],
    helpfulTips: [
      'Delaware is a small state with close-knit special education community',
      'Many services available through nearby major cities',
      'State has strong early intervention to school transition programs',
      'Beach and water safety considerations for field trips'
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
  'Georgia': {
    name: 'Georgia',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Georgia Department of Education - Division for Special Education Services and Supports',
      phone: '(404) 656-3963',
      website: 'https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Special-Education-Services/',
      parentCenter: 'Parent to Parent of Georgia',
      parentPhone: '(770) 451-5484'
    },
    parentRights: [
      'You have the right to be an active member of your child\'s IEP team',
      'The school must consider your concerns and suggestions',
      'You can request behavior supports if your child needs them',
      'Your child has the right to be included with typical peers',
      'You can file complaints if services are not provided appropriately'
    ],
    helpfulTips: [
      'Georgia has strong parent support networks throughout the state',
      'Ask about post-secondary transition planning early',
      'Many rural areas - know your transportation and service delivery rights',
      'Hot climate considerations for outdoor activities and transportation'
    ]
  },
  'Hawaii': {
    name: 'Hawaii',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Hawaii Department of Education - Special Education Section',
      phone: '(808) 305-9600',
      website: 'https://www.hawaiipublicschools.org/TeachingAndLearning/SpecializedPrograms/',
      parentCenter: 'AWARE (Assisting, Whole-child Advocacy, Resources, Education)',
      parentPhone: '(808) 536-9684'
    },
    parentRights: [
      'You have the right to participate in decisions about your child\'s education',
      'The school must respect your family\'s cultural values and practices',
      'You can request services in your native language',
      'Your child has the right to receive appropriate special education services',
      'You can request mediation to resolve disagreements'
    ],
    helpfulTips: [
      'Hawaii values family (ohana) involvement in education',
      'Island geography may affect service delivery - ask about alternatives',
      'Cultural considerations are very important in Hawaii',
      'Inter-island moves may require special transition planning'
    ]
  },
  'Idaho': {
    name: 'Idaho',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Idaho State Department of Education - Special Education',
      phone: '(208) 332-6800',
      website: 'https://www.sde.idaho.gov/student-engagement/special-education/',
      parentCenter: 'Idaho Parents Unlimited',
      parentPhone: '(208) 342-5884'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational planning',
      'The school must provide appropriate special education services',
      'You can request evaluations in areas of suspected disability',
      'Your child has the right to learn alongside non-disabled peers when appropriate',
      'You can appeal decisions through state complaint procedures'
    ],
    helpfulTips: [
      'Idaho serves many rural communities - know your distance learning rights',
      'Strong agricultural community - ask about farm safety for children with disabilities',
      'Mountain recreation activities - ensure safety accommodations',
      'Cold weather considerations for transportation and outdoor activities'
    ]
  },
  'Illinois': {
    name: 'Illinois',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Illinois State Board of Education - Special Education Services',
      phone: '(217) 782-5589',
      website: 'https://www.isbe.net/Pages/Special-Education.aspx',
      parentCenter: 'Family Resource Center on Disabilities',
      parentPhone: '(312) 939-3513'
    },
    parentRights: [
      'You have the right to participate as an equal member of the IEP team',
      'The school must provide services based on your child\'s individual needs',
      'You can request independent educational evaluations',
      'Your child has the right to receive services in the least restrictive environment',
      'You can request facilitated IEP meetings when needed'
    ],
    helpfulTips: [
      'Illinois has many resources in Chicago area - explore urban opportunities',
      'Strong advocacy community - connect with local support groups',
      'Cold winters may affect transportation - plan accordingly',
      'Many universities offer special education programs and resources'
    ]
  },
  'Indiana': {
    name: 'Indiana',
    evaluationDays: 50,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Indiana Department of Education - Division of Exceptional Learners',
      phone: '(317) 232-0570',
      website: 'https://www.in.gov/doe/students/special-education/',
      parentCenter: 'IN*SOURCE',
      parentPhone: '(800) 332-4433'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational decisions',
      'The school must consider your input about your child\'s needs',
      'You can request specific accommodations and services',
      'Your child has the right to participate in general education when appropriate',
      'You can request dispute resolution services'
    ],
    helpfulTips: [
      'Indiana has a 50-day evaluation timeline',
      'Strong manufacturing economy - ask about vocational training opportunities',
      'Many rural areas - ensure transportation accommodations',
      'State fair and racing events - consider sensory accommodations for field trips'
    ]
  },
  'Iowa': {
    name: 'Iowa',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Iowa Department of Education - Bureau of Special Education',
      phone: '(515) 281-3176',
      website: 'https://educateiowa.gov/pk-12/special-education',
      parentCenter: 'ASK Resource Center',
      parentPhone: '(800) 450-8667'
    },
    parentRights: [
      'You have the right to meaningful participation in IEP meetings',
      'The school must provide your child with a free appropriate public education',
      'You can request related services that your child needs',
      'Your child has the right to be educated with non-disabled peers',
      'You can challenge school decisions through formal procedures'
    ],
    helpfulTips: [
      'Iowa has strong agricultural communities - consider farm safety training',
      'Severe weather may affect school schedules - plan for service continuity',
      'Strong cooperative spirit - build relationships with school staff',
      'Many small towns - services may be shared across districts'
    ]
  },
  'Kansas': {
    name: 'Kansas',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Kansas State Department of Education - Special Education Services',
      phone: '(785) 296-1413',
      website: 'https://www.ksde.org/Agency/Division-of-Learning-Services/Special-Education-and-Title-Services',
      parentCenter: 'Families Together',
      parentPhone: '(785) 233-4777'
    },
    parentRights: [
      'You have the right to be an active participant in your child\'s education',
      'The school must obtain your consent before providing special education services',
      'You can request evaluations in all areas of suspected disability',
      'Your child has the right to receive appropriate behavioral supports',
      'You can request mediation to resolve disagreements'
    ],
    helpfulTips: [
      'Kansas has many rural communities - know your service delivery options',
      'Tornado season considerations - ensure emergency plans include your child\'s needs',
      'Strong community values - build positive relationships with educators',
      'Agricultural economy - explore farm-based learning opportunities if appropriate'
    ]
  },
  'Kentucky': {
    name: 'Kentucky',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Kentucky Department of Education - Division of Learning Services',
      phone: '(502) 564-4970',
      website: 'https://education.ky.gov/specialed/',
      parentCenter: 'Kentucky Special Parent Involvement Network',
      parentPhone: '(502) 584-1239'
    },
    parentRights: [
      'You have the right to be involved in all decisions about your child\'s education',
      'The school must provide services that meet your child\'s unique needs',
      'You can request independent educational evaluations',
      'Your child has the right to learn in the least restrictive environment',
      'You can file complaints if services are not provided appropriately'
    ],
    helpfulTips: [
      'Kentucky has strong family engagement initiatives',
      'Mountain regions may affect transportation - plan accordingly',
      'Ask about transition services early for post-secondary planning',
      'Coal mining regions may have specific occupational therapy needs'
    ]
  },
  'Louisiana': {
    name: 'Louisiana',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Louisiana Department of Education - Division of Diverse Learners',
      phone: '(877) 453-2721',
      website: 'https://www.louisianabelieves.com/academics/special-populations',
      parentCenter: 'Families Helping Families',
      parentPhone: '(504) 888-9111'
    },
    parentRights: [
      'You have the right to participate in your child\'s educational planning',
      'The school must consider your cultural and linguistic background',
      'You can request services in your preferred language',
      'Your child has the right to receive appropriate special education services',
      'You can appeal school decisions through established procedures'
    ],
    helpfulTips: [
      'Louisiana has experienced natural disasters - ensure emergency plans are disability-friendly',
      'Rich cultural heritage - advocate for culturally responsive services',
      'Hurricane season considerations for service continuity',
      'Many bilingual families - know your language rights'
    ]
  },
  'Maine': {
    name: 'Maine',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Maine Department of Education - Office of Special Services',
      phone: '(207) 624-6650',
      website: 'https://www.maine.gov/doe/learning/specialservices',
      parentCenter: 'Maine Parent Federation',
      parentPhone: '(207) 623-2144'
    },
    parentRights: [
      'You have the right to be treated as an equal partner in your child\'s education',
      'The school must include you in planning your child\'s transition services',
      'You can request specific accommodations for your child',
      'Your child has the right to receive services in natural environments',
      'You can request facilitated meetings when needed'
    ],
    helpfulTips: [
      'Maine serves many rural and island communities',
      'Cold weather and snow considerations for transportation',
      'Strong outdoor education opportunities - ensure safety accommodations',
      'Small class sizes may benefit children with special needs'
    ]
  },
  'Maryland': {
    name: 'Maryland',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Maryland State Department of Education - Division of Special Education/Early Intervention Services',
      phone: '(410) 767-0238',
      website: 'https://marylandpublicschools.org/programs/Pages/Special-Education/',
      parentCenter: 'Parents\' Place of Maryland',
      parentPhone: '(410) 859-5300'
    },
    parentRights: [
      'You have the right to participate in all meetings about your child',
      'The school must provide you with progress reports on IEP goals',
      'You can request additional evaluations if needed',
      'Your child has the right to be included with typical peers',
      'You can request mediation before due process hearings'
    ],
    helpfulTips: [
      'Maryland is near Washington DC - many federal resources available',
      'Strong special education legal protections',
      'Bay area considerations for water safety on field trips',
      'Urban and rural areas both well-served'
    ]
  },
  'Massachusetts': {
    name: 'Massachusetts',
    evaluationDays: 30,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Massachusetts Department of Elementary and Secondary Education - Special Education',
      phone: '(781) 338-3375',
      website: 'https://www.doe.mass.edu/sped/',
      parentCenter: 'Federation for Children with Special Needs',
      parentPhone: '(617) 236-7210'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational program',
      'The school must provide services in the least restrictive environment',
      'You can request independent educational evaluations',
      'Your child has the right to receive appropriate related services',
      'You can appeal decisions through state and federal procedures'
    ],
    helpfulTips: [
      'Massachusetts has a 30-day evaluation timeline - faster than federal requirements',
      'Strong special education advocacy community',
      'Many excellent hospitals and specialists in the area',
      'Historical sites may need accessibility accommodations for field trips'
    ]
  },
  'Michigan': {
    name: 'Michigan',
    evaluationDays: 30,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Michigan Department of Education - Office of Special Education',
      phone: '(517) 241-7065',
      website: 'https://www.michigan.gov/mde/services/special-education',
      parentCenter: 'Arc Michigan',
      parentPhone: '(800) 292-7851'
    },
    parentRights: [
      'You have the right to participate in your child\'s IEP development',
      'The school must consider your input about your child\'s needs',
      'You can request specific services and supports',
      'Your child has the right to receive a free appropriate public education',
      'You can file complaints if services are not provided properly'
    ],
    helpfulTips: [
      'Michigan has a 30-day evaluation timeline',
      'Great Lakes recreation - ensure water safety accommodations',
      'Cold winters affect transportation - plan for weather delays',
      'Strong automotive industry - explore technical education opportunities'
    ]
  },
  'Minnesota': {
    name: 'Minnesota',
    evaluationDays: 30,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Minnesota Department of Education - Special Education',
      phone: '(651) 582-8689',
      website: 'https://education.mn.gov/MDE/dse/sped/',
      parentCenter: 'PACER Center',
      parentPhone: '(952) 838-9000'
    },
    parentRights: [
      'You have the right to be an equal partner in educational decisions',
      'The school must provide you with understandable information',
      'You can request services in your native language',
      'Your child has the right to learn with non-disabled peers',
      'You can request alternative dispute resolution'
    ],
    helpfulTips: [
      'Minnesota has a 30-day evaluation timeline',
      'PACER Center is a nationally recognized parent resource',
      'Cold weather considerations for year-round services',
      'Strong commitment to inclusive education practices'
    ]
  },
  'Mississippi': {
    name: 'Mississippi',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Mississippi Department of Education - Office of Special Education',
      phone: '(601) 359-3498',
      website: 'https://www.mdek12.org/OSE',
      parentCenter: 'Project EMPOWER',
      parentPhone: '(601) 987-4872'
    },
    parentRights: [
      'You have the right to be involved in decisions about your child\'s education',
      'The school must provide appropriate special education services',
      'You can request evaluations in areas of concern',
      'Your child has the right to receive services in the least restrictive environment',
      'You can appeal school decisions through established procedures'
    ],
    helpfulTips: [
      'Mississippi has strong community ties - build relationships with school staff',
      'Hurricane season considerations for emergency planning',
      'Rural areas may require creative service delivery - ask about options',
      'Hot, humid climate considerations for outdoor activities'
    ]
  },
  'Missouri': {
    name: 'Missouri',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Missouri Department of Elementary and Secondary Education - Special Education',
      phone: '(573) 751-5739',
      website: 'https://dese.mo.gov/special-education',
      parentCenter: 'Missouri Parents Act',
      parentPhone: '(816) 531-7070'
    },
    parentRights: [
      'You have the right to participate in your child\'s educational planning',
      'The school must consider your concerns and suggestions',
      'You can request independent educational evaluations',
      'Your child has the right to receive appropriate behavioral supports',
      'You can request mediation to resolve disagreements'
    ],
    helpfulTips: [
      'Missouri serves both urban and rural communities effectively',
      'Tornado season considerations for emergency planning',
      'Strong agricultural heritage - explore farm-based learning if appropriate',
      'Gateway to the West history - many educational field trip opportunities'
    ]
  },
  'Montana': {
    name: 'Montana',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Montana Office of Public Instruction - Special Education',
      phone: '(406) 444-4429',
      website: 'https://opi.mt.gov/Educators/Teaching-Learning/Special-Education',
      parentCenter: 'Parents, Let\'s Unite for Kids',
      parentPhone: '(406) 255-0540'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational decisions',
      'The school must respect your family\'s cultural values',
      'You can request services that meet your child\'s individual needs',
      'Your child has the right to learn in the least restrictive environment',
      'You can file complaints if services are not provided appropriately'
    ],
    helpfulTips: [
      'Montana serves many rural and tribal communities',
      'Long distances may affect service delivery - ask about alternatives',
      'Outdoor recreation opportunities - ensure safety accommodations',
      'Cold weather and snow considerations for transportation'
    ]
  },
  'Nebraska': {
    name: 'Nebraska',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Nebraska Department of Education - Special Education',
      phone: '(402) 471-2471',
      website: 'https://www.education.ne.gov/sped/',
      parentCenter: 'PTI Nebraska',
      parentPhone: '(402) 346-0525'
    },
    parentRights: [
      'You have the right to participate as an equal member of the IEP team',
      'The school must provide services based on your child\'s needs',
      'You can request additional evaluations if concerned about your child\'s progress',
      'Your child has the right to receive services in natural environments',
      'You can request dispute resolution services'
    ],
    helpfulTips: [
      'Nebraska has strong agricultural communities',
      'Severe weather may affect school schedules - plan for service continuity',
      'Small town values - build strong relationships with educators',
      'Distance learning may be available for specialized services'
    ]
  },
  'Nevada': {
    name: 'Nevada',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Nevada Department of Education - Office for a Safe and Respectful Learning Environment',
      phone: '(775) 687-9171',
      website: 'http://www.doe.nv.gov/Special_Education/',
      parentCenter: 'Nevada PEP',
      parentPhone: '(775) 448-9950'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational planning',
      'The school must provide services in your preferred language when possible',
      'You can request specific accommodations for your child',
      'Your child has the right to receive appropriate special education services',
      'You can appeal decisions through state procedures'
    ],
    helpfulTips: [
      'Nevada has diverse communities from urban Las Vegas to rural areas',
      'Desert climate considerations for outdoor activities',
      'Many Spanish-speaking families - know your language rights',
      'Gaming and hospitality industry offers unique job training opportunities'
    ]
  },
  'New Hampshire': {
    name: 'New Hampshire',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'New Hampshire Department of Education - Bureau of Special Education',
      phone: '(603) 271-3741',
      website: 'https://www.education.nh.gov/who-we-are/division-of-learner-support/bureau-of-special-education',
      parentCenter: 'Parent Information Center',
      parentPhone: '(603) 224-7005'
    },
    parentRights: [
      'You have the right to participate in all decisions about your child\'s education',
      'The school must include you in planning transition services',
      'You can request independent educational evaluations',
      'Your child has the right to learn with typical peers when appropriate',
      'You can request facilitated IEP meetings'
    ],
    helpfulTips: [
      'New Hampshire has small communities with close school relationships',
      'Winter weather considerations for transportation and activities',
      'Mountain recreation opportunities - ensure safety accommodations',
      'Strong tradition of local control - get involved in your school district'
    ]
  },
  'New Jersey': {
    name: 'New Jersey',
    evaluationDays: 90,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 15,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'New Jersey Department of Education - Office of Special Education',
      phone: '(609) 376-9060',
      website: 'https://www.nj.gov/education/specialed/',
      parentCenter: 'Statewide Parent Advocacy Network',
      parentPhone: '(973) 642-8100'
    },
    parentRights: [
      'You have the right to participate in your child\'s educational program',
      'The school must provide services in the least restrictive environment',
      'You can request additional services if your child needs them',
      'Your child has the right to receive appropriate related services',
      'You can appeal decisions through due process hearings'
    ],
    helpfulTips: [
      'New Jersey has a 90-day evaluation timeline and 15-day prior notice requirement',
      'High population density means many specialists available',
      'Strong special education legal protections',
      'Beach and water safety considerations for field trips'
    ]
  },
  'New Mexico': {
    name: 'New Mexico',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'New Mexico Public Education Department - Special Education Bureau',
      phone: '(505) 827-1457',
      website: 'https://webnew.ped.state.nm.us/bureaus/special-education/',
      parentCenter: 'EPICS (Education for Parents of Indian Children with Special Needs)',
      parentPhone: '(505) 988-9700'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational decisions',
      'The school must consider your cultural and linguistic background',
      'You can request services in your native language',
      'Your child has the right to receive culturally responsive services',
      'You can request mediation to resolve disagreements'
    ],
    helpfulTips: [
      'New Mexico has diverse Native American and Hispanic communities',
      'High altitude considerations for some children with health needs',
      'Bilingual and multicultural services widely available',
      'Desert climate and safety considerations for outdoor activities'
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
  },
  'North Carolina': {
    name: 'North Carolina',
    evaluationDays: 90,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'North Carolina Department of Public Instruction - Exceptional Children Division',
      phone: '(919) 807-3969',
      website: 'https://www.dpi.nc.gov/districts-schools/classroom-resources/exceptional-children',
      parentCenter: 'Exceptional Children\'s Assistance Center',
      parentPhone: '(704) 892-1321'
    },
    parentRights: [
      'You have the right to be an active participant in your child\'s education',
      'The school must provide services that meet your child\'s individual needs',
      'You can request independent educational evaluations',
      'Your child has the right to learn in the least restrictive environment',
      'You can file complaints if services are not provided appropriately'
    ],
    helpfulTips: [
      'North Carolina has a 90-day evaluation timeline',
      'Strong early intervention to school transition programs',
      'Hurricane season considerations for emergency planning',
      'Research Triangle area has many specialized resources'
    ]
  },
  'North Dakota': {
    name: 'North Dakota',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'North Dakota Department of Public Instruction - Special Education',
      phone: '(701) 328-2277',
      website: 'https://www.nd.gov/dpi/districtsschools/special-education',
      parentCenter: 'Pathfinder Parent Center',
      parentPhone: '(701) 837-7500'
    },
    parentRights: [
      'You have the right to participate in your child\'s educational planning',
      'The school must consider your input about your child\'s needs',
      'You can request specific services and accommodations',
      'Your child has the right to receive appropriate special education services',
      'You can appeal decisions through state procedures'
    ],
    helpfulTips: [
      'North Dakota serves many rural communities with long distances',
      'Severe winter weather considerations for transportation',
      'Oil industry growth has brought new educational opportunities',
      'Small class sizes may benefit children with special needs'
    ]
  },
  'Ohio': {
    name: 'Ohio',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Ohio Department of Education - Office for Exceptional Children',
      phone: '(614) 995-1545',
      website: 'https://education.ohio.gov/Topics/Special-Education',
      parentCenter: 'OCECD (Ohio Coalition for the Education of Children with Disabilities)',
      parentPhone: '(614) 431-1307'
    },
    parentRights: [
      'You have the right to be involved in all decisions about your child\'s education',
      'The school must provide you with progress reports on IEP goals',
      'You can request additional evaluations if needed',
      'Your child has the right to be included with typical peers',
      'You can request mediation before due process hearings'
    ],
    helpfulTips: [
      'Ohio has many urban areas with specialized services',
      'Strong manufacturing economy - explore technical education opportunities',
      'Great Lakes recreation - ensure water safety accommodations',
      'Severe weather season considerations for emergency planning'
    ]
  },
  'Oklahoma': {
    name: 'Oklahoma',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Oklahoma State Department of Education - Special Education Services',
      phone: '(405) 521-3351',
      website: 'https://sde.ok.gov/special-education',
      parentCenter: 'Oklahoma Parents Center',
      parentPhone: '(405) 271-8807'
    },
    parentRights: [
      'You have the right to participate in your child\'s IEP development',
      'The school must consider your concerns and suggestions',
      'You can request services that meet your child\'s unique needs',
      'Your child has the right to receive appropriate behavioral supports',
      'You can file complaints if services are not provided properly'
    ],
    helpfulTips: [
      'Oklahoma has diverse Native American communities with special considerations',
      'Tornado season requires careful emergency planning',
      'Oil and gas industry offers technical education opportunities',
      'Strong community values - build relationships with school staff'
    ]
  },
  'Oregon': {
    name: 'Oregon',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Oregon Department of Education - Office of Special Education',
      phone: '(503) 947-5600',
      website: 'https://www.oregon.gov/ode/students-and-family/SpecialEducation/',
      parentCenter: 'Oregon Family to Family Network',
      parentPhone: '(503) 323-2279'
    },
    parentRights: [
      'You have the right to be treated as an equal partner in your child\'s education',
      'The school must include you in transition planning',
      'You can request specific accommodations and modifications',
      'Your child has the right to learn in natural environments',
      'You can request alternative dispute resolution'
    ],
    helpfulTips: [
      'Oregon has strong inclusive education practices',
      'Outdoor education opportunities - ensure safety accommodations',
      'Rainy season considerations for indoor alternative activities',
      'Progressive special education policies and practices'
    ]
  },
  'Pennsylvania': {
    name: 'Pennsylvania',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Pennsylvania Department of Education - Bureau of Special Education',
      phone: '(717) 783-6913',
      website: 'https://www.education.pa.gov/K-12/Special%20Education/',
      parentCenter: 'Parent Education and Advocacy Leadership Center',
      parentPhone: '(412) 827-7337'
    },
    parentRights: [
      'You have the right to participate in your child\'s educational program',
      'The school must provide services in the least restrictive environment',
      'You can request independent educational evaluations',
      'Your child has the right to receive appropriate related services',
      'You can appeal decisions through established procedures'
    ],
    helpfulTips: [
      'Pennsylvania has many excellent children\'s hospitals and specialists',
      'Strong special education advocacy community',
      'Winter weather considerations for transportation',
      'Historical sites may need accessibility accommodations for field trips'
    ]
  },
  'Rhode Island': {
    name: 'Rhode Island',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Rhode Island Department of Education - Special Education',
      phone: '(401) 222-8999',
      website: 'https://www.ride.ri.gov/StudentsFamilies/SpecialEducation/',
      parentCenter: 'Rhode Island Parent Information Network',
      parentPhone: '(401) 270-0101'
    },
    parentRights: [
      'You have the right to be involved in all decisions about your child\'s education',
      'The school must provide you with progress reports',
      'You can request additional services if your child needs them',
      'Your child has the right to be included with typical peers',
      'You can request mediation to resolve disagreements'
    ],
    helpfulTips: [
      'Rhode Island is small with close-knit special education community',
      'Coastal location - water safety considerations for field trips',
      'Many services available through nearby Boston area',
      'Strong early intervention to school transition programs'
    ]
  },
  'South Carolina': {
    name: 'South Carolina',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'South Carolina Department of Education - Office of Special Education Services',
      phone: '(803) 734-8806',
      website: 'https://ed.sc.gov/districts-schools/special-education-services/',
      parentCenter: 'PRO-Parents',
      parentPhone: '(803) 772-5688'
    },
    parentRights: [
      'You have the right to participate in your child\'s educational planning',
      'The school must consider your input about your child\'s needs',
      'You can request independent educational evaluations',
      'Your child has the right to receive services in the least restrictive environment',
      'You can file complaints if services are not provided appropriately'
    ],
    helpfulTips: [
      'South Carolina has strong family engagement initiatives',
      'Hurricane season considerations for emergency planning',
      'Hot, humid climate considerations for outdoor activities',
      'Coastal and mountain regions offer diverse educational opportunities'
    ]
  },
  'South Dakota': {
    name: 'South Dakota',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'South Dakota Department of Education - Special Education Programs',
      phone: '(605) 773-3678',
      website: 'https://doe.sd.gov/oess/',
      parentCenter: 'South Dakota Parent Connection',
      parentPhone: '(605) 361-3171'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational decisions',
      'The school must respect your family\'s cultural values',
      'You can request services that meet your child\'s individual needs',
      'Your child has the right to learn with non-disabled peers when appropriate',
      'You can appeal school decisions through state procedures'
    ],
    helpfulTips: [
      'South Dakota serves many rural and tribal communities',
      'Long distances may affect service delivery - ask about alternatives',
      'Severe winter weather considerations for transportation',
      'Strong agricultural heritage - explore farm-based learning if appropriate'
    ]
  },
  'Tennessee': {
    name: 'Tennessee',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Tennessee Department of Education - Division of Special Education',
      phone: '(615) 741-2851',
      website: 'https://www.tn.gov/education/districts/special-education.html',
      parentCenter: 'Support and Training for Exceptional Parents',
      parentPhone: '(423) 631-0432'
    },
    parentRights: [
      'You have the right to participate as an equal member of the IEP team',
      'The school must provide services based on your child\'s needs',
      'You can request additional evaluations if concerned about progress',
      'Your child has the right to receive appropriate behavioral supports',
      'You can request dispute resolution services'
    ],
    helpfulTips: [
      'Tennessee has strong music and arts programs that may benefit children',
      'Mountain regions may affect transportation - plan accordingly',
      'Tornado season considerations for emergency planning',
      'Strong community values - build positive relationships with educators'
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
  'Utah': {
    name: 'Utah',
    evaluationDays: 45,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Utah State Board of Education - Special Education Services',
      phone: '(801) 538-7587',
      website: 'https://www.schools.utah.gov/specialeducation',
      parentCenter: 'Utah Parent Center',
      parentPhone: '(801) 272-1051'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational planning',
      'The school must provide services that meet your child\'s needs',
      'You can request independent educational evaluations',
      'Your child has the right to learn in the least restrictive environment',
      'You can request mediation to resolve disagreements'
    ],
    helpfulTips: [
      'Utah has a 45-day evaluation timeline',
      'High altitude considerations for some children with health needs',
      'Strong family values - family input is highly valued in education',
      'Outdoor recreation opportunities - ensure safety accommodations'
    ]
  },
  'Vermont': {
    name: 'Vermont',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Vermont Agency of Education - Student Support Services',
      phone: '(802) 828-3141',
      website: 'https://education.vermont.gov/student-support/special-education',
      parentCenter: 'Vermont Family Network',
      parentPhone: '(802) 876-5315'
    },
    parentRights: [
      'You have the right to be treated as an equal partner in your child\'s education',
      'The school must include you in transition planning',
      'You can request specific accommodations for your child',
      'Your child has the right to receive services in natural environments',
      'You can request facilitated meetings when needed'
    ],
    helpfulTips: [
      'Vermont has small communities with personalized attention',
      'Winter weather considerations for transportation and activities',
      'Strong environmental education programs - ensure accessibility',
      'Rural setting may require creative service delivery options'
    ]
  },
  'Virginia': {
    name: 'Virginia',
    evaluationDays: 65,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Virginia Department of Education - Office of Special Education and Student Services',
      phone: '(804) 225-2675',
      website: 'https://www.doe.virginia.gov/special-ed-disability-services',
      parentCenter: 'Partnership for People with Disabilities',
      parentPhone: '(804) 828-3876'
    },
    parentRights: [
      'You have the right to participate in all meetings about your child',
      'The school must provide you with progress reports on IEP goals',
      'You can request additional services if your child needs them',
      'Your child has the right to be included with typical peers',
      'You can appeal decisions through due process hearings'
    ],
    helpfulTips: [
      'Virginia has a 65-day evaluation timeline',
      'Near Washington DC - many federal resources available',
      'Strong military presence - special support for military families',
      'Historical sites may need accessibility accommodations for field trips'
    ]
  },
  'Washington': {
    name: 'Washington',
    evaluationDays: 35,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Washington Office of Superintendent of Public Instruction - Special Education',
      phone: '(360) 725-6075',
      website: 'https://www.k12.wa.us/student-success/special-education',
      parentCenter: 'Washington PAVE',
      parentPhone: '(206) 827-2016'
    },
    parentRights: [
      'You have the right to be an equal partner in educational decisions',
      'The school must include you in planning your child\'s program',
      'You can request specific services and supports',
      'Your child has the right to learn in inclusive environments',
      'You can request alternative dispute resolution'
    ],
    helpfulTips: [
      'Washington has a 35-day evaluation timeline - one of the shortest',
      'Strong inclusive education practices',
      'Rainy season considerations for indoor activities',
      'Tech industry offers unique opportunities for assistive technology'
    ]
  },
  'West Virginia': {
    name: 'West Virginia',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'West Virginia Department of Education - Office of Special Education',
      phone: '(304) 558-2696',
      website: 'https://wvde.us/special-education/',
      parentCenter: 'West Virginia Parent Training and Information',
      parentPhone: '(304) 624-1436'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational decisions',
      'The school must consider your input about your child\'s needs',
      'You can request independent educational evaluations',
      'Your child has the right to receive services in the least restrictive environment',
      'You can file complaints if services are not provided appropriately'
    ],
    helpfulTips: [
      'West Virginia serves many rural mountain communities',
      'Transportation over mountain roads may be challenging in winter',
      'Strong community ties - build relationships with school staff',
      'Mining heritage - occupational health considerations may be relevant'
    ]
  },
  'Wisconsin': {
    name: 'Wisconsin',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Wisconsin Department of Public Instruction - Special Education',
      phone: '(608) 266-1781',
      website: 'https://dpi.wi.gov/sped',
      parentCenter: 'Wisconsin Family Assistance Center for Education',
      parentPhone: '(414) 374-4645'
    },
    parentRights: [
      'You have the right to participate as an equal member of the IEP team',
      'The school must provide services based on your child\'s individual needs',
      'You can request additional evaluations if needed',
      'Your child has the right to learn with non-disabled peers when appropriate',
      'You can request mediation before due process hearings'
    ],
    helpfulTips: [
      'Wisconsin has strong special education protections',
      'Cold winters affect transportation - plan for weather delays',
      'Great Lakes recreation - ensure water safety accommodations',
      'Strong dairy farming heritage - explore agricultural education if appropriate'
    ]
  },
  'Wyoming': {
    name: 'Wyoming',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    helpfulContacts: {
      office: 'Wyoming Department of Education - Special Education Unit',
      phone: '(307) 777-7417',
      website: 'https://edu.wyoming.gov/educators/pd/special-education/',
      parentCenter: 'Wyoming Parent Information Center',
      parentPhone: '(307) 684-2277'
    },
    parentRights: [
      'You have the right to be involved in your child\'s educational planning',
      'The school must consider your concerns and suggestions',
      'You can request services that meet your child\'s unique needs',
      'Your child has the right to receive appropriate special education services',
      'You can appeal school decisions through established procedures'
    ],
    helpfulTips: [
      'Wyoming serves many rural communities with long distances between towns',
      'Harsh winter weather considerations for transportation',
      'Small class sizes may benefit children with special needs',
      'Strong outdoor recreation opportunities - ensure safety accommodations'
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
                <AccessControlledToolButton
                  title="Request My Child's Records"
                  icon={FileText}
                  path="/parent/tools/smart-letter-generator?template=ferpa-request"
                  requiredFeature="smartLetterGenerator"
                  requiredPlan="free"
                />
                <AccessControlledToolButton
                  title="Ask for Testing"
                  icon={Users}
                  path="/parent/tools/smart-letter-generator?template=evaluation-request"
                  requiredFeature="smartLetterGenerator"
                  requiredPlan="free"
                />
                <AccessControlledToolButton
                  title="Request a Meeting"
                  icon={BookOpen}
                  path="/parent/tools/smart-letter-generator?template=iep-meeting-request"
                  requiredFeature="smartLetterGenerator"
                  requiredPlan="free"
                />
                <AccessControlledToolButton
                  title="Create Better Goals"
                  icon={Star}
                  path="/parent/tools/goal-generator"
                  requiredFeature="goalGenerator"
                  requiredPlan="premium"
                />
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