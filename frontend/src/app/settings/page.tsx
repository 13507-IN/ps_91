'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  User,
  MapPin,
  Globe,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiEndpoints, handleApiError } from '@/lib/api/client';
import AuthGuard from '@/components/AuthGuard';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { UserProfile, Gender, SocialCategory, BusinessCategory } from '@/types';

type SettingsTab = 'profile' | 'location' | 'preferences' | 'security';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { lang, setLang } = useTranslation();
  const { user, setUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [category, setCategory] = useState<SocialCategory | ''>('');
  const [isMinority, setIsMinority] = useState(false);

  // Location & Enterprise Preferences
  const [village, setVillage] = useState('Nadia Rural');
  const [block, setBlock] = useState('Nadia Block');
  const [district, setDistrict] = useState('Nadia');
  const [state, setState] = useState('West Bengal');
  const [catchmentRadiusKm, setCatchmentRadiusKm] = useState(10);
  const [preferredCategory, setPreferredCategory] = useState<BusinessCategory>('DAIRY');

  // App & Accessibility Preferences
  const [autoVoiceRefine, setAutoVoiceRefine] = useState(true);

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api<UserProfile>(apiEndpoints.users.me),
  });

  // Hydrate form when profile data is loaded
  useEffect(() => {
    const activeUser = profile || user;
    if (activeUser) {
      setName(activeUser.name || '');
      setEmail(activeUser.email || '');
      setPhone(activeUser.phone || '');
      setGender((activeUser.gender as Gender) || '');
      setDateOfBirth(activeUser.dateOfBirth ? activeUser.dateOfBirth.split('T')[0] : '');
      setCategory((activeUser.category as SocialCategory) || '');
      setIsMinority(Boolean(activeUser.isMinority));

      if (activeUser.location && typeof activeUser.location === 'object') {
        const loc = activeUser.location as Record<string, string>;
        if (loc.village) setVillage(loc.village);
        if (loc.block) setBlock(loc.block);
        if (loc.district) setDistrict(loc.district);
        if (loc.state) setState(loc.state);
      }
    }
  }, [profile, user]);

  // Mutation to update profile via API
  const updateProfileMutation = useMutation({
    mutationFn: (body: Partial<UserProfile>) =>
      api<UserProfile>(apiEndpoints.users.update, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Settings updated successfully!');
    },
    onError: (err) => {
      handleApiError(err, 'Failed to update settings');
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
      category: category || undefined,
      isMinority,
      location: {
        village,
        block,
        district,
        state,
      },
    };

    updateProfileMutation.mutate(payload as Partial<UserProfile>);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#1A3A6B]">
          <Loader2 size={32} className="animate-spin text-[#E65C00]" />
          <p className="text-sm font-medium text-[#555]">Loading your account settings…</p>
        </div>
      </div>
    );
  }

  const roleLabel = (profile?.role || user?.role) === 'ADMIN' ? 'System Administrator' : 'Rural Entrepreneur';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Top Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#1A3A6B] to-[#254d8c] p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white text-xl font-bold uppercase">
              {name ? name.slice(0, 2) : 'US'}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{name || 'Account Settings'}</h1>
              <p className="text-xs text-white/80 mt-0.5 flex items-center gap-2">
                <Shield size={12} className="text-[#FF9933]" />
                {roleLabel}
                {phone && <span className="opacity-60">• {phone}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E65C00] text-white text-sm font-bold hover:bg-[#cc5200] transition-colors shadow-sm disabled:opacity-50"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'profile', label: 'Personal Info', icon: User },
            { id: 'location', label: 'Location & Enterprise', icon: MapPin },
            { id: 'preferences', label: 'App & Language', icon: Globe },
            { id: 'security', label: 'Security & Role', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1A3A6B] text-white shadow-sm'
                    : 'bg-white text-[#555] hover:bg-gray-100 hover:text-[#1A3A6B] border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#FF9933]' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#DDDDDD] p-6 shadow-sm space-y-6">
            
            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-[#1A3A6B] flex items-center gap-2">
                    <User size={20} className="text-[#E65C00]" /> Personal Information
                  </h2>
                  <p className="text-xs text-[#666] mt-1">
                    Manage your personal details for personalized scheme matching and loan eligibility calculations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anish Paul"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. anish@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                      />
                    </div>
                  </div>

                  {/* Phone Number (Verified Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Registered Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={phone}
                        disabled
                        className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono text-gray-600 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-200">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                      />
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B] bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male (পুরুষ)</option>
                      <option value="FEMALE">Female (মহিলা)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Social Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Social Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SocialCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B] bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="GENERAL">General</option>
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                      <option value="OBC">Other Backward Class (OBC)</option>
                      <option value="MINORITY">Minority Community</option>
                    </select>
                  </div>
                </div>

                {/* Minority Community Checkbox */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isMinority}
                      onChange={(e) => setIsMinority(e.target.checked)}
                      className="w-4 h-4 accent-[#E65C00] rounded"
                    />
                    <div>
                      <span className="text-sm font-bold text-[#1A3A6B]">Minority Community Member</span>
                      <p className="text-xs text-[#666]">
                        Check if you belong to a notified religious minority (Muslim, Christian, Sikh, Buddhist, Jain, Parsi). Grants additional scheme subsidies (e.g. PMEGP 35%).
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: LOCATION & ENTERPRISE PREFERENCES */}
            {activeTab === 'location' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-[#1A3A6B] flex items-center gap-2">
                    <MapPin size={20} className="text-[#E65C00]" /> Location & Enterprise Defaults
                  </h2>
                  <p className="text-xs text-[#666] mt-1">
                    Set your primary operational location to automatically prefill feasibility assessments.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Village / Town Name</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Block</label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B]"
                    />
                  </div>

                  {/* Catchment Radius */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Default Market Catchment Radius</label>
                    <select
                      value={catchmentRadiusKm}
                      onChange={(e) => setCatchmentRadiusKm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B] bg-white"
                    >
                      <option value={5}>5 km (Local Village Market)</option>
                      <option value={10}>10 km (Standard Block Radius)</option>
                      <option value={15}>15 km (Extended Sub-District)</option>
                      <option value={20}>20 km (District Hub)</option>
                    </select>
                  </div>

                  {/* Preferred Business Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#333] mb-1">Primary Business Category</label>
                    <select
                      value={preferredCategory}
                      onChange={(e) => setPreferredCategory(e.target.value as BusinessCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1A3A6B] bg-white"
                    >
                      <option value="DAIRY">Dairy Farming & Milk Processing</option>
                      <option value="RETAIL">Grocery / General Retail Store</option>
                      <option value="FOOD_PROCESSING">Food Processing & Bakery</option>
                      <option value="TEXTILES_TAILORING">Textiles, Garments & Tailoring</option>
                      <option value="POULTRY">Poultry & Livestock Farming</option>
                      <option value="AGRICULTURE">Agriculture Equipment & Nursery</option>
                      <option value="TRANSPORT">Rural Transport & Logistics</option>
                      <option value="HANDICRAFT">Handicraft & Artisan Goods</option>
                      <option value="SERVICES">Repair & Technical Services</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: APP & ACCESSIBILITY PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-[#1A3A6B] flex items-center gap-2">
                    <Globe size={20} className="text-[#E65C00]" /> App & Language Preferences
                  </h2>
                  <p className="text-xs text-[#666] mt-1">
                    Customize your interaction experience, audio features, and language.
                  </p>
                </div>

                {/* Primary Language */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A3A6B] flex items-center gap-2">
                      <Globe size={16} className="text-[#E65C00]" /> Preferred Interface Language
                    </h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      Switch language across the entire platform.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-300">
                    <button
                      type="button"
                      onClick={() => setLang('BN')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        lang === 'BN' ? 'bg-[#1A3A6B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('EN')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        lang === 'EN' ? 'bg-[#1A3A6B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Automatic Voice AI Refinement */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A3A6B] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#E65C00]" /> Automatic Voice AI Accent Refinement
                    </h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      Automatically cleans regional Bengali/English dialects when voice dictation pauses.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoVoiceRefine}
                      onChange={(e) => setAutoVoiceRefine(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E65C00]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & ROLE */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-[#1A3A6B] flex items-center gap-2">
                    <Shield size={20} className="text-[#E65C00]" /> Security & Account Status
                  </h2>
                  <p className="text-xs text-[#666] mt-1">
                    View permissions, authorization role, and security controls.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <span className="text-xs text-[#666] font-medium uppercase tracking-wide block mb-1">Account Role</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        (profile?.role || user?.role) === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {profile?.role || user?.role || 'USER'}
                      </span>
                      <span className="text-xs text-gray-500">({roleLabel})</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <span className="text-xs text-[#666] font-medium uppercase tracking-wide block mb-1">Account Created</span>
                    <div className="text-sm font-bold text-[#1A3A6B]">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active Member'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-red-600">Sign Out</h3>
                    <p className="text-xs text-gray-500">Sign out of your account on this browser.</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3A6B] text-white text-sm font-bold hover:bg-[#142e54] transition-colors shadow-sm disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin text-[#E65C00]" />
                ) : (
                  <Save size={16} className="text-[#FF9933]" />
                )}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
