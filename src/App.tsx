import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute, RoleBasedRedirect } from "@/components/ProtectedRoute";
import { PushNotificationProvider } from "@/components/PushNotificationProvider";
import { DashboardLayout } from "@/layouts/DashboardLayout";
// import { FeedbackChat } from "@/components/FeedbackChat"; // TEMPORARILY REMOVED

// Loading components and error boundaries
import { 
  AuthLoading, 
  DashboardLoading, 
  ToolsLoading, 
  MessagesLoading, 
  StudentsLoading,
  LoadingFallback 
} from "@/components/ui/loading-fallback";
import { 
  AuthErrorBoundary, 
  DashboardErrorBoundary, 
  ToolsErrorBoundary 
} from "@/components/ui/error-boundary";

// Keep critical routes synchronous for fast initial load
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Development/Testing Routes
const MobileTestingPage = lazy(() => import("./pages/MobileTestingPage"));

// Lazy load route groups for code splitting
// Auth & Onboarding Routes
const Auth = lazy(() => import("./pages/Auth"));
const SetupPassword = lazy(() => import("./pages/SetupPassword"));
const SubscriptionSetup = lazy(() => import("./pages/SubscriptionSetup"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const AccountCreated = lazy(() => import("./pages/AccountCreated"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PricingSelection = lazy(() => import("./pages/PricingSelection"));

// Dashboard Routes
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const AdvocateDashboard = lazy(() => import("./pages/AdvocateDashboard"));

// Student & Parent Management Routes
const ParentStudents = lazy(() => import("./pages/ParentStudents"));
const AdvocateStudents = lazy(() => import("./pages/AdvocateStudents"));
const AdvocateParents = lazy(() => import("./pages/AdvocateParents"));
const StudentProfiles = lazy(() => import("./pages/StudentProfiles"));

// Messaging Routes
const AdvocateMessages = lazy(() => import("./pages/AdvocateMessages"));
const ParentMessages = lazy(() => import("./pages/ParentMessages"));

// Schedule & Meeting Routes
const UnifiedScheduleHub = lazy(() => import("./pages/UnifiedScheduleHub"));
const AdvocateSchedule = lazy(() => import("./pages/AdvocateSchedule"));
const ScheduleMeeting = lazy(() => import("./pages/ScheduleMeeting"));
const ParentSchedule = lazy(() => import("./pages/ParentSchedule"));
const RequestMeeting = lazy(() => import("./pages/RequestMeeting"));
const ParentMeetingPrep = lazy(() => import("./pages/ParentMeetingPrep"));
const MeetingPrepWizard = lazy(() => import("./pages/MeetingPrepWizard"));

// Tools Hub Routes
const ToolsHub = lazy(() => import("./pages/ToolsHub"));
const AdvocateToolsHubPremium = lazy(() => import("./pages/AdvocateToolsHubPremium"));

// IEP & Analysis Tools
const IEPReview = lazy(() => import("./pages/IEPReview"));
const AIIEPReview = lazy(() => import("./pages/AIIEPReview"));
const UnifiedIEPReview = lazy(() => import("./pages/UnifiedIEPReview"));
const IEPMasterSuite = lazy(() => import("./pages/IEPMasterSuite"));
const ParentIEPMasterSuite = lazy(() => import("./pages/ParentIEPMasterSuite"));
const ExpertAnalysis = lazy(() => import("./pages/ExpertAnalysis"));

// Autism Tools
const AutismToolsHub = lazy(() => import("./pages/AutismToolsHub"));
const AutismAccommodations = lazy(() => import("./pages/AutismAccommodations"));
const AutismAccommodationBuilder = lazy(() => import("./pages/AutismAccommodationBuilder"));
const ParentAutismAccommodations = lazy(() => import("./pages/ParentAutismAccommodations"));
const AdvocateAutismAccommodations = lazy(() => import("./pages/AdvocateAutismAccommodations"));
const AutismSensoryTool = lazy(() => import("./pages/AutismSensoryTool"));
const AutismCommunicationTool = lazy(() => import("./pages/AutismCommunicationTool"));
const AutismBehavioralTool = lazy(() => import("./pages/AutismBehavioralTool"));
const AutismAIInsightsTool = lazy(() => import("./pages/AutismAIInsightsTool"));

// Gifted Tools
const GiftedToolsHub = lazy(() => import("./pages/GiftedToolsHub"));
const AdvocateGiftedToolsHub = lazy(() => import("./pages/AdvocateGiftedToolsHub"));
const GiftedCognitiveTool = lazy(() => import("./pages/GiftedCognitiveTool"));
const GiftedAcademicTool = lazy(() => import("./pages/GiftedAcademicTool"));
const GiftedCreativeTool = lazy(() => import("./pages/GiftedCreativeTool"));
const GiftedLeadershipTool = lazy(() => import("./pages/GiftedLeadershipTool"));
const GiftedAIInsightsTool = lazy(() => import("./pages/GiftedAIInsightsTool"));
const GiftedTwoeLearners = lazy(() => import("./pages/GiftedTwoeLearners"));

// Communication & Document Tools
const SmartLetterGeneratorNew = lazy(() => import("./pages/SmartLetterGeneratorNew"));
const DocumentVault = lazy(() => import("./pages/DocumentVault"));
const CommunicationTracker = lazy(() => import("./pages/CommunicationTracker"));
const AskAIDocs = lazy(() => import("./pages/AskAIDocs"));
const AskAIDocuments = lazy(() => import("./pages/AskAIDocuments"));

// Progress & Goal Tools
const ProgressAnalyzer = lazy(() => import("./pages/ProgressAnalyzer"));
const GoalGenerator = lazy(() => import("./pages/GoalGenerator"));
const ParentGoalGenerator = lazy(() => import("./pages/ParentGoalGenerator"));
const ProgressNotes = lazy(() => import("./pages/ProgressNotes"));
const ProgressNotesTracker = lazy(() => import("./pages/ProgressNotesTracker"));
const TimelineCalculator = lazy(() => import("./pages/TimelineCalculator"));

// Emotion & Support Tools
const EmotionTracker = lazy(() => import("./pages/EmotionTracker"));
const ParentEmotionTracker = lazy(() => import("./pages/ParentEmotionTracker"));
const CopingStrategies = lazy(() => import("./pages/CopingStrategies"));
const WarningSignsDetection = lazy(() => import("./pages/WarningSignsDetection"));
const SupportSchedule = lazy(() => import("./pages/SupportSchedule"));

// Educational Resources
const IDEARightsGuide = lazy(() => import("./pages/IDEARightsGuide"));
const ParentIDEARightsGuide = lazy(() => import("./pages/ParentIDEARightsGuide"));
const FERPAOverview = lazy(() => import("./pages/FERPAOverview"));
const Plan504Guide = lazy(() => import("./pages/Plan504Guide"));
const Plan504Builder = lazy(() => import("./pages/Plan504Builder"));

// OT & Therapy Tools
const OTRecommender = lazy(() => import("./pages/OTRecommender"));
const OTActivityRecommender = lazy(() => import("./pages/OTActivityRecommender"));

// Matching & Advocacy
const SmartMatching = lazy(() => import("./pages/SmartMatching"));
const MatchingDashboard = lazy(() => import("./pages/MatchingDashboard"));
const AdvocacyReports = lazy(() => import("./pages/AdvocacyReports"));

// Pricing & Plans
const AdvocatePricingPlan = lazy(() => import("./pages/AdvocatePricingPlan"));
const ParentPricingPlan = lazy(() => import("./pages/ParentPricingPlan"));
const ParentHeroPlan = lazy(() => import("./pages/ParentHeroPlan"));
const ParentHeroUpsell = lazy(() => import("./pages/ParentHeroUpsell"));
const HeroPlan = lazy(() => import("./pages/HeroPlan"));

// Settings & Profile
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const ParentSettings = lazy(() => import("./pages/ParentSettings"));
const AdvocateSettings = lazy(() => import("./pages/AdvocateSettings"));

// Emergent & Demo Tools
const EmergentToolsHubNew = lazy(() => import("./pages/EmergentToolsHubNew"));
const EmergentToolsHub = lazy(() => import("./pages/EmergentToolsHub"));
const PremiumToolsDemo = lazy(() => import("./pages/PremiumToolsDemo"));
const AllPagesView = lazy(() => import("./pages/AllPagesView"));
const CardShowcase = lazy(() => import("./pages/CardShowcase"));
const FABDemo = lazy(() => import("./pages/FABDemo"));

import { queryClient } from "./lib/queryClient";
import PerformanceMonitor from "./components/PerformanceMonitor";

// Helper components for specific route types with optimized loading
function AuthRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      <Suspense fallback={<AuthLoading />}>
        {children}
      </Suspense>
    </AuthErrorBoundary>
  );
}

function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </DashboardErrorBoundary>
  );
}

