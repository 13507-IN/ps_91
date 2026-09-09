'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { WizardDraft } from '@/types';
import type { PickedLocation } from './LocationPickerMap';

const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap').then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-xl flex items-center justify-center bg-paper-dark">
        <Loader2 size={20} className="animate-spin text-ink-subtle" />
      </div>
    ),
  },
);

interface StepLocationProps {
  draft: WizardDraft;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  onNext: () => void;
}

interface VillageSearchResult {
  id: number;
  name: string;
  nameLocal: string | null;
  blockName: string;
  districtName: string;
  stateName: string;
  latitude: number | null;
  longitude: number | null;
  totalPopulation?: number | null;
  totalHouseholds?: number | null;
}

interface LocationSearchResponse {
  total: number;
  villages: VillageSearchResult[];
}

const DEFAULT_CENTER: PickedLocation = { latitude: 23.4, longitude: 88.5 };

/**
 * Geocode a village using OpenStreetMap Nominatim API.
 * Tries progressively broader searches: village+block+district+state → village+district+state → village+state
 */
async function geocodeVillage(
  villageName: string,
  blockName: string,
  districtName: string,
  stateName: string,
): Promise<PickedLocation | null> {
  const queries = [
    `${villageName}, ${blockName}, ${districtName}, ${stateName}, India`,
    `${villageName}, ${districtName}, ${stateName}, India`,
    `${villageName}, ${stateName}, India`,
  ];

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'UdyamSetu/1.0' },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.length > 0 && data[0].lat && data[0].lon) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    } catch {
      // Try next query
    }
  }
  return null;
}

