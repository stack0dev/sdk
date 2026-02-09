/**
 * Campaigns client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  Campaign,
  CampaignStatsResponse,
  CancelCampaignResponse,
  CreateCampaignRequest,
  DeleteCampaignResponse,
  ListCampaignsRequest,
  ListCampaignsResponse,
  PauseCampaignResponse,
  SendCampaignRequest,
  SendCampaignResponse,
  UpdateCampaignRequest,
} from "./types";

export class Campaigns {
  constructor(private http: HttpClient) {}

  /**
   * List all campaigns
   */
  async list(request: ListCampaignsRequest = {}): Promise<ListCampaignsResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.search) params.set("search", request.search);
    if (request.status) params.set("status", request.status);

    const query = params.toString();
    return this.http.get<ListCampaignsResponse>(`/mail/campaigns${query ? `?${query}` : ""}`);
  }

  /**
   * Get a campaign by ID
   */
  async get(id: string): Promise<Campaign> {
    return this.http.get<Campaign>(`/mail/campaigns/${id}`);
  }

  /**
   * Create a new campaign
   */
  async create(request: CreateCampaignRequest): Promise<Campaign> {
    return this.http.post<Campaign>("/mail/campaigns", request);
  }

  /**
   * Update a campaign
   */
  async update(request: UpdateCampaignRequest): Promise<Campaign> {
    const { id, ...data } = request;
    return this.http.put<Campaign>(`/mail/campaigns/${id}`, data);
  }

  /**
   * Delete a campaign
   */
  async delete(id: string): Promise<DeleteCampaignResponse> {
    return this.http.delete<DeleteCampaignResponse>(`/mail/campaigns/${id}`);
  }

  /**
   * Send a campaign
   */
  async send(request: SendCampaignRequest): Promise<SendCampaignResponse> {
    const { id, ...data } = request;
    return this.http.post<SendCampaignResponse>(`/mail/campaigns/${id}/send`, data);
  }

  /**
   * Pause a sending campaign
   */
  async pause(id: string): Promise<PauseCampaignResponse> {
    return this.http.post<PauseCampaignResponse>(`/mail/campaigns/${id}/pause`, {});
  }

  /**
   * Cancel a campaign
   */
  async cancel(id: string): Promise<CancelCampaignResponse> {
    return this.http.post<CancelCampaignResponse>(`/mail/campaigns/${id}/cancel`, {});
  }

  /**
   * Duplicate a campaign
   */
  async duplicate(id: string): Promise<Campaign> {
    return this.http.post<Campaign>(`/mail/campaigns/${id}/duplicate`, {});
  }

  /**
   * Get campaign statistics
   */
  async getStats(id: string): Promise<CampaignStatsResponse> {
    return this.http.get<CampaignStatsResponse>(`/mail/campaigns/${id}/stats`);
  }
}
