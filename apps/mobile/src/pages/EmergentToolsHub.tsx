import { useState, startTransition, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToolAccess } from "@/hooks/useToolAccess";
import { 
  MobileAppShell,
  PremiumLargeHeader,
  PremiumToolCard,
  PremiumCard,
  SafeAreaFull,
  ContainerMobile
} from "@/components/mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, Star, FileText, Target, Building, BookOpen, Smile, TrendingUp, MessageSquare, Brain, Heart, Crown, Sparkles, Search, ArrowRight, Shield } from "lucide-react";
import { getPlanDisplayName } from "@/lib/planAccess";
import { PlanFeatures } from "@/lib/planAccess";

// ALL 18 EMERGENT TOOLS - COMPLETE REFRESH v2.0 with Access Control
interface EmergentTool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: string;
  badge: string;
  features: string[];
  requiredFeature: keyof PlanFeatures;
}

const emergentTools: EmergentTool[] = [
  {
    title: "Unified IEP Review",
    description: "Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, and actionable improvement recommendations.",
    icon: Brain,
    path: "/parent/tools/unified-iep-review",
    category: "AI Analysis",
    badge: "Enhanced",
    features: ["AI Analysis", "Quality Scoring", "Compliance Check", "Improvement Plan"],
    requiredFeature: 'unifiedIEPReview'
  },
  {
    title: "Autism Accommodation Builder",
    description: "Create autism-specific accommodations with sensory, communication, and behavioral support strategies.",
    icon: Users,
    path: "/parent/tools/autism-accommodation-builder",
    category: "Specialized Support",
    badge: "Specialized",
    features: ["Sensory Support", "Communication Aid", "Behavioral Strategies", "School Collaboration"],
    requiredFeature: 'autismAccommodationBuilder'
  },
  {
    title: "Advocate Matching Tool",
    description: "Find and connect with qualified special education advocates in your area based on specialization and needs.",
    icon: Users,
    path: "/parent/tools/advocate-matching",
    category: "Professional Support",
    badge: "Connect",
    features: ["Expert Matching", "Direct Messaging", "Reviews & Ratings", "Specialization Filter"],
    requiredFeature: 'advocateMatchingTool'
  },
  {
    title: "Gifted & 2e Learners",
    description: "Comprehensive profiles for gifted and twice-exceptional learners with strength-based planning.",
    icon: Star,
    path: "/parent/tools/gifted-2e-learners",
    category: "Specialized Needs",
    badge: "2e",
    features: ["Giftedness Areas", "Learning Differences", "Acceleration Plans", "Enrichment Activities"],
    requiredFeature: 'giftedTwoeSupport'
  },
  {
    title: "Smart Letter Generator",
    description: "Generate professional advocacy letters with templates for various special education situations.",
    icon: FileText,
    path: "/parent/tools/smart-letter-generator",
    category: "Communication",
    badge: "Templates",
    features: ["Letter Templates", "Legal Language", "Customization", "Professional Format"],
    requiredFeature: 'smartLetterGenerator'
  },
  {
    title: "Meeting Prep Wizard",
    description: "Prepare for IEP meetings with guided checklists, goal setting, and question preparation.",
    icon: Target,
    path: "/parent/tools/meeting-prep",
    category: "Meeting Support",
    badge: "Prep",
    features: ["Meeting Agenda", "Goal Tracking", "Question Lists", "Action Items"],
    requiredFeature: 'meetingPrepWizard'
  },
  {
    title: "Document Vault",
    description: "Secure storage and organization for all IEP documents, evaluations, and educational records.",
    icon: Building,
    path: "/parent/tools/document-vault",
    category: "Organization",
    badge: "Secure",
    features: ["Secure Storage", "Easy Organization", "Quick Search", "Share & Export"],
    requiredFeature: 'documentVault'
  },
  {
    title: "Student Profiles",
    description: "Comprehensive student profiles with goals, accommodations, services, and progress tracking.",
    icon: BookOpen,
    path: "/parent/tools/student-profiles",
    category: "Student Management",
    badge: "Core",
    features: ["Goal Tracking", "Service Plans", "Progress Notes", "Timeline View"],
    requiredFeature: 'studentProfileManagement'
  },
  {
    title: "Expert Analysis",
    description: "Professional expert analysis and detailed assessments with comprehensive reporting and recommendations.",
    icon: Target,
    path: "/parent/tools/expert-analysis",
    category: "Professional Support",
    badge: "Pro",
    features: ["Expert Review", "Detailed Reports", "Professional Insights", "Action Plans"],
    requiredFeature: 'expertAnalysis'
  },
  {
    title: "Emotion Tracker",
    description: "Track your child's emotional well-being and behavioral patterns to support their success and communicate with school teams.",
    icon: Smile,
    path: "/parent/tools/emotion-tracker",
    category: "Wellness Support",
    badge: "Wellness",
    features: ["Daily Check-ins", "Mood Tracking", "Pattern Analysis", "Family Support"],
    requiredFeature: 'emotionTracker'
  },
  {
    title: "IEP Goal Helper",
    description: "Learn about IEP goals, create personalized goals for your child, and check if existing goals meet quality standards.",
    icon: Target,
    path: "/parent/tools/goal-generator",
    category: "IEP Planning",
    badge: "Parent-Friendly",
    features: ["Goal Education", "Smart Goal Creation", "Quality Checker", "Parent Guide"],
    requiredFeature: 'goalGenerator'
  },
  {
    title: "Parent IEP Helper Suite",
    description: "Complete IEP toolkit for parents - understand IEPs, analyze documents, check goals, and see examples in simple language.",
    icon: Brain,
    path: "/parent/tools/iep-master-suite",
    category: "IEP Analysis",
    badge: "Pro",
    features: ["IEP Education", "Document Analysis", "Goal Checker", "Parent Examples"],
    requiredFeature: 'aiIEPReview'
  },
  {
    title: "Your Child's Rights Guide",
    description: "Simple explanations of your child's rights under IDEA with state-specific information and practical tips for parents.",
    icon: Heart,
    path: "/parent/tools/idea-rights-guide",
    category: "Legal & Rights",
    badge: "Parent-Friendly",
    features: ["IDEA Rights", "State Laws", "Parent Tips", "Contact Info"],
    requiredFeature: 'ideaRightsGuide'
  },
  {
    title: "Plan 504 Guide",
    description: "Comprehensive guide to Section 504 plans with templates, eligibility criteria, and accommodation recommendations.",
    icon: BookOpen,
    path: "/parent/tools/plan-504-guide",
    category: "Legal & Rights",
    badge: "Essential",
    features: ["504 vs IEP", "Eligibility Guide", "Accommodation Templates", "Legal Rights"],
    requiredFeature: 'plan504Guide'
  },
  {
    title: "Progress Notes Tracker",
    description: "Track your child's academic and behavioral progress with detailed notes, milestones, and data collection.",
    icon: TrendingUp,
    path: "/parent/tools/progress-notes",
    category: "Student Management",
    badge: "Tracking",
    features: ["Daily Notes", "Goal Progress", "Data Charts", "Timeline View"],
    requiredFeature: 'progressNotes'
  },
  {
    title: "Ask AI About Documents",
    description: "Upload any educational document and get instant AI-powered answers to your questions about content and implications.",
    icon: MessageSquare,
    path: "/parent/tools/ask-ai-documents",
    category: "AI Support",
    badge: "Interactive",
    features: ["Document Upload", "AI Q&A", "Content Analysis", "Plain Language"],
    requiredFeature: 'askAIAboutDocs'
  },
  {
    title: "Communication Tracker",
    description: "Log and organize all communications with school staff, including emails, meetings, and phone calls with follow-up reminders.",
    icon: MessageSquare,
    path: "/parent/tools/communication-tracker",
    category: "Communication",
    badge: "Organize",
    features: ["Email Log", "Meeting Notes", "Follow-up Alerts", "Contact Directory"],
    requiredFeature: 'communicationTracker'
  },
  {
    title: "OT Activity Recommender",
    description: "Get personalized occupational therapy activity suggestions based on your child's specific needs and goals.",
    icon: Target,
    path: "/parent/tools/ot-activities",
    category: "Therapy Support",
    badge: "Personalized",
    features: ["Custom Activities", "Skill Building", "Home Exercises", "Progress Tracking"],
    requiredFeature: 'otActivityRecommender'
  }
];

