import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Analyze from "./pages/Analyze";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ReadinessScore from "./pages/ReadinessScore";
import FundingRecommendation from "./pages/FundingRecommendation";
import LoanApp from "./pages/LoanApp";
import RejectionRisks from "./pages/RejectionRisks";
import ImprovementPage from "./pages/ImprovementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/readiness-score" element={<ProtectedRoute><ReadinessScore /></ProtectedRoute>} />
            <Route path="/funding-recommendation" element={<ProtectedRoute><FundingRecommendation /></ProtectedRoute>} />
            <Route path="/loan-application" element={<ProtectedRoute><LoanApp /></ProtectedRoute>} />
            <Route path="/rejection-risks" element={<ProtectedRoute><RejectionRisks /></ProtectedRoute>} />
            <Route path="/improvement-roadmap" element={<ProtectedRoute><ImprovementPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
