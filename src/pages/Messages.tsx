import React, { useState } from 'react';
import { Search, Edit, MoreHorizontal, Phone, Video, Info, ChevronLeft, ArrowLeft, Send, Image as ImageIcon, Smile, Mic, Moon, Sun, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from '../mocks/messages';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<typeof DUMMY_CONVERSATIONS[0] | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const filterOptions = ['All', 'Landlord', 'Friends', 'Admin'];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: messageInput,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setMessageInput('');
  };

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans pt-0 pb-0 ${isDarkMode ? 'bg-[#242526] text-white' : 'bg-white text-neutral-900'}`}>
      
      {/* MOBILE: When a conversation is selected, hide the sidebar. DESKTOP: Sidebar always visible */}
      <div className={`md:w-[360px] lg:w-[400px] flex-shrink-0 flex flex-col border-r ${isDarkMode ? 'border-[#3A3B3C]' : 'border-neutral-100'} ${selectedConversation ? 'hidden md:flex' : 'w-full flex'}`}>
        
        {/* Sidebar Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-transparent">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate(-1)}
              className={`p-2 -ml-2 rounded-full transition ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#000000]'}`}>Chats</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition ${isDarkMode ? 'bg-[#3A3B3C] text-white hover:bg-[#4E4F50]' : 'bg-neutral-100 text-[#000000] hover:bg-neutral-200'}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 pt-1">
          <div className={`rounded-full flex items-center px-4 py-2 transition ${isDarkMode ? 'bg-[#3A3B3C] hover:bg-[#4E4F50]' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
            <Search size={18} className={`mr-2 flex-shrink-0 ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`} />
            <input 
              type="text" 
              placeholder="Search" 
              className={`bg-transparent border-none outline-none w-full text-sm font-medium focus:ring-0 p-0 ${isDarkMode ? 'placeholder-[#B0B3B8] text-white' : 'placeholder-neutral-500 text-neutral-800'}`}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 pt-1 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filterOptions.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-[#000000] text-white'
                  : isDarkMode 
                    ? 'bg-[#3A3B3C] text-white hover:bg-[#4E4F50]' 
                    : 'bg-neutral-100 text-[#000000] hover:bg-neutral-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 pb-24">
          {DUMMY_CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full flex items-center p-2 rounded-xl transition gap-3 ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-50'} ${selectedConversation?.id === conv.id ? (isDarkMode ? 'md:bg-[#3A3B3C]' : 'md:bg-neutral-100') : ''}`}
            >
              <div className="relative flex-shrink-0">
                <img src={conv.avatar} alt={conv.name} className={`w-14 h-14 rounded-full object-cover ${isDarkMode ? 'bg-[#3A3B3C]' : 'bg-neutral-200'}`} />
                {conv.online && (
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full ${isDarkMode ? 'border-[#242526]' : 'border-white'}`}></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-[15px] truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{conv.name}</h3>
                  <span className={`text-xs ml-2 flex-shrink-0 ${conv.unread > 0 ? (isDarkMode ? 'font-semibold text-white' : 'font-semibold text-[#17294F]') : (isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500')}`}>{conv.time}</span>
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
          ))}
        </div>
        
        {/* We removed BottomNav from the list view */}
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-[#242526]' : 'bg-white'} ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className={`h-16 flex items-center justify-between px-4 mt-2 sm:mt-0 border-b flex-shrink-0 shadow-sm z-10 ${isDarkMode ? 'border-[#3A3B3C]' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className={`p-2 -ml-2 rounded-full transition md:hidden ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="relative">
                  <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full object-cover" />
                  {selectedConversation.online && (
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${isDarkMode ? 'border-[#242526]' : 'border-white'}`}></div>
                  )}
                </div>
                <div>
                  <h2 className={`font-semibold leading-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{selectedConversation.name}</h2>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`}>
                    {selectedConversation.online ? 'Active now' : 'Active ' + selectedConversation.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-[#2252D6] gap-4 sm:gap-6">
                <Megaphone size={20} className="cursor-pointer hover:opacity-80 transition" />
                <Phone size={20} className="cursor-pointer hover:opacity-80 transition" />
                <Video size={24} className="cursor-pointer hover:opacity-80 transition" />
              </div>
            </div>

            {/* Chat Messages */}
            <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${isDarkMode ? 'bg-[#242526]' : 'bg-white'}`}>
              {/* Added a subtle top padding in the chat content to push the first chat bubble down slightly */}
              <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20">
                     <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full rounded-full object-cover" />
                     {selectedConversation.online && (
                       <div className={`absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 rounded-full ${isDarkMode ? 'border-[#242526]' : 'border-white'}`}></div>
                     )}
                  </div>
              </div>
              <div className="text-center mb-6">
                 <h2 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{selectedConversation.name}</h2>
                 <p className={`text-sm ${isDarkMode ? 'text-[#B0B3B8]' : 'text-neutral-500'}`}>Property Owner on Khubo</p>
                 <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#8C939D]' : 'text-neutral-400'}`}>You connected {selectedConversation.time}</p>
              </div>

              {messages.map((msg, i) => {
                const isMe = msg.sender === 'me';
                const showAvatar = !isMe && (i === messages.length - 1 || messages[i + 1].sender === 'me');
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

                    {isMe && (
                      <div className="w-4 h-4 text-neutral-300 flex items-center justify-center">
                        {i === messages.length - 1 && (
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isDarkMode ? 'border-[#4E4F50]' : 'border-[#2252D6]'}`}>
                             <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-[#B0B3B8]' : 'bg-[#2252D6]'}`}></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Message Input - Bottom */}
            <div className={`p-3 border-t pb-safe relative z-20 ${isDarkMode ? 'bg-[#242526] border-[#3A3B3C]' : 'bg-white border-neutral-100'}`}>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-full transition text-[#2252D6] ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
                  <MoreHorizontal size={20} />
                </button>
                <button className={`p-2 rounded-full lg:hidden hidden sm:block transition text-[#2252D6] ${isDarkMode ? 'hover:bg-[#3A3B3C]' : 'hover:bg-neutral-100'}`}>
                  <ImageIcon size={20} />
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
