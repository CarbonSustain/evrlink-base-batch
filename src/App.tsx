import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { AgentButton } from "./components/agent/AgentButton";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import UserProfile from "./components/UserProfile";
import Index from "./pages/Index";
import About from "./pages/About";
import CreateGift from "./pages/CreateGift";
import ClaimGift from "./pages/ClaimGift";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import MyGiftCards from "./pages/MyGiftCards";
import Marketplace from "./pages/Marketplace";
import CategoryCards from "./pages/CategoryCards";
import CardDetail from "./pages/CardDetail";
import CreateBackground from "./pages/CreateBackground";
import Debug from "./pages/Debug";
import ProfilePage from "./pages/ProfilePage";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import { User } from "lucide-react";
import MyGallery from "./pages/MyGallery";
import MyGalleryNewUser from "./pages/MyGalleryNewUser";
import Faq from "./pages/Faq";
import MeepDetails from "./pages/MeepDetails";
import HomePage from "./pages/landing-page/src/pages/Home/index";
import SearchResults from "./pages/SearchResults";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            {/* Add AgentButton here so it appears on all pages */}
            <AgentButton />
            <Routes>
              {/* Only landing page and sign-in are outside Layout */}
              <Route path="/" element={<HomePage />} />
              <Route path="/sign-in" element={<SignIn />} />
              
              {/* All other routes use the Layout with navbar */}
              <Route element={<Layout />}>
                {/* /l/ routes */}
                <Route path="/l">
                  <Route index element={<Index />} />
                  <Route path="about" element={<About />} />
                  <Route path="create" element={<CreateGift />} />
                  <Route path="claim" element={<ClaimGift />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="my-gift-cards" element={<MyGiftCards />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="marketplace/:categoryId" element={<CategoryCards />} />
                  <Route path="marketplace/:categoryId/:cardId" element={<CardDetail />} />
                  <Route path="create-background" element={<CreateBackground />} />
                  <Route path="debug" element={<Debug />} />
                  <Route path="search" element={<SearchResults />} />
                </Route>
                
                {/* Root level routes with Layout */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gallery" element={<MyGallery />} />
                <Route path="/gallerynewuser" element={<MyGalleryNewUser />} />
                <Route path="/meep/:id" element={<MeepDetails />} />
                <Route path="/faqs" element={<Faq />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
