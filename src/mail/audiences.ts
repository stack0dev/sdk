/**
 * Audiences client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  AddContactsToAudienceRequest,
  AddContactsToAudienceResponse,
  Audience,
  AudienceContact,
  CreateAudienceRequest,
  DeleteAudienceResponse,
  ListAudienceContactsRequest,
  ListAudienceContactsResponse,
  ListAudiencesRequest,
  ListAudiencesResponse,
  RemoveContactsFromAudienceRequest,
  RemoveContactsFromAudienceResponse,
  UpdateAudienceRequest,
} from "./types";

export class Audiences {
  constructor(private http: HttpClient) {}

  /**
   * List all audiences
   */
  async list(request: ListAudiencesRequest = {}): Promise<ListAudiencesResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.search) params.set("search", request.search);

    const query = params.toString();
    return this.http.get<ListAudiencesResponse>(`/mail/audiences${query ? `?${query}` : ""}`);
  }

  /**
   * Get an audience by ID
   */
  async get(id: string): Promise<Audience> {
    return this.http.get<Audience>(`/mail/audiences/${id}`);
  }

  /**
   * Create a new audience
   */
  async create(request: CreateAudienceRequest): Promise<Audience> {
    return this.http.post<Audience>("/mail/audiences", request);
  }

  /**
   * Update an audience
   */
  async update(request: UpdateAudienceRequest): Promise<Audience> {
    const { id, ...data } = request;
    return this.http.put<Audience>(`/mail/audiences/${id}`, data);
  }

  /**
   * Delete an audience
   */
  async delete(id: string): Promise<DeleteAudienceResponse> {
    return this.http.delete<DeleteAudienceResponse>(`/mail/audiences/${id}`);
  }

  /**
   * List contacts in an audience
   */
  async listContacts(request: ListAudienceContactsRequest): Promise<ListAudienceContactsResponse> {
    const { id, ...params } = request;
    const searchParams = new URLSearchParams();
    if (params.environment) searchParams.set("environment", params.environment);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());
    if (params.search) searchParams.set("search", params.search);
    if (params.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return this.http.get<ListAudienceContactsResponse>(`/mail/audiences/${id}/contacts${query ? `?${query}` : ""}`);
  }

  /**
   * Add contacts to an audience
   */
  async addContacts(request: AddContactsToAudienceRequest): Promise<AddContactsToAudienceResponse> {
    const { id, contactIds } = request;
    return this.http.post<AddContactsToAudienceResponse>(`/mail/audiences/${id}/contacts`, { contactIds });
  }

  /**
   * Remove contacts from an audience
   */
  async removeContacts(request: RemoveContactsFromAudienceRequest): Promise<RemoveContactsFromAudienceResponse> {
    const { id, contactIds } = request;
    return this.http.deleteWithBody<RemoveContactsFromAudienceResponse>(`/mail/audiences/${id}/contacts`, {
      contactIds,
    });
  }
}
