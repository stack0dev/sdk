/**
 * Stack0 Crawl Client
 * Recursively crawl a website and extract content from every page.
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  CancelCrawlRequest,
  Crawl,
  CreateCrawlRequest,
  CreateCrawlResponse,
  GetCrawlRequest,
  ListCrawlPagesRequest,
  ListCrawlPagesResponse,
  ListCrawlsRequest,
  ListCrawlsResponse,
} from "./types";

export class Crawl$ {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  /**
   * Start a crawl.
   *
   * @example
   * ```typescript
   * const { id } = await stack0.crawl.start({
   *   url: 'https://docs.example.com',
   *   maxDepth: 3,
   *   maxPages: 200,
   *   formats: ['markdown', 'links'],
   * });
   * ```
   */
  async start(request: CreateCrawlRequest): Promise<CreateCrawlResponse> {
    return this.http.post<CreateCrawlResponse>("/webdata/crawl", request);
  }

  /**
   * Get a crawl by ID. Pass `includePages: true` to include the scraped pages.
   */
  async get(request: GetCrawlRequest): Promise<Crawl> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.includePages) params.set("includePages", "true");
    const query = params.toString();
    return this.http.get<Crawl>(`/webdata/crawl/${request.id}${query ? `?${query}` : ""}`);
  }

  async list(request: ListCrawlsRequest = {}): Promise<ListCrawlsResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    if (request.url) params.set("url", request.url);
    if (request.limit) params.set("limit", String(request.limit));
    if (request.cursor) params.set("cursor", request.cursor);
    const query = params.toString();
    return this.http.get<ListCrawlsResponse>(`/webdata/crawl${query ? `?${query}` : ""}`);
  }

  async listPages(request: ListCrawlPagesRequest): Promise<ListCrawlPagesResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.limit) params.set("limit", String(request.limit));
    if (request.cursor) params.set("cursor", request.cursor);
    const query = params.toString();
    return this.http.get<ListCrawlPagesResponse>(
      `/webdata/crawl/${request.crawlId}/pages${query ? `?${query}` : ""}`,
    );
  }

  async cancel(request: CancelCrawlRequest): Promise<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`/webdata/crawl/${request.id}/cancel`, {
      environment: request.environment,
      projectId: request.projectId,
    });
  }

  async delete(request: CancelCrawlRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    const query = params.toString();
    return this.http.deleteWithBody<{ success: boolean }>(
      `/webdata/crawl/${request.id}${query ? `?${query}` : ""}`,
      request,
    );
  }

  /**
   * Start a crawl and poll until it completes. Returns the full Crawl record
   * with pages included.
   */
  async startAndWait(
    request: CreateCrawlRequest,
    options: { pollInterval?: number; timeout?: number; includePages?: boolean } = {},
  ): Promise<Crawl> {
    const { pollInterval = 2000, timeout = 600_000, includePages = true } = options;
    const { id } = await this.start(request);
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const crawl = await this.get({
        id,
        environment: request.environment,
        projectId: request.projectId,
        includePages,
      });
      if (crawl.status === "completed" || crawl.status === "failed" || crawl.status === "cancelled") {
        if (crawl.status === "failed") throw new Error(crawl.error || "Crawl failed");
        return crawl;
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
    throw new Error("Crawl timed out");
  }
}

export { Crawl$ as Crawl };
