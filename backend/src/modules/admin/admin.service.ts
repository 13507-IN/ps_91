import type { PrismaClient } from '@prisma/client';
import { runPipeline, runAllPipelines, getPipelineOrder } from '../../ingestion/runner.js';
import type { IngestionResult, IngestionSource } from '../../ingestion/types.js';

// In-memory status store for job tracking
interface JobStatus {
  id: string;
  source?: IngestionSource | 'all';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  results?: IngestionResult | IngestionResult[];
  error?: string;
  startTime: string;
  endTime?: string;
}

const jobHistory: Map<string, JobStatus> = new Map();

export class AdminService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Trigger single pipeline ingestion
   */
  async triggerIngestion(
    source: IngestionSource,
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<{ jobId: string; status: JobStatus }> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: JobStatus = {
      id: jobId,
      source,
      status: 'processing',
      startTime: new Date().toISOString(),
    };
    jobHistory.set(jobId, job);

    // Run synchronously or async
    try {
      const result = await runPipeline(source, filePath, this.prisma, options);
      job.status = result.status === 'completed' ? 'completed' : 'failed';
      job.results = result;
      job.endTime = new Date().toISOString();
    } catch (err) {
      job.status = 'failed';
      job.error = err instanceof Error ? err.message : String(err);
      job.endTime = new Date().toISOString();
    }

    return { jobId, status: job };
  }

  /**
   * Trigger all pipelines in sequence
   */
  async triggerAllIngestions(
    fileMap: Partial<Record<IngestionSource, string>>,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<{ jobId: string; status: JobStatus }> {
    const jobId = `job_all_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: JobStatus = {
      id: jobId,
      source: 'all',
      status: 'processing',
      startTime: new Date().toISOString(),
    };
    jobHistory.set(jobId, job);

    try {
      const results = await runAllPipelines(fileMap, this.prisma, options);
      const hasFailure = results.some((r) => r.status === 'failed');
      job.status = hasFailure ? 'failed' : 'completed';
      job.results = results;
      job.endTime = new Date().toISOString();
    } catch (err) {
      job.status = 'failed';
      job.error = err instanceof Error ? err.message : String(err);
      job.endTime = new Date().toISOString();
    }

    return { jobId, status: job };
  }

  /**
   * Get status of all jobs or specific job
   */
  getJobStatus(jobId?: string): JobStatus | JobStatus[] {
    if (jobId) {
      const job = jobHistory.get(jobId);
      if (!job) throw new Error(`Job ${jobId} not found`);
      return job;
    }
    return Array.from(jobHistory.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }

  /**
   * Get available pipeline sources and order
   */
  getPipelineInfo() {
    return {
      order: getPipelineOrder(),
    };
  }
}
