/**
 * Stack0 Memory Client
 * Agent memory management with collections, recall, and compaction
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import { MemoryAgents } from "./agents";
import { MemoryCollections } from "./collections";
import { MemoryEntities } from "./entities";
import type {
  DeleteManyRequest,
  ListMemoriesParams,
  MemoryResponse,
  RecallRequest,
  RecallResult,
  SearchRequest,
  SearchResult,
  StoreBatchRequest,
  StoreMemoryRequest,
  UpdateMemoryRequest,
} from "./types";

export class Memory {
  private http: HttpClient;

  /** Manage memory agents */
  readonly agents: MemoryAgents;

  /** Manage memory collections */
  readonly collections: MemoryCollections;

  /** Manage extracted entities */
  readonly entities: MemoryEntities;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);

    // Initialize sub-clients
    this.agents = new MemoryAgents(this.http);
    this.collections = new MemoryCollections(this.http);
    this.entities = new MemoryEntities(this.http);
  }

  // ============================================================================
  // MEMORY OPERATIONS
  // ============================================================================

  /**
   * Store a memory
   *
   * @example
   * ```typescript
   * const memory = await stack0.memory.store({
   *   agentId: 'agent_123',
   *   content: 'User prefers dark mode',
   *   type: 'preference',
   *   tags: ['ui', 'settings'],
   * });
   * ```
   */
  async store(request: StoreMemoryRequest): Promise<MemoryResponse> {
    return this.http.post<MemoryResponse>("/memory/memories", request);
  }

  /**
   * Store multiple memories in a batch
   *
   * @example
   * ```typescript
   * const results = await stack0.memory.storeBatch({
   *   agentId: 'agent_123',
   *   memories: [
   *     { content: 'User prefers dark mode', type: 'preference' },
   *     { content: 'User is based in NYC', type: 'fact' },
   *   ],
   * });
   * ```
   */
  async storeBatch(request: StoreBatchRequest): Promise<MemoryResponse[]> {
    return this.http.post<MemoryResponse[]>("/memory/memories/batch", request);
  }

  /**
   * Recall memories using semantic search (vector similarity)
   *
   * @example
   * ```typescript
   * const results = await stack0.memory.recall({
   *   agentId: 'agent_123',
   *   query: 'What are the user preferences?',
   *   limit: 10,
   * });
   * ```
   */
  async recall(request: RecallRequest): Promise<RecallResult[]> {
    return this.http.post<RecallResult[]>("/memory/memories/recall", request);
  }

  /**
   * Search memories using full-text search
   *
   * @example
   * ```typescript
   * const results = await stack0.memory.search({
   *   agentId: 'agent_123',
   *   query: 'dark mode',
   *   limit: 20,
   * });
   * ```
   */
  async search(request: SearchRequest): Promise<SearchResult> {
    return this.http.post<SearchResult>("/memory/memories/search", request);
  }

  /**
   * Get a memory by ID
   */
  async get(memoryId: string): Promise<MemoryResponse> {
    return this.http.get<MemoryResponse>(`/memory/memories/${memoryId}`);
  }

  /**
   * List memories with optional filters
   *
   * @example
   * ```typescript
   * const memories = await stack0.memory.list({
   *   agentId: 'agent_123',
   *   type: 'preference',
   *   limit: 50,
   * });
   * ```
   */
  async list(params: ListMemoriesParams): Promise<MemoryResponse[]> {
    const qs = new URLSearchParams();
    qs.set("agentId", params.agentId);
    if (params.collectionSlug) qs.set("collectionSlug", params.collectionSlug);
    if (params.type) qs.set("type", params.type);
    if (params.tier) qs.set("tier", params.tier);
    if (params.limit) qs.set("limit", params.limit.toString());
    if (params.offset) qs.set("offset", params.offset.toString());
    if (params.sortBy) qs.set("sortBy", params.sortBy);
    if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
    const q = qs.toString();
    return this.http.get<MemoryResponse[]>(`/memory/memories${q ? `?${q}` : ""}`);
  }

  /**
   * Update a memory
   */
  async update(memoryId: string, request: UpdateMemoryRequest): Promise<MemoryResponse> {
    return this.http.patch<MemoryResponse>(`/memory/memories/${memoryId}`, request);
  }

  /**
   * Delete a memory by ID
   */
  async delete(memoryId: string): Promise<void> {
    return this.http.delete<void>(`/memory/memories/${memoryId}`);
  }

  /**
   * Delete multiple memories
   */
  async deleteMany(request: DeleteManyRequest): Promise<void> {
    return this.http.deleteWithBody<void>("/memory/memories", request);
  }
}
