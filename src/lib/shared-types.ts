/**
 * Shared types used across multiple SDK modules
 */

export type Environment = "sandbox" | "production";

export interface Stack0Error extends Error {
  statusCode?: number;
  code?: string;
  response?: unknown;
}

export interface PaginatedRequest {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse {
  total: number;
  limit: number;
  offset: number;
}

export type BatchJobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export type ScheduleFrequency = "hourly" | "daily" | "weekly" | "monthly";

export interface GetBatchJobRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListBatchJobsRequest {
  environment?: Environment;
  projectId?: string;
  status?: BatchJobStatus;
  limit?: number;
  cursor?: string;
}

export interface CreateBatchResponse {
  id: string;
  status: BatchJobStatus;
  totalUrls: number;
}

export interface GetScheduleRequest {
  id: string;
  environment?: Environment;
  projectId?: string;
}

export interface ListSchedulesRequest {
  environment?: Environment;
  projectId?: string;
  isActive?: boolean;
  limit?: number;
  cursor?: string;
}

export interface CreateScheduleResponse {
  id: string;
}
