import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, Send } from 'lucide-react';

interface CameraOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraOverlay({ isOpen, onClose, onCapture }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const nativeCameraRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      streamRef.current = newStream;
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      // Fallback for permissions denied or unsupported browsers
      if (err instanceof Error && err.name === 'NotAllowedError') {
         setError("Camera access was denied. Please use the native camera fallback.");
      } else {
         setError("Could not access camera. Please use the native camera fallback.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode, capturedImage]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          // Mirror image for front camera
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSend = () => {
    if (canvasRef.current && capturedImage) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          handleClose();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    stopCamera();
    setError(null);
    onClose();
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <button onClick={handleClose} className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition">
              <X size={24} color="white" />
            </button>
            {!capturedImage && !error && (
              <button onClick={toggleCamera} className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition">
                <RefreshCw size={24} color="white" />
              </button>
            )}
          </div>

          {/* Camera View / Preview */}
          <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden px-6">
            {error ? (
              <div className="text-center w-full max-w-sm">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw size={28} className="text-white/60" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-white">Camera Access</h3>
                <p className="text-white/60 mb-8">{error}</p>
                
                <div className="flex flex-col gap-4">
                   <button 
                     onClick={() => nativeCameraRef.current?.click()}
                     className="w-full py-3.5 bg-[#2252D6] hover:bg-[#1E45B5] transition-colors rounded-full font-medium text-[15px] flex items-center justify-center gap-2"
                   >
                     <span>Take Photo with Device</span>
                   </button>
                   <button 
                     onClick={handleClose}
                     className="w-full py-3.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full font-medium text-[15px] text-white"
                   >
                     Cancel
                   </button>
                   <input 
                     type="file" 
                     accept="image/*" 
                     capture="environment" 
                     ref={nativeCameraRef}
                     className="hidden" 
                     onChange={handleNativeCameraCapture}
                   />
                </div>
              </div>
            ) : capturedImage ? (
              <img src={capturedImage} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} 
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Bottom Controls */}
          <div className="h-32 pb-safe bg-black flex items-center justify-center px-8 relative">
            {capturedImage ? (
              <div className="w-full flex justify-between items-center max-w-md mx-auto">
                <button onClick={retake} className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white font-medium">
                  Retake
                </button>
                <button onClick={handleSend} className="px-6 py-2.5 flex items-center gap-2 rounded-full bg-[#2252D6] hover:bg-[#1E45B5] transition text-white font-medium shadow-lg">
                  <span>Use Photo</span>
                  <Send size={18} />
                </button>
              </div>
            ) : !error ? (
               <div className="w-full flex justify-center pb-4">
                 <button 
                  onClick={handleCapture}
                  className="w-[72px] h-[72px] rounded-full border-[5px] border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
                 >
                   <div className="w-full h-full bg-white rounded-full"></div>
                 </button>
               </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
