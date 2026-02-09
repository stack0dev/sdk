/**
 * Stack0 Integrations Client
 * Unified API for third-party integrations
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  Connector,
  Connection,
  ConnectorCategory,
  ListOptions,
  PaginatedResult,
  // CRM
  Contact,
  CreateContactInput,
  UpdateContactInput,
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  Deal,
  CreateDealInput,
  UpdateDealInput,
  // Storage
  File,
  IntegrationFolder,
  CreateFolderInput,
  UploadFileInput,
  // Communication
  Channel,
  Message,
  SendMessageInput,
  CommunicationUser,
  // Productivity
  Document,
  CreateDocumentInput,
  UpdateDocumentInput,
  Table,
  TableRow,
  CreateTableRowInput,
  UpdateTableRowInput,
  // Passthrough
  PassthroughRequest,
  // OAuth & Connections
  InitiateOAuthRequest,
  InitiateOAuthResponse,
  CompleteOAuthRequest,
  CompleteOAuthResponse,
  ReconnectConnectionRequest,
  ReconnectConnectionResponse,
  UpdateConnectionRequest,
  UpdateConnectionResponse,
  IntegrationStatsRequest,
  IntegrationStatsResponse,
  ListConnectionsRequest,
  ListConnectionsResponse,
  ConnectionDetails,
  // Logs
  ListLogsRequest,
  ListLogsResponse,
  ApiLog,
} from "./types";

/**
 * CRM operations client
 */
