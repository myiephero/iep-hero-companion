
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, RoleBasedRedirect } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ParentDashboard from "./pages/ParentDashboard";
import AdvocateDashboard from "./pages/AdvocateDashboard";
import AdvocateMessages from "./pages/AdvocateMessages";
import AdvocateSchedule from "./pages/AdvocateSchedule";
import AdvocateCreateParent from "./pages/AdvocateCreateParent";
import ParentStudents from "./pages/ParentStudents";
import AdvocateStudents from "./pages/AdvocateStudents";
import IEPReview from "./pages/IEPReview";
import AIIEPReview from "./pages/AIIEPReview";
import AutismAccommodations from "./pages/AutismAccommodations";
import AutismAccommodationBuilder from "./pages/AutismAccommodationBuilder";
import AdvocateMatchingTool from "./pages/AdvocateMatchingTool";
import GiftedTwoeLearners from "./pages/GiftedTwoeLearners";
import EmergentToolsHub from "./pages/EmergentToolsHub";
import SmartLetterGenerator from "./pages/SmartLetterGenerator";
import MeetingPrepWizard from "./pages/MeetingPrepWizard";
import ParentMeetingPrep from "./pages/ParentMeetingPrep";
import StudentProfiles from "./pages/StudentProfiles";
import HeroPlan from "./pages/HeroPlan";
import AdvocateDiscovery from "./pages/AdvocateDiscovery";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ToolsHub from "./pages/ToolsHub";
import DocumentVault from "./pages/DocumentVault";
import AdvocatePricingPlan from "./pages/AdvocatePricingPlan";
import ParentPricingPlan from "./pages/ParentPricingPlan";
import ParentHeroPlan from "./pages/ParentHeroPlan";
import AdvocateToolsHub from "./pages/AdvocateToolsHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Parent Routes - Protected */}
              <Route path="/parent/dashboard" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/parent/meeting-prep" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentMeetingPrep />
                </ProtectedRoute>
              } />
              <Route path="/parent/students" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentStudents />
                </ProtectedRoute>
              } />
              
              {/* Advocate Routes - Protected */}
              <Route path="/advocate/dashboard" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateDashboard />
                </ProtectedRoute>
              } />
              <Route path="/advocate/messages" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateMessages />
                </ProtectedRoute>
              } />
              <Route path="/advocate/schedule" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateSchedule />
                </ProtectedRoute>
              } />
              <Route path="/advocate/create-parent" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateCreateParent />
                </ProtectedRoute>
              } />
              <Route path="/advocate/students" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateStudents />
                </ProtectedRoute>
              } />
              
              {/* Tools Routes - Role-Based */}
              <Route path="/tools/hub" element={<RoleBasedRedirect parentRoute="/parent/tools" advocateRoute="/advocate/tools" />} />
              <Route path="/parent/tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateToolsHub />
                </ProtectedRoute>
              } />
              
              {/* Parent Tools - Namespaced */}
              <Route path="/parent/tools/iep-review" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <IEPReview />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/ai-iep-review" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <AIIEPReview />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/autism-accommodations" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <AutismAccommodationBuilder />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/meeting-prep" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <MeetingPrepWizard />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/smart-letter" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <SmartLetterGenerator />
                </ProtectedRoute>
              } />
              
              {/* Advocate Tools - Namespaced */}
              <Route path="/advocate/tools/iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <IEPReview />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/autism-accommodations" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AutismAccommodationBuilder />
                </ProtectedRoute>
              } />
              
              {/* Parent Tools - Additional */}
              <Route path="/parent/tools/emergent" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EmergentToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/document-vault" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DocumentVault />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/gifted-2e-learners" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <GiftedTwoeLearners />
                </ProtectedRoute>
              } />
              <Route path="/parent/tools/advocate-matching" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <AdvocateMatchingTool />
                </ProtectedRoute>
              } />
              
              {/* Advocate Tools - Additional */}
              <Route path="/advocate/tools/emergent" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <EmergentToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/document-vault" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <DocumentVault />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/gifted-2e-learners" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <GiftedTwoeLearners />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/advocate-matching" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateMatchingTool />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/ai-iep-review" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AIIEPReview />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/smart-letter" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <SmartLetterGenerator />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools/meeting-prep" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <MeetingPrepWizard />
                </ProtectedRoute>
              } />
              
              {/* Legacy redirects for old /tools/ routes */}
              <Route path="/tools/emergent" element={<RoleBasedRedirect parentRoute="/parent/tools/emergent" advocateRoute="/advocate/tools/emergent" />} />
              <Route path="/tools/document-vault" element={<RoleBasedRedirect parentRoute="/parent/tools/document-vault" advocateRoute="/advocate/tools/document-vault" />} />
              <Route path="/tools/iep-review" element={<RoleBasedRedirect parentRoute="/parent/tools/iep-review" advocateRoute="/advocate/tools/iep-review" />} />
              <Route path="/tools/ai-iep-review" element={<RoleBasedRedirect parentRoute="/parent/tools/ai-iep-review" advocateRoute="/advocate/tools/ai-iep-review" />} />
              <Route path="/tools/autism-accommodations" element={<RoleBasedRedirect parentRoute="/parent/tools/autism-accommodations" advocateRoute="/advocate/tools/autism-accommodations" />} />
              <Route path="/tools/advocate-matching" element={<RoleBasedRedirect parentRoute="/parent/tools/advocate-matching" advocateRoute="/advocate/tools/advocate-matching" />} />
              <Route path="/tools/gifted-2e-learners" element={<RoleBasedRedirect parentRoute="/parent/tools/gifted-2e-learners" advocateRoute="/advocate/tools/gifted-2e-learners" />} />
              <Route path="/tools/smart-letter" element={<RoleBasedRedirect parentRoute="/parent/tools/smart-letter" advocateRoute="/advocate/tools/smart-letter" />} />
              <Route path="/tools/meeting-prep" element={<RoleBasedRedirect parentRoute="/parent/tools/meeting-prep" advocateRoute="/advocate/tools/meeting-prep" />} />
              
              {/* Profile & Settings */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/parent/settings" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/advocate/settings" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={<RoleBasedRedirect parentRoute="/parent/settings" advocateRoute="/advocate/settings" />} />
              
              {/* Student Management - Legacy route redirect */}
              <Route path="/students" element={<Navigate to="/parent/students" replace />} />
              
              {/* Premium & Upsell */}
              <Route path="/parent/upsell/hero-plan" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentHeroPlan />
                </ProtectedRoute>
              } />
              <Route path="/advocates" element={<AdvocateDiscovery />} />
              
              {/* Pricing Plans */}
              <Route path="/advocate-pricing-plan" element={<AdvocatePricingPlan />} />
              <Route path="/parent-pricing-plan" element={<ParentPricingPlan />} />
              <Route path="/parent-hero-plan" element={<ParentHeroPlan />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
