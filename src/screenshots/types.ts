/**
 * Type definitions for Stack0 Screenshot API
 */

import type { Environment, BatchJobStatus, ScheduleFrequency } from "../lib/shared-types";

export type ScreenshotStatus = "pending" | "processing" | "completed" | "failed";
export type ScreenshotFormat = "png" | "jpeg" | "webp" | "pdf";
export type DeviceType = "desktop" | "tablet" | "mobile";
export type ResourceType = "image" | "stylesheet" | "script" | "font" | "media" | "xhr" | "fetch" | "websocket";

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

// Batch types
export interface BatchScreenshotJob {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  type: "screenshot";
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

export interface ScreenshotBatchJobsResponse {
  items: BatchScreenshotJob[];
  nextCursor?: string;
}

// Schedule types
export interface ScreenshotSchedule {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: Environment;
  name: string;
  url: string;
  type: "screenshot";
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

export interface CreateScreenshotScheduleRequest {
  name: string;
  url: string;
  environment?: Environment;
  projectId?: string;
  frequency?: ScheduleFrequency;
  config: {
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
  detectChanges?: boolean;
  changeThreshold?: number;
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateScreenshotScheduleRequest {
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

export interface ScreenshotSchedulesResponse {
  items: ScreenshotSchedule[];
  nextCursor?: string;
}