function ToolsRoute({ children }: { children: React.ReactNode }) {
  return (
    <ToolsErrorBoundary>
      <Suspense fallback={<ToolsLoading />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </ToolsErrorBoundary>
  );
}

function MessagingRoute({ children }: { children: React.ReactNode }) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<MessagesLoading />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </DashboardErrorBoundary>
  );
}

function StudentsRoute({ children }: { children: React.ReactNode }) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<StudentsLoading />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </DashboardErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PerformanceMonitor />
        <ThemeProvider>
          <AuthProvider>
            <PushNotificationProvider />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={
                <AuthRoute>
                  <PricingSelection />
                </AuthRoute>
              } />
              <Route path="/auth" element={
                <AuthRoute>
                  <Auth />
                </AuthRoute>
              } />
              <Route path="/setup-password" element={
                <AuthRoute>
                  <SetupPassword />
                </AuthRoute>
              } />
              <Route path="/subscription-setup" element={
                <AuthRoute>
                  <SubscriptionSetup />
                </AuthRoute>
              } />
              <Route path="/onboarding" element={
                <AuthRoute>
                  <Onboarding />
                </AuthRoute>
              } />
              
              {/* Parent Routes - Protected */}
              {/* Generic dashboard redirect */}
              <Route path="/dashboard" element={<RoleBasedRedirect parentRoute="/parent/dashboard-free" advocateRoute="/advocate/dashboard-starter" />} />
              <Route path="/parent/dashboard-free" element={
                <ProtectedRoute allowedRoles={['parent']} requiredPlan="free">
                  <DashboardRoute>
                    <ParentDashboard plan="free" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-essential" element={
                <ProtectedRoute allowedRoles={['parent']} requiredPlan="essential">
                  <DashboardRoute>
                    <ParentDashboard plan="essential" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-explorer" element={
                <ProtectedRoute allowedRoles={['parent']} requiredPlan="essential">
                  <DashboardRoute>
                    <ParentDashboard plan="essential" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-premium" element={
                <ProtectedRoute allowedRoles={['parent']} requiredPlan="premium">
                  <DashboardRoute>
                    <ParentDashboard plan="premium" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-hero" element={
                <ProtectedRoute allowedRoles={['parent']} requiredPlan="hero">
                  <DashboardRoute>
                    <ParentDashboard plan="hero" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/meeting-prep" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ParentMeetingPrep />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/students" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <StudentsRoute>
                    <ParentStudents />
                  </StudentsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/messages" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <MessagingRoute>
                    <ParentMessages />
                  </MessagingRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/schedule" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardRoute>
                    <UnifiedScheduleHub />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              {/* Legacy route for compatibility */}
              <Route path="/parent/schedule/request" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardRoute>
                    <UnifiedScheduleHub />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              
              {/* Advocate Routes - Protected - NO GENERIC DASHBOARD */}
              <Route path="/advocate/dashboard-starter" element={
                <ProtectedRoute allowedRoles={['advocate']} requiredPlan="starter">
                  <DashboardRoute>
                    <AdvocateDashboard plan="starter" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-pro" element={
                <ProtectedRoute allowedRoles={['advocate']} requiredPlan="pro">
                  <DashboardRoute>
                    <AdvocateDashboard plan="pro" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-agency" element={
                <ProtectedRoute allowedRoles={['advocate']} requiredPlan="agency">
                  <DashboardRoute>
                    <AdvocateDashboard plan="agency" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-agency-plus" element={
                <ProtectedRoute allowedRoles={['advocate']} requiredPlan="agency-plus">
                  <DashboardRoute>
                    <AdvocateDashboard plan="agency-plus" />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/messages" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <MessagingRoute>
                    <AdvocateMessages />
                  </MessagingRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/schedule" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <DashboardRoute>
                    <UnifiedScheduleHub />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              {/* Legacy route for compatibility */}
              <Route path="/advocate/schedule/new" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <DashboardRoute>
                    <UnifiedScheduleHub />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/parents" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <StudentsRoute>
                    <AdvocateParents />
                  </StudentsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/create-parent" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <StudentsRoute>
                    <AdvocateParents />
                  </StudentsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/students" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <StudentsRoute>
                    <AdvocateStudents />
                  </StudentsRoute>
                </ProtectedRoute>
              } />
              
              {/* Tools Routes - Role-Based */}
              <Route path="/tools/hub" element={<RoleBasedRedirect parentRoute="/parent/tools" advocateRoute="/advocate/tools" />} />
              <Route path="/parent/tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ToolsHub />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/emergent" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <EmergentToolsHubNew />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <AdvocateToolsHubPremium />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* Parent Tools - Namespaced */}
              <Route path="/parent/tools/iep-review" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <IEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/ai-iep-review" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AIIEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/unified-iep-review" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <UnifiedIEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/autism-accommodations" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ParentAutismAccommodations />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* New Card-Based Autism Tools */}
              <Route path="/parent/autism-tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AutismToolsHub />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/autism-tools/sensory" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AutismSensoryTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/autism-tools/communication" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AutismCommunicationTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/autism-tools/behavioral" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AutismBehavioralTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/autism-tools/ai-insights" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AutismAIInsightsTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* New Card-Based Gifted Tools */}
              <Route path="/parent/gifted-tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedToolsHub />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/gifted-tools/cognitive" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedCognitiveTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/gifted-tools/academic" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedAcademicTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/gifted-tools/creative" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedCreativeTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/gifted-tools/leadership" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedLeadershipTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/gifted-tools/ai-insights" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedAIInsightsTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/meeting-prep" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <MeetingPrepWizard />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <SmartLetterGeneratorNew />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/timeline-calculator" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <TimelineCalculator />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* Advocate Tools - Namespaced */}
              <Route path="/advocate/tools/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <SmartLetterGeneratorNew />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* Root path variants for advocate tools from dashboard */}
              <Route path="/advocate/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <SmartLetterGeneratorNew />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/advocate/unified-iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <UnifiedIEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/advocate/idea-rights-guide" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <IDEARightsGuide />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/advocate/meeting-prep-wizard" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <MeetingPrepWizard />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <MessagingRoute>
                    <AdvocateMessages />
                  </MessagingRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/advocate/autism-accommodations" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <AdvocateAutismAccommodations />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              <Route path="/advocate/gifted-2e-learners" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <GiftedTwoeLearners />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* New Card-Based Gifted Tools - Advocate */}
              <Route path="/advocate/gifted-tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <AdvocateGiftedToolsHub />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/gifted-tools/cognitive" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <GiftedCognitiveTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/gifted-tools/academic" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <GiftedAcademicTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/gifted-tools/creative" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <GiftedCreativeTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/gifted-tools/leadership" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <GiftedLeadershipTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/gifted-tools/ai-insights" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <GiftedAIInsightsTool />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* Advocate Tools - Namespaced */}
              <Route path="/advocate/tools/iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <IEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/unified-iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <UnifiedIEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/autism-accommodations" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <AdvocateAutismAccommodations />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* Parent Tools - Additional */}
              <Route path="/parent/tools/emergent" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <EmergentToolsHubNew />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/document-vault" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <DocumentVault />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/gifted-2e-learners" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedTwoeLearners />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* New Card-Based Gifted Tools */}
              <Route path="/parent/gifted-tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <GiftedToolsHub />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/advocate-matching" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <SmartMatching />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/expert-analysis" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ExpertAnalysis />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/goal-generator" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ParentGoalGenerator />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/iep-master-suite" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ParentIEPMasterSuite />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/idea-rights-guide" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ParentIDEARightsGuide />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/plan-504-guide" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <Plan504Guide />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/progress-notes" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <ProgressNotesTracker />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/ask-ai-documents" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <AskAIDocuments />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/communication-tracker" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <CommunicationTracker />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/ot-activities" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <OTActivityRecommender />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/matching" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <SmartMatching />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
               {/* Advocate Tools - Additional */}
               <Route path="/advocate/tools/document-vault" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <DocumentVault />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/gifted-2e-learners" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <AdvocateGiftedToolsHub />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/advocate-matching" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <SmartMatching />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ai-iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <AIIEPReview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <SmartLetterGeneratorNew />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/meeting-prep" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <MeetingPrepWizard />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/meeting-prep-wizard" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <MeetingPrepWizard />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/expert-analysis" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <ExpertAnalysis />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/matching" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <SmartMatching />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/smart-matching" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsRoute>
                    <SmartMatching />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
               {/* Legacy redirects for old /tools/ routes */}
               <Route path="/tools/document-vault" element={<RoleBasedRedirect parentRoute="/parent/tools/document-vault" advocateRoute="/advocate/tools/document-vault" />} />
              <Route path="/tools/iep-review" element={<RoleBasedRedirect parentRoute="/parent/tools/iep-review" advocateRoute="/advocate/tools/iep-review" />} />
              <Route path="/tools/ai-iep-review" element={<RoleBasedRedirect parentRoute="/parent/tools/ai-iep-review" advocateRoute="/advocate/tools/ai-iep-review" />} />
              <Route path="/tools/unified-iep-review" element={<RoleBasedRedirect parentRoute="/parent/tools/unified-iep-review" advocateRoute="/advocate/tools/unified-iep-review" />} />
              <Route path="/tools/autism-accommodations" element={<RoleBasedRedirect parentRoute="/parent/tools/autism-accommodations" advocateRoute="/advocate/tools/autism-accommodations" />} />
              <Route path="/tools/advocate-matching" element={<RoleBasedRedirect parentRoute="/parent/tools/advocate-matching" advocateRoute="/advocate/tools/advocate-matching" />} />
              <Route path="/tools/gifted-2e-learners" element={<RoleBasedRedirect parentRoute="/parent/tools/gifted-2e-learners" advocateRoute="/advocate/tools/gifted-2e-learners" />} />
              <Route path="/tools/smart-letter" element={<RoleBasedRedirect parentRoute="/parent/tools/smart-letter-generator" advocateRoute="/advocate/tools/smart-letter-generator" />} />
              <Route path="/tools/meeting-prep" element={<RoleBasedRedirect parentRoute="/parent/tools/meeting-prep" advocateRoute="/advocate/tools/meeting-prep" />} />
              
              {/* Profile */}
              <Route path="/parent/profile" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardRoute>
                    <Profile />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/profile" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <DashboardRoute>
                    <Profile />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              
              {/* Settings */}
              <Route path="/parent/settings" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardRoute>
                    <ParentSettings />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              <Route path="/advocate/settings" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <DashboardRoute>
                    <AdvocateSettings />
                  </DashboardRoute>
                </ProtectedRoute>
              } />
              
              {/* Premium & Upsell */}
              <Route path="/parent/upsell/hero-plan" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <AuthRoute>
                    <ParentHeroPlan />
                  </AuthRoute>
                </ProtectedRoute>
              } />
              <Route path="/parent/subscribe/upsell/hero-plan" element={
                <AuthRoute>
                  <ParentHeroUpsell />
                </AuthRoute>
              } />
              <Route path="/upsell/hero-plan" element={
                <AuthRoute>
                  <HeroPlan />
                </AuthRoute>
              } />
              <Route path="/subscribe" element={
                <AuthRoute>
                  <PricingSelection />
                </AuthRoute>
              } />
              <Route path="/advocate/discovery" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsRoute>
                    <SmartMatching />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              
              {/* Pricing Plans */}
              <Route path="/advocate/pricing-plan" element={
                <AuthRoute>
                  <AdvocatePricingPlan />
                </AuthRoute>
              } />
              <Route path="/parent/pricing-plan" element={
                <AuthRoute>
                  <ParentPricingPlan />
                </AuthRoute>
              } />
              <Route path="/parent/hero-plan" element={
                <AuthRoute>
                  <ParentHeroPlan />
                </AuthRoute>
              } />
              <Route path="/parent-hero-plan" element={
                <AuthRoute>
                  <ParentHeroPlan />
                </AuthRoute>
              } />
              
              {/* Role-specific subscription routes */}
              <Route path="/parent/pricing" element={
                <AuthRoute>
                  <ParentPricingPlan />
                </AuthRoute>
              } />
              <Route path="/advocate/pricing" element={
                <AuthRoute>
                  <AdvocatePricingPlan />
                </AuthRoute>
              } />
              <Route path="/parent/subscribe" element={
                <AuthRoute>
                  <ParentPricingPlan />
                </AuthRoute>
              } />
              <Route path="/advocate/subscribe" element={
                <AuthRoute>
                  <AdvocatePricingPlan />
                </AuthRoute>
              } />
              <Route path="/subscription-success" element={
                <AuthRoute>
                  <SubscriptionSuccess />
                </AuthRoute>
              } />
              <Route path="/subscription-setup" element={
                <AuthRoute>
                  <SubscriptionSetup />
                </AuthRoute>
              } />
              <Route path="/account-created" element={
                <AuthRoute>
                  <AccountCreated />
                </AuthRoute>
              } />
              <Route path="/verify-email" element={
                <AuthRoute>
                  <VerifyEmail />
                </AuthRoute>
              } />
              
              {/* Legal Resources - Available to both roles */}
              <Route path="/idea-rights-guide" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <ToolsRoute>
                    <IDEARightsGuide />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/ferpa-overview" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <ToolsRoute>
                    <FERPAOverview />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/504-plan-guide" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <ToolsRoute>
                    <Plan504Guide />
                  </ToolsRoute>
                </ProtectedRoute>
              } />
              <Route path="/timeline-calculator" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <TimelineCalculator />
                </ProtectedRoute>
              } />
              
              {/* Advocate-specific tools */}
              <Route path="/advocate/tools/progress-analyzer" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ProgressAnalyzer />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/goal-generator" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <GoalGenerator />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/iep-master-suite" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <IEPMasterSuite />
                </ProtectedRoute>
              } />
              <Route path="/tools/iep-master-suite" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']} requiredPlan="essential">
                  <IEPMasterSuite />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ask-ai-docs" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AskAIDocs />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/progress-notes" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ProgressNotes />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/communication-tracker" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <CommunicationTracker />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/advocacy-reports" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocacyReports />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/emotion-tracker" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <EmotionTracker />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/504-plan-builder" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <Plan504Builder />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ot-recommender" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <OTRecommender />
                </ProtectedRoute>
              } />
              
              {/* Parent Tools */}
              <Route path="/parent/tools/emotion-tracker" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentEmotionTracker />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/coping-strategies" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <CopingStrategies />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/warning-signs" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <WarningSignsDetection />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/support-schedule" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <SupportSchedule />
                </ProtectedRoute>
              } />
              
              {/* Debug/Testing Tools */}
              <Route path="/all-pages" element={<AllPagesView />} />
              <Route path="/premium-tools-demo" element={<PremiumToolsDemo />} />
              <Route path="/demo/fab" element={<FABDemo />} />
              <Route path="/mobile-testing" element={
                <Suspense fallback={<LoadingFallback />}>
                  <MobileTestingPage />
                </Suspense>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* <FeedbackChat /> TEMPORARILY REMOVED */}
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
