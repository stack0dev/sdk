import type { HttpClient } from "../lib/http-client";
import type { Entity, EntityRelation, ListEntitiesParams, ListEntitiesResult } from "./types";

export class MemoryEntities {
  constructor(private http: HttpClient) {}

  async list(params: ListEntitiesParams): Promise<ListEntitiesResult> {
    const qs = new URLSearchParams();
    qs.set("agentId", params.agentId);
    if (params.type) qs.set("type", params.type);
    if (params.limit) qs.set("limit", params.limit.toString());
    if (params.offset) qs.set("offset", params.offset.toString());
    const q = qs.toString();
    return this.http.get<ListEntitiesResult>(`/memory/entities${q ? `?${q}` : ""}`);
  }

  async get(entityId: string): Promise<Entity> {
    return this.http.get<Entity>(`/memory/entities/${entityId}`);
  }

  async getRelations(entityId: string): Promise<EntityRelation[]> {
    return this.http.get<EntityRelation[]>(`/memory/entities/${entityId}/relations`);
  }
}
