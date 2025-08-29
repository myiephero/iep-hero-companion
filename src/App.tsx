
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ParentDashboard from "./pages/ParentDashboard";
import AdvocateDashboard from "./pages/AdvocateDashboard";
import AdvocateMessages from "./pages/AdvocateMessages";
import AdvocateSchedule from "./pages/AdvocateSchedule";
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
              
              {/* Parent Routes */}
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/meeting-prep" element={<ParentMeetingPrep />} />
              
              {/* Advocate Routes */}
              <Route path="/advocate/dashboard" element={<AdvocateDashboard />} />
              <Route path="/advocate/messages" element={<AdvocateMessages />} />
              <Route path="/advocate/schedule" element={<AdvocateSchedule />} />
              
              {/* Tools Routes */}
              <Route path="/tools/hub" element={<ToolsHub />} />
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
              
              {/* Student Management */}
              <Route path="/students" element={<StudentProfiles />} />
              
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
