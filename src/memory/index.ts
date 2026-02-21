/**
 * Stack0 Memory SDK
 * Agent memory management with collections, recall, and compaction
 * @module @stack0/sdk/memory
 */

// Main client
export { Memory } from "./client";

// Sub-clients (also accessible via Memory instance)
export { MemoryAgents } from "./agents";
export { MemoryCollections } from "./collections";
export { MemoryEntities } from "./entities";

// Types
export type {
  // Memory types
  MemoryType,
  // Agent types
  AgentSettings,
  CreateAgentRequest,
  Agent,
  UpdateAgentRequest,
  ListAgentsParams,
  // Memory operation types
  StoreMemoryRequest,
  MemoryResponse,
  StoreBatchRequest,
  RecallRequest,
  RecallResult,
  SearchRequest,
  SearchResult,
  ListMemoriesParams,
  UpdateMemoryRequest,
  DeleteManyRequest,
  // Collection types
  CreateCollectionRequest,
  CollectionResponse,
  UpdateCollectionRequest,
  CollectionStats,
  CompactRequest,
  CompactionJob,
  // Entity types
  EntityType,
  Entity,
  EntityRelation,
  ListEntitiesParams,
  GetEntityParams,
  ListEntitiesResult,
} from "./types";
