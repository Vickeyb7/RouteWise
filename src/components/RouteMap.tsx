import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TripInputs, IntermediateStop, TollPlaza } from '../types/index.ts';
import {
  resolveLocationCoordinates,
  normalizeIntermediateStops,
  formatDuration,
} from '../lib/tripCalculations.ts';

interface RouteMapProps {
  inputs: TripInputs;
  tollPlazas?: TollPlaza[];
  totalDistanceKm?: number;
  estimatedDurationMinutes?: number;
  className?: string;
  height?: string;
  showTolls?: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  inputs,
  tollPlazas = [],
  totalDistanceKm,
  estimatedDurationMinutes,
  className = '',
  height = '420px',
  showTolls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeTileLayer, setActiveTileLayer] = useState<'streets' | 'topo' | 'satellite'>('streets');
  const [displayTolls, setDisplayTolls] = useState(showTolls);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize all intermediate stops
  const stops = useMemo(() => normalizeIntermediateStops(inputs.intermediateStops), [inputs.intermediateStops]);

  // Extract coordinates for the full route sequence
  const routePoints = useMemo(() => {
    const originCoords = resolveLocationCoordinates(inputs.origin || 'Pune, MH');
    const destCoords = resolveLocationCoordinates(inputs.destination || 'Goa, GA');

    const points: Array<{
      type: 'origin' | 'stop' | 'destination';
      name: string;
      coords: { lat: number; lng: number };
      stopIndex?: number;
      stopData?: IntermediateStop;
    }> = [];

    // Origin
    points.push({
      type: 'origin',
      name: inputs.origin || 'Origin',
      coords: originCoords,
    });

    // Intermediate stops in sequence
    stops.forEach((stop, idx) => {
      points.push({
        type: 'stop',
        name: stop.name,
        coords: resolveLocationCoordinates(stop),
        stopIndex: idx + 1,
        stopData: stop,
      });
    });

    // Destination
    points.push({
      type: 'destination',
      name: inputs.destination || 'Destination',
      coords: destCoords,
    });

    return points;
  }, [inputs.origin, inputs.destination, stops]);

  // Initialize and update the Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove previous instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center (central Western Ghats / Pune region)
    const initialCenter = routePoints[0]?.coords || { lat: 18.5204, lng: 73.8567 };

    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 7,
      zoomControl: false, // We'll add custom positioned controls
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add zoom control at bottom right to avoid header collision
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> | &copy; Esri')
      .addTo(map);

    // Select tile layers - 100% free with NO API key requirements or watermarks
    let tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains = 'abc';
    let maxZoom = 19;

    if (activeTileLayer === 'topo') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
      maxZoom = 18;
    } else if (activeTileLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
      maxZoom = 18;
    }

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains,
      maxZoom,
    }).addTo(map);

    // Collect all latlngs for route polyline
    const latLngs: L.LatLngExpression[] = [];

    // Helper to generate custom SVG HTML markers
    const createMarkerIcon = (
      bgColor: string,
      textColor: string,
      label: string,
      iconName: string,
      isPulsing: boolean = false
    ) => {
      return L.divIcon({
        className: 'custom-route-marker',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -38],
        html: `
          <div style="position:relative; width:36px; height:42px; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            ${isPulsing ? `<div style="position:absolute; top:2px; left:2px; width:32px; height:32px; border-radius:50%; background:${bgColor}; opacity:0.35; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
            <div style="width:34px; height:34px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); background:${bgColor}; border:2.5px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; z-index:2;">
              <span style="transform:rotate(45deg); font-family:system-ui,-apple-system,sans-serif; font-size:12px; font-weight:800; color:${textColor}; text-align:center; line-height:1;">
                ${label}
              </span>
            </div>
            <div style="width:8px; height:4px; border-radius:50%; background:rgba(0,0,0,0.25); margin-top:2px;"></div>
          </div>
        `,
      });
    };

    // Plot Route Markers
    routePoints.forEach((point) => {
      latLngs.push([point.coords.lat, point.coords.lng]);

      let icon: L.DivIcon;
      let popupTitle = point.name;
      let popupSub = '';

      if (point.type === 'origin') {
        icon = createMarkerIcon('#0040da', '#ffffff', 'A', 'trip_origin', true);
        popupSub = '🟢 Origin Departure Point';
      } else if (point.type === 'destination') {
        icon = createMarkerIcon('#ba1a1a', '#ffffff', 'B', 'location_on', true);
        popupSub = '🏁 Final Destination';
      } else {
        // Intermediate stop
        icon = createMarkerIcon('#005e58', '#ffffff', String(point.stopIndex || 1), 'pin_drop', false);
        popupSub = `📍 Waypoint #${point.stopIndex} • ${point.stopData?.stopDurationMinutes || 30} min rest stop`;
      }

      const marker = L.marker([point.coords.lat, point.coords.lng], { icon }).addTo(map);

      // Sleek popup
      const popupContent = `
        <div style="font-family:system-ui,-apple-system,sans-serif; min-width:180px; padding:4px;">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${point.type === 'origin' ? '#0040da' : point.type === 'destination' ? '#ba1a1a' : '#005e58'};">
            ${popupSub}
          </div>
          <div style="font-size:14px; font-weight:700; color:#121c2a; margin-top:2px;">
            ${popupTitle}
          </div>
          ${point.stopData?.notes ? `<div style="font-size:11px; color:#505f78; margin-top:4px;">${point.stopData.notes}</div>` : ''}
          <div style="font-size:11px; color:#505f78; margin-top:4px;">
            Coordinates: ${point.coords.lat.toFixed(4)}°N, ${point.coords.lng.toFixed(4)}°E
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Draw Cased Multi-Segment Highway Polyline
    if (latLngs.length >= 2) {
      // 1. Casing / Glow line
      L.polyline(latLngs, {
        color: '#ffffff',
        weight: 9,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 2. Primary Highway Polyline (RouteWise Blue)
      L.polyline(latLngs, {
        color: '#0040da',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 3. Subtle dash pattern to depict active corridor direction
      L.polyline(latLngs, {
        color: '#7cf6eb',
        weight: 2,
        dashArray: '8, 14',
        opacity: 0.85,
      }).addTo(map);

      // Fit map view nicely around all route waypoints with comfortable margins
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 13,
      });
    }

    // Plot Toll Plazas if enabled
    if (displayTolls && tollPlazas.length > 0) {
      // Linearly interpolate toll markers along route line
      tollPlazas.forEach((toll, idx) => {
        const factor = (idx + 1) / (tollPlazas.length + 1);
        const originCoord = routePoints[0].coords;
        const destCoord = routePoints[routePoints.length - 1].coords;
        const tLat = originCoord.lat + (destCoord.lat - originCoord.lat) * factor;
        const tLng = originCoord.lng + (destCoord.lng - originCoord.lng) * factor;

        const tollIcon = L.divIcon({
          className: 'toll-plaza-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          html: `
            <div style="width:22px; height:22px; border-radius:50%; background:#0b1c32; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#7cf6eb; font-size:10px; font-weight:800; cursor:pointer;" title="${toll.name}">
              ₹
            </div>
          `,
        });

        const tollMarker = L.marker([tLat, tLng], { icon: tollIcon }).addTo(map);
        tollMarker.bindPopup(`
          <div style="font-family:system-ui,-apple-system,sans-serif; min-width:160px; padding:2px;">
            <div style="font-size:10px; font-weight:700; color:#005e58; text-transform:uppercase;">FASTag Expressway Plaza</div>
            <div style="font-size:13px; font-weight:700; color:#121c2a;">${toll.name}</div>
            <div style="font-size:11px; color:#505f78; margin-top:2px;">${toll.location || toll.nhHighway}</div>
            <div style="font-size:12px; font-weight:700; color:#0040da; margin-top:4px;">Car Toll: ₹${toll.carToll}</div>
          </div>
        `);
      });
    }

    // Force map size invalidation after render so container dimensions are perfectly measured
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [routePoints, activeTileLayer, displayTolls, tollPlazas]);

  // Recenter / fit bounds helper
  const handleRecenter = () => {
    if (!mapInstanceRef.current || routePoints.length === 0) return;
    const latLngs = routePoints.map(p => [p.coords.lat, p.coords.lng] as L.LatLngExpression);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-surface-container bg-surface-container-low shadow-md transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 32px)' : height }}
    >
      {/* Interactive Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header HUD: Route Summary & Telemetry */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 pointer-events-none">
        <div className="glass-panel rounded-xl p-3 shadow-lg border border-white/80 pointer-events-auto backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0"></span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">
                {inputs.origin} ➔ {inputs.destination}
              </span>
            </div>
            {inputs.isRouteOptimized && (
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold shrink-0 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">bolt</span>
                <span>Optimized</span>
              </span>
            )}
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between gap-2 text-xs text-secondary flex-wrap">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">route</span>
              <span className="font-semibold text-on-surface">
                {totalDistanceKm ? `${totalDistanceKm} km` : 'Active Corridor'}
              </span>
            </div>
            {estimatedDurationMinutes && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-tertiary">schedule</span>
                <span className="font-semibold text-on-surface">
                  {formatDuration(estimatedDurationMinutes)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">alt_route</span>
              <span>
                {stops.length > 0 ? `${stops.length} intermediate stop${stops.length > 1 ? 's' : ''}` : 'Direct route'}
              </span>
            </div>
          </div>

          {/* Intermediate Stops Sequence Pills if any */}
          {stops.length > 0 && (
            <div className="mt-2 pt-2 border-t border-surface-container flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              <span className="text-secondary font-medium shrink-0">Via:</span>
              {stops.map((stop, i) => (
                <span
                  key={stop.id || i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface shrink-0 font-medium"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-tertiary text-on-tertiary text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{stop.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Controls HUD: Layer Switcher & Re-center */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
        {/* Layer Switcher Pill */}
        <div className="glass-panel rounded-xl p-1 shadow-md border border-white/80 flex items-center gap-1 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTileLayer('streets')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTileLayer === 'streets'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
            title="OpenStreetMap high-detail roads & corridors"
          >
            Roads (OSM)
          </button>
          <button
            type="button"
            onClick={() => setActiveTileLayer('topo')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTileLayer === 'topo'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
            title="Clean vector-style Esri World Street map"
          >
            Esri Clean
          </button>
          <button
            type="button"
            onClick={() => setActiveTileLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTileLayer === 'satellite'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
            title="Satellite terrain imagery"
          >
            Satellite
          </button>
        </div>

        {/* Quick Map Action Buttons */}
        <div className="flex items-center gap-1.5">
          {tollPlazas.length > 0 && (
            <button
              type="button"
              onClick={() => setDisplayTolls(!displayTolls)}
              className={`glass-panel px-2.5 py-1 rounded-xl text-xs font-semibold shadow-md border border-white/80 backdrop-blur-xl flex items-center gap-1 transition-all ${
                displayTolls ? 'text-primary bg-primary/10' : 'text-secondary'
              }`}
              title="Toggle FASTag Toll Plazas"
            >
              <span className="material-symbols-outlined text-[14px]">toll</span>
              <span>Tolls</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRecenter}
            className="glass-panel p-2 rounded-xl text-on-surface hover:text-primary shadow-md border border-white/80 backdrop-blur-xl transition-all active:scale-95"
            title="Fit route to screen"
          >
            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="glass-panel p-2 rounded-xl text-on-surface hover:text-primary shadow-md border border-white/80 backdrop-blur-xl transition-all active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
