'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface HyperlocalBusinessPin {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  products: string[];
  latitude: number;
  longitude: number;
  scale: string;
  operatingStatus?: string;
  source: string;
  registrationId?: string;
  villageName?: string;
  blockName?: string;
  districtName?: string;
  distanceKm: number;
}

interface HyperlocalLeafletMapProps {
  center: { latitude: number; longitude: number };
  radiusKm: number;
  businesses: HyperlocalBusinessPin[];
  selectedBusinessId?: string | null;
  onSelectBusiness?: (id: string) => void;
  locationName?: string;
}

// Controller component to handle map pan/zoom when center or selected business changes
function MapViewController({
  center,
  selectedPin,
}: {
  center: { latitude: number; longitude: number };
  selectedPin?: HyperlocalBusinessPin | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPin) {
      map.flyTo([selectedPin.latitude, selectedPin.longitude], 15, { duration: 1.2 });
    } else {
      map.setView([center.latitude, center.longitude], 12, { animate: true });
    }
  }, [map, center.latitude, center.longitude, selectedPin]);

  return null;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; hex: string }> = {
  DAIRY: { bg: '#dbeafe', border: '#2563eb', text: '#1e40af', hex: '#2563eb' },
  FOOD_PROCESSING: { bg: '#ffedd5', border: '#ea580c', text: '#c2410c', hex: '#ea580c' },
  RETAIL: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', hex: '#16a34a' },
  TEXTILES_TAILORING: { bg: '#f3e8ff', border: '#9333ea', text: '#7e22ce', hex: '#9333ea' },
  POULTRY: { bg: '#ffe4e6', border: '#e11d48', text: '#be123c', hex: '#e11d48' },
  AGRICULTURE: { bg: '#ecfccb', border: '#65a30d', text: '#4d7c0f', hex: '#65a30d' },
  LIVESTOCK: { bg: '#fef3c7', border: '#d97706', text: '#b45309', hex: '#d97706' },
  TRANSPORT: { bg: '#e0f2fe', border: '#0284c7', text: '#0369a1', hex: '#0284c7' },
  HANDICRAFT: { bg: '#fce7f3', border: '#db2777', text: '#be185d', hex: '#db2777' },
  SERVICES: { bg: '#f1f5f9', border: '#475569', text: '#334155', hex: '#475569' },
  OTHER: { bg: '#f3f4f6', border: '#6b7280', text: '#374151', hex: '#6b7280' },
};

export function HyperlocalLeafletMap({
  center,
  radiusKm,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  locationName = 'Assessment Center',
}: HyperlocalLeafletMapProps) {
  const mapCenter: [number, number] = [center.latitude, center.longitude];

  // Center Marker Icon
  const centerIcon = L.divIcon({
    className: '',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-8 w-8 rounded-full bg-amber-400 opacity-40 animate-ping"></div>
        <div class="h-6 w-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
          📍
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Create custom marker icons for each category
  const createCategoryIcon = (category: string, isSelected: boolean) => {
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
    const size = isSelected ? '32px' : '24px';
    const ring = isSelected ? 'ring-4 ring-orange-400 scale-125 z-50' : 'shadow-sm';

    return L.divIcon({
      className: '',
      html: `
        <div class="transition-all duration-300 transform hover:scale-125 ${ring}" style="width: ${size}; height: ${size}; cursor: pointer;">
          <div class="w-full h-full rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md" style="background-color: ${color.hex}">
            🏢
          </div>
        </div>
      `,
      iconSize: isSelected ? [32, 32] : [24, 24],
      iconAnchor: isSelected ? [16, 16] : [12, 12],
    });
  };

  const selectedPin = businesses.find((b) => b.id === selectedBusinessId) ?? null;

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      className="h-full w-full rounded-xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewController center={center} selectedPin={selectedPin} />

      {/* Catchment Radius Circle */}
      <Circle
        center={mapCenter}
        radius={radiusKm * 1000}
        pathOptions={{
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '4, 6',
        }}
      />

      {/* Assessment Location Center Pin */}
      <Marker position={mapCenter} icon={centerIcon}>
        <Popup className="rounded-xl shadow-lg">
          <div className="p-1.5 text-center">
            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] mb-1">
              📍 Assessment Center
            </span>
            <div className="font-bold text-slate-900 text-sm">{locationName}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {center.latitude.toFixed(4)}° N, {center.longitude.toFixed(4)}° E
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              {radiusKm} km Hyperlocal Catchment Zone
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Registered Enterprises Pins */}
      {businesses.map((b) => {
        const isSelected = b.id === selectedBusinessId;
        const color = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.OTHER;

        return (
          <Marker
            key={b.id}
            position={[b.latitude, b.longitude]}
            icon={createCategoryIcon(b.category, isSelected)}
            eventHandlers={{
              click: () => onSelectBusiness?.(b.id),
            }}
          >
            <Popup className="rounded-xl shadow-lg">
              <div className="p-2 max-w-xs space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      borderColor: color.border,
                    }}
                  >
                    {b.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ⚡ {b.distanceKm} km away
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{b.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{b.subcategory}</p>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">UDYAM Reg ID:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-800">
                      {b.registrationId || 'UDYAM-VERIFIED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Enterprise Scale:</span>
                    <span className="font-bold text-blue-700 text-[11px]">{b.scale}</span>
                  </div>
                  {b.products.length > 0 && (
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 text-[11px] block mb-0.5 font-medium">
                        Products & Services:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {b.products.map((prod, i) => (
                          <span
                            key={i}
                            className="bg-white border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Source: {b.source}</span>
                  <span>
                    {b.latitude.toFixed(4)}°, {b.longitude.toFixed(4)}°
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
