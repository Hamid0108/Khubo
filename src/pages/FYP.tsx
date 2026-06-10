import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  MapPin,
  Sparkles,
  Send,
  X
} from 'lucide-react';
import { FYP_VIDEOS, FYPVideo } from '../mocks/fyp';
import BottomNav from '../components/BottomNav';
import { useToast } from '../components/ToastProvider';
import { supabase } from '../lib/supabaseClient';

export default function FYP() {
  const [videos, setVideos] = useState<FYPVideo[]>(FYP_VIDEOS);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [activeCommentsVideo, setActiveCommentsVideo] = useState<FYPVideo | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [savedVideos, setSavedVideos] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('khubo_saved_listings');
      const ids = saved ? JSON.parse(saved) : [];
      const initialMap: Record<string, boolean> = {};
      FYP_VIDEOS.forEach((v) => {
        if (ids.includes(v.listingId)) {
          initialMap[v.id] = true;
        }
      });
      return initialMap;
    } catch {
      return {};
    }
  });
  const [showPlayOverlay, setShowPlayOverlay] = useState<string | null>(null); // 'play' | 'pause' | null
  const [heartPops, setHeartPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fyp_videos')
        .select(`
          id,
          video_url,
          username,
          avatar,
          description,
          likes,
          comments_count,
          shares,
          saves,
          comments,
          listing_id,
          listings:listing_id (
            title,
            price,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: FYPVideo[] = data.map((v: any) => {
          const listingInfo = v.listings;
          return {
            id: v.id,
            videoUrl: v.video_url,
            username: v.username || 'Landlord',
            avatar: v.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Landlord',
            description: v.description || '',
            likes: v.likes || 0,
            commentsCount: v.comments_count || 0,
            shares: v.shares || 0,
            saves: v.saves || 0,
            listingId: v.listing_id || '',
            listingTitle: listingInfo?.title || 'Boarding House Space',
            listingPrice: listingInfo?.price ? Number(listingInfo.price) : 0,
            listingLocation: listingInfo?.location || 'Unknown Location',
            comments: Array.isArray(v.comments) ? v.comments : []
          };
        });
        setVideos(mapped);
      } else {
        setVideos(FYP_VIDEOS);
      }
    } catch (err) {
      console.error('Error fetching FYP videos:', err);
      setVideos(FYP_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    const handleRefresh = () => {
      fetchVideos();
    };
    window.addEventListener('refresh_fyp', handleRefresh);
    return () => {
      window.removeEventListener('refresh_fyp', handleRefresh);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('khubo_saved_listings');
      const ids = saved ? JSON.parse(saved) : [];
      const initialMap: Record<string, boolean> = {};
      videos.forEach((v) => {
        if (ids.includes(v.listingId)) {
          initialMap[v.id] = true;
        }
      });
      setSavedVideos(initialMap);
    } catch (err) {
      console.error('Error syncing saved videos:', err);
    }
  }, [videos]);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const heartIdCounterRef = useRef(0);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Handle scroll to detect active video
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const clientHeight = container.clientHeight;
    
    // Find which index is active based on scroll offset
    const activeIndex = Math.round(scrollPosition / clientHeight);
    if (activeIndex !== currentVideoIdx && activeIndex >= 0 && activeIndex < videos.length) {
      setCurrentVideoIdx(activeIndex);
    }
  };

  // Play/Pause active video and pause others
  useEffect(() => {
    videos.forEach((video, index) => {
      const videoElement = videoRefs.current[video.id];
      if (videoElement) {
        if (index === currentVideoIdx) {
          videoElement.currentTime = 0;
          videoElement.play().catch(err => console.log("Video auto-play blocked: ", err));
        } else {
          videoElement.pause();
        }
      }
    });
  }, [currentVideoIdx, videos]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVideoTap = (video: FYPVideo) => {
    const videoElement = videoRefs.current[video.id];
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
      setShowPlayOverlay('play');
      setTimeout(() => setShowPlayOverlay(null), 600);
    } else {
      videoElement.pause();
      setShowPlayOverlay('pause');
      setTimeout(() => setShowPlayOverlay(null), 600);
    }
  };

  // Double tap to like
  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>, video: FYPVideo) => {
    // Only register double click
    if (e.detail === 2) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      heartIdCounterRef.current += 1;
      const newPop = { id: heartIdCounterRef.current, x, y };
      setHeartPops((prev) => [...prev, newPop]);
      setTimeout(() => {
        setHeartPops((prev) => prev.filter((h) => h.id !== newPop.id));
      }, 800);

      if (!likedVideos[video.id]) {
        toggleLike(video);
      }
    }
  };

  const toggleLike = async (video: FYPVideo) => {
    const isLiked = !likedVideos[video.id];
    setLikedVideos((prev) => ({ ...prev, [video.id]: isLiked }));
    
    setVideos((prev) => 
      prev.map((v) => {
        if (v.id === video.id) {
          return { ...v, likes: isLiked ? v.likes + 1 : v.likes - 1 };
        }
        return v;
      })
    );

    if (isLiked) {
      showToast('Added to liked videos!');
    }

    if (video.id.startsWith('v_user_')) {
      try {
        const newLikes = isLiked ? video.likes + 1 : Math.max(0, video.likes - 1);
        await supabase
          .from('fyp_videos')
          .update({ likes: newLikes })
          .eq('id', video.id);
      } catch (err) {
        console.error('Failed to update likes in DB:', err);
      }
    }
  };

  const toggleSave = async (video: FYPVideo) => {
    const isSaved = !savedVideos[video.id];
    setSavedVideos((prev) => ({ ...prev, [video.id]: isSaved }));
    
    try {
      const savedStr = localStorage.getItem('khubo_saved_listings');
      let ids = savedStr ? JSON.parse(savedStr) : [];
      if (isSaved) {
        if (!ids.includes(video.listingId)) {
          ids.push(video.listingId);
        }
      } else {
        ids = ids.filter((x: string) => x !== video.listingId);
      }
      localStorage.setItem('khubo_saved_listings', JSON.stringify(ids));
    } catch (err) {
      console.error(err);
    }
    
    setVideos((prev) => 
      prev.map((v) => {
        if (v.id === video.id) {
          return { ...v, saves: isSaved ? v.saves + 1 : v.saves - 1 };
        }
        return v;
      })
    );

    showToast(isSaved ? 'Listing saved to wishlist!' : 'Removed from wishlist!');

    if (video.id.startsWith('v_user_')) {
      try {
        const newSaves = isSaved ? video.saves + 1 : Math.max(0, video.saves - 1);
        await supabase
          .from('fyp_videos')
          .update({ saves: newSaves })
          .eq('id', video.id);
      } catch (err) {
        console.error('Failed to update saves in DB:', err);
      }
    }
  };

  const handleShare = (video: FYPVideo) => {
    const url = `${window.location.origin}/#/listing/${video.listingId}`;
    navigator.clipboard.writeText(url);
    showToast('Listing link copied to clipboard!');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentsVideo) return;

    const newComment = {
      id: Date.now().toString(),
      username: 'me_khubo',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      text: newCommentText,
      time: 'Just now'
    };

    const updatedComments = [newComment, ...activeCommentsVideo.comments];
    const newCount = activeCommentsVideo.commentsCount + 1;

    setVideos((prev) => 
      prev.map((v) => {
        if (v.id === activeCommentsVideo.id) {
          return {
            ...v,
            commentsCount: newCount,
            comments: updatedComments
          };
        }
        return v;
      })
    );

    // Update the open comments drawer state
    setActiveCommentsVideo((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        commentsCount: newCount,
        comments: updatedComments
      };
    });

    setNewCommentText('');

    if (activeCommentsVideo.id.startsWith('v_user_')) {
      try {
        await supabase
          .from('fyp_videos')
          .update({ 
            comments: updatedComments,
            comments_count: newCount 
          })
          .eq('id', activeCommentsVideo.id);
      } catch (err) {
        console.error('Failed to update comments in DB:', err);
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden relative select-none">
      
      {/* Floating Top Header */}
      <div className="absolute top-6 left-0 right-0 z-30 flex justify-center items-center pointer-events-none">
        <div className="bg-black/25 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-white text-xs font-black uppercase tracking-widest">For You Feed</span>
        </div>
      </div>

      {/* Sound Mute Indicator */}
      <button 
        onClick={toggleMute}
        className="absolute top-6 right-6 z-30 p-2.5 bg-black/40 hover:bg-black/60 border border-white/10 text-white rounded-full transition-all active:scale-90"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Main Snap-Scroll Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video, idx) => (
          <div 
            key={video.id}
            onClick={(e) => handleDoubleTap(e, video)}
            className="h-full w-full snap-start snap-always relative bg-neutral-950 flex items-center justify-center"
          >
            {/* HTML5 Video Element */}
            <video
              ref={el => { videoRefs.current[video.id] = el; }}
              src={video.videoUrl}
              loop
              muted={isMuted}
              playsInline
              onClick={() => handleVideoTap(video)}
              className="h-full w-full object-cover max-w-md mx-auto"
            />

            {/* Tap/Play overlay feedback animation */}
            <AnimatePresence>
              {showPlayOverlay && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 0.8 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute z-20 pointer-events-none text-white bg-black/40 p-5 rounded-full"
                >
                  {showPlayOverlay === 'play' ? <Play className="w-8 h-8 fill-white" /> : <Pause className="w-8 h-8 fill-white" />}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Double Tap Floating Heart popups */}
            {heartPops.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ scale: 0, opacity: 0.9, y: 0 }}
                animate={{ scale: [0.5, 1.5, 1.2], opacity: [0.9, 1, 0], y: -80, rotate: idx % 2 === 0 ? 15 : -15 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ left: heart.x - 24, top: heart.y - 24 }}
                className="absolute z-20 pointer-events-none text-[#FF385C]"
              >
                <Heart size={48} className="fill-[#FF385C]" />
              </motion.div>
            ))}

            {/* Dark bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-[100px] left-4 right-16 max-w-sm z-20 text-white flex flex-col gap-3">
              {/* Profile/Poster Info */}
              <div className="flex items-center gap-2.5">
                <img 
                  src={video.avatar} 
                  alt={video.username} 
                  className="w-9 h-9 rounded-full border border-white/20 object-cover" 
                />
                <div>
                  <h4 className="font-bold text-sm tracking-tight">@{video.username}</h4>
                  <p className="text-[10px] text-neutral-300 font-medium">Property Owner</p>
                </div>
              </div>

              {/* Caption/Description */}
              <p className="text-[12.5px] text-neutral-100 font-medium leading-relaxed line-clamp-3">
                {video.description}
              </p>

              {/* Sleek Hyperlink Card */}
              <motion.div 
                whileTap={{ scale: 0.97 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/listing/${video.listingId}`);
                }}
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.2)] mt-1"
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                  <h5 className="font-bold text-xs text-white truncate">{video.listingTitle}</h5>
                  <p className="text-[10px] text-neutral-300 font-medium flex items-center gap-1">
                    <MapPin size={10} className="text-blue-400 shrink-0" />
                    <span className="truncate">{video.listingLocation}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs font-black text-blue-400">₱{video.listingPrice.toLocaleString()}</span>
                  <span className="text-[8px] text-neutral-400 font-black uppercase tracking-wider">/month</span>
                </div>
              </motion.div>
            </div>

            {/* Right Side Control Bar */}
            <div className="absolute bottom-[110px] right-3 z-20 flex flex-col items-center gap-5">
              
              {/* Profile Avatar Follow Action */}
              <div className="relative mb-2">
                <img 
                  src={video.avatar} 
                  alt={video.username} 
                  className="w-11 h-11 rounded-full border-2 border-white object-cover"
                />
                <button className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#FF385C] hover:bg-[#FF385C]/90 text-white rounded-full w-5.5 h-5.5 flex items-center justify-center border-2 border-black font-black text-[11px] leading-none active:scale-90 transition-transform">
                  +
                </button>
              </div>

              {/* Like Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLike(video); }}
                className="flex flex-col items-center gap-1 cursor-pointer transition active:scale-75"
              >
                <div className={`p-2.5 rounded-full transition-colors ${likedVideos[video.id] ? 'bg-[#FF385C]/15' : 'bg-black/25 backdrop-blur-md'}`}>
                  <Heart 
                    className={`w-6 h-6 transition-all ${likedVideos[video.id] ? 'fill-[#FF385C] text-[#FF385C] scale-110' : 'text-white'}`} 
                  />
                </div>
                <span className="text-white text-[10.5px] font-black">{video.likes.toLocaleString()}</span>
              </button>

              {/* Comment Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveCommentsVideo(video); }}
                className="flex flex-col items-center gap-1 cursor-pointer transition active:scale-75"
              >
                <div className="p-2.5 rounded-full bg-black/25 backdrop-blur-md hover:bg-black/45">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-[10.5px] font-black">{video.commentsCount}</span>
              </button>

              {/* Bookmark Save Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleSave(video); }}
                className="flex flex-col items-center gap-1 cursor-pointer transition active:scale-75"
              >
                <div className={`p-2.5 rounded-full transition-colors ${savedVideos[video.id] ? 'bg-amber-400/15' : 'bg-black/25 backdrop-blur-md'}`}>
                  <Bookmark 
                    className={`w-6 h-6 transition-all ${savedVideos[video.id] ? 'fill-amber-400 text-amber-400 scale-110' : 'text-white'}`} 
                  />
                </div>
                <span className="text-white text-[10.5px] font-black">{video.saves}</span>
              </button>

              {/* Share Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleShare(video); }}
                className="flex flex-col items-center gap-1 cursor-pointer transition active:scale-75"
              >
                <div className="p-2.5 rounded-full bg-black/25 backdrop-blur-md hover:bg-black/45">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-[10.5px] font-black">Share</span>
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* Floating Comments Bottom Drawer Sheet */}
      <AnimatePresence>
        {activeCommentsVideo && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCommentsVideo(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white rounded-t-[2.5rem] overflow-hidden flex flex-col h-[65vh] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] text-neutral-900 z-10"
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 flex-shrink-0">
                <span className="text-xs font-black uppercase tracking-widest text-[#17294F]">
                  Comments ({activeCommentsVideo.commentsCount})
                </span>
                <button 
                  onClick={() => setActiveCommentsVideo(null)}
                  className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {activeCommentsVideo.comments.length === 0 ? (
                  <div className="text-center py-10 text-neutral-400">
                    <p className="text-sm">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  activeCommentsVideo.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-left">
                      <img 
                        src={comment.avatar} 
                        alt={comment.username} 
                        className="w-8 h-8 rounded-full object-cover border border-neutral-100 mt-0.5 shrink-0" 
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[13px] text-neutral-900">@{comment.username}</span>
                          <span className="text-[10px] text-neutral-400 font-bold">{comment.time}</span>
                        </div>
                        <p className="text-[13px] text-neutral-700 mt-1 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input Footer */}
              <div className="p-4 border-t border-neutral-100 pb-safe bg-neutral-50 flex-shrink-0">
                <form onSubmit={handleAddComment} className="flex items-center gap-2 max-w-sm mx-auto">
                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-white border border-neutral-300 rounded-full px-4 py-2 text-[13.5px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
