import React, { useState, useEffect, useRef } from 'react';
import {
  Search, MoreHorizontal, Phone, Video, ArrowLeft,
  Send, Image as ImageIcon, Smile, Mic, Moon, Sun, Megaphone, Loader2, MessageCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from '../mocks/messages';

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
            const mappedMsg = {
              id: m.id,
              text: m.text,
              sender: m.sender_id === user.id ? 'me' : 'them',
              time: m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
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
          const mapped = data.map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: m.sender_id === user?.id ? 'me' : 'them',
            time: m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
          }));
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

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const text = messageInput.trim();
    const newMsg = {
      id: Date.now().toString(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic UI
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setMessageInput('');

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(selectedConversation.id);

    if (isUUID && user?.id) {
      // Write to Supabase
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        text,
        timestamp: new Date().toISOString(),
      });
      await supabase
        .from('conversations')
        .update({ last_message: text, last_message_time: new Date().toISOString() })
        .eq('id', selectedConversation.id);
    } else {
      // localStorage fallback
      const key = `khubo_messages_${selectedConversation.id}`;
      localStorage.setItem(key, JSON.stringify(updatedMessages));
    }

    // Update conversation list preview
    const updatedConvs = conversations.map((c) => {
      if (c.id === selectedConversation.id) {
        const updated = { ...c, lastMessage: text, time: newMsg.time };
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
                <Megaphone size={20} className="cursor-pointer hover:opacity-80 transition" />
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
                      <div className={`max-w-[75%] px-4 py-2 ${isMe ? 'bg-[#2252D6] text-white rounded-2xl rounded-tr-md' : (isDarkMode ? 'bg-[#3A3B3C] text-white rounded-2xl rounded-tl-md' : 'bg-neutral-100 text-neutral-900 rounded-2xl rounded-tl-md')}`}>
                        <p className="text-[14.5px] leading-relaxed">{msg.text}</p>
                      </div>
                      {isMe && i === messages.length - 1 && (
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'border-[#4E4F50]' : 'border-[#2252D6]'}`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-[#B0B3B8]' : 'bg-[#2252D6]'}`} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-3 border-t pb-safe relative z-20 ${isDarkMode ? 'bg-[#242526] border-[#3A3B3C]' : 'bg-white border-neutral-100'}`}>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-full transition text-[#2252D6] ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
                  <MoreHorizontal size={20} />
                </button>
                <form onSubmit={handleSendMessage} className={`flex-1 flex items-center rounded-full px-3 py-1.5 focus-within:ring-2 ring-[#2252D6]/20 transition-all border ${isDarkMode ? 'bg-[#3A3B3C] border-transparent' : 'bg-neutral-100 border-neutral-300'}`}>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Message"
                    className={`flex-1 bg-transparent border-none outline-none text-[15px] focus:ring-0 py-1 px-1 min-w-0 ${isDarkMode ? 'text-white placeholder-[#B0B3B8]' : 'text-neutral-800 placeholder-neutral-500'}`}
                  />
                  <button type="button" className={`p-1 ml-1 rounded-full transition flex-shrink-0 text-[#2252D6] ${isDarkMode ? 'hover:bg-[#4E4F50]' : 'hover:bg-neutral-200'}`}>
                    <Smile size={20} />
                  </button>
                </form>
                {messageInput.trim() ? (
                  <button onClick={handleSendMessage} className={`p-2 rounded-full transition flex-shrink-0 text-[#2252D6] ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
                    <Send size={20} />
                  </button>
                ) : (
                  <button className={`p-2 rounded-full transition flex-shrink-0 text-[#2252D6] ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
                    <Mic size={20} />
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
    </div>
  );
}
