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
import PostEdit from "./pages/PostEdit";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import FailureHeatmap from "./pages/FailureHeatmap";
import ResurrectionMarketplace from "./pages/ResurrectionMarketplace";
import LiveAutopsyWarRooms from "./pages/LiveAutopsyWarRooms";
import FailureReportDetail from "./pages/FailureReportDetail";
import FailureReportSubmit from "./pages/FailureReportSubmit";
import WarRoomDetail from "./pages/WarRoomDetail";
import StoryDetail from "./pages/StoryDetail";
import FounderDetail from "./pages/FounderDetail";
import InvestorDetail from "./pages/InvestorDetail";
import AssetDetail from "./pages/AssetDetail";
import ListAsset from "./pages/ListAsset";
import MyListings from "./pages/MyListings";
import BookmarkedPosts from "./pages/BookmarkedPosts";
import Messages from "./pages/Messages";
import WarRoomCreate from "./pages/WarRoomCreate";
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
            <Route path="/" element={<Index />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            <Route path="/founders" element={<Founders />} />
            <Route path="/founders/:id" element={<FounderDetail />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/investors/:id" element={<InvestorDetail />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route 
              path="/posts/:postId/edit" 
              element={
                <ProtectedRoute>
                  <PostEdit />
                </ProtectedRoute>
              } 
            />
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
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route 
              path="/bookmarks" 
              element={
                <ProtectedRoute>
                  <BookmarkedPosts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route path="/failure-heatmap" element={<FailureHeatmap />} />
            <Route path="/failure-reports/submit" element={<FailureReportSubmit />} />
            <Route path="/failure-reports/:id" element={<FailureReportDetail />} />
            <Route path="/marketplace" element={<ResurrectionMarketplace />} />
            <Route 
              path="/marketplace/list-asset" 
              element={
                <ProtectedRoute>
                  <ListAsset />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marketplace/my-listings" 
              element={
                <ProtectedRoute>
                  <MyListings />
                </ProtectedRoute>
              } 
            />
            <Route path="/marketplace/:id" element={<AssetDetail />} />
            <Route path="/resurrection-marketplace" element={<ResurrectionMarketplace />} />
            <Route path="/war-rooms" element={<LiveAutopsyWarRooms />} />
            <Route 
              path="/war-rooms/create" 
              element={
                <ProtectedRoute>
                  <WarRoomCreate />
                </ProtectedRoute>
              } 
            />
            <Route path="/war-rooms/:id" element={<WarRoomDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
