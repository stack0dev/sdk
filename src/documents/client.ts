/**
 * Stack0 Documents Client
 * Parse PDF and DOCX documents into clean markdown.
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetDocumentRequest,
  ListDocumentsRequest,
  ListDocumentsResponse,
  WebdataDocument,
} from "./types";

export class Documents {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  /**
   * Parse a document from a URL or a previously-uploaded file URL.
   *
   * @example
   * ```typescript
   * const { id } = await stack0.documents.parse({
   *   url: 'https://example.com/whitepaper.pdf',
   * });
   * ```
   */
  async parse(request: CreateDocumentRequest): Promise<CreateDocumentResponse> {
    return this.http.post<CreateDocumentResponse>("/webdata/documents", request);
  }

  async get(request: GetDocumentRequest): Promise<WebdataDocument> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    const q = params.toString();
    return this.http.get<WebdataDocument>(`/webdata/documents/${request.id}${q ? `?${q}` : ""}`);
  }

  async list(request: ListDocumentsRequest = {}): Promise<ListDocumentsResponse> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    if (request.status) params.set("status", request.status);
    if (request.limit) params.set("limit", String(request.limit));
    if (request.cursor) params.set("cursor", request.cursor);
    const q = params.toString();
    return this.http.get<ListDocumentsResponse>(`/webdata/documents${q ? `?${q}` : ""}`);
  }

  async delete(request: GetDocumentRequest): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectId) params.set("projectId", request.projectId);
    const q = params.toString();
    return this.http.deleteWithBody<{ success: boolean }>(
      `/webdata/documents/${request.id}${q ? `?${q}` : ""}`,
      request,
    );
  }

  async parseAndWait(
    request: CreateDocumentRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<WebdataDocument> {
    const { pollInterval = 2000, timeout = 180_000 } = options;
    const { id } = await this.parse(request);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const doc = await this.get({ id, environment: request.environment, projectId: request.projectId });
      if (doc.status === "completed" || doc.status === "failed") {
        if (doc.status === "failed") throw new Error(doc.error || "Document parsing failed");
        return doc;
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
    throw new Error("Document parsing timed out");
  }
}
