/**
 * Stack0 Webdata Client
 * Capture screenshots and extract data from web pages
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  Screenshot,
  CreateScreenshotRequest,
  CreateScreenshotResponse,
  GetScreenshotRequest,
  ListScreenshotsRequest,
  ListScreenshotsResponse,
  Extraction,
  CreateExtractionRequest,
  CreateExtractionResponse,
  GetExtractionRequest,
  ListExtractionsRequest,
  ListExtractionsResponse,
  Schedule,
  CreateScheduleRequest,
  CreateScheduleResponse,
  UpdateScheduleRequest,
  GetScheduleRequest,
  ListSchedulesRequest,
  ListSchedulesResponse,
  Usage,
  GetUsageRequest,
  BatchJob,
  CreateBatchScreenshotsRequest,
  CreateBatchExtractionsRequest,
  CreateBatchResponse,
  GetBatchJobRequest,
  ListBatchJobsRequest,
  ListBatchJobsResponse,
} from "./types";

export class Webdata {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  // ==========================================================================
  // SCREENSHOTS
  // ==========================================================================

  /**
   * Capture a screenshot of a URL
   *
   * @example
   * ```typescript
   * const { id, status } = await webdata.screenshot({
   *   url: 'https://example.com',
   *   format: 'png',
   *   fullPage: true,
   *   deviceType: 'desktop',
   * });
   *
   * // Poll for completion
   * const screenshot = await webdata.getScreenshot({ id });
   * console.log(screenshot.imageUrl);
   * ```
   */
  async screenshot(request: CreateScreenshotRequest): Promise<CreateScreenshotResponse> {
    return this.http.post<CreateScreenshotResponse>("/webdata/screenshots", request);
  }

  /**
   * Get a screenshot by ID
   *
   * @example
   * ```typescript
   * const screenshot = await webdata.getScreenshot({ id: 'screenshot-id' });
   * if (screenshot.status === 'completed') {
   *   console.log(screenshot.imageUrl);
   * }
   * ```
   */
  async getScreenshot(request: GetScreenshotRequest): Promise<Screenshot> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/screenshots/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<Screenshot>(path);
    return this.convertScreenshotDates(response);
  }

  /**
   * List screenshots with pagination and filters
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await webdata.listScreenshots({
   *   status: 'completed',
   *   limit: 20,
   * });
   * ```
   */
  async listScreenshots(request: ListScreenshotsRequest = {}): Promise<ListScreenshotsResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    if (request.url) params.set("url", request.url);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ListScreenshotsResponse>(`/webdata/screenshots${query ? `?${query}` : ""}`);

    return {
      ...response,
      items: response.items.map((item) => this.convertScreenshotDates(item)),
    };
  }

  /**
   * Delete a screenshot
   *
   * @example
   * ```typescript
   * await webdata.deleteScreenshot({ id: 'screenshot-id' });
   * ```
   */
  async deleteScreenshot(request: GetScreenshotRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    return this.http.deleteWithBody<{ success: boolean }>(
      `/webdata/screenshots/${request.id}${query ? `?${query}` : ""}`,
      {
        id: request.id,
        environment: request.environment,
        projectId: request.projectId,
      },
    );
  }

  /**
   * Capture a screenshot and wait for completion
   *
   * @example
   * ```typescript
   * const screenshot = await webdata.screenshotAndWait({
   *   url: 'https://example.com',
   *   format: 'png',
   * });
   * console.log(screenshot.imageUrl);
   * ```
   */
  async screenshotAndWait(
    request: CreateScreenshotRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<Screenshot> {
    const { pollInterval = 1000, timeout = 60000 } = options;
    const startTime = Date.now();

    const { id } = await this.screenshot(request);

    while (Date.now() - startTime < timeout) {
      const screenshot = await this.getScreenshot({
        id,
        environment: request.environment,
        projectId: request.projectId,
      });

      if (screenshot.status === "completed" || screenshot.status === "failed") {
        if (screenshot.status === "failed") {
          throw new Error(screenshot.error || "Screenshot failed");
        }
        return screenshot;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Screenshot timed out");
  }

  // ==========================================================================
  // EXTRACTIONS
  // ==========================================================================

  /**
   * Extract content from a URL
   *
   * @example
   * ```typescript
   * const { id, status } = await webdata.extract({
   *   url: 'https://example.com/article',
   *   mode: 'markdown',
   *   includeMetadata: true,
   * });
   *
   * // Poll for completion
   * const extraction = await webdata.getExtraction({ id });
   * console.log(extraction.markdown);
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
   * const extraction = await webdata.getExtraction({ id: 'extraction-id' });
   * if (extraction.status === 'completed') {
   *   console.log(extraction.markdown);
   *   console.log(extraction.pageMetadata);
   * }
   * ```
   */
  async getExtraction(request: GetExtractionRequest): Promise<Extraction> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/extractions/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<Extraction>(path);
    return this.convertExtractionDates(response);
  }

  /**
   * List extractions with pagination and filters
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await webdata.listExtractions({
   *   status: 'completed',
   *   limit: 20,
   * });
   * ```
   */
  async listExtractions(request: ListExtractionsRequest = {}): Promise<ListExtractionsResponse> {
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
      items: response.items.map((item) => this.convertExtractionDates(item)),
    };
  }

  /**
   * Delete an extraction
   *
   * @example
   * ```typescript
   * await webdata.deleteExtraction({ id: 'extraction-id' });
   * ```
   */
  async deleteExtraction(request: GetExtractionRequest): Promise<{ success: boolean }> {
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
   * const extraction = await webdata.extractAndWait({
   *   url: 'https://example.com/article',
   *   mode: 'markdown',
   * });
   * console.log(extraction.markdown);
   * ```
   */
  async extractAndWait(
    request: CreateExtractionRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<Extraction> {
    const { pollInterval = 1000, timeout = 60000 } = options;
    const startTime = Date.now();

    const { id } = await this.extract(request);

    while (Date.now() - startTime < timeout) {
      const extraction = await this.getExtraction({
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
  // SCHEDULES
  // ==========================================================================

  /**
   * Create a scheduled screenshot or extraction job
   *
   * @example
   * ```typescript
   * const { id } = await webdata.createSchedule({
   *   name: 'Daily homepage screenshot',
   *   url: 'https://example.com',
   *   type: 'screenshot',
   *   frequency: 'daily',
   *   config: { format: 'png', fullPage: true },
   * });
   * ```
   */
  async createSchedule(request: CreateScheduleRequest): Promise<CreateScheduleResponse> {
    return this.http.post<CreateScheduleResponse>("/webdata/schedules", request);
  }

  /**
   * Update a schedule
   *
   * @example
   * ```typescript
   * await webdata.updateSchedule({
   *   id: 'schedule-id',
   *   frequency: 'weekly',
   *   isActive: false,
   * });
   * ```
   */
  async updateSchedule(request: UpdateScheduleRequest): Promise<{ success: boolean }> {
    const { id, environment, projectId, ...data } = request;

    const params = new URLSearchParams();
    if (environment) params.set("environment", environment);
    if (projectId) params.set("projectId", projectId);

    const query = params.toString();
    return this.http.patch<{ success: boolean }>(`/webdata/schedules/${id}${query ? `?${query}` : ""}`, data);
  }

  /**
   * Get a schedule by ID
   *
   * @example
   * ```typescript
   * const schedule = await webdata.getSchedule({ id: 'schedule-id' });
   * console.log(schedule.nextRunAt);
   * ```
   */
  async getSchedule(request: GetScheduleRequest): Promise<Schedule> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/schedules/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<Schedule>(path);
    return this.convertScheduleDates(response);
  }

  /**
   * List schedules with pagination and filters
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await webdata.listSchedules({
   *   type: 'screenshot',
   *   isActive: true,
   * });
   * ```
   */
  async listSchedules(request: ListSchedulesRequest = {}): Promise<ListSchedulesResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.type) params.set("type", request.type);
    if (request.isActive !== undefined) params.set("isActive", request.isActive.toString());
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ListSchedulesResponse>(`/webdata/schedules${query ? `?${query}` : ""}`);

    return {
      ...response,
      items: response.items.map((item) => this.convertScheduleDates(item)),
    };
  }

  /**
   * Delete a schedule
   *
   * @example
   * ```typescript
   * await webdata.deleteSchedule({ id: 'schedule-id' });
   * ```
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
   *
   * @example
   * ```typescript
   * const { isActive } = await webdata.toggleSchedule({ id: 'schedule-id' });
   * console.log(`Schedule is now ${isActive ? 'active' : 'paused'}`);
   * ```
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
   * const usage = await webdata.getUsage({
   *   periodStart: '2024-01-01T00:00:00Z',
   *   periodEnd: '2024-01-31T23:59:59Z',
   * });
   * console.log(`Screenshots: ${usage.screenshotsTotal}`);
   * console.log(`Extractions: ${usage.extractionsTotal}`);
   * ```
   */
  async getUsage(request: GetUsageRequest = {}): Promise<Usage> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.periodStart) params.set("periodStart", request.periodStart);
    if (request.periodEnd) params.set("periodEnd", request.periodEnd);

    const query = params.toString();
    const response = await this.http.get<Usage>(`/webdata/usage${query ? `?${query}` : ""}`);

    return this.convertUsageDates(response);
  }

  // ==========================================================================
  // BATCH JOBS
  // ==========================================================================

  /**
   * Create a batch screenshot job for multiple URLs
   *
   * @example
   * ```typescript
   * const { id, totalUrls } = await webdata.batchScreenshots({
   *   urls: [
   *     'https://example.com',
   *     'https://example.org',
   *   ],
   *   config: { format: 'png', fullPage: true },
   * });
   *
   * // Poll for completion
   * const job = await webdata.getBatchJob({ id });
   * console.log(`Progress: ${job.processedUrls}/${job.totalUrls}`);
   * ```
   */
  async batchScreenshots(request: CreateBatchScreenshotsRequest): Promise<CreateBatchResponse> {
    return this.http.post<CreateBatchResponse>("/webdata/batch/screenshots", request);
  }

  /**
   * Create a batch extraction job for multiple URLs
   *
   * @example
   * ```typescript
   * const { id, totalUrls } = await webdata.batchExtractions({
   *   urls: [
   *     'https://example.com/article1',
   *     'https://example.com/article2',
   *   ],
   *   config: { mode: 'markdown' },
   * });
   * ```
   */
  async batchExtractions(request: CreateBatchExtractionsRequest): Promise<CreateBatchResponse> {
    return this.http.post<CreateBatchResponse>("/webdata/batch/extractions", request);
  }

  /**
   * Get a batch job by ID
   *
   * @example
   * ```typescript
   * const job = await webdata.getBatchJob({ id: 'batch-id' });
   * console.log(`Status: ${job.status}`);
   * console.log(`Progress: ${job.processedUrls}/${job.totalUrls}`);
   * ```
   */
  async getBatchJob(request: GetBatchJobRequest): Promise<BatchJob> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/batch/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<BatchJob>(path);
    return this.convertBatchJobDates(response);
  }

  /**
   * List batch jobs with pagination and filters
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await webdata.listBatchJobs({
   *   status: 'completed',
   *   type: 'screenshot',
   *   limit: 20,
   * });
   * ```
   */
  async listBatchJobs(request: ListBatchJobsRequest = {}): Promise<ListBatchJobsResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    if (request.type) params.set("type", request.type);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ListBatchJobsResponse>(`/webdata/batch${query ? `?${query}` : ""}`);

    return {
      ...response,
      items: response.items.map((item) => this.convertBatchJobDates(item)),
    };
  }

  /**
   * Cancel a batch job
   *
   * @example
   * ```typescript
   * await webdata.cancelBatchJob({ id: 'batch-id' });
   * ```
   */
  async cancelBatchJob(request: GetBatchJobRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    return this.http.post<{ success: boolean }>(`/webdata/batch/${request.id}/cancel${query ? `?${query}` : ""}`, {});
  }

  /**
   * Create a batch screenshot job and wait for completion
   *
   * @example
   * ```typescript
   * const job = await webdata.batchScreenshotsAndWait({
   *   urls: ['https://example.com', 'https://example.org'],
   *   config: { format: 'png' },
   * });
   * console.log(`Completed: ${job.successfulUrls} successful, ${job.failedUrls} failed`);
   * ```
   */
  async batchScreenshotsAndWait(
    request: CreateBatchScreenshotsRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<BatchJob> {
    const { pollInterval = 2000, timeout = 300000 } = options;
    const startTime = Date.now();

    const { id } = await this.batchScreenshots(request);

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

  /**
   * Create a batch extraction job and wait for completion
   *
   * @example
   * ```typescript
   * const job = await webdata.batchExtractionsAndWait({
   *   urls: ['https://example.com/article1', 'https://example.com/article2'],
   *   config: { mode: 'markdown' },
   * });
   * console.log(`Completed: ${job.successfulUrls} successful`);
   * ```
   */
  async batchExtractionsAndWait(
    request: CreateBatchExtractionsRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<BatchJob> {
    const { pollInterval = 2000, timeout = 300000 } = options;
    const startTime = Date.now();

    const { id } = await this.batchExtractions(request);

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
  // HELPERS
  // ==========================================================================

  private convertScreenshotDates(screenshot: Screenshot): Screenshot {
    if (typeof screenshot.createdAt === "string") {
      screenshot.createdAt = new Date(screenshot.createdAt);
    }
    if (screenshot.completedAt && typeof screenshot.completedAt === "string") {
      screenshot.completedAt = new Date(screenshot.completedAt);
    }
    return screenshot;
  }

  private convertExtractionDates(extraction: Extraction): Extraction {
    if (typeof extraction.createdAt === "string") {
      extraction.createdAt = new Date(extraction.createdAt);
    }
    if (extraction.completedAt && typeof extraction.completedAt === "string") {
      extraction.completedAt = new Date(extraction.completedAt);
    }
    return extraction;
  }

  private convertScheduleDates(schedule: Schedule): Schedule {
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

  private convertUsageDates(usage: Usage): Usage {
    if (typeof usage.periodStart === "string") {
      usage.periodStart = new Date(usage.periodStart);
    }
    if (typeof usage.periodEnd === "string") {
      usage.periodEnd = new Date(usage.periodEnd);
    }
    return usage;
  }

  private convertBatchJobDates(job: BatchJob): BatchJob {
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
}
