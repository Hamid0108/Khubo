import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { Listing } from '../types';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  listing: Listing;
}

import { AMENITIES } from '../data/amenities';

const CATEGORIES = ["boarding", "apartment", "pad", "condo", "shared"];

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Iligan City": { lat: 8.2280, lng: 124.2452 },
  "Cagayan de Oro": { lat: 8.4822, lng: 124.6460 },
  "Butuan City": { lat: 8.9500, lng: 125.5333 }
};

const BARANGAYS_BY_CITY: Record<string, string[]> = {
  "Iligan City": [
    "Abuno", "Acmac", "Bagong Silang", "Bonbonon", "Bunawan", 
    "Buru-un", "Dalipuga", "Del Carmen", "Digkilaan", "Ditucalan", 
    "Dulag", "Hinaplanon", "Hindang", "Kabacsanan", "Kalilangan", 
    "Kiwalan", "Lanipao", "Luinab", "Mahayahay", "Mainit", 
    "Mandulog", "Maria Cristina", "Pala-o", "Panoroganan", "Poblacion", 
    "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena", 
    "Santa Filomena", "Santiago", "Santo Rosario", "Saray", "Suarez", 
    "Tambacan", "Tibanga", "Tipanoy", "Tomas Cabili", "Tubod", 
    "Ubaldo Laya", "Upper Hinaplanon", "Upper Tominobo", "Villaverde"
  ],
  "Cagayan de Oro": [
    "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", 
    "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", 
    "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", 
    "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", 
    "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", 
    "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", 
    "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", 
    "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40",
    "Agusan", "Baikingon", "Balubal", "Balulang", "Bayabas", 
    "Bayanga", "Besigan", "Bonbon", "Bugo", "Bulua", 
    "Camaman-an", "Canito-an", "Carmen", "Consolacion", "Cugman", 
    "Dansolihon", "F. S. Catanico", "Gusa", "Indahag", "Iponan", 
    "Kauswagan", "Lapasan", "Lumbia", "Macabalan", "Macasandig", 
    "Mambuaya", "Nazareth", "Pagalungan", "Pagatpat", "Patag", 
    "Pigsag-an", "Puerto", "Puntod", "San Simon", "Tablon", 
    "Taglimao", "Tagpangi", "Tignapoloan", "Tuburan", "Tumpagon"
  ],
  "Butuan City": [
    "Agao (Barangay 3)", "Agusan Pequeño", "Ambago", "Amparo", "Ampayon", 
    "Anticala", "Antongalon", "Aupagan", "Baan KM 3", "Baan Riverside (Barangay 20)", 
    "Babag", "Bading (Barangay 22)", "Bancasi", "Banza", "Baobaoan", 
    "Basag", "Bayanihan (Barangay 27)", "Bilay", "Bitan-agan", "Bit-os", 
    "Bobon", "Bonbon", "Bugabus", "Bugsukan", "Buhangin (Barangay 19)", 
    "Cabcabon", "Camayahan", "Dagohoy (Barangay 7)", "Dankias", "Datu Silongan (Barangay 5)", 
    "Diego Silang (Barangay 6)", "Doongan", "Dumalagan", "Golden Ribbon (Barangay 2)", "Holy Redeemer (Barangay 23)", 
    "Humabon (Barangay 11)", "Imadejas (Barangay 24)", "Jose Rizal (Barangay 25)", "Kinamlutan", "Lapu-lapu (Barangay 8)", 
    "Lemon", "Leon Kilat (Barangay 13)", "Libertad", "Limaha (Barangay 14)", "Los Angeles", 
    "Lumbocan", "Maguinda", "Mahay", "Mahogany (Barangay 21)", "Maibu", 
    "Mandamo", "Manila de Bugabus", "Maon (Barangay 1)", "Masao", "Maug", 
    "New Society Village (Barangay 28)", "Nongnong", "Obrero (Barangay 26)", "Ong Yiu (Barangay 16)", "Pagatpatan", 
    "Pangabugan", "Pianing", "Pigdaulan", "Pinamanculan", "Port Poyohon (Barangay 17)", 
    "Rajah Soliman (Barangay 4)", "Ramon Magsaysay (Barangay 26)", "Salvacion", "San Ignacio (Barangay 15)", "San Mateo", 
    "San Vicente", "Sanghan", "Santa Lucia", "Santo Niño", "Sikatuna (Barangay 10)", 
    "Silongan (Barangay 5)", "Sultan Kudarat (Barangay 12)", "Sumilihon", "Tagabaca", "Taguibo", 
    "Taligaman", "Tandang Sora (Barangay 12)", "Tiniwisan", "Tungao", "Urios (Barangay 16)", 
    "Villa Kananga"
  ]
};

