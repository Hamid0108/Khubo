import React, { useRef, useEffect, useState } from 'react';

interface DateScrollPickerProps {
  viewportHeight: number; // e.g. 156 or 180
  onDateChange?: (month: string, day: string, year: string) => void;
  onMonthClick?: (month: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = ['2025', '2026', '2027', '2028', '2029'];

export const DateScrollPicker: React.FC<DateScrollPickerProps> = ({
  viewportHeight,
  onDateChange,
  onMonthClick
}) => {
  // Set default initial selection to April 04, 2028 (matching original layout request)
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedDay, setSelectedDay] = useState('04');
  const [selectedYear, setSelectedYear] = useState('2028');

  // Scroll container refs
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Standard high precision target row sizing
  const itemHeight = isMobile ? 42 : 44;
  
  // To display exactly 3 rows (prev, selected, next) inside the viewportHeight:
  // We calculate the dynamic spacerHeight so that the active item is perfectly centered.
  const spacerHeight = (viewportHeight - itemHeight) / 2;

  // Use a Ref lock to block programmatic layout scrolls from triggering state updates
  const isInitializing = useRef(true);

  useEffect(() => {
    isInitializing.current = true;

    const scrollToCenter = (
      ref: React.RefObject<HTMLDivElement | null>,
      items: string[],
      targetValue: string
    ) => {
      const container = ref.current;
      if (!container) return;

      const index = items.indexOf(targetValue);
      if (index === -1) return;

      const targetScroll = index * itemHeight;
      container.scrollTop = targetScroll;
    };

    // Scroll to targets
    scrollToCenter(monthRef, MONTHS, selectedMonth);
    scrollToCenter(dayRef, DAYS, selectedDay);
    scrollToCenter(yearRef, YEARS, selectedYear);

    // Release lock only after the browser has layouted and completed initial scrolling events
    const timer = setTimeout(() => {
      isInitializing.current = false;
    }, 120);

    return () => clearTimeout(timer);
  }, [itemHeight, viewportHeight, selectedMonth, selectedDay, selectedYear]);

  // Handle Scroll to update selection state
  const handleScrollColumn = (
    ref: React.RefObject<HTMLDivElement | null>,
    items: string[],
    updateState: (val: string) => void,
    type: 'month' | 'day' | 'year'
  ) => {
    // Ignore updates during programmatic initial scrolling
    if (isInitializing.current) return;

    const container = ref.current;
    if (!container) return;

    const scrollPos = container.scrollTop;
    const index = Math.round(scrollPos / itemHeight);

    if (items[index] !== undefined) {
      const selectedValue = items[index];
      updateState(selectedValue);
      
      if (onDateChange) {
        const m = type === 'month' ? selectedValue : selectedMonth;
        const d = type === 'day' ? selectedValue : selectedDay;
        const y = type === 'year' ? selectedValue : selectedYear;
        onDateChange(m, d, y);
      }
    }
  };

  return (
    <div 
      className="relative flex justify-between bg-white py-0 px-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] select-none" 
      style={{ 
        height: `${viewportHeight}px`
      }}
    >
      {/* Visual Selection Highlight box - pill bar matching the grey background in reference */}
      <div 
        className="absolute left-2 right-2 bg-neutral-100 pointer-events-none rounded-[16px] border-0 outline-none ring-0 select-none" 
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          height: `${itemHeight}px`
        }}
      />
      
      {/* Month Column */}
      <div 
        ref={monthRef}
        onScroll={() => handleScrollColumn(monthRef, MONTHS, setSelectedMonth, 'month')}
        className="flex-[1.2] h-full overflow-y-auto no-scrollbar snap-y snap-mandatory relative z-10 scroll-smooth"
      >
        <div style={{ height: `${spacerHeight}px` }} className="shrink-0 pointer-events-none" />
        {MONTHS.map((m) => {
          const isActive = m === selectedMonth;
          return (
            <div 
              key={m} 
              style={{ height: `${itemHeight}px` }} 
              onClick={() => {
                if (isInitializing.current) return;
                setSelectedMonth(m);
                if (monthRef.current) {
                  monthRef.current.scrollTop = MONTHS.indexOf(m) * itemHeight;
                }
                if (onMonthClick) onMonthClick(m);
              }}
              className={`flex items-center justify-center snap-center transition-all duration-200 shrink-0 cursor-pointer rounded-xl whitespace-nowrap font-medium ${
                isActive 
                  ? 'text-neutral-800 text-[15px] md:text-[17px] scale-100' 
                  : 'text-neutral-800/70 hover:text-neutral-800 text-[14px] md:text-[16px] scale-98'
              }`}
            >
              {m}
            </div>
          );
        })}
        <div style={{ height: `${spacerHeight}px` }} className="shrink-0 pointer-events-none" />
      </div>
      
      {/* Day Column */}
      <div 
        ref={dayRef}
        onScroll={() => handleScrollColumn(dayRef, DAYS, setSelectedDay, 'day')}
        className="flex-1 h-full overflow-y-auto no-scrollbar snap-y snap-mandatory relative z-10 scroll-smooth text-center"
      >
        <div style={{ height: `${spacerHeight}px` }} className="shrink-0 pointer-events-none" />
        {DAYS.map((d) => {
          const isActive = d === selectedDay;
          return (
            <div 
              key={d} 
              style={{ height: `${itemHeight}px` }} 
              onClick={() => {
                if (isInitializing.current) return;
                setSelectedDay(d);
                if (dayRef.current) {
                  dayRef.current.scrollTop = DAYS.indexOf(d) * itemHeight;
                }
              }}
              className={`flex items-center justify-center snap-center transition-all duration-200 shrink-0 cursor-pointer rounded-xl whitespace-nowrap font-medium ${
                isActive 
                  ? 'text-neutral-800 text-[15px] md:text-[17px] scale-100' 
                  : 'text-neutral-800/70 hover:text-neutral-800 text-[14px] md:text-[16px] scale-98'
              }`}
            >
              {d}
            </div>
          );
        })}
        <div style={{ height: `${spacerHeight}px` }} className="shrink-0 pointer-events-none" />
      </div>

      {/* Year Column */}
      <div 
        ref={yearRef}
        onScroll={() => handleScrollColumn(yearRef, YEARS, setSelectedYear, 'year')}
        className="flex-1 h-full overflow-y-auto no-scrollbar snap-y snap-mandatory relative z-10 scroll-smooth text-center"
      >
        <div style={{ height: `${spacerHeight}px` }} className="shrink-0 pointer-events-none" />
        {YEARS.map((y) => {
          const isActive = y === selectedYear;
          return (
            <div 
              key={y} 
              style={{ height: `${itemHeight}px` }} 
              onClick={() => {
                if (isInitializing.current) return;
                setSelectedYear(y);
                if (yearRef.current) {
                  yearRef.current.scrollTop = YEARS.indexOf(y) * itemHeight;
                }
              }}
              className={`flex items-center justify-center snap-center transition-all duration-200 shrink-0 cursor-pointer rounded-xl whitespace-nowrap font-medium ${
                isActive 
                  ? 'text-neutral-800 text-[15px] md:text-[17px] scale-100' 
                  : 'text-neutral-800/70 hover:text-neutral-800 text-[14px] md:text-[16px] scale-98'
              }`}
            >
              {y}
            </div>
          );
        })}
        <div style={{ height: `${spacerHeight}px` }} className="shrink-0 pointer-events-none" />
      </div>
    </div>
  );
};
