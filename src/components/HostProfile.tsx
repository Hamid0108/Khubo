import React from 'react';
import { ShieldCheck, Star, Briefcase, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface HostProfileProps {
  name: string;
  image: string;
  reviews: number;
  rating: number;
  hostingDuration: string;
  work: string;
  location: string;
  tenantCount: number;
}

const HostProfile: React.FC<HostProfileProps> = ({
  name,
  image,
  reviews,
  rating,
  hostingDuration,
  work,
  location,
  tenantCount
}) => {
  return (
    <div className="py-8 border-t border-neutral-100 mt-8">
      <h2 className="text-2xl font-semibold mb-8">
        Meet your landlord
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Host Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] border border-neutral-100 flex-1 flex flex-col items-center text-center relative overflow-hidden group max-w-md mx-auto lg:mx-0"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-4 ring-4 ring-neutral-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-4 right-1 bg-pink-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
              <ShieldCheck size={14} className="fill-white/20" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-[#17294F] mb-0.5 tracking-tighter">
            {name}
          </h3>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-6">Landlord</p>

          <div className="grid grid-cols-4 gap-4 w-full border-t border-neutral-50 pt-6">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-[#17294F]">{reviews}</span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Reviews</span>
            </div>
            <div className="flex flex-col items-center border-l border-neutral-50 px-2">
              <div className="flex items-center gap-0.5">
                <span className="text-xl font-black text-[#17294F]">{rating}</span>
                <Star size={12} className="fill-[#17294F] text-[#17294F]" />
              </div>
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Rating</span>
            </div>
            <div className="flex flex-col items-center border-l border-neutral-50 px-2">
              <span className="text-xl font-black text-[#17294F]">{hostingDuration.split(' ')[0]}</span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider text-center leading-tight">
                {hostingDuration.split(' ').slice(1).join(' ')} hosting
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-neutral-50 px-2">
              <span className="text-xl font-black text-[#17294F]">{tenantCount}</span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider text-center leading-tight">
                Tenants
              </span>
            </div>
          </div>
        </motion.div>

        {/* Host Info & Details */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#17294F]/5 flex items-center justify-center text-[#17294F] group-hover:bg-[#17294F] group-hover:text-white transition-all duration-300">
                <Briefcase size={18} className="stroke-[2.5px]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">My work</p>
                <p className="text-base font-bold text-[#17294F]">{work}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#17294F]/5 flex items-center justify-center text-[#17294F] group-hover:bg-[#17294F] group-hover:text-white transition-all duration-300">
                <Globe size={18} className="stroke-[2.5px]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Lives in</p>
                <p className="text-base font-bold text-[#17294F]">{location}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#17294F] rounded-2xl p-6 text-white relative overflow-hidden group max-w-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-x-4 translate-y-4 group-hover:scale-150 transition-transform duration-700" />
            <p className="text-xs font-medium leading-relaxed opacity-80 relative z-10">
              "I take pride in providing a seamless luxury experience for my guests. From the moment you arrive until you check out, your comfort is my top priority."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
