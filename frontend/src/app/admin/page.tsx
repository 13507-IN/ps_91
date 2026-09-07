'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Play, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import AuthGuard from '@/components/AuthGuard';
import type { PipelineInfo, IngestionSource, JobStatus } from '@/types';

const SOURCE_LABELS: Record<IngestionSource, string> = {
  lgd: 'LGD', census: 'Census', udyam: 'Udyam', livestock: 'Livestock',
  crop: 'Crop', agmarknet: 'Agmarknet', roads: 'Roads', amenities: 'Amenities',
};

function AdminContent() {
  const [selectedSource, setSelectedSource] = useState<IngestionSource | ''>('');
  const [jobId, setJobId] = useState<string | null>(null);

  const { data: pipelines, isLoading: pipelinesLoading, refetch: refetchPipelines } = useQuery({
    queryKey: ['admin-pipelines'],
    queryFn: () => api<PipelineInfo>(apiEndpoints.admin.pipelines),
  });

  const { data: jobStatus, isLoading: jobLoading } = useQuery({
    queryKey: ['admin-job', jobId],
    queryFn: () => api<JobStatus>(`${apiEndpoints.admin.ingestStatus}/${jobId}`),
    enabled: Boolean(jobId),
    refetchInterval: 2000,
  });

  const triggerIngestion = useMutation({
    mutationFn: (source: IngestionSource | 'all') =>
      api<{ id: string }>(
        source === 'all' ? '/api/admin/ingest/all' : `/api/admin/ingest/${source}`,
        { method: 'POST' }
      ),
    onSuccess: (data) => setJobId(data.id),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#1A3A6B]">Data Ingestion Admin</h1>
      <p className="mt-1 text-sm text-[#666]">Trigger and monitor data ingestion from government sources.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1A3A6B]">Pipeline Order</h2>
            <button onClick={() => refetchPipelines()} className="rounded-lg p-1.5 text-[#999] hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          {pipelinesLoading ? (
            <div className="mt-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}</div>
          ) : pipelines ? (
            <ol className="mt-3 space-y-1">
              {pipelines.order.map((src, i) => (
                <li key={src} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E65C00]/10 text-xs font-bold text-[#E65C00]">{i + 1}</span>
                  <span className="font-medium text-[#333]">{SOURCE_LABELS[src]}</span>
                  <span className="text-xs text-[#999]">{src}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-xs text-[#999]">Unable to load pipeline order.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1A3A6B]">Trigger Ingestion</h2>
          <div className="mt-3">
            <label className="label-base">Source</label>
            <select className="input-base" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value as IngestionSource | '')}>
              <option value="">All Sources</option>
              {pipelines?.order.map(src => <option key={src} value={src}>{SOURCE_LABELS[src]}</option>)}
            </select>
          </div>
          <button
            onClick={() => triggerIngestion.mutate(selectedSource || 'all')}
            disabled={triggerIngestion.isPending}
            className="btn-primary mt-4 w-full justify-center"
          >
            {triggerIngestion.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {selectedSource ? `Ingest ${SOURCE_LABELS[selectedSource as IngestionSource]}` : 'Ingest All'}
          </button>
          {triggerIngestion.isError && (
            <p className="mt-2 text-xs text-red-600">{(triggerIngestion.error as Error)?.message ?? 'Ingestion failed'}</p>
          )}
        </div>
      </div>

      {jobId && (
        <div className="mt-6 rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1A3A6B]">
            Job Status <span className="ml-2 font-mono text-xs text-[#999]">#{jobId.slice(0, 8)}</span>
          </h2>
          {jobLoading && !jobStatus ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#666]"><Loader2 className="h-4 w-4 animate-spin" /> Waiting…</div>
          ) : jobStatus ? (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                {jobStatus.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {jobStatus.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                {(jobStatus.status === 'queued' || jobStatus.status === 'processing') && <Loader2 className="h-5 w-5 animate-spin text-[#E65C00]" />}
                <span className="text-sm font-medium capitalize text-[#333]">{jobStatus.status}</span>
              </div>
              {jobStatus.error && <p className="mt-2 text-xs text-red-600">{jobStatus.error}</p>}
              {jobStatus.results && !Array.isArray(jobStatus.results) && (() => {
                const r = jobStatus.results as NonNullable<typeof jobStatus.results>;
                if (Array.isArray(r)) return null;
                return (
                  <div className="mt-3 grid gap-3 sm:grid-cols-4 text-xs">
                    {[['Total rows', String(r.totalRows), '#333'], ['Inserted', String(r.inserted), 'green'], ['Errors', String(r.errors), 'red'], ['Duration', `${(r.durationMs / 1000).toFixed(1)}s`, '#333']].map(([k, v, c]) => (
                      <div key={k} className="rounded-lg bg-gray-50 p-2.5">
                        <div className="text-[#999]">{k}</div>
                        <div className={`mt-0.5 font-bold ${c === 'green' ? 'text-green-700' : c === 'red' ? 'text-red-700' : 'text-[#333]'}`}>{v}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}

const SOURCE_LABELS: Record<IngestionSource, string> = {
  lgd: 'LGD',
  census: 'Census',
  udyam: 'Udyam',
  livestock: 'Livestock',
  crop: 'Crop',
  agmarknet: 'Agmarknet',
  roads: 'Roads',
  amenities: 'Amenities',
};

const SEED_FILES: Record<IngestionSource, string> = {
  lgd: 'src/ingestion/seeds/nadia/lgd.json',
  census: 'src/ingestion/seeds/nadia/census.csv',
  udyam: 'src/ingestion/seeds/nadia/udyam.csv',
  livestock: 'src/ingestion/seeds/nadia/livestock.csv',
  crop: 'src/ingestion/seeds/nadia/crop.csv',
  agmarknet: 'src/ingestion/seeds/nadia/agmarknet.csv',
  roads: 'src/ingestion/seeds/nadia/roads.csv',
  amenities: 'src/ingestion/seeds/nadia/amenities.csv',
};

export default function AdminPage() {
  const [selectedSource, setSelectedSource] = useState<IngestionSource | ''>('');
  const [jobId, setJobId] = useState<string | null>(null);

  const {
    data: pipelines,
    isLoading: pipelinesLoading,
    refetch: refetchPipelines,
  } = useQuery({
    queryKey: ['admin-pipelines'],
    queryFn: () => api<PipelineInfo>(apiEndpoints.admin.pipelines),
    enabled: hasSession(),
  });

  const {
    data: jobStatus,
    isLoading: jobLoading,
  } = useQuery({
    queryKey: ['admin-job', jobId],
    queryFn: () => api<JobStatus>(`${apiEndpoints.admin.ingestStatus}?jobId=${jobId}`),
    enabled: Boolean(jobId),
    refetchInterval: 2000,
  });

  const triggerIngestion = useMutation({
    mutationFn: (source: IngestionSource | 'all') =>
      api<{ jobId: string }>(source === 'all' ? '/api/admin/ingest/all' : `/api/admin/ingest/${source}`, {
        method: 'POST',
        body: JSON.stringify(
          source === 'all'
            ? { fileMap: SEED_FILES, dryRun: false, batchSize: 500 }
            : { filePath: SEED_FILES[source], dryRun: false, batchSize: 500 },
        ),
      }),
    onSuccess: (data) => setJobId(data.jobId),
  });

  if (!hasSession()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Please login as an admin to view this page.
        </p>
        <a href="/login" className="btn-primary mt-6">Login</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Data Ingestion Admin</h1>
      <p className="mt-1 text-sm text-slate-500">
        Trigger and monitor data ingestion from various government sources.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pipeline Order */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Pipeline Order</h2>
            <button
              onClick={() => refetchPipelines()}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          {pipelinesLoading ? (
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : pipelines ? (
            <ol className="mt-3 space-y-1">
              {pipelines.order.map((src, i) => (
                <li
                  key={src}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-900">{SOURCE_LABELS[src]}</span>
                  <span className="text-xs text-slate-400">{src}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-xs text-slate-400">Unable to load pipeline order.</p>
          )}
        </div>

        {/* Trigger */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Trigger Ingestion</h2>
          <div className="mt-3">
            <label className="label-base">Source</label>
            <select
              className="input-base"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as IngestionSource | '')}
            >
              <option value="">All Sources</option>
              {pipelines?.order.map((src) => (
                <option key={src} value={src}>
                  {SOURCE_LABELS[src]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() =>
              triggerIngestion.mutate(selectedSource || 'all')
            }
            disabled={triggerIngestion.isPending}
            className="btn-primary mt-4 w-full"
          >
            {triggerIngestion.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {selectedSource ? `Ingest ${SOURCE_LABELS[selectedSource as IngestionSource]}` : 'Ingest All'}
          </button>
          {triggerIngestion.isError && (
            <p className="mt-2 text-xs text-red-600">
              {(triggerIngestion.error as Error)?.message ?? 'Ingestion failed'}
            </p>
          )}
        </div>
      </div>

      {/* Job Status */}
      {jobId && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Job Status
            <span className="ml-2 font-mono text-xs text-slate-400">#{jobId.slice(0, 8)}</span>
          </h2>
          {jobLoading && !jobStatus ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for status...
            </div>
          ) : jobStatus ? (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                {jobStatus.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {jobStatus.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                {(jobStatus.status === 'queued' || jobStatus.status === 'processing') && (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                )}
                <span className="text-sm font-medium capitalize text-slate-900">
                  {jobStatus.status}
                </span>
              </div>
              {jobStatus.error && (
                <p className="mt-2 text-xs text-red-600">{jobStatus.error}</p>
              )}
              {jobStatus.results && !Array.isArray(jobStatus.results) && (() => {
                const r = jobStatus.results;
                return (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">Total rows</div>
                      <div className="mt-0.5 font-bold text-slate-900">{r.totalRows}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">Inserted</div>
                      <div className="mt-0.5 font-bold text-emerald-700">{r.inserted}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">Errors</div>
                      <div className="mt-0.5 font-bold text-red-700">{r.errors}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">Duration</div>
                      <div className="mt-0.5 font-bold text-slate-900">{(r.durationMs / 1000).toFixed(1)}s</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}