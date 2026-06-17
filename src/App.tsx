import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense, lazy, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider } from './lib/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import ErrorBoundary from './components/errors/ErrorBoundary';
import PageError from './components/ui/ErrorScreen';

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const CategoryListings = lazy(() => import('./pages/CategoryListings'));
const Messages = lazy(() => import('./pages/Messages'));
const Maps = lazy(() => import('./pages/Maps'));
const RoommateFinder = lazy(() => import('./pages/RoommateFinder'));
const Profile = lazy(() => import('./pages/Profile'));
const ManageListings = lazy(() => import('./pages/ManageListings'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));

// A simple loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-neutral-200 border-t-[#17294F] rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MotionConfig reducedMotion="user">
            <Router>
              <ScrollToTop />
              <ErrorBoundary fallback={<PageError />}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/listing/:id" element={<ListingDetail />} />
                    <Route path="/category/:categoryId" element={<CategoryListings />} />
                    <Route path="/maps" element={<Maps />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/roommate" element={<RoommateFinder />} />
                    <Route path="/roommate-finder" element={<RoommateFinder />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/manage-listings" element={<ManageListings />} />
                    <Route path="/profile-setup" element={<ProfileSetup />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Router>
          </MotionConfig>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
