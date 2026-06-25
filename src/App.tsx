import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { MotionConfig } from 'motion/react';
import { ScrollToTop } from './components/ScrollToTop';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider } from './lib/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import ErrorBoundary from './components/errors/ErrorBoundary';
import PageError from './components/ui/ErrorScreen';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const CategoryListings = lazy(() => import('./pages/CategoryListings'));

const Maps = lazy(() => import('./pages/Maps'));
const RoommateFinder = lazy(() => import('./pages/RoommateFinder'));
const Profile = lazy(() => import('./pages/Profile'));
const ManageListings = lazy(() => import('./pages/ManageListings'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// A simple loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-neutral-200 border-t-[#17294F] rounded-full animate-spin"></div>
  </div>
);

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-[#17294F] focus:rounded-full focus:shadow-lg focus:font-bold"
    >
      Skip to main content
    </a>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MotionConfig reducedMotion="user">
            <Router>
              <SkipLink />
              <ScrollToTop />
              <ErrorBoundary fallback={<PageError />}>
                <Suspense fallback={<PageLoader />}>
                  <div id="main-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/listing/:id" element={<ListingDetail />} />
                      <Route path="/category/:categoryId" element={<CategoryListings />} />
                      <Route path="/maps" element={<Maps />} />

                      <Route path="/roommate" element={<RoommateFinder />} />
                      <Route path="/roommate-finder" element={<RoommateFinder />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/manage-listings" element={<ManageListings />} />
                      <Route path="/profile-setup" element={<ProfileSetup />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                    </Routes>
                  </div>
                </Suspense>
              </ErrorBoundary>
            </Router>
          </MotionConfig>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
