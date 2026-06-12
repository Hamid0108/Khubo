import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, GraduationCap, Wallet, Heart, MessageSquare, ShieldCheck, Instagram, Twitter, Facebook, Star, User, Zap, Sparkles } from 'lucide-react';
import { Roommate } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface RoommateModalProps {
  roommate: Roommate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoommateModal({ roommate, isOpen, onClose }: RoommateModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [introText, setIntroText] = useState('');

  useEffect(() => {
    if (isOpen && roommate) {
      setIsApplying(false);
      setIntroText(`Hi ${roommate.name}! I saw your roommate finder profile for ${roommate.preferredPlace} and I'm interested in applying to share space with you. Let's chat!`);
    }
  }, [isOpen, roommate]);

  if (!roommate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              className="bg-[#F9F9F9] w-full max-w-lg md:max-w-3xl pointer-events-auto rounded-[40px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.2)] flex flex-col md:flex-row max-h-[90vh] relative"
            >
              {/* Close Button - Desktop */}
              <button 
                onClick={onClose}
                className="hidden md:flex absolute top-6 right-6 z-50 w-10 h-10 items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all active:scale-90"
              >
                <X size={20} />
              </button>

              {/* Left Column: Image Area */}
              <div className="w-full md:w-[42%] h-[320px] md:h-auto relative">
                <img 
                  src={roommate.image} 
                  alt={roommate.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Mobile Close Button */}
                <button 
                  onClick={onClose}
                  className="md:hidden absolute top-5 right-5 bg-black/20 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black/40 transition-all"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-500 p-0.5 rounded-full">
                      <ShieldCheck size={10} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Verified Resident</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-1.5">{roommate.name}</h2>
                  <div className="flex items-center gap-2.5 text-white/80 font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={14} />
                      <span>{roommate.university}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{roommate.age} yrs</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-t-[40px] md:rounded-t-none md:rounded-l-[40px] -mt-10 md:mt-0 relative z-10 p-6 md:p-10">
                <div className="max-w-2xl mx-auto space-y-8">
                  
                  {/* Bio Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-[#17294F]" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#17294F] opacity-40">Personality</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-medium text-neutral-800 leading-tight italic">
                      "{roommate.bio}"
                    </p>
                  </section>

                  {/* Vibe Tags */}
                  <section>
                    <div className="flex flex-wrap gap-1.5">
                      {roommate.tags.map((tag, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-50 border border-neutral-100 rounded-full flex items-center gap-2 group hover:border-[#17294F]/30 hover:bg-white transition-all cursor-default whitespace-nowrap"
                        >
                          <Zap size={12} className="text-[#17294F] opacity-30 group-hover:opacity-100" />
                          <span className="text-[11px] sm:text-[13px] font-bold text-neutral-600 group-hover:text-[#17294F] tracking-tight">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Logistics Grid */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-neutral-100">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Target Area</h4>
                      </div>
                      <p className="text-base font-black text-neutral-900">{roommate.preferredPlace}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-green-600" />
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Budget Range</h4>
                      </div>
                      <p className="text-base font-black text-neutral-900">{roommate.budgetRange} <span className="text-[10px] font-bold text-neutral-400">/ mo</span></p>
                    </div>
                  </section>

                  {/* Social & Connect */}
                  <section className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
                    <div className="space-y-4 w-full md:w-auto">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center md:text-left">Social Identity</h3>
                      <div className="flex items-center justify-center md:justify-start gap-6">
                        <Instagram size={20} className="text-neutral-300 hover:text-pink-500 transition-colors cursor-pointer" />
                        <Twitter size={20} className="text-neutral-300 hover:text-blue-400 transition-colors cursor-pointer" />
                        <Facebook size={20} className="text-neutral-300 hover:text-blue-600 transition-colors cursor-pointer" />
                      </div>
                    </div>

                    {isApplying ? (
                      <div className="w-full flex flex-col gap-3 text-left">
                        <textarea
                          value={introText}
                          onChange={(e) => setIntroText(e.target.value)}
                          required
                          rows={3}
                          className="w-full p-4 border border-neutral-300 rounded-2xl outline-none focus:ring-2 focus:ring-[#17294F] transition-all resize-none text-xs font-semibold"
                        />
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setIsApplying(false)}
                            className="flex-1 py-3 border border-neutral-300 rounded-xl text-xs font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 active:scale-95 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={async () => {
                              if (!introText.trim()) return;
                              
                              const targetUserId = roommate.userId;
                              const isUUID = targetUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);

                              if (user && isUUID) {
                                try {
                                  const { data: existingConvs } = await supabase
                                    .from('conversations')
                                    .select('*')
                                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
                                  
                                  const existing = existingConvs?.find(
                                    c => (c.sender_id === user.id && c.receiver_id === targetUserId) ||
                                         (c.sender_id === targetUserId && c.receiver_id === user.id)
                                  );

                                  if (existing) {
                                    await supabase.from('messages').insert({
                                      conversation_id: existing.id,
                                      sender_id: user.id,
                                      text: introText
                                    });
                                    await supabase
                                      .from('conversations')
                                      .update({
                                        last_message: introText,
                                        last_message_time: new Date().toISOString()
                                      })
                                      .eq('id', existing.id);
                                  } else {
                                    // Fetch roommate profile
                                    const { data: roommateProfile } = await supabase
                                      .from('profiles')
                                      .select('full_name, nickname')
                                      .eq('id', targetUserId)
                                      .single();

                                    const receiverName = roommateProfile?.nickname || roommateProfile?.full_name || roommate.name || 'Roommate';

                                    // Fetch user profile
                                    const { data: myProfile } = await supabase
                                      .from('profiles')
                                      .select('full_name, nickname')
                                      .eq('id', user.id)
                                      .single();

                                    const senderName = myProfile?.nickname || myProfile?.full_name || user.email?.split('@')[0] || 'User';

                                    const { data: newConv } = await supabase
                                      .from('conversations')
                                      .insert({
                                        sender_id: user.id,
                                        receiver_id: targetUserId,
                                        sender_name: senderName,
                                        receiver_name: receiverName,
                                        last_message: introText,
                                        last_message_time: new Date().toISOString()
                                      })
                                      .select()
                                      .single();

                                    if (newConv) {
                                      await supabase.from('messages').insert({
                                        conversation_id: newConv.id,
                                        sender_id: user.id,
                                        text: introText
                                      });
                                    }
                                  }
                                } catch (err) {
                                  console.error('Supabase chat initiation error:', err);
                                } finally {
                                  onClose();
                                  navigate('/messages');
                                }
                              } else {
                                // Save conversation
                                const newChat = {
                                  id: roommate.id,
                                  name: roommate.name,
                                  avatar: roommate.image,
                                  lastMessage: introText,
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  unread: 0,
                                  online: true,
                                  role: 'Roommate'
                                };
                                const chatsStr = localStorage.getItem('khubo_conversations');
                                const chats = chatsStr ? JSON.parse(chatsStr) : [];
                                // Prepend if not exists
                                if (!chats.some((c: any) => c.id === roommate.id)) {
                                  localStorage.setItem('khubo_conversations', JSON.stringify([newChat, ...chats]));
                                }
                                
                                // Save message to message history
                                const newMsg = {
                                  id: Date.now().toString(),
                                  text: introText,
                                  sender: 'me',
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                };
                                localStorage.setItem(`khubo_messages_${roommate.id}`, JSON.stringify([newMsg]));

                                onClose();
                                navigate('/messages');
                              }
                            }}
                            className="flex-[2] py-3 bg-[#17294F] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#1e3466] active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Send & Chat <MessageSquare size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 w-full md:w-auto">
                        <button className="flex-1 md:flex-none h-14 w-14 flex items-center justify-center border-2 border-neutral-100 rounded-2xl text-neutral-400 hover:text-red-500 hover:border-red-500 transition-all active:scale-90">
                          <Heart size={20} />
                        </button>
                        <button 
                          onClick={() => setIsApplying(true)}
                          className="flex-[3] md:flex-none h-14 px-8 bg-[#17294F] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-[#1e325c] transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                          <MessageSquare size={16} />
                          Apply as Roommate
                        </button>
                      </div>
                    )}
                  </section>

                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
