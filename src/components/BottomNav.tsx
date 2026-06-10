import { useEffect, useState } from 'react';
import { Home, MessageSquare, Users, Play, User, Building, Plus, Settings, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { CreateListingModal } from './CreateListingModal';
import { CreateFYPModal } from './CreateFYPModal';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLandlordMode, setIsLandlordMode] = useState(() => {
    return localStorage.getItem('khubo_is_landlord') === 'true';
  });
  const [showPostOverlay, setShowPostOverlay] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isCreateFYPOpen, setIsCreateFYPOpen] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      let dbUnread = 0;
      let localUnread = 0;

      if (user?.id) {
        try {
          const { data } = await supabase
            .from('conversations')
            .select('unread_count, last_sender_id')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
          if (data) {
            dbUnread = data.reduce((sum: number, c: any) => {
              const isLastMsgFromMe = c.last_sender_id === user.id;
              return sum + (isLastMsgFromMe ? 0 : (c.unread_count || 0));
            }, 0);
          }
        } catch (e) {
          console.error('Failed to fetch unread count from Supabase:', e);
        }
      } else {
        const savedChatsStr = localStorage.getItem('khubo_conversations');
        if (savedChatsStr) {
          try {
            const savedChats = JSON.parse(savedChatsStr);
            localUnread = savedChats.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
          } catch (e) {
            console.error('Failed to parse local conversations:', e);
          }
        }
      }

      setUnreadCount(dbUnread + localUnread);
    };

    const checkLandlordMode = () => {
      setIsLandlordMode(localStorage.getItem('khubo_is_landlord') === 'true');
    };

    fetchUnreadCount();
    checkLandlordMode();

    // Listen for storage events (e.g. changes in other tabs/windows)
    window.addEventListener('storage', () => {
      fetchUnreadCount();
      checkLandlordMode();
    });

    // Listen to Supabase Realtime conversation changes for badge updates
    const channel = supabase
      .channel(`nav_badge_conversations:${user?.id || 'guest'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Update dynamically on a periodic short interval within the same page
    const interval = setInterval(() => {
      fetchUnreadCount();
      checkLandlordMode();
    }, 3000);

    return () => {
      window.removeEventListener('storage', fetchUnreadCount);
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user?.id]);

  const landlordItems = [
    { icon: Home, label: 'Dashboard', path: '/profile?tab=overview' },
    { icon: Building, label: 'Listings', path: '/profile?tab=properties' },
    { icon: Plus, label: 'Post', path: 'post_overlay' },
    { icon: MessageSquare, label: 'Messages', path: '/messages', badge: unreadCount },
    { icon: Settings, label: 'Settings', path: '/profile?tab=settings' },
  ];

  const tenantItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Roommate', path: '/roommate' },
    { icon: Play, label: 'For You', path: '/fyp' },
    { icon: MessageSquare, label: 'Messages', path: '/messages', badge: unreadCount },
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
            const isPostOverlay = item.path === 'post_overlay';
            const isActive = !isPostOverlay && (
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
                  if (isPostOverlay) {
                    setShowPostOverlay(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                className="flex flex-col items-center justify-center min-w-0 flex-1 py-0.5 group transition-all duration-200 relative"
              >
                <div className={`p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-300 relative ${isActive ? 'text-[#3b82f6]' : 'text-neutral-200 group-hover:text-white'}`}>
                  <item.icon className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-transparent">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider text-center transition-colors duration-200 mt-0.5 block truncate max-w-full ${isActive ? 'text-[#3b82f6]' : 'text-neutral-200 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </motion.nav>
      </div>

      {/* Landlord Post Overlay Menu */}
      <AnimatePresence>
        {showPostOverlay && (
          <div className="fixed inset-0 z-[1000] flex items-end justify-center px-4 pb-28">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPostOverlay(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer pointer-events-auto"
            />
            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[280px] bg-white rounded-3xl p-4 shadow-2xl z-10 border border-neutral-100 flex flex-col gap-2 text-neutral-900 pointer-events-auto"
            >
              <h3 className="text-center font-black text-xs uppercase tracking-widest text-neutral-400 py-1 select-none">Create New</h3>
              
              <button
                onClick={() => {
                  setShowPostOverlay(false);
                  setIsCreateListingOpen(true);
                }}
                className="w-full py-3 px-4 bg-neutral-50 hover:bg-[#2252D6]/10 hover:text-[#2252D6] rounded-2xl text-left font-black text-xs uppercase tracking-wider transition duration-200 flex items-center gap-3 cursor-pointer"
              >
                <Building size={16} />
                Post Boarding House
              </button>

              <button
                onClick={() => {
                  setShowPostOverlay(false);
                  setIsCreateFYPOpen(true);
                }}
                className="w-full py-3 px-4 bg-neutral-50 hover:bg-[#2252D6]/10 hover:text-[#2252D6] rounded-2xl text-left font-black text-xs uppercase tracking-wider transition duration-200 flex items-center gap-3 cursor-pointer"
              >
                <Video size={16} />
                Publish Video Reel
              </button>

              <button
                onClick={() => setShowPostOverlay(false)}
                className="w-full py-2 text-center text-xs font-bold text-neutral-400 hover:text-neutral-600 mt-1 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals for landlord posting */}
      <CreateListingModal 
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSuccess={() => {
          setIsCreateListingOpen(false);
          window.dispatchEvent(new Event('refresh_listings'));
        }}
      />

      <CreateFYPModal 
        isOpen={isCreateFYPOpen}
        onClose={() => setIsCreateFYPOpen(false)}
        onSuccess={() => {
          setIsCreateFYPOpen(false);
          window.dispatchEvent(new Event('refresh_fyp'));
        }}
      />
    </>
  );
}
