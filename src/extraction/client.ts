/**
 * Stack0 AI Extraction Client
 * Extract structured data from any webpage using AI
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  CreateBatchResponse,
  GetBatchJobRequest,
  ListBatchJobsRequest,
  CreateScheduleResponse,
  GetScheduleRequest,
  ListSchedulesRequest,
} from "../lib/shared-types";
import type {
  ExtractionResult,
  CreateExtractionRequest,
  CreateExtractionResponse,
  GetExtractionRequest,
  ListExtractionsRequest,
  ListExtractionsResponse,
  BatchExtractionJob,
  CreateBatchExtractionsRequest,
  ExtractionBatchJobsResponse,
  ExtractionSchedule,
  CreateExtractionScheduleRequest,
  UpdateExtractionScheduleRequest,
  ExtractionSchedulesResponse,
  ExtractionUsage,
  GetUsageRequest,
  GetDailyUsageResponse,
} from "./types";

export class Extraction {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  // ==========================================================================
  // EXTRACTIONS
  // ==========================================================================

  /**
   * Extract content from a URL
   *
   * @example
   * ```typescript
   * const { id, status } = await extraction.extract({
   *   url: 'https://example.com/article',
   *   mode: 'markdown',
   *   includeMetadata: true,
   * });
   *
   * // Poll for completion
   * const result = await extraction.get({ id });
   * console.log(result.markdown);
   * ```
   */
  async extract(request: CreateExtractionRequest): Promise<CreateExtractionResponse> {
    return this.http.post<CreateExtractionResponse>("/webdata/extractions", request);
  }

  /**
   * Get an extraction by ID
   *
   * @example
   * ```typescript
   * const extraction = await extraction.get({ id: 'extraction-id' });
   * if (extraction.status === 'completed') {
   *   console.log(extraction.markdown);
   *   console.log(extraction.pageMetadata);
   * }
   * ```
   */
  async get(request: GetExtractionRequest): Promise<ExtractionResult> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/extractions/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<ExtractionResult>(path);
    return this.convertDates(response);
  }

  /**
   * List extractions with pagination and filters
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await extraction.list({
   *   status: 'completed',
   *   limit: 20,
   * });
   * ```
   */
  async list(request: ListExtractionsRequest = {}): Promise<ListExtractionsResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    if (request.url) params.set("url", request.url);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ListExtractionsResponse>(`/webdata/extractions${query ? `?${query}` : ""}`);

    return {
      ...response,
      items: response.items.map((item) => this.convertDates(item)),
    };
  }

  /**
   * Delete an extraction
   *
   * @example
   * ```typescript
   * await extraction.delete({ id: 'extraction-id' });
   * ```
   */
  async delete(request: GetExtractionRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    return this.http.deleteWithBody<{ success: boolean }>(
      `/webdata/extractions/${request.id}${query ? `?${query}` : ""}`,
      {
        id: request.id,
        environment: request.environment,
        projectId: request.projectId,
      },
    );
  }

  /**
   * Extract content and wait for completion
   *
   * @example
   * ```typescript
   * const extraction = await extraction.extractAndWait({
   *   url: 'https://example.com/article',
   *   mode: 'markdown',
   * });
   * console.log(extraction.markdown);
   * ```
   */
  async extractAndWait(
    request: CreateExtractionRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<ExtractionResult> {
    const { pollInterval = 1000, timeout = 60000 } = options;
    const startTime = Date.now();

    const { id } = await this.extract(request);

    while (Date.now() - startTime < timeout) {
      const extraction = await this.get({
        id,
        environment: request.environment,
        projectId: request.projectId,
      });

      if (extraction.status === "completed" || extraction.status === "failed") {
        if (extraction.status === "failed") {
          throw new Error(extraction.error || "Extraction failed");
        }
        return extraction;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Extraction timed out");
  }

  // ==========================================================================
  // BATCH JOBS
  // ==========================================================================

  /**
   * Create a batch extraction job for multiple URLs
   *
   * @example
   * ```typescript
   * const { id, totalUrls } = await extraction.batch({
   *   urls: [
   *     'https://example.com/article1',
   *     'https://example.com/article2',
   *   ],
   *   config: { mode: 'markdown' },
   * });
   * ```
   */
  async batch(request: CreateBatchExtractionsRequest): Promise<CreateBatchResponse> {
    return this.http.post<CreateBatchResponse>("/webdata/batch/extractions", request);
  }

  /**
   * Get a batch job by ID
   */
  async getBatchJob(request: GetBatchJobRequest): Promise<BatchExtractionJob> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/batch/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<BatchExtractionJob>(path);
    return this.convertBatchJobDates(response);
  }

  /**
   * List batch jobs with pagination and filters
   */
  async listBatchJobs(request: ListBatchJobsRequest = {}): Promise<ExtractionBatchJobsResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    params.set("type", "extraction");
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ExtractionBatchJobsResponse>(`/webdata/batch${query ? `?${query}` : ""}`);

    return {
      ...response,
      items: response.items.map((item) => this.convertBatchJobDates(item)),
    };
  }

  /**
   * Cancel a batch job
   */
  async cancelBatchJob(request: GetBatchJobRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    return this.http.post<{ success: boolean }>(`/webdata/batch/${request.id}/cancel${query ? `?${query}` : ""}`, {});
  }

  /**
   * Create a batch extraction job and wait for completion
   */
  async batchAndWait(
    request: CreateBatchExtractionsRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<BatchExtractionJob> {
    const { pollInterval = 2000, timeout = 300000 } = options;
    const startTime = Date.now();

    const { id } = await this.batch(request);

    while (Date.now() - startTime < timeout) {
      const job = await this.getBatchJob({
        id,
        environment: request.environment,
        projectId: request.projectId,
      });

      if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
        return job;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Batch job timed out");
  }

  // ==========================================================================
  // SCHEDULES
  // ==========================================================================

  /**
   * Create a scheduled extraction job
   *
   * @example
   * ```typescript
   * const { id } = await extraction.createSchedule({
   *   name: 'Daily price monitoring',
   *   url: 'https://competitor.com/pricing',
   *   frequency: 'daily',
   *   config: { mode: 'schema', schema: { ... } },
   * });
   * ```
   */
  async createSchedule(request: CreateExtractionScheduleRequest): Promise<CreateScheduleResponse> {
    return this.http.post<CreateScheduleResponse>("/webdata/schedules", {
      ...request,
      type: "extraction",
    });
  }

  /**
   * Update a schedule
   */
  async updateSchedule(request: UpdateExtractionScheduleRequest): Promise<{ success: boolean }> {
    const { id, environment, projectId, ...data } = request;

    const params = new URLSearchParams();
    if (environment) params.set("environment", environment);
    if (projectId) params.set("projectId", projectId);

    const query = params.toString();
    return this.http.post<{ success: boolean }>(`/webdata/schedules/${id}${query ? `?${query}` : ""}`, data);
  }

  /**
   * Get a schedule by ID
   */
  async getSchedule(request: GetScheduleRequest): Promise<ExtractionSchedule> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/schedules/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<ExtractionSchedule>(path);
    return this.convertScheduleDates(response);
  }

  /**
   * List schedules with pagination and filters
   */
  async listSchedules(request: ListSchedulesRequest = {}): Promise<ExtractionSchedulesResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    params.set("type", "extraction");
    if (request.isActive !== undefined) params.set("isActive", request.isActive.toString());
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ExtractionSchedulesResponse>(`/webdata/schedules${query ? `?${query}` : ""}`);

    return {
      ...response,
      items: response.items.map((item) => this.convertScheduleDates(item)),
    };
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(request: GetScheduleRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    return this.http.deleteWithBody<{ success: boolean }>(
      `/webdata/schedules/${request.id}${query ? `?${query}` : ""}`,
      {
        id: request.id,
        environment: request.environment,
        projectId: request.projectId,
      },
    );
  }

  /**
   * Toggle a schedule on or off
   */
  async toggleSchedule(request: GetScheduleRequest): Promise<{ isActive: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    return this.http.post<{ isActive: boolean }>(
      `/webdata/schedules/${request.id}/toggle${query ? `?${query}` : ""}`,
      {},
    );
  }

  // ==========================================================================
  // USAGE
  // ==========================================================================

  /**
   * Get usage statistics
   *
   * @example
   * ```typescript
   * const usage = await extraction.getUsage({
   *   periodStart: '2024-01-01T00:00:00Z',
   *   periodEnd: '2024-01-31T23:59:59Z',
   * });
   * console.log(`Extractions: ${usage.extractionsTotal}`);
   * console.log(`Tokens used: ${usage.extractionTokensUsed}`);
   * ```
   */
  async getUsage(request: GetUsageRequest = {}): Promise<ExtractionUsage> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.periodStart) params.set("periodStart", request.periodStart);
    if (request.periodEnd) params.set("periodEnd", request.periodEnd);

    const query = params.toString();
    const response = await this.http.get<ExtractionUsage>(`/webdata/usage${query ? `?${query}` : ""}`);

    return this.convertUsageDates(response);
  }

  /**
   * Get daily usage breakdown
   *
   * @example
   * ```typescript
   * const { days } = await extraction.getUsageDaily({
   *   periodStart: '2024-01-01T00:00:00Z',
   *   periodEnd: '2024-01-31T23:59:59Z',
   * });
   * days.forEach(day => {
   *   console.log(`${day.date}: ${day.screenshots} screenshots, ${day.extractions} extractions`);
   * });
   * ```
   */
  async getUsageDaily(request: GetUsageRequest = {}): Promise<GetDailyUsageResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.periodStart) params.set("periodStart", request.periodStart);
    if (request.periodEnd) params.set("periodEnd", request.periodEnd);

    const query = params.toString();
    return this.http.get<GetDailyUsageResponse>(`/webdata/usage/daily${query ? `?${query}` : ""}`);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private convertDates(extraction: ExtractionResult): ExtractionResult {
    if (typeof extraction.createdAt === "string") {
      extraction.createdAt = new Date(extraction.createdAt);
    }
    if (extraction.completedAt && typeof extraction.completedAt === "string") {
      extraction.completedAt = new Date(extraction.completedAt);
    }
    return extraction;
  }

  private convertBatchJobDates(job: BatchExtractionJob): BatchExtractionJob {
    if (typeof job.createdAt === "string") {
      job.createdAt = new Date(job.createdAt);
    }
    if (job.startedAt && typeof job.startedAt === "string") {
      job.startedAt = new Date(job.startedAt);
    }
    if (job.completedAt && typeof job.completedAt === "string") {
      job.completedAt = new Date(job.completedAt);
    }
    return job;
  }

  private convertScheduleDates(schedule: ExtractionSchedule): ExtractionSchedule {
    if (typeof schedule.createdAt === "string") {
      schedule.createdAt = new Date(schedule.createdAt);
    }
    if (typeof schedule.updatedAt === "string") {
      schedule.updatedAt = new Date(schedule.updatedAt);
    }
    if (schedule.lastRunAt && typeof schedule.lastRunAt === "string") {
      schedule.lastRunAt = new Date(schedule.lastRunAt);
    }
    if (schedule.nextRunAt && typeof schedule.nextRunAt === "string") {
      schedule.nextRunAt = new Date(schedule.nextRunAt);
    }
    return schedule;
  }

  private convertUsageDates(usage: ExtractionUsage): ExtractionUsage {
    if (typeof usage.periodStart === "string") {
      usage.periodStart = new Date(usage.periodStart);
    }
    if (typeof usage.periodEnd === "string") {
      usage.periodEnd = new Date(usage.periodEnd);
    }
    return usage;
  }
}
