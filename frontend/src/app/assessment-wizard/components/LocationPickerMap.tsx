'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PickedLocation {
  latitude: number;
  longitude: number;
}

function MapArea({
  center,
  marker,
  onPick,
}: {
  center: [number, number];
  marker: [number, number];
  onPick: (loc: PickedLocation) => void;
}) {
  const icon = L.divIcon({
    className: '',
    html: '<div class="h-4 w-4 rounded-full bg-brand-600 ring-4 ring-brand-200"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  function ClickHandler() {
    useMapEvents({
      click(e) {
        onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler />
      <Marker position={marker} icon={icon} />
    </MapContainer>
  );
}

export function LocationPickerMap({
  center,
  onPick,
}: {
  center: PickedLocation;
  onPick: (loc: PickedLocation) => void;
}) {
  return (
    <MapArea
      center={[center.latitude, center.longitude]}
      marker={[center.latitude, center.longitude]}
      onPick={onPick}
    />
  );
}