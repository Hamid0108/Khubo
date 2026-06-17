import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Roommate } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postMode: 'applying' | 'finding';
  onPostCreated?: (newPost: Roommate) => void;
}

export default function CreatePostModal({ isOpen, onClose, postMode, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const loadProfilePersonality = () => {
    const saved = localStorage.getItem('user_profile_tags');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedTraits(parsed.slice(0, 5));
          return;
        }
      } catch (e) {
        console.warn('Error reading profile tags:', e);
      }
    }
    // Default fallback profile tags if they were not edited yet
    setSelectedTraits(['Introvert', 'Pet-friendly', 'Night owl', 'Studious', 'Non-smoker'].slice(0, 5));
  };

  React.useEffect(() => {
    if (isOpen) {
      loadProfilePersonality();
      
      // Load user profile details for dynamic name/avatar/etc
      try {
        const cached = localStorage.getItem('khubo_user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed) {
            setProfile(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  const displayName = profile?.nickname || profile?.full_name || user?.email?.split('@')[0] || 'Khubo User';
  const displayAvatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

  const handlePostSubmit = async () => {
    if (!content.trim()) return;

    const newPost: Roommate = {
      id: `rm-${Date.now()}`,
      name: displayName,
      age: profile?.age ? Number(profile.age) : 20,
      gender: profile?.gender || 'Male',
      university: profile?.school_or_company || 'MSU-IIT',
      location: profile?.location || 'Tibanga, Iligan City',
      bio: content.trim(),
      image: displayAvatar,
      tags: selectedTraits.length > 0 ? selectedTraits : ['Clean', 'Quiet'],
      budgetRange: profile?.budget_range || 'P2500-P3000',
      preferredPlace: postMode === 'finding' ? "Nathan's Female Boarders" : "Tibanga Boardhouse",
      userId: user?.id || null,
      postMode: postMode
    };

    // Save to Supabase table
    try {
      const { error } = await supabase.from('roommates').insert({
        id: newPost.id,
        name: newPost.name,
        age: newPost.age,
        gender: newPost.gender,
        university: newPost.university,
        location: newPost.location,
        budget_range: newPost.budgetRange,
        preferred_place: newPost.preferredPlace,
        bio: newPost.bio,
        image: newPost.image,
        tags: newPost.tags,
        user_id: user?.id || null,
        post_mode: postMode
      });

      if (error) {
        console.error('Failed to save roommate to Supabase:', error);
      }
    } catch (err) {
      console.error('Roommate save exception:', err);
    }

    if (onPostCreated) {
      onPostCreated(newPost);
    }

    // Reset local state
    setContent('');
    setSelectedTraits([]);
    onClose();
  };

  if (!isOpen) return null;

  const firstName = displayName.split(' ')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 relative shrink-0">
            <h2 className="text-xl font-bold text-neutral-900 text-center w-full">Create post</h2>
            <button
              onClick={onClose}
              className="absolute right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4 overflow-y-auto">
            {/* User Info */}
            <div className="flex items-center gap-3 shrink-0">
              <img
                src={displayAvatar}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex flex-col justify-center text-left">
                <span className="font-semibold text-neutral-900 text-[15px]">{displayName}</span>
              </div>
            </div>

            {/* Input form */}
            <div className="min-h-[100px] shrink-0 text-left">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={postMode === 'finding' ? `What kind of roommate are you looking for, ${firstName}?` : `What's on your mind, ${firstName}?`}
                className="w-full bg-transparent text-lg md:text-xl text-neutral-900 placeholder-neutral-500 resize-none outline-none overflow-y-auto max-h-[160px]"
                rows={3}
                autoFocus
              />
            </div>

            {/* Your Personality or Preference section loaded from profile */}
            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3 mt-1 shrink-0 text-left">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-display">
                {postMode === 'finding' ? 'Your preference' : 'Your Personality'}
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {selectedTraits.map((trait) => (
                  <span
                    key={trait}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-full text-xs font-semibold"
                  >
                    <span>{trait}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = selectedTraits.filter((t) => t !== trait);
                        setSelectedTraits(updated);
                        localStorage.setItem('user_profile_tags', JSON.stringify(updated));
                      }}
                      className="hover:bg-neutral-250 p-0.5 rounded-full transition-colors flex items-center justify-center shrink-0 text-neutral-400 hover:text-neutral-700"
                      title={`Remove ${trait}`}
                    >
                      <X size={10} className="stroke-[3]" />
                    </button>
                  </span>
                ))}
                
                {isAddingTag ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const trimmed = newTagInput.trim();
                      if (trimmed) {
                        if (!selectedTraits.includes(trimmed)) {
                          const updated = [...selectedTraits, trimmed];
                          setSelectedTraits(updated);
                          localStorage.setItem('user_profile_tags', JSON.stringify(updated));
                        }
                      }
                      setNewTagInput('');
                      setIsAddingTag(false);
                    }}
                    className="inline-flex"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onBlur={() => {
                        const trimmed = newTagInput.trim();
                        if (trimmed) {
                          if (!selectedTraits.includes(trimmed)) {
                            const updated = [...selectedTraits, trimmed];
                            setSelectedTraits(updated);
                            localStorage.setItem('user_profile_tags', JSON.stringify(updated));
                          }
                        }
                        setNewTagInput('');
                        setIsAddingTag(false);
                      }}
                      placeholder="Add tag..."
                      className="px-3 py-1 bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-full text-xs font-semibold outline-none w-24 focus:border-neutral-500 transition-colors"
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center justify-center px-3 py-1 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-650 hover:text-neutral-800 rounded-full text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    + Add tag
                  </button>
                )}
                {selectedTraits.length === 0 && !isAddingTag && (
                  <span className="text-xs text-neutral-400 italic">
                    {postMode === 'finding' ? 'No preference tags set.' : 'No traits set on profile.'}
                  </span>
                )}
              </div>
            </div>

            {/* Post button */}
            <button 
              onClick={handlePostSubmit}
              disabled={!content.trim()}
              className={`w-full py-2.5 rounded-lg font-bold text-[15px] transition-colors mt-2 shrink-0 ${
                content.trim() 
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
