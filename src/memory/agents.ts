/**
 * Memory Agents client for Stack0 Memory API
 */

import type { HttpClient } from "../lib/http-client";
import type { Agent, CreateAgentRequest, ListAgentsParams, UpdateAgentRequest } from "./types";

export class MemoryAgents {
  constructor(private http: HttpClient) {}

  /**
   * Create a new memory agent
   */
  async create(request: CreateAgentRequest): Promise<Agent> {
    return this.http.post<Agent>("/memory/agents", request);
  }

  /**
   * List all memory agents
   */
  async list(params: ListAgentsParams = {}): Promise<Agent[]> {
    const qs = new URLSearchParams();
    if (params.environment) qs.set("environment", params.environment);
    const q = qs.toString();
    return this.http.get<Agent[]>(`/memory/agents${q ? `?${q}` : ""}`);
  }

  /**
   * Get a memory agent by ID
   */
  async get(agentId: string): Promise<Agent> {
    return this.http.get<Agent>(`/memory/agents/${agentId}`);
  }

  /**
   * Update a memory agent
   */
  async update(agentId: string, request: UpdateAgentRequest): Promise<Agent> {
    return this.http.patch<Agent>(`/memory/agents/${agentId}`, request);
  }

  /**
   * Delete a memory agent
   */
  async delete(agentId: string): Promise<void> {
    return this.http.delete<void>(`/memory/agents/${agentId}`);
  }
}
