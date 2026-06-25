// @context: Map preloader singleton — initializes MapTiler map in background
// @purpose: Pre-renders the interactive map on Home mount so it's 100% ready when user navigates to /maps
// @behavior: Home.tsx mounts a hidden off-screen container; initMapPreload() initializes MapTiler in it
// @behavior: Maps.tsx consumes the preloaded map via takeMap() and re-parents the container
// @dependencies: @maptiler/sdk

import * as maptilersdk from "@maptiler/sdk";

let mapInstance: maptilersdk.Map | null = null;
let mapContainer: HTMLDivElement | null = null;
let mapReady = false;
let mapLoading = false;
let onLoadCallbacks: (() => void)[] = [];

/**
 * Initialize the map preloader with a container element provided by the host component.
 * The container should be mounted in the DOM with real dimensions but positioned off-screen.
 * Called by Home.tsx to start preloading the map as soon as the Home page renders.
 */
export function initMapPreload(container: HTMLDivElement, apiKey: string) {
  if (mapInstance || mapLoading || !apiKey || !container) return;
  mapLoading = true;

  maptilersdk.config.apiKey = apiKey;
  mapContainer = container;

  mapInstance = new maptilersdk.Map({
    container: mapContainer,
    style: maptilersdk.MapStyle.STREETS,
    center: [124.2442, 8.2415],
    zoom: 13,
    navigationControl: false,
    geolocateControl: false,
    fadeDuration: 0,
  });

  mapInstance.on("styleimagemissing", (e: { id?: string }) => {
    try {
      if (e && e.id && mapInstance) {
        const data = new Uint8Array([0, 0, 0, 0]);
        mapInstance.addImage(e.id, { width: 1, height: 1, data });
      }
    } catch {
      // ignore
    }
  });

  mapInstance.on("load", () => {
    mapReady = true;
    onLoadCallbacks.forEach((cb) => cb());
    onLoadCallbacks = [];
  });
}

export function isMapReady() {
  return mapReady;
}

export function onMapReady(cb: () => void) {
  if (mapReady) {
    cb();
  } else {
    onLoadCallbacks.push(cb);
  }
}

// Returns the pre-initialized container and map instance, then clears the singleton
export function takeMap(): {
  container: HTMLDivElement;
  map: maptilersdk.Map;
} | null {
  if (!mapContainer || !mapInstance) return null;

  const result = { container: mapContainer, map: mapInstance };
  mapContainer = null;
  mapInstance = null;
  mapReady = false;
  mapLoading = false;

  return result;
}

/**
 * Reset the preloader singleton so a new preload cycle can start.
 * Called by Maps.tsx on unmount so Home.tsx can re-init on next visit.
 */
export function resetMapPreload() {
  mapContainer = null;
  mapInstance = null;
  mapReady = false;
  mapLoading = false;
  onLoadCallbacks = [];
}
