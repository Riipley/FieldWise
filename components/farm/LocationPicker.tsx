'use client';

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  CircleMarker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import {
  EGYPT_GOVERNORATES,
  findNearestEgyptGovernorate,
  type EgyptGovernorate,
} from '@/lib/geo-validator';

// Fix Leaflet's default icon path issues in Next.js bundler
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  selectedRegion?: string;
  onLocationSelect: (lat: number, lng: number) => void;
  onGovernorateSelect?: (gov: EgyptGovernorate) => void;
}

function MapEventsHandler({
  onLocationSelect,
  onGovernorateSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  onGovernorateSelect?: (gov: EgyptGovernorate) => void;
}) {
  useMapEvents({
    click(e) {
      const newLat = parseFloat(e.latlng.lat.toFixed(4));
      const newLng = parseFloat(e.latlng.lng.toFixed(4));
      const nearestGov = findNearestEgyptGovernorate(newLat, newLng);
      if (nearestGov && onGovernorateSelect) {
        onGovernorateSelect({
          ...nearestGov,
          lat: newLat,
          lng: newLng,
        });
      } else {
        onLocationSelect(newLat, newLng);
      }
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    const isEgypt = lat >= 21.8 && lat <= 31.9 && lng >= 24.5 && lng <= 37.0;
    const targetZoom = isEgypt ? Math.max(map.getZoom(), 8) : map.getZoom();
    map.flyTo([lat, lng], targetZoom, { duration: 0.75 });
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  selectedRegion,
  onLocationSelect,
  onGovernorateSelect,
}: LocationPickerProps) {
  const { t, isAr } = useLanguage();
  const activeGov = findNearestEgyptGovernorate(lat, lng);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <span className="flex items-center gap-1 font-medium text-stone-700">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          {isAr
            ? 'اختر أي محافظة من القائمة أو اضغط على أي نقطة من الـ 27 محافظة على الخريطة'
            : t.clickMapHint}
        </span>
        <div className="flex items-center gap-2">
          {activeGov && (
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-700" />
              {isAr ? `محافظة ${activeGov.nameAr}` : `${activeGov.nameEn} Governorate`}
            </span>
          )}
          <span
            className="font-mono bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200"
            dir="ltr"
          >
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </span>
        </div>
      </div>

      <div className="h-[380px] sm:h-[440px] w-full rounded-2xl overflow-hidden border border-stone-300 shadow-inner relative z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={7}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Interactive pins for all 27 Egyptian Governorates */}
          {EGYPT_GOVERNORATES.map((gov) => {
            const isSelected =
              activeGov?.id === gov.id ||
              (selectedRegion &&
                selectedRegion.toLowerCase().includes(gov.nameEn.toLowerCase()));

            return (
              <CircleMarker
                key={gov.id}
                center={[gov.lat, gov.lng]}
                radius={isSelected ? 10 : 6}
                pathOptions={{
                  color: isSelected ? '#065f46' : '#059669',
                  weight: isSelected ? 3 : 1.5,
                  fillColor: isSelected ? '#10b981' : '#34d399',
                  fillOpacity: isSelected ? 0.9 : 0.65,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    if (onGovernorateSelect) {
                      onGovernorateSelect(gov);
                    } else {
                      onLocationSelect(gov.lat, gov.lng);
                    }
                  },
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -6]}
                  permanent={Boolean(isSelected)}
                  className="font-sans text-xs font-bold"
                >
                  <span>
                    {isAr
                      ? `${gov.nameAr} (${gov.nameEn})`
                      : `${gov.nameEn} (${gov.nameAr})`}
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Primary Active Pin Marker */}
          <Marker position={[lat, lng]}>
            <Popup>
              <div className="text-xs space-y-1 font-sans">
                <strong className="block text-emerald-900 text-sm">
                  {activeGov
                    ? isAr
                      ? `محافظة ${activeGov.nameAr}`
                      : `${activeGov.nameEn} Governorate`
                    : selectedRegion || 'Selected Farm Location'}
                </strong>
                {activeGov && (
                  <span className="block text-stone-600">
                    {isAr ? activeGov.zoneAr : activeGov.zoneEn}
                  </span>
                )}
                <span className="block font-mono text-stone-500" dir="ltr">
                  {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                </span>
              </div>
            </Popup>
          </Marker>

          <MapEventsHandler
            onLocationSelect={onLocationSelect}
            onGovernorateSelect={onGovernorateSelect}
          />
          <MapRecenter lat={lat} lng={lng} />
        </MapContainer>
      </div>
    </div>
  );
}
