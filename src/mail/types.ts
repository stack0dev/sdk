/**
 * Stack0 Mail SDK Types
 * Complete type definitions for the Mail API
 */

// Import common types from shared (used internally, not re-exported to avoid conflicts)
import type { Environment, PaginatedRequest, PaginatedResponse } from "../lib/shared-types";

// Re-export for internal use only - these will not be re-exported from index.ts
export type { Environment, PaginatedRequest, PaginatedResponse };

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailAddress {
  email: string;
  name?: string;
}

export type EmailRecipient = string | EmailAddress;

export interface Attachment {
  filename: string;
  content: string; // Base64 encoded
  contentType?: string;
  path?: string; // URL to file
}

export type EmailStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "bounced"
  | "failed"
  | "deferred"
  | "opened"
  | "clicked"
  | "complained"
  | "unsubscribed";

// Send email
export interface SendEmailRequest {
  projectSlug?: string;
  environment?: Environment;
  from: EmailRecipient;
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  replyTo?: EmailRecipient;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateVariables?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
  attachments?: Attachment[];
  headers?: Record<string, string>;
  scheduledAt?: Date | string;
}

export interface SendEmailResponse {
  id: string;
  from: string;
  to: string;
  subject: string;
  status: string;
  createdAt: Date | string;
}

// Send batch emails
export interface SendBatchEmailRequest {
  projectSlug?: string;
  emails: SendEmailRequest[];
}

