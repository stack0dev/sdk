/**
 * Mailboxes client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  Mailbox,
  CreateMailboxRequest,
  UpdateMailboxRequest,
  ListMailboxesRequest,
  ListMailboxesResponse,
  InboundMessage,
  ListInboundMessagesRequest,
  ListInboundMessagesResponse,
} from "./types";

export class Mailboxes {
  constructor(private http: HttpClient) {}

  /**
   * Create a new mailbox
   */
  async create(request: CreateMailboxRequest): Promise<Mailbox> {
    return this.http.post<Mailbox>("/mail/mailboxes", request);
  }

  /**
   * Get a mailbox by ID
   */
  async get(id: string): Promise<Mailbox> {
    return this.http.get<Mailbox>(`/mail/mailboxes/${id}`);
  }

  /**
   * List mailboxes with optional filters
   */
  async list(request?: ListMailboxesRequest): Promise<ListMailboxesResponse> {
    const params = new URLSearchParams();
    if (request?.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request?.environment) params.set("environment", request.environment);
    if (request?.domain) params.set("domain", request.domain);
    if (request?.status) params.set("status", request.status);
    if (request?.limit) params.set("limit", String(request.limit));
    if (request?.cursor) params.set("cursor", request.cursor);
    const qs = params.toString();
    return this.http.get<ListMailboxesResponse>(`/mail/mailboxes${qs ? `?${qs}` : ""}`);
  }

  /**
   * Update a mailbox
   */
  async update(request: UpdateMailboxRequest): Promise<Mailbox> {
    const { id, ...data } = request;
    return this.http.patch<Mailbox>(`/mail/mailboxes/${id}`, data);
  }

  /**
   * Delete a mailbox
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/mail/mailboxes/${id}`);
  }

  /**
   * List inbound messages across mailboxes
   */
  async listMessages(request?: ListInboundMessagesRequest): Promise<ListInboundMessagesResponse> {
    const params = new URLSearchParams();
    if (request?.mailboxId) params.set("mailboxId", request.mailboxId);
    if (request?.limit) params.set("limit", String(request.limit));
    if (request?.cursor) params.set("cursor", request.cursor);
    const qs = params.toString();
    return this.http.get<ListInboundMessagesResponse>(`/mail/mailboxes/messages${qs ? `?${qs}` : ""}`);
  }

  /**
   * Get an inbound message by ID
   */
  async getMessage(id: string): Promise<InboundMessage> {
    return this.http.get<InboundMessage>(`/mail/mailboxes/messages/${id}`);
  }
}
