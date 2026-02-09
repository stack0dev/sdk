/**
 * Stack0 Screenshots Client
 * Capture high-quality screenshots of any webpage
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
  Screenshot,
  CreateScreenshotRequest,
  CreateScreenshotResponse,
  GetScreenshotRequest,
  ListScreenshotsRequest,
  ListScreenshotsResponse,
  BatchScreenshotJob,
  CreateBatchScreenshotsRequest,
  ScreenshotBatchJobsResponse,
  ScreenshotSchedule,
  CreateScreenshotScheduleRequest,
  UpdateScreenshotScheduleRequest,
  ScreenshotSchedulesResponse,
} from "./types";

export class Screenshots {
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
   * const { id, status } = await screenshots.capture({
   *   url: 'https://example.com',
   *   format: 'png',
   *   fullPage: true,
   *   deviceType: 'desktop',
   * });
   *
   * // Poll for completion
   * const screenshot = await screenshots.get({ id });
   * console.log(screenshot.imageUrl);
   * ```
   */
  async capture(request: CreateScreenshotRequest): Promise<CreateScreenshotResponse> {
    return this.http.post<CreateScreenshotResponse>("/webdata/screenshots", request);
  }

  /**
   * Get a screenshot by ID
   *
   * @example
   * ```typescript
   * const screenshot = await screenshots.get({ id: 'screenshot-id' });
   * if (screenshot.status === 'completed') {
   *   console.log(screenshot.imageUrl);
   * }
   * ```
   */
  async get(request: GetScreenshotRequest): Promise<Screenshot> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/screenshots/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<Screenshot>(path);
    return this.convertDates(response);
  }

  /**
   * List screenshots with pagination and filters
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await screenshots.list({
   *   status: 'completed',
   *   limit: 20,
   * });
   * ```
   */
  async list(request: ListScreenshotsRequest = {}): Promise<ListScreenshotsResponse> {
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
      items: response.items.map((item) => this.convertDates(item)),
    };
  }

  /**
   * Delete a screenshot
   *
   * @example
   * ```typescript
   * await screenshots.delete({ id: 'screenshot-id' });
   * ```
   */
  async delete(request: GetScreenshotRequest): Promise<{ success: boolean }> {
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
   * const screenshot = await screenshots.captureAndWait({
   *   url: 'https://example.com',
   *   format: 'png',
   * });
   * console.log(screenshot.imageUrl);
   * ```
   */
  async captureAndWait(
    request: CreateScreenshotRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<Screenshot> {
    const { pollInterval = 1000, timeout = 60000 } = options;
    const startTime = Date.now();

    const { id } = await this.capture(request);

    while (Date.now() - startTime < timeout) {
      const screenshot = await this.get({
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
  // BATCH JOBS
  // ==========================================================================

  /**
   * Create a batch screenshot job for multiple URLs
   *
   * @example
   * ```typescript
   * const { id, totalUrls } = await screenshots.batch({
   *   urls: [
   *     'https://example.com',
   *     'https://example.org',
   *   ],
   *   config: { format: 'png', fullPage: true },
   * });
   *
   * // Poll for completion
   * const job = await screenshots.getBatchJob({ id });
   * console.log(`Progress: ${job.processedUrls}/${job.totalUrls}`);
   * ```
   */
  async batch(request: CreateBatchScreenshotsRequest): Promise<CreateBatchResponse> {
    return this.http.post<CreateBatchResponse>("/webdata/batch/screenshots", request);
  }

  /**
   * Get a batch job by ID
   */
  async getBatchJob(request: GetBatchJobRequest): Promise<BatchScreenshotJob> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/batch/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<BatchScreenshotJob>(path);
    return this.convertBatchJobDates(response);
  }

  /**
   * List batch jobs with pagination and filters
   */
  async listBatchJobs(request: ListBatchJobsRequest = {}): Promise<ScreenshotBatchJobsResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    params.set("type", "screenshot");
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ScreenshotBatchJobsResponse>(`/webdata/batch${query ? `?${query}` : ""}`);

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
   * Create a batch screenshot job and wait for completion
   */
  async batchAndWait(
    request: CreateBatchScreenshotsRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<BatchScreenshotJob> {
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
   * Create a scheduled screenshot job
   *
   * @example
   * ```typescript
   * const { id } = await screenshots.createSchedule({
   *   name: 'Daily homepage screenshot',
   *   url: 'https://example.com',
   *   frequency: 'daily',
   *   config: { format: 'png', fullPage: true },
   * });
   * ```
   */
  async createSchedule(request: CreateScreenshotScheduleRequest): Promise<CreateScheduleResponse> {
    return this.http.post<CreateScheduleResponse>("/webdata/schedules", {
      ...request,
      type: "screenshot",
    });
  }

  /**
   * Update a schedule
   */
  async updateSchedule(request: UpdateScreenshotScheduleRequest): Promise<{ success: boolean }> {
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
  async getSchedule(request: GetScheduleRequest): Promise<ScreenshotSchedule> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);

    const query = params.toString();
    const path = `/webdata/schedules/${request.id}${query ? `?${query}` : ""}`;

    const response = await this.http.get<ScreenshotSchedule>(path);
    return this.convertScheduleDates(response);
  }

  /**
   * List schedules with pagination and filters
   */
  async listSchedules(request: ListSchedulesRequest = {}): Promise<ScreenshotSchedulesResponse> {
    const params = new URLSearchParams();

    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    params.set("type", "screenshot");
    if (request.isActive !== undefined) params.set("isActive", request.isActive.toString());
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ScreenshotSchedulesResponse>(`/webdata/schedules${query ? `?${query}` : ""}`);

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
  // HELPERS
  // ==========================================================================

  private convertDates(screenshot: Screenshot): Screenshot {
    if (typeof screenshot.createdAt === "string") {
      screenshot.createdAt = new Date(screenshot.createdAt);
    }
    if (screenshot.completedAt && typeof screenshot.completedAt === "string") {
      screenshot.completedAt = new Date(screenshot.completedAt);
    }
    return screenshot;
  }

  private convertBatchJobDates(job: BatchScreenshotJob): BatchScreenshotJob {
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

  private convertScheduleDates(schedule: ScreenshotSchedule): ScreenshotSchedule {
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
}
