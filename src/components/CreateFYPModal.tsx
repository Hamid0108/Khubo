import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, Sparkles, Check, Play, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { useToast } from './ToastProvider';

interface CreateFYPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_VIDEOS = [
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-apartment-40455-large.mp4', label: 'Modern Apartment Tour (Default)' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-loft-apartment-interior-41551-large.mp4', label: 'Cozy Loft Apartment' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-bright-apartment-with-modern-furniture-40453-large.mp4', label: 'Bright Modern Apartment' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-of-a-modern-apartment-40454-large.mp4', label: 'Living Room Tour' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-bedroom-tour-40456-large.mp4', label: 'Bedroom Suite' },
];

export function CreateFYPModal({ isOpen, onClose, onSuccess }: CreateFYPModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form states
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState(PRESET_VIDEOS[0].url);
  const [isCustomUrl, setIsCustomUrl] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [linkedListingId, setLinkedListingId] = useState('');

  // Fetch host's properties to link to the video
  useEffect(() => {
    if (isOpen && user) {
      const fetchListings = async () => {
        setLoadingListings(true);
        try {
          const { data, error } = await supabase
            .from('listings')
            .select('id, title')
            .eq('landlord_id', user.id);
          
          if (!error && data) {
            setMyListings(data);
            if (data.length > 0) {
              setLinkedListingId(data[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to load listings for video linking:', err);
        } finally {
          setLoadingListings(false);
        }
      };

      fetchListings();
    }
  }, [isOpen, user]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalUrl = isCustomUrl ? customVideoUrl.trim() : videoUrl;
    if (!finalUrl) {
      showToast('Please provide a valid video URL.');
      return;
    }

    setIsPublishing(true);
    try {
      // Fetch host profile info for matching username and avatar
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      const hostName = profile?.nickname || profile?.full_name || user.email?.split('@')[0] || 'Landlord';
      const hostAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

      const { error } = await supabase
        .from('fyp_videos')
        .insert({
          id: 'v_user_' + Date.now(),
          video_url: finalUrl,
          description: caption.trim() || 'Take a tour of our cozy student boarding space! ✨',
          username: hostName,
          avatar: hostAvatar,
          likes: 0,
          comments_count: 0,
          shares: 0,
          saves: 0,
          listing_id: linkedListingId || null,
          comments: []
        });

      if (error) throw error;

      showToast('Video reel published successfully! 🎬');
      setCaption('');
      setCustomVideoUrl('');
      setIsCustomUrl(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to publish video:', err);
      showToast(`Publishing failed: ${err.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 text-neutral-900 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2252D6]/10 text-[#2252D6] flex items-center justify-center shrink-0">
                  <Video size={16} />
                </div>
                <h2 className="text-lg font-bold text-neutral-900">Publish Video Reel</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handlePublish} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Linked Listing selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Link to Listing *</label>
                {loadingListings ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 py-3">
                    <Loader2 size={14} className="animate-spin" /> Loading properties...
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-normal">
                      You need to publish at least one property listing before you can link a video reel to it.
                    </p>
                  </div>
                ) : (
                  <select
                    value={linkedListingId}
                    onChange={(e) => setLinkedListingId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all text-sm font-semibold bg-white"
                  >
                    {myListings.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Video Caption / Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Check out the clean layouts and fast Wi-Fi study desks at Ria's Dorm! 🎒✨"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all text-sm resize-none font-semibold"
                />
              </div>

              {/* Video URL Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Video Source</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomUrl(!isCustomUrl)}
                    className="text-xs font-bold text-[#2252D6] hover:underline"
                  >
                    {isCustomUrl ? 'Use Presets' : 'Paste Custom URL'}
                  </button>
                </div>

                {isCustomUrl ? (
                  <input
                    type="url"
                    placeholder="https://example.com/tour-video.mp4"
                    value={customVideoUrl}
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2252D6] focus:border-transparent transition-all text-sm font-semibold"
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {PRESET_VIDEOS.map((vid, idx) => {
                      const isSelected = videoUrl === vid.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setVideoUrl(vid.url)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected ? 'border-[#2252D6] bg-[#2252D6]/5 font-bold' : 'border-neutral-200 bg-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#2252D6] text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                            <Play size={14} fill={isSelected ? 'currentColor' : 'none'} />
                          </div>
                          <span className="text-xs text-neutral-800">{vid.label}</span>
                          {isSelected && <Check size={16} className="ml-auto text-[#2252D6]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-neutral-300 text-neutral-600 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || myListings.length === 0}
                  className="flex-1 py-3 bg-[#2252D6] text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 hover:bg-[#1b43b3] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Publish Reel
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
