import { useState, useRef, useEffect } from 'react';
import { Search, Globe, Menu, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from './AuthModal';
import { CreateListingModal } from './CreateListingModal';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKhuboYourHome = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateListingOpen(true);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#ebebeb] h-[80px] flex items-center">
      <div className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 w-full">
        <div className="flex flex-row items-center justify-between">
          {/* Logo */}
          <div 
            role="button"
            tabIndex={0}
            aria-label="Khubo Home"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.preventDefault()}
            className="flex items-center gap-1 text-[#17294F] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17294F] rounded-lg px-2"
          >
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              className="block h-8 w-8 fill-current"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.392 3.42-6.72 3.42-3.481 0-6.358-2.416-6.358-6.478 0-4.062 2.877-6.478 6.358-6.478.435 0 .867.042 1.288.125l.443.096c1.378.328 2.628 1.157 3.593 2.139l.257.27.172.179c.143-.146.12-.132.176-.185 1.144-1.168 2.39-2.003 3.69-2.457l.519-.168c.452-.128.917-.193 1.393-.193.18 0 .363.01.547.03h.011c2.252 0 4.095 1.843 4.095 4.095 0 2.253-1.843 4.096-4.095 4.096.184 0 .367.01.551.03l.011.002.547.03c.476 0 .941-.065 1.393-.193l.519-.168c1.3-.454 2.546-1.29 3.69-2.457.054-.053.033-.039.176-.185l.172.179.257.27c.965.982 2.215 1.811 3.593 2.139l.443.096c.421.083.853.125 1.288.125 3.481 0 6.358-2.416 6.358-6.478 0-4.062-2.877-6.478-6.358-6.478-2.328 0-4.676 1.32-6.72 3.42l-.176.185h-.011l-.172-.179-.257-.26c-2.153-2.128-4.485-3.386-6.709-3.386-3.48 0-6.357-2.416-6.357-6.478l.001-.228c.005-.142.008-.283.01-.415.05-.924.293-1.805.96-3.396l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1z" />
            </svg>
            <span className="hidden lg:block font-extrabold text-2xl tracking-tighter">khubo</span>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="button"
            tabIndex={0}
            aria-label="Open search menu"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.preventDefault()}
            className="border border-[#dddddd] h-[48px] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md transition cursor-pointer flex items-center px-2 pl-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17294F]"
          >
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="text-sm font-semibold pr-4 border-r border-[#dddddd]">Anywhere</div>
              <div className="hidden sm:block text-sm font-semibold px-4 border-r border-[#dddddd]">Any week</div>
              <div className="text-sm pl-4 pr-1 text-[#717171] flex flex-row items-center gap-3">
                <div className="hidden sm:block">Add guests</div>
                <div className="w-[32px] h-[32px] bg-[#17294F] rounded-full text-white flex items-center justify-center">
                  <Search size={12} strokeWidth={4} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Menu */}
          <div className="flex flex-row items-center gap-3 relative" ref={menuRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={handleKhuboYourHome}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.preventDefault()}
              className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17294F]"
            >
              Khubo your home
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label="Choose language"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.preventDefault()}
              className="hidden sm:block p-3 hover:bg-neutral-100 rounded-full transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17294F]"
            >
              <Globe size={18} />
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label="User menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.preventDefault()}
              className="p-1 pl-3 border border-[#dddddd] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17294F]"
            >
              <Menu size={18} />
              <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-white ${user ? 'bg-[#17294F]' : 'bg-[#717171]'}`}>
                <User size={18} />
              </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[60px] w-64 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.12)] border border-[#ebebeb] py-2 z-50 overflow-hidden"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-semibold truncate text-neutral-800">{user.email}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Signed in</p>
                      </div>
                      <div className="py-2">
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition">
                          Messages
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition">
                          Trips
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition">
                          Wishlists
                        </button>
                      </div>
                      <div className="py-2 border-t border-neutral-100">
                        <button 
                          onClick={handleKhuboYourHome}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition"
                        >
                          Khubo your home
                        </button>
                        <Link to="/manage-listings" className="block w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition" onClick={() => setIsMenuOpen(false)}>
                          Manage listings
                        </Link>
                      </div>
                      <div className="py-2 border-t border-neutral-100">
                        <button
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-[#17294F] font-medium transition"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50 text-neutral-800 transition"
                      >
                        Sign up
                      </button>
                      <button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition"
                      >
                        Log in
                      </button>
                      <div className="my-2 border-t border-neutral-100"></div>
                      <button 
                        onClick={handleKhuboYourHome}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition"
                      >
                        Khubo your home
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 text-neutral-700 transition">
                        Help
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <CreateListingModal 
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSuccess={() => {
          alert('Listing created successfully!');
        }}
      />
    </header>
  );
}