const BARANGAY_COORDINATES: Record<string, Record<string, { lat: number; lng: number }>> = {
  "Iligan City": {
    "Tibanga": { lat: 8.2415, lng: 124.2442 },
    "Hinaplanon": { lat: 8.2520, lng: 124.2630 },
    "Del Carmen": { lat: 8.2280, lng: 124.2580 },
    "Pala-o": { lat: 8.2290, lng: 124.2405 },
    "San Miguel": { lat: 8.2395, lng: 124.2480 },
    "Buru-un": { lat: 8.1970, lng: 124.1790 },
    "Tubod": { lat: 8.2160, lng: 124.2340 },
    "Suarez": { lat: 8.2040, lng: 124.2085 },
    "Tambacan": { lat: 8.2325, lng: 124.2310 },
    "Mahayahay": { lat: 8.2255, lng: 124.2380 },
    "Poblacion": { lat: 8.2220, lng: 124.2410 },
    "Kiwalan": { lat: 8.2675, lng: 124.2680 },
    "Dalipuga": { lat: 8.2980, lng: 124.2710 },
    "Maria Cristina": { lat: 8.1880, lng: 124.1920 }
  },
  "Cagayan de Oro": {
    "Carmen": { lat: 8.4750, lng: 124.6300 },
    "Balulang": { lat: 8.4480, lng: 124.6250 },
    "Nazareth": { lat: 8.4710, lng: 124.6470 },
    "Kauswagan": { lat: 8.4950, lng: 124.6250 },
    "Macasandig": { lat: 8.4550, lng: 124.6530 },
    "Lapasan": { lat: 8.4880, lng: 124.6650 },
    "Patag": { lat: 8.4900, lng: 124.6150 },
    "Iponan": { lat: 8.4980, lng: 124.5880 },
    "Cugman": { lat: 8.4920, lng: 124.6980 },
    "Bulua": { lat: 8.5110, lng: 124.6120 }
  },
  "Butuan City": {
    "Poblacion": { lat: 8.9530, lng: 125.5350 },
    "Libertad": { lat: 8.9410, lng: 125.5120 },
    "Villa Kananga": { lat: 8.9280, lng: 125.5250 },
    "Doongan": { lat: 8.9615, lng: 125.5510 },
    "Amparo": { lat: 8.8780, lng: 125.4950 },
    "Banza": { lat: 8.9750, lng: 125.5720 },
    "San Ignacio": { lat: 8.9550, lng: 125.5600 }
  }
};

export function EditListingModal({ isOpen, onClose, onSuccess, listing }: EditListingModalProps) {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Location selectors
  const [selectedCity, setSelectedCity] = useState("Iligan City");
  const [selectedBarangay, setSelectedBarangay] = useState("Tibanga");
  const [specificAddress, setSpecificAddress] = useState("");
  const [listingLat, setListingLat] = useState(8.2415);
  const [listingLng, setListingLng] = useState(124.2442);
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // For images, we track existing URL strings and new File objects separately
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);

  useEffect(() => {
    if (isOpen && listing) {
      setTitle(listing.title || '');
      setDescription(listing.description || '');
      setPrice(listing.price ? listing.price.toString() : '');
      
      const city = listing.city || "Iligan City";
      const brgy = listing.barangay || "Tibanga";
      setSelectedCity(city);
      setSelectedBarangay(brgy);
      
      // Parse specific address
      let specific = listing.location || '';
      if (specific.toLowerCase().includes(city.toLowerCase()) || specific.toLowerCase().includes(brgy.toLowerCase())) {
        specific = specific
          .replace(new RegExp(`,\\s*${brgy}`, 'i'), '')
          .replace(new RegExp(`,\\s*${city}`, 'i'), '')
          .trim();
      }
      setSpecificAddress(specific);
      
      setListingLat(listing.lat ? Number(listing.lat) : 8.2415);
      setListingLng(listing.lng ? Number(listing.lng) : 124.2442);
      
      setCategory(listing.category || CATEGORIES[0]);
      setSelectedAmenities(listing.amenities || []);
      setExistingImages(listing.gallery || (listing.image ? [listing.image] : []));
      setNewImages([]);
      setError(null);
    }
  }, [isOpen, listing]);

  // Initialize MapTiler Map
  useEffect(() => {
    if (!isOpen) {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainer.current || map.current) return;

      const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'JNCQIsX7HW4jPDQX491R';
      maptilersdk.config.apiKey = apiKey;

      const initialLat = listing.lat ? Number(listing.lat) : 8.2415;
      const initialLng = listing.lng ? Number(listing.lng) : 124.2442;
      
      const newMap = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [initialLng, initialLat],
        zoom: 14,
        navigationControl: false,
        geolocateControl: false,
      });

      map.current = newMap;

      const el = document.createElement('div');
      el.className = 'custom-pin-marker';
      el.innerHTML = `
        <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.1 0 0 8.1 0 18C0 28.5 18 42 18 42C18 42 36 28.5 36 18C36 8.1 27.9 0 18 0Z" fill="#17294F" stroke="white" stroke-width="2"/>
            <circle cx="18" cy="18" r="8" fill="white"/>
            <circle cx="18" cy="18" r="4" fill="#17294F"/>
          </svg>
        </div>
      `;

      const newMarker = new maptilersdk.Marker({ 
        element: el,
        draggable: true 
      })
        .setLngLat([initialLng, initialLat])
        .addTo(newMap);

      marker.current = newMarker;

      newMarker.on('dragend', () => {
        const lngLat = newMarker.getLngLat();
        if (lngLat) {
          setListingLat(lngLat.lat);
          setListingLng(lngLat.lng);
        }
      });

      newMap.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setListingLat(lat);
        setListingLng(lng);
        newMarker.setLngLat([lng, lat]);
      });
      
      newMap.on('styleimagemissing', (e: any) => {
        try {
          if (e && e.id && newMap) {
            const width = 1;
            const height = 1;
            const data = new Uint8Array([0, 0, 0, 0]);
            newMap.addImage(e.id, { width, height, data });
          }
        } catch (err) {
          // ignore
        }
      });
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Sync Map when City or Barangay changes
  useEffect(() => {
    if (map.current) {
      let coords = BARANGAY_COORDINATES[selectedCity]?.[selectedBarangay];
      if (!coords) {
        coords = CITY_COORDINATES[selectedCity] || { lat: 8.2415, lng: 124.2442 };
      }
      
      setListingLat(coords.lat);
      setListingLng(coords.lng);
      
      if (marker.current) {
        marker.current.setLngLat([coords.lng, coords.lat]);
      }
      
      map.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 15,
        essential: true
      });
    }
  }, [selectedCity, selectedBarangay]);

  if (!isOpen || !listing) return null;

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const baranggays = BARANGAYS_BY_CITY[city] || [];
    if (baranggays.length > 0) {
      setSelectedBarangay(baranggays[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const addedFiles = Array.from(e.target.files);
      const totalImages = existingImages.length + newImages.length + addedFiles.length;
      if (totalImages > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setNewImages(prev => [...prev, ...addedFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
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
      setError('You must be logged in to edit a listing.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      if (existingImages.length === 0 && newImages.length === 0) {
        throw new Error('Please have at least one image.');
      }

      // Compress and convert local File objects to base64 Data URLs for performance and persistence
      const compressListingImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          if (!file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800');
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1000;
              const MAX_HEIGHT = 1000;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to jpeg format with 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
              } else {
                resolve(event.target?.result as string);
              }
            };
            img.onerror = () => resolve(event.target?.result as string);
            img.src = event.target?.result as string;
          };
          reader.onerror = () => resolve('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800');
          reader.readAsDataURL(file);
        });
      };

      const newlyUploadedUrls = await Promise.all(newImages.map(compressListingImage));
      const finalGallery = [...existingImages, ...newlyUploadedUrls];

      const combinedLocation = `${specificAddress ? specificAddress + ', ' : ''}${selectedBarangay}, ${selectedCity}`;

      const { error: sbErr } = await supabase
        .from('listings')
        .update({
          title,
          description,
          price: parseFloat(price),
          location: combinedLocation,
          lat: listingLat,
          lng: listingLng,
          barangay: selectedBarangay,
          city: selectedCity,
          category,
          amenities: selectedAmenities,
          image: finalGallery[0] || listing.image,
          gallery: finalGallery,
          updated_at: new Date().toISOString()
        })
        .eq('id', listing.id);

      if (sbErr) throw sbErr;

      if (onSuccess) onSuccess();
      onClose();

    } catch (err: any) {
      setError(err.message || 'An error occurred while updating listing.');
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
            <h2 className="text-xl font-bold text-neutral-800">Edit Listing</h2>
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

            <form id="edit-listing-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">Photos (Max 5)</label>
                <div className="flex flex-wrap gap-4">
                  
                  {/* Existing Images */}
                  {existingImages.map((imgUrl, idx) => (
                    <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200">
                      <img src={imgUrl} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:scale-110 transition text-red-500"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {newImages.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200">
                      <img src={URL.createObjectURL(img)} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:scale-110 transition text-red-500"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {(existingImages.length + newImages.length) < 5 && (
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
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Cozy Boarding House Room" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Price (₱ / month)</label>
                  <input required value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="e.g. 2500" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] text-sm"/>
                </div>

                {/* Structured Location Selectors */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">City / Municipality</label>
                    <select 
                      value={selectedCity} 
                      onChange={e => handleCityChange(e.target.value)} 
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] bg-white text-sm"
                    >
                      <option value="Iligan City">Iligan City</option>
                      <option value="Cagayan de Oro">Cagayan de Oro</option>
                      <option value="Butuan City">Butuan City</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-2">Barangay</label>
                    <select 
                      value={selectedBarangay} 
                      onChange={e => setSelectedBarangay(e.target.value)} 
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] bg-white text-sm"
                    >
                      {(BARANGAYS_BY_CITY[selectedCity] || []).map(brgy => (
                        <option key={brgy} value={brgy}>{brgy}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Specific Address (Purok, Street, Landmark, etc.)</label>
                  <input 
                    required 
                    value={specificAddress} 
                    onChange={e => setSpecificAddress(e.target.value)} 
                    type="text" 
                    placeholder="e.g. Purok 3, near MSU-IIT Main Gate" 
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] text-sm"
                  />
                </div>

                {/* Pinpoint Map Selector */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Pinpoint Location on Map</label>
                  <p className="text-xs text-neutral-500 mb-2">Click on the map or drag the marker to pinpoint the exact location of the boarding house.</p>
                  <div 
                    ref={mapContainer} 
                    className="w-full h-64 rounded-xl border border-neutral-200 overflow-hidden" 
                    style={{ position: 'relative' }}
                  />
                  <div className="flex gap-4 mt-2 text-xs text-neutral-600 justify-between">
                    <span>Latitude: {listingLat.toFixed(6)}</span>
                    <span>Longitude: {listingLng.toFixed(6)}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the listing..." className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] resize-none text-sm" />
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
              form="edit-listing-form"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-[#17294F] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#1e3466] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
