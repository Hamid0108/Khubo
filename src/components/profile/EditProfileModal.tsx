// @context: Edit profile modal — separated from Profile.tsx
// @purpose: Form for editing profile name, school/details, location, bio, and online status
// @behavior: Controlled component — all values and setters passed as props from parent (Profile.tsx)
// @behavior: Fields: full name, school/age/gender, location, bio/quote, online toggle
// @dependencies: motion, lucide-react


import { Edit2, GraduationCap, MapPin, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tempName: string;
  tempDetails: string;
  tempLocation: string;
  tempBio: string;
  tempIsOnline: boolean;
  onTempNameChange: (v: string) => void;
  onTempDetailsChange: (v: string) => void;
  onTempLocationChange: (v: string) => void;
  onTempBioChange: (v: string) => void;
  onTempIsOnlineChange: (v: boolean) => void;
  onSave: () => void;
}

export default function EditProfileModal({
  isOpen, onClose,
  tempName, tempDetails, tempLocation, tempBio, tempIsOnline,
  onTempNameChange, onTempDetailsChange, onTempLocationChange, onTempBioChange,
  onTempIsOnlineChange, onSave,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2252D6]/10 rounded-xl text-[#2252D6]">
              <Edit2 size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-neutral-900">Edit Profile Text</h2>
              <p className="text-xs text-neutral-500 font-medium">Update your public student card & description</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-[#17294F] uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => onTempNameChange(e.target.value)}
              required
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-sm font-medium text-neutral-800"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-[#17294F] uppercase tracking-wider block">School, Age, & Gender</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <GraduationCap size={18} />
              </div>
              <input
                type="text"
                value={tempDetails}
                onChange={(e) => onTempDetailsChange(e.target.value)}
                placeholder="e.g. MSU-IIT | 20yrs old | Female"
                className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-sm font-medium text-neutral-800"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-[#17294F] uppercase tracking-wider block">Living Location</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                value={tempLocation}
                onChange={(e) => onTempLocationChange(e.target.value)}
                placeholder="e.g. Tibanga, Iligan City"
                className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-sm font-medium text-neutral-800"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-[#17294F] uppercase tracking-wider block">Quote / Bio text</label>
            <textarea
              rows={4}
              value={tempBio}
              onChange={(e) => onTempBioChange(e.target.value)}
              placeholder="Add a bio or personal housing quote..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-sm font-medium text-neutral-800 resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl bg-neutral-50 hover:bg-neutral-100/70 transition-all text-left">
            <div>
              <span className="text-xs font-bold text-[#17294F] uppercase tracking-wider block">Online Status</span>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">Show roommates whether you are currently active</p>
            </div>
            <button
              type="button"
              onClick={() => onTempIsOnlineChange(!tempIsOnline)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${tempIsOnline ? 'bg-emerald-500' : 'bg-neutral-300'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${tempIsOnline ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border-[1.5px] border-neutral-200 hover:border-neutral-300 text-neutral-600 font-bold rounded-full transition text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-8 py-2.5 bg-[#2252D6] hover:bg-[#1a41aa] text-white font-bold rounded-full transition text-sm shadow-md shadow-[#2252D6]/20 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
