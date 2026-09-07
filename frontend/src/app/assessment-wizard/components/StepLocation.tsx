'use client';
import React, { useState, useCallback } from 'react';
import { Search, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import type { WizardDraft } from '@/types';

interface StepLocationProps {
  draft: WizardDraft;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  onNext: () => void;
}

const MOCK_VILLAGES = [
  { id: 101, name: 'Rajpur Sonarpur', block: 'Sonarpur', district: 'South 24 Parganas', state: 'West Bengal', latitude: 22.4345, longitude: 88.4234 },
  { id: 102, name: 'Baruipur', block: 'Baruipur', district: 'South 24 Parganas', state: 'West Bengal', latitude: 22.3654, longitude: 88.4321 },
  { id: 103, name: 'Amtala', block: 'Budge Budge II', district: 'South 24 Parganas', state: 'West Bengal', latitude: 22.3987, longitude: 88.3456 },
  { id: 104, name: 'Bishnupur', block: 'Bishnupur I', district: 'Bankura', state: 'West Bengal', latitude: 23.0786, longitude: 87.3170 },
  { id: 105, name: 'Sainthia', block: 'Sainthia', district: 'Birbhum', state: 'West Bengal', latitude: 23.9453, longitude: 87.6736 },
  { id: 106, name: 'Kharagpur', block: 'Kharagpur I', district: 'Paschim Medinipur', state: 'West Bengal', latitude: 22.3302, longitude: 87.3232 },
  { id: 107, name: 'Arambag', block: 'Arambag', district: 'Hooghly', state: 'West Bengal', latitude: 22.8836, longitude: 87.7937 },
  { id: 108, name: 'Katwa', block: 'Katwa I', district: 'Purba Bardhaman', state: 'West Bengal', latitude: 23.6467, longitude: 88.1350 },
];

export default function StepLocation({ draft, updateDraft, onNext }: StepLocationProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_VILLAGES>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<typeof MOCK_VILLAGES[0] | null>(
    draft.villageId ? MOCK_VILLAGES.find((v) => v.id === draft.villageId) || null : null
  );

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    // Backend integration: GET /api/locations/search?q=${q}&limit=20
    setTimeout(() => {
      setResults(MOCK_VILLAGES.filter((v) =>
        v.name.toLowerCase().includes(q.toLowerCase()) ||
        v.district.toLowerCase().includes(q.toLowerCase())
      ));
      setLoading(false);
    }, 350);
  }, []);

  function selectVillage(v: typeof MOCK_VILLAGES[0]) {
    setSelected(v);
    setQuery(v.name);
    setResults([]);
    updateDraft({
      villageId: v.id,
      villageName: v.name,
      block: v.block,
      district: v.district,
      state: v.state,
      latitude: v.latitude,
      longitude: v.longitude,
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
                  <div className="text-ink-subtle text-xs">{v.block} · {v.district} · {v.state}</div>
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
              {selected.block} Block · {selected.district} District · {selected.state}
            </div>
            <div className="text-xs text-ink-subtle mt-1 font-tabular">
              {selected.latitude.toFixed(4)}°N, {selected.longitude.toFixed(4)}°E
            </div>
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