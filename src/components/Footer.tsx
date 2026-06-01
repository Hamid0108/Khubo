import React from 'react';
import { Globe, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F7F7F7] border-t border-neutral-200 py-6 mt-12 pb-24 md:pb-6">
      <div className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-[13px] md:text-sm text-neutral-600">
        
        {/* Left Side */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2">
          <span>© {currentYear} Khubo, Inc.</span>
          <span className="hidden md:inline font-bold">·</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span className="hidden md:inline font-bold">·</span>
          <a href="#" className="hover:underline">Terms</a>
          <span className="hidden md:inline font-bold">·</span>
          <a href="#" className="hover:underline">Sitemap</a>
          <span className="hidden md:inline font-bold">·</span>
          <a href="#" className="hover:underline flex items-center gap-1.5">
            Your Privacy Choices
            <svg width="26" height="12" fill="none" viewBox="0 0 26 12">
              <rect width="26" height="12" fill="#0072FF" rx="6" />
              <path fill="#fff" d="M18.5 3h-1.6l-1 2.8-1-2.8h-1.6l1.8 4.2v2h1.6V7.2l1.8-4.2zM8.2 4.4l-1.9 2-1.2-1.2-1 1.1 2.2 2.3 3-3-1.1-1.2z" />
            </svg>
          </a>
        </div>

        {/* Right Side */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 font-medium text-neutral-800">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:underline">
              <Globe size={16} />
              <span>English (US)</span>
            </button>
            <button className="flex items-center gap-2 hover:underline">
              <span className="font-sans font-bold">₱</span>
              <span>PHP</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-black transition" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="hover:text-black transition flex items-center" aria-label="X (Twitter)">
              <svg width="15" height="15" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" className="hover:text-black transition" aria-label="Instagram">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
