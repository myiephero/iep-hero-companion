import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { AccessControlledToolCard } from "@/components/AccessControlledToolCard";
import { Zap, Users, Star, FileText, Target, Building, BookOpen, Smile, TrendingUp, MessageSquare, Brain, Heart, Code } from "lucide-react";
import { useEffect, useState } from "react";
import { getToolRequiredPlan } from "@/lib/toolAccess";
import type { PlanFeatures, SubscriptionPlan } from "@/lib/planAccess";

// BUILD VERSION FOR ENVIRONMENT PARITY
const BUILD_ID = "BUILD_SEP10_2025_1531";

// COMPLETELY NEW FILE - TESTING 18 TOOLS WITH PROPER ACCESS CONTROL
interface ToolConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: string;
  badge: string;
  features: string[];
  requiredFeature: keyof PlanFeatures;
  requiredPlan: SubscriptionPlan;
}

const emergentTools: ToolConfig[] = [
  {
    title: "Unified IEP Review",
    description: "Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, and actionable improvement recommendations.",
    icon: Brain,
    path: "/parent/tools/unified-iep-review",
    category: "AI Analysis",
    badge: "Enhanced",
    features: ["AI-powered analysis", "Quality scoring", "Compliance checks"],
    requiredFeature: "unifiedIEPReview",
    requiredPlan: "essential"
  },
  {
    title: "Autism Accommodation Builder", 
    description: "Create autism-specific accommodations with sensory, communication, and behavioral support strategies.",
    icon: Users,
    path: "/parent/tools/autism-accommodation-builder",
    category: "Specialized Support", 
    badge: "Specialized",
    features: ["Sensory supports", "Communication aids", "Behavioral strategies"],
    requiredFeature: "autismAccommodationBuilder",
    requiredPlan: "premium"
  },
  {
    title: "Advocate Matching Tool",
    description: "Find and connect with qualified special education advocates in your area based on specialization and needs.",
    icon: Users,
    path: "/tools/advocate-matching",
    category: "Professional Support",
    badge: "Connect",
    features: ["Professional matching", "Local advocates", "Specialization search"],
    requiredFeature: "advocateMatchingTool",
    requiredPlan: "hero"
  },
  {
    title: "Gifted & 2e Learners",
    description: "Comprehensive profiles for gifted and twice-exceptional learners with strength-based planning.",
    icon: Star,
    path: "/tools/gifted-2e-learners",
    category: "Specialized Needs",
    badge: "2e",
    features: ["Gifted assessments", "2e profiles", "Strength-based planning"],
    requiredFeature: "giftedTwoeSupport",
    requiredPlan: "premium"
  },
  {
    title: "Smart Letter Generator",
    description: "Generate professional advocacy letters with templates for various special education situations.",
    icon: FileText,
    path: "/parent/tools/smart-letter-generator",
    category: "Communication",
    badge: "Templates",
    features: ["Letter templates", "Professional language", "Situation-specific"],
    requiredFeature: "smartLetterGenerator",
    requiredPlan: "free"
  },
  {
    title: "Meeting Prep Wizard",
    description: "Prepare for IEP meetings with guided checklists, goal setting, and question preparation.",
    icon: Target,
    path: "/parent/tools/meeting-prep",
    category: "Meeting Support",
    badge: "Prep",
    features: ["Meeting checklists", "Goal preparation", "Question guides"],
    requiredFeature: "meetingPrepWizard",
    requiredPlan: "essential"
  },
  {
    title: "Document Vault",
    description: "Secure storage and organization for all IEP documents, evaluations, and educational records.",
    icon: Building,
    path: "/tools/document-vault",
    category: "Organization",
    badge: "Secure",
    features: ["Secure storage", "Document organization", "Easy retrieval"],
    requiredFeature: "documentVault",
    requiredPlan: "essential"
  },
  {
    title: "Student Profiles",
    description: "Comprehensive student profiles with goals, accommodations, services, and progress tracking.",
    icon: BookOpen,
    path: "/tools/student-profiles",
    category: "Student Management",
    badge: "Core",
    features: ["Profile management", "Goal tracking", "Progress monitoring"],
    requiredFeature: "studentProfileManagement",
    requiredPlan: "free"
  },
  {
    title: "Expert Analysis",
    description: "Professional expert analysis and detailed assessments with comprehensive reporting and recommendations.",
    icon: Target,
    path: "/parent/tools/expert-analysis",
    category: "Professional Support",
    badge: "Pro",
    features: ["Expert reviews", "Professional analysis", "Detailed reports"],
    requiredFeature: "expertAnalysis",
    requiredPlan: "premium"
  },
  {
    title: "Emotion Tracker",
    description: "Track your child's emotional well-being and behavioral patterns to support their success and communicate with school teams.",
    icon: Smile,
    path: "/parent/tools/emotion-tracker",
    category: "Wellness Support",
    badge: "Wellness",
    features: ["Emotion tracking", "Behavioral patterns", "School communication"],
    requiredFeature: "emotionTracker",
    requiredPlan: "essential"
  },
  {
    title: "IEP Goal Helper",
    description: "Learn about IEP goals, create personalized goals for your child, and check if existing goals meet quality standards.",
    icon: Target,
    path: "/parent/tools/goal-generator",
    category: "IEP Planning",
    badge: "Parent-Friendly",
    features: ["Goal creation", "Quality checking", "Parent education"],
    requiredFeature: "goalGenerator",
    requiredPlan: "essential"
  },
  {
    title: "Parent IEP Helper Suite",
    description: "Complete IEP toolkit for parents - understand IEPs, analyze documents, check goals, and see examples in simple language.",
    icon: Brain,
    path: "/parent/tools/iep-master-suite",
    category: "IEP Analysis",
    badge: "Pro",
    features: ["Document analysis", "Goal checking", "Parent education"],
    requiredFeature: "unifiedIEPReview",
    requiredPlan: "essential"
  },
  {
    title: "Your Child's Rights Guide",
    description: "Simple explanations of your child's rights under IDEA with state-specific information and practical tips for parents.",
    icon: Heart,
    path: "/parent/tools/idea-rights-guide",
    category: "Legal & Rights",
    badge: "Parent-Friendly",
    features: ["Rights education", "State-specific info", "Practical tips"],
    requiredFeature: "ideaRightsGuide",
    requiredPlan: "free"
  },
  {
    title: "Plan 504 Guide",
    description: "NEW! Comprehensive guide to Section 504 plans with templates, eligibility criteria, and accommodation recommendations.",
    icon: BookOpen,
    path: "/parent/tools/plan-504-guide",
    category: "Legal & Rights",
    badge: "Essential",
    features: ["504 plan guide", "Eligibility info", "Accommodation templates"],
    requiredFeature: "plan504Guide",
    requiredPlan: "essential"
  },
  {
    title: "Progress Notes Tracker",
    description: "NEW! Track your child's academic and behavioral progress with detailed notes, milestones, and data collection.",
    icon: TrendingUp,
    path: "/parent/tools/progress-notes",
    category: "Student Management",
    badge: "Tracking",
    features: ["Progress tracking", "Milestone recording", "Data collection"],
    requiredFeature: "progressNotes",
    requiredPlan: "essential"
  },
  {
    title: "Ask AI About Documents",
    description: "NEW! Upload any educational document and get instant AI-powered answers to your questions about content and implications.",
    icon: MessageSquare,
    path: "/parent/tools/ask-ai-documents",
    category: "AI Support",
    badge: "Interactive",
    features: ["Document upload", "AI analysis", "Instant answers"],
    requiredFeature: "askAIAboutDocs",
    requiredPlan: "essential"
  },
  {
    title: "Communication Tracker",
    description: "NEW! Log and organize all communications with school staff, including emails, meetings, and phone calls with follow-up reminders.",
    icon: MessageSquare,
    path: "/parent/tools/communication-tracker",
    category: "Communication",
    badge: "Organize",
    features: ["Communication logs", "Follow-up reminders", "School correspondence"],
    requiredFeature: "communicationTracker",
    requiredPlan: "essential"
  },
  {
    title: "OT Activity Recommender",
    description: "NEW! Get personalized occupational therapy activity suggestions based on your child's specific needs and goals.",
    icon: Target,
    path: "/parent/tools/ot-activities",
    category: "Therapy Support",
    badge: "Personalized",
    features: ["Activity suggestions", "Personalized recommendations", "OT support"],
    requiredFeature: "otActivityRecommender",
    requiredPlan: "premium"
  }
];

