import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Shield, FileText } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  isDarkMode: boolean;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export function UploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  isDarkMode,
  acceptedTypes = "*",
  maxSizeMB = 25
}: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 z-50 w-[90%] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-[#1E1F20] text-white border border-[#3A3B3C]' : 'bg-white text-neutral-900 border border-neutral-200'
            }`}
          >
            {/* Header */}
            <div className={`p-6 pb-4 border-b ${isDarkMode ? 'border-[#3A3B3C]' : 'border-neutral-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Upload Attachments</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Attach photos, videos, or documents to your message.
                  </p>
                </div>
                <button 
                  onClick={handleClose}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-[#3A3B3C] text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pb-2">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? (isDarkMode ? 'border-[#2252D6] bg-[#2252D6]/10' : 'border-[#2252D6] bg-[#2252D6]/5') 
                    : (isDarkMode ? 'border-[#3A3B3C] hover:border-[#4E4F50] hover:bg-[#2A2B2C]' : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50')
                }`}
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isDarkMode ? 'bg-[#2A2B2C]' : 'bg-neutral-100'
                }`}>
                  <Upload size={28} className={isDarkMode ? 'text-neutral-300' : 'text-neutral-600'} />
                </div>
                <h3 className="mb-2 text-lg font-medium">Drag & drop or click to browse</h3>
                <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Images, Videos, PDFs, etc. · up to {maxSizeMB} MB each
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept={acceptedTypes}
                  onChange={handleFileSelect}
                />
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDarkMode ? 'bg-[#2A2B2C] border-[#3A3B3C]' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-md shrink-0 ${isDarkMode ? 'bg-[#3A3B3C]' : 'bg-white shadow-sm'}`}>
                          <FileText size={18} className={isDarkMode ? 'text-neutral-300' : 'text-neutral-600'} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${
                          isDarkMode ? 'hover:bg-[#3A3B3C] text-neutral-400' : 'hover:bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 mt-4 flex items-center justify-between border-t ${isDarkMode ? 'border-[#3A3B3C]' : 'border-neutral-100'}`}>
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                <Shield size={16} />
                <span>Securely encrypted</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleClose}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-[#3A3B3C] text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Discard
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={selectedFiles.length === 0}
                  className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    selectedFiles.length > 0 
                      ? 'bg-[#2252D6] text-white hover:bg-[#1E45B5]' 
                      : (isDarkMode ? 'bg-[#3A3B3C] text-neutral-500' : 'bg-neutral-200 text-neutral-400')
                  }`}
                >
                  Add Attachments →
                </button>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