export default function StepLocation({ draft, updateDraft, onNext }: StepLocationProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VillageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VillageSearchResult | null>(
    draft.villageId ? { id: draft.villageId, name: draft.villageName ?? '', nameLocal: null, blockName: draft.block ?? '', districtName: draft.district ?? '', stateName: draft.state ?? '', latitude: draft.latitude ?? null, longitude: draft.longitude ?? null } : null,
  );
  const [pinned, setPinned] = useState<PickedLocation | null>(
    draft.latitude !== undefined && draft.longitude !== undefined
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null,
  );

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<LocationSearchResponse>(
        `${apiEndpoints.locations.search}?q=${encodeURIComponent(query.trim())}&limit=20`,
        { signal: controller.signal, cache: 'no-store' },
      )
        .then((data) => setResults(data.villages ?? []))
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setError(t.location.searchError);
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  async function selectVillage(v: VillageSearchResult) {
    setSelected(v);
    setQuery(v.name);
    setResults([]);

    if (v.latitude != null && v.longitude != null) {
      // Village has stored coordinates — auto-pin immediately
      const loc = { latitude: v.latitude, longitude: v.longitude };
      setPinned(loc);
      updateDraft({
        villageId: v.id,
        villageName: v.name,
        block: v.blockName,
        district: v.districtName,
        state: v.stateName,
        latitude: v.latitude,
        longitude: v.longitude,
      });
    } else {
      // No coordinates in DB — geocode using village name
      updateDraft({
        villageId: v.id,
        villageName: v.name,
        block: v.blockName,
        district: v.districtName,
        state: v.stateName,
      });

      setGeocoding(true);
      const coords = await geocodeVillage(v.name, v.blockName, v.districtName, v.stateName);
      setGeocoding(false);

      if (coords) {
        setPinned(coords);
        // Update the selected village object with found coordinates
        setSelected((prev) => prev ? { ...prev, latitude: coords.latitude, longitude: coords.longitude } : prev);
        updateDraft({ latitude: coords.latitude, longitude: coords.longitude });
      }
    }
  }

  function handleMapPick(loc: PickedLocation) {
    // Don't allow map click to override if a village with known coords is selected
    if (selected && selected.latitude != null && selected.longitude != null) return;
    setPinned(loc);
    updateDraft({ latitude: loc.latitude, longitude: loc.longitude });
  }

  const selectedCoords =
    selected?.latitude != null && selected?.longitude != null
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : null;

  const mapCenter: PickedLocation = pinned ?? selectedCoords ?? DEFAULT_CENTER;
  const mapMarker: PickedLocation | null = pinned ?? selectedCoords;
  const hasAutoPin = selected != null && (selectedCoords != null || pinned != null);

  const canContinue = !!selected || !!pinned;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="label-gov">{t.location.searchLabel}</label>
        <p className="text-xs text-ink-muted mb-2">{t.location.searchHint}</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t.location.searchPlaceholder}
            className="input-gov pl-9 pr-10"
          />
          {loading && (
            <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle animate-spin" />
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-2 flex items-center gap-2 text-xs text-grade-poor bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* No results state */}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <div className="mt-1 border border-border rounded-lg px-4 py-3 text-xs text-ink-muted shadow-gov-md bg-white">
            {t.location.noResults} &ldquo;{query.trim()}&rdquo;{t.location.tryAnother}
          </div>
        )}

        {/* Results dropdown */}
        {results.length > 0 && (
          <div className="mt-1 bg-white border border-border rounded-lg shadow-gov-md overflow-hidden max-h-64 overflow-y-auto">
            {results.map((v) => (
              <button
                key={`village-result-${v.id}`}
                onClick={() => selectVillage(v)}
                className="w-full text-left px-4 py-3 hover:bg-paper transition-colors border-b border-border last:border-0 flex items-start gap-3"
              >
                <MapPin size={15} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-ink text-sm">{v.name}</div>
                  <div className="text-ink-subtle text-xs">{v.blockName} · {v.districtName} · {v.stateName}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Geocoding indicator */}
      {geocoding && (
        <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
          <Loader2 size={14} className="animate-spin flex-shrink-0" />
          {t.location.geocoding}
        </div>
      )}

      {/* Selected village card */}
      {selected && (
        <div className="bg-saffron-soft border border-saffron/30 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-teal-900 text-base">{selected.name}</span>
              <CheckCircle size={15} className="text-flag-green" />
            </div>
            <div className="text-ink-muted text-sm">
              {selected.blockName} Block · {selected.districtName} District · {selected.stateName}
            </div>
            {(selected.latitude !== null && selected.longitude !== null) || pinned ? (
              <div className="text-xs text-ink-subtle mt-1 font-tabular">
                {(pinned?.latitude ?? selected.latitude!).toFixed(4)}°N, {(pinned?.longitude ?? selected.longitude!).toFixed(4)}°E
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                  <MapPin size={10} /> {t.location.pinnedOnMap}
                </span>
              </div>
            ) : !geocoding ? (
              <div className="text-xs text-grade-poor mt-1 font-medium">
                {t.location.noCoords}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => { setSelected(null); setPinned(null); setQuery(''); updateDraft({ villageId: undefined, latitude: undefined, longitude: undefined }); }}
            className="text-ink-subtle hover:text-grade-poor text-xs underline"
          >
            {t.common.change}
          </button>
        </div>
      )}

      {/* Pinned location card (only when no village is selected) */}
      {pinned && !selected && (
        <div className="bg-teal-50 border border-teal-600/30 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-teal-900 text-base">{t.location.pinnedLocation}</span>
              <CheckCircle size={15} className="text-flag-green" />
            </div>
            <div className="text-xs text-ink-subtle font-tabular">
              {pinned.latitude.toFixed(5)}°N, {pinned.longitude.toFixed(5)}°E
            </div>
            <div className="text-xs text-ink-muted mt-1">
              {t.location.catchmentNote}
            </div>
          </div>
          <button
            onClick={() => { setPinned(null); updateDraft({ latitude: undefined, longitude: undefined }); }}
            className="text-ink-subtle hover:text-grade-poor text-xs underline"
          >
            {t.common.clear}
          </button>
        </div>
      )}

      {/* Map */}
      <div className="bg-paper-dark border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-white flex items-center gap-2">
          <MapPin size={14} className="text-teal-600" />
          {hasAutoPin ? (
            <>
              <span className="text-sm font-medium text-ink">{t.location.villageLocation}</span>
              <span className="text-xs text-ink-subtle ml-1">{t.location.autoPinned}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-ink">{t.location.orPinOnMap}</span>
              <span className="text-xs text-ink-subtle ml-1">{t.location.clickToSet}</span>
            </>
          )}
        </div>
        <div className="h-56">
          <LocationPickerMap center={mapCenter} marker={mapMarker} onPick={handleMapPick} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all ${canContinue
              ? 'btn-saffron' : 'bg-muted text-ink-subtle cursor-not-allowed'
            }`}
        >
          {t.location.continueToBiz}
        </button>
      </div>
    </div>
  );
}