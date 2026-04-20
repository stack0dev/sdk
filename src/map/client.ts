/**
 * Stack0 Map Client
 * Fast URL discovery for a domain — returns every URL without scraping.
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  CreateMapRequest,
  CreateMapResponse,
  GetMapRequest,
  ListMapsRequest,
  ListMapsResponse,
  WebdataMap,
} from "./types";

export class Map$ {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  /**
   * Start a map job.
   *
   * @example
   * ```typescript
   * const { id } = await stack0.map.create({
   *   url: 'https://docs.example.com',
   *   search: 'api',
   *   limit: 1000,
   * });
   * ```
   */
  async create(request: CreateMapRequest): Promise<CreateMapResponse> {
    return this.http.post<CreateMapResponse>("/webdata/map", request);
  }

  async get(request: GetMapRequest): Promise<WebdataMap> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    const query = params.toString();
    return this.http.get<WebdataMap>(`/webdata/map/${request.id}${query ? `?${query}` : ""}`);
  }

  async list(request: ListMapsRequest = {}): Promise<ListMapsResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    if (request.limit) params.set("limit", String(request.limit));
    if (request.cursor) params.set("cursor", request.cursor);
    const query = params.toString();
    return this.http.get<ListMapsResponse>(`/webdata/map${query ? `?${query}` : ""}`);
  }

  async delete(request: GetMapRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    const query = params.toString();
    return this.http.deleteWithBody<{ success: boolean }>(
      `/webdata/map/${request.id}${query ? `?${query}` : ""}`,
      request,
    );
  }

  /**
   * Create a map job and poll until it completes. Maps usually finish in
   * seconds, so default timeout is generous.
   */
  async createAndWait(
    request: CreateMapRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<WebdataMap> {
    const { pollInterval = 1000, timeout = 120_000 } = options;
    const { id } = await this.create(request);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = await this.get({ id, environment: request.environment, projectId: request.projectId });
      if (result.status === "completed" || result.status === "failed") {
        if (result.status === "failed") throw new Error(result.error || "Map failed");
        return result;
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
    throw new Error("Map timed out");
  }
}

export { Map$ as Map };