class CRM {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Contacts
  async listContacts(connectionId: string, options?: ListOptions): Promise<PaginatedResult<Contact>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.sortBy) params.set("sortBy", options.sortBy);
    if (options?.sortOrder) params.set("sortOrder", options.sortOrder);
    return this.http.get(`/integrations/crm/contacts?${params}`);
  }

  async getContact(connectionId: string, id: string): Promise<Contact> {
    return this.http.get(`/integrations/crm/contacts/${id}?connectionId=${connectionId}`);
  }

  async createContact(connectionId: string, data: CreateContactInput): Promise<Contact> {
    return this.http.post("/integrations/crm/contacts", { connectionId, data });
  }

  async updateContact(connectionId: string, id: string, data: UpdateContactInput): Promise<Contact> {
    return this.http.patch(`/integrations/crm/contacts/${id}`, { connectionId, data });
  }

  async deleteContact(connectionId: string, id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/crm/contacts/${id}?connectionId=${connectionId}`);
  }

  // Companies
  async listCompanies(connectionId: string, options?: ListOptions): Promise<PaginatedResult<Company>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.sortBy) params.set("sortBy", options.sortBy);
    if (options?.sortOrder) params.set("sortOrder", options.sortOrder);
    return this.http.get(`/integrations/crm/companies?${params}`);
  }

  async getCompany(connectionId: string, id: string): Promise<Company> {
    return this.http.get(`/integrations/crm/companies/${id}?connectionId=${connectionId}`);
  }

  async createCompany(connectionId: string, data: CreateCompanyInput): Promise<Company> {
    return this.http.post("/integrations/crm/companies", { connectionId, data });
  }

  async updateCompany(connectionId: string, id: string, data: UpdateCompanyInput): Promise<Company> {
    return this.http.patch(`/integrations/crm/companies/${id}`, { connectionId, data });
  }

  async deleteCompany(connectionId: string, id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/crm/companies/${id}?connectionId=${connectionId}`);
  }

  // Deals
  async listDeals(connectionId: string, options?: ListOptions): Promise<PaginatedResult<Deal>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.sortBy) params.set("sortBy", options.sortBy);
    if (options?.sortOrder) params.set("sortOrder", options.sortOrder);
    return this.http.get(`/integrations/crm/deals?${params}`);
  }

  async getDeal(connectionId: string, id: string): Promise<Deal> {
    return this.http.get(`/integrations/crm/deals/${id}?connectionId=${connectionId}`);
  }

  async createDeal(connectionId: string, data: CreateDealInput): Promise<Deal> {
    return this.http.post("/integrations/crm/deals", { connectionId, data });
  }

  async updateDeal(connectionId: string, id: string, data: UpdateDealInput): Promise<Deal> {
    return this.http.patch(`/integrations/crm/deals/${id}`, { connectionId, data });
  }

  async deleteDeal(connectionId: string, id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/crm/deals/${id}?connectionId=${connectionId}`);
  }
}

/**
 * Storage operations client
 */
class Storage {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Files
  async listFiles(connectionId: string, folderId?: string, options?: ListOptions): Promise<PaginatedResult<File>> {
    const params = new URLSearchParams({ connectionId });
    if (folderId) params.set("folderId", folderId);
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/storage/files?${params}`);
  }

  async getFile(connectionId: string, id: string): Promise<File> {
    return this.http.get(`/integrations/storage/files/${id}?connectionId=${connectionId}`);
  }

  async uploadFile(connectionId: string, input: UploadFileInput): Promise<File> {
    // Convert data to base64 for JSON transport
    const base64Data =
      input.data instanceof ArrayBuffer
        ? btoa(String.fromCharCode(...new Uint8Array(input.data)))
        : btoa(String.fromCharCode(...input.data));

    return this.http.post("/integrations/storage/files", {
      connectionId,
      name: input.name,
      mimeType: input.mimeType,
      data: base64Data,
      folderId: input.folderId,
    });
  }

  async deleteFile(connectionId: string, id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/storage/files/${id}?connectionId=${connectionId}`);
  }

  async downloadFile(
    connectionId: string,
    id: string,
  ): Promise<{ data: ArrayBuffer; mimeType: string; filename: string }> {
    const response = await this.http.get<{ data: string; mimeType: string; filename: string }>(
      `/integrations/storage/files/${id}/download?connectionId=${connectionId}`,
    );
    // Decode base64 to ArrayBuffer
    const binaryString = atob(response.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return {
      data: bytes.buffer,
      mimeType: response.mimeType,
      filename: response.filename,
    };
  }

  // Folders
  async listFolders(
    connectionId: string,
    parentId?: string,
    options?: ListOptions,
  ): Promise<PaginatedResult<IntegrationFolder>> {
    const params = new URLSearchParams({ connectionId });
    if (parentId) params.set("parentId", parentId);
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/storage/folders?${params}`);
  }

  async getFolder(connectionId: string, id: string): Promise<IntegrationFolder> {
    return this.http.get(`/integrations/storage/folders/${id}?connectionId=${connectionId}`);
  }

  async createFolder(connectionId: string, data: CreateFolderInput): Promise<IntegrationFolder> {
    return this.http.post("/integrations/storage/folders", { connectionId, ...data });
  }

  async deleteFolder(connectionId: string, id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/storage/folders/${id}?connectionId=${connectionId}`);
  }
}

/**
 * Communication operations client
 */
class Communication {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Channels
  async listChannels(connectionId: string, options?: ListOptions): Promise<PaginatedResult<Channel>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/communication/channels?${params}`);
  }

  async getChannel(connectionId: string, id: string): Promise<Channel> {
    return this.http.get(`/integrations/communication/channels/${id}?connectionId=${connectionId}`);
  }

  // Messages
  async listMessages(
    connectionId: string,
    channelId: string,
    options?: ListOptions,
  ): Promise<PaginatedResult<Message>> {
    const params = new URLSearchParams({ connectionId, channelId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/communication/messages?${params}`);
  }

  async sendMessage(connectionId: string, input: SendMessageInput): Promise<Message> {
    return this.http.post("/integrations/communication/messages", { connectionId, ...input });
  }

  // Users
  async listUsers(connectionId: string, options?: ListOptions): Promise<PaginatedResult<CommunicationUser>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/communication/users?${params}`);
  }
}

/**
 * Productivity operations client
 */
