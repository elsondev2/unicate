import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Security from "./pages/Security";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NoteEditor from "./pages/NoteEditor";
import AudioUpload from "./pages/AudioUpload";
import MindMapEditor from "./pages/MindMapEditor.mobile";
import AccountSettings from "./pages/AccountSettings";
import ProfileSettings from "./pages/settings/ProfileSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import AudioPlayer from "./pages/AudioPlayer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="unicate-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/security" element={<Security />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/audio/player" element={<ProtectedRoute><AudioPlayer /></ProtectedRoute>} />
              <Route path="/notes/:id" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
              <Route path="/audio/upload" element={<ProtectedRoute requiredRole="TEACHER"><AudioUpload /></ProtectedRoute>} />
              <Route path="/mindmaps/:id" element={<ProtectedRoute><MindMapEditor /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>}>
                <Route index element={<Navigate to="/settings/profile" replace />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="appearance" element={<AppearanceSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
