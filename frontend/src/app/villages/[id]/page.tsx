'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  ArrowLeft,
  Users,
  Home,
  GraduationCap,

  Tractor,
  Sprout,
  Route,
  Store,
} from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { number } from '@/lib/format';
import type { VillageFull } from '@/types';

const amenityLabel = (key: string) =>
  key
    .replace('has', '')
    .replace(/([A-Z])/g, ' $1')
    .trim();

export default function VillageDetailPage() {
  const params = useParams<{ id: string }>();
  const villageId = params?.id;

  const {
    data: village,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['village', villageId],
    queryFn: () =>
      api<VillageFull>(`${apiEndpoints.locations.nearby.replace('/nearby', '')}/villages/${villageId}`),
    enabled: Boolean(villageId),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !village) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Village not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This village may not exist or the backend is unavailable.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Go Home
        </Link>
      </div>
    );
  }

  const census = village.censusData;
  const amenities = village.amenities;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
          <MapPin className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{village.name}</h1>
          <p className="text-sm text-slate-500">
            {village.nameLocal && `${village.nameLocal} · `}
            {village.block.name}, {village.block.district.name}, {village.block.district.state.name}
          </p>
        </div>
      </div>

      {census && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4">
            <Users className="h-5 w-5 text-brand-600" />
            <div className="mt-2 text-xs text-slate-500">Total Population</div>
            <div className="text-xl font-bold text-slate-900">{number(census.totalPopulation ?? 0)}</div>
          </div>
          <div className="card p-4">
            <Home className="h-5 w-5 text-brand-600" />
            <div className="mt-2 text-xs text-slate-500">Households</div>
            <div className="text-xl font-bold text-slate-900">{number(census.totalHouseholds ?? 0)}</div>
          </div>
          <div className="card p-4">
            <GraduationCap className="h-5 w-5 text-brand-600" />
            <div className="mt-2 text-xs text-slate-500">Literacy Rate</div>
            <div className="text-xl font-bold text-slate-900">
              {census.literacyRate != null ? `${census.literacyRate.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
          <div className="card p-4">
            <Users className="h-5 w-5 text-slate-400" />
            <div className="mt-2 text-xs text-slate-500">SC / ST Population</div>
            <div className="text-xl font-bold text-slate-900">
              {number(census.scPopulation ?? 0)} / {number(census.stPopulation ?? 0)}
            </div>
          </div>
        </div>
      )}

      {amenities && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Amenities</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(amenities)
              .filter(([k]) => k.startsWith('has'))
              .map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    value ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      value ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  {amenityLabel(key)}
                </div>
              ))}
            {amenities.nearestTownKm != null && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Route className="h-3.5 w-3.5 text-slate-400" />
                Nearest town: {amenities.nearestTownKm} km
              </div>
            )}
          </div>
        </div>
      )}

      {village.livestock && village.livestock.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Tractor className="h-4 w-4 text-brand-600" /> Livestock
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {village.livestock.map((ls, i) => (
              <div key={`${ls.animalType}-${i}`} className="rounded-lg bg-slate-50 p-3">
                <div className="text-sm font-medium text-slate-900">{ls.animalType}</div>
                <div className="text-xs text-slate-500">
                  Count: {number(ls.count ?? 0)}
                  {ls.milkProducing != null && ls.milkProducing > 0 &&
                    ` · Milk-producing: ${number(ls.milkProducing)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {village.crops && village.crops.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Sprout className="h-4 w-4 text-brand-600" /> Crops
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {village.crops.map((cr, i) => (
              <div key={`${cr.cropName}-${i}`} className="rounded-lg bg-slate-50 p-3">
                <div className="text-sm font-medium text-slate-900">{cr.cropName}</div>
                <div className="text-xs text-slate-500">
                  Season: {cr.season}
                  {cr.areaHectares != null && ` · ${cr.areaHectares} ha`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {village.businesses && village.businesses.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Store className="h-4 w-4 text-brand-600" /> Businesses
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {village.businesses.map((biz) => (
              <div key={biz.id} className="rounded-lg bg-slate-50 p-3">
                <div className="text-sm font-medium text-slate-900">
                  {biz.name ?? biz.category}
                </div>
                <div className="text-xs text-slate-500">
                  {biz.category}
                  {biz.subcategory && ` · ${biz.subcategory}`}
                  {biz.scale && ` · ${biz.scale}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {village.roads && village.roads.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Route className="h-4 w-4 text-brand-600" /> Road Connectivity
          </h2>
          <div className="mt-3 space-y-2">
            {village.roads.map((road, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-900">{road.roadType}</span>
                {road.surfaceType && (
                  <span className="text-xs text-slate-500">({road.surfaceType})</span>
                )}
                {road.nearestTown && road.distanceKm != null && (
                  <span className="ml-auto text-xs text-slate-400">
                    → {road.nearestTown} ({road.distanceKm} km)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}