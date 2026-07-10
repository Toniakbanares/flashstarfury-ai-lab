import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Tools from "./pages/Tools";
import Explore from "./pages/Explore";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AIImageGenerator from "./pages/AIImageGenerator";
import AILogoGenerator from "./pages/AILogoGenerator";
import AIAvatarGenerator from "./pages/AIAvatarGenerator";
import AIArtGenerator from "./pages/AIArtGenerator";
import CreationDetails from "./pages/CreationDetails";
import Offerings from "./pages/Offerings";
import OfferDetails from "./pages/OfferDetails";
import SavedOffers from "./pages/SavedOffers";
import ToolDetails from "./pages/ToolDetails";
import Favorites from "./pages/Favorites";
import SubmitTool from "./pages/SubmitTool";
import MusicStudio from "./pages/MusicStudio";
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
            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-image-generator" element={<AIImageGenerator />} />
              <Route path="/ai-logo-generator" element={<AILogoGenerator />} />
              <Route path="/ai-avatar-generator" element={<AIAvatarGenerator />} />
              <Route path="/ai-art-generator" element={<AIArtGenerator />} />
              <Route path="/create/:id" element={<CreationDetails />} />
              <Route path="/offerings" element={<Offerings />} />
              <Route path="/offer/:id" element={<OfferDetails />} />
              <Route path="/saved" element={<SavedOffers />} />
              <Route path="/tool/:slug" element={<ToolDetails />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/submit" element={<SubmitTool />} />
              <Route path="/music" element={<MusicStudio />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
