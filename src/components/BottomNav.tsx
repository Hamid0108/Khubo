import { useEffect, useState } from 'react';
import { Home, MessageSquare, Users, Map, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      // Intentionally suppressing errors as the table might not exist yet
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      
      if (count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Messages', path: '/messages', badge: unreadCount },
    { icon: Users, label: 'Roommate', path: '/roommate' },
    { icon: Map, label: 'Maps', path: '/maps' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
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
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '') || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button 
              key={idx}
              onClick={() => navigate(item.path)}
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
  );
}
