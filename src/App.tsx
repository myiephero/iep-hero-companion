import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ParentDashboard from "./pages/ParentDashboard";
import AdvocateDashboard from "./pages/AdvocateDashboard";
import ParentMessages from "./pages/ParentMessages";
import AdvocateMessages from "./pages/AdvocateMessages";
import ParentStudents from "./pages/ParentStudents";
import AdvocateStudents from "./pages/AdvocateStudents";
import { useAuth } from "@/hooks/useAuth";
import UnifiedScheduleHub from "./pages/UnifiedScheduleHub";
import ToolsHub from "./pages/ToolsHub";
import AdvocateToolsHub from "./pages/AdvocateToolsHub";
import EmergentToolsHubNew from "./pages/EmergentToolsHubNew";
import PricingSelection from "./pages/PricingSelection";
import ParentPricingPlan from "./pages/ParentPricingPlan";
import AdvocatePricingPlan from "./pages/AdvocatePricingPlan";
import SetupPassword from "./pages/SetupPassword";
import SubscriptionSetup from "./pages/SubscriptionSetup";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import Onboarding from "./pages/Onboarding";
import VerifyEmail from "./pages/VerifyEmail";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ParentSettings from "./pages/ParentSettings";
import AdvocateSettings from "./pages/AdvocateSettings";

// Import missing tool components
import SmartLetterGenerator from "./pages/SmartLetterGenerator";
import UnifiedIEPReview from "./pages/UnifiedIEPReview";
import IEPMasterSuite from "./pages/IEPMasterSuite";
import MatchingDashboard from "./pages/MatchingDashboard";
import DocumentVault from "./pages/DocumentVault";
import AutismAccommodationBuilder from "./pages/AutismAccommodationBuilder";
import MeetingPrepWizard from "./pages/MeetingPrepWizard";
import ExpertAnalysis from "./pages/ExpertAnalysis";
import EmotionTracker from "./pages/EmotionTracker";
import GoalGenerator from "./pages/GoalGenerator";
import IDEARightsGuide from "./pages/IDEARightsGuide";
import Plan504Guide from "./pages/Plan504Guide";
import ProgressNotes from "./pages/ProgressNotes";
import AskAIDocuments from "./pages/AskAIDocuments";
import CommunicationTracker from "./pages/CommunicationTracker";
import OTActivityRecommender from "./pages/OTActivityRecommender";
import OTRecommender from "./pages/OTRecommender";
import ProgressAnalyzer from "./pages/ProgressAnalyzer";
import AdvocacyReports from "./pages/AdvocacyReports";
import AdvocateGiftedToolsHub from "./pages/AdvocateGiftedToolsHub";
import AdvocateParents from "./pages/AdvocateParents";

import { queryClient } from "./lib/queryClient";

// Simple role-based component selector
function RoleBasedDashboard() {
  const { user } = useAuth();
  return user?.role === 'advocate' ? <AdvocateDashboard /> : <ParentDashboard />;
}

function RoleBasedMessages() {
  const { user } = useAuth();
  return user?.role === 'advocate' ? <AdvocateMessages /> : <ParentMessages />;
}

