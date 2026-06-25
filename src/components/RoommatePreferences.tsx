import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, DollarSign, Users, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const preferences = [
  {
    id: 'quiet',
    icon: Moon,
    title: 'Quiet & Focused',
    subtext: 'Prefer a calm environment for studying or working',
  },
  {
    id: 'social',
    icon: Users,
    title: 'Social & Friendly',
    subtext: 'Enjoy hanging out and building connections',
  },
  {
    id: 'budget',
    icon: DollarSign,
    title: 'Budget-Conscious',
    subtext: 'Looking for affordable and practical living',
  },
  {
    id: 'balanced',
    icon: Sparkles,
    title: 'Balanced',
    subtext: 'Somewhere between social and quiet',
  },
];

interface RoommatePreferencesProps {
  onBack?: () => void;
  onClose?: () => void;
  onContinue?: (preference: string) => void;
}

export function RoommatePreferences({ onBack, onClose, onContinue }: RoommatePreferencesProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
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
                className={cn(
                  'h-1.5 rounded-full flex-1 transition-all duration-500',
                  s <= 3 ? 'bg-[#2252D6]' : 'bg-neutral-200'
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-8 pt-5 pb-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-[#2252D6] tracking-[0.15em] uppercase mb-1">
              Step 3 of 5: Roommate Preferences
            </p>
            <h2 className="text-2xl font-bold text-[#17294F]">Roommate Preferences</h2>
            <p className="text-sm text-neutral-500 font-medium mt-1">
              Tell us what you're looking for
            </p>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed mb-6">
            This helps us match you with compatible roommates and properties.
          </p>

          <div className="space-y-3">
            {preferences.map((pref, i) => {
              const isSelected = selected === pref.id;
              const Icon = pref.icon;
              return (
                <motion.button
                  key={pref.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  type="button"
                  onClick={() => setSelected(pref.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left',
                    isSelected
                      ? 'border-[#2252D6]/60 bg-[#2252D6]/5 shadow-sm shadow-[#2252D6]/10'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200',
                      isSelected ? 'bg-[#2252D6]/10' : 'bg-neutral-100'
                    )}
                  >
                    <Icon
                      size={22}
                      className={cn(
                        'transition-colors duration-200',
                        isSelected ? 'text-[#2252D6]' : 'text-neutral-500'
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-bold transition-colors duration-200',
                        isSelected ? 'text-[#17294F]' : 'text-neutral-800'
                      )}
                    >
                      {pref.title}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{pref.subtext}</p>
                  </div>

                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      isSelected ? 'border-[#2252D6]' : 'border-neutral-300'
                    )}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          className="w-2.5 h-2.5 rounded-full bg-[#2252D6]"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
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
            <span className="text-xs text-neutral-400 font-medium">3 of 5</span>
            <button
              type="button"
              onClick={() => selected && onContinue?.(selected)}
              disabled={!selected}
              className={cn(
                'px-8 py-2.5 font-bold rounded-full transition text-sm cursor-pointer',
                selected
                  ? 'bg-[#2252D6] hover:bg-[#1a41aa] text-white shadow-md shadow-[#2252D6]/20'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
