import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Stories from "./pages/Stories";
import Founders from "./pages/Founders";
import Investors from "./pages/Investors";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import PostDetail from "./pages/PostDetail";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import FailureHeatmap from "./pages/FailureHeatmap";
import ResurrectionMarketplace from "./pages/ResurrectionMarketplace";
import LiveAutopsyWarRooms from "./pages/LiveAutopsyWarRooms";
import { RedirectIfAuthed } from "@/components/RedirectIfAuthed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <RedirectIfAuthed>
                  <Index />
                </RedirectIfAuthed>
              }
            />
            <Route path="/stories" element={<Stories />} />
            <Route path="/founders" element={<Founders />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/investor-dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/failure-heatmap" element={<FailureHeatmap />} />
            <Route path="/failure-reports/:id" element={<FailureHeatmap />} />
            <Route path="/marketplace" element={<ResurrectionMarketplace />} />
            <Route path="/resurrection-marketplace" element={<ResurrectionMarketplace />} />
            <Route path="/war-rooms" element={<LiveAutopsyWarRooms />} />
            <Route path="/war-rooms/:id" element={<LiveAutopsyWarRooms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
