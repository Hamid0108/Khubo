import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../mocks/supabase';
import { useAuth } from '../lib/AuthContext';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = ["boarding", "apartment", "pad", "condo", "shared"];
const AMENITIES = ["Wifi", "Kitchen", "AC", "Washer", "Free parking", "Pool", "Gym", "Private bathroom"];

export function CreateListingModal({ isOpen, onClose, onSuccess }: CreateListingModalProps) {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a listing.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      if (images.length === 0) {
        throw new Error('Please upload at least one image.');
      }

      const imageUrls: string[] = [];

      // 1. Upload images to Supabase Storage
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // 2. Save Listing to Supabase Database
      const newListing = {
        title,
        description,
        price: parseFloat(price),
        location,
        category,
        amenities: selectedAmenities,
        image: imageUrls[0], // Main image
        gallery: imageUrls,
        rating: 0,
        host_id: user.id
      };

      const { error: dbError } = await supabase
        .from('listings')
        .insert(newListing);

      if (dbError) throw dbError;

      if (onSuccess) onSuccess();
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setCategory(CATEGORIES[0]);
      setSelectedAmenities([]);
      setImages([]);

    } catch (err: any) {
      setError(err.message || 'An error occurred while creating listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-800">Add new listing</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto no-scrollbar">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form id="create-listing-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">Photos (Max 5)</label>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200">
                      <img src={URL.createObjectURL(img)} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:scale-110 transition text-red-500"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-500 cursor-pointer hover:bg-neutral-50 transition">
                      <Upload size={24} className="mb-1" />
                      <span className="text-xs font-medium">Add Photo</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Cozy Boarding House Room" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F]"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Price (₱ / month)</label>
                  <input required value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="e.g. 2500" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F]"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Location</label>
                  <input required value={location} onChange={e => setLocation(e.target.value)} type="text" placeholder="e.g. Tibanga, Iligan City" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F]"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the listing..." className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] resize-none" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === cat ? 'bg-[#17294F] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition border ${selectedAmenities.includes(amenity) ? 'border-[#17294F] bg-blue-50 text-[#17294F]' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              form="create-listing-form"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-[#17294F] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#1e3466] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
