import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { X } from 'lucide-react';
import { OnboardingModal } from './OnboardingModal';
import { OccupationStep } from './OccupationStep';
import { VerificationStep } from './VerificationStep';
import { ReviewProfile } from './ReviewProfile';

export interface OnboardingData {
  username: string;
  email: string;
  phone: string;
  bio: string;
  city: string;
  barangay: string;
  streetAddress: string;
  gender: string;
  profilePhoto: string | null;
  occupation: string | null;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const defaultData: OnboardingData = {
  username: '',
  email: '',
  phone: '',
  bio: '',
  city: '',
  barangay: '',
  streetAddress: '',
  gender: '',
  profilePhoto: null,
  occupation: null,
};

function AlmostDoneStep({ onBack, onClose, onComplete }: { onBack?: () => void; onClose?: () => void; onComplete?: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 hover:bg-neutral-100 rounded-full transition-colors z-20 cursor-pointer"
        >
          <X size={20} className="text-neutral-500" />
        </button>

        <div className="px-8 pt-8 pb-0 pr-16">
          <div className="flex items-center gap-1.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                  s <= 5 ? 'bg-[#2252D6]' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-8 pt-5 pb-6 overflow-y-auto text-center">
          <div className="mb-6">
            <p className="text-xs font-bold text-[#2252D6] tracking-[0.15em] uppercase mb-1">
              STEP 5 OF 5: You're All Set
            </p>
            <h2 className="text-2xl font-bold text-[#17294F]">Thank You!</h2>
            <p className="text-sm text-neutral-500 font-medium mt-1">
              You're now part of the Khubo community.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base font-bold text-[#17294F] mb-2">Welcome to Khubo!</p>
            <p className="text-sm text-neutral-500 font-medium max-w-md leading-relaxed">
              Thank you for choosing Khubo and for taking the time to complete your profile.
              We're excited to have you on board! Start exploring properties and find your perfect roommate today.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-neutral-100 bg-neutral-50/50">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 border-[1.5px] border-neutral-200 hover:border-neutral-300 text-neutral-600 font-bold rounded-full transition text-sm cursor-pointer"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-medium">5 of 5</span>
            <button
              type="button"
              onClick={onComplete}
              className="px-8 py-2.5 bg-[#2252D6] hover:bg-[#1a41aa] text-white font-bold rounded-full transition text-sm shadow-md shadow-[#2252D6]/20 cursor-pointer"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(defaultData);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const handleFlowComplete = async () => {
    const profilePayload = {
      full_name: data.username,
      nickname: data.username,
      phone: data.phone,
      bio: data.bio,
      city: data.city,
      barangay: data.barangay,
      gender: data.gender,
      occupation: data.occupation,
      avatar_url: data.profilePhoto,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    // Save to local storage
    localStorage.setItem('khubo_user_profile', JSON.stringify({
      ...profilePayload,
      email: user?.email || data.email
    }));

    // Save to Supabase profiles table
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating profile in Supabase:', error);
        }
      } catch (err) {
        console.error('Unexpected error updating profile:', err);
      }
    }

    onComplete();
    onClose();
    setStep(1);
    setData(defaultData);
  };

  if (!isOpen) return null;

  switch (step) {
    case 1:
      return (
        <OnboardingModal
          isOpen={true}
          data={data}
          onClose={onClose}
          onComplete={(d) => { updateData(d); setStep(2); }}
        />
      );
    case 2:
      return (
        <OccupationStep
          data={data}
          onBack={() => setStep(1)}
          onClose={onClose}
          onContinue={(occ) => { updateData({ occupation: occ }); setStep(3); }}
        />
      );
    case 3:
      return (
        <VerificationStep
          onBack={() => setStep(2)}
          onClose={onClose}
          onContinue={() => setStep(4)}
        />
      );
    case 4:
      return (
        <ReviewProfile
          data={data}
          onBack={() => setStep(3)}
          onClose={onClose}
          onContinue={() => setStep(5)}
          onEditStep={(s) => setStep(s)}
          onUpdateData={updateData}
        />
      );
    case 5:
      return (
        <AlmostDoneStep
          onBack={() => setStep(4)}
          onClose={onClose}
          onComplete={handleFlowComplete}
        />
      );
    default:
      return null;
  }
}
