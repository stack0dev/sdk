/**
 * Memory Collections client for Stack0 Memory API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  CollectionResponse,
  CollectionStats,
  CompactRequest,
  CompactionJob,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "./types";

export class MemoryCollections {
  constructor(private http: HttpClient) {}

  /**
   * Create a new collection for an agent
   */
  async create(request: CreateCollectionRequest): Promise<CollectionResponse> {
    return this.http.post<CollectionResponse>(`/memory/agents/${request.agentId}/collections`, {
      name: request.name,
      slug: request.slug,
      description: request.description,
      compaction: request.compaction,
      retention: request.retention,
    });
  }

  /**
   * List all collections for an agent
   */
  async list(agentId: string): Promise<CollectionResponse[]> {
    return this.http.get<CollectionResponse[]>(`/memory/agents/${agentId}/collections`);
  }

  /**
   * Get a collection by slug
   */
  async get(agentId: string, collectionSlug: string): Promise<CollectionResponse> {
    return this.http.get<CollectionResponse>(`/memory/agents/${agentId}/collections/${collectionSlug}`);
  }

  /**
   * Update a collection
   */
  async update(
    agentId: string,
    collectionSlug: string,
    request: UpdateCollectionRequest,
  ): Promise<CollectionResponse> {
    return this.http.patch<CollectionResponse>(
      `/memory/agents/${agentId}/collections/${collectionSlug}`,
      request,
    );
  }

  /**
   * Delete a collection
   */
  async delete(agentId: string, collectionSlug: string): Promise<void> {
    return this.http.delete<void>(`/memory/agents/${agentId}/collections/${collectionSlug}`);
  }

  /**
   * Get collection statistics
   */
  async stats(agentId: string, collectionSlug: string): Promise<CollectionStats> {
    return this.http.get<CollectionStats>(
      `/memory/agents/${agentId}/collections/${collectionSlug}/stats`,
    );
  }

  /**
   * Trigger compaction for a collection
   */
  async compact(agentId: string, collectionSlug: string, request: CompactRequest = {}): Promise<CompactionJob> {
    return this.http.post<CompactionJob>(
      `/memory/agents/${agentId}/collections/${collectionSlug}/compact`,
      request,
    );
  }

  /**
   * Get a compaction job by ID
   */
  async getCompactionJob(agentId: string, collectionSlug: string, jobId: string): Promise<CompactionJob> {
    return this.http.get<CompactionJob>(
      `/memory/agents/${agentId}/collections/${collectionSlug}/compact/${jobId}`,
    );
  }
}
