/**
 * Stack0 Workflows Client
 * AI workflow orchestration and execution
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  Workflow,
  WorkflowRun,
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  UpdateWorkflowRequest,
  GetWorkflowRequest,
  ListWorkflowsRequest,
  ListWorkflowsResponse,
  DeleteWorkflowRequest,
  RunWorkflowRequest,
  RunWorkflowResponse,
  GetRunRequest,
  ListRunsRequest,
  ListRunsResponse,
  CancelRunRequest,
} from "./types";

export class Workflows {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  // ==========================================================================
  // WORKFLOW CRUD
  // ==========================================================================

  /**
   * Create a new workflow
   *
   * @example
   * ```typescript
   * const workflow = await workflows.create({
   *   slug: 'content-pipeline',
   *   name: 'Content Generation Pipeline',
   *   steps: [
   *     {
   *       id: 'generate',
   *       name: 'Generate Content',
   *       type: 'llm',
   *       provider: 'anthropic',
   *       model: 'claude-sonnet-4-20250514',
   *       config: {
   *         prompt: 'Write a blog post about {{topic}}',
   *         maxTokens: 2000,
   *       },
   *     },
   *   ],
   *   variables: [
   *     { name: 'topic', type: 'string', required: true },
   *   ],
   * });
   * ```
   */
  async create(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    return this.http.post<CreateWorkflowResponse>("/workflows/workflows", request);
  }

  /**
   * Get a workflow by ID or slug
   *
   * @example
   * ```typescript
   * const workflow = await workflows.get({ slug: 'content-pipeline' });
   * console.log(workflow.steps);
   * ```
   */
  async get(request: GetWorkflowRequest): Promise<Workflow> {
    const params = new URLSearchParams();
    if (request.slug) params.set("slug", request.slug);
    if (request.environment) params.set("environment", request.environment);
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);

    const path = request.id
      ? `/workflows/workflows/${request.id}`
      : `/workflows/workflows?${params.toString()}`;

    const response = await this.http.get<Workflow>(path);
    return this.convertDates(response);
  }

  /**
   * List workflows with pagination
   *
   * @example
   * ```typescript
   * const { items, nextCursor } = await workflows.list({
   *   environment: 'production',
   *   isActive: true,
   *   limit: 20,
   * });
   * ```
   */
  async list(request: ListWorkflowsRequest = {}): Promise<ListWorkflowsResponse> {
    const params = new URLSearchParams();

    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.isActive !== undefined) params.set("isActive", request.isActive.toString());
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ListWorkflowsResponse>(
      `/workflows/workflows${query ? `?${query}` : ""}`,
    );

    return {
      ...response,
      items: response.items.map((item) => this.convertDates(item)),
    };
  }

  /**
   * Update a workflow
   *
   * @example
   * ```typescript
   * await workflows.update({
   *   id: 'workflow-id',
   *   name: 'Updated Pipeline',
   *   isActive: false,
   * });
   * ```
   */
  async update(request: UpdateWorkflowRequest): Promise<{ success: boolean; version: number }> {
    const { id, ...data } = request;
    return this.http.post<{ success: boolean; version: number }>(
      `/workflows/workflows/${id}`,
      data,
    );
  }

  /**
   * Delete a workflow
   *
   * @example
   * ```typescript
   * await workflows.delete({ id: 'workflow-id' });
   * ```
   */
  async delete(request: DeleteWorkflowRequest): Promise<{ success: boolean }> {
    return this.http.deleteWithBody<{ success: boolean }>(
      `/workflows/workflows/${request.id}`,
      request,
    );
  }

  // ==========================================================================
  // WORKFLOW EXECUTION
  // ==========================================================================

  /**
   * Run a workflow
   *
   * @example
   * ```typescript
   * const run = await workflows.run({
   *   workflowSlug: 'content-pipeline',
   *   variables: {
   *     topic: 'artificial intelligence',
   *   },
   *   webhook: {
   *     url: 'https://example.com/webhook',
   *     secret: 'webhook-secret',
   *   },
   * });
   * console.log(run.id, run.status);
   * ```
   */
  async run(request: RunWorkflowRequest): Promise<RunWorkflowResponse> {
    return this.http.post<RunWorkflowResponse>("/workflows/workflows/run", request);
  }

  /**
   * Get a workflow run by ID
   *
   * @example
   * ```typescript
   * const run = await workflows.getRun({ id: 'run-id' });
   * if (run.status === 'completed') {
   *   console.log(run.output);
   * }
   * ```
   */
  async getRun(request: GetRunRequest): Promise<WorkflowRun> {
    const params = new URLSearchParams();
    if (request.environment) params.set("environment", request.environment);
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);

    const query = params.toString();
    const response = await this.http.get<WorkflowRun>(
      `/workflows/workflows/runs/${request.id}${query ? `?${query}` : ""}`,
    );
    return this.convertRunDates(response);
  }

  /**
   * List workflow runs with pagination
   *
   * @example
   * ```typescript
   * const { items } = await workflows.listRuns({
   *   workflowId: 'workflow-id',
   *   status: 'completed',
   * });
   * ```
   */
  async listRuns(request: ListRunsRequest = {}): Promise<ListRunsResponse> {
    const params = new URLSearchParams();

    if (request.workflowId) params.set("workflowId", request.workflowId);
    if (request.workflowSlug) params.set("workflowSlug", request.workflowSlug);
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.status) params.set("status", request.status);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.cursor) params.set("cursor", request.cursor);

    const query = params.toString();
    const response = await this.http.get<ListRunsResponse>(
      `/workflows/workflows/runs${query ? `?${query}` : ""}`,
    );

    return {
      ...response,
      items: response.items.map((item) => this.convertRunDates(item)),
    };
  }

  /**
   * Cancel a running workflow
   *
   * @example
   * ```typescript
   * await workflows.cancelRun({ id: 'run-id' });
   * ```
   */
  async cancelRun(request: CancelRunRequest): Promise<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `/workflows/workflows/runs/${request.id}/cancel`,
      {},
    );
  }

  /**
   * Run a workflow and wait for completion
   *
   * @example
   * ```typescript
   * const run = await workflows.runAndWait({
   *   workflowSlug: 'content-pipeline',
   *   variables: { topic: 'AI' },
   * });
   * console.log(run.output);
   * ```
   */
  async runAndWait(
    request: RunWorkflowRequest,
    options: { pollInterval?: number; timeout?: number } = {},
  ): Promise<WorkflowRun> {
    const { pollInterval = 2000, timeout = 600000 } = options;
    const startTime = Date.now();

    const { id } = await this.run(request);

    while (Date.now() - startTime < timeout) {
      const run = await this.getRun({
        id,
        environment: request.environment,
        projectSlug: request.projectSlug,
      });

      if (
        run.status === "completed" ||
        run.status === "failed" ||
        run.status === "cancelled"
      ) {
        if (run.status === "failed") {
          throw new Error(run.error || "Workflow execution failed");
        }
        return run;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error("Workflow execution timed out");
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private convertDates(workflow: Workflow): Workflow {
    if (typeof workflow.createdAt === "string") {
      workflow.createdAt = new Date(workflow.createdAt);
    }
    if (typeof workflow.updatedAt === "string") {
      workflow.updatedAt = new Date(workflow.updatedAt);
    }
    return workflow;
  }

  private convertRunDates(run: WorkflowRun): WorkflowRun {
    if (typeof run.createdAt === "string") {
      run.createdAt = new Date(run.createdAt);
    }
    if (run.startedAt && typeof run.startedAt === "string") {
      run.startedAt = new Date(run.startedAt);
    }
    if (run.completedAt && typeof run.completedAt === "string") {
      run.completedAt = new Date(run.completedAt);
    }
    return run;
  }
}
