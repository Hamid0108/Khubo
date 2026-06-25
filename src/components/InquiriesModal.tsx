// @context: Inquiries modal — list of property inquiries from potential tenants
// @purpose: Shows DUMMY_INQUIRIES with status, contact info, property reference, and reply action
// @behavior: Tab-based filtering (All/Unread/Replied); status badges with color coding
// @behavior: "Reply via Khubo" button placeholder; "View Property" link to navigate
// @dependencies: motion, lucide-react, react-router-dom (useNavigate)
// @known-issues: All data is static mock; reply button has no actual action

import React, { useState } from 'react';

import { X, Home } from 'lucide-react';

interface InquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DUMMY_INQUIRIES = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+63 912 345 6789',
    property: 'Coastal Villa',
    type: 'Viewing Request',
    status: 'Unread',
    date: '2 hours ago',
    message: 'Hello, I am interested in viewing the Coastal Villa this weekend. Let me know if possible.',
  },
  {
    id: 2,
    name: 'Michael Chang',
    email: 'm.chang@example.com',
    phone: '+63 987 654 3210',
    property: 'Urban Loft Apartment',
    type: 'Question',
    status: 'Unread',
    date: '5 hours ago',
    message: 'Are pets allowed in the Urban Loft? I have a small dog.',
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '+63 911 222 3333',
    property: 'Cozy Studio',
    type: 'Application',
    status: 'Responded',
    date: 'Yesterday',
    message: 'I have submitted my application for the Cozy Studio. Please review.',
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '+63 999 888 7777',
    property: 'Modern Condo',
    type: 'Maintenance',
    status: 'Read',
    date: '2 days ago',
    message: 'The AC unit in my room (305) is making some weird noises. Can someone check it out?',
  },
];

export function InquiriesModal({ isOpen, onClose }: InquiriesModalProps) {
  const [filter, setFilter] = useState<string>('All');

  if (!isOpen) return null;

  const filters = ['All', 'Unread', 'Responded'];
  
  const filteredInquiries = DUMMY_INQUIRIES.filter(inquiry => {
    if (filter === 'All') return true;
    return inquiry.status === filter;
  });

  const handleInquiryClick = () => {
    onClose();
  };

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Inquiries</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
              >
                <X size={20} />
              </button>
          </div>

          <div className="flex flex-col p-6 flex-1 overflow-hidden h-full gap-4">
            {/* Top Filters */}
            <div className="flex flex-wrap gap-2 mb-2 shrink-0">
              {filters.map((f) => {
                const count = f === 'All' 
                  ? DUMMY_INQUIRIES.length 
                  : DUMMY_INQUIRIES.filter(i => i.status === f).length;
                
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`relative flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                      filter === f 
                        ? 'bg-neutral-900 text-white' 
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {f}
                    {count > 0 && f === 'Unread' && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white border-2 border-white min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold px-1">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto w-full">
              <div className="flex flex-col">
                {filteredInquiries.map((inquiry, index) => (
                  <div 
                    key={inquiry.id}
                    onClick={handleInquiryClick}
                    className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:bg-neutral-50 cursor-pointer transition-colors ${
                      index !== filteredInquiries.length - 1 ? 'border-b border-neutral-100' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg truncate ${inquiry.status === 'Unread' ? 'font-black text-[#17294F]' : 'font-bold text-[#17294F]'}`}>
                          {inquiry.name}
                        </h3>
                        {inquiry.status === 'Unread' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm truncate ${inquiry.status === 'Unread' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                        {inquiry.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-neutral-200 text-neutral-600 text-xs font-bold">
                        <Home size={12} className="text-[#17294F]" />
                        <span className="hidden sm:inline">{inquiry.property}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredInquiries.length === 0 && (
                  <div className="p-12 text-center text-neutral-400 font-medium">
                    No inquiries found for this filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
