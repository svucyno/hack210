import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import MarketPage from "@/pages/MarketPage";
import SchemesPage from "@/pages/SchemesPage";
import ProfilePage from "@/pages/ProfilePage";
import DiseasePage from "@/pages/DiseasePage";
import CropAdvisorPage from "@/pages/CropAdvisorPage";
import FarmerAssistantPage from "@/pages/FarmerAssistantPage";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agri-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
    <Route path="/market" element={<ProtectedRoute><AppLayout><MarketPage /></AppLayout></ProtectedRoute>} />
    <Route path="/disease" element={<ProtectedRoute><AppLayout><DiseasePage /></AppLayout></ProtectedRoute>} />
    <Route path="/crop-advisor" element={<ProtectedRoute><AppLayout><CropAdvisorPage /></AppLayout></ProtectedRoute>} />
    <Route path="/assistant" element={<ProtectedRoute><AppLayout><FarmerAssistantPage /></AppLayout></ProtectedRoute>} />
    <Route path="/schemes" element={<ProtectedRoute><AppLayout><SchemesPage /></AppLayout></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
