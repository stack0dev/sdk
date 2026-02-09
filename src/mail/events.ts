/**
 * Events client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  BatchTrackEventsRequest,
  BatchTrackEventsResponse,
  CreateEventRequest,
  DeleteEventResponse,
  EventAnalyticsResponse,
  ListEventOccurrencesRequest,
  ListEventOccurrencesResponse,
  ListEventsRequest,
  ListEventsResponse,
  MailEvent,
  TrackEventRequest,
  TrackEventResponse,
  UpdateEventRequest,
} from "./types";

export class Events {
  constructor(private http: HttpClient) {}

  // ============================================================================
  // EVENT DEFINITIONS
  // ============================================================================

  /**
   * List all event definitions
   */
  async list(request: ListEventsRequest = {}): Promise<ListEventsResponse> {
    const params = new URLSearchParams();
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.search) params.set("search", request.search);

    const query = params.toString();
    return this.http.get<ListEventsResponse>(`/mail/events${query ? `?${query}` : ""}`);
  }

  /**
   * Get an event definition by ID
   */
  async get(id: string): Promise<MailEvent> {
    return this.http.get<MailEvent>(`/mail/events/${id}`);
  }

  /**
   * Create a new event definition
   */
  async create(request: CreateEventRequest): Promise<MailEvent> {
    return this.http.post<MailEvent>("/mail/events", request);
  }

  /**
   * Update an event definition
   */
  async update(request: UpdateEventRequest): Promise<MailEvent> {
    const { id, ...data } = request;
    return this.http.put<MailEvent>(`/mail/events/${id}`, data);
  }

  /**
   * Delete an event definition
   */
  async delete(id: string): Promise<DeleteEventResponse> {
    return this.http.delete<DeleteEventResponse>(`/mail/events/${id}`);
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Track a single event
   * This can trigger email sequences configured to listen for this event
   */
  async track(request: TrackEventRequest): Promise<TrackEventResponse> {
    return this.http.post<TrackEventResponse>("/mail/events/track", request);
  }

  /**
   * Track multiple events in a batch (max 100)
   */
  async trackBatch(request: BatchTrackEventsRequest): Promise<BatchTrackEventsResponse> {
    return this.http.post<BatchTrackEventsResponse>("/mail/events/track/batch", request);
  }

  // ============================================================================
  // EVENT OCCURRENCES
  // ============================================================================

  /**
   * List event occurrences
   */
  async listOccurrences(request: ListEventOccurrencesRequest = {}): Promise<ListEventOccurrencesResponse> {
    const params = new URLSearchParams();
    if (request.eventId) params.set("eventId", request.eventId);
    if (request.contactId) params.set("contactId", request.contactId);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.startDate) {
      params.set("startDate", request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate);
    }
    if (request.endDate) {
      params.set("endDate", request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate);
    }

    const query = params.toString();
    return this.http.get<ListEventOccurrencesResponse>(`/mail/events/occurrences${query ? `?${query}` : ""}`);
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get analytics for an event
   */
  async getAnalytics(id: string): Promise<EventAnalyticsResponse> {
    return this.http.get<EventAnalyticsResponse>(`/mail/events/analytics/${id}`);
  }
}
