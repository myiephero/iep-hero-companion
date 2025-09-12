import { 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  Scale,
  Lightbulb, 
  BarChart3, 
  Target,
  MessageSquare, 
  Star,
  Clipboard, 
  Phone, 
  FileBarChart,
  Smile,
  Zap,
  PenTool,
  Sparkles,
  GraduationCap,
  Building,
  TrendingUp,
  DollarSign,
  Settings,
  FileCheck
} from "lucide-react";
import { PlanFeatures, SubscriptionPlan } from "@/lib/planAccess";

export interface AdvocateTool {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  badge: string;
  features: string[];
  requiredFeature: keyof PlanFeatures;
  requiredPlan: SubscriptionPlan;
  isPopular?: boolean;
  isNew?: boolean;
}

export const coreAdvocateTools: AdvocateTool[] = [
  {
    id: "unified-iep-review",
    title: "Unified IEP Review",
    description: "Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, and actionable improvement recommendations.",
    route: "/advocate/tools/unified-iep-review",
    icon: Brain,
    category: "AI Analysis",
    badge: "Enhanced",
    features: ["AI-powered analysis", "Quality scoring", "Compliance checks", "Professional insights"],
    requiredFeature: "unifiedIEPReview",
    requiredPlan: "starter",
    isPopular: true
  },
  {
    id: "iep-master-suite",
    title: "IEP Master Suite",
    description: "Complete IEP management toolkit with goal tracking, progress monitoring, and comprehensive reporting for professional advocacy.",
    route: "/advocate/tools/iep-master-suite",
    icon: FileBarChart,
    category: "IEP Planning",
    badge: "Master",
    features: ["Goal tracking", "Progress monitoring", "Comprehensive reporting", "Professional analysis"],
    requiredFeature: "professionalAnalysis",
    requiredPlan: "starter"
  },
  {
    id: "smart-letter-generator",
    title: "Smart Letter Generator",
    description: "Generate legally sound advocacy letters with professional templates and customization options.",
    route: "/smart-letter-generator",
    icon: PenTool,
    category: "Communication",
    badge: "Templates",
    features: ["Legal Language", "Professional Format", "Customization", "Client Templates"],
    requiredFeature: "smartLetterGenerator",
    requiredPlan: "starter"
  },
  {
    id: "rights-explainer",
    title: "Rights Explainer",
    description: "Plain-language legal rights guide with comprehensive special education law explanations.",
    route: "/idea-rights-guide",
    icon: Scale,
    category: "Legal Support",
    badge: "Legal",
    features: ["Legal Rights", "Plain Language", "Case Examples", "Resource Links"],
    requiredFeature: "ideaRightsGuide",
    requiredPlan: "starter"
  },
  {
    id: "meeting-prep-assistant",
    title: "Meeting Prep Assistant",
    description: "Generate talking points, meeting agendas, and professional preparation materials for IEP meetings.",
    route: "/meeting-prep-wizard",
    icon: Lightbulb,
    category: "Meeting Support",
    badge: "Prep",
    features: ["Meeting Agenda", "Talking Points", "Legal Strategy", "Documentation"],
    requiredFeature: "meetingPrepWizard",
    requiredPlan: "starter"
  },
  {
    id: "progress-analyzer",
    title: "Progress Analyzer",
    description: "Data-driven analysis and recommendations for IEP goals with professional reporting capabilities.",
    route: "/advocate/tools/progress-analyzer",
    icon: BarChart3,
    category: "Data Analysis",
    badge: "Analytics",
    features: ["Data Analysis", "Progress Reports", "Goal Tracking", "Outcome Metrics"],
    requiredFeature: "caseAnalytics",
    requiredPlan: "pro",
    isPopular: true
  },
  {
    id: "goal-generator",
    title: "IEP Goal Generator",
    description: "AI-powered SMART goal creation with professional standards and compliance verification.",
    route: "/advocate/tools/goal-generator",
    icon: Target,
    category: "IEP Planning",
    badge: "SMART",
    features: ["SMART Goals", "Standards Alignment", "Progress Metrics", "Compliance Check"],
    requiredFeature: "goalGenerator",
    requiredPlan: "starter"
  },
  {
    id: "advocate-messaging",
    title: "Advocate Messaging",
    description: "Secure communication platform for client interactions with professional documentation features.",
    route: "/messages",
    icon: MessageSquare,
    category: "Professional Support",
    badge: "Secure",
    features: ["Secure Messages", "Client Portal", "Document Sharing", "Communication Log"],
    requiredFeature: "advocateMessaging",
    requiredPlan: "starter"
  },
  {
    id: "ask-ai-docs",
    title: "Ask AI About Docs",
    description: "Query uploaded documents with AI assistance for quick insights and professional analysis.",
    route: "/advocate/tools/ask-ai-docs",
    icon: Sparkles,
    category: "AI Tools",
    badge: "AI",
    features: ["Document Query", "AI Analysis", "Quick Insights", "Professional Reports"],
    requiredFeature: "askAIAboutDocs",
    requiredPlan: "starter"
  },
  {
    id: "progress-notes",
    title: "Progress Notes & Service Log",
    description: "Comprehensive tracking of service delivery, client interactions, and professional outcomes.",
    route: "/advocate/tools/progress-notes",
    icon: Clipboard,
    category: "Case Management",
    badge: "Tracking",
    features: ["Service Logs", "Progress Notes", "Billing Support", "Compliance Records"],
    requiredFeature: "progressNotes",
    requiredPlan: "starter"
  },
  {
    id: "communication-tracker",
    title: "Communication Tracker",
    description: "Monitor and document all parent-school communications with professional analysis and recommendations.",
    route: "/advocate/tools/communication-tracker",
    icon: Phone,
    category: "Case Management",
    badge: "Monitor",
    features: ["Communication Log", "Analysis Tools", "Follow-up Tracking", "Legal Documentation"],
    requiredFeature: "communicationTracker",
    requiredPlan: "starter"
  },
  {
    id: "advocacy-reports",
    title: "Advocacy Reports",
    description: "Generate comprehensive client reports with professional analysis and actionable recommendations.",
    route: "/advocate/tools/advocacy-reports",
    icon: FileText,
    category: "Professional Support",
    badge: "Reports",
    features: ["Client Reports", "Progress Analysis", "Legal Summary", "Action Plans"],
    requiredFeature: "advocacyReports",
    requiredPlan: "pro"
  },
  {
    id: "emotion-tracker",
    title: "Emotion Tracker",
    description: "Student well-being monitoring tools with professional behavioral analysis and intervention planning.",
    route: "/advocate/tools/emotion-tracker",
    icon: Smile,
    category: "Behavioral Support",
    badge: "Wellness",
    features: ["Behavior Tracking", "Intervention Plans", "Progress Monitoring", "Professional Analysis"],
    requiredFeature: "emotionTracker",
    requiredPlan: "starter"
  },
  {
    id: "billing-tools",
    title: "Billing & Invoice Manager",
    description: "Professional billing system with time tracking, invoice generation, and client payment management.",
    route: "/advocate/tools/billing",
    icon: DollarSign,
    category: "Business Management",
    badge: "Pro",
    features: ["Time Tracking", "Invoice Generation", "Payment Processing", "Financial Reports"],
    requiredFeature: "billingTools",
    requiredPlan: "pro",
    isNew: true
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration Hub",
    description: "Multi-advocate collaboration tools with shared case management and team communication features.",
    route: "/advocate/tools/team-hub",
    icon: Users,
    category: "Team Management",
    badge: "Agency",
    features: ["Team Chat", "Shared Cases", "Role Management", "Collaborative Notes"],
    requiredFeature: "teamCollaboration",
    requiredPlan: "agency"
  }
];

