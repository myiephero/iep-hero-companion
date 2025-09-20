import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
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
import SetupPassword from "./pages/SetupPassword";
import SubscriptionSetup from "./pages/SubscriptionSetup";
import Onboarding from "./pages/Onboarding";

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <BrowserRouter>
        <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<PricingSelection />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/setup-password" element={<SetupPassword />} />
              <Route path="/subscription-setup" element={<SubscriptionSetup />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
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
              
              {/* Advocate Tool Routes */}
              <Route path="/advocate/tools" element={
                <ProtectedRoute allowedRoles={['advocate']}>
                  <AdvocateToolsHub />
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
              <Route path="/parent/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/advocate/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/parent/messages" element={<Navigate to="/messages" replace />} />
              <Route path="/advocate/messages" element={<Navigate to="/messages" replace />} />
              <Route path="/parent/students" element={<Navigate to="/students" replace />} />
              <Route path="/advocate/students" element={<Navigate to="/students" replace />} />
              <Route path="/parent/schedule" element={<Navigate to="/schedule" replace />} />
              <Route path="/advocate/schedule" element={<Navigate to="/schedule" replace />} />
              <Route path="/parent/tools" element={<Navigate to="/tools" replace />} />
              <Route path="/advocate/tools" element={<Navigate to="/tools" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
          </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;