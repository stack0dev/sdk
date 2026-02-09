/**
 * Contacts client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  MailContact,
  CreateContactRequest,
  DeleteContactResponse,
  ImportContactsRequest,
  ImportContactsResponse,
  ListContactsRequest,
  ListContactsResponse,
  UpdateContactRequest,
} from "./types";

export class Contacts {
  constructor(private http: HttpClient) {}

  /**
   * List all contacts
   */
  async list(request: ListContactsRequest = {}): Promise<ListContactsResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.search) params.set("search", request.search);
    if (request.status) params.set("status", request.status);

    const query = params.toString();
    return this.http.get<ListContactsResponse>(`/mail/contacts${query ? `?${query}` : ""}`);
  }

  /**
   * Get a contact by ID
   */
  async get(id: string): Promise<MailContact> {
    return this.http.get<MailContact>(`/mail/contacts/${id}`);
  }

  /**
   * Create a new contact
   */
  async create(request: CreateContactRequest): Promise<MailContact> {
    return this.http.post<MailContact>("/mail/contacts", request);
  }

  /**
   * Update a contact
   */
  async update(request: UpdateContactRequest): Promise<MailContact> {
    const { id, ...data } = request;
    return this.http.put<MailContact>(`/mail/contacts/${id}`, data);
  }

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<DeleteContactResponse> {
    return this.http.delete<DeleteContactResponse>(`/mail/contacts/${id}`);
  }

  /**
   * Import contacts in bulk
   */
  async import(request: ImportContactsRequest): Promise<ImportContactsResponse> {
    return this.http.post<ImportContactsResponse>("/mail/contacts/import", request);
  }
}
