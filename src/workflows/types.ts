/**
 * Stack0 Workflows Types
 * AI workflow orchestration and execution
 */

export type Environment = "sandbox" | "production";
export type Provider = "anthropic" | "openai" | "gemini" | "replicate" | "stack0";
export type StepType = "llm" | "image" | "video" | "audio" | "code" | "http" | "transform" | "condition" | "loop";
export type ResponseFormat = "text" | "json";
export type RunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type StepRunStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "cancelled";

export interface StepConfig {
  prompt?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: ResponseFormat;
  imageInputVariable?: string;
  schema?: Record<string, unknown>;
  width?: number;
  height?: number;
  steps?: number;
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  iterateOver?: string;
  itemVariable?: string;
  condition?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
}

export interface StepDefinition {
  id: string;
  name: string;
  type: StepType;
  provider: Provider;
  model: string;
  config: StepConfig & {
    subSteps?: StepDefinition[];
    thenSteps?: StepDefinition[];
    elseSteps?: StepDefinition[];
  };
  dependsOn?: string[];
  outputVariable?: string;
  retryConfig?: RetryConfig;
}

export interface VariableDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "image";
  required: boolean;
  default?: unknown;
  description?: string;
}

export interface Workflow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  steps: StepDefinition[];
  variables: VariableDefinition[];
  isActive: boolean;
  version: number;
  environment: Environment;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepState {
  status: StepRunStatus;
  startedAt?: Date;
  completedAt?: Date;
  output?: unknown;
  error?: string;
  attempts: number;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: RunStatus;
  variables: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  currentStepId: string | null;
  stepStates: Record<string, StepState>;
  output: Record<string, unknown> | null;
  error: string | null;
  totalSteps: number;
  completedSteps: number;
  startedAt: Date | null;
  completedAt: Date | null;
  totalDurationMs: number | null;
  creditsUsed: number;
  environment: Environment;
  createdAt: Date;
}

export interface CreateWorkflowRequest {
  projectSlug?: string;
  environment?: Environment;
  slug: string;
  name: string;
  description?: string;
  steps: StepDefinition[];
  variables?: VariableDefinition[];
}

export interface CreateWorkflowResponse {
  id: string;
  slug: string;
  name: string;
  version: number;
}

export interface UpdateWorkflowRequest {
  id: string;
  projectSlug?: string;
  name?: string;
  description?: string;
  steps?: StepDefinition[];
  variables?: VariableDefinition[];
  isActive?: boolean;
}

export interface GetWorkflowRequest {
  id?: string;
  slug?: string;
  projectSlug?: string;
  environment?: Environment;
}

export interface ListWorkflowsRequest {
  projectSlug?: string;
  environment?: Environment;
  isActive?: boolean;
  limit?: number;
  cursor?: string;
}

export interface ListWorkflowsResponse {
  items: Workflow[];
  nextCursor: string | null;
}

export interface DeleteWorkflowRequest {
  id: string;
  projectSlug?: string;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
}

export interface RunWorkflowRequest {
  workflowId?: string;
  workflowSlug?: string;
  projectSlug?: string;
  environment?: Environment;
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  webhook?: WebhookConfig;
}

export interface RunWorkflowResponse {
  id: string;
  status: string;
  workflowId: string;
}

export interface GetRunRequest {
  id: string;
  projectSlug?: string;
  environment?: Environment;
}

export interface ListRunsRequest {
  workflowId?: string;
  workflowSlug?: string;
  projectSlug?: string;
  environment?: Environment;
  status?: RunStatus;
  limit?: number;
  cursor?: string;
}

export interface ListRunsResponse {
  items: WorkflowRun[];
  nextCursor: string | null;
}

export interface CancelRunRequest {
  id: string;
  projectSlug?: string;
}
