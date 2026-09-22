'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Loader2, CheckCircle2, Store, MapPin, Navigation } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'DAIRY', label: 'Dairy & Milk Products' },
  { value: 'FOOD_PROCESSING', label: 'Food Processing' },
  { value: 'RETAIL', label: 'Retail & Grocery' },
  { value: 'TEXTILES_TAILORING', label: 'Textiles & Tailoring' },
  { value: 'POULTRY', label: 'Poultry & Livestock' },
  { value: 'AGRICULTURE', label: 'Agricultural Services' },
  { value: 'LIVESTOCK', label: 'Livestock Trading' },
  { value: 'TRANSPORT', label: 'Rural Logistics' },
  { value: 'HANDICRAFT', label: 'Handicrafts & Artisans' },
  { value: 'SERVICES', label: 'Technical Services' },
  { value: 'OTHER', label: 'Other Enterprise' },
];

interface VillageOption {
  id: number;
  name: string;
  nameLocal: string | null;
  blockName: string;
  districtName: string;
  stateName: string;
  latitude: number | null;
  longitude: number | null;
}

export function ReportBusinessForm({ onReportSubmitted }: { onReportSubmitted?: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('RETAIL');
  const [subcategory, setSubcategory] = useState('');
  const [products, setProducts] = useState('');
  const [scale, setScale] = useState<'MICRO' | 'SMALL' | 'MEDIUM'>('MICRO');

  // Village search state
  const [villageSearch, setVillageSearch] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<VillageOption | null>(null);
  const [villageResults, setVillageResults] = useState<VillageOption[]>([]);
  const [searchingVillages, setSearchingVillages] = useState(false);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Custom/Manual coordinates if outside known village boundaries
  const [customLat, setCustomLat] = useState<number | null>(null);
  const [customLng, setCustomLng] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search villages debounced
  useEffect(() => {
    if (!villageSearch || villageSearch.length < 2 || selectedVillage?.name === villageSearch) {
      setVillageResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingVillages(true);
      try {
        const res = await api<{ total: number; villages: VillageOption[] }>(
          `${apiEndpoints.locations.search}?q=${encodeURIComponent(villageSearch)}`,
        );
        setVillageResults(res.villages || []);
        setShowVillageDropdown(true);
      } catch {
        setVillageResults([]);
      } finally {
        setSearchingVillages(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [villageSearch, selectedVillage]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowVillageDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectVillage(v: VillageOption) {
    setSelectedVillage(v);
    setVillageSearch(v.name);
    setCustomLat(v.latitude);
    setCustomLng(v.longitude);
    setShowVillageDropdown(false);
  }

  function handleDetectGps() {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    const toastId = toast.loading('Detecting GPS & fetching village or town...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomLat(lat);
        setCustomLng(lng);

        try {
          // 1. Try reverse geocoding via backend API (checks local DB first within 25km, then geocodes)
          let resolved: {
            villageId?: number;
            villageName: string;
            blockName?: string;
            districtName?: string;
            stateName?: string;
          } | null = null;

          try {
            const res = await api<{
              villageId?: number;
              villageName: string;
              blockName?: string;
              districtName?: string;
              stateName?: string;
            }>(`${apiEndpoints.locations.reverseGeocode}?lat=${lat}&lng=${lng}`);
            if (res && res.villageName && res.villageName !== 'Local Village') {
              resolved = res;
            }
          } catch {
            // fallback to nearby query
          }

          // 2. Try nearby database query within 25km
          if (!resolved) {
            try {
              const resNearby = await api<{ villages: VillageOption[] }>(
                `${apiEndpoints.locations.nearby}?lat=${lat}&lng=${lng}&radiusKm=25`,
              );
              if (resNearby.villages && resNearby.villages.length > 0) {
                const nearest = resNearby.villages[0]!;
                resolved = {
                  villageId: nearest.id,
                  villageName: nearest.name,
                  blockName: nearest.blockName,
                  districtName: nearest.districtName,
                  stateName: nearest.stateName,
                };
              }
            } catch {
              // fallback to client-side nominatim
            }
          }

          // 3. Fall back to client-side OpenStreetMap Nominatim reverse geocode
          if (!resolved) {
            try {
              const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
              const nomRes = await fetch(url, { headers: { 'User-Agent': 'ArthSetu/1.0' } });
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                if (nomData?.address) {
                  const addr = nomData.address;
                  const vName =
                    addr.village ||
                    addr.hamlet ||
                    addr.town ||
                    addr.suburb ||
                    addr.neighbourhood ||
                    addr.residential ||
                    addr.city_district ||
                    addr.municipality ||
                    addr.city ||
                    addr.county;
                  if (vName) {
                    resolved = {
                      villageName: vName,
                      blockName: addr.subdistrict || addr.county || '',
                      districtName: addr.state_district || addr.district || addr.county || '',
                      stateName: addr.state || 'West Bengal',
                    };
                  }
                }
              }
            } catch {
              // fallback
            }
          }

          if (resolved) {
            const vOpt: VillageOption = {
              id: resolved.villageId || 0,
              name: resolved.villageName,
              nameLocal: null,
              blockName: resolved.blockName || '',
              districtName: resolved.districtName || '',
              stateName: resolved.stateName || 'West Bengal',
              latitude: lat,
              longitude: lng,
            };
            handleSelectVillage(vOpt);
            toast.success(
              `Location detected: ${resolved.villageName}${resolved.districtName ? `, ${resolved.districtName}` : ''}`,
              { id: toastId },
            );
          } else {
            toast.success(`GPS coordinates captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { id: toastId });
          }
        } catch {
          toast.success(`GPS coordinates captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { id: toastId });
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        toast.error(`GPS detection failed: ${err.message}`, { id: toastId });
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the business name');
      return;
    }

    setIsSubmitting(true);
    try {
      const productList = products
        ? products.split(',').map((p) => p.trim()).filter(Boolean)
        : [subcategory || category];

      const lat = customLat ?? selectedVillage?.latitude ?? 23.4015;
      const lng = customLng ?? selectedVillage?.longitude ?? 88.5012;

      await api(apiEndpoints.businesses.create, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          category,
          subcategory: subcategory.trim() || undefined,
          products: productList.length > 0 ? productList : ['General Goods'],
          scale,
          villageId: selectedVillage?.id,
          latitude: lat,
          longitude: lng,
          source: 'COMMUNITY_REPORT',
        }),
      });

      toast.success('Business report submitted! It now needs 10 community validations.');
      setSubmitted(true);
      setName('');
      setSubcategory('');
      setProducts('');
      setVillageSearch('');
      setSelectedVillage(null);
      setCustomLat(null);
      setCustomLng(null);
      onReportSubmitted?.();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-800/10 flex items-center justify-center text-teal-800">
          <Store size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Report a Local Business</h3>
          <p className="text-xs text-slate-500">
            Submit informal & micro enterprises. Once verified with 10+ validations, it is added to the official registry.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
          <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
          <h4 className="font-bold text-emerald-900 text-sm">Thank You for Your Contribution!</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Your reported enterprise has been added as a community pending report. Once fellow community members provide{' '}
            <strong className="font-bold text-emerald-900">10 validations</strong>, it will officially graduate into the village business database!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maa Durga Tailoring Shop / Ghosh Dairy Chilling"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory / Activity</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Taant Saree Weaving, Milk Collection"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Main Products / Services (comma-separated)
            </label>
            <input
              type="text"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="e.g. Raw Milk, Curd, Paneer, Sweets"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
            />
          </div>

          {/* Village & Location Autocomplete */}
          <div className="space-y-1 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Village / Town Location *</label>
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 transition-colors"
              >
                {detectingGps ? (
                  <Loader2 size={12} className="animate-spin text-teal-800" />
                ) : (
                  <Navigation size={12} className="text-teal-700" />
                )}
                Use GPS Location
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={villageSearch}
                onChange={(e) => {
                  setVillageSearch(e.target.value);
                  if (selectedVillage && e.target.value !== selectedVillage.name) {
                    setSelectedVillage(null);
                  }
                }}
                onFocus={() => {
                  if (villageResults.length > 0) setShowVillageDropdown(true);
                }}
                placeholder="Type village name (e.g. Phulia, Krishnanagar, Deypara, Santipur)..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm"
              />
              <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              {searchingVillages && (
                <Loader2 size={16} className="animate-spin absolute right-3 top-3 text-teal-700" />
              )}
            </div>

            {selectedVillage && (
              <div className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
                <CheckCircle2 size={14} className="text-teal-700 flex-shrink-0" />
                <span>
                  Selected: <strong>{selectedVillage.name}</strong> ({selectedVillage.blockName}, {selectedVillage.districtName})
                </span>
              </div>
            )}

            {showVillageDropdown && villageResults.length > 0 && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                {villageResults.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVillage(v)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{v.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Block: {v.blockName} · District: {v.districtName}
                      </div>
                    </div>
                    {v.latitude && v.longitude && (
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-mono">
                        Geotagged
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value as 'MICRO' | 'SMALL' | 'MEDIUM')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 text-sm bg-white"
              >
                <option value="MICRO">Micro (1–2 Workers)</option>
                <option value="SMALL">Small (3–10 Workers)</option>
                <option value="MEDIUM">Medium (10+ Workers)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Validation Requirement</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-1.5">
                <span>Requires <strong>10+ community votes</strong> for verified DB status</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-800 text-white font-semibold hover:bg-teal-900 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            Submit Business for Community Validation
          </button>
        </form>
      )}
    </div>
  );
}
