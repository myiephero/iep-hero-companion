
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
              
              {/* Tools Routes */}
              <Route path="/tools/hub" element={<RoleBasedRedirect parentRoute="/parent/tools" advocateRoute="/advocate/tools" />} />
              <Route path="/parent/tools" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/advocate/tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <ToolsHub />
                </ProtectedRoute>
              } />
              <Route path="/tools/emergent" element={<EmergentToolsHub />} />
              <Route path="/tools/document-vault" element={<DocumentVault />} />
              <Route path="/tools/iep-review" element={<IEPReview />} />
              <Route path="/tools/ai-iep-review" element={<AIIEPReview />} />
              <Route path="/tools/autism-accommodations" element={<AutismAccommodationBuilder />} />
              <Route path="/tools/advocate-matching" element={<AdvocateMatchingTool />} />
              <Route path="/tools/gifted-2e-learners" element={<GiftedTwoeLearners />} />
              <Route path="/tools/smart-letter" element={<SmartLetterGenerator />} />
              <Route path="/tools/meeting-prep" element={<MeetingPrepWizard />} />
              
              {/* Profile & Settings */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Student Management - Legacy route redirect */}
              <Route path="/students" element={<Navigate to="/parent/students" replace />} />
              
              {/* Premium & Upsell */}
              <Route path="/upsell/hero-plan" element={<HeroPlan />} />
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
