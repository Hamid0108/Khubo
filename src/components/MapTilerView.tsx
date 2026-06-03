import React, { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Home } from 'lucide-react';

interface MapTilerViewProps {
  lat: number;
  lng: number;
  title: string;
}

const MapTilerView: React.FC<MapTilerViewProps> = ({ lat, lng, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);

  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'JNCQIsX7HW4jPDQX491R';

  useEffect(() => {
    if (map.current) return; // stops map from initializing more than once

    if (!apiKey) {
      console.warn('MapTiler API Key is missing. Please add VITE_MAPTILER_API_KEY to your secrets.');
    }
    
    maptilersdk.config.apiKey = apiKey || '';

    try {
      map.current = new maptilersdk.Map({
        container: mapContainer.current!,
        style: maptilersdk.MapStyle.STREETS,
        center: [lng, lat],
        zoom: 14,
        navigationControl: false,
        geolocateControl: false,
      });

      // Intercept and resolve missing style images to suppress MapTiler road/space warnings in console
      map.current.on('styleimagemissing', (e: any) => {
        try {
          if (e && e.id && map.current) {
            const width = 1;
            const height = 1;
            const data = new Uint8Array([0, 0, 0, 0]);
            map.current.addImage(e.id, { width, height, data });
          }
        } catch (err) {
          // ignore any errors adding dummy fallback
        }
      });

      // Create a custom element for the house marker
      const el = document.createElement('div');
      el.className = 'house-marker';
      el.innerHTML = `
        <div style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25)); width: 56px; height: 64px; display: flex; align-items: center; justify-content: center;">
          <svg width="52" height="60" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer Glow/Border -->
            <path d="M22 1C10.4 1 1 10.4 1 22C1 34.5 22 51 22 51C22 51 43 34.5 43 22C43 10.4 33.6 1 22 1Z" fill="white" fill-opacity="0.2"/>
            <path d="M22 2C11 2 2 11 2 22C2 34 22 50 22 50C22 50 42 34 42 22C42 11 33 2 22 2Z" fill="white" stroke="white" stroke-width="2"/>
            <!-- Main Navy Background -->
            <path d="M22 3C11.5 3 3 11.5 3 22C3 33.5 22 49 22 49C22 49 41 33.5 41 22C41 11.5 32.5 3 22 3Z" fill="#17294F"/>
            <!-- Center White Circle -->
            <circle cx="22" cy="22" r="13" fill="white"/>
            <!-- House Icon -->
            <path d="M22 14L15 19.5V28.5H19.5V23.5H24.5V28.5H29V19.5L22 14Z" fill="#17294F"/>
          </svg>
        </div>
      `;

      new maptilersdk.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current);
    } catch (error) {
      console.error('Error initializing MapTiler map:', error);
    }

  }, [lat, lng, title]);

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-md border border-neutral-200 bg-neutral-50">
      {/* Custom Map Controls - Bottom Right Container style */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        {/* Zoom Stack */}
        <div className="flex flex-col bg-white rounded-xl md:rounded-2xl shadow-xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
          <button 
            onClick={handleZoomIn}
            className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center hover:bg-neutral-50 transition-colors active:scale-95 text-neutral-800"
          >
            <svg className="w-4 h-4 md:w-[22px] md:h-[22px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center hover:bg-neutral-50 transition-colors active:scale-95 text-neutral-800"
          >
            <svg className="w-4 h-4 md:w-[22px] md:h-[22px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
      {!apiKey && (
        <>
          {/* Fallback Map Background (Visible if live map fails to load or no key) */}
          <div 
            className="absolute inset-0 z-0 opacity-40 grayscale-[0.5]"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Floating Badge */}
          <div className="absolute top-6 left-6 z-50">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#17294F] uppercase tracking-widest leading-none mb-0.5">Preview Mode</span>
                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider leading-none">Add API Key for live maps</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="absolute bottom-6 left-6 z-50">
            <button 
              onClick={handleOpenGoogleMaps}
              className="py-3 px-5 bg-[#17294F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#2252D6] transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Open in Google Maps
            </button>
          </div>

          {/* Fallback Marker (Only visible when live map is not active) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#2252D6]/10 rounded-full animate-ping absolute top-0" />
            <div className="relative z-20">
              <svg width="52" height="60" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-xl">
                <path d="M22 1C10.4 1 1 10.4 1 22C1 34.5 22 51 22 51C22 51 43 34.5 43 22C43 10.4 33.6 1 22 1Z" fill="white" fill-opacity="0.2"/>
                <path d="M22 2C11 2 2 11 2 22C2 34 22 50 22 50C22 50 42 34 42 22C42 11 33 2 22 2Z" fill="white" stroke="white" stroke-width="2"/>
                <path d="M22 3C11.5 3 3 11.5 3 22C3 33.5 22 49 22 49C22 49 41 33.5 41 22C41 11.5 32.5 3 22 3Z" fill="#17294F"/>
                <circle cx="22" cy="22" r="13" fill="white"/>
                <path d="M22 14L15 19.5V28.5H19.5V23.5H24.5V28.5H29V19.5L22 14Z" fill="#17294F"/>
              </svg>
            </div>
          </div>
        </>
      )}

      <div ref={mapContainer} className="w-full h-full relative z-0" />
    </div>
  );
};

export default MapTilerView;
