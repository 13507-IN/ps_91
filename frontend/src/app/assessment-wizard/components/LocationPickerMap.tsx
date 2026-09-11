'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface PickedLocation {
  latitude: number;
  longitude: number;
}

function FlyToCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 12), { animate: true });
  }, [map, lat, lng]);
  return null;
}

function ClickLayer({ onPick }: { onPick: (loc: PickedLocation) => void }) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPickerMap({
  center,
  marker,
  onPick,
}: {
  center: PickedLocation;
  marker?: PickedLocation | null;
  onPick: (loc: PickedLocation) => void;
}) {
  const icon = L.divIcon({
    className: '',
    html: '<div class="h-4 w-4 rounded-full bg-brand-600 ring-4 ring-brand-200"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const mapCenter: [number, number] = [center.latitude, center.longitude];

  return (
    <MapContainer center={mapCenter} zoom={12} className="h-full w-full rounded-xl z-0" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToCenter lat={mapCenter[0]} lng={mapCenter[1]} />
      <ClickLayer onPick={onPick} />
      {marker && <Marker position={[marker.latitude, marker.longitude]} icon={icon} />}
    </MapContainer>
  );
}