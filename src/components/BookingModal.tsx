import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Calendar as CalendarIcon, 
  Wallet, 
  CheckCircle, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Lock, 
  ShieldCheck,
  Smartphone,
  Info,
  Check
} from 'lucide-react';
import { Listing } from '../types';
import { format } from 'date-fns';
import { useToast } from './ToastProvider';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  selectedRoom: 'room1' | 'room2';
  roomPrice: number;
  startDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  listing,
  selectedRoom,
  roomPrice,
  startDate,
  onSelectDate
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Step 1 Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '20',
    gender: 'Female',
    studentId: ''
  });

  // Step 3 Payment State
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'paymaya' | 'card' | null>(null);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [paymentOtp, setPaymentOtp] = useState('');
  const [paymentStep, setPaymentStep] = useState<'select' | 'input' | 'otp' | 'paying' | 'success'>('select');
  
  // Card specific state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  // Step 4 Contract State
  const [signatureText, setSignatureText] = useState('');
  const [isContractSigned, setIsContractSigned] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Step 5 Receipt
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPaymentMethod(null);
      setPaymentStep('select');
      setSignatureText('');
      setIsContractSigned(false);
      setPaymentNumber('');
      setPaymentOtp('');
      setCardDetails({ number: '', expiry: '', cvv: '' });

      // Pre-populate user information
      try {
        const cached = localStorage.getItem('khubo_user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed) {
            setFormData({
              fullName: parsed.full_name || parsed.nickname || '',
              email: parsed.email || user?.email || '',
              phone: parsed.phone || '',
              age: parsed.age ? parsed.age.toString() : '20',
              gender: parsed.gender || 'Female',
              studentId: ''
            });
          }
        } else if (user) {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            fullName: user.email?.split('@')[0] || ''
          }));
        }
      } catch (err) {
        console.error("Failed to load user profile in BookingModal:", err);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.studentId) {
      showToast('Please fill out all required fields.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!startDate) {
      showToast('Please select a move-in date.');
      return;
    }
    setStep(3);
  };

  const handlePaymentAuthorize = () => {
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        showToast('Please enter all card details.');
        return;
      }
    } else {
      if (!paymentNumber) {
        showToast('Please enter your mobile number.');
        return;
      }
    }

    if (paymentMethod === 'card') {
      setPaymentStep('paying');
      setTimeout(() => {
        setPaymentStep('success');
        showToast('Authorization successful!');
        setTimeout(() => {
          setStep(4);
        }, 1200);
      }, 2000);
    } else {
      setPaymentStep('otp');
    }
  };

  const handleVerifyOtp = () => {
    if (paymentOtp.length !== 4) {
      showToast('Please enter the 4-digit code.');
      return;
    }
    setPaymentStep('paying');
    setTimeout(() => {
      setPaymentStep('success');
      showToast('Authorization successful!');
      setTimeout(() => {
        setStep(4);
      }, 1200);
    }, 2000);
  };

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signatureText.trim().toLowerCase() !== formData.fullName.trim().toLowerCase()) {
      showToast('Signature must match your full name exactly.');
      return;
    }
    
    setIsContractSigned(true);
    setIsFinalizing(true);

    try {
      const ref = 'KH-' + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(ref);

      const newBooking = {
        listing_id: listing.id,
        tenant_id: user?.id || null,
        tenant_name: formData.fullName,
        tenant_email: formData.email,
        tenant_phone: formData.phone,
        tenant_age: parseInt(formData.age) || 20,
        tenant_gender: formData.gender,
        move_in_date: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        room_type: selectedRoom === 'room1' ? 'Room 1 (Single Bed)' : 'Room 2 (Double Bed)',
        status: 'pending',
        payment_method: paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'paymaya' ? 'PayMaya' : 'Credit Card',
        total_price: roomPrice,
        tenant_id_url: formData.studentId
      };

      const { error } = await supabase.from('reservations').insert(newBooking);
      if (error) throw error;

      setIsFinalizing(false);
      setStep(5);
    } catch (err: any) {
      console.error(err);
      showToast(`Booking failed: ${err.message || err}`);
      setIsFinalizing(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Timeline' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Agreement' },
    { num: 5, label: 'Receipt' }
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Main Modal Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-neutral-100 overflow-hidden flex flex-col z-10 text-neutral-900"
      >
        
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100 shrink-0">
          <div className="flex flex-col">
            <h3 className="font-display font-extrabold text-[#17294F] text-lg">Booking Reservation</h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{listing.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Wizard Steps indicator bar */}
        <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3 shrink-0 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-400 select-none">
          {stepsList.map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] border transition-all ${
                  isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isActive 
                      ? 'border-[#17294F] text-[#17294F] bg-white ring-2 ring-[#17294F]/20' 
                      : 'border-neutral-200 bg-white text-neutral-400'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : s.num}
                </div>
                <span className={`hidden sm:inline ${isActive ? 'text-[#17294F] font-black' : isCompleted ? 'text-blue-600' : 'text-neutral-400'}`}>
                  {s.label}
                </span>
                {s.num < 5 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300 ml-1 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Wizard Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[350px] max-h-[70vh]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Tenant Details */}
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep1Next}
                className="space-y-4 text-left"
              >
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-neutral-700">
                  <User className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed">
                    <span className="font-bold text-[#17294F]">Tenant Application</span>: Please provide your details. This information will be used to generate the pre-contract agreement.
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Full Name (must match signature)</label>
                    <input 
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Email</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Email address"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Phone Number</label>
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="09XXXXXXXXX"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Age</label>
                      <input 
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Gender</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Student / Guest ID</label>
                      <input 
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        required
                        placeholder="e.g. 2023-2024"
                        onFocus={(e) => { e.target.placeholder = ''; }}
                        onBlur={(e) => { e.target.placeholder = 'e.g. 2023-2024'; }}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#17294F] hover:bg-[#1e3466] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition active:scale-95 shadow-md"
                  >
                    Continue <ChevronRight size={14} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: Move-in Timeline */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-left"
              >
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-neutral-700">
                  <CalendarIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed">
                    <span className="font-bold text-[#17294F]">Confirm Move-in Date</span>: Choose when you intend to move in. Contract duration begins on this date.
                  </div>
                </div>

                <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#17294F] uppercase tracking-wider">Selected Date</span>
                    <span className="text-xl font-extrabold text-neutral-900 mt-1">
                      {startDate ? format(startDate, 'MMMM d, yyyy') : 'No date chosen'}
                    </span>
                    <span className="text-xs text-neutral-500 font-semibold mt-0.5">
                      {startDate ? format(startDate, 'EEEE') : 'Please select below'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <CalendarIcon size={24} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block">Choose another date if needed</label>
                  <input 
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) onSelectDate(new Date(e.target.value));
                    }}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm transition-all"
                  />
                </div>

                <div className="pt-6 flex justify-between">
                  <button 
                    onClick={() => setStep(1)}
                    className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition active:scale-95"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button 
                    onClick={handleStep2Next}
                    className="bg-[#17294F] hover:bg-[#1e3466] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition active:scale-95 shadow-md"
                  >
                    Continue <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Reservation Authorization Payment */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-left"
              >
                {/* Info block */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-neutral-700">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed">
                    <span className="font-bold text-[#17294F]">24-Hour Free Cancellation</span>: To authorize this reservation, we require a holding deposit of <span className="font-black text-amber-700">₱1,000</span>. Cancel anytime within 24 hours for a full refund.
                  </div>
                </div>

                {/* Sub-Step: Selection */}
                {paymentStep === 'select' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block">Choose Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => { setPaymentMethod('gcash'); setPaymentStep('input'); }}
                        className="border border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-white hover:border-[#17294F]/35 hover:bg-blue-50/10 transition-all active:scale-95"
                      >
                        <Smartphone size={24} className="text-blue-600" />
                        <span className="text-xs font-bold text-neutral-800">GCash</span>
                      </button>
                      <button 
                        onClick={() => { setPaymentMethod('paymaya'); setPaymentStep('input'); }}
                        className="border border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-white hover:border-[#17294F]/35 hover:bg-green-50/10 transition-all active:scale-95"
                      >
                        <Smartphone size={24} className="text-green-600" />
                        <span className="text-xs font-bold text-neutral-800">PayMaya</span>
                      </button>
                      <button 
                        onClick={() => { setPaymentMethod('card'); setPaymentStep('input'); }}
                        className="border border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-white hover:border-[#17294F]/35 hover:bg-purple-50/10 transition-all active:scale-95"
                      >
                        <CreditCard size={24} className="text-purple-600" />
                        <span className="text-xs font-bold text-neutral-800">Card</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Step: GCash/PayMaya Number Input */}
                {paymentStep === 'input' && paymentMethod !== 'card' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800 flex items-center gap-1.5">
                      <Smartphone className="text-blue-600" /> Link {paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'} Account
                    </h4>
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Mobile Number</label>
                      <input 
                        type="tel"
                        value={paymentNumber}
                        onChange={(e) => setPaymentNumber(e.target.value)}
                        placeholder="09171234567"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-sm transition-all"
                      />
                    </div>
                    <div className="flex justify-between pt-2">
                      <button 
                        onClick={() => setPaymentStep('select')}
                        className="text-xs font-black text-neutral-500 uppercase tracking-widest hover:underline"
                      >
                        Change Payment Method
                      </button>
                      <button 
                        onClick={handlePaymentAuthorize}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95"
                      >
                        Link Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Step: Credit Card Input */}
                {paymentStep === 'input' && paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800 flex items-center gap-1.5">
                      <CreditCard className="text-purple-600" /> Credit / Debit Card Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Card Number</label>
                        <input 
                          type="text"
                          maxLength={19}
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          placeholder="4111 2222 3333 4444"
                          className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-sm transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">Expiry Date</label>
                          <input 
                            type="text"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">CVV</label>
                          <input 
                            type="password"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            placeholder="***"
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <button 
                        onClick={() => setPaymentStep('select')}
                        className="text-xs font-black text-neutral-500 uppercase tracking-widest hover:underline"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handlePaymentAuthorize}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95"
                      >
                        Authorize holding deposit
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Step: Mock OTP Verification */}
                {paymentStep === 'otp' && (
                  <div className="space-y-4">
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center">
                      <p className="text-xs font-bold text-neutral-600">Enter verification code sent to {paymentNumber}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">Hint: Type "1234"</p>
                    </div>
                    <div className="flex justify-center">
                      <input 
                        type="text"
                        maxLength={4}
                        value={paymentOtp}
                        onChange={(e) => setPaymentOtp(e.target.value)}
                        placeholder="••••"
                        className="w-32 text-center tracking-widest px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-extrabold text-lg transition-all"
                      />
                    </div>
                    <div className="flex justify-between pt-2">
                      <button 
                        onClick={() => setPaymentStep('input')}
                        className="text-xs font-black text-neutral-500 tracking-widest hover:underline uppercase"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleVerifyOtp}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95"
                      >
                        Confirm & Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Step: Payment Processing */}
                {paymentStep === 'paying' && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-neutral-600">Authorizing holding deposit...</span>
                  </div>
                )}

                {/* Sub-Step: Payment Success */}
                {paymentStep === 'success' && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2.5">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-md animate-bounce">
                      <CheckCircle size={28} />
                    </div>
                    <span className="text-sm font-black text-green-700">Holding deposit of ₱1,000 Authorized!</span>
                    <span className="text-xs text-neutral-500 font-semibold">Proceeding to Downpayment & Agreement...</span>
                  </div>
                )}

                {paymentStep === 'select' && (
                  <div className="pt-6 flex justify-between">
                    <button 
                      onClick={() => setStep(2)}
                      className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition active:scale-95"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Downpayment & Agreement */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 text-left"
              >
                {/* Details Breakdown */}
                <div className="bg-[#17294F]/5 p-4 rounded-2xl border border-[#17294F]/10 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between font-bold text-neutral-700 border-b border-neutral-100 pb-2">
                    <span>Lease Term</span>
                    <span className="text-[#17294F]">6 Months Minimum</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span className="font-semibold">Selected Room</span>
                    <span className="font-bold text-neutral-900">{selectedRoom === 'room1' ? 'Room 1 (Single Bed)' : 'Room 2 (Double Bed)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span className="font-semibold">Monthly Rent</span>
                    <span className="font-bold text-neutral-900">₱{roomPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span className="font-semibold">Security Deposit (1 Month)</span>
                    <span className="font-bold text-neutral-900">₱{roomPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span className="font-semibold">Advance Rent (1 Month)</span>
                    <span className="font-bold text-neutral-900">₱{roomPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[#17294F] font-black text-sm">
                    <span>Total Initial Downpayment</span>
                    <span className="text-base">₱{(roomPrice * 2).toLocaleString()}</span>
                  </div>
                </div>

                {/* Pre-Contract T&C scroll box */}
                <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50 max-h-[120px] overflow-y-auto text-[10px] text-neutral-600 leading-relaxed space-y-2 font-medium">
                  <p className="font-bold text-neutral-800">LEASE CONTRACT AGREEMENT TERMS & CONDITIONS</p>
                  <p>1. SCOPE: This contract outlines the terms of lease for {listing.title} between the Owner and the Lessee {formData.fullName}.</p>
                  <p>2. DURATION: The minimum tenancy is 6 months, starting from the move-in date.</p>
                  <p>3. DEPOSIT: A downpayment consisting of 1-month advance rent and 1-month security deposit must be settled prior to check-in.</p>
                  <p>4. CANCELLATION: Holding deposit of ₱1,000 secures this reservation and is fully refundable within the 24-hour free period. Beyond 24 hours, the deposit is non-refundable if the lease is aborted by the tenant.</p>
                  <p>5. CONDUCT: Tenants must adhere to house regulations. Noise limits apply after 10 PM. No subletting allowed.</p>
                </div>

                {/* Contract Signature form */}
                {isFinalizing ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="w-8 h-8 border-4 border-neutral-200 border-t-[#17294F] rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-neutral-600">Processing downpayment and signing contract...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSignContract} className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] font-black text-[#17294F] uppercase tracking-wider block mb-1">
                        Type your Full Name to sign contract
                      </label>
                      <input 
                        type="text"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        required
                        placeholder={formData.fullName}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-sm transition-all"
                      />
                      <span className="text-[9px] text-neutral-400 font-bold mt-1 block">
                        Signature must exactly match: <span className="text-[#17294F] select-all font-black">{formData.fullName}</span>
                      </span>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button 
                        type="button"
                        onClick={() => setStep(3)}
                        className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition active:scale-95"
                      >
                        <ChevronLeft size={14} /> Back
                      </button>
                      <button 
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition active:scale-95 shadow-lg shadow-green-900/10"
                      >
                        Pay Downpayment & Sign <Lock size={14} />
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* STEP 5: Confirm Checkout / Success Receipt */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                {/* Big Animated success checkmark */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle size={36} />
                  </div>
                  <h2 className="text-2xl font-display font-extrabold text-[#17294F]">Reservation Confirmed!</h2>
                  <p className="text-xs text-neutral-500 font-bold max-w-xs leading-relaxed">
                    Lease contract signed successfully. Your space at {listing.title} is now secured.
                  </p>
                </div>

                {/* Receipt Box */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-left max-w-sm mx-auto space-y-3 font-semibold text-xs">
                  <div className="flex justify-between text-neutral-500 border-b border-neutral-200 pb-2">
                    <span className="uppercase tracking-wider text-[9px] font-black">Booking Reference</span>
                    <span className="font-extrabold text-[#17294F] tracking-wide select-all text-sm">{bookingRef}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Property</span>
                    <span className="text-neutral-900 font-bold truncate max-w-[180px]">{listing.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Room Selection</span>
                    <span className="text-neutral-900 font-bold">{selectedRoom === 'room1' ? 'Room 1 (Single Bed)' : 'Room 2 (Double Bed)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Move-in Date</span>
                    <span className="text-neutral-900 font-bold">{startDate ? format(startDate, 'MMMM d, yyyy') : ''}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Tenant Name</span>
                    <span className="text-neutral-900 font-bold">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600">
                    <span>Payment Mode</span>
                    <span className="text-neutral-900 font-bold">
                      {paymentMethod === 'gcash' ? 'GCash Authorization' : paymentMethod === 'paymaya' ? 'PayMaya Authorization' : 'Credit Card'}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[#17294F] font-black text-sm">
                    <span>Holding Deposit Status</span>
                    <span className="text-green-600 font-extrabold flex items-center gap-1">
                      <ShieldCheck size={16} /> Paid ₱1,000
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                  <button 
                    onClick={() => {
                      onClose();
                      navigate('/profile');
                    }}
                    className="flex-1 bg-[#17294F] hover:bg-[#1e3466] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View in Profile <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      navigate('/');
                    }}
                    className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
