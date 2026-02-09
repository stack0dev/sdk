/**
 * Stack0 Integrations SDK Types
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

export interface ListOptions {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

// ============================================================================
// CONNECTOR & CONNECTION TYPES
// ============================================================================

export type ConnectorCategory = "crm" | "storage" | "communication" | "productivity";

export interface Connector {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: ConnectorCategory;
  iconUrl?: string;
  websiteUrl?: string;
  isEnabled: boolean;
}

export interface Connection {
  id: string;
  connectorId: string;
  connectorSlug: string;
  name?: string;
  status: "pending" | "connected" | "error" | "disconnected";
  externalAccountId?: string;
  externalAccountName?: string;
  lastSyncedAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface Address {
  type?: "work" | "home" | "billing" | "shipping" | "headquarters" | "other";
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface PhoneNumber {
  type?: "work" | "home" | "mobile" | "fax" | "other";
  number: string;
  isPrimary?: boolean;
}

export interface IntegrationEmailAddress {
  type?: "work" | "personal" | "other";
  email: string;
  isPrimary?: boolean;
}

// ============================================================================
// CRM TYPES
// ============================================================================

export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emails?: IntegrationEmailAddress[];
  phone?: string;
  phones?: PhoneNumber[];
  title?: string;
  department?: string;
  companyId?: string;
  companyName?: string;
  addresses?: Address[];
  website?: string;
  description?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface CreateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  emails?: IntegrationEmailAddress[];
  phone?: string;
  phones?: PhoneNumber[];
  title?: string;
  department?: string;
  companyId?: string;
  companyName?: string;
  addresses?: Address[];
  website?: string;
  description?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export type UpdateContactInput = Partial<CreateContactInput>;

export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  description?: string;
  employeeCount?: number;
  annualRevenue?: number;
  phone?: string;
  phones?: PhoneNumber[];
  addresses?: Address[];
  ownerId?: string;
  customFields?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface CreateCompanyInput {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  description?: string;
  employeeCount?: number;
  annualRevenue?: number;
  phone?: string;
  phones?: PhoneNumber[];
  addresses?: Address[];
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export interface Deal {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  status?: "open" | "won" | "lost";
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  companyId?: string;
  contactIds?: string[];
  ownerId?: string;
  description?: string;
  customFields?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface CreateDealInput {
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  status?: "open" | "won" | "lost";
  probability?: number;
  expectedCloseDate?: Date;
  companyId?: string;
  contactIds?: string[];
  ownerId?: string;
  description?: string;
  customFields?: Record<string, unknown>;
}

export type UpdateDealInput = Partial<CreateDealInput>;

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface FilePermission {
  type: "user" | "group" | "anyone";
  role: "owner" | "writer" | "reader" | "commenter";
  email?: string;
  displayName?: string;
}

export interface File {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  folderId?: string;
  path?: string;
  downloadUrl?: string;
  webUrl?: string;
  thumbnailUrl?: string;
  isFolder: boolean;
  parentId?: string;
  ownerId?: string;
  permissions?: FilePermission[];
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface IntegrationFolder {
  id: string;
  name: string;
  path?: string;
  parentId?: string;
  webUrl?: string;
  itemCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface CreateFolderInput {
  name: string;
  parentId?: string;
}

export interface UploadFileInput {
  name: string;
  mimeType: string;
  data: ArrayBuffer | Uint8Array;
  folderId?: string;
}

// ============================================================================
// COMMUNICATION TYPES
// ============================================================================

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: "public" | "private" | "direct" | "group";
  memberCount?: number;
  isArchived?: boolean;
  topic?: string;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface MessageAttachment {
  id?: string;
  type?: "file" | "image" | "video" | "link";
  name?: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds?: string[];
}

export interface Message {
  id: string;
  channelId: string;
  content: string;
  senderId?: string;
  senderName?: string;
  threadId?: string;
  replyCount?: number;
  isEdited?: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface SendMessageInput {
  channelId: string;
  content: string;
  threadId?: string;
}

export interface CommunicationUser {
  id: string;
  name?: string;
  username?: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  status?: "active" | "away" | "dnd" | "offline" | { text: string; emoji?: string };
  isBot?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

// ============================================================================
// PRODUCTIVITY TYPES
// ============================================================================

export interface Document {
  id: string;
  title: string;
  content?: string;
  type?: "page" | "document" | "note";
  parentId?: string;
  webUrl?: string;
  iconUrl?: string;
  iconEmoji?: string;
  coverUrl?: string;
  isArchived?: boolean;
  properties?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface CreateDocumentInput {
  title: string;
  content?: string;
  type?: "page" | "document" | "note";
  parentId?: string;
  iconEmoji?: string;
}

export type UpdateDocumentInput = Partial<CreateDocumentInput>;

export type ColumnType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "select"
  | "multiSelect"
  | "url"
  | "email"
  | "phone"
  | "formula"
  | "relation"
  | "rollup"
  | "file"
  | "person"
  | "status"
  | "checkbox"
  | "unknown";

export interface SelectOption {
  id: string;
  name: string;
  color?: string;
}

export interface TableColumn {
  id: string;
  name: string;
  type: ColumnType;
  description?: string;
  options?: string[] | SelectOption[];
}

export interface Table {
  id: string;
  name: string;
  description?: string;
  columns: TableColumn[];
  webUrl?: string;
  isArchived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface TableRow {
  id: string;
  tableId: string;
  cells: Record<string, unknown>;
  webUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  remoteData?: unknown;
}

export interface CreateTableRowInput {
  cells: Record<string, unknown>;
}

export type UpdateTableRowInput = CreateTableRowInput;

// ============================================================================
// PASSTHROUGH TYPES
// ============================================================================

export interface PassthroughRequest {
  connectionId: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

// ============================================================================
// OAUTH & CONNECTION MANAGEMENT TYPES
// ============================================================================

export type IntegrationEnvironment = "sandbox" | "production";

export interface InitiateOAuthRequest {
  connectorSlug: string;
  projectId?: string;
  environment?: IntegrationEnvironment;
  name?: string;
  redirectUrl: string;
}

export interface InitiateOAuthResponse {
  authUrl: string;
  connectionId: string;
  state: string;
}

export interface CompleteOAuthRequest {
  code: string;
  state: string;
  redirectUrl: string;
}

export interface CompleteOAuthResponse {
  connectionId: string;
  status: "connected";
  externalAccountId?: string;
  externalAccountName?: string;
}

export interface ReconnectConnectionRequest {
  connectionId: string;
  redirectUrl: string;
}

export interface ReconnectConnectionResponse {
  authUrl: string;
  connectionId: string;
  state: string;
}

export interface UpdateConnectionRequest {
  connectionId: string;
  name?: string;
}

export interface UpdateConnectionResponse {
  id: string;
  name: string;
  status: Connection["status"];
}

export interface IntegrationStatsRequest {
  environment?: IntegrationEnvironment;
}

export interface IntegrationStatsResponse {
  totalConnections: number;
  activeConnections: number;
  errorConnections: number;
  totalApiCalls: number;
  apiCallsLast30Days: number;
  connectorBreakdown: Array<{
    connectorSlug: string;
    connectorName: string;
    connectionCount: number;
  }>;
}

// ============================================================================
// LOGS TYPES
// ============================================================================

export interface ListLogsRequest {
  connectionId?: string;
  connectorSlug?: string;
  statusCode?: number;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  search?: string;
  limit?: number;
  cursor?: string;
}

export interface ApiLog {
  id: string;
  connectionId: string;
  connectionName: string | null;
  connectorSlug: string | null;
  connectorName: string | null;
  method: string;
  path: string;
  model: string | null;
  operation: string | null;
  statusCode: number;
  errorMessage: string | null;
  requestDurationMs: number;
  createdAt: Date;
}

export interface ListLogsResponse {
  logs: ApiLog[];
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================================================
// EXTENDED CONNECTION TYPE (from API response)
// ============================================================================

export interface ConnectionDetails {
  id: string;
  name: string;
  status: Connection["status"];
  environment: IntegrationEnvironment;
  connector: {
    slug: string;
    name: string;
    category: ConnectorCategory;
    logoUrl: string | null;
    supportedModels?: string[];
  } | null;
  externalAccountId: string | null;
  externalAccountName: string | null;
  connectedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  connectedAt: Date | null;
  lastUsedAt: Date | null;
  errorMessage: string | null;
  lastErrorAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ListConnectionsRequest {
  projectId?: string;
  environment?: IntegrationEnvironment;
  connectorSlug?: string;
  status?: Connection["status"];
  limit?: number;
}

export interface ListConnectionsResponse {
  connections: Array<Omit<ConnectionDetails, "supportedModels" | "lastErrorAt" | "updatedAt">>;
  hasMore: boolean;
  nextCursor?: string;
}
