/**
 * Stack0 Mail Client
 * Complete email API with support for transactional emails, campaigns, sequences, and more
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import { Audiences } from "./audiences";
import { Campaigns } from "./campaigns";
import { Contacts } from "./contacts";
import { Domains } from "./domains";
import { Events } from "./events";
import { Sequences } from "./sequences";
import { Templates } from "./templates";
import type {
  CancelEmailResponse,
  EmailAnalyticsResponse,
  GetEmailResponse,
  HourlyAnalyticsResponse,
  ListEmailsRequest,
  ListEmailsResponse,
  ListSendersRequest,
  ListSendersResponse,
  ResendEmailResponse,
  SendBatchEmailRequest,
  SendBatchEmailResponse,
  SendBroadcastEmailRequest,
  SendBroadcastEmailResponse,
  SendEmailRequest,
  SendEmailResponse,
  TimeSeriesAnalyticsRequest,
  TimeSeriesAnalyticsResponse,
} from "./types";

export class Mail {
  private http: HttpClient;

  /** Manage sending domains */
  readonly domains: Domains;

  /** Manage email templates */
  readonly templates: Templates;

  /** Manage contact audiences/lists */
  readonly audiences: Audiences;

  /** Manage contacts */
  readonly contacts: Contacts;

  /** Manage email campaigns */
  readonly campaigns: Campaigns;

  /** Manage automated email sequences */
  readonly sequences: Sequences;

  /** Track and manage custom events */
  readonly events: Events;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);

    // Initialize sub-clients
    this.domains = new Domains(this.http);
    this.templates = new Templates(this.http);
    this.audiences = new Audiences(this.http);
    this.contacts = new Contacts(this.http);
    this.campaigns = new Campaigns(this.http);
    this.sequences = new Sequences(this.http);
    this.events = new Events(this.http);
  }

  // ============================================================================
  // TRANSACTIONAL EMAILS
  // ============================================================================

  /**
   * Send a single email
   *
   * @example
   * ```typescript
   * const result = await mail.send({
   *   from: 'noreply@example.com',
   *   to: 'user@example.com',
   *   subject: 'Hello World',
   *   html: '<p>Welcome!</p>',
   * });
   * ```
   */
  async send(request: SendEmailRequest): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>("/mail/send", request);
  }

  /**
   * Send multiple emails in a batch (up to 100)
   * Each email can have different content and recipients
   *
   * @example
   * ```typescript
   * const result = await mail.sendBatch({
   *   emails: [
   *     { from: 'noreply@example.com', to: 'user1@example.com', subject: 'Hello', html: '<p>Hi User 1</p>' },
   *     { from: 'noreply@example.com', to: 'user2@example.com', subject: 'Hello', html: '<p>Hi User 2</p>' },
   *   ]
   * });
   * ```
   */
  async sendBatch(request: SendBatchEmailRequest): Promise<SendBatchEmailResponse> {
    return this.http.post<SendBatchEmailResponse>("/mail/send/batch", request);
  }

  /**
   * Send a broadcast email (same content to multiple recipients, up to 1000)
   *
   * @example
   * ```typescript
   * const result = await mail.sendBroadcast({
   *   from: 'noreply@example.com',
   *   to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
   *   subject: 'Newsletter',
   *   html: '<p>Our latest updates...</p>',
   * });
   * ```
   */
  async sendBroadcast(request: SendBroadcastEmailRequest): Promise<SendBroadcastEmailResponse> {
    return this.http.post<SendBroadcastEmailResponse>("/mail/send/broadcast", request);
  }

  /**
   * Get email details by ID
   *
   * @example
   * ```typescript
   * const email = await mail.get('email-id');
   * console.log(email.status); // 'delivered'
   * ```
   */
  async get(id: string): Promise<GetEmailResponse> {
    return this.http.get<GetEmailResponse>(`/mail/${id}`);
  }

  /**
   * List emails with optional filters
   *
   * @example
   * ```typescript
   * const result = await mail.list({
   *   status: 'delivered',
   *   limit: 50,
   * });
   * ```
   */
  async list(request: ListEmailsRequest = {}): Promise<ListEmailsResponse> {
    const params = new URLSearchParams();
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.status) params.set("status", request.status);
    if (request.from) params.set("from", request.from);
    if (request.to) params.set("to", request.to);
    if (request.subject) params.set("subject", request.subject);
    if (request.tag) params.set("tag", request.tag);
    if (request.startDate) {
      params.set("startDate", request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate);
    }
    if (request.endDate) {
      params.set("endDate", request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate);
    }
    if (request.sortBy) params.set("sortBy", request.sortBy);
    if (request.sortOrder) params.set("sortOrder", request.sortOrder);

    const query = params.toString();
    return this.http.get<ListEmailsResponse>(`/mail${query ? `?${query}` : ""}`);
  }

  /**
   * Resend a previously sent email
   */
  async resend(id: string): Promise<ResendEmailResponse> {
    return this.http.post<ResendEmailResponse>(`/mail/${id}/resend`, {});
  }

  /**
   * Cancel a scheduled email
   */
  async cancel(id: string): Promise<CancelEmailResponse> {
    return this.http.post<CancelEmailResponse>(`/mail/${id}/cancel`, {});
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get overall email analytics
   */
  async getAnalytics(): Promise<EmailAnalyticsResponse> {
    return this.http.get<EmailAnalyticsResponse>("/mail/analytics");
  }

  /**
   * Get time series analytics (daily breakdown)
   */
  async getTimeSeriesAnalytics(request: TimeSeriesAnalyticsRequest = {}): Promise<TimeSeriesAnalyticsResponse> {
    const params = new URLSearchParams();
    if (request.days) params.set("days", request.days.toString());

    const query = params.toString();
    return this.http.get<TimeSeriesAnalyticsResponse>(`/mail/analytics/timeseries${query ? `?${query}` : ""}`);
  }

  /**
   * Get hourly analytics
   */
  async getHourlyAnalytics(): Promise<HourlyAnalyticsResponse> {
    return this.http.get<HourlyAnalyticsResponse>("/mail/analytics/hourly");
  }

  /**
   * List unique senders with their statistics
   */
  async listSenders(request: ListSendersRequest = {}): Promise<ListSendersResponse> {
    const params = new URLSearchParams();
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.search) params.set("search", request.search);

    const query = params.toString();
    return this.http.get<ListSendersResponse>(`/mail/senders${query ? `?${query}` : ""}`);
  }
}