export interface SendBatchEmailResponse {
  success: boolean;
  data: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

// Send broadcast email
export interface SendBroadcastEmailRequest {
  projectSlug?: string;
  environment?: Environment;
  from: EmailRecipient;
  to: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateVariables?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
  scheduledAt?: Date | string;
}

export interface SendBroadcastEmailResponse {
  success: boolean;
  data: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
  count: number;
  totalRequested?: number;
  limitedByQuota?: boolean;
}

// Get email
export interface GetEmailResponse {
  id: string;
  from: string;
  to: string;
  subject: string;
  status: string;
  html: string | null;
  text: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
  sentAt?: Date | string | null;
  deliveredAt: Date | string | null;
  openedAt: Date | string | null;
  clickedAt: Date | string | null;
  bouncedAt: Date | string | null;
  providerMessageId: string | null;
}

// List emails
export interface ListEmailsRequest extends PaginatedRequest {
  projectSlug?: string;
  environment?: Environment;
  status?: EmailStatus;
  from?: string;
  to?: string;
  subject?: string;
  tag?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  sortBy?: "createdAt" | "deliveredAt" | "openedAt";
  sortOrder?: "asc" | "desc";
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  status: string;
  cc: string | null;
  replyTo: string | null;
  messageId: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
  deliveredAt: Date | string | null;
  openedAt: Date | string | null;
  clickedAt: Date | string | null;
  bouncedAt: Date | string | null;
  providerMessageId: string | null;
}

export interface ListEmailsResponse extends PaginatedResponse {
  emails: Email[];
}

// Resend email
export interface ResendEmailResponse {
  success: boolean;
  data: {
    id: string;
    success: boolean;
    error?: string;
  };
}

// Cancel email
export interface CancelEmailResponse {
  success: boolean;
}

// Email analytics
export interface EmailAnalyticsResponse {
  total: number;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

// Time series analytics
export interface TimeSeriesAnalyticsRequest {
  days?: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

export interface TimeSeriesAnalyticsResponse {
  data: TimeSeriesDataPoint[];
}

// Hourly analytics
export interface HourlyAnalyticsDataPoint {
  hour: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export interface HourlyAnalyticsResponse {
  data: HourlyAnalyticsDataPoint[];
}

// List senders
export interface ListSendersRequest {
  projectSlug?: string;
  environment?: Environment;
  search?: string;
}

export interface Sender {
  from: string;
  total: number;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
}

export interface ListSendersResponse {
  senders: Sender[];
}

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type DomainStatus = "pending" | "verified" | "failed";

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
}

export interface Domain {
  id: string;
  organizationId: string;
  domain: string;
  status: DomainStatus;
  dkimRecord: DnsRecord[] | null;
  spfRecord: DnsRecord | null;
  dmarcRecord: DnsRecord | null;
  verificationToken: string | null;
  sesVerificationRecord: DnsRecord | null;
  isDefault: boolean;
  verifiedAt: Date | string | null;
  lastCheckedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface ListDomainsRequest {
  projectSlug: string;
  environment?: Environment;
}

export type ListDomainsResponse = Domain[];

export interface AddDomainRequest {
  domain: string;
}

export interface AddDomainResponse {
  domain?: Domain;
  dnsRecords: {
    domain: string;
    dkimRecords: DnsRecord[];
    spfRecord: DnsRecord;
    dmarcRecord: DnsRecord;
    verificationToken: string;
    sesVerificationRecord?: DnsRecord;
  };
}

export interface GetDnsRecordsResponse {
  domain: string;
  dkimRecords: DnsRecord[] | null;
  spfRecord: DnsRecord | null;
  dmarcRecord: DnsRecord | null;
  sesVerificationRecord: DnsRecord | null;
  status: DomainStatus;
  verifiedAt: Date | string | null;
  verificationDetails?: {
    domainVerified: boolean;
    dkimVerified: boolean;
    verificationStatus: string;
    dkimStatus: string;
  };
}

export interface VerifyDomainResponse {
  verified: boolean;
  message: string;
}

export interface DeleteDomainResponse {
  success: boolean;
}

export type SetDefaultDomainResponse = Domain;

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface Template {
  id: string;
  organizationId: string;
  environment: Environment;
  createdByUserId: string | null;
  name: string;
  slug: string;
  description: string | null;
  subject: string;
  previewText: string | null;
  html: string;
  text: string | null;
  mailyJson: Record<string, unknown> | null;
  variablesSchema: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface CreateTemplateRequest {
  environment?: Environment;
  name: string;
  slug: string;
  description?: string;
  subject: string;
  previewText?: string;
  html: string;
  text?: string;
  mailyJson?: Record<string, unknown>;
  variablesSchema?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateTemplateRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  subject?: string;
  previewText?: string;
  html?: string;
  text?: string;
  mailyJson?: Record<string, unknown>;
  variablesSchema?: Record<string, unknown>;
  isActive?: boolean;
}

export interface ListTemplatesRequest extends PaginatedRequest {
  environment?: Environment;
  isActive?: boolean;
  search?: string;
}

export interface ListTemplatesResponse extends PaginatedResponse {
  templates: Template[];
}

export interface DeleteTemplateResponse {
  success: boolean;
}

export interface PreviewTemplateRequest {
  id: string;
  variables: Record<string, unknown>;
}

export interface PreviewTemplateResponse {
  subject: string;
  html: string;
  text: string | null;
}

// ============================================================================
// AUDIENCE TYPES
// ============================================================================

export interface Audience {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: string;
  name: string;
  description: string | null;
  totalContacts: number;
  subscribedContacts: number;
  unsubscribedContacts: number;
  createdByUserId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface CreateAudienceRequest {
  environment?: Environment;
  name: string;
  description?: string;
}

export interface UpdateAudienceRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface ListAudiencesRequest extends PaginatedRequest {
  environment?: Environment;
  search?: string;
}

export interface ListAudiencesResponse extends PaginatedResponse {
  audiences: Audience[];
}

export interface DeleteAudienceResponse {
  success: boolean;
}

export interface AddContactsToAudienceRequest {
  id: string;
  contactIds: string[];
}

export interface AddContactsToAudienceResponse {
  success: boolean;
  added: number;
}

export interface RemoveContactsFromAudienceRequest {
  id: string;
  contactIds: string[];
}

export interface RemoveContactsFromAudienceResponse {
  success: boolean;
  removed: number;
}

// ============================================================================
// CONTACT TYPES
// ============================================================================

export type ContactStatus = "subscribed" | "unsubscribed" | "bounced" | "complained";

export interface MailContact {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  subscribedAt: Date | string | null;
  unsubscribedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface AudienceContact extends MailContact {
  addedAt: Date | string | null;
}

export interface CreateContactRequest {
  environment?: Environment;
  email: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateContactRequest {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
  status?: ContactStatus;
}

export interface ListContactsRequest extends PaginatedRequest {
  environment?: Environment;
  search?: string;
  status?: ContactStatus;
}

export interface ListContactsResponse extends PaginatedResponse {
  contacts: MailContact[];
}

export interface ListAudienceContactsRequest extends PaginatedRequest {
  id: string;
  environment?: Environment;
  search?: string;
  status?: ContactStatus;
}

export interface ListAudienceContactsResponse extends PaginatedResponse {
  contacts: AudienceContact[];
}

export interface DeleteContactResponse {
  success: boolean;
}

export interface ImportContactsRequest {
  environment?: Environment;
  audienceId?: string;
  contacts: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface ImportContactsResponse {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled" | "failed";

export interface Campaign {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: string;
  name: string;
  subject: string;
  previewText: string | null;
  fromEmail: string;
  fromName: string | null;
  replyTo: string | null;
  templateId: string | null;
  html: string | null;
  text: string | null;
  audienceId: string | null;
  status: string;
  scheduledAt: Date | string | null;
  sentAt: Date | string | null;
  completedAt: Date | string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  failedCount: number;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  createdByUserId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface CreateCampaignRequest {
  environment?: Environment;
  name: string;
  subject: string;
  previewText?: string;
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
  templateId?: string;
  html?: string;
  text?: string;
  audienceId?: string;
  scheduledAt?: Date | string;
  tags?: string[];
}

export interface UpdateCampaignRequest {
  id: string;
  name?: string;
  subject?: string;
  previewText?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  templateId?: string;
  html?: string;
  text?: string;
  audienceId?: string;
  scheduledAt?: Date | string;
  tags?: string[];
}

export interface ListCampaignsRequest extends PaginatedRequest {
  environment?: Environment;
  search?: string;
  status?: CampaignStatus;
}

export interface ListCampaignsResponse extends PaginatedResponse {
  campaigns: Campaign[];
}

export interface DeleteCampaignResponse {
  success: boolean;
}

export interface SendCampaignRequest {
  id: string;
  sendNow?: boolean;
  scheduledAt?: Date | string;
}

export interface SendCampaignResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
}

export interface PauseCampaignResponse {
  success: boolean;
}

export interface CancelCampaignResponse {
  success: boolean;
}

export interface CampaignStatsResponse {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

// ============================================================================
// SEQUENCE TYPES
// ============================================================================

export type SequenceStatus = "draft" | "active" | "paused" | "archived";
export type SequenceTriggerType = "manual" | "event_received" | "contact_added" | "api" | "scheduled";
export type SequenceTriggerFrequency = "once" | "always";
export type SequenceNodeType =
  | "trigger"
  | "email"
  | "timer"
  | "filter"
  | "branch"
  | "experiment"
  | "exit"
  | "add_to_list"
  | "update_contact";
export type ConnectionType = "default" | "yes" | "no" | "branch" | "variant";

export interface Sequence {
  id: string;
  organizationId: string;
  environment: string;
  name: string;
  description: string | null;
  triggerType: SequenceTriggerType;
  triggerFrequency: SequenceTriggerFrequency;
  triggerConfig: Record<string, unknown> | null;
  audienceFilterId: string | null;
  status: SequenceStatus;
  totalEntered: number;
  totalCompleted: number;
  totalActive: number;
  publishedAt: Date | string | null;
  pausedAt: Date | string | null;
  archivedAt: Date | string | null;
  createdByUserId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface SequenceNode {
  id: string;
  loopId: string;
  nodeType: SequenceNodeType;
  name: string;
  positionX: number;
  positionY: number;
  sortOrder: number;
  config: Record<string, unknown> | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface SequenceConnection {
  id: string;
  loopId: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: ConnectionType;
  label: string | null;
  createdAt: Date | string;
}

export interface SequenceWithNodes extends Sequence {
  nodes: SequenceNode[];
  connections: SequenceConnection[];
}

export interface CreateSequenceRequest {
  environment?: Environment;
  name: string;
  description?: string;
  triggerType: SequenceTriggerType;
  triggerFrequency?: SequenceTriggerFrequency;
  triggerConfig?: Record<string, unknown>;
  audienceFilterId?: string;
}

export interface UpdateSequenceRequest {
  id: string;
  name?: string;
  description?: string;
  triggerType?: SequenceTriggerType;
  triggerFrequency?: SequenceTriggerFrequency;
  triggerConfig?: Record<string, unknown>;
  audienceFilterId?: string;
}

export interface ListSequencesRequest extends PaginatedRequest {
  environment?: Environment;
  search?: string;
  status?: SequenceStatus;
  triggerType?: SequenceTriggerType;
}

export interface ListSequencesResponse extends PaginatedResponse {
  sequences: Sequence[];
}

export interface DeleteSequenceResponse {
  success: boolean;
}

export interface PublishSequenceResponse {
  success: boolean;
}

export interface PauseSequenceResponse {
  success: boolean;
}

export interface ResumeSequenceResponse {
  success: boolean;
}

export interface ArchiveSequenceResponse {
  success: boolean;
}

// Sequence Nodes
export interface CreateNodeRequest {
  id: string; // sequence ID
  nodeType: SequenceNodeType;
  name: string;
  positionX: number;
  positionY: number;
  sortOrder?: number;
  config?: Record<string, unknown>;
}

export interface UpdateNodeRequest {
  id: string; // sequence ID
  nodeId: string;
  name?: string;
  positionX?: number;
  positionY?: number;
  sortOrder?: number;
  config?: Record<string, unknown>;
}

export interface UpdateNodePositionRequest {
  id: string; // sequence ID
  nodeId: string;
  positionX: number;
  positionY: number;
}

export interface DeleteNodeResponse {
  success: boolean;
}

// Node configurations
export interface SetNodeEmailRequest {
  nodeId: string;
  subject?: string;
  previewText?: string;
  html?: string;
  text?: string;
  templateId?: string;
  mailyJson?: Record<string, unknown>;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}

export interface SetNodeTimerRequest {
  nodeId: string;
  delayAmount: number;
  delayUnit: "minutes" | "hours" | "days" | "weeks";
  waitUntilTime?: string;
  waitUntilTimezone?: string;
}

export interface SetNodeFilterRequest {
  nodeId: string;
  conditions: Record<string, unknown>;
  nonMatchAction?: "stop" | "continue";
}

export interface SetNodeBranchRequest {
  nodeId: string;
  branches: Array<{
    name: string;
    conditions: Record<string, unknown>;
  }>;
  hasDefaultBranch?: boolean;
}

export interface SetNodeExperimentRequest {
  nodeId: string;
  sampleSize?: number;
  variants: Array<{
    name: string;
    weight: number;
  }>;
}

// Connections
export interface CreateConnectionRequest {
  id: string; // sequence ID
  sourceNodeId: string;
  targetNodeId: string;
  connectionType?: ConnectionType;
  label?: string;
}

export interface DeleteConnectionResponse {
  success: boolean;
}

// Sequence entries
export type SequenceEntryStatus = "active" | "paused" | "completed" | "stopped" | "failed";

export interface SequenceEntry {
  id: string;
  loopId: string;
  contactId: string;
  currentNodeId: string | null;
  status: SequenceEntryStatus;
  enteredAt: Date | string;
  exitedAt: Date | string | null;
  exitReason: string | null;
  contact?: MailContact;
}

export interface ListSequenceEntriesRequest extends PaginatedRequest {
  id: string; // sequence ID
  status?: SequenceEntryStatus;
}

export interface ListSequenceEntriesResponse extends PaginatedResponse {
  entries: SequenceEntry[];
}

export interface AddContactToSequenceRequest {
  id: string; // sequence ID
  contactId: string;
}

export interface RemoveContactFromSequenceRequest {
  id: string; // sequence ID
  entryId: string;
  reason?: string;
}

export interface RemoveContactFromSequenceResponse {
  success: boolean;
}

// Sequence analytics
export interface SequenceAnalyticsResponse {
  sequence: {
    totalEntered: number;
    totalCompleted: number;
    totalActive: number;
  };
  statusBreakdown: Record<string, number>;
  nodeAnalytics: Array<{
    nodeId: string;
    entered: number;
    exited: number;
    emailsSent: number;
    emailsDelivered: number;
    emailsOpened: number;
    emailsClicked: number;
    emailsBounced: number;
    passed: number;
    filtered: number;
  }>;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface EventProperty {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "object" | "array";
  description?: string;
  required?: boolean;
}

export interface EventPropertiesSchema {
  properties: EventProperty[];
}

export interface MailEvent {
  id: string;
  organizationId: string;
  projectId: string | null;
  environment: string;
  name: string;
  description: string | null;
  propertiesSchema: EventPropertiesSchema | null;
  totalReceived: number;
  lastReceivedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

export interface CreateEventRequest {
  projectSlug?: string;
  environment?: Environment;
  name: string;
  description?: string;
  propertiesSchema?: EventPropertiesSchema;
}

export interface UpdateEventRequest {
  id: string;
  name?: string;
  description?: string;
  propertiesSchema?: EventPropertiesSchema;
}

export interface ListEventsRequest extends PaginatedRequest {
  projectSlug?: string;
  environment?: Environment;
  search?: string;
}

export interface ListEventsResponse extends PaginatedResponse {
  events: MailEvent[];
}

export interface DeleteEventResponse {
  success: boolean;
}

export interface TrackEventRequest {
  environment?: Environment;
  eventName: string;
  contactId?: string;
  contactEmail?: string;
  properties?: Record<string, unknown>;
}

export interface TrackEventResponse {
  success: boolean;
  eventOccurrenceId?: string;
  error?: string;
}

export interface BatchTrackEventsRequest {
  environment?: Environment;
  events: Array<{
    eventName: string;
    contactId?: string;
    contactEmail?: string;
    properties?: Record<string, unknown>;
    timestamp?: Date | string;
  }>;
}

export interface BatchTrackEventsResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    eventOccurrenceId?: string;
    error?: string;
  }>;
  totalProcessed: number;
  totalFailed: number;
}

export interface EventOccurrence {
  id: string;
  eventId: string;
  contactId: string;
  properties: Record<string, unknown> | null;
  processed: boolean;
  processedAt: Date | string | null;
  createdAt: Date | string;
}

export interface ListEventOccurrencesRequest extends PaginatedRequest {
  eventId?: string;
  contactId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface ListEventOccurrencesResponse extends PaginatedResponse {
  occurrences: EventOccurrence[];
}

export interface EventAnalyticsResponse {
  totalReceived: number;
  lastReceivedAt: Date | string | null;
  uniqueContacts: number;
  dailyCounts: Array<{
    date: string;
    count: number;
  }>;
}
