/**
 * Stack0 Memory SDK Types
 * Type definitions for the Memory API (agent memory management)
 */

import type { Environment } from "../lib/shared-types";

export type { Environment };

// ============================================================================
// MEMORY TYPES
// ============================================================================

export type MemoryType = "preference" | "fact" | "event" | "relationship" | "instruction" | "pattern";

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface AgentSettings {
  autoClassify?: boolean;
  autoExtractEntities?: boolean;
  embeddingModel?: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  settings?: AgentSettings;
  environment?: Environment;
}

export interface Agent {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  environment: string;
  settings?: Record<string, unknown>;
  totalMemories: number;
  totalCollections: number;
  totalEntities: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  settings?: AgentSettings;
  environment?: Environment;
}

export interface ListAgentsParams {
  environment?: string;
}

// ============================================================================
// MEMORY TYPES
// ============================================================================

export interface StoreMemoryRequest {
  agentId: string;
  content: string;
  collectionSlug?: string;
  type?: MemoryType;
  source?: string;
  tags?: string[];
  confidence?: number;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
}

export interface MemoryResponse {
  id: string;
  agentId: string;
  collectionId: string;
  content: string;
  type?: string;
  tier: string;
  source?: string;
  tags?: string[];
  confidence: number;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  compactedFrom?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface StoreBatchRequest {
  agentId: string;
  memories: Omit<StoreMemoryRequest, "agentId">[];
}

export interface RecallRequest {
  agentId: string;
  query: string;
  collectionSlug?: string;
  limit?: number;
  types?: string[];
  tiers?: string[];
  minConfidence?: number;
  tags?: string[];
}

export interface RecallResult extends MemoryResponse {
  score: number;
}

export interface SearchRequest {
  agentId: string;
  query: string;
  collectionSlug?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  memories: MemoryResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListMemoriesParams {
  agentId: string;
  collectionSlug?: string;
  type?: string;
  tier?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateMemoryRequest {
  content?: string;
  type?: string;
  tier?: string;
  tags?: string[];
  confidence?: number;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
}

export interface DeleteManyRequest {
  agentId: string;
  memoryIds: string[];
}

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export interface CreateCollectionRequest {
  agentId: string;
  name: string;
  slug: string;
  description?: string;
  compaction?: Record<string, unknown>;
  retention?: Record<string, unknown>;
}

export interface CollectionResponse {
  id: string;
  agentId: string;
  slug: string;
  name?: string;
  description?: string;
  compaction?: Record<string, unknown>;
  retention?: Record<string, unknown>;
  lastCompactionAt?: string;
  nextCompactionAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  compaction?: Record<string, unknown>;
  retention?: Record<string, unknown>;
}

export interface CollectionStats {
  collectionId: string;
  totalMemories: number;
  byTier: Record<string, number>;
  byType: Record<string, number>;
  oldestMemory?: string;
  newestMemory?: string;
}

export interface CompactRequest {
  tier?: string;
}

export interface CompactionJob {
  id: string;
  agentId: string;
  collectionId: string;
  status: string;
  tier: string;
  memoriesQueued: number;
  memoriesProcessed: number;
  memoriesCreated: number;
  memoriesArchived: number;
  durationMs?: number;
  creditsUsed?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
