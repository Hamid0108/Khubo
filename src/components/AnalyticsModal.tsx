// @context: Revenue analytics modal — line chart of daily revenue
// @purpose: Shows property revenue trends with recharts LineChart; cycle types (Week/Month/Year) and property filter
// @behavior: Static mock data; tab switching between cycle types; property dropdown filter
// @performance: Uses recharts lightweight chart; static data — no API calls
// @dependencies: Modal (ui/Modal), recharts, lucide-react
// @known-issues: All data is static mock (no real API integration)

import React, { useState } from 'react';
import { X, ArrowUpRight, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import { Modal } from './ui/Modal';

const data = [
  { name: 'Apr 25', value: 4000 },
  { name: 'Apr 26', value: 8000 },
  { name: 'Apr 27', value: 5000 },
  { name: 'Apr 28', value: 9000 },
  { name: 'Apr 29', value: 7000 },
  { name: 'Apr 30', value: 6500 },
  { name: 'May 1', value: 8500 },
  { name: 'May 2', value: 6000 },
  { name: 'May 3', value: 8000 },
  { name: 'May 4', value: 5500 },
  { name: 'May 5', value: 9500 },
  { name: 'May 6', value: 6500 },
  { name: 'May 7', value: 7500 },
  { name: 'May 8', value: 10000 },
];

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const [timeframe, setTimeframe] = useState<'Monthly'>('Monthly');

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" className="h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Revenue</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
              >
                <X size={20} />
              </button>
          </div>

          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <div className="w-full flex-1 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-neutral-500 font-medium tracking-tight">Total Revenue</h3>
                <div className="flex bg-neutral-100 rounded-full p-1 border border-neutral-200/50 shadow-inner">
                  <button
                    className="px-3 py-1 rounded-full text-xs font-bold font-sans transition-all bg-white text-neutral-900 shadow-sm"
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Value and Trend */}
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl text-[#0A2B4E] font-bold tracking-tight">₱42,000</span>
                <div className="flex items-center text-green-700 font-bold text-sm bg-green-100 px-2 py-0.5 rounded-full mb-1">
                  <ArrowUpRight size={16} className="mr-0.5" strokeWidth={3} />
                  +14.2%
                </div>
              </div>

              {/* Chart placeholder with Recharts */}
              <div className="flex-1 w-full min-h-[200px] mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <defs>
                       <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2252D6" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#2252D6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#A3A3A3', fontSize: 11 }}
                      dy={15}
                      interval="preserveStartEnd"
                      minTickGap={20}
                    />
                    <Line 
                      type="linear" 
                      dataKey="value" 
                      stroke="#2252D6" 
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Breakdown */}
              <div className="space-y-3 mt-2 mb-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <TrendingUp size={16} />
                    <span>Avg. daily revenue</span>
                  </div>
                  <span className="text-[#0A2B4E] font-bold">₱3,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <DollarSign size={16} />
                    <span>Top earning day</span>
                  </div>
                  <span className="text-[#0A2B4E] font-bold">₱5,000</span>
                </div>
              </div>
            </div>
          </div>
    </Modal>
  );
}
