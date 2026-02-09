/**
 * Type definitions for Stack0 Webdata API
 */

// ============================================================================
// COMMON
// ============================================================================

export type Environment = "sandbox" | "production";

// ============================================================================
// SCREENSHOTS
// ============================================================================

export type ScreenshotStatus = "pending" | "processing" | "completed" | "failed";
export type ScreenshotFormat = "png" | "jpeg" | "webp" | "pdf";
export type DeviceType = "desktop" | "tablet" | "mobile";

export interface Screenshot {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  url: string;
  format: ScreenshotFormat;
  quality: number | null;
  fullPage: boolean;
  deviceType: DeviceType;
  viewportWidth: number | null;
  viewportHeight: number | null;
  status: ScreenshotStatus;
  imageUrl: string | null;
  imageSize: number | null;
  imageWidth: number | null;
  imageHeight: number | null;
  error: string | null;
  processingTimeMs: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  completedAt: Date | null;
}

export type ResourceType = "image" | "stylesheet" | "script" | "font" | "media" | "xhr" | "fetch" | "websocket";

export interface Clip {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CreateScreenshotRequest {
  url: string;
  environment?: Environment;
  projectId?: string;
  format?: ScreenshotFormat;
  quality?: number;
  fullPage?: boolean;
  deviceType?: DeviceType;
  viewportWidth?: number;
  viewportHeight?: number;
  deviceScaleFactor?: number;
  waitForSelector?: string;
  waitForTimeout?: number;
  blockAds?: boolean;
  blockCookieBanners?: boolean;
  blockChatWidgets?: boolean;
  blockTrackers?: boolean;
  blockUrls?: string[];
  blockResources?: ResourceType[];
  darkMode?: boolean;
  customCss?: string;
  customJs?: string;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain?: string }>;
  // Advanced options
  selector?: string;
  hideSelectors?: string[];
  clickSelector?: string;
  omitBackground?: boolean;
  userAgent?: string;
  clip?: Clip;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  // Caching
  cacheKey?: string;
  cacheTtl?: number;
  // Webhook
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateScreenshotResponse {
  id: string;
  status: ScreenshotStatus;
}

export interface GetScreenshotRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListScreenshotsRequest {
  environment?: Environment;
  projectId?: string;
  status?: ScreenshotStatus;
  url?: string;
  limit?: number;
  cursor?: string;
}

export interface ListScreenshotsResponse {
  items: Screenshot[];
  nextCursor?: string;
}

// ============================================================================
// EXTRACTIONS
// ============================================================================

export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";
export type ExtractionMode = "auto" | "schema" | "markdown" | "raw";

export interface PageMetadata {
  title?: string;
  description?: string;
  ogImage?: string;
  favicon?: string;
  links?: string[];
  images?: string[];
}

export interface Extraction {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  url: string;
  mode: string;
  status: ExtractionStatus;
  extractedData: Record<string, unknown> | null;
  markdown: string | null;
  rawHtml: string | null;
  pageMetadata: PageMetadata | null;
  error: string | null;
  processingTimeMs: number | null;
  tokensUsed: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface CreateExtractionRequest {
  url: string;
  environment?: Environment;
  projectId?: string;
  mode?: ExtractionMode;
  schema?: Record<string, unknown>;
  prompt?: string;
  includeLinks?: boolean;
  includeImages?: boolean;
  includeMetadata?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain?: string }>;
  // Webhook
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateExtractionResponse {
  id: string;
  status: ExtractionStatus;
}

export interface GetExtractionRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListExtractionsRequest {
  environment?: Environment;
  projectId?: string;
  status?: ExtractionStatus;
  url?: string;
  limit?: number;
  cursor?: string;
}

export interface ListExtractionsResponse {
  items: Extraction[];
  nextCursor?: string;
}

// ============================================================================
// SCHEDULES
// ============================================================================

export type ScheduleFrequency = "hourly" | "daily" | "weekly" | "monthly";
export type ScheduleType = "screenshot" | "extraction";

export interface Schedule {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  name: string;
  url: string;
  type: ScheduleType;
  frequency: ScheduleFrequency;
  config: Record<string, unknown>;
  isActive: boolean;
  detectChanges: boolean;
  changeThreshold: number | null;
  webhookUrl: string | null;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleRequest {
  name: string;
  url: string;
  type: ScheduleType;
  environment?: Environment;
  projectId?: string;
  frequency?: ScheduleFrequency;
  config: Record<string, unknown>;
  detectChanges?: boolean;
  changeThreshold?: number;
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateScheduleResponse {
  id: string;
}

export interface UpdateScheduleRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
  name?: string;
  frequency?: ScheduleFrequency;
  config?: Record<string, unknown>;
  isActive?: boolean;
  detectChanges?: boolean;
  changeThreshold?: number;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  metadata?: Record<string, unknown>;
}

export interface GetScheduleRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListSchedulesRequest {
  environment?: Environment;
  projectId?: string;
  type?: ScheduleType;
  isActive?: boolean;
  limit?: number;
  cursor?: string;
}

export interface ListSchedulesResponse {
  items: Schedule[];
  nextCursor?: string;
}

// ============================================================================
// USAGE
// ============================================================================

export interface Usage {
  periodStart: Date;
  periodEnd: Date;
  screenshotsTotal: number;
  screenshotsSuccessful: number;
  screenshotsFailed: number;
  screenshotCreditsUsed: number;
  extractionsTotal: number;
  extractionsSuccessful: number;
  extractionsFailed: number;
  extractionCreditsUsed: number;
  extractionTokensUsed: number;
  batchJobsTotal: number;
  batchUrlsProcessed: number;
}

export interface GetUsageRequest {
  environment?: Environment;
  periodStart?: string;
  periodEnd?: string;
}

// ============================================================================
// BATCH JOBS
// ============================================================================

export type BatchJobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type BatchJobType = "screenshot" | "extraction";

export interface BatchJob {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  type: BatchJobType;
  name: string | null;
  status: BatchJobStatus;
  urls: string[];
  config: Record<string, unknown>;
  totalUrls: number;
  processedUrls: number;
  successfulUrls: number;
  failedUrls: number;
  webhookUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface CreateBatchScreenshotsRequest {
  urls: string[];
  environment?: Environment;
  projectId?: string;
  name?: string;
  config?: {
    format?: ScreenshotFormat;
    quality?: number;
    fullPage?: boolean;
    deviceType?: DeviceType;
    viewportWidth?: number;
    viewportHeight?: number;
    blockAds?: boolean;
    blockCookieBanners?: boolean;
    waitForSelector?: string;
    waitForTimeout?: number;
  };
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateBatchExtractionsRequest {
  urls: string[];
  environment?: Environment;
  projectId?: string;
  name?: string;
  config?: {
    mode?: ExtractionMode;
    schema?: Record<string, unknown>;
    prompt?: string;
    includeLinks?: boolean;
    includeImages?: boolean;
    includeMetadata?: boolean;
    waitForSelector?: string;
    waitForTimeout?: number;
  };
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateBatchResponse {
  id: string;
  status: BatchJobStatus;
  totalUrls: number;
}

export interface GetBatchJobRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListBatchJobsRequest {
  environment?: Environment;
  projectId?: string;
  status?: BatchJobStatus;
  type?: BatchJobType;
  limit?: number;
  cursor?: string;
}

export interface ListBatchJobsResponse {
  items: BatchJob[];
  nextCursor?: string;
}
