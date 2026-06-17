import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Edit, MoreHorizontal, Phone, Video, Info, ChevronLeft, ArrowLeft,
  Send, Image as ImageIcon, Smile, Mic, Moon, Sun, Megaphone, Loader2, MessageCircle,
  Plus, Camera, FileText, ChevronRight, X, Play, File as FileIcon, Paperclip
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from '../mocks/messages';
import { motion, AnimatePresence } from 'motion/react';
import { AnnouncementsOverlay } from '../components/AnnouncementsOverlay';
import { UploadModal } from '../components/UploadModal';
import { CameraOverlay } from '../components/CameraOverlay';
import BottomNav from '../components/BottomNav';

export type Attachment = {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name?: string;
  file?: File;
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      readFileAsDataURL(file).then(resolve).catch(() => resolve(''));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
};

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isAttachmentsExpanded, setIsAttachmentsExpanded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadAcceptedTypes, setUploadAcceptedTypes] = useState('*');
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetConvId = searchParams.get('id');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<any>(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const filterOptions = ['All', 'Landlord', 'Roommate'];

  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter = activeFilter === 'All' || conv.role === activeFilter;
    const matchesSearch = !searchQuery || conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ── Load conversations ────────────────────────────────────────────────────
  useEffect(() => {
    loadConversations();
  }, [user]);

  async function loadConversations() {
    setLoadingConvs(true);
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            sender:sender_id(role, avatar_url, nickname, full_name),
            receiver:receiver_id(role, avatar_url, nickname, full_name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('last_message_time', { ascending: false });

        if (!error && data) {
          const mapped = data.map((c: any) => {
            const isReceiver = c.receiver_id === user?.id;
            const otherProfile = isReceiver ? c.sender : c.receiver;
            const fallbackName = isReceiver ? c.sender_name : c.receiver_name;
            const otherName = otherProfile?.nickname || otherProfile?.full_name || fallbackName;
            const otherRole = otherProfile?.role 
              ? (otherProfile.role === 'landlord' ? 'Landlord' : 'Roommate') 
              : (otherName?.toLowerCase().includes('landlord') ? 'Landlord' : 'Roommate');
            const otherAvatar = otherProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`;

            return {
              id: c.id,
              name: otherName || 'Unknown',
              avatar: otherAvatar,
              lastMessage: c.last_message || '',
              time: c.last_message_time
                ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
              unread: c.last_sender_id === user.id ? 0 : (c.unread_count || 0),
              online: false,
              role: otherRole,
              _raw: c,
            };
          });

          setConversations(mapped);
          if (mapped.length > 0) {
            setSelectedConversation((prev: any) => {
              if (targetConvId) {
                const target = mapped.find((c) => c.id === targetConvId);
                if (target) return target;
              }
              if (prev) {
                const updatedPrev = mapped.find((c) => c.id === prev.id);
                return updatedPrev || mapped[0];
              }
              return mapped[0];
            });
          }
          setLoadingConvs(false);
          return;
        }
      } catch (err) {
        console.error('Supabase conversations error:', err);
      }
    }

    // Fallback: merge dummy + localStorage conversations
    const baseDummy = DUMMY_CONVERSATIONS.map((c) => ({
      ...c,
      role: c.id === '4' || c.id === '5' ? 'Roommate' : 'Landlord',
    }));
    const savedChatsStr = localStorage.getItem('khubo_conversations');
    const savedChats = savedChatsStr ? JSON.parse(savedChatsStr) : [];
    const merged = [...savedChats];
    baseDummy.forEach((d) => {
      if (!merged.some((m: any) => m.id === d.id)) merged.push(d);
    });
    setConversations(merged);
    if (merged.length > 0) {
      setSelectedConversation((prev: any) => {
        if (targetConvId) {
          const target = merged.find((c) => c.id === targetConvId);
          if (target) return target;
        }
        if (prev) {
          const updatedPrev = merged.find((c) => c.id === prev.id);
          return updatedPrev || merged[0];
        }
        return merged[0];
      });
    }
    setLoadingConvs(false);
  }

  // ── Load messages for selected conversation ───────────────────────────────
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    loadMessages(selectedConversation);
  }, [selectedConversation?.id]);

  // ── Global real-time message listener ─────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global_chat_messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const m = payload.new;
          
          // 1. If it belongs to the active conversation, append to messages
          const activeConv = selectedConversationRef.current;
          if (activeConv && m.conversation_id === activeConv.id) {
            let txt = m.text;
            let msgAttachments = undefined;
            if (m.text.startsWith('{"text":') || m.text.startsWith('{"attachments":')) {
              try {
                const parsed = JSON.parse(m.text);
                txt = parsed.text;
                msgAttachments = parsed.attachments;
              } catch (e) {}
            }
            const mappedMsg = {
              id: m.id,
              text: txt,
              sender: m.sender_id === user.id ? 'me' : 'them',
              time: m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
              attachments: msgAttachments
            };

            setMessages((prev) => {
              // Check for optimistic message and resolve its ID to prevent duplication
              const matchIndex = prev.findIndex(
                (msg) => msg.text === mappedMsg.text && msg.sender === mappedMsg.sender && /^\d+$/.test(msg.id)
              );

              if (matchIndex !== -1) {
                const updated = [...prev];
                updated[matchIndex] = {
                  ...updated[matchIndex],
                  id: mappedMsg.id,
                  time: mappedMsg.time
                };
                return updated;
              }

              if (prev.some((msg) => msg.id === mappedMsg.id)) return prev;
              return [...prev, mappedMsg];
            });
          }

          // 2. Update the last message preview and unread count in the conversations list
          setConversations((prevConvs) => {
            const hasConv = prevConvs.some((c) => c.id === m.conversation_id);
            if (!hasConv) {
              // Reload conversations if new thread
              loadConversations();
              return prevConvs;
            }

            const timeStr = m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            const updated = prevConvs.map((c) => {
              if (c.id === m.conversation_id) {
                const isMsgFromMe = m.sender_id === user.id;
                const isChatActive = activeConv && activeConv.id === c.id;
                return {
                  ...c,
                  lastMessage: m.text,
                  time: timeStr,
                  unread: (!isMsgFromMe && !isChatActive) ? c.unread + 1 : c.unread
                };
              }
              return c;
            });

            // Reorder to put active conversation at the top of the list
            const active = updated.find((c) => c.id === m.conversation_id);
            const others = updated.filter((c) => c.id !== m.conversation_id);
            return active ? [active, ...others] : updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function loadMessages(conv: any) {
    setLoadingMsgs(true);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(conv.id);
      if (isUUID) {
        // Reset unread count in DB
        await supabase
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', conv.id);

        // Reset unread count locally in sidebar state
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
        );

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('timestamp', { ascending: true });

        if (!error && data) {
          const mapped = data.map((m: any) => {
            let txt = m.text;
            let msgAttachments = undefined;
            if (m.text.startsWith('{"text":') || m.text.startsWith('{"attachments":')) {
              try {
                const parsed = JSON.parse(m.text);
                txt = parsed.text;
                msgAttachments = parsed.attachments;
              } catch (e) {}
            }
            return {
              id: m.id,
              text: txt,
              sender: m.sender_id === user?.id ? 'me' : 'them',
              time: m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
              attachments: msgAttachments
            };
          });
          setMessages(mapped);
          setLoadingMsgs(false);
          return;
        }
      }
    } catch (err) {
      console.error('Supabase messages error:', err);
    }

    // Fallback: localStorage
    const key = `khubo_messages_${conv.id}`;
    const savedMsgsStr = localStorage.getItem(key);
    if (savedMsgsStr) {
      setMessages(JSON.parse(savedMsgsStr));
    } else {
      localStorage.setItem(key, JSON.stringify(DUMMY_MESSAGES));
      setMessages(DUMMY_MESSAGES);
    }
    setLoadingMsgs(false);
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const files = e.target.files;
    if (!files) return;

    const promises: Promise<Attachment | null>[] = Array.from(files).map(async (file) => {
      let actualType = type;
      if (file.type.startsWith('image/')) actualType = 'image';
      else if (file.type.startsWith('video/')) actualType = 'video';
      else actualType = 'file';

      try {
        const url = await compressImage(file);
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          type: actualType,
          url,
          name: file.name,
          file
        };
      } catch (err) {
        console.error('Error reading file:', err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validAttachments = results.filter((item): item is Attachment => item !== null);

    setAttachments(prev => [...prev, ...validAttachments]);
    if (e.target) e.target.value = '';
  };

  const handleModalUpload = async (files: File[]) => {
    const promises: Promise<Attachment | null>[] = files.map(async (file) => {
      let actualType: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) actualType = 'image';
      else if (file.type.startsWith('video/')) actualType = 'video';

      try {
        const url = await compressImage(file);
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          type: actualType,
          url,
          name: file.name,
          file
        };
      } catch (err) {
        console.error('Error reading file:', err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validAttachments = results.filter((item): item is Attachment => item !== null);

    setAttachments(prev => [...prev, ...validAttachments]);
  };

  const handleCameraCapture = async (file: File) => {
    try {
      const url = await compressImage(file);
      const newAttachment = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        type: 'image' as const,
        url,
        name: file.name,
        file
      };
      setAttachments(prev => [...prev, newAttachment]);
    } catch (err) {
      console.error('Error reading camera capture file:', err);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;

    let text = messageInput.trim();
    let dbText = text;

    const newMsg: any = {
      id: Date.now().toString(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (attachments.length > 0) {
      newMsg.attachments = [...attachments];
      dbText = JSON.stringify({
        text,
        attachments: attachments.map(a => ({ id: a.id, type: a.type, url: a.url, name: a.name }))
      });
    }

    // Optimistic UI
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setMessageInput('');
    setAttachments([]);
    setIsAttachmentsExpanded(false);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(selectedConversation.id);

    let previewText = text;
    if (attachments.length > 0) {
      const types = attachments.map(a => a.type);
      if (types.includes('image')) previewText = '📷 Photo';
      else if (types.includes('video')) previewText = '🎥 Video';
      else previewText = '📁 File';
    }

    if (isUUID && user?.id) {
      // Write to Supabase
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        text: dbText,
        timestamp: new Date().toISOString(),
      });
      await supabase
        .from('conversations')
        .update({ last_message: previewText, last_message_time: new Date().toISOString() })
        .eq('id', selectedConversation.id);
    } else {
      // localStorage fallback
      const key = `khubo_messages_${selectedConversation.id}`;
      localStorage.setItem(key, JSON.stringify(updatedMessages));
    }

    // Update conversation list preview
    const updatedConvs = conversations.map((c) => {
      if (c.id === selectedConversation.id) {
        const updated = { ...c, lastMessage: previewText, time: newMsg.time };
        setSelectedConversation(updated);
        return updated;
      }
      return c;
    });
    const active = updatedConvs.find((c) => c.id === selectedConversation.id);
    const others = updatedConvs.filter((c) => c.id !== selectedConversation.id);
    const reordered = active ? [active, ...others] : updatedConvs;
    setConversations(reordered);

    if (!isUUID) {
      localStorage.setItem('khubo_conversations', JSON.stringify(reordered));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans ${isDarkMode ? 'bg-[#242526] text-white' : 'bg-white text-neutral-900'}`}>

      {/* SIDEBAR */}
      <div className={`md:w-[360px] lg:w-[400px] flex-shrink-0 flex flex-col border-r ${isDarkMode ? 'border-[#3A3B3C]' : 'border-neutral-100'} ${selectedConversation ? 'hidden md:flex' : 'w-full flex'}`}>

        {/* Sidebar Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-transparent">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className={`p-2 -ml-2 rounded-full transition ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>Chats</h1>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition ${isDarkMode ? 'bg-[#3A3B3C] text-white hover:bg-[#4E4F50]' : 'bg-neutral-100 text-black hover:bg-neutral-200'}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 pt-1">
          <div className={`rounded-full flex items-center px-4 py-2 transition ${isDarkMode ? 'bg-[#3A3B3C]' : 'bg-neutral-100'}`}>
            <Search size={18} className={`mr-2 flex-shrink-0 ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent border-none outline-none w-full text-sm font-medium focus:ring-0 p-0 ${isDarkMode ? 'placeholder-[#B0B3B8] text-white' : 'placeholder-neutral-500 text-neutral-800'}`}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 pt-1 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-black text-white'
                  : isDarkMode
                  ? 'bg-[#3A3B3C] text-white hover:bg-[#4E4F50]'
                  : 'bg-neutral-100 text-black hover:bg-neutral-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 pb-24">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-[#2252D6]" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-6">
              <MessageCircle size={32} className="text-neutral-300" />
              <p className={`text-sm ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-400'}`}>No conversations yet. Start chatting with a landlord or roommate!</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full flex items-center p-2 rounded-xl transition gap-3 ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-50'} ${selectedConversation?.id === conv.id ? (isDarkMode ? 'md:bg-[#3A3B3C]' : 'md:bg-neutral-100') : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={conv.avatar} alt={conv.name} className={`w-14 h-14 rounded-full object-cover ${isDarkMode ? 'bg-[#3A3B3C]' : 'bg-neutral-200'}`} />
                  {conv.online && (
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full ${isDarkMode ? 'border-[#242526]' : 'border-white'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-[15px] truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{conv.name}</h3>
                    <span className={`text-xs ml-2 flex-shrink-0 ${conv.unread > 0 ? 'font-semibold text-[#17294F]' : (isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500')}`}>{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-[13px] truncate pr-2 ${conv.unread > 0 ? (isDarkMode ? 'font-semibold text-white' : 'font-semibold text-neutral-900') : (isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500')}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-white' : 'bg-[#17294F]'}`}>
                        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#242526]' : 'text-white'}`}>{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-[#242526]' : 'bg-white'} ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className={`h-16 flex items-center justify-between px-4 mt-2 sm:mt-0 border-b flex-shrink-0 shadow-sm z-10 ${isDarkMode ? 'border-[#3A3B3C]' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConversation(null)} className={`p-2 -ml-2 rounded-full transition md:hidden ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
                  <ArrowLeft size={24} />
                </button>
                <div className="relative">
                  <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full object-cover" />
                  {selectedConversation.online && (
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${isDarkMode ? 'border-[#242526]' : 'border-white'}`} />
                  )}
                </div>
                <div>
                  <h2 className={`font-semibold leading-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{selectedConversation.name}</h2>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`}>
                    {selectedConversation.online ? 'Active now' : `Active ${selectedConversation.time}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-[#2252D6] gap-4 sm:gap-6">
                <Megaphone size={20} className="cursor-pointer hover:opacity-80 transition" onClick={() => setIsAnnouncementsOpen(true)} />
                <Phone size={20} className="cursor-pointer hover:opacity-80 transition" />
                <Video size={24} className="cursor-pointer hover:opacity-80 transition" />
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${isDarkMode ? 'bg-[#242526]' : 'bg-white'}`}>
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20">
                  <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full rounded-full object-cover" />
                  {selectedConversation.online && (
                    <div className={`absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 rounded-full ${isDarkMode ? 'border-[#242526]' : 'border-white'}`} />
                  )}
                </div>
              </div>
              <div className="text-center mb-6">
                <h2 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{selectedConversation.name}</h2>
                <p className={`text-sm ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`}>
                  {selectedConversation.role === 'Roommate' ? 'Potential Roommate on Khubo' : 'Property Owner on Khubo'}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#8C939D]' : 'text-neutral-400'}`}>
                  You connected {selectedConversation.time}
                </p>
              </div>

              {loadingMsgs ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 size={22} className="animate-spin text-[#2252D6]" />
                </div>
              ) : messages.length === 0 ? (
                <p className={`text-center text-sm ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-400'}`}>No messages yet. Say hello! 👋</p>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender === 'me';
                  const showAvatar = !isMe && (i === messages.length - 1 || messages[i + 1]?.sender === 'me');
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-7 h-7 flex-shrink-0">
                          {showAvatar ? (
                            <img src={selectedConversation.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7" />
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Render Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={`flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {msg.attachments.map((attach: Attachment) => (
                              <div key={attach.id} className="relative group overflow-hidden rounded-xl border border-black/5" style={{ maxWidth: '240px' }}>
                                {attach.type === 'image' && (
                                  <img src={attach.url} alt="attachment" className="max-w-full rounded-xl" style={{ maxHeight: '300px', objectFit: 'cover' }} />
                                )}
                                {attach.type === 'video' && (
                                  <div className="relative bg-black/10 rounded-xl" style={{ minWidth: '200px', minHeight: '150px' }}>
                                    <video src={attach.url} className="max-w-full rounded-xl" style={{ maxHeight: '300px' }} />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                                        <Play size={20} fill="currentColor" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {attach.type === 'file' && (
                                  <div className={`flex items-center gap-3 p-3 rounded-xl max-w-[240px] border ${isMe ? 'bg-[#2252D6]/10 border-[#2252D6]/20' : (isDarkMode ? 'bg-[#3A3B3C] border-[#4E4F50]' : 'bg-neutral-100 border-neutral-200')}`}>
                                    <div className={`p-2 rounded-lg ${isMe ? 'bg-[#2252D6]/20' : (isDarkMode ? 'bg-[#4E4F50]' : 'bg-white shadow-sm')}`}>
                                      <FileIcon size={20} className={isMe ? 'text-[#2252D6]' : (isDarkMode ? 'text-white' : 'text-neutral-600')} />
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <p className={`text-sm font-medium truncate ${isMe ? 'text-white' : (isDarkMode ? 'text-white' : 'text-neutral-900')}`}>
                                        {attach.name || 'File attachment'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Message Text */}
                        {msg.text && (
                          <div className={`px-4 py-2 ${isMe ? 'bg-[#2252D6] text-white rounded-2xl rounded-tr-md' : (isDarkMode ? 'bg-[#3A3B3C] text-white rounded-2xl rounded-tl-md' : 'bg-neutral-100 text-neutral-900 rounded-2xl rounded-tl-md')}`}>
                            <p className="text-[14.5px] leading-relaxed">{msg.text}</p>
                          </div>
                        )}
                        
                        {isMe && i === messages.length - 1 && (
                          <span className={`text-[11px] flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hidden Input Elements */}
            <input type="file" ref={imageInputRef} accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
            <input type="file" ref={fileInputRef} accept="*" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'file')} />

            {/* Attachments Preview Area Before Input */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 10 }}
                  className={`p-3 border-t overflow-x-auto flex items-center gap-2 ${isDarkMode ? 'bg-[#242526] border-[#3A3B3C]' : 'bg-white border-neutral-100'} no-scrollbar`}
                >
                  {attachments.map(attach => (
                    <div key={attach.id} className="relative flex-shrink-0 group">
                      <div className={`w-16 h-16 rounded-xl overflow-hidden border ${isDarkMode ? 'border-[#3A3B3C] bg-[#3A3B3C]' : 'border-neutral-200 bg-neutral-100'}`}>
                        {attach.type === 'image' && (
                          <img src={attach.url} alt="preview" className="w-full h-full object-cover" />
                        )}
                        {attach.type === 'video' && (
                          <div className="w-full h-full bg-black/20 flex items-center justify-center relative">
                            <video src={attach.url} className="w-full h-full object-cover absolute inset-0 text-transparent" />
                            <Play size={16} fill="white" className="text-white z-10" />
                          </div>
                        )}
                        {attach.type === 'file' && (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                            <FileIcon size={24} />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => removeAttachment(attach.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 transition drop-shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input - Bottom */}
            <div className={`p-2 sm:p-3 pb-safe relative z-20 ${attachments.length === 0 ? 'border-t' : ''} ${isDarkMode ? 'bg-[#242526] border-[#3A3B3C]' : 'bg-white border-neutral-100'}`}>
              <div className="flex items-center gap-1 sm:gap-2 w-full">
                
                {/* Expanded/Collapsible Actions */}
                <div className="flex items-center shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsAttachmentsExpanded(!isAttachmentsExpanded)}
                    className={`p-2 rounded-full transition flex-shrink-0 ${isDarkMode ? 'text-white hover:bg-[#3A3B3C]' : 'text-black hover:bg-neutral-100'}`}
                  >
                    {!isAttachmentsExpanded ? (
                      messageInput.trim() ? <ChevronRight size={22} /> : <MoreHorizontal size={22} />
                    ) : (
                      <ChevronRight size={22} />
                    )}
                  </button>

                  <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${isAttachmentsExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
                    <button 
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className={`p-2 rounded-full transition shrink-0 ${isDarkMode ? 'text-white hover:bg-[#3A3B3C]' : 'text-black hover:bg-neutral-100'}`}
                    >
                      <Camera size={22} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setUploadAcceptedTypes('image/*,video/*'); setIsUploadModalOpen(true); }}
                      className={`p-2 rounded-full transition shrink-0 ${isDarkMode ? 'text-white hover:bg-[#3A3B3C]' : 'text-black hover:bg-neutral-100'}`}
                    >
                      <ImageIcon size={22} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setUploadAcceptedTypes('*'); setIsUploadModalOpen(true); }}
                      className={`p-2 rounded-full transition shrink-0 ${isDarkMode ? 'text-white hover:bg-[#3A3B3C]' : 'text-black hover:bg-neutral-100'}`}
                    >
                       <FileText size={22} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className={`flex-1 flex items-center min-w-0 rounded-full px-3 py-1.5 focus-within:ring-2 ring-[#2252D6]/20 transition-all border ${isDarkMode ? 'bg-[#3A3B3C] border-transparent' : 'bg-neutral-100 border-neutral-300'}`}>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Message"
                    className={`flex-1 w-full bg-transparent border-none outline-none text-[15px] focus:ring-0 py-1 px-1 min-w-0 ${isDarkMode ? 'text-white placeholder-[#B0B3B8]' : 'text-neutral-800 placeholder-neutral-500'}`}
                  />
                  <button type="button" className={`p-1 ml-1 rounded-full transition flex-shrink-0 ${isDarkMode ? 'text-white hover:bg-[#4E4F50]' : 'text-black hover:bg-neutral-200'}`}>
                    <Smile size={20} />
                  </button>
                </form>

                {(messageInput.trim() || attachments.length > 0) && (
                  <button onClick={handleSendMessage} className={`p-2 rounded-full transition flex-shrink-0 ${isDarkMode ? 'text-white hover:bg-[#3A3B3C]' : 'text-black hover:bg-neutral-100'}`}>
                    <Send size={22} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={`hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 ${isDarkMode ? 'bg-[#242526]' : 'bg-neutral-50'}`}>
            <MessageCircle size={48} className="text-neutral-200 mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Your Messages</h2>
            <p className={`max-w-sm ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`}>
              Select a conversation from the sidebar or start a new chat with a property owner or a potential roommate.
            </p>
          </div>
        )}
      </div>

      <AnnouncementsOverlay isOpen={isAnnouncementsOpen} onClose={() => setIsAnnouncementsOpen(false)} />
      
      <CameraOverlay 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCameraCapture} 
      />

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleModalUpload} 
        isDarkMode={isDarkMode} 
        acceptedTypes={uploadAcceptedTypes} 
      />
    </div>
  );
}
