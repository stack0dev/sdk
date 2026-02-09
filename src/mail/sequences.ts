/**
 * Sequences client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  AddContactToSequenceRequest,
  ArchiveSequenceResponse,
  CreateConnectionRequest,
  CreateNodeRequest,
  CreateSequenceRequest,
  DeleteConnectionResponse,
  DeleteNodeResponse,
  DeleteSequenceResponse,
  ListSequenceEntriesRequest,
  ListSequenceEntriesResponse,
  ListSequencesRequest,
  ListSequencesResponse,
  PauseSequenceResponse,
  PublishSequenceResponse,
  RemoveContactFromSequenceRequest,
  RemoveContactFromSequenceResponse,
  ResumeSequenceResponse,
  Sequence,
  SequenceAnalyticsResponse,
  SequenceConnection,
  SequenceEntry,
  SequenceNode,
  SequenceWithNodes,
  SetNodeBranchRequest,
  SetNodeEmailRequest,
  SetNodeExperimentRequest,
  SetNodeFilterRequest,
  SetNodeTimerRequest,
  UpdateNodePositionRequest,
  UpdateNodeRequest,
  UpdateSequenceRequest,
} from "./types";

export class Sequences {
  constructor(private http: HttpClient) {}

  // ============================================================================
  // SEQUENCE CRUD
  // ============================================================================

  /**
   * List all sequences
   */
  async list(request: ListSequencesRequest = {}): Promise<ListSequencesResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.search) params.set("search", request.search);
    if (request.status) params.set("status", request.status);
    if (request.triggerType) params.set("triggerType", request.triggerType);

    const query = params.toString();
    return this.http.get<ListSequencesResponse>(`/mail/sequences${query ? `?${query}` : ""}`);
  }

  /**
   * Get a sequence by ID with all nodes and connections
   */
  async get(id: string): Promise<SequenceWithNodes> {
    return this.http.get<SequenceWithNodes>(`/mail/sequences/${id}`);
  }

  /**
   * Create a new sequence
   */
  async create(request: CreateSequenceRequest): Promise<Sequence> {
    return this.http.post<Sequence>("/mail/sequences", request);
  }

  /**
   * Update a sequence
   */
  async update(request: UpdateSequenceRequest): Promise<Sequence> {
    const { id, ...data } = request;
    return this.http.put<Sequence>(`/mail/sequences/${id}`, data);
  }

  /**
   * Delete a sequence
   */
  async delete(id: string): Promise<DeleteSequenceResponse> {
    return this.http.delete<DeleteSequenceResponse>(`/mail/sequences/${id}`);
  }

  // ============================================================================
  // SEQUENCE LIFECYCLE
  // ============================================================================

  /**
   * Publish (activate) a sequence
   */
  async publish(id: string): Promise<PublishSequenceResponse> {
    return this.http.post<PublishSequenceResponse>(`/mail/sequences/${id}/publish`, {});
  }

  /**
   * Pause an active sequence
   */
  async pause(id: string): Promise<PauseSequenceResponse> {
    return this.http.post<PauseSequenceResponse>(`/mail/sequences/${id}/pause`, {});
  }

  /**
   * Resume a paused sequence
   */
  async resume(id: string): Promise<ResumeSequenceResponse> {
    return this.http.post<ResumeSequenceResponse>(`/mail/sequences/${id}/resume`, {});
  }

  /**
   * Archive a sequence
   */
  async archive(id: string): Promise<ArchiveSequenceResponse> {
    return this.http.post<ArchiveSequenceResponse>(`/mail/sequences/${id}/archive`, {});
  }

  /**
   * Duplicate a sequence
   */
  async duplicate(id: string, name?: string): Promise<Sequence> {
    return this.http.post<Sequence>(`/mail/sequences/${id}/duplicate`, { name });
  }

  // ============================================================================
  // NODE MANAGEMENT
  // ============================================================================

  /**
   * Create a new node in a sequence
   */
  async createNode(request: CreateNodeRequest): Promise<SequenceNode> {
    const { id, ...data } = request;
    return this.http.post<SequenceNode>(`/mail/sequences/${id}/nodes`, data);
  }

  /**
   * Update a node
   */
  async updateNode(request: UpdateNodeRequest): Promise<SequenceNode> {
    const { id, nodeId, ...data } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${id}/nodes/${nodeId}`, data);
  }

  /**
   * Update node position (for visual editor)
   */
  async updateNodePosition(request: UpdateNodePositionRequest): Promise<SequenceNode> {
    const { id, nodeId, positionX, positionY } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${id}/nodes/${nodeId}/position`, { positionX, positionY });
  }

  /**
   * Delete a node
   */
  async deleteNode(sequenceId: string, nodeId: string): Promise<DeleteNodeResponse> {
    return this.http.delete<DeleteNodeResponse>(`/mail/sequences/${sequenceId}/nodes/${nodeId}`);
  }

  // ============================================================================
  // NODE CONFIGURATIONS
  // ============================================================================

  /**
   * Set email node content
   */
  async setNodeEmail(sequenceId: string, request: SetNodeEmailRequest): Promise<SequenceNode> {
    const { nodeId, ...data } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${sequenceId}/nodes/${nodeId}/email`, data);
  }

  /**
   * Set timer node configuration
   */
  async setNodeTimer(sequenceId: string, request: SetNodeTimerRequest): Promise<SequenceNode> {
    const { nodeId, ...data } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${sequenceId}/nodes/${nodeId}/timer`, data);
  }

  /**
   * Set filter node configuration
   */
  async setNodeFilter(sequenceId: string, request: SetNodeFilterRequest): Promise<SequenceNode> {
    const { nodeId, ...data } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${sequenceId}/nodes/${nodeId}/filter`, data);
  }

  /**
   * Set branch node configuration
   */
  async setNodeBranch(sequenceId: string, request: SetNodeBranchRequest): Promise<SequenceNode> {
    const { nodeId, ...data } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${sequenceId}/nodes/${nodeId}/branch`, data);
  }

  /**
   * Set experiment node configuration
   */
  async setNodeExperiment(sequenceId: string, request: SetNodeExperimentRequest): Promise<SequenceNode> {
    const { nodeId, ...data } = request;
    return this.http.put<SequenceNode>(`/mail/sequences/${sequenceId}/nodes/${nodeId}/experiment`, data);
  }

  // ============================================================================
  // CONNECTIONS
  // ============================================================================

  /**
   * Create a connection between nodes
   */
  async createConnection(request: CreateConnectionRequest): Promise<SequenceConnection> {
    const { id, ...data } = request;
    return this.http.post<SequenceConnection>(`/mail/sequences/${id}/connections`, data);
  }

  /**
   * Delete a connection
   */
  async deleteConnection(sequenceId: string, connectionId: string): Promise<DeleteConnectionResponse> {
    return this.http.delete<DeleteConnectionResponse>(`/mail/sequences/${sequenceId}/connections/${connectionId}`);
  }

  // ============================================================================
  // SEQUENCE ENTRIES (CONTACTS IN SEQUENCE)
  // ============================================================================

  /**
   * List contacts in a sequence
   */
  async listEntries(request: ListSequenceEntriesRequest): Promise<ListSequenceEntriesResponse> {
    const { id, ...params } = request;
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());
    if (params.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return this.http.get<ListSequenceEntriesResponse>(`/mail/sequences/${id}/entries${query ? `?${query}` : ""}`);
  }

  /**
   * Add a contact to a sequence
   */
  async addContact(request: AddContactToSequenceRequest): Promise<SequenceEntry> {
    const { id, contactId } = request;
    return this.http.post<SequenceEntry>(`/mail/sequences/${id}/add-contact`, { contactId });
  }

  /**
   * Remove a contact from a sequence
   */
  async removeContact(request: RemoveContactFromSequenceRequest): Promise<RemoveContactFromSequenceResponse> {
    const { id, entryId, reason } = request;
    return this.http.post<RemoveContactFromSequenceResponse>(`/mail/sequences/${id}/remove-contact`, {
      entryId,
      reason,
    });
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get sequence analytics
   */
  async getAnalytics(id: string): Promise<SequenceAnalyticsResponse> {
    return this.http.get<SequenceAnalyticsResponse>(`/mail/sequences/${id}/analytics`);
  }
}
