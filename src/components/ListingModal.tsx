import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfToday,
  startOfDay,
  getMonth,
  getYear,
  getDate,
  getDaysInMonth,
  setMonth as setDateMonth,
  setYear as setDateYear,
  setDate as setDateDay,
  isSameDay,
  isBefore
} from 'date-fns';
import { cn } from '../lib/utils';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (date: Date) => void;
}

const WheelPicker = ({ 
  items, 
  value, 
  onChange,
  label
}: { 
  items: string[] | number[], 
  value: string | number, 
  onChange: (val: any) => void,
  label: string
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [itemHeight, setItemHeight] = React.useState(40);

  React.useEffect(() => {
    const updateHeight = () => {
      setItemHeight(window.innerWidth >= 768 ? 56 : 40);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  React.useEffect(() => {
    const index = (items as any[]).indexOf(value);
    if (index !== -1 && containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [value, items, itemHeight]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPos = containerRef.current.scrollTop;
    const index = Math.round(scrollPos / itemHeight);
    if (items[index] !== undefined && items[index] !== value) {
      onChange(items[index]);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3 md:mb-5">{label}</span>
      <div className={cn(
        "relative w-full overflow-hidden transition-all duration-300",
        "h-[120px] md:h-[180px]"
      )}>
        {/* Selection Mask */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y border-neutral-100 pointer-events-none z-10 bg-neutral-100/20 h-[40px] md:h-[56px]" />
        
        {/* Edge Gradients */}
        <div className="absolute top-0 left-0 right-0 h-[30px] md:h-[50px] bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[30px] md:h-[50px] bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className={cn(
            "h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory no-scrollbar",
            "pb-[80px] pt-[40px] md:pb-[124px] md:pt-[62px]"
          )}
        >
          {items.map((item, i) => (
            <div 
              key={i}
              style={{ height: `${itemHeight}px` }}
              className={cn(
                "flex items-center justify-center snap-center transition-all duration-200",
                item === value 
                  ? "text-[#17294F] font-black text-base md:text-2xl" 
                  : "text-neutral-300 font-bold text-xs md:text-sm scale-90"
              )}
            >
              {typeof item === 'number' && item < 10 ? `0${item}` : item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ListingModal: React.FC<ListingModalProps> = ({ 
  isOpen, 
  onClose, 
  startDate, 
  onSelect 
}) => {
  const [tempDate, setTempDate] = React.useState<Date>(startDate || new Date());

  React.useEffect(() => {
    if (startDate) {
      setTempDate(startDate);
    }
  }, [startDate]);

  if (!isOpen) return null;

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysInMonth = getDaysInMonth(tempDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (year: number) => {
    setTempDate(setDateYear(tempDate, year));
  };

  const handleMonthChange = (monthName: string) => {
    const monthIndex = months.indexOf(monthName);
    setTempDate(setDateMonth(tempDate, monthIndex));
  };

  const handleDayChange = (day: number) => {
    setTempDate(setDateDay(tempDate, day));
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative bg-white w-full max-w-[400px] md:max-w-[540px] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden p-6 md:p-12"
        >
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-4xl font-extrabold font-display text-[#17294F]">Select Move-in</h2>
              <p className="text-sm md:text-base text-neutral-500 mt-0.5 md:mt-2">Select your planned move-in date</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 md:p-3.5 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-10">
            <div className="flex flex-col gap-5 md:gap-8">
              <div className="border border-neutral-200 rounded-2xl md:rounded-3xl p-3.5 md:p-6 bg-neutral-50">
                <div className="px-3 md:px-4">
                  <div className="text-[9px] md:text-[11px] font-extrabold uppercase tracking-widest text-[#17294F] mb-0.5 md:mb-1">Move-in Date</div>
                  <div className="font-bold text-neutral-800 text-sm md:text-xl">
                    {format(tempDate, 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-100 p-4">
                <div className="flex gap-2">
                  <WheelPicker 
                    label="Month"
                    items={months} 
                    value={months[getMonth(tempDate)]} 
                    onChange={handleMonthChange} 
                  />
                  <WheelPicker 
                    label="Day"
                    items={days} 
                    value={getDate(tempDate)} 
                    onChange={handleDayChange} 
                  />
                  <WheelPicker 
                    label="Year"
                    items={years} 
                    value={getYear(tempDate)} 
                    onChange={handleYearChange} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-12 flex gap-3 md:gap-5">
            <button 
              onClick={() => setTempDate(new Date())}
              className="flex-1 py-3 md:py-5 text-sm md:text-base text-neutral-500 font-bold hover:bg-neutral-50 rounded-xl md:rounded-2xl transition"
            >
              Today
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-[2] py-3 md:py-5 bg-[#17294F] text-white text-sm md:text-lg font-bold rounded-xl md:rounded-2xl shadow-lg shadow-indigo-100 hover:bg-[#1e3566] transition"
            >
              Confirm Move-in
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
