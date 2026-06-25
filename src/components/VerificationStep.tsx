import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, CloudUpload, FileText, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const idTypes = [
  'School ID',
  'National ID (PhilSys)',
  "Driver's License",
  'Passport',
];

interface VerificationStepProps {
  onBack?: () => void;
  onClose?: () => void;
  onContinue?: (idType: string) => void;
}

export function VerificationStep({ onBack, onClose, onContinue }: VerificationStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isReady = selected && file;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-3xl bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 hover:bg-neutral-100 rounded-full transition-colors z-20 cursor-pointer"
        >
          <X size={20} className="text-neutral-500" />
        </button>

        <div className="px-8 pt-8 pb-0 pr-16">
          <div className="flex items-center gap-1.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 rounded-full flex-1 transition-all duration-500',
                  s <= 3 ? 'bg-[#2252D6]' : 'bg-neutral-200'
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-8 pt-5 pb-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-[#2252D6] tracking-[0.15em] uppercase mb-1">
              STEP 3 OF 5: Verification
            </p>
            <h2 className="text-2xl font-bold text-[#17294F]">Verification</h2>
            <p className="text-sm text-neutral-500 font-medium mt-1">
              Prove you are real
            </p>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">Why do we ask for this?</p>
              <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed">
                Khubo verifies real users to protect both tenants and landlords. Your ID is only
                used for one-time verification and is never shared publicly.
              </p>
            </div>
          </div>

          <p className="text-xs font-bold text-neutral-400 tracking-[0.15em] uppercase mb-3">
            SELECT ID TYPE
          </p>

          <div className="grid grid-cols-2 gap-3">
            {idTypes.map((type, i) => {
              const isSelected = selected === type;
              return (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  type="button"
                  onClick={() => { setSelected(type); if (type !== selected) { setFile(null); setPreview(null); } }}
                  className={cn(
                    'w-full py-4 px-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center relative',
                    isSelected
                      ? 'border-[#2252D6] bg-[#2252D6]/5 shadow-sm shadow-[#2252D6]/10'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <img
                        src="/khubo Logo.png"
                        alt="Khubo"
                        className="w-5 h-5 object-contain"
                      />
                    </motion.div>
                  )}
                  <span
                    className={cn(
                      'text-sm font-bold transition-colors duration-200',
                      isSelected ? 'text-[#17294F]' : 'text-neutral-800'
                    )}
                  >
                    {type}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="mt-5 mb-6 overflow-hidden"
            >
              <p className="text-xs font-bold text-neutral-400 tracking-[0.15em] uppercase mb-3">
                UPLOAD YOUR {selected.toUpperCase()}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-full border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer group',
                    isDragOver
                      ? 'border-[#2252D6] bg-[#2252D6]/5'
                      : 'border-neutral-300 hover:border-[#2252D6]/50 hover:bg-neutral-50/50'
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2252D6]/10 to-[#2252D6]/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <CloudUpload size={26} className="text-[#2252D6]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-neutral-700 group-hover:text-[#2252D6] transition-colors duration-200">
                        <span className="text-[#2252D6]">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        SVG, PNG, JPG, GIF or PDF (max. 50MB)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                  <div className="relative bg-neutral-50 flex items-center justify-center p-4 max-h-44 overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="ID preview"
                        className="max-h-36 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <FileText size={36} className="text-neutral-300" />
                        <p className="text-xs text-neutral-400 font-medium">PDF preview not available</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 rounded-full shadow-sm border border-neutral-200 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#2252D6]/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-[#2252D6]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-[11px] font-medium text-green-600">Uploaded</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <p className="text-xs text-neutral-400 text-center mt-2">
            You can also skip this step and verify later from your Profile settings.
          </p>
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-neutral-100 bg-neutral-50/50">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 border-[1.5px] border-neutral-200 hover:border-neutral-300 text-neutral-600 font-bold rounded-full transition text-sm cursor-pointer"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-medium">3 of 5</span>
            <button
              type="button"
              onClick={() => isReady && onContinue?.(selected)}
              disabled={!isReady}
              className={cn(
                'px-8 py-2.5 font-bold rounded-full transition text-sm cursor-pointer',
                isReady
                  ? 'bg-[#2252D6] hover:bg-[#1a41aa] text-white shadow-md shadow-[#2252D6]/20'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              )}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
