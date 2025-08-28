import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopNavigation } from "@/components/TopNavigation";
import Index from "./pages/Index";
import ParentDashboard from "./pages/ParentDashboard";
import AdvocateDashboard from "./pages/AdvocateDashboard";
import IEPReview from "./pages/IEPReview";
import AutismAccommodations from "./pages/AutismAccommodations";
import HeroPlan from "./pages/HeroPlan";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AdvocateMessages from "./pages/AdvocateMessages";
import AdvocateSchedule from "./pages/AdvocateSchedule";
import ParentMeetingPrep from "./pages/ParentMeetingPrep";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <TopNavigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/parent/meeting-prep" element={<ParentMeetingPrep />} />
            <Route path="/advocate/dashboard" element={<AdvocateDashboard />} />
            <Route path="/advocate/messages" element={<AdvocateMessages />} />
            <Route path="/advocate/schedule" element={<AdvocateSchedule />} />
            <Route path="/tools/iep-review" element={<IEPReview />} />
            <Route path="/tools/autism-accommodations" element={<AutismAccommodations />} />
            <Route path="/upsell/hero-plan" element={<HeroPlan />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
