import type { Environment } from "../lib/shared-types";

export type MapStatus = "pending" | "processing" | "completed" | "failed";

export interface CreateMapRequest {
  environment?: Environment;
  projectId?: string;
  url: string;
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
  ignoreSitemap?: boolean;
  sitemapOnly?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMapResponse {
  id: string;
  status: MapStatus;
}

export interface WebdataMap {
  id: string;
  organizationId: string;
  projectId?: string;
  environment: Environment;
  url: string;
  search?: string;
  limit: number;
  includeSubdomains: boolean;
  status: MapStatus;
  urls: string[];
  totalUrls: number;
  sitemapUsed: boolean;
  error?: string;
  processingTimeMs?: number;
  createdAt: Date | string;
  completedAt?: Date | string;
}

export interface GetMapRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListMapsRequest {
  environment?: Environment;
  projectId?: string;
  status?: MapStatus;
  limit?: number;
  cursor?: string;
}

export interface ListMapsResponse {
  items: WebdataMap[];
  nextCursor?: string;
}
