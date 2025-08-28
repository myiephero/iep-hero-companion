import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TopNavigation } from "@/components/TopNavigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import StudentProfiles from "./pages/StudentProfiles";
import SmartLetterGenerator from "./pages/SmartLetterGenerator";
import MeetingPrepWizard from "./pages/MeetingPrepWizard";
import AdvocateDiscovery from "./pages/AdvocateDiscovery";
import AIIEPReview from "./pages/AIIEPReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// App content component
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {user && <TopNavigation />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/parent/dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/students" element={<ProtectedRoute><StudentProfiles /></ProtectedRoute>} />
        <Route path="/parent/meeting-prep" element={<ProtectedRoute><ParentMeetingPrep /></ProtectedRoute>} />
        <Route path="/parent/letters" element={<ProtectedRoute><SmartLetterGenerator /></ProtectedRoute>} />
        <Route path="/parent/meeting-prep-wizard" element={<ProtectedRoute><MeetingPrepWizard /></ProtectedRoute>} />
        <Route path="/parent/advocates" element={<ProtectedRoute><AdvocateDiscovery /></ProtectedRoute>} />
        <Route path="/advocate/dashboard" element={<ProtectedRoute><AdvocateDashboard /></ProtectedRoute>} />
        <Route path="/advocate/messages" element={<ProtectedRoute><AdvocateMessages /></ProtectedRoute>} />
        <Route path="/advocate/schedule" element={<ProtectedRoute><AdvocateSchedule /></ProtectedRoute>} />
        <Route path="/tools/iep-review" element={<ProtectedRoute><IEPReview /></ProtectedRoute>} />
        <Route path="/tools/ai-iep-review" element={<ProtectedRoute><AIIEPReview /></ProtectedRoute>} />
        <Route path="/tools/autism-accommodations" element={<ProtectedRoute><AutismAccommodations /></ProtectedRoute>} />
        <Route path="/upsell/hero-plan" element={<ProtectedRoute><HeroPlan /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