export const specializedAdvocateTools: AdvocateTool[] = [
  {
    id: "autism-accommodations",
    title: "Autism Accommodation Builder",
    description: "Professional autism-specific accommodations with sensory, communication, and behavioral support.",
    route: "/autism-accommodations",
    icon: Brain,
    category: "Specialized Needs",
    badge: "Autism",
    features: ["Sensory Support", "Communication Plans", "Behavioral Strategies", "Professional Standards"],
    requiredFeature: "autismAccommodationBuilder",
    requiredPlan: "starter"
  },
  {
    id: "gifted-2e-tools",
    title: "Gifted & 2e Assessment Tools",
    description: "Comprehensive gifted assessment tools including cognitive, academic, creative, leadership, and AI insights.",
    route: "/advocate/gifted-tools",
    icon: GraduationCap,
    category: "Specialized Needs",
    badge: "2e",
    features: ["Cognitive Assessment", "Academic Evaluation", "Creative Analysis", "Leadership Profile", "AI Insights"],
    requiredFeature: "giftedTwoeSupport",
    requiredPlan: "pro"
  },
  {
    id: "504-plan-builder",
    title: "504 Plan Builder",
    description: "Section 504 accommodation planning with legal compliance and professional documentation.",
    route: "/advocate/tools/504-plan-builder",
    icon: Building,
    category: "Legal Planning",
    badge: "504",
    features: ["504 Compliance", "Accommodation Plans", "Legal Standards", "Documentation Tools"],
    requiredFeature: "plan504Builder",
    requiredPlan: "starter"
  },
  {
    id: "ot-activity-recommender",
    title: "OT Activity Recommender",
    description: "Professional occupational therapy activity suggestions and adaptations for IEP implementation.",
    route: "/advocate/tools/ot-recommender",
    icon: Zap,
    category: "Therapeutic Support",
    badge: "OT",
    features: ["OT Activities", "Professional Adaptations", "Progress Tracking", "Therapy Plans"],
    requiredFeature: "otActivityRecommender",
    requiredPlan: "pro"
  },
  {
    id: "business-manager",
    title: "Business Management Suite",
    description: "Complete business management tools for advocacy practices including client onboarding, contracts, and performance analytics.",
    route: "/advocate/tools/business-manager",
    icon: Settings,
    category: "Business Management",
    badge: "Enterprise",
    features: ["Client Onboarding", "Contract Management", "Performance Analytics", "Practice Growth Tools"],
    requiredFeature: "businessManagement",
    requiredPlan: "agency"
  },
  {
    id: "compliance-auditor",
    title: "Compliance Auditor",
    description: "Automated compliance checking for all advocacy work with regulatory updates and risk assessment.",
    route: "/advocate/tools/compliance-auditor",
    icon: FileCheck,
    category: "Quality Assurance",
    badge: "Agency+",
    features: ["Automated Compliance", "Risk Assessment", "Regulatory Updates", "Audit Trails"],
    requiredFeature: "specializedProfessionalTools",
    requiredPlan: "agency-plus"
  }
];

