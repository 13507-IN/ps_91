'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, User, MapPin, Shield } from 'lucide-react';
import { api, apiEndpoints, hasSession } from '@/lib/api/client';
import type { UserProfile, UpdateUserProfileBody } from '@/types';

const genderOptions: { value: string; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const categoryOptions: { value: string; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'GENERAL', label: 'General' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'OBC', label: 'OBC' },
  { value: 'MINORITY', label: 'Minority' },
];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => api<UserProfile>(apiEndpoints.users.me),
    enabled: hasSession(),
  });

  const [form, setForm] = useState<Partial<UserProfile>>({});

  const updateProfile = useMutation({
    mutationFn: (body: UpdateUserProfileBody) =>
      api<UserProfile>(apiEndpoints.users.update, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['user-me'], data);
      setForm(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!hasSession()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Login required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Please login to view your profile and saved reports.
        </p>
        <a href="/login" className="btn-primary mt-6">
          Go to Login
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Unable to load profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your session may have expired. Please login again.
        </p>
        <a href="/login" className="btn-primary mt-6">
          Login
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
    if (current.dateOfBirth !== user.dateOfBirth) body.dateOfBirth = current.dateOfBirth;
    if (current.category !== user.category) body.category = current.category;
    if (current.isMinority !== user.isMinority) body.isMinority = current.isMinority;
    if (JSON.stringify(current.location) !== JSON.stringify(user.location)) {
      body.location = current.location;
    }
    if (Object.keys(body).length > 0) {
      updateProfile.mutate(body);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
        {saved && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Saved
          </span>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <User className="h-5 w-5 text-brand-600" /> Personal Details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base">Phone</label>
              <input
                className="input-base bg-slate-50"
                value={current.phone ?? ''}
                disabled
              />
            </div>
            <div>
              <label className="label-base">Name</label>
              <input
                className="input-base"
                value={current.name ?? ''}
                placeholder="Your name"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-base">Email</label>
              <input
                type="email"
                className="input-base"
                value={current.email ?? ''}
                placeholder="email@example.com"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-base">Date of birth</label>
              <input
                type="date"
                className="input-base"
                value={current.dateOfBirth ? current.dateOfBirth.slice(0, 10) : ''}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-base">Gender</label>
              <select
                className="input-base"
                value={current.gender ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gender: (e.target.value || undefined) as UserProfile['gender'],
                  }))
                }
              >
                {genderOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Social category</label>
              <select
                className="input-base"
                value={current.category ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: (e.target.value || undefined) as UserProfile['category'],
                  }))
                }
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin className="h-5 w-5 text-brand-600" /> Location
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base">Village</label>
              <input
                className="input-base"
                value={current.location?.village ?? ''}
                placeholder="Village name"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    location: { ...f.location, village: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="label-base">Block</label>
              <input
                className="input-base"
                value={current.location?.block ?? ''}
                placeholder="Block"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    location: { ...f.location, block: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="label-base">District</label>
              <input
                className="input-base"
                value={current.location?.district ?? ''}
                placeholder="District"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    location: { ...f.location, district: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="label-base">State</label>
              <input
                className="input-base"
                value={current.location?.state ?? ''}
                placeholder="State"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    location: { ...f.location, state: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="btn-primary"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}