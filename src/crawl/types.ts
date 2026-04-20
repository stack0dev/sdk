import type { Environment } from "../lib/shared-types";

export type CrawlStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export type ScrapeActionType = "click" | "type" | "press" | "scroll" | "wait" | "screenshot" | "execute_js" | "extract";

export type ScrapeAction =
  | { type: "click"; selector: string; waitAfter?: number }
  | { type: "type"; selector: string; text: string; delay?: number }
  | { type: "press"; key: string }
  | { type: "scroll"; direction?: "up" | "down"; pixels?: number }
  | { type: "wait"; selector?: string; timeout?: number }
  | { type: "screenshot"; fullPage?: boolean }
  | { type: "execute_js"; script: string }
  | { type: "extract"; schema?: Record<string, unknown>; prompt?: string };

export type ProxyType = "none" | "auto" | "residential" | "datacenter";

export type ScrapeFormat = "markdown" | "html" | "rawHtml" | "links" | "screenshot" | "metadata" | "extract";

export interface ScrapeOptions {
  formats?: ScrapeFormat[];
  onlyMainContent?: boolean;
  includeLinks?: boolean;
  includeImages?: boolean;
  includeMetadata?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
  actions?: ScrapeAction[];
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain?: string }>;
  proxy?: ProxyType;
  proxyLocation?: string;
  stealth?: boolean;
  extractSchema?: Record<string, unknown>;
  extractPrompt?: string;
}

export interface CreateCrawlRequest {
  environment?: Environment;
  projectId?: string;
  url: string;
  maxDepth?: number;
  maxPages?: number;
  limit?: number;
  includePaths?: string[];
  excludePaths?: string[];
  allowSubdomains?: boolean;
  allowBackwardLinks?: boolean;
  respectRobotsTxt?: boolean;
  scrapeOptions?: ScrapeOptions;
  formats?: Array<"markdown" | "html" | "links" | "screenshot">;
  proxy?: ProxyType;
  proxyLocation?: string;
  stealth?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateCrawlResponse {
  id: string;
  status: CrawlStatus;
}

export interface CrawlPage {
  id: string;
  crawlId: string;
  url: string;
  depth: number;
  status: "pending" | "processing" | "completed" | "failed";
  markdown?: string;
  html?: string;
  links?: string[];
  pageMetadata?: Record<string, unknown>;
  screenshotUrl?: string;
  error?: string;
  processingTimeMs?: number;
  createdAt: Date | string;
  completedAt?: Date | string;
}

export interface Crawl {
  id: string;
  organizationId: string;
  projectId?: string;
  environment: Environment;
  url: string;
  maxDepth: number;
  maxPages: number;
  includePaths?: string[];
  excludePaths?: string[];
  allowSubdomains: boolean;
  respectRobotsTxt: boolean;
  formats: string[];
  proxy: ProxyType;
  stealth: boolean;
  status: CrawlStatus;
  pagesDiscovered: number;
  pagesScraped: number;
  pagesFailed: number;
  error?: string;
  pages?: CrawlPage[];
  createdAt: Date | string;
  startedAt?: Date | string;
  completedAt?: Date | string;
}

export interface GetCrawlRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
  includePages?: boolean;
}

export interface ListCrawlsRequest {
  environment?: Environment;
  projectId?: string;
  status?: CrawlStatus;
  url?: string;
  limit?: number;
  cursor?: string;
}

export interface ListCrawlsResponse {
  items: Crawl[];
  nextCursor?: string;
}

export interface ListCrawlPagesRequest {
  crawlId: string;
  environment?: Environment;
  projectId?: string;
  limit?: number;
  cursor?: string;
}

export interface ListCrawlPagesResponse {
  items: CrawlPage[];
  nextCursor?: string;
}

export interface CancelCrawlRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}