function RoleBasedStudents() {
  const { user } = useAuth();
  return user?.role === 'advocate' ? <AdvocateStudents /> : <ParentStudents />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<PricingSelection />} />
              <Route path="/parent/pricing" element={<ParentPricingPlan />} />
              <Route path="/advocate/pricing" element={<AdvocatePricingPlan />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/setup-password" element={<SetupPassword />} />
              <Route path="/subscription-setup" element={<SubscriptionSetup />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Subscription Management */}
              <Route path="/subscription-management" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <SubscriptionManagement />
                </ProtectedRoute>
              } />
              
              {/* Single Dashboard - handles all role/plan logic internally */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              } />
              
              {/* Clean Protected Routes */}
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <RoleBasedMessages />
                </ProtectedRoute>
              } />
              <Route path="/schedule" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <UnifiedScheduleHub />
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <RoleBasedStudents />
                </ProtectedRoute>
              } />
              <Route path="/tools" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <ToolsHub />
                </ProtectedRoute>
              } />
              
              {/* Parent Tool Routes */}
              <Route path="/parent/tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/emergent" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              
              {/* Individual Parent Tool Routes - All use EmergentToolsHubNew for now */}
              <Route path="/parent/tools/unified-iep-review" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/autism-accommodation-builder" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/meeting-prep" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/expert-analysis" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/emotion-tracker" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/goal-generator" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/iep-master-suite" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/idea-rights-guide" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/plan-504-guide" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/progress-notes" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/ask-ai-documents" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/communication-tracker" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/ot-activities" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              
              {/* Universal Tool Routes */}
              <Route path="/tools/advocate-matching" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/tools/gifted-2e-learners" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              <Route path="/tools/document-vault" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <DocumentVault />
                </ProtectedRoute>
              } />
              <Route path="/tools/student-profiles" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <EmergentToolsHubNew />
                </ProtectedRoute>
              } />
              
              {/* Advocate Tool Routes */}
              <Route path="/advocate/tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateToolsHub />
                </ProtectedRoute>
              } />
              
              {/* Individual Advocate Tool Routes */}
              <Route path="/advocate/tools/unified-iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <UnifiedIEPReview />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/iep-master-suite" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <IEPMasterSuite />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <SmartLetterGenerator />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/meeting-prep" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <MeetingPrepWizard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/expert-analysis" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ExpertAnalysis />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/autism-accommodation-builder" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AutismAccommodationBuilder />
                </ProtectedRoute>
              } />
              <Route path="/advocate/parents" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateParents />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/document-vault" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <DocumentVault />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/emotion-tracker" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <EmotionTracker />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/goal-generator" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <GoalGenerator />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/idea-rights-guide" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <IDEARightsGuide />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/plan-504-guide" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <Plan504Guide />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/progress-notes" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ProgressNotes />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ask-ai-documents" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AskAIDocuments />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/communication-tracker" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <CommunicationTracker />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ot-activities" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <OTActivityRecommender />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ot-recommender" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <OTRecommender />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/progress-analyzer" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ProgressAnalyzer />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/advocacy-reports" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocacyReports />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ask-ai-docs" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AskAIDocuments />
                </ProtectedRoute>
              } />
              <Route path="/advocate/gifted-tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateGiftedToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/meeting-prep-wizard" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <MeetingPrepWizard />
                </ProtectedRoute>
              } />
              <Route path="/autism-accommodations" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <AutismAccommodationBuilder />
                </ProtectedRoute>
              } />
              <Route path="/idea-rights-guide" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <IDEARightsGuide />
                </ProtectedRoute>
              } />
              
              {/* Matching Routes */}
              <Route path="/parent/matching" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <MatchingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/matching" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <MatchingDashboard />
                </ProtectedRoute>
              } />
              
              {/* Root Tool Routes (accessible without role prefix) */}
              <Route path="/smart-letter-generator" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <SmartLetterGenerator />
                </ProtectedRoute>
              } />
              <Route path="/unified-iep-review" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <UnifiedIEPReview />
                </ProtectedRoute>
              } />
              <Route path="/iep-master-suite" element={
                <ProtectedRoute allowedRoles={['parent', 'advocate']}>
                  <IEPMasterSuite />
                </ProtectedRoute>
              } />
              
              {/* Plan-specific dashboards */}
              <Route path="/parent/dashboard-free" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-essential" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-premium" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/dashboard-hero" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-starter" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateDashboard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-pro" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateDashboard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-agency" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateDashboard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/dashboard-agency-plus" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateDashboard />
                </ProtectedRoute>
              } />
              
              {/* Profile and Settings Routes */}
              <Route path="/parent/profile" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/parent/settings" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentSettings />
                </ProtectedRoute>
              } />
              <Route path="/advocate/profile" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/advocate/settings" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateSettings />
                </ProtectedRoute>
              } />
              
              <Route path="/parent/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/advocate/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/parent/messages" element={<Navigate to="/messages" replace />} />
              <Route path="/advocate/messages" element={<Navigate to="/messages" replace />} />
              <Route path="/parent/students" element={<Navigate to="/students" replace />} />
              <Route path="/advocate/students" element={<Navigate to="/students" replace />} />
              <Route path="/parent/schedule" element={<Navigate to="/schedule" replace />} />
              <Route path="/advocate/schedule" element={<Navigate to="/schedule" replace />} />
              <Route path="/parent/tools" element={<Navigate to="/tools" replace />} />
              {/* Removed conflicting /advocate/tools redirect - now handled by specific routes above */}
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
}

export default App;