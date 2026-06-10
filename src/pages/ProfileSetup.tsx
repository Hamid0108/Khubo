import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  User,
  BookOpen,
  MapPin,
  Phone,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Heart,
  Coffee,
  Moon,
  Sun,
  Music,
  Dumbbell,
  UtensilsCrossed,
  Cigarette,
  Dog,
  Leaf,
  Clock,
  Users,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/ToastProvider';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface ProfileData {
  full_name: string;
  nickname: string;
  bio: string;
  phone: string;
  location: string;
  occupation: 'student' | 'working' | 'both' | '';
  school_or_company: string;
  id_type: 'school_id' | 'national_id' | 'drivers_license' | 'passport' | '';
  id_photo_url: string;
  avatar_url: string;
  lifestyle: string[];
  sleep_schedule: 'early_bird' | 'night_owl' | 'flexible' | '';
  cleanliness: 1 | 2 | 3 | 4 | 5 | 0;
  noise_level: 'quiet' | 'moderate' | 'lively' | '';
}

const INITIAL_DATA: ProfileData = {
  full_name: '',
  nickname: '',
  bio: '',
  phone: '',
  location: '',
  occupation: '',
  school_or_company: '',
  id_type: '',
  id_photo_url: '',
  avatar_url: '',
  lifestyle: [],
  sleep_schedule: '',
  cleanliness: 0,
  noise_level: '',
};

const LIFESTYLE_OPTIONS = [
  { id: 'pet_friendly', label: 'Pet-friendly', icon: Dog },
  { id: 'non_smoker', label: 'Non-smoker', icon: Cigarette },
  { id: 'vegan', label: 'Vegan/Vegetarian', icon: Leaf },
  { id: 'fitness', label: 'Gym lover', icon: Dumbbell },
  { id: 'music', label: 'Into music', icon: Music },
  { id: 'foodie', label: 'Foodie', icon: UtensilsCrossed },
  { id: 'social', label: 'Social butterfly', icon: Users },
  { id: 'introvert', label: 'Introvert', icon: Coffee },
  { id: 'remote_work', label: 'Remote worker', icon: Briefcase },
  { id: 'studious', label: 'Studious', icon: GraduationCap },
];

// ────────────────────────────────────────────────────────────
// Step components
// ────────────────────────────────────────────────────────────