const categories = Array.from(new Set(emergentTools.map(tool => tool.category)));

// VERIFICATION: 18 tools loaded
console.log('🔥 COMPLETE REFRESH: EmergentTools array length:', emergentTools.length);
console.log('🔥 All 18 tools loaded:', emergentTools.map(t => t.title));

interface ToolCardProps {
  tool: EmergentTool;
  hasAccess: boolean;
  currentPlan: string;
  onNavigate?: (route: string) => void;
}

function PremiumEmergentToolCard({ tool, hasAccess, currentPlan, onNavigate }: ToolCardProps) {
  const { requiredPlanFor } = useToolAccess();
  
  const handleNavigate = () => {
    if (onNavigate && hasAccess) {
      onNavigate(tool.path);
    }
  };

  // Determine if tool is popular/new based on category and badge
  const isPopular = ['Enhanced', 'Pro', 'AI Analysis', 'IEP Analysis'].some(keyword => 
    tool.badge.includes(keyword) || tool.category.includes(keyword)
  );
  const isNew = ['New', 'Interactive', 'Fresh'].some(keyword => 
    tool.badge.includes(keyword) || tool.title.includes('AI')
  );

  const minimumPlan = requiredPlanFor(tool.requiredFeature);

  return (
    <PremiumToolCard
      icon={<tool.icon className="h-6 w-6" />}
      title={tool.title}
      description={tool.description}
      badge={tool.badge}
      isPopular={isPopular}
      isNew={isNew}
      isLocked={!hasAccess}
      requiredPlan={hasAccess ? undefined : getPlanDisplayName(minimumPlan)}
      onClick={handleNavigate}
      className={hasAccess ? "cursor-pointer" : ""}
    />
  );
}

export default function EmergentToolsHub() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { canUse, currentPlan } = useToolAccess();

  // Concurrent navigation handler using startTransition
  const handleToolNavigation = (route: string) => {
    startTransition(() => {
      navigate(route);
    });
  };

  // Compute dynamic data
  const totalTools = emergentTools.length;
  const availableTools = emergentTools.filter(tool => canUse(tool.requiredFeature));
  const lockedTools = emergentTools.filter(tool => !canUse(tool.requiredFeature));
  const popularTools = emergentTools.filter(tool => 
    ['Enhanced', 'Pro', 'AI Analysis', 'IEP Analysis'].some(keyword => 
      tool.badge.includes(keyword) || tool.category.includes(keyword)
    )
  );

  // Group tools by category
  const toolsByCategory = categories.reduce((acc, category) => {
    acc[category] = emergentTools.filter(tool => tool.category === category);
    return acc;
  }, {} as Record<string, EmergentTool[]>);

  return (
    <MobileAppShell>
      <SafeAreaFull>
        {/* Premium Header */}
        <PremiumLargeHeader
          title="Emergent Tools Hub"
          subtitle="18 advanced AI-powered tools for special education"
          rightAction={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          }
        />

        <ContainerMobile padding="md" className="space-y-8 pb-32">
          {/* Premium Stats Section */}
          <PremiumCard variant="gradient" className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getPlanDisplayName(currentPlan)} Plan
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access to {availableTools.length}/{totalTools} emergent tools
                  </p>
                </div>
              </div>
              
              {/* Plan Features */}
              <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <Brain className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Shield className="h-4 w-4" />
                  <span>IDEA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Target className="h-4 w-4" />
                  <span>Specialized</span>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Popular Tools Section */}
          {popularTools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Popular Tools
                  </h3>
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Top Picks
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {popularTools.slice(0, 3).map((tool) => {
                  const hasAccess = canUse(tool.requiredFeature);
                  return (
                    <PremiumEmergentToolCard
                      key={tool.title}
                      tool={tool}
                      hasAccess={hasAccess}
                      currentPlan={currentPlan}
                      onNavigate={handleToolNavigation}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Analysis Tools */}
          {toolsByCategory['AI Analysis'] && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                AI Analysis Tools
              </h3>
              
              <div className="space-y-4">
                {toolsByCategory['AI Analysis'].map((tool) => {
                  const hasAccess = canUse(tool.requiredFeature);
                  return (
                    <PremiumEmergentToolCard
                      key={tool.title}
                      tool={tool}
                      hasAccess={hasAccess}
                      currentPlan={currentPlan}
                      onNavigate={handleToolNavigation}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Communication & Support Tools */}
          {(toolsByCategory['Communication'] || toolsByCategory['Professional Support']) && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Communication & Support
              </h3>
              
              <div className="space-y-4">
                {[...(toolsByCategory['Communication'] || []), ...(toolsByCategory['Professional Support'] || [])].map((tool) => {
                  const hasAccess = canUse(tool.requiredFeature);
                  return (
                    <PremiumEmergentToolCard
                      key={tool.title}
                      tool={tool}
                      hasAccess={hasAccess}
                      currentPlan={currentPlan}
                      onNavigate={handleToolNavigation}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* All Other Tools */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              All Tools
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {emergentTools
                .filter(tool => 
                  !popularTools.includes(tool) && 
                  tool.category !== 'AI Analysis' && 
                  tool.category !== 'Communication' && 
                  tool.category !== 'Professional Support'
                )
                .map((tool) => {
                  const hasAccess = canUse(tool.requiredFeature);
                  return (
                    <PremiumEmergentToolCard
                      key={tool.title}
                      tool={tool}
                      hasAccess={hasAccess}
                      currentPlan={currentPlan}
                      onNavigate={handleToolNavigation}
                    />
                  );
                })}
            </div>
          </div>

          {/* Upgrade Section for Locked Tools */}
          {lockedTools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Upgrade to Unlock More
                </h3>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  onClick={() => navigate('/parent/pricing')}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  View Plans
                </Button>
              </div>
              
              {lockedTools.length > 2 && (
                <PremiumCard variant="glass" className="p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lockedTools.length} premium tools waiting to be unlocked
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/parent/pricing')}
                  >
                    See All Plans
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </PremiumCard>
              )}
            </div>
          )}

          {/* Premium Stats Card */}
          <PremiumCard variant="elevated" className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Empowering Special Education Advocacy
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Advanced AI-powered tools and specialized resources designed to streamline IEP processes and improve student outcomes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">AI</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Powered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2e</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">360°</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Access</div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </ContainerMobile>
      </SafeAreaFull>
    </MobileAppShell>
  );
}