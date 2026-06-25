import { useState } from 'react';
import { X, Pencil, Check, ChevronDown, User, Mail, Phone, BookOpen, MapPin, Briefcase, Moon, Users, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { OnboardingData } from './OnboardingFlow';

interface ReviewProfileProps {
  data: OnboardingData;
  onBack?: () => void;
  onClose?: () => void;
  onContinue?: () => void;
  onEditStep?: (step: number) => void;
  onUpdateData?: (partial: Partial<OnboardingData>) => void;
}

interface FieldRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function FieldRow({ label, value, icon }: FieldRowProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className="text-neutral-400">{icon}</span>}
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#17294F]">{value || '—'}</span>
    </div>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  placeholder?: string;
}

function EditableField({ label, value, onChange, type = 'text', options, icon, placeholder }: EditableFieldProps) {
  const baseClasses = "w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all bg-white text-sm font-medium text-[#17294F]";

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-neutral-400">{icon}</span>}
        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{label}</label>
      </div>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(baseClasses, "resize-none")}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(baseClasses, "appearance-none cursor-pointer pr-8")}
          >
            <option value="">Select...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <ChevronDown size={14} />
          </div>
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
}

function SectionCard({ title, onEdit, editing, onSave, onCancel, children }: {
  title: string;
  onEdit?: () => void;
  editing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
        <h3 className="text-sm font-bold text-[#17294F]">{title}</h3>
        {editing ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={14} className="text-neutral-400 hover:text-red-500 transition-colors" />
            </button>
            <button
              type="button"
              onClick={onSave}
              className="p-1.5 hover:bg-[#2252D6]/10 rounded-full transition-colors cursor-pointer"
            >
              <Check size={14} className="text-neutral-400 hover:text-[#2252D6] transition-colors" />
            </button>
          </div>
        ) : (
          onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            >
              <Pencil size={14} className="text-neutral-400 hover:text-[#2252D6] transition-colors" />
            </button>
          )
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export function ReviewProfile({ data, onBack, onClose, onContinue, onUpdateData }: ReviewProfileProps) {
  const [editingSection, setEditingSection] = useState<'identity' | 'occupation' | 'lifestyle' | null>(null);

  const [identityDraft, setIdentityDraft] = useState({
    username: data.username,
    email: data.email,
    phone: data.phone,
    gender: data.gender,
    bio: data.bio,
    city: data.city,
    barangay: data.barangay,
    streetAddress: data.streetAddress,
  });

  const [occupationDraft, setOccupationDraft] = useState(data.occupation || '');

  const [lifestyleDraft, setLifestyleDraft] = useState({
    sleepSchedule: 'Night Owl',
    lifestyle: 'Quiet & Focused',
    socialPreference: 'Low-key',
    cleanliness: 'Tidy',
  });

  const formatAddress = (city: string, barangay: string, street: string) => {
    const parts = [barangay, city].filter(Boolean).join(', ');
    return street ? `${parts} — ${street}` : parts;
  };

  const handleSaveIdentity = () => {
    onUpdateData?.({
      username: identityDraft.username,
      email: identityDraft.email,
      phone: identityDraft.phone,
      gender: identityDraft.gender,
      bio: identityDraft.bio,
      city: identityDraft.city,
      barangay: identityDraft.barangay,
      streetAddress: identityDraft.streetAddress,
    });
    setEditingSection(null);
  };

  const handleSaveOccupation = () => {
    onUpdateData?.({ occupation: occupationDraft || null });
    setEditingSection(null);
  };

  const handleCancelIdentity = () => {
    setIdentityDraft({
      username: data.username,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      bio: data.bio,
      city: data.city,
      barangay: data.barangay,
      streetAddress: data.streetAddress,
    });
    setEditingSection(null);
  };

  const handleCancelOccupation = () => {
    setOccupationDraft(data.occupation || '');
    setEditingSection(null);
  };

  const handleCancelLifestyle = () => {
    setLifestyleDraft({
      sleepSchedule: 'Night Owl',
      lifestyle: 'Quiet & Focused',
      socialPreference: 'Low-key',
      cleanliness: 'Tidy',
    });
    setEditingSection(null);
  };

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
                  s <= 4 ? 'bg-[#2252D6]' : 'bg-neutral-200'
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-8 pt-5 pb-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-[#2252D6] tracking-[0.15em] uppercase mb-1">
              STEP 4 OF 5: Preview & Review
            </p>
            <h2 className="text-2xl font-bold text-[#17294F]">Review Details</h2>
            <p className="text-sm text-neutral-500 font-medium mt-1">
              Double check your details before proceeding.
            </p>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 border-[3px] border-white shadow-lg ring-2 ring-[#2252D6]/20 mb-3">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2252D6]/5 to-[#17294F]/10">
                <User size={28} className="text-neutral-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-[#17294F]">{data.username || '—'}</p>
            <p className="text-xs text-neutral-400 font-medium">{data.email || '—'}</p>

            <div className="w-full bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3 flex items-center gap-2.5 mt-4">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-800">
                Verification pending – add ID later
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <SectionCard
              title="Identity & Location"
              editing={editingSection === 'identity'}
              onEdit={() => setEditingSection('identity')}
              onSave={handleSaveIdentity}
              onCancel={handleCancelIdentity}
            >
              {editingSection === 'identity' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <EditableField
                      label="Username"
                      value={identityDraft.username}
                      onChange={(val) => setIdentityDraft({ ...identityDraft, username: val })}
                      icon={<User size={13} />}
                      placeholder="e.g. juan_delacruz"
                    />
                    <EditableField
                      label="Email"
                      value={identityDraft.email}
                      onChange={(val) => setIdentityDraft({ ...identityDraft, email: val })}
                      type="email"
                      icon={<Mail size={13} />}
                      placeholder="e.g. juan@email.com"
                    />
                    <EditableField
                      label="Phone"
                      value={identityDraft.phone}
                      onChange={(val) => setIdentityDraft({ ...identityDraft, phone: val })}
                      type="tel"
                      icon={<Phone size={13} />}
                      placeholder="e.g. +63 912 345 6789"
                    />
                    <EditableField
                      label="Gender"
                      value={identityDraft.gender}
                      onChange={(val) => setIdentityDraft({ ...identityDraft, gender: val })}
                      type="select"
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />
                  </div>
                  <EditableField
                    label="Short Bio"
                    value={identityDraft.bio}
                    onChange={(val) => setIdentityDraft({ ...identityDraft, bio: val })}
                    type="textarea"
                    icon={<BookOpen size={13} />}
                    placeholder="Tell us about yourself..."
                  />
                  <EditableField
                    label="Address"
                    value={identityDraft.streetAddress}
                    onChange={(val) => setIdentityDraft({ ...identityDraft, streetAddress: val })}
                    icon={<MapPin size={13} />}
                    placeholder="e.g. 123 Rizal St."
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <FieldRow label="Username" value={data.username} icon={<User size={13} />} />
                    <FieldRow label="Email" value={data.email} icon={<Mail size={13} />} />
                    <FieldRow label="Phone" value={data.phone} icon={<Phone size={13} />} />
                    <FieldRow label="Gender" value={data.gender} />
                  </div>
                  <div className="mt-4">
                    <FieldRow label="Short Bio" value={data.bio} icon={<BookOpen size={13} />} />
                  </div>
                  <div className="mt-4">
                    <FieldRow label="Address" value={formatAddress(data.city, data.barangay, data.streetAddress)} icon={<MapPin size={13} />} />
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard
              title="Occupation"
              editing={editingSection === 'occupation'}
              onEdit={() => setEditingSection('occupation')}
              onSave={handleSaveOccupation}
              onCancel={handleCancelOccupation}
            >
              {editingSection === 'occupation' ? (
                <EditableField
                  label="Status"
                  value={occupationDraft}
                  onChange={setOccupationDraft}
                  type="select"
                  icon={<Briefcase size={13} />}
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'working-student', label: 'Working Student' },
                  ]}
                />
              ) : (
                <FieldRow label="Status" value={data.occupation || '—'} icon={<Briefcase size={13} />} />
              )}
            </SectionCard>

            <SectionCard
              title="Lifestyle Preferences"
              editing={editingSection === 'lifestyle'}
              onEdit={() => setEditingSection('lifestyle')}
              onSave={() => setEditingSection(null)}
              onCancel={handleCancelLifestyle}
            >
              {editingSection === 'lifestyle' ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <EditableField
                    label="Sleep Schedule"
                    value={lifestyleDraft.sleepSchedule}
                    onChange={(val) => setLifestyleDraft({ ...lifestyleDraft, sleepSchedule: val })}
                    type="select"
                    icon={<Moon size={13} />}
                    options={[
                      { value: 'Night Owl', label: 'Night Owl' },
                      { value: 'Early Bird', label: 'Early Bird' },
                      { value: 'Flexible', label: 'Flexible' },
                    ]}
                  />
                  <EditableField
                    label="Lifestyle"
                    value={lifestyleDraft.lifestyle}
                    onChange={(val) => setLifestyleDraft({ ...lifestyleDraft, lifestyle: val })}
                    type="select"
                    icon={<Sparkles size={13} />}
                    options={[
                      { value: 'Quiet & Focused', label: 'Quiet & Focused' },
                      { value: 'Social & Active', label: 'Social & Active' },
                      { value: 'Balanced', label: 'Balanced' },
                    ]}
                  />
                  <EditableField
                    label="Social Preference"
                    value={lifestyleDraft.socialPreference}
                    onChange={(val) => setLifestyleDraft({ ...lifestyleDraft, socialPreference: val })}
                    type="select"
                    icon={<Users size={13} />}
                    options={[
                      { value: 'Low-key', label: 'Low-key' },
                      { value: 'Social', label: 'Social' },
                      { value: 'Very Social', label: 'Very Social' },
                    ]}
                  />
                  <EditableField
                    label="Cleanliness"
                    value={lifestyleDraft.cleanliness}
                    onChange={(val) => setLifestyleDraft({ ...lifestyleDraft, cleanliness: val })}
                    type="select"
                    options={[
                      { value: 'Tidy', label: 'Tidy' },
                      { value: 'Moderate', label: 'Moderate' },
                      { value: 'Relaxed', label: 'Relaxed' },
                    ]}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <FieldRow label="Sleep Schedule" value="Night Owl" icon={<Moon size={13} />} />
                  <FieldRow label="Lifestyle" value="Quiet & Focused" icon={<Sparkles size={13} />} />
                  <FieldRow label="Social Preference" value="Low-key" icon={<Users size={13} />} />
                  <FieldRow label="Cleanliness" value="Tidy" />
                </div>
              )}
            </SectionCard>
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
            <span className="text-xs text-neutral-400 font-medium">4 of 5</span>
            <button
              type="button"
              onClick={onContinue}
              className="px-8 py-2.5 bg-[#2252D6] hover:bg-[#1a41aa] text-white font-bold rounded-full transition text-sm shadow-md shadow-[#2252D6]/20 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
