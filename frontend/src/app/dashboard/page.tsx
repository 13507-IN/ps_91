'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, User, MapPin, Plus } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import AuthGuard from '@/components/AuthGuard';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PastAssessments } from './components/PastAssessments';
import type { UserProfile, UpdateUserProfileBody } from '@/types';


interface VillageSearchResult {
  id: number;
  name: string;
  nameLocal: string | null;
  blockName: string;
  districtName: string;
  stateName: string;
  latitude: number | null;
  longitude: number | null;
}

function DashboardContent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [villageQuery, setVillageQuery] = useState('');
  const [villageResults, setVillageResults] = useState<VillageSearchResult[]>([]);
  const [villageLoading, setVillageLoading] = useState(false);
  const [villageError, setVillageError] = useState(false);
  const [addingVillage, setAddingVillage] = useState(false);
  const [villageReadyId, setVillageReadyId] = useState<number | null>(null);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => api<UserProfile>(apiEndpoints.users.me),
  });

  useEffect(() => {
    if (user?.location?.village) setVillageQuery(user.location.village);
  }, [user]);

  useEffect(() => {
    const q = villageQuery.trim();
    if (q.length < 2) {
      setVillageResults([]);
      return;
    }
    setVillageLoading(true);
    setVillageError(false);
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<{ total: number; villages: VillageSearchResult[] }>(
        `${apiEndpoints.locations.search}?q=${encodeURIComponent(q)}&limit=20`,
        { signal: controller.signal, cache: 'no-store' },
      )
        .then((data) => {
          if (!cancelled) setVillageResults(data.villages ?? []);
        })
        .catch((err) => {
          if (cancelled) return;
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setVillageError(true);
          setVillageResults([]);
        })
        .finally(() => {
          if (!cancelled) setVillageLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [villageQuery]);

  const updateProfile = useMutation({
    mutationFn: (body: UpdateUserProfileBody) =>
      api<UserProfile>(apiEndpoints.users.update, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      // Update cache and reset form
      queryClient.setQueryData(['user-me'], data);
      queryClient.invalidateQueries({ queryKey: ['user-me'] });
      queryClient.invalidateQueries({ queryKey: ['feasibility-analyses'] });
      setForm({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-[#1A3A6B]">{t.dashboard.profileError}</h1>
        <p className="mt-2 text-sm text-[#666]">{t.dashboard.sessionExpired}</p>
        <a href="/login" className="inline-block mt-6 px-6 py-2.5 bg-[#E65C00] text-white rounded-lg font-semibold text-sm hover:bg-[#CC5200] transition-colors">
          {t.nav.login}
        </a>
      </div>
    );
  }

  const current = { ...user, ...form };

  const handleSave = () => {
    const body: UpdateUserProfileBody = {};
    if (current.name !== user.name) body.name = current.name;
    if (current.email !== user.email) body.email = current.email;
    if (current.gender !== user.gender) body.gender = current.gender;
    if (current.dateOfBirth && current.dateOfBirth !== user.dateOfBirth) body.dateOfBirth = current.dateOfBirth;
    if (current.category !== user.category) body.category = current.category;
    if (current.isMinority !== user.isMinority) body.isMinority = current.isMinority;
    if (JSON.stringify(current.location) !== JSON.stringify(user.location)) {
      body.location = current.location;
    }
    if (Object.keys(body).length > 0) updateProfile.mutate(body);
  };

  function selectVillage(v: VillageSearchResult) {
    setVillageQuery(v.name);
    setVillageResults([]);
    setVillageError(false);
    setVillageReadyId(v.id);
    setForm((f) => ({
      ...f,
      location: {
        ...f.location,
        village: v.name,
        block: v.blockName,
        district: v.districtName,
        state: v.stateName,
        latitude: v.latitude ?? undefined,
        longitude: v.longitude ?? undefined,
      },
    }));
  }

  async function handleAddVillage() {
    const name = villageQuery.trim();
    if (!name || addingVillage) return;
    setAddingVillage(true);
    setVillageError(false);
    try {
      const loc = current.location ?? {};
      const created = await api<VillageSearchResult>(apiEndpoints.locations.create, {
        method: 'POST',
        body: JSON.stringify({
          name,
          block: typeof loc.block === 'string' && loc.block ? loc.block : undefined,
          district: typeof loc.district === 'string' && loc.district ? loc.district : undefined,
          state: typeof loc.state === 'string' && loc.state ? loc.state : undefined,
        }),
      });
      setVillageQuery(created.name);
      setVillageResults([]);
      setVillageReadyId(created.id);
      setForm((f) => ({
        ...f,
        location: {
          ...f.location,
          village: created.name,
          block: created.blockName,
          district: created.districtName,
          state: created.stateName,
          latitude: created.latitude ?? undefined,
          longitude: created.longitude ?? undefined,
        },
      }));
    } catch {
      setVillageError(true);
    } finally {
      setAddingVillage(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A6B]">{t.dashboard.yourProfile}</h1>
          <p className="text-sm text-[#666] mt-0.5">
            {user.phone && <span className="font-medium">{user.phone}</span>}
            {user.name && <span className="ml-2 text-[#999]">· {user.name}</span>}
          </p>
        </div>
        {saved && (
          <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
            ✓ {t.dashboard.saved}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        <section className="rounded-2xl border border-[#DDDDDD] bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
            <User className="h-5 w-5 text-[#E65C00]" /> {t.dashboard.personalDetails}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base">{t.dashboard.phone}</label>
              <input className="input-base bg-gray-50 cursor-not-allowed" value={current.phone ?? ''} disabled />
            </div>
            <div>
              <label className="label-base">{t.dashboard.name}</label>
              <input
                className="input-base"
                value={current.name ?? ''}
                placeholder={t.dashboard.namePlaceholder}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-base">{t.dashboard.email}</label>
              <input
                type="email"
                className="input-base"
                value={current.email ?? ''}
                placeholder="email@example.com"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-base">{t.dashboard.dob}</label>
              <input
                type="date"
                className="input-base"
                value={current.dateOfBirth ? current.dateOfBirth.slice(0, 10) : ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : '' }))
                }
              />
            </div>
            <div>
              <label className="label-base">{t.capital.gender}</label>
              <select
                className="input-base"
                value={current.gender ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, gender: (e.target.value || undefined) as UserProfile['gender'] }))}
              >
                <option value="">{t.common.notSelected}</option>
                <option value="MALE">{t.capital.genderMale}</option>
                <option value="FEMALE">{t.capital.genderFemale}</option>
                <option value="OTHER">{t.capital.genderOther}</option>
              </select>
            </div>
            <div>
              <label className="label-base">{t.capital.socialCategory}</label>
              <select
                className="input-base"
                value={current.category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, category: (e.target.value || undefined) as UserProfile['category'] }))}
              >
                <option value="">{t.common.notSelected}</option>
                <option value="GENERAL">{t.capital.general}</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="MINORITY">{t.capital.minority}</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                id="is-minority"
                type="checkbox"
                checked={current.isMinority ?? false}
                onChange={(e) => setForm((f) => ({ ...f, isMinority: e.target.checked }))}
                className="w-4 h-4 accent-[#E65C00]"
              />
              <label htmlFor="is-minority" className="text-sm text-[#444]">
                {t.capital.isMinority}
              </label>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-[#DDDDDD] bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
            <MapPin className="h-5 w-5 text-[#E65C00]" /> {t.dashboard.locationLabel}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <label className="label-base">{t.dashboard.villageLabel}</label>
              <input
                className="input-base pr-9"
                value={villageQuery}
                placeholder={t.dashboard.villageSearchPlaceholder}
                onChange={(e) => {
                  const value = e.target.value;
                  setVillageQuery(value);
                  setVillageReadyId(null);
                  setForm((f) => ({
                    ...f,
                    location: {
                      ...f.location,
                      village: value || undefined,
                      latitude: undefined,
                      longitude: undefined,
                    },
                  }));
                }}
                onBlur={() => setTimeout(() => setVillageResults([]), 150)}
              />
              {villageLoading && (
                <Loader2 className="absolute right-3 top-[38px] h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              )}
              {villageResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {villageResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectVillage(v)}
                      className="block w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{v.name}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {v.blockName} · {v.districtName} · {v.stateName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {!villageLoading &&
                !villageError &&
                villageQuery.trim().length >= 2 &&
                villageResults.length === 0 && (
                  <button
                    onClick={handleAddVillage}
                    disabled={addingVillage}
                    className="mt-1.5 inline-flex w-full items-center gap-1.5 rounded-lg border border-dashed border-orange-300 bg-orange-50 px-3 py-2 text-left text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-60"
                  >
                    {addingVillage ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {addingVillage
                      ? t.dashboard.addingVillage
                      : t.dashboard.addNewVillage.replace('{name}', villageQuery.trim())}
                  </button>
                )}
              {villageError && (
                <p className="mt-1.5 text-xs text-rose-600">{t.dashboard.villageSaveError}</p>
              )}
              {!villageError && villageReadyId != null && (
                <p className="mt-1.5 text-xs font-medium text-emerald-700">{t.dashboard.villageReady}</p>
              )}
            </div>
            {[
              { key: 'block', label: t.dashboard.blockLabel, placeholder: t.dashboard.blockPlaceholder },
              { key: 'district', label: t.dashboard.districtLabel, placeholder: t.dashboard.districtPlaceholder },
              { key: 'state', label: t.dashboard.stateLabel, placeholder: t.dashboard.statePlaceholder },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label-base">{label}</label>
                <input
                  className="input-base"
                  value={(current.location as Record<string, string>)?.[key] ?? ''}
                  placeholder={placeholder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: { ...f.location, [key]: e.target.value } }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1A3A6B] hover:bg-[#1E4A8A] disabled:opacity-60 text-white font-semibold text-sm transition-colors"
          >
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t.dashboard.saveChanges}
          </button>
        </div>

        <PastAssessments />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
