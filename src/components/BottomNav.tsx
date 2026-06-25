import { useEffect, useState } from 'react';
import { Home, MessageSquare, Users, Map, User, Building, Plus, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { CreateListingModal } from './CreateListingModal';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLandlordMode, setIsLandlordMode] = useState(() => {
    return localStorage.getItem('khubo_is_landlord') === 'true';
  });
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);

  useEffect(() => {
    const checkLandlordMode = () => {
      setIsLandlordMode(localStorage.getItem('khubo_is_landlord') === 'true');
    };

    checkLandlordMode();

    // Listen for storage events (e.g. changes in other tabs/windows)
    window.addEventListener('storage', checkLandlordMode);

    // Update dynamically on a periodic short interval within the same page
    const interval = setInterval(() => {
      checkLandlordMode();
    }, 3000);

    return () => {
      window.removeEventListener('storage', checkLandlordMode);
      clearInterval(interval);
    };
  }, []);

  const landlordItems = [
    { icon: Home, label: 'Dashboard', path: '/profile?tab=overview' },
    { icon: Building, label: 'Listings', path: '/profile?tab=properties' },
    { icon: Plus, label: 'Post', path: 'post_action' },
    { icon: Settings, label: 'Settings', path: '/profile?tab=settings' },
  ];

  const tenantItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Roommate', path: '/roommate' },
    { icon: Map, label: 'Map', path: '/maps' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const items = isLandlordMode ? landlordItems : tenantItems;

  return (
    <>
      <div 
        className="fixed bottom-[calc(12px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-[420px] pointer-events-none"
      >
        <motion.nav 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          className="bg-[#000000]/35 backdrop-blur-xl border border-white/10 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-around gap-1 pointer-events-auto"
        >
          {items.map((item, idx) => {
            const isPostAction = item.path === 'post_action';
            const isActive = !isPostAction && (
              (location.pathname === '/profile' && item.path.startsWith('/profile') && (
                location.search === item.path.substring(item.path.indexOf('?')) || 
                (location.search === '' && item.path.includes('overview'))
              )) ||
              (item.path === '/' && (location.pathname === '/' || location.pathname === '')) ||
              (item.path !== '/' && !item.path.startsWith('/profile') && location.pathname.startsWith(item.path))
            );

            return (
              <button 
                key={idx}
                onClick={() => {
                  if (isPostAction) {
                    setIsCreateListingOpen(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                className="flex flex-col items-center justify-center min-w-0 flex-1 py-0.5 group transition-all duration-200 relative"
              >
                <div className={`p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-300 relative ${isActive ? 'text-[#3b82f6]' : 'text-neutral-200 group-hover:text-white'}`}>
                  <item.icon className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider text-center transition-colors duration-200 mt-0.5 block truncate max-w-full ${isActive ? 'text-[#3b82f6]' : 'text-neutral-200 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </motion.nav>
      </div>

      {/* Global Modals for landlord posting */}
      <CreateListingModal 
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSuccess={() => {
          setIsCreateListingOpen(false);
          window.dispatchEvent(new Event('refresh_listings'));
        }}
      />
    </>
  );
}