export default function EmergentToolsHubNew() {
  const [apiVersion, setApiVersion] = useState<string>('');
  
  useEffect(() => {
    // Log BUILD_ID to console immediately
    console.log('🔥 FRONTEND BUILD_ID:', BUILD_ID);
    console.log('🆕 NEW FILE LOADED - 18 tools:', emergentTools.length);
    
    // Fetch API version to confirm environment parity
    fetch('/api/_version')
      .then(res => res.json())
      .then(data => {
        console.log('🔥 BACKEND BUILD_ID:', data.build_id);
        setApiVersion(data.build_id);
        if (data.build_id === BUILD_ID) {
          console.log('✅ ENVIRONMENT PARITY CONFIRMED!');
        } else {
          console.log('❌ ENVIRONMENT MISMATCH DETECTED!');
        }
      })
      .catch(err => console.log('❌ Could not fetch API version:', err));
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My IEP Hero Tools</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive suite of specialized tools designed to empower parents and advocates in creating effective IEPs and supporting student success.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Complete Toolkit for Special Education Advocacy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {emergentTools.map((tool) => (
              <AccessControlledToolCard
                key={tool.title}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                path={tool.path}
                badge={tool.badge}
                features={tool.features}
                requiredFeature={tool.requiredFeature}
                requiredPlan={tool.requiredPlan}
                className="h-[280px]"
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}