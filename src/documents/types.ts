import type { Environment } from "../lib/shared-types";

export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface CreateDocumentRequest {
  environment?: Environment;
  projectId?: string;
  url?: string;
  fileUrl?: string;
  contentType?: "pdf" | "docx" | "auto";
  webhookUrl?: string;
  webhookSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateDocumentResponse {
  id: string;
  status: DocumentStatus;
}

export interface WebdataDocument {
  id: string;
  organizationId: string;
  projectId?: string;
  environment: Environment;
  source: "url" | "upload";
  sourceUrl?: string;
  fileUrl?: string;
  contentType?: string;
  fileSize?: number;
  status: DocumentStatus;
  markdown?: string;
  pageCount?: number;
  error?: string;
  processingTimeMs?: number;
  createdAt: Date | string;
  completedAt?: Date | string;
}

export interface GetDocumentRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListDocumentsRequest {
  environment?: Environment;
  projectId?: string;
  status?: DocumentStatus;
  limit?: number;
  cursor?: string;
}

export interface ListDocumentsResponse {
  items: WebdataDocument[];
  nextCursor?: string;
}