class Productivity {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Documents
  async listDocuments(
    connectionId: string,
    parentId?: string,
    options?: ListOptions,
  ): Promise<PaginatedResult<Document>> {
    const params = new URLSearchParams({ connectionId });
    if (parentId) params.set("parentId", parentId);
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/productivity/documents?${params}`);
  }

  async getDocument(connectionId: string, id: string): Promise<Document> {
    return this.http.get(`/integrations/productivity/documents/${id}?connectionId=${connectionId}`);
  }

  async createDocument(connectionId: string, data: CreateDocumentInput): Promise<Document> {
    return this.http.post("/integrations/productivity/documents", { connectionId, ...data });
  }

  async updateDocument(connectionId: string, id: string, data: UpdateDocumentInput): Promise<Document> {
    return this.http.patch(`/integrations/productivity/documents/${id}`, { connectionId, ...data });
  }

  // Tables
  async listTables(connectionId: string, options?: ListOptions): Promise<PaginatedResult<Table>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/productivity/tables?${params}`);
  }

  async getTable(connectionId: string, id: string): Promise<Table> {
    return this.http.get(`/integrations/productivity/tables/${id}?connectionId=${connectionId}`);
  }

  // Table Rows
  async listTableRows(
    connectionId: string,
    tableId: string,
    options?: ListOptions,
  ): Promise<PaginatedResult<TableRow>> {
    const params = new URLSearchParams({ connectionId });
    if (options?.cursor) params.set("cursor", options.cursor);
    if (options?.limit) params.set("limit", String(options.limit));
    return this.http.get(`/integrations/productivity/tables/${tableId}/rows?${params}`);
  }

  async getTableRow(connectionId: string, tableId: string, rowId: string): Promise<TableRow> {
    return this.http.get(`/integrations/productivity/tables/${tableId}/rows/${rowId}?connectionId=${connectionId}`);
  }

  async createTableRow(connectionId: string, tableId: string, data: CreateTableRowInput): Promise<TableRow> {
    return this.http.post(`/integrations/productivity/tables/${tableId}/rows`, {
      connectionId,
      ...data,
    });
  }

  async updateTableRow(
    connectionId: string,
    tableId: string,
    rowId: string,
    data: UpdateTableRowInput,
  ): Promise<TableRow> {
    return this.http.patch(`/integrations/productivity/tables/${tableId}/rows/${rowId}`, {
      connectionId,
      ...data,
    });
  }

  async deleteTableRow(connectionId: string, tableId: string, rowId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/productivity/tables/${tableId}/rows/${rowId}?connectionId=${connectionId}`);
  }
}

/**
 * Stack0 Integrations SDK Client
 *
 * @example
 * ```typescript
 * import { Integrations } from '@stack0/sdk';
 *
 * const integrations = new Integrations({ apiKey: 'stack0_...' });
 *
 * // List connectors
 * const connectors = await integrations.listConnectors();
 *
 * // List contacts from a CRM connection
 * const contacts = await integrations.crm.listContacts('conn_123');
 *
 * // Create a contact
 * const contact = await integrations.crm.createContact('conn_123', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 * });
 *
 * // Send a message via Slack
 * await integrations.communication.sendMessage('conn_456', {
 *   channelId: 'C123',
 *   content: 'Hello from Stack0!',
 * });
 *
 * // Upload a file to Google Drive
 * await integrations.storage.uploadFile('conn_789', {
 *   name: 'report.pdf',
 *   mimeType: 'application/pdf',
 *   data: fileBuffer,
 * });
 * ```
 */
export class Integrations {
  private http: HttpClient;

  public crm: CRM;
  public storage: Storage;
  public communication: Communication;
  public productivity: Productivity;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);

    this.crm = new CRM(this.http);
    this.storage = new Storage(this.http);
    this.communication = new Communication(this.http);
    this.productivity = new Productivity(this.http);
  }

  // ============================================================================
  // CONNECTORS
  // ============================================================================

  /**
   * List all available connectors
   */
  async listConnectors(category?: ConnectorCategory): Promise<Connector[]> {
    const params = category ? `?category=${category}` : "";
    return this.http.get(`/integrations/connectors${params}`);
  }

  /**
   * Get a specific connector
   */
  async getConnector(slug: string): Promise<Connector> {
    return this.http.get(`/integrations/connectors/${slug}`);
  }

  // ============================================================================
  // CONNECTIONS
  // ============================================================================

  /**
   * List all connections
   *
   * @example
   * ```typescript
   * const { connections } = await integrations.listConnections({
   *   environment: 'production',
   *   status: 'connected',
   * });
   * ```
   */
  async listConnections(request?: ListConnectionsRequest): Promise<ListConnectionsResponse> {
    const params = new URLSearchParams();
    if (request?.projectId) params.set("projectId", request.projectId);
    if (request?.environment) params.set("environment", request.environment);
    if (request?.connectorSlug) params.set("connectorSlug", request.connectorSlug);
    if (request?.status) params.set("status", request.status);
    if (request?.limit) params.set("limit", request.limit.toString());
    const queryString = params.toString();

    const response = await this.http.get<ListConnectionsResponse>(
      `/integrations/connections${queryString ? `?${queryString}` : ""}`,
    );
    return {
      ...response,
      connections: response.connections.map((c) => this.convertConnectionDates(c)),
    };
  }

  /**
   * Get a specific connection
   */
  async getConnection(connectionId: string): Promise<ConnectionDetails> {
    const response = await this.http.get<ConnectionDetails>(`/integrations/connections/${connectionId}`);
    return this.convertConnectionDetailsDates(response);
  }

  /**
   * Initiate OAuth flow for a connector
   *
   * @example
   * ```typescript
   * const { authUrl, connectionId, state } = await integrations.initiateOAuth({
   *   connectorSlug: 'hubspot',
   *   redirectUrl: 'https://yourapp.com/oauth/callback',
   *   name: 'My HubSpot Connection',
   * });
   * // Redirect user to authUrl
   * ```
   */
  async initiateOAuth(request: InitiateOAuthRequest): Promise<InitiateOAuthResponse> {
    return this.http.post<InitiateOAuthResponse>("/integrations/connections/oauth/initiate", request);
  }

  /**
   * Complete OAuth flow with callback data
   *
   * @example
   * ```typescript
   * const result = await integrations.completeOAuth({
   *   code: 'auth_code_from_callback',
   *   state: 'state_from_initiate',
   *   redirectUrl: 'https://yourapp.com/oauth/callback',
   * });
   * console.log(`Connected to: ${result.externalAccountName}`);
   * ```
   */
  async completeOAuth(request: CompleteOAuthRequest): Promise<CompleteOAuthResponse> {
    return this.http.post<CompleteOAuthResponse>("/integrations/connections/oauth/callback", request);
  }

  /**
   * Update a connection
   */
  async updateConnection(request: UpdateConnectionRequest): Promise<UpdateConnectionResponse> {
    const { connectionId, ...data } = request;
    return this.http.patch<UpdateConnectionResponse>(`/integrations/connections/${connectionId}`, data);
  }

  /**
   * Delete a connection
   */
  async deleteConnection(connectionId: string): Promise<{ success: boolean }> {
    return this.http.delete(`/integrations/connections/${connectionId}`);
  }

  /**
   * Reconnect an expired or errored connection
   *
   * @example
   * ```typescript
   * const { authUrl, state } = await integrations.reconnectConnection({
   *   connectionId: 'conn_123',
   *   redirectUrl: 'https://yourapp.com/oauth/callback',
   * });
   * // Redirect user to authUrl
   * ```
   */
  async reconnectConnection(request: ReconnectConnectionRequest): Promise<ReconnectConnectionResponse> {
    return this.http.post<ReconnectConnectionResponse>(`/integrations/connections/${request.connectionId}/reconnect`, {
      redirectUrl: request.redirectUrl,
    });
  }

  /**
   * Get integration statistics
   *
   * @example
   * ```typescript
   * const stats = await integrations.getStats({ environment: 'production' });
   * console.log(`Active connections: ${stats.activeConnections}`);
   * console.log(`API calls last 30 days: ${stats.apiCallsLast30Days}`);
   * ```
   */
  async getStats(request?: IntegrationStatsRequest): Promise<IntegrationStatsResponse> {
    const params = new URLSearchParams();
    if (request?.environment) params.set("environment", request.environment);
    const queryString = params.toString();
    return this.http.get<IntegrationStatsResponse>(
      `/integrations/connections/stats${queryString ? `?${queryString}` : ""}`,
    );
  }

  // ============================================================================
  // LOGS
  // ============================================================================

  /**
   * List API logs
   *
   * @example
   * ```typescript
   * const { logs } = await integrations.listLogs({
   *   connectionId: 'conn_123',
   *   limit: 50,
   * });
   * ```
   */
  async listLogs(request?: ListLogsRequest): Promise<ListLogsResponse> {
    const params = new URLSearchParams();
    if (request?.connectionId) params.set("connectionId", request.connectionId);
    if (request?.connectorSlug) params.set("connectorSlug", request.connectorSlug);
    if (request?.statusCode) params.set("statusCode", request.statusCode.toString());
    if (request?.method) params.set("method", request.method);
    if (request?.search) params.set("search", request.search);
    if (request?.limit) params.set("limit", request.limit.toString());
    if (request?.cursor) params.set("cursor", request.cursor);
    const queryString = params.toString();

    const response = await this.http.get<ListLogsResponse>(`/integrations/logs${queryString ? `?${queryString}` : ""}`);
    return {
      ...response,
      logs: response.logs.map((log) => this.convertLogDates(log)),
    };
  }

  // ============================================================================
  // PASSTHROUGH
  // ============================================================================

  /**
   * Make a raw passthrough request to the provider API
   */
  async passthrough(request: PassthroughRequest): Promise<unknown> {
    return this.http.post("/integrations/passthrough", request);
  }

  // ============================================================================
  // Date Conversion Helpers
  // ============================================================================

  private convertConnectionDates<T extends { connectedAt?: Date | null; lastUsedAt?: Date | null; createdAt?: Date }>(
    connection: T,
  ): T {
    if (connection.connectedAt && typeof connection.connectedAt === "string") {
      connection.connectedAt = new Date(connection.connectedAt);
    }
    if (connection.lastUsedAt && typeof connection.lastUsedAt === "string") {
      connection.lastUsedAt = new Date(connection.lastUsedAt);
    }
    if (connection.createdAt && typeof connection.createdAt === "string") {
      connection.createdAt = new Date(connection.createdAt);
    }
    return connection;
  }

  private convertConnectionDetailsDates(connection: ConnectionDetails): ConnectionDetails {
    if (connection.connectedAt && typeof connection.connectedAt === "string") {
      connection.connectedAt = new Date(connection.connectedAt);
    }
    if (connection.lastUsedAt && typeof connection.lastUsedAt === "string") {
      connection.lastUsedAt = new Date(connection.lastUsedAt);
    }
    if (connection.lastErrorAt && typeof connection.lastErrorAt === "string") {
      connection.lastErrorAt = new Date(connection.lastErrorAt);
    }
    if (connection.createdAt && typeof connection.createdAt === "string") {
      connection.createdAt = new Date(connection.createdAt);
    }
    if (connection.updatedAt && typeof connection.updatedAt === "string") {
      connection.updatedAt = new Date(connection.updatedAt);
    }
    return connection;
  }

  private convertLogDates(log: ApiLog): ApiLog {
    if (typeof log.createdAt === "string") {
      log.createdAt = new Date(log.createdAt);
    }
    return log;
  }
}