// Combined registry for easy access
export const allAdvocateTools: AdvocateTool[] = [
  ...coreAdvocateTools,
  ...specializedAdvocateTools
];

// Helper functions for tool management
export const getToolById = (id: string): AdvocateTool | undefined => {
  return allAdvocateTools.find(tool => tool.id === id);
};

export const getToolsByCategory = (category: string): AdvocateTool[] => {
  return allAdvocateTools.filter(tool => tool.category === category);
};

export const getToolsByPlan = (plan: SubscriptionPlan): AdvocateTool[] => {
  return allAdvocateTools.filter(tool => tool.requiredPlan === plan);
};

export const getAvailableToolsForPlan = (currentPlan: SubscriptionPlan): AdvocateTool[] => {
  const planHierarchy: Record<SubscriptionPlan, number> = {
    'free': 0,
    'essential': 1,
    'premium': 2,
    'hero': 3,
    'starter': 1,
    'pro': 2,
    'agency': 3,
    'agency-plus': 4
  };
  
  const currentPlanLevel = planHierarchy[currentPlan] || 0;
  return allAdvocateTools.filter(tool => {
    const requiredLevel = planHierarchy[tool.requiredPlan] || 0;
    return currentPlanLevel >= requiredLevel;
  });
};

export const getPopularTools = (): AdvocateTool[] => {
  return allAdvocateTools.filter(tool => tool.isPopular);
};

export const getNewTools = (): AdvocateTool[] => {
  return allAdvocateTools.filter(tool => tool.isNew);
};

export const getCategoriesWithCounts = (): Array<{category: string, count: number}> => {
  const categoryMap = new Map<string, number>();
  allAdvocateTools.forEach(tool => {
    categoryMap.set(tool.category, (categoryMap.get(tool.category) || 0) + 1);
  });
  return Array.from(categoryMap.entries()).map(([category, count]) => ({category, count}));
};