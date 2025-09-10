import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Zap, Users, Star, FileText, Target, Building, BookOpen, Smile, TrendingUp, MessageSquare, Brain, Heart, Code } from "lucide-react";
import { useEffect, useState } from "react";

// BUILD VERSION FOR ENVIRONMENT PARITY
const BUILD_ID = "BUILD_SEP10_2025_1531";

// COMPLETELY NEW FILE - TESTING 18 TOOLS
const emergentTools = [
  {
    title: "Unified IEP Review",
    description: "Comprehensive AI-powered IEP analysis with quality scoring, compliance checks, and actionable improvement recommendations.",
    icon: Brain,
    path: "/parent/tools/unified-iep-review",
    category: "AI Analysis",
    badge: "Enhanced"
  },
  {
    title: "Autism Accommodation Builder", 
    description: "Create autism-specific accommodations with sensory, communication, and behavioral support strategies.",
    icon: Users,
    path: "/parent/tools/autism-accommodation-builder",
    category: "Specialized Support", 
    badge: "Specialized"
  },
  {
    title: "Advocate Matching Tool",
    description: "Find and connect with qualified special education advocates in your area based on specialization and needs.",
    icon: Users,
    path: "/tools/advocate-matching",
    category: "Professional Support",
    badge: "Connect"
  },
  {
    title: "Gifted & 2e Learners",
    description: "Comprehensive profiles for gifted and twice-exceptional learners with strength-based planning.",
    icon: Star,
    path: "/tools/gifted-2e-learners",
    category: "Specialized Needs",
    badge: "2e"
  },
  {
    title: "Smart Letter Generator",
    description: "Generate professional advocacy letters with templates for various special education situations.",
    icon: FileText,
    path: "/parent/tools/smart-letter-generator",
    category: "Communication",
    badge: "Templates"
  },
  {
    title: "Meeting Prep Wizard",
    description: "Prepare for IEP meetings with guided checklists, goal setting, and question preparation.",
    icon: Target,
    path: "/parent/tools/meeting-prep",
    category: "Meeting Support",
    badge: "Prep"
  },
  {
    title: "Document Vault",
    description: "Secure storage and organization for all IEP documents, evaluations, and educational records.",
    icon: Building,
    path: "/tools/document-vault",
    category: "Organization",
    badge: "Secure"
  },
  {
    title: "Student Profiles",
    description: "Comprehensive student profiles with goals, accommodations, services, and progress tracking.",
    icon: BookOpen,
    path: "/tools/student-profiles",
    category: "Student Management",
    badge: "Core"
  },
  {
    title: "Expert Analysis",
    description: "Professional expert analysis and detailed assessments with comprehensive reporting and recommendations.",
    icon: Target,
    path: "/parent/tools/expert-analysis",
    category: "Professional Support",
    badge: "Pro"
  },
  {
    title: "Emotion Tracker",
    description: "Track your child's emotional well-being and behavioral patterns to support their success and communicate with school teams.",
    icon: Smile,
    path: "/parent/tools/emotion-tracker",
    category: "Wellness Support",
    badge: "Wellness"
  },
  {
    title: "IEP Goal Helper",
    description: "Learn about IEP goals, create personalized goals for your child, and check if existing goals meet quality standards.",
    icon: Target,
    path: "/parent/tools/goal-generator",
    category: "IEP Planning",
    badge: "Parent-Friendly"
  },
  {
    title: "Parent IEP Helper Suite",
    description: "Complete IEP toolkit for parents - understand IEPs, analyze documents, check goals, and see examples in simple language.",
    icon: Brain,
    path: "/parent/tools/iep-master-suite",
    category: "IEP Analysis",
    badge: "Pro"
  },
  {
    title: "Your Child's Rights Guide",
    description: "Simple explanations of your child's rights under IDEA with state-specific information and practical tips for parents.",
    icon: Heart,
    path: "/parent/tools/idea-rights-guide",
    category: "Legal & Rights",
    badge: "Parent-Friendly"
  },
  {
    title: "Plan 504 Guide",
    description: "NEW! Comprehensive guide to Section 504 plans with templates, eligibility criteria, and accommodation recommendations.",
    icon: BookOpen,
    path: "/parent/tools/plan-504-guide",
    category: "Legal & Rights",
    badge: "Essential"
  },
  {
    title: "Progress Notes Tracker",
    description: "NEW! Track your child's academic and behavioral progress with detailed notes, milestones, and data collection.",
    icon: TrendingUp,
    path: "/parent/tools/progress-notes",
    category: "Student Management",
    badge: "Tracking"
  },
  {
    title: "Ask AI About Documents",
    description: "NEW! Upload any educational document and get instant AI-powered answers to your questions about content and implications.",
    icon: MessageSquare,
    path: "/parent/tools/ask-ai-documents",
    category: "AI Support",
    badge: "Interactive"
  },
  {
    title: "Communication Tracker",
    description: "NEW! Log and organize all communications with school staff, including emails, meetings, and phone calls with follow-up reminders.",
    icon: MessageSquare,
    path: "/parent/tools/communication-tracker",
    category: "Communication",
    badge: "Organize"
  },
  {
    title: "OT Activity Recommender",
    description: "NEW! Get personalized occupational therapy activity suggestions based on your child's specific needs and goals.",
    icon: Target,
    path: "/parent/tools/ot-activities",
    category: "Therapy Support",
    badge: "Personalized"
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
            <h1 className="text-4xl font-bold">🆕 NEW FILE - 18 Tools Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            TESTING NEW FILE WITH ALL 18 TOOLS INCLUDING THE 5 NEW ONES
          </p>
          
          {/* CRITICAL: BUILD_ID BADGES FOR ENVIRONMENT PARITY */}
          <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
            <Badge className="bg-red-100 text-red-800 border-red-300 font-mono text-sm px-3 py-2" data-testid="frontend-build-id">
              <Code className="h-4 w-4 mr-2" />
              FRONTEND: {BUILD_ID}
            </Badge>
            {apiVersion && (
              <Badge className={`font-mono text-sm px-3 py-2 ${
                apiVersion === BUILD_ID 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              }`} data-testid="backend-build-id">
                <Code className="h-4 w-4 mr-2" />
                BACKEND: {apiVersion}
              </Badge>
            )}
            <Badge className={`text-sm px-3 py-2 ${
              apiVersion === BUILD_ID 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-red-100 text-red-800 border-red-300'
            }`} data-testid="environment-status">
              {apiVersion === BUILD_ID ? '✅ ENV SYNCED' : '❌ ENV MISMATCH'}
            </Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              ✅ 18 TOOLS CONFIRMED ✅
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">All 18 Tools - Including 5 NEW</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {emergentTools.map((tool, index) => (
              <Card key={tool.title} className="hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group border border-slate-600 hover:border-primary/30 bg-slate-800 h-[280px] flex flex-col">
                <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200 shadow-sm">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Badge className="text-xs px-2 py-1 shadow-sm bg-blue-100 text-blue-700">
                        {tool.badge}
                      </Badge>
                      <CardTitle className="text-sm font-semibold text-white group-hover:text-primary transition-colors leading-tight">
                        {tool.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-xs text-gray-300 text-center leading-relaxed">
                      {tool.description.length > 80 ? `${tool.description.substring(0, 80)}...` : tool.description}
                    </p>
                  </div>
                  
                  <Button asChild size="sm" className="w-full text-xs py-2">
                    <Link to={tool.path}>
                      Open Tool
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}