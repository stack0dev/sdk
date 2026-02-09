/**
 * Type definitions for Stack0 AI Extraction API
 */

import type { Environment, BatchJobStatus, ScheduleFrequency } from "../lib/shared-types";

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

export interface ExtractionResult {
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
  items: ExtractionResult[];
  nextCursor?: string;
}

// Batch types
export interface BatchExtractionJob {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  type: "extraction";
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

export interface ExtractionBatchJobsResponse {
  items: BatchExtractionJob[];
  nextCursor?: string;
}

// Schedule types
export interface ExtractionSchedule {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  name: string;
  url: string;
  type: "extraction";
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

export interface CreateExtractionScheduleRequest {
  name: string;
  url: string;
  environment?: Environment;
  projectId?: string;
  frequency?: ScheduleFrequency;
  config: {
    mode?: ExtractionMode;
    schema?: Record<string, unknown>;
    prompt?: string;
    includeLinks?: boolean;
    includeImages?: boolean;
    includeMetadata?: boolean;
    waitForSelector?: string;
    waitForTimeout?: number;
  };
  detectChanges?: boolean;
  changeThreshold?: number;
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateExtractionScheduleRequest {
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

export interface ExtractionSchedulesResponse {
  items: ExtractionSchedule[];
  nextCursor?: string;
}

// Usage types
export interface ExtractionUsage {
  periodStart: Date;
  periodEnd: Date;
  extractionsTotal: number;
  extractionsSuccessful: number;
  extractionsFailed: number;
  extractionCreditsUsed: number;
  extractionTokensUsed: number;
}

export interface GetUsageRequest {
  environment?: Environment;
  periodStart?: string;
  periodEnd?: string;
}

// Daily usage types
export interface DailyUsageItem {
  date: string;
  screenshots: number;
  extractions: number;
  creditsUsed: number;
}

export interface GetDailyUsageResponse {
  days: DailyUsageItem[];
}