function StepBasicInfo({ data, setData }: { data: ProfileData; setData: (d: Partial<ProfileData>) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setData({ avatar_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <div
          className="relative w-28 h-28 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#2252D6]/20 to-[#17294F]/10 border-4 border-white shadow-xl flex items-center justify-center">
            {data.avatar_url ? (
              <img src={data.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-[#2252D6]/50" />
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={24} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#2252D6] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Upload size={14} className="text-white" />
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <p className="text-xs text-neutral-500 font-medium">Tap to upload profile photo</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input
            type="text"
            placeholder="e.g., Maria Dela Cruz"
            value={data.full_name}
            onChange={(e) => setData({ full_name: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Nickname</label>
          <input
            type="text"
            placeholder="e.g., Ria"
            value={data.nickname}
            onChange={(e) => setData({ nickname: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Phone</label>
          <input
            type="tel"
            placeholder="09XX XXX XXXX"
            value={data.phone}
            onChange={(e) => setData({ phone: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] transition-all text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Current City / Barangay</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="e.g., Iligan City, Lanao del Norte"
              value={data.location}
              onChange={(e) => setData({ location: e.target.value })}
              className="w-full pl-9 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] transition-all text-sm"
            />
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Short Bio</label>
          <textarea
            rows={3}
            placeholder="Tell future roommates about yourself in 2-3 sentences..."
            value={data.bio}
            onChange={(e) => setData({ bio: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] transition-all text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function StepOccupation({ data, setData }: { data: ProfileData; setData: (d: Partial<ProfileData>) => void }) {
  const options = [
    { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Currently enrolled in school or university' },
    { value: 'working', label: 'Professional', icon: Briefcase, desc: 'Full-time or part-time employee' },
    { value: 'both', label: 'Working Student', icon: Clock, desc: 'Balancing work and studies' },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-500 leading-relaxed">
        This helps landlords and roommates understand your schedule and lifestyle.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = data.occupation === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setData({ occupation: opt.value })}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-[#2252D6] bg-[#2252D6]/5'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#2252D6] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className={`font-bold text-sm ${isSelected ? 'text-[#2252D6]' : 'text-neutral-800'}`}>{opt.label}</p>
                <p className="text-xs text-neutral-400">{opt.desc}</p>
              </div>
              {isSelected && <Check size={18} className="ml-auto text-[#2252D6] shrink-0" />}
            </button>
          );
        })}
      </div>
      {data.occupation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            {data.occupation === 'student' ? 'School / University' : 'Company / Employer'}
          </label>
          <input
            type="text"
            placeholder={data.occupation === 'student' ? 'e.g., MSU-IIT' : 'e.g., BPO Corp.'}
            value={data.school_or_company}
            onChange={(e) => setData({ school_or_company: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] transition-all text-sm"
          />
        </motion.div>
      )}
    </div>
  );
}

function StepLifestyle({ data, setData }: { data: ProfileData; setData: (d: Partial<ProfileData>) => void }) {
  const toggleLifestyle = (id: string) => {
    const current = data.lifestyle;
    if (current.includes(id)) {
      setData({ lifestyle: current.filter((l) => l !== id) });
    } else {
      setData({ lifestyle: [...current, id] });
    }
  };

  const cleanlinessLabels = ['', 'Messy', 'Below avg', 'Average', 'Pretty clean', 'Spotless'];
  const noiseOptions = [
    { value: 'quiet', label: 'Quiet', desc: 'I prefer a calm environment' },
    { value: 'moderate', label: 'Moderate', desc: 'Balanced — some noise is fine' },
    { value: 'lively', label: 'Lively', desc: 'I enjoy an active atmosphere' },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Sleep schedule */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Sleep Schedule</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'early_bird', label: 'Early Bird', icon: Sun },
            { value: 'night_owl', label: 'Night Owl', icon: Moon },
            { value: 'flexible', label: 'Flexible', icon: Clock },
          ].map(({ value, label, icon: Icon }) => {
            const isSelected = data.sleep_schedule === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setData({ sleep_schedule: value as ProfileData['sleep_schedule'] })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  isSelected ? 'border-[#2252D6] bg-[#2252D6]/5' : 'border-neutral-200'
                }`}
              >
                <Icon size={20} className={isSelected ? 'text-[#2252D6]' : 'text-neutral-400'} />
                <span className={`text-xs font-bold ${isSelected ? 'text-[#2252D6]' : 'text-neutral-600'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cleanliness */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Cleanliness Level{' '}
          {data.cleanliness > 0 && (
            <span className="text-[#2252D6] normal-case">— {cleanlinessLabels[data.cleanliness]}</span>
          )}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setData({ cleanliness: n as ProfileData['cleanliness'] })}
              className={`flex-1 h-10 rounded-xl font-bold text-sm border-2 transition-all ${
                (data.cleanliness ?? 0) >= n
                  ? 'border-[#2252D6] bg-[#2252D6] text-white'
                  : 'border-neutral-200 text-neutral-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Noise level */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Noise Preference</label>
        <div className="flex flex-col gap-2">
          {noiseOptions.map(({ value, label, desc }) => {
            const isSelected = data.noise_level === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setData({ noise_level: value })}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected ? 'border-[#2252D6] bg-[#2252D6]/5' : 'border-neutral-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isSelected ? 'border-[#2252D6] bg-[#2252D6]' : 'border-neutral-300'}`} />
                <div>
                  <p className={`text-sm font-bold ${isSelected ? 'text-[#2252D6]' : 'text-neutral-700'}`}>{label}</p>
                  <p className="text-xs text-neutral-400">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lifestyle tags */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Your Lifestyle Tags</label>
        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = data.lifestyle.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleLifestyle(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                  isSelected
                    ? 'border-[#2252D6] bg-[#2252D6] text-white'
                    : 'border-neutral-200 text-neutral-600 hover:border-[#2252D6]/50'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepProfessionalProfile({ data, setData }: { data: ProfileData; setData: (d: Partial<ProfileData>) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-500 leading-relaxed">
        Provide professional details to build trust with potential tenants. Let them know your organization or experience.
      </p>
      
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Company / Organization Name</label>
        <input
          type="text"
          placeholder="e.g. Kayla Residences management, Solo Landlord"
          value={data.school_or_company}
          onChange={(e) => setData({ school_or_company: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all text-sm font-semibold bg-white text-neutral-900"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Official Business Location</label>
        <input
          type="text"
          placeholder="e.g. Tibanga, Iligan City"
          value={data.location}
          onChange={(e) => setData({ location: e.target.value })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all text-sm font-semibold bg-white text-neutral-900"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Years of Renting Experience</label>
        <select
          value={data.occupation === 'working' ? '1' : data.occupation === 'student' ? '2' : '3'}
          onChange={(e) => setData({ occupation: e.target.value === '1' ? 'working' : e.target.value === '2' ? 'student' : 'both' })}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all text-sm font-semibold bg-white text-neutral-900"
        >
          <option value="1">Less than 1 year</option>
          <option value="2">1 to 3 years</option>
          <option value="3">3+ years of hosting</option>
        </select>
      </div>
    </div>
  );
}

function StepVerification({ data, setData, userRole }: { data: ProfileData; setData: (d: Partial<ProfileData>) => void; userRole?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setData({ id_photo_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const tenantIdTypes = [
    { value: 'school_id', label: 'School ID' },
    { value: 'national_id', label: 'National ID (PhilSys)' },
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'passport', label: 'Passport' },
  ] as const;

  const landlordIdTypes = [
    { value: 'business_permit', label: 'Business Permit' },
    { value: 'property_title', label: 'Property Title / Deed' },
    { value: 'national_id', label: 'National ID' },
    { value: 'passport', label: 'Passport / Driver\'s' },
  ] as const;

  const idTypes = userRole === 'landlord' ? landlordIdTypes : tenantIdTypes;

  return (
    <div className="flex flex-col gap-5">
      {/* Info card */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">Why do we ask for this?</p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Khubo verifies real users to protect both tenants and landlords. Your ID is only used for one-time verification and is never shared publicly.
          </p>
        </div>
      </div>

      {/* ID type selection */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Select ID Type</label>
        <div className="grid grid-cols-2 gap-2">
          {idTypes.map(({ value, label }) => {
            const isSelected = data.id_type === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setData({ id_type: value })}
                className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                  isSelected ? 'border-[#2252D6] bg-[#2252D6]/5 text-[#2252D6]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ID photo upload */}
      {data.id_type && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Upload ID Photo</label>
          <div
            className="relative w-full h-44 rounded-2xl border-2 border-dashed border-neutral-300 overflow-hidden cursor-pointer hover:border-[#2252D6] transition-colors flex items-center justify-center bg-neutral-50"
            onClick={() => fileInputRef.current?.click()}
          >
            {data.id_photo_url ? (
              <>
                <img src={data.id_photo_url} alt="ID" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-bold">Change Photo</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Upload size={22} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-neutral-600">Click to upload</p>
                  <p className="text-xs">JPG, PNG · Max 5MB</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleIdPhotoChange} />
        </motion.div>
      )}

      {!data.id_type && (
        <p className="text-xs text-neutral-400 text-center mt-2">
          You can also skip this step and verify later from your Profile settings.
        </p>
      )}
    </div>
  );
}

function StepPreview({ data, userRole }: { data: ProfileData; userRole?: string }) {
  const lifestyleLabels = LIFESTYLE_OPTIONS.filter((o) => data.lifestyle.includes(o.id)).map((o) => o.label);

  const getExperienceLabel = (occ: string) => {
    if (occ === 'working') return 'Less than 1 year';
    if (occ === 'student') return '1 to 3 years';
    if (occ === 'both') return '3+ years of hosting';
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-[#2252D6]/20 to-[#17294F]/10 flex items-center justify-center">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-[#2252D6]/50" />
          )}
        </div>
        {data.id_type && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <Check size={14} className="text-white" />
          </div>
        )}
      </motion.div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-neutral-900">{data.full_name || 'Your Name'}</h3>
        {data.nickname && <p className="text-sm text-neutral-400">"{data.nickname}"</p>}
        {data.location && (
          <p className="flex items-center justify-center gap-1 text-xs text-neutral-400 mt-1">
            <MapPin size={12} /> {data.location}
          </p>
        )}
      </div>

      {data.bio && (
        <div className="w-full p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
          <p className="text-sm text-neutral-600 italic leading-relaxed text-center">"{data.bio}"</p>
        </div>
      )}

      {userRole === 'landlord' ? (
        <div className="w-full grid grid-cols-2 gap-3">
          {data.school_or_company && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10 col-span-2">
              <p className="text-xs text-neutral-400 font-semibold">Company / Organization</p>
              <p className="text-sm font-bold text-neutral-800">{data.school_or_company}</p>
            </div>
          )}
          {data.occupation && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10">
              <p className="text-xs text-neutral-400 font-semibold">Experience</p>
              <p className="text-sm font-bold text-neutral-800">{getExperienceLabel(data.occupation)}</p>
            </div>
          )}
          {data.location && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10">
              <p className="text-xs text-neutral-400 font-semibold">Office Location</p>
              <p className="text-sm font-bold text-neutral-800 truncate">{data.location}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full grid grid-cols-2 gap-3">
          {data.occupation && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10">
              <p className="text-xs text-neutral-400 font-semibold">Status</p>
              <p className="text-sm font-bold text-neutral-800 capitalize">{data.occupation.replace('_', ' ')}</p>
              {data.school_or_company && <p className="text-xs text-neutral-500">{data.school_or_company}</p>}
            </div>
          )}
          {data.sleep_schedule && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10">
              <p className="text-xs text-neutral-400 font-semibold">Sleep</p>
              <p className="text-sm font-bold text-neutral-800 capitalize">{data.sleep_schedule.replace('_', ' ')}</p>
            </div>
          )}
          {data.cleanliness > 0 && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10">
              <p className="text-xs text-neutral-400 font-semibold">Cleanliness</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-2 flex-1 rounded-full ${n <= (data.cleanliness ?? 0) ? 'bg-[#2252D6]' : 'bg-neutral-200'}`}
                  />
                ))}
              </div>
            </div>
          )}
          {data.noise_level && (
            <div className="p-3 bg-[#2252D6]/5 rounded-xl border border-[#2252D6]/10">
              <p className="text-xs text-neutral-400 font-semibold">Noise</p>
              <p className="text-sm font-bold text-neutral-800 capitalize">{data.noise_level}</p>
            </div>
          )}
        </div>
      )}

      {userRole !== 'landlord' && lifestyleLabels.length > 0 && (
        <div className="w-full">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Lifestyle</p>
          <div className="flex flex-wrap gap-2">
            {lifestyleLabels.map((l) => (
              <span key={l} className="px-3 py-1 rounded-full text-xs font-bold bg-[#2252D6]/10 text-[#2252D6]">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.id_type ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl w-full justify-center">
          <Check size={16} className="text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700">ID Verification submitted</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl w-full justify-center">
          <AlertCircle size={16} className="text-amber-600" />
          <p className="text-sm font-bold text-amber-700">Verification pending — add ID later</p>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────
export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProfileData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<'tenant' | 'landlord'>(() => {
    const cached = localStorage.getItem('khubo_user_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.role === 'landlord') return 'landlord';
      } catch {}
    }
    return localStorage.getItem('khubo_is_landlord') === 'true' ? 'landlord' : 'tenant';
  });

  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      try {
        // Try local storage first to be snappy
        const cached = localStorage.getItem('khubo_user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.full_name) {
            if (parsed.role) {
              setUserRole(parsed.role);
            }
            setData({
              full_name: parsed.full_name || '',
              nickname: parsed.nickname || '',
              bio: parsed.bio || '',
              phone: parsed.phone || '',
              location: parsed.location || '',
              occupation: parsed.occupation || '',
              school_or_company: parsed.school_or_company || '',
              id_type: parsed.id_type || '',
              id_photo_url: parsed.id_photo_url || '',
              avatar_url: parsed.avatar_url || '',
              lifestyle: parsed.lifestyle || [],
              sleep_schedule: parsed.sleep_schedule || '',
              cleanliness: parsed.cleanliness || 0,
              noise_level: parsed.noise_level || '',
            });
          }
        }

        // Then fetch from Supabase to ensure fresh data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching existing profile:", error);
          return;
        }

        if (profile) {
          if (profile.role) {
            setUserRole(profile.role);
          }
          setData({
            full_name: profile.full_name || '',
            nickname: profile.nickname || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            location: profile.location || '',
            occupation: profile.occupation || '',
            school_or_company: profile.school_or_company || '',
            id_type: profile.id_type || '',
            id_photo_url: profile.id_photo_url || '',
            avatar_url: profile.avatar_url || '',
            lifestyle: profile.lifestyle || [],
            sleep_schedule: profile.sleep_schedule || '',
            cleanliness: profile.cleanliness || 0,
            noise_level: profile.noise_level || '',
          });
        }
      } catch (err) {
        console.error("Error loading existing profile:", err);
      }
    };

    loadExistingProfile();
  }, [user]);

  const updateData = (partial: Partial<ProfileData>) => setData((prev) => ({ ...prev, ...partial }));

  const tenantSteps = [
    { title: 'Your Identity', subtitle: 'Let people know who you are', icon: User },
    { title: 'Occupation', subtitle: 'What do you do?', icon: Briefcase },
    { title: 'Lifestyle', subtitle: 'How do you live?', icon: Heart },
    { title: 'Verification', subtitle: 'Prove you are real', icon: AlertCircle },
    { title: 'Preview', subtitle: 'Your public profile', icon: Sparkles },
  ];

  const landlordSteps = [
    { title: 'Host Identity', subtitle: 'Define your host profile', icon: User },
    { title: 'Professional Profile', subtitle: 'Your professional credentials', icon: Briefcase },
    { title: 'Document Verification', subtitle: 'Upload business or property documents', icon: AlertCircle },
    { title: 'Host Preview', subtitle: 'Your public host profile', icon: Sparkles },
  ];

  const STEPS = userRole === 'landlord' ? landlordSteps : tenantSteps;
  const TOTAL_STEPS = STEPS.length;

  const canProceed = () => {
    if (userRole === 'landlord') {
      if (step === 1) return data.full_name.trim().length > 0;
      return true;
    } else {
      if (step === 1) return data.full_name.trim().length > 0;
      if (step === 2) return data.occupation !== '';
      return true;
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const profilePayload = {
        full_name: data.full_name,
        nickname: data.nickname,
        bio: data.bio,
        phone: data.phone,
        location: data.location,
        occupation: data.occupation,
        school_or_company: data.school_or_company,
        lifestyle: data.lifestyle,
        sleep_schedule: data.sleep_schedule,
        cleanliness: data.cleanliness,
        noise_level: data.noise_level,
        id_type: data.id_type,
        id_photo_url: data.id_photo_url,
        id_verified: !!data.id_type,
        avatar_url: data.avatar_url,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      };

      // Persist to localStorage (always works, even without Supabase)
      localStorage.setItem('khubo_user_profile', JSON.stringify({
        ...profilePayload,
        email: user?.email
      }));

      // Try Supabase if connected
      if (user?.id) {
        await supabase.from('profiles').update(profilePayload).eq('id', user.id);
      }

      showToast(`Welcome to Khubo, ${data.full_name || 'friend'}! 🎉`);
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('Profile save error:', err);
      showToast('Profile saved locally. Sync to cloud when connected.');
      navigate('/profile', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] via-white to-[#F0F9FF] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-safe pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#2252D6] flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <span className="font-black text-lg tracking-tight text-[#17294F]">Khubo</span>
        </div>

        <div className="mb-1">
          <p className="text-xs font-bold text-[#2252D6]/60 uppercase tracking-wider">Step {step} of {TOTAL_STEPS}</p>
          <h1 className="text-2xl font-black text-[#17294F] mt-0.5">{currentStep.title}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{currentStep.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                i < step ? 'bg-[#2252D6]' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="py-2"
          >
            {userRole === 'landlord' ? (
              <>
                {step === 1 && <StepBasicInfo data={data} setData={updateData} />}
                {step === 2 && <StepProfessionalProfile data={data} setData={updateData} />}
                {step === 3 && <StepVerification data={data} setData={updateData} userRole={userRole} />}
                {step === 4 && <StepPreview data={data} userRole={userRole} />}
              </>
            ) : (
              <>
                {step === 1 && <StepBasicInfo data={data} setData={updateData} />}
                {step === 2 && <StepOccupation data={data} setData={updateData} />}
                {step === 3 && <StepLifestyle data={data} setData={updateData} />}
                {step === 4 && <StepVerification data={data} setData={updateData} userRole={userRole} />}
                {step === 5 && <StepPreview data={data} userRole={userRole} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 pb-safe pb-8 pt-4 bg-white/80 backdrop-blur-md border-t border-neutral-100">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-neutral-200 font-bold text-neutral-600 hover:border-neutral-300 transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => { if (canProceed()) setStep((s) => s + 1); }}
              disabled={!canProceed()}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg shadow-[#2252D6]/25 ${
                canProceed()
                  ? 'bg-[#2252D6] hover:bg-[#1b43b3] cursor-pointer'
                  : 'bg-neutral-300 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-[#2252D6] to-[#3b6ef8] hover:from-[#1b43b3] hover:to-[#2252D6] transition-all active:scale-95 shadow-lg shadow-[#2252D6]/30 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Complete Profile
                </>
              )}
            </button>
          )}
        </div>

        {/* Skip link for verification step */}
        {((userRole === 'landlord' && step === 3) || (userRole !== 'landlord' && step === 4)) && (
          <button
            onClick={() => setStep(userRole === 'landlord' ? 4 : 5)}
            className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 mt-3 transition-colors"
          >
            Skip for now — I'll verify later
          </button>
        )}

        {/* Skip entire flow */}
        {step === 1 && (
          <button
            onClick={() => navigate('/profile', { replace: true })}
            className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 mt-3 transition-colors"
          >
            Skip setup — go to profile
          </button>
        )}
      </div>
    </div>
  );
}
