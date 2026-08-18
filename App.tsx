import "./global.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Faculty from "./pages/Faculty";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Upload from "./pages/Upload";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProjectDetails from "./pages/ProjectDetails";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
           <ProtectedRoute requireAuth={false}>
            <ForgotPassword />
           </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
           <ProtectedRoute requireAuth={false}>
          <ResetPassword />
          </ProtectedRoute>
           }
          />

          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route
            path="/categories"
            element={
              <PlaceholderPage
                title="Project Categories"
                description="Browse projects by category and department"
              />
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PlaceholderPage
                title="Leaderboard"
                description="Top contributors and most popular projects"
              />
            }
          />
          <Route
            path="/help"
            element={
              <PlaceholderPage
                title="Help Center"
                description="Guidelines and support for using the project bank"
              />
            }
          />
          <Route
            path="/guidelines"
            element={
              <PlaceholderPage
                title="Submission Guidelines"
                description="Rules and best practices for project submissions"
              />
            }
          />
          <Route
            path="/contact"
            element={
              <PlaceholderPage
                title="Contact Us"
                description="Get in touch with the RCEW Project Bank team"
              />
            }
          />
          <Route
            path="/feedback"
            element={
              <PlaceholderPage
                title="Feedback"
                description="Share your thoughts and suggestions"
              />
            }
          />
          <Route
            path="/departments"
            element={
              <PlaceholderPage
                title="Departments"
                description="Information about engineering departments at RCEW"
              />
            }
          />
          <Route
  path="/faculty"
  element={
    <ProtectedRoute requiredRoles={["faculty", "admin"]}>
      <Faculty />
    </ProtectedRoute>
  }
/>
          <Route
            path="/news"
            element={
              <PlaceholderPage
                title="News & Events"
                description="Latest updates and events from RCEW"
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
