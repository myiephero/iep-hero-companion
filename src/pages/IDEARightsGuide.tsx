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

// State-specific special education information for all 50 states
const STATE_INFO = {
  'Alabama': {
    name: 'Alabama',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Alabama Administrative Code 290-8-9',
      'Alabama Code Title 16 Chapter 39'
    ],
    contacts: {
      seaOffice: 'Alabama Department of Education - Special Education Services',
      phone: '(334) 694-4900',
      website: 'https://www.alsde.edu/sec/ses',
      email: 'specialeducation@alsde.edu'
    },
    uniqueRights: [
      'Enhanced transition services for students with disabilities',
      'Additional protections for students in rural areas',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'Alabama Parent Information Center',
        url: 'https://www.alabamaparentcenter.com/',
        description: 'Parent training and information center for Alabama'
      },
      {
        name: 'Alabama Disabilities Advocacy Program',
        url: 'https://adap.ua.edu/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Alaska': {
    name: 'Alaska',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Alaska Administrative Code Title 4 Chapter 52',
      'Alaska Statutes Title 14 Chapter 30'
    ],
    contacts: {
      seaOffice: 'Alaska Department of Education - Special Education',
      phone: '(907) 465-2972',
      website: 'https://education.alaska.gov/tls/sped',
      email: 'specialeducation@alaska.gov'
    },
    uniqueRights: [
      'Enhanced services for students in remote areas',
      'Additional protections for Alaska Native students',
      'Specialized transportation requirements'
    ],
    resources: [
      {
        name: 'PARENTS Inc.',
        url: 'https://www.parentsinc.org/',
        description: 'Alaska parent information center'
      },
      {
        name: 'Disability Law Center of Alaska',
        url: 'https://dlcak.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Arizona': {
    name: 'Arizona',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Arizona Revised Statutes Title 15 Chapter 7',
      'Arizona Administrative Code Title 7 Chapter 2'
    ],
    contacts: {
      seaOffice: 'Arizona Department of Education - Exceptional Student Services',
      phone: '(602) 542-4013',
      website: 'https://www.azed.gov/specialeducation/',
      email: 'ess@azed.gov'
    },
    uniqueRights: [
      'Specific provisions for English language learners',
      'Enhanced autism support services',
      'Additional protections for tribal students'
    ],
    resources: [
      {
        name: 'Raising Special Kids',
        url: 'https://www.raisingspecialkids.org/',
        description: 'Arizona parent information center'
      },
      {
        name: 'Arizona Center for Disability Law',
        url: 'https://www.acdl.com/',
        description: 'Legal advocacy for disability rights'
      }
    ]
  },
  'Arkansas': {
    name: 'Arkansas',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Arkansas Code Annotated Title 6 Subtitle 4 Chapter 41',
      'Arkansas Department of Education Rules and Regulations'
    ],
    contacts: {
      seaOffice: 'Arkansas Department of Education - Special Education Unit',
      phone: '(501) 682-4221',
      website: 'https://dese.ade.arkansas.gov/Offices/special-education',
      email: 'specialeducation@arkansas.gov'
    },
    uniqueRights: [
      'Enhanced rural area services',
      'Additional autism spectrum disorder provisions',
      'Specific protections for low-income families'
    ],
    resources: [
      {
        name: 'Arkansas Parent Information Center',
        url: 'https://www.arparentcenter.org/',
        description: 'Parent training and information center'
      },
      {
        name: 'Disability Rights Arkansas',
        url: 'https://disabilityrightsar.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
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
  'Colorado': {
    name: 'Colorado',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Colorado Revised Statutes Title 22 Article 20',
      'Colorado Code of Regulations Title 1 Chapter 301-8'
    ],
    contacts: {
      seaOffice: 'Colorado Department of Education - Exceptional Student Services Unit',
      phone: '(303) 866-6694',
      website: 'https://www.cde.state.co.us/cdesped',
      email: 'specialeducation@cde.state.co.us'
    },
    uniqueRights: [
      'Enhanced gifted education provisions',
      'Additional protections for students with significant support needs',
      'Specific autism spectrum disorder services'
    ],
    resources: [
      {
        name: 'PEAK Parent Center',
        url: 'https://www.peakparent.org/',
        description: 'Colorado parent information center'
      },
      {
        name: 'The Legal Center for People with Disabilities',
        url: 'https://www.thelegalcenter.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Connecticut': {
    name: 'Connecticut',
    evaluationDays: 45,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Connecticut General Statutes Section 10-76',
      'Connecticut Regulations of State Agencies Section 10-76d'
    ],
    contacts: {
      seaOffice: 'Connecticut State Department of Education - Bureau of Special Education',
      phone: '(860) 713-6910',
      website: 'https://portal.ct.gov/SDE/Special-Education/',
      email: 'specialeducation@ct.gov'
    },
    uniqueRights: [
      'Enhanced early intervention services',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'Connecticut Parent Information Center',
        url: 'https://www.ctpic.org/',
        description: 'Parent training and information center'
      },
      {
        name: 'Disability Rights Connecticut',
        url: 'https://www.disrightsct.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Delaware': {
    name: 'Delaware',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Delaware Code Title 14 Chapter 31',
      'Delaware Administrative Code Title 14 Department of Education'
    ],
    contacts: {
      seaOffice: 'Delaware Department of Education - Exceptional Children Resources',
      phone: '(302) 735-4210',
      website: 'https://www.doe.k12.de.us/domain/226',
      email: 'specialeducation@doe.k12.de.us'
    },
    uniqueRights: [
      'Enhanced transition planning services',
      'Additional protections for students with multiple disabilities',
      'Specific autism support provisions'
    ],
    resources: [
      {
        name: 'Parent Information Center of Delaware',
        url: 'https://www.picofdel.org/',
        description: 'Delaware parent information center'
      },
      {
        name: 'Community Legal Aid Society',
        url: 'https://www.declasi.org/',
        description: 'Legal advocacy services'
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
  'Georgia': {
    name: 'Georgia',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Georgia Code Title 20 Chapter 2 Article 6',
      'Georgia Department of Education Rules 160-4-7'
    ],
    contacts: {
      seaOffice: 'Georgia Department of Education - Special Education Services',
      phone: '(404) 656-3963',
      website: 'https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Special-Education-Services',
      email: 'specialeducation@doe.k12.ga.us'
    },
    uniqueRights: [
      'Enhanced early intervention provisions',
      'Additional protections for students with autism',
      'Specific provisions for gifted students with disabilities'
    ],
    resources: [
      {
        name: 'Georgia Parent Information Center',
        url: 'https://www.parentinformationcenter.org/',
        description: 'Parent training and information center'
      },
      {
        name: 'Georgia Advocacy Office',
        url: 'https://www.thegao.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Hawaii': {
    name: 'Hawaii',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Hawaii Revised Statutes Chapter 302A',
      'Hawaii Administrative Rules Title 8 Chapter 60'
    ],
    contacts: {
      seaOffice: 'Hawaii Department of Education - Special Education Section',
      phone: '(808) 305-9600',
      website: 'https://www.hawaiipublicschools.org/TeachingAndLearning/SpecializedPrograms/SpecialEducation/',
      email: 'specialeducation@hawaiidoe.org'
    },
    uniqueRights: [
      'Enhanced services for Native Hawaiian students',
      'Additional protections for students on remote islands',
      'Specific provisions for multi-language learners'
    ],
    resources: [
      {
        name: 'AWARE - Special Parent Information Network',
        url: 'https://www.spin-hawaii.org/',
        description: 'Hawaii parent information center'
      },
      {
        name: 'Disability and Communication Access Board',
        url: 'https://health.hawaii.gov/dcab/',
        description: 'Disability rights and advocacy'
      }
    ]
  },
  'Idaho': {
    name: 'Idaho',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Idaho Code Title 33 Chapter 20',
      'Idaho Administrative Code Title 08 Chapter 02'
    ],
    contacts: {
      seaOffice: 'Idaho Department of Education - Special Education',
      phone: '(208) 332-6800',
      website: 'https://www.sde.idaho.gov/sped/',
      email: 'specialeducation@sde.idaho.gov'
    },
    uniqueRights: [
      'Enhanced rural area services',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'Idaho Parents Unlimited',
        url: 'https://www.ipulidaho.org/',
        description: 'Idaho parent information center'
      },
      {
        name: 'Disability Rights Idaho',
        url: 'https://disabilityrightsidaho.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Illinois': {
    name: 'Illinois',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Illinois School Code Article 14',
      'Illinois Administrative Code Title 23 Part 226'
    ],
    contacts: {
      seaOffice: 'Illinois State Board of Education - Special Education Services',
      phone: '(217) 782-5589',
      website: 'https://www.isbe.net/specialed',
      email: 'specialeducation@isbe.net'
    },
    uniqueRights: [
      'Enhanced early childhood special education',
      'Additional protections for students with multiple disabilities',
      'Specific autism spectrum disorder provisions'
    ],
    resources: [
      {
        name: 'Family Resource Center on Disabilities',
        url: 'https://www.frcd.org/',
        description: 'Illinois parent information center'
      },
      {
        name: 'Equip for Equality',
        url: 'https://www.equipforequality.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Indiana': {
    name: 'Indiana',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Indiana Code Title 20 Article 35',
      'Indiana Administrative Code Title 511 Article 7'
    ],
    contacts: {
      seaOffice: 'Indiana Department of Education - Office of Special Education',
      phone: '(317) 232-0570',
      website: 'https://www.doe.in.gov/specialed',
      email: 'specialeducation@doe.in.gov'
    },
    uniqueRights: [
      'Enhanced transition planning services',
      'Additional protections for students with autism',
      'Specific provisions for rural area students'
    ],
    resources: [
      {
        name: 'IN*SOURCE',
        url: 'https://www.insource.org/',
        description: 'Indiana parent information center'
      },
      {
        name: 'Indiana Disability Rights',
        url: 'https://www.in.gov/idr/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Iowa': {
    name: 'Iowa',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Iowa Code Chapter 256B',
      'Iowa Administrative Code Chapter 281-41'
    ],
    contacts: {
      seaOffice: 'Iowa Department of Education - Bureau of Special Education',
      phone: '(515) 281-3176',
      website: 'https://educateiowa.gov/pk-12/special-education',
      email: 'specialeducation@iowa.gov'
    },
    uniqueRights: [
      'Enhanced early childhood services',
      'Additional protections for students with significant needs',
      'Specific autism support provisions'
    ],
    resources: [
      {
        name: 'ASK Resource Center',
        url: 'https://www.askresource.org/',
        description: 'Iowa parent information center'
      },
      {
        name: 'Iowa Disability Rights',
        url: 'https://disabilityrightsiowa.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Kansas': {
    name: 'Kansas',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Kansas Statutes Chapter 72 Article 34',
      'Kansas Administrative Regulations Title 91 Article 40'
    ],
    contacts: {
      seaOffice: 'Kansas Department of Education - Special Education Services',
      phone: '(785) 296-1413',
      website: 'https://www.ksde.org/Agency/Division-of-Learning-Services/Special-Education-and-Title-Services',
      email: 'specialeducation@ksde.org'
    },
    uniqueRights: [
      'Enhanced rural education services',
      'Additional protections for students with autism',
      'Specific provisions for gifted students with disabilities'
    ],
    resources: [
      {
        name: 'Families Together',
        url: 'https://www.familiestogether.org/',
        description: 'Kansas parent information center'
      },
      {
        name: 'Kansas Advocacy and Protective Services',
        url: 'https://www.drckansas.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Kentucky': {
    name: 'Kentucky',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Kentucky Revised Statutes Chapter 157',
      'Kentucky Administrative Regulations Title 707 Chapter 1'
    ],
    contacts: {
      seaOffice: 'Kentucky Department of Education - Office of Special Education',
      phone: '(502) 564-4970',
      website: 'https://education.ky.gov/specialed/',
      email: 'specialeducation@education.ky.gov'
    },
    uniqueRights: [
      'Enhanced transition planning requirements',
      'Additional protections for students with multiple disabilities',
      'Specific autism spectrum disorder services'
    ],
    resources: [
      {
        name: 'Kentucky Special Parent Involvement Network',
        url: 'https://www.kyspin.com/',
        description: 'Kentucky parent information center'
      },
      {
        name: 'Protection & Advocacy',
        url: 'https://www.kypa.net/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Louisiana': {
    name: 'Louisiana',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Louisiana Revised Statutes Title 17 Chapter 24',
      'Louisiana Administrative Code Title 28 Part LXI'
    ],
    contacts: {
      seaOffice: 'Louisiana Department of Education - Special Education',
      phone: '(225) 342-3633',
      website: 'https://www.louisianabelieves.com/academics/special-education',
      email: 'specialeducation@la.gov'
    },
    uniqueRights: [
      'Enhanced hurricane and disaster preparedness for students with disabilities',
      'Additional protections for students with autism',
      'Specific provisions for rural area services'
    ],
    resources: [
      {
        name: 'Families Helping Families',
        url: 'https://www.fhflouisiana.org/',
        description: 'Louisiana parent information center'
      },
      {
        name: 'Advocacy Center',
        url: 'https://advocacyla.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Maine': {
    name: 'Maine',
    evaluationDays: 45,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Maine Revised Statutes Title 20-A Chapter 301',
      'Maine Department of Education Rules Chapter 101'
    ],
    contacts: {
      seaOffice: 'Maine Department of Education - Office of Special Services',
      phone: '(207) 624-6650',
      website: 'https://www.maine.gov/doe/Learning/specialservices',
      email: 'specialservices@maine.gov'
    },
    uniqueRights: [
      'Enhanced rural area services',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'Maine Parent Federation',
        url: 'https://www.mpf.org/',
        description: 'Maine parent information center'
      },
      {
        name: 'Disability Rights Maine',
        url: 'https://www.drme.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Maryland': {
    name: 'Maryland',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Maryland Code Education Article Title 8',
      'Code of Maryland Regulations Title 13A'
    ],
    contacts: {
      seaOffice: 'Maryland State Department of Education - Division of Special Education',
      phone: '(410) 767-0238',
      website: 'https://www.marylandpublicschools.org/programs/Pages/Special-Education/index.aspx',
      email: 'specialeducation@msde.maryland.gov'
    },
    uniqueRights: [
      'Enhanced early intervention services',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'Parents\' Place of Maryland',
        url: 'https://ppmd.org/',
        description: 'Maryland parent information center'
      },
      {
        name: 'Disability Rights Maryland',
        url: 'https://disabilityrightsmd.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Massachusetts': {
    name: 'Massachusetts',
    evaluationDays: 30,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Massachusetts General Laws Chapter 71B',
      'Massachusetts Code of Regulations Title 603 CMR 28.00'
    ],
    contacts: {
      seaOffice: 'Massachusetts Department of Elementary and Secondary Education - Special Education',
      phone: '(781) 338-3375',
      website: 'https://www.doe.mass.edu/sped/',
      email: 'specialeducation@mass.gov'
    },
    uniqueRights: [
      'Enhanced early childhood special education',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'Federation for Children with Special Needs',
        url: 'https://fcsn.org/',
        description: 'Massachusetts parent information center'
      },
      {
        name: 'Disability Law Center',
        url: 'https://www.dlc-ma.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Michigan': {
    name: 'Michigan',
    evaluationDays: 30,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Michigan Compiled Laws Chapter 380',
      'Michigan Administrative Code R 340.1701'
    ],
    contacts: {
      seaOffice: 'Michigan Department of Education - Office of Special Education',
      phone: '(517) 241-7065',
      website: 'https://www.michigan.gov/mde/services/special-education',
      email: 'specialeducation@michigan.gov'
    },
    uniqueRights: [
      'Enhanced transition planning services',
      'Additional protections for students with autism',
      'Specific provisions for rural and urban areas'
    ],
    resources: [
      {
        name: 'Arc Michigan',
        url: 'https://www.arcmi.org/',
        description: 'Michigan parent information center'
      },
      {
        name: 'Michigan Protection and Advocacy Service',
        url: 'https://www.mpas.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Minnesota': {
    name: 'Minnesota',
    evaluationDays: 30,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Minnesota Statutes Chapter 125A',
      'Minnesota Rules Chapter 3525'
    ],
    contacts: {
      seaOffice: 'Minnesota Department of Education - Special Education',
      phone: '(651) 582-8689',
      website: 'https://education.mn.gov/MDE/dse/sped/',
      email: 'specialeducation@state.mn.us'
    },
    uniqueRights: [
      'Enhanced early childhood services',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'PACER Center',
        url: 'https://www.pacer.org/',
        description: 'Minnesota parent information center'
      },
      {
        name: 'Mid-Minnesota Legal Aid',
        url: 'https://www.mylegalaid.org/',
        description: 'Legal advocacy services'
      }
    ]
  },
  'Mississippi': {
    name: 'Mississippi',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Mississippi Code Title 37 Chapter 23',
      'Mississippi Administrative Code Title 7 Part 3'
    ],
    contacts: {
      seaOffice: 'Mississippi Department of Education - Office of Special Education',
      phone: '(601) 359-3498',
      website: 'https://www.mdek12.org/OSE',
      email: 'specialeducation@mdek12.ms.gov'
    },
    uniqueRights: [
      'Enhanced rural area services',
      'Additional protections for students with disabilities in poverty',
      'Specific autism spectrum disorder provisions'
    ],
    resources: [
      {
        name: 'Mississippi Parent Information Center',
        url: 'https://www.mspic.com/',
        description: 'Mississippi parent information center'
      },
      {
        name: 'Mississippi Protection & Advocacy System',
        url: 'https://www.mspas.com/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Missouri': {
    name: 'Missouri',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Missouri Revised Statutes Chapter 162',
      'Missouri Code of State Regulations Title 5 Division 30'
    ],
    contacts: {
      seaOffice: 'Missouri Department of Elementary and Secondary Education - Special Education',
      phone: '(573) 751-5739',
      website: 'https://dese.mo.gov/special-education',
      email: 'specialeducation@dese.mo.gov'
    },
    uniqueRights: [
      'Enhanced transition planning services',
      'Additional protections for students with autism',
      'Specific provisions for rural area students'
    ],
    resources: [
      {
        name: 'Missouri Parents Act',
        url: 'https://www.mpact.org/',
        description: 'Missouri parent information center'
      },
      {
        name: 'Missouri Protection and Advocacy Services',
        url: 'https://www.moadvocacy.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Montana': {
    name: 'Montana',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Montana Code Annotated Title 20 Chapter 7',
      'Montana Administrative Rules Title 10 Chapter 16'
    ],
    contacts: {
      seaOffice: 'Montana Office of Public Instruction - Special Education',
      phone: '(406) 444-4429',
      website: 'https://opi.mt.gov/Educators/Teaching-Learning/Special-Education',
      email: 'specialeducation@mt.gov'
    },
    uniqueRights: [
      'Enhanced rural area services',
      'Additional protections for Native American students',
      'Specific provisions for students in remote areas'
    ],
    resources: [
      {
        name: 'Montana Parents Let\'s Unite for Kids',
        url: 'https://www.pluk.org/',
        description: 'Montana parent information center'
      },
      {
        name: 'Disability Rights Montana',
        url: 'https://www.disabilityrightsmt.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Nebraska': {
    name: 'Nebraska',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Nebraska Revised Statutes Chapter 79 Article 11',
      'Nebraska Administrative Code Title 92 Chapter 51'
    ],
    contacts: {
      seaOffice: 'Nebraska Department of Education - Special Education',
      phone: '(402) 471-2471',
      website: 'https://www.education.ne.gov/sped/',
      email: 'specialeducation@nebraska.gov'
    },
    uniqueRights: [
      'Enhanced rural education services',
      'Additional protections for students with autism',
      'Specific provisions for assistive technology'
    ],
    resources: [
      {
        name: 'PTI Nebraska',
        url: 'https://www.pti-nebraska.org/',
        description: 'Nebraska parent information center'
      },
      {
        name: 'Disability Rights Nebraska',
        url: 'https://www.disabilityrightsnebraska.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'Nevada': {
    name: 'Nevada',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'Nevada Revised Statutes Chapter 388',
      'Nevada Administrative Code Chapter 388'
    ],
    contacts: {
      seaOffice: 'Nevada Department of Education - Office for a Safe and Respectful Learning Environment',
      phone: '(775) 687-7220',
      website: 'http://www.doe.nv.gov/Special_Education/',
      email: 'specialeducation@doe.nv.gov'
    },
    uniqueRights: [
      'Enhanced services for students in rural areas',
      'Additional protections for English language learners',
      'Specific autism spectrum disorder provisions'
    ],
    resources: [
      {
        name: 'Nevada PEP',
        url: 'https://www.nvpep.org/',
        description: 'Nevada parent information center'
      },
      {
        name: 'Nevada Disability Advocacy & Law Center',
        url: 'https://www.ndalc.org/',
        description: 'Protection and advocacy services'
      }
    ]
  },
  'New Hampshire': {
    name: 'New Hampshire',
    evaluationDays: 60,
    iepDays: 30,
    recordsDays: 45,
    priorNoticeDays: 10,
    duProcessTimeline: '2 years',
    specificLaws: [
      'New Hampshire Revised Statutes Title XV Chapter 186-C',
      'New Hampshire Code of Administrative Rules Ed 1100'
    ],
    contacts: {
      seaOffice: 'New Hampshire Department of Education - Bureau of Student Suppo

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