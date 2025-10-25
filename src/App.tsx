import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import A11yProvider from "./components/A11yProvider";
import WebVitals from "./components/WebVitals";
import { OrganizationStructuredData } from "./components/StructuredData";
import NotAuthorized from "./pages/NotAuthorized";

// Code-split lazy loaded pages
const Auth = lazy(() => import("./pages/Auth"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Search = lazy(() => import("./pages/Search"));
const Saved = lazy(() => import("./pages/Saved"));
const SavedSearches = lazy(() => import("./pages/SavedSearches"));
const Applications = lazy(() => import("./pages/Applications"));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const PostJob = lazy(() => import("./pages/PostJob"));
const EmployerPortal = lazy(() => import("./pages/EmployerPortal"));
const EmployerDashboard = lazy(() => import("./pages/EmployerDashboard"));
const EmployerApplicants = lazy(() => import("./pages/EmployerApplicants"));
const EmployerSettings = lazy(() => import("./pages/EmployerSettings"));
const PrivacySettings = lazy(() => import("./pages/PrivacySettings"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Privacy = lazy(() => import("./pages/Privacy"));
const CandidatePrivacy = lazy(() => import("./pages/CandidatePrivacy"));
const Terms = lazy(() => import("./pages/Terms"));
const DPA = lazy(() => import("./pages/DPA"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const PrivacyCenter = lazy(() => import("./pages/PrivacyCenter"));
const LegalSettings = lazy(() => import("./pages/LegalSettings"));
const UpdateDemoAccounts = lazy(() => import("./pages/UpdateDemoAccounts"));
const ForYou = lazy(() => import("./pages/ForYou"));
const CareerTools = lazy(() => import("./pages/CareerTools"));
const CVBuilder = lazy(() => import("./pages/CVBuilder"));
const CoverLetterGenerator = lazy(() => import("./pages/CoverLetterGenerator"));
const SalaryPlanner = lazy(() => import("./pages/SalaryPlanner"));
const CityHub = lazy(() => import("./pages/hubs/CityHub"));
const CategoryHub = lazy(() => import("./pages/hubs/CategoryHub"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <A11yProvider>
            <WebVitals />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OrganizationStructuredData />
              <Header />
              <main id="main-content">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/job/:id" element={<Navigate replace to="/jobs/:id" />} />
                <Route path="/search" element={<Search />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/saved-searches" element={<SavedSearches />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/dashboard" element={<CandidateDashboard />} />
                <Route path="/for-you" element={<ForYou />} />
                <Route path="/career" element={<CareerTools />} />
                <Route path="/cv-builder" element={<CVBuilder />} />
                <Route path="/cover-letter" element={<CoverLetterGenerator />} />
                <Route path="/salary-planner" element={<SalaryPlanner />} />
                
                <Route path="/jobs/city/:slug" element={<CityHub />} />
                <Route path="/jobs/category/:slug" element={<CategoryHub />} />
                
                <Route path="/jobs/kliniken" element={<CategoryHub />} />
                <Route path="/jobs/altenheime" element={<CategoryHub />} />
                <Route path="/jobs/ambulante-pflege" element={<CategoryHub />} />
                
                {/* Redirect old category slug to new routes */}
                <Route path="/jobs/category/kliniken-und-krankenhaeuser" element={<Navigate replace to="/jobs/kliniken" />} />
                <Route path="/jobs/category/altenheime" element={<Navigate replace to="/jobs/altenheime" />} />
                
                {/* Employer Portal with nested routes */}
                <Route path="/employer" element={<EmployerPortal />}>
                  <Route index element={<EmployerDashboard />} />
                  <Route path="jobs" element={<EmployerDashboard />} />
                  <Route path="post" element={<PostJob />} />
                  <Route path="post/:draftId" element={<PostJob />} />
                  <Route path="applicants" element={<EmployerApplicants />} />
                  <Route path="settings" element={<EmployerSettings />} />
                </Route>
                
                {/* Legacy routes for backward compatibility */}
                <Route path="/employer/dashboard" element={<EmployerPortal />}>
                  <Route index element={<EmployerDashboard />} />
                </Route>
                
                <Route path="/privacy-settings" element={<PrivacySettings />} />
                
                {/* Admin pages */}
                <Route path="/admin/legal-settings" element={<LegalSettings />} />
                <Route path="/update-demo-accounts" element={<UpdateDemoAccounts />} />
                
                {/* Legal pages - German paths */}
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Privacy />} />
                <Route path="/bewerber-datenschutz" element={<CandidatePrivacy />} />
                <Route path="/agb" element={<Terms />} />
                <Route path="/avv" element={<DPA />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/privacy-center" element={<PrivacyCenter />} />
                <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
                
                {/* Legal pages - English path aliases */}
                <Route path="/imprint" element={<Impressum />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/candidate-privacy" element={<CandidatePrivacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/dpa" element={<DPA />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CookieConsent />
        </BrowserRouter>
      </A11yProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
    </QueryClientProvider>
);

export default App;