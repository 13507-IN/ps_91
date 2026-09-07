'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import type { WizardDraft } from '@/types';

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

export default function StepLocation({ draft, updateDraft, onNext }: StepLocationProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VillageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VillageSearchResult | null>(
    draft.villageId ? { id: draft.villageId, name: draft.villageName ?? '', nameLocal: null, blockName: draft.block ?? '', districtName: draft.district ?? '', stateName: draft.state ?? '', latitude: draft.latitude ?? null, longitude: draft.longitude ?? null } : null,
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
          setError('Unable to search villages. Please make sure the backend is running.');
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function selectVillage(v: VillageSearchResult) {
    setSelected(v);
    setQuery(v.name);
    setResults([]);
    updateDraft({
      villageId: v.id,
      villageName: v.name,
      block: v.blockName,
      district: v.districtName,
      state: v.stateName,
      latitude: v.latitude ?? undefined,
      longitude: v.longitude ?? undefined,
    });
  }

  const canContinue = !!selected;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="label-gov">Search Village / Town</label>
        <p className="text-xs text-ink-muted mb-2">Type at least 2 characters to search across 6,40,000+ villages</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="e.g. Bishnupur, Baruipur, Katwa..."
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
            No villages found for &ldquo;{query.trim()}&rdquo;. Try another name.
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
                  {v.latitude === null && (
                    <div className="text-ink-subtle text-[10px] mt-0.5">Coordinates not available for this village</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

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
            {selected.latitude !== null && selected.longitude !== null ? (
              <div className="text-xs text-ink-subtle mt-1 font-tabular">
                {selected.latitude.toFixed(4)}°N, {selected.longitude.toFixed(4)}°E
              </div>
            ) : (
              <div className="text-xs text-grade-poor mt-1 font-medium">
                No coordinates recorded — add coordinates in the review step or search another village.
              </div>
            )}
          </div>
          <button
            onClick={() => { setSelected(null); setQuery(''); updateDraft({ villageId: undefined }); }}
            className="text-ink-subtle hover:text-grade-poor text-xs underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Map placeholder */}
      <div className="bg-paper-dark border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-white flex items-center gap-2">
          <MapPin size={14} className="text-teal-600" />
          <span className="text-sm font-medium text-ink">Or pin on map</span>
          <span className="text-xs text-ink-subtle ml-1">(Leaflet map — connect react-leaflet here)</span>
        </div>
        <div className="h-48 flex items-center justify-center bg-gradient-to-br from-teal-900/5 to-teal-600/10">
          <div className="text-center">
            <MapPin size={32} className="text-teal-400 mx-auto mb-2" />
            <p className="text-ink-muted text-sm">Interactive map loads here</p>
            <p className="text-ink-subtle text-xs">Click to pin your location</p>
          </div>
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
          Continue to Business
        </button>
      </div>
    </div>
  );
}