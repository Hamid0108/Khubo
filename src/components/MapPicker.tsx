import React, { useEffect, useRef, useCallback } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Iligan City default center
const DEFAULT_CENTER: [number, number] = [124.2343, 8.2327];
const DEFAULT_ZOOM = 13;

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onLocationSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '';
  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;
  const latRef = useRef(lat);
  const lngRef = useRef(lng);
  latRef.current = lat;
  lngRef.current = lng;

  const createMarkerElement = useCallback(() => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        transition: transform 0.15s ease-out;
        transform-origin: center bottom;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <svg width="30" height="40" viewBox="0 0 26 34" fill="none">
          <path d="M13 0C5.8 0 0 5.8 0 13c0 2.5 1 4.8 2.6 6.5L13 34l10.4-14.5C24 17.8 25 15.5 25 13 25 5.8 20.2 0 13 0z" fill="#17294F"/>
          <circle cx="13" cy="11.5" r="4.25" fill="#fff"/>
        </svg>
      </div>
    `;
    return el;
  }, []);

  const placeMarker = useCallback((mapInst: maptilersdk.Map, latVal: number, lngVal: number) => {
    if (marker.current) {
      marker.current.setLngLat([lngVal, latVal]);
    } else {
      marker.current = new maptilersdk.Marker({ element: createMarkerElement(), anchor: 'bottom' })
        .setLngLat([lngVal, latVal])
        .addTo(mapInst);
    }
  }, [createMarkerElement]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    maptilersdk.config.apiKey = apiKey;

    const initialCenter: [number, number] = lat && lng ? [lng, lat] : DEFAULT_CENTER;
    const initialZoom = lat && lng ? 15 : DEFAULT_ZOOM;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: initialCenter,
      zoom: initialZoom,
      navigationControl: false,
      geolocateControl: false,
      fadeDuration: 0,
    });

    map.current.on('styleimagemissing', (e: { id?: string }) => {
      try {
        if (e?.id && map.current) {
          const data = new Uint8Array([0, 0, 0, 0]);
          map.current.addImage(e.id, { width: 1, height: 1, data });
        }
      } catch { /* ignore */ }
    });

    map.current.on('load', () => {
      requestAnimationFrame(() => {
        map.current?.resize();
      });

      const currentLat = latRef.current;
      const currentLng = lngRef.current;
      if (currentLat !== null && currentLng !== null && map.current) {
        placeMarker(map.current, currentLat, currentLng);
        map.current.flyTo({ center: [currentLng, currentLat], zoom: 15 });
      }
    });

    map.current.on('click', (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat: clickedLat, lng: clickedLng } = e.lngLat;

      if (marker.current) {
        marker.current.setLngLat([clickedLng, clickedLat]);
      } else {
        marker.current = new maptilersdk.Marker({ element: createMarkerElement(), anchor: 'bottom' })
          .setLngLat([clickedLng, clickedLat])
          .addTo(map.current!);
      }

      onLocationSelectRef.current(clickedLat, clickedLng);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!map.current || lat === null || lng === null) return;

    placeMarker(map.current, lat, lng);
    map.current.flyTo({ center: [lng, lat], zoom: 15 });
  }, [lat, lng, placeMarker]);

  return (
    <div className="w-full">
      <div className="relative w-full h-64 rounded-xl border border-neutral-300 overflow-hidden" style={{ position: 'relative', isolation: 'isolate' }}>
        <div ref={mapContainer} className="w-full h-full" style={{ position: 'relative', zIndex: 0, transform: 'translateZ(0)' }} />


      </div>

      {lat !== null && lng !== null && (
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
          <MapPin size={14} className="text-[#17294F]" />
          <span>Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
