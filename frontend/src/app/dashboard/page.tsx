'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, User, MapPin } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import AuthGuard from '@/components/AuthGuard';
import type { UserProfile, UpdateUserProfileBody } from '@/types';

const genderOptions = [
  { value: '', label: 'Not specified' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const categoryOptions = [
  { value: '', label: 'Not specified' },
  { value: 'GENERAL', label: 'General' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'OBC', label: 'OBC' },
  { value: 'MINORITY', label: 'Minority' },
];

function DashboardContent() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => api<UserProfile>(apiEndpoints.users.me),
  });

  const updateProfile = useMutation({
    mutationFn: (body: UpdateUserProfileBody) =>
      api<UserProfile>(apiEndpoints.users.update, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['user-me'], data);
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
        <h1 className="text-xl font-bold text-[#1A3A6B]">Unable to load profile</h1>
        <p className="mt-2 text-sm text-[#666]">Your session may have expired. Please login again.</p>
        <a href="/login" className="inline-block mt-6 px-6 py-2.5 bg-[#E65C00] text-white rounded-lg font-semibold text-sm hover:bg-[#CC5200] transition-colors">
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
    if (Object.keys(body).length > 0) updateProfile.mutate(body);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3A6B]">Your Profile</h1>
          <p className="text-sm text-[#666] mt-0.5">
            {user.phone && <span className="font-medium">{user.phone}</span>}
            {user.name && <span className="ml-2 text-[#999]">· {user.name}</span>}
          </p>
        </div>
        {saved && (
          <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
            ✓ Saved
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Personal Details */}
        <section className="rounded-2xl border border-[#DDDDDD] bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
            <User className="h-5 w-5 text-[#E65C00]" /> Personal Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base">Phone</label>
              <input className="input-base bg-gray-50 cursor-not-allowed" value={current.phone ?? ''} disabled />
            </div>
            <div>
              <label className="label-base">Name</label>
              <input
                className="input-base"
                value={current.name ?? ''}
                placeholder="Your full name"
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
              <label className="label-base">Date of Birth</label>
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
                onChange={(e) => setForm((f) => ({ ...f, gender: (e.target.value || undefined) as UserProfile['gender'] }))}
              >
                {genderOptions.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Social Category</label>
              <select
                className="input-base"
                value={current.category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, category: (e.target.value || undefined) as UserProfile['category'] }))}
              >
                {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                I belong to a minority community
              </label>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-[#DDDDDD] bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
            <MapPin className="h-5 w-5 text-[#E65C00]" /> Location
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'village', label: 'Village', placeholder: 'Village name' },
              { key: 'block', label: 'Block', placeholder: 'Block / Taluka' },
              { key: 'district', label: 'District', placeholder: 'District' },
              { key: 'state', label: 'State', placeholder: 'State' },
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
            Save Changes
          </button>
        </div>
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
