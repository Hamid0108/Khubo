import { useListing } from '../hooks/useListing';
import { useToast } from '../components/ToastProvider';
import { X, Star, ShieldCheck, MapPin, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft, Coffee, Utensils, Wifi, Tv, ArrowDownUp, Briefcase, Car, Fence, Refrigerator, Microwave, Cctv, Search, Layers, Navigation, Home, Maximize, Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ListingModal } from '../components/ListingModal';
import { PhotoCarouselOverlay } from '../components/PhotoCarouselOverlay';
import MapTilerView from '../components/MapTilerView';
import Footer from '../components/Footer';
import HostProfile from '../components/HostProfile';
import ReviewBreakdown from '../components/ReviewBreakdown';
import { format, 
  isSameDay, 
  isBefore,
  startOfToday,
  startOfDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  eachDayOfInterval,
  isWithinInterval,
} from 'date-fns';
import { AuthModal } from '../components/AuthModal';
import ListingDetailSkeleton from '../components/ListingDetailSkeleton';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Calendar = ({ 
  startDate, 
  endDate, 
  onSelect 
}: { 
  startDate: Date | null, 
  endDate: Date | null, 
  onSelect: (date: Date) => void 
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <h3 className="font-bold text-[#17294F] text-[10px] uppercase tracking-tight">{format(currentMonth, 'MMM yyyy')}</h3>
        <div className="flex gap-0.5">
          <button 
            onClick={prevMonth}
            className="p-0.5 hover:bg-neutral-100 rounded-full transition-colors group"
          >
            <ChevronLeft size={12} className="text-neutral-500 group-hover:text-neutral-900" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-0.5 hover:bg-neutral-100 rounded-full transition-colors group"
          >
            <ChevronRight size={12} className="text-neutral-500 group-hover:text-neutral-900" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-0 text-[8px]">
        {weekDays.map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-center font-black text-neutral-400 pb-0.5 uppercase tracking-widest">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelectedStart = startDate && isSameDay(day, startDate);
          const isSelectedEnd = endDate && isSameDay(day, endDate);
          const isSelected = isSelectedStart || isSelectedEnd;
          
          let isInRange = false;
          if (startDate && endDate) {
            isInRange = isWithinInterval(day, { start: startDate, end: endDate });
          } else if (startDate && hoveredDate && !isBefore(hoveredDate, startDate)) {
            isInRange = isWithinInterval(day, { start: startDate, end: hoveredDate });
          }

          const isPast = isBefore(startOfDay(day), startOfDay(today));
          const isToday = isSameDay(day, today);
          const isDifferentMonth = !isSameMonth(day, currentMonth);

          return (
            <div 
              key={day.toISOString()}
              onMouseEnter={() => !isPast && setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              onClick={() => !isPast && onSelect(day)}
              className={cn(
                "relative h-6 flex items-center justify-center transition-all duration-200",
                isPast ? "cursor-not-allowed" : "cursor-pointer group",
                isDifferentMonth && !isInRange && "opacity-25",
                isInRange && "bg-blue-50/50",
                isSelectedStart && "rounded-l-full",
                isSelectedEnd && "rounded-r-full",
                idx % 7 === 0 && isInRange && "rounded-l-full",
                idx % 7 === 6 && isInRange && "rounded-r-full"
              )}
            >
              {isSelected && (
                <motion.div 
                   layoutId="calendar-selection"
                   className="absolute inset-0 bg-[#17294F] rounded-full z-0" 
                />
              )}
              {isToday && !isSelected && (
                 <div className="absolute inset-0 bg-[#17294F] rounded-full z-0" />
              )}
              <span className={cn(
                "relative z-10 text-[9px] font-bold",
                (isSelected || isToday) ? "text-white" : "text-neutral-700",
                isPast && "text-neutral-300 font-normal"
              )}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listing, loading } = useListing(id);
  const { showToast } = useToast();
  const { user } = useAuth(); // Retrieve mock user from auth

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = localStorage.getItem('khubo_saved_listings');
      const ids = saved ? JSON.parse(saved) : [];
      return id ? ids.includes(id) : false;
    } catch {
      return false;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulated auth state

  // Aligned States for Room Selection, Booking modal, and Information Tabs
  const [selectedRoom, setSelectedRoom] = useState<'room1' | 'room2'>('room1');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'rules' | 'terms' | 'schedule'>('rules');

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
           <h1 className="text-2xl font-bold">Listing not found</h1>
           <button 
             onClick={() => navigate('/')}
             className="mt-4 text-[#17294F] font-semibold underline"
           >
             Go back home
           </button>
        </div>
      </div>
    );
  }

  const handleDateSelect = (date: Date) => {
    setStartDate(date);
  };

  const fallbackImages = [
    'https://images.unsplash.com/photo-1555819485-99aaa4aee26b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'
  ];

  const actualImages = listing.gallery?.length > 0 ? listing.gallery : [listing.image];
  const images = actualImages.length < 5 
    ? [...actualImages, ...fallbackImages.slice(0, 5 - actualImages.length)] 
    : actualImages;

  const openGallery = (index: number = 0) => {
    setInitialGalleryIndex(index);
    setIsPhotoGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const defaultHost = {
    name: 'Khubo Resident',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    reviews: 12,
    rating: 4.95,
    hostingDuration: '3 months',
    work: 'Property Management',
    location: 'Iligan City, Philippines',
    tenantCount: 15
  };
  const displayHost = listing.host || defaultHost;

  return (
    <div className="min-h-screen bg-neutral-50 md:bg-white pb-32 text-neutral-900">
      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-neutral-100 p-2 pr-4 -ml-2 rounded-full transition text-neutral-900"
          >
            <ArrowLeft size={24} />
            <span className="font-semibold text-sm hidden sm:block">Back</span>
          </button>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>

      {/* Mobile Floating Buttons */}
      <div className="md:hidden fixed top-6 left-6 right-6 z-50 flex justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg pointer-events-auto active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} className="text-neutral-900" />
        </button>
      </div>

      {/* Mobile Header Image */}
      <div className="md:hidden relative h-[55vh] w-full overflow-hidden">
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          src={images[currentIndex]}
          className="w-full h-full object-cover cursor-zoom-in"
          alt={listing.title}
          referrerPolicy="no-referrer"
          onClick={() => openGallery(currentIndex)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10 pointer-events-none" />
        
        {/* Mobile Image Indicator */}
        <div className="absolute bottom-14 right-6 z-20">
          <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      <main className={cn(
        "max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-0 pb-24 md:pb-12",
        "relative md:static mt-0"
      )}>
        <div className="px-4 sm:px-0">
        
        {/* Desktop Gallery Grid */}
        <div className="hidden md:block relative group mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-sm">
            {/* Main Big Image */}
            <div 
              onClick={() => openGallery(0)}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-neutral-100 cursor-zoom-in"
            >
              <img
                src={images[0]}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                alt={`${listing.title} - main`}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Smaller Images */}
            {images.slice(1, 5).map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => openGallery(idx + 1)}
                className="hidden md:block relative overflow-hidden bg-neutral-100 cursor-zoom-in group-hover:first:opacity-100"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  alt={`${listing.title} - gallery ${idx + 1}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          <button 
             onClick={() => openGallery(0)}
             className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm border border-neutral-300 px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm transition hover:bg-white hover:border-neutral-400 active:scale-95"
          >
            Show all photos
          </button>
        </div>

        {/* Desktop Title Bar - Now below images */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2 pt-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-900 tracking-tight leading-tight">{listing.title}</h1>
          <div className="hidden md:flex items-center shrink-0">
            <button 
              onClick={() => {
                try {
                  const saved = localStorage.getItem('khubo_saved_listings');
                  let ids = saved ? JSON.parse(saved) : [];
                  if (ids.includes(id)) {
                    ids = ids.filter((x: string) => x !== id);
                    setIsSaved(false);
                    showToast('Removed from wishlist!');
                  } else {
                    ids.push(id);
                    setIsSaved(true);
                    showToast('Listing saved to your wishlist!');
                  }
                  localStorage.setItem('khubo_saved_listings', JSON.stringify(ids));
                } catch (err) {
                  console.error(err);
                }
              }}
              className="flex items-center gap-2 hover:bg-neutral-100 px-4 py-2 rounded-xl transition-colors font-semibold underline decoration-transparent hover:decoration-neutral-900 underline-offset-4"
            >
              <Heart 
                size={20} 
                className={cn(isSaved ? "fill-[#FF385C] text-[#FF385C]" : "text-neutral-900")} 
              />
              <span className="text-base">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-32">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center pb-8 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-medium text-neutral-500 mb-0 px-0.5">Entire home in {listing.location}</h2>
              </div>
            </div>

            {/* Available Rooms Section */}
            <div className="py-8 border-b border-gray-100 text-left">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Available Rooms</h3>
              <p className="text-neutral-500 text-xs mb-6 font-semibold uppercase tracking-wider">Select a layout to configure lease pricing</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedRoom('room1')}
                  className={cn(
                    "border-2 rounded-2xl p-5 flex flex-col gap-2 transition-all text-left cursor-pointer",
                    selectedRoom === 'room1' 
                      ? "border-[#17294F] bg-blue-50/10 shadow-md ring-2 ring-[#17294F]/10" 
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-neutral-950 text-sm">Room 1 (Single Bed)</span>
                    <span className="bg-[#17294F] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Best Value</span>
                  </div>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed mt-1">Single bed space. Includes shared study desk, locker, and shared bathroom access.</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-lg font-black text-neutral-950">₱{listing.price.toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">/month</span>
                  </div>
                </button>
                <button 
                  onClick={() => setSelectedRoom('room2')}
                  className={cn(
                    "border-2 rounded-2xl p-5 flex flex-col gap-2 transition-all text-left cursor-pointer",
                    selectedRoom === 'room2' 
                      ? "border-[#17294F] bg-blue-50/10 shadow-md ring-2 ring-[#17294F]/10" 
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-neutral-950 text-sm">Room 2 (Double Bed)</span>
                    <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Spacious</span>
                  </div>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed mt-1">Queen/Double bed space. Study desk, private wardrobe, and private balcony.</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-lg font-black text-neutral-950">₱{Math.round(listing.price * 1.25).toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">/month</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="py-10 border-b border-gray-100">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-6">About this place</h3>
              <p className="text-neutral-700 leading-relaxed text-lg whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <div className="py-12 border-b border-gray-100">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-8">What this place offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Utensils size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Kitchen</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Wifi size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Wifi</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Tv size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">TV</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <ArrowDownUp size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Elevator</span>
                </div>
                <div className={cn("items-center gap-4", showAllAmenities ? "flex" : "hidden")}>
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Fence size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Private patio or balcony</span>
                </div>
                <div className={cn("items-center gap-4", showAllAmenities ? "flex" : "hidden")}>
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Briefcase size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Luggage dropoff allowed</span>
                </div>
                <div className={cn("items-center gap-4", showAllAmenities ? "flex" : "hidden")}>
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Refrigerator size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Refrigerator</span>
                </div>
                <div className={cn("items-center gap-4", showAllAmenities ? "flex" : "hidden")}>
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Microwave size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Microwave</span>
                </div>
                <div className={cn("items-center gap-4", showAllAmenities ? "flex" : "hidden")}>
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Car size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Paid parking off premises</span>
                </div>
                <div className={cn("items-center gap-4", showAllAmenities ? "flex" : "hidden")}>
                  <div className="w-11 h-11 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-md">
                    <Cctv size={20} strokeWidth={2} className="text-white" />
                  </div>
                  <span className="text-[16px] text-neutral-800 font-medium">Exterior security cameras on property</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="px-6 py-3 border-2 border-[#17294F] text-[#17294F] rounded-xl font-bold hover:bg-[#17294F]/5 transition active:scale-95 inline-block"
              >
                {showAllAmenities ? 'Show less' : 'Show all 28 amenities'}
              </button>
            </div>

            {/* Tabbed Property Information */}
            <div className="py-10 border-b border-gray-100 text-left">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-6">Property Terms & Information</h3>
              
              {/* Tabs header */}
              <div className="flex border-b border-neutral-200 mb-6 gap-6 text-[10px] font-black uppercase tracking-wider text-neutral-400 select-none overflow-x-auto no-scrollbar">
                {[
                  { id: 'rules', label: 'Rules & Regulations' },
                  { id: 'terms', label: 'Lease Terms (T&C)' },
                  { id: 'schedule', label: 'Visitation Schedule' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveInfoTab(t.id as any)}
                    className={cn(
                      "pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap",
                      activeInfoTab === t.id 
                        ? "border-[#17294F] text-[#17294F] font-black" 
                        : "border-transparent hover:text-neutral-700"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 leading-relaxed text-sm text-neutral-700 font-medium">
                {activeInfoTab === 'rules' && (
                  <ul className="list-disc list-inside space-y-2.5">
                    <li><span className="font-bold text-neutral-900">Quiet Hours</span>: Quiet environment observed from 10:00 PM to 6:00 AM.</li>
                    <li><span className="font-bold text-neutral-900">Guest Policy</span>: Day visitors allowed until 9:00 PM. Overnight guests require host notification.</li>
                    <li><span className="font-bold text-neutral-900">Smoking & Alcohol</span>: Prohibited inside bedrooms or common lounges.</li>
                    <li><span className="font-bold text-neutral-900">Pets</span>: Allowed only after review and subject to additional deposit.</li>
                  </ul>
                )}
                {activeInfoTab === 'terms' && (
                  <div className="space-y-3">
                    <p><span className="font-bold text-neutral-900">Deposit Requirement</span>: 1-month security deposit is required, refundable upon lease termination.</p>
                    <p><span className="font-bold text-neutral-900">Advance Rent</span>: 1-month advance rent to be settled before moving in.</p>
                    <p><span className="font-bold text-neutral-900">Minimum Term</span>: Standard lease agreements span a minimum contract period of 6 months.</p>
                    <p><span className="font-bold text-neutral-900">Utilities</span>: Wi-Fi and water are included. Power bills based on private submeter readings.</p>
                  </div>
                )}
                {activeInfoTab === 'schedule' && (
                  <div className="space-y-3">
                    <p><span className="font-bold text-neutral-900">Visitation & Tours</span>: Tours scheduled Wednesdays and Saturdays from 1:00 PM to 5:00 PM.</p>
                    <p><span className="font-bold text-neutral-900">Garbage Disposal</span>: Pickup schedule is scheduled every Tuesday and Friday at 7:30 AM.</p>
                    <p><span className="font-bold text-neutral-900">Maintenance</span>: General corridor cleaning is scheduled alternate Sunday mornings.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="py-10">
               <div className="flex items-center gap-3 mb-8">
                  <Star size={24} className="fill-amber-400 text-amber-400" />
                  <h3 className="text-2xl font-semibold text-neutral-900">{listing.rating.toFixed(2)} · {listing.reviews.length} reviews</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {listing.reviews.map((rev, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                       <div className="flex items-center gap-4">
                          <img src={rev.userImage} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt={rev.userName} />
                          <div>
                             <div className="font-semibold">{rev.userName}</div>
                             <div className="text-neutral-500 text-sm">{rev.date}</div>
                          </div>
                       </div>
                       <p className="text-neutral-700 leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="py-12 border-t border-gray-100 flex flex-col gap-8 mt-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-full bg-[#17294F] flex items-center justify-center shrink-0 shadow-lg">
                  <MapPin size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">{listing.location}</h3>
                  <p className="text-neutral-500 max-w-lg mt-1">8.2280° N, 124.2452° E</p>
                </div>
              </div>

              {/* Map View */}
              <div 
                className="w-full h-[540px] relative group cursor-pointer"
                onClick={() => setIsMapModalOpen(true)}
              >
                <div className="absolute inset-0 z-20 group-hover:bg-black/5 transition-colors rounded-3xl" />
                <MapTilerView 
                  lat={8.2280} 
                  lng={124.2452} 
                  title={listing.title} 
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                  <div className="bg-[#17294F] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/20 backdrop-blur-md">
                    <Maximize size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Click to Expand</span>
                  </div>
                </div>
              </div>
            </div>

            <HostProfile 
              name={displayHost.name}
              image={displayHost.image}
              reviews={displayHost.reviews}
              rating={displayHost.rating}
              hostingDuration={displayHost.hostingDuration}
              work={displayHost.work}
              location={displayHost.location}
              tenantCount={displayHost.tenantCount || defaultHost.tenantCount}
              onMessageClick={async () => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  const moveInText = startDate ? ` starting on ${format(startDate, 'MMMM d, yyyy')}` : '';
                  const roomText = selectedRoom === 'room1' ? 'Room 1 (Single Bed)' : 'Room 2 (Double Bed)';
                  const prefilledText = `Hi ${displayHost.name}! I am interested in inquiring about "${listing.title}" (${roomText})${moveInText}. Is it available for visitation?`;
                  
                  const landlordId = listing.landlord_id;
                  const isUUID = landlordId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(landlordId);

                  if (user && isUUID) {
                    showToast('Initiating conversation with host...');
                    let targetId: string | null = null;
                    try {
                      const { data: existingConvs } = await supabase
                        .from('conversations')
                        .select('*')
                        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

                      const existing = existingConvs?.find(
                        c => (c.sender_id === user.id && c.receiver_id === landlordId) ||
                             (c.sender_id === landlordId && c.receiver_id === user.id)
                      );

                      if (existing) {
                        targetId = existing.id;
                        await supabase.from('messages').insert({
                          conversation_id: existing.id,
                          sender_id: user.id,
                          text: prefilledText
                        });
                        await supabase
                          .from('conversations')
                          .update({
                            last_message: prefilledText,
                            last_message_time: new Date().toISOString()
                          })
                          .eq('id', existing.id);
                      } else {
                        // Fetch landlord profile
                        const { data: landlordProfile } = await supabase
                          .from('profiles')
                          .select('full_name, nickname')
                          .eq('id', landlordId)
                          .single();
                        
                        const receiverName = landlordProfile?.full_name || landlordProfile?.nickname || displayHost.name || 'Landlord';

                        // Fetch user profile
                        const { data: myProfile } = await supabase
                          .from('profiles')
                          .select('full_name, nickname')
                          .eq('id', user.id)
                          .single();

                        const senderName = myProfile?.full_name || myProfile?.nickname || user.email?.split('@')[0] || 'User';

                        const { data: newConv } = await supabase
                          .from('conversations')
                          .insert({
                            sender_id: user.id,
                            receiver_id: landlordId,
                            sender_name: senderName,
                            receiver_name: receiverName,
                            last_message: prefilledText,
                            last_message_time: new Date().toISOString()
                          })
                          .select()
                          .single();

                        if (newConv) {
                          targetId = newConv.id;
                          await supabase.from('messages').insert({
                            conversation_id: newConv.id,
                            sender_id: user.id,
                            text: prefilledText
                          });
                        }
                      }
                    } catch (err) {
                      console.error('Supabase chat initiation error:', err);
                    } finally {
                      if (targetId) {
                        navigate(`/messages?id=${targetId}`);
                      } else {
                        navigate('/messages');
                      }
                    }
                  } else {
                    const hostId = `host_${listing.id}`;
                    const newChat = {
                      id: hostId,
                      name: displayHost.name,
                      avatar: displayHost.image,
                      lastMessage: prefilledText,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      unread: 0,
                      online: true,
                      role: 'Landlord'
                    };
                    
                    const chatsStr = localStorage.getItem('khubo_conversations');
                    const chats = chatsStr ? JSON.parse(chatsStr) : [];
                    
                    if (!chats.some((c: any) => c.id === hostId)) {
                      localStorage.setItem('khubo_conversations', JSON.stringify([newChat, ...chats]));
                    }
                    
                    const newMsg = {
                      id: Date.now().toString(),
                      text: prefilledText,
                      sender: 'me',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    localStorage.setItem(`khubo_messages_${hostId}`, JSON.stringify([newMsg]));
                    
                    showToast('Initiating conversation with host...');
                    setTimeout(() => {
                      navigate(`/messages?id=${hostId}`);
                    }, 1000);
                  }
                }
              }}
            />
            <ReviewBreakdown 
              rating={listing.rating}
              totalReviews={listing.reviews.length}
              breakdown={{
                cleanliness: 5.0,
                accuracy: 5.0,
                checkIn: 5.0,
                communication: 5.0,
                location: 5.0,
                value: 4.9
              }}
            />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[100px] border border-gray-200 rounded-[2.5rem] py-8 px-8 shadow-2xl flex flex-col gap-5 bg-white max-h-[calc(100vh-120px)] overflow-hidden">
              <div className="flex justify-between items-center bg-neutral-50 px-5 py-3 rounded-[2rem] border border-neutral-100 flex-shrink-0">
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-black text-[#17294F]">₱{(selectedRoom === 'room1' ? listing.price : Math.round(listing.price * 1.25)).toLocaleString()}</span>
                   <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-tight">/month</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-800">
                   <Star size={12} className="fill-amber-400 text-amber-400" />
                   <span>{listing.rating.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-0.5 min-h-0">
                <div className="mt-0">
                  <div className="mb-2.5 flex items-center justify-between px-1">
                    <h4 className="text-[11px] font-black text-[#17294F] uppercase tracking-widest leading-none">Move-in Date</h4>
                    {startDate && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  
                  {startDate ? (
                    <motion.div 
                      layoutId="selected-date-card"
                      onClick={() => setIsModalOpen(true)}
                      className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-neutral-100 cursor-pointer hover:border-[#17294F]/20 transition-all hover:bg-neutral-50/50 flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-[#17294F] rounded-2xl flex flex-col items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-md">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-80">{format(startDate, 'MMM')}</span>
                        <span className="text-xl font-black leading-none">{format(startDate, 'd')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-[#17294F]">{format(startDate, 'EEEE')}</span>
                        <span className="text-xs font-bold text-neutral-400">{format(startDate, 'yyyy')}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-white rounded-[1.5rem] p-3 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-neutral-100 cursor-pointer hover:border-[#17294F]/20 transition-all hover:bg-neutral-50/50 group relative"
                    >
                      <div className="pointer-events-none">
                        <Calendar 
                          startDate={startDate} 
                          endDate={null} 
                          onSelect={(date) => setStartDate(date)}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-[1.5rem]">
                         <div className="bg-[#17294F] text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                           Set Date
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      setIsAuthModalOpen(true);
                      return;
                    }
                    if (startDate) {
                      setIsBookingModalOpen(true);
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                  className="w-full py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 shadow-lg bg-[#17294F] text-white hover:shadow-xl hover:bg-[#1e3466] cursor-pointer animate-none"
                >
                  {startDate ? 'Reserve Now' : 'Check Availability'}
                </button>

                <div className="text-center text-[9px] font-bold text-neutral-400 uppercase tracking-tight">
                  No holding charges yet
                </div>

                {startDate && (
                  <div className="flex flex-col gap-2 pt-4 border-t border-neutral-100">
                     <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[10px] font-bold uppercase tracking-tight">Monthly Rent</span>
                        <span className="font-black text-neutral-950 text-[10px]">₱{(selectedRoom === 'room1' ? listing.price : Math.round(listing.price * 1.25)).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[10px] font-bold uppercase tracking-tight">Cleaning fee</span>
                        <span className="font-black text-neutral-950 text-[10px]">₱150</span>
                     </div>
                     <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[10px] font-bold uppercase tracking-tight">Service fee</span>
                        <span className="font-black text-neutral-950 text-[10px]">₱100</span>
                     </div>
                     <div className="pt-3 mt-1 border-t border-neutral-200 flex justify-between items-center text-[#17294F]">
                        <span className="text-[10px] font-black uppercase tracking-widest">Grand Total</span>
                        <span className="text-xl font-black">₱{((selectedRoom === 'room1' ? listing.price : Math.round(listing.price * 1.25)) + 150 + 100).toLocaleString()}</span>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* Persistent Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 z-[150] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3 max-w-md mx-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest bg-neutral-100 text-[#17294F] transition-all active:scale-95 border border-neutral-200"
          >
            {startDate ? format(startDate, 'MMM d') : 'Set Date'}
          </button>
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                setIsAuthModalOpen(true);
                return;
              }
              if (startDate) {
                setIsBookingModalOpen(true);
              } else {
                setIsModalOpen(true);
              }
            }}
            className="flex-1 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest bg-[#17294F] text-white shadow-lg shadow-blue-900/10 transition-all active:scale-95 cursor-pointer"
          >
            {startDate ? 'Reserve Now' : 'Check Availability'}
          </button>
        </div>
      </div>

      <ListingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startDate={startDate}
        endDate={null}
        onSelect={(date) => setStartDate(date)}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => {
          setIsAuthenticated(true);
        }}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        listing={listing}
        selectedRoom={selectedRoom}
        roomPrice={selectedRoom === 'room1' ? listing.price : Math.round(listing.price * 1.25)}
        startDate={startDate}
        onSelectDate={handleDateSelect}
      />

      <Footer />

      {/* Full-screen Map Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full h-full md:max-w-6xl md:max-h-[85vh] bg-white md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="absolute top-6 left-6 z-[600]">
                <button 
                  onClick={() => setIsMapModalOpen(false)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg pointer-events-auto active:scale-90 transition-transform"
                >
                  <ArrowLeft size={24} className="text-neutral-900" />
                </button>
              </div>

              <div className="flex-1 w-full h-full">
                <MapTilerView 
                  lat={8.2280} 
                  lng={124.2452} 
                  title={listing.title} 
                />
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[600] w-full px-6 flex justify-center">
                <div className="bg-neutral-900/60 backdrop-blur-xl rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 w-fit flex items-center gap-3.5 transition-all hover:scale-105 active:scale-95 cursor-default">
                  <div className="w-8 h-8 bg-[#2252D6] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <Navigation size={16} className="text-white fill-white/20" />
                  </div>
                  <div className="flex flex-col pr-2">
                    <h4 className="text-xs font-black text-white leading-tight">Pala-o, Iligan City</h4>
                    <p className="text-[8px] font-bold text-white/30 mt-0.5 uppercase tracking-wider">8.2280° N, 124.2452° E</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PhotoCarouselOverlay 
        isOpen={isPhotoGalleryOpen}
        images={images}
        initialIndex={initialGalleryIndex}
        onClose={() => setIsPhotoGalleryOpen(false)}
      />
    </div>
  );
}
