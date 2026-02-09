/**
 * Templates client for Stack0 Mail API
 */

import type { HttpClient } from "../lib/http-client";
import type {
  CreateTemplateRequest,
  DeleteTemplateResponse,
  ListTemplatesRequest,
  ListTemplatesResponse,
  PreviewTemplateRequest,
  PreviewTemplateResponse,
  Template,
  UpdateTemplateRequest,
} from "./types";

export class Templates {
  constructor(private http: HttpClient) {}

  /**
   * List all templates
   */
  async list(request: ListTemplatesRequest = {}): Promise<ListTemplatesResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.isActive !== undefined) params.set("isActive", request.isActive.toString());
    if (request.search) params.set("search", request.search);

    const query = params.toString();
    return this.http.get<ListTemplatesResponse>(`/mail/templates${query ? `?${query}` : ""}`);
  }

  /**
   * Get a template by ID
   */
  async get(id: string): Promise<Template> {
    return this.http.get<Template>(`/mail/templates/${id}`);
  }

  /**
   * Get a template by slug
   */
  async getBySlug(slug: string): Promise<Template> {
    return this.http.get<Template>(`/mail/templates/slug/${slug}`);
  }

  /**
   * Create a new template
   */
  async create(request: CreateTemplateRequest): Promise<Template> {
    return this.http.post<Template>("/mail/templates", request);
  }

  /**
   * Update a template
   */
  async update(request: UpdateTemplateRequest): Promise<Template> {
    const { id, ...data } = request;
    return this.http.put<Template>(`/mail/templates/${id}`, data);
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<DeleteTemplateResponse> {
    return this.http.delete<DeleteTemplateResponse>(`/mail/templates/${id}`);
  }

  /**
   * Preview a template with variables
   */
  async preview(request: PreviewTemplateRequest): Promise<PreviewTemplateResponse> {
    const { id, variables } = request;
    return this.http.post<PreviewTemplateResponse>(`/mail/templates/${id}/preview`, { variables });
  }
}
