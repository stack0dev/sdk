/**
 * Stack0 SDK
 * Official SDK for Stack0 services
 *
 * @example
 * ```typescript
 * import { Stack0 } from '@stack0/sdk';
 *
 * const stack0 = new Stack0({ apiKey: 'stack0_...' });
 *
 * // Send an email
 * await stack0.mail.send({
 *   from: 'noreply@example.com',
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   html: '<p>World</p>',
 * });
 *
 * // Upload a file to CDN
 * const asset = await stack0.cdn.upload({
 *   projectSlug: 'my-project',
 *   file: fileBuffer,
 *   filename: 'image.jpg',
 *   mimeType: 'image/jpeg',
 * });
 *
 * // Capture a screenshot
 * const screenshot = await stack0.screenshots.captureAndWait({
 *   url: 'https://example.com',
 *   format: 'png',
 *   fullPage: true,
 * });
 *
 * // Extract content from a page
 * const extraction = await stack0.extraction.extractAndWait({
 *   url: 'https://example.com/article',
 *   mode: 'markdown',
 * });
 *
 * // List contacts from a connected CRM
 * const contacts = await stack0.integrations.crm.listContacts('conn_123');
 *
 * // Send a Slack message
 * await stack0.integrations.communication.sendMessage('conn_456', {
 *   channelId: 'C123',
 *   content: 'Hello from Stack0!',
 * });
 *
 * // Discover trends and generate content ideas
 * const { trendsDiscovered, trends } = await stack0.marketing.discoverTrends({
 *   projectSlug: 'my-project',
 *   environment: 'production',
 * });
 *
 * // Run an AI workflow
 * const run = await stack0.workflows.runAndWait({
 *   workflowSlug: 'content-pipeline',
 *   variables: { topic: 'AI trends' },
 * });
 * console.log(run.output);
 *
 * // Store and recall agent memories
 * await stack0.memory.store({
 *   agentId: 'agent_123',
 *   content: 'User prefers dark mode',
 *   type: 'preference',
 * });
 * const memories = await stack0.memory.recall({
 *   agentId: 'agent_123',
 *   query: 'user preferences',
 * });
 * ```
 */

import { Mail } from "./mail/client";
import { CDN } from "./cdn/client";
import { Screenshots } from "./screenshots/client";
import { Extraction } from "./extraction/client";
import { Webdata } from "./webdata/client";
import { Crawl$ } from "./crawl/client";
import { Map$ } from "./map/client";
import { Documents } from "./documents/client";
import { Integrations } from "./integrations/client";
import { Marketing } from "./marketing/client";
import { Workflows } from "./workflows/client";
import { Memory } from "./memory/client";
import { HttpClient, type HttpClientConfig } from "./lib/http-client";

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  organizationId: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  iconUrl?: string | null;
}

export interface Stack0Config extends HttpClientConfig {
  apiKey: string;
  baseUrl?: string;
  /**
   * CDN base URL for image transformations (e.g., 'https://cdn.yourproject.stack0.dev')
   * When provided, transform URLs are generated client-side without API calls
   */
  cdnUrl?: string;
}

/**
 * Main Stack0 SDK class
 * Provides access to all Stack0 services
 */
export class Stack0 {
  private http: HttpClient;

  public mail: Mail;
  public cdn: CDN;
  public screenshots: Screenshots;
  public extraction: Extraction;
  public crawl: Crawl$;
  public map: Map$;
  public documents: Documents;
  public integrations: Integrations;
  public marketing: Marketing;
  public workflows: Workflows;
  public memory: Memory;

  /**
   * @deprecated Use `screenshots` and `extraction` instead. Will be removed in a future version.
   */
  public webdata: Webdata;

  constructor(config: Stack0Config) {
    const clientConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    };

    this.http = new HttpClient(clientConfig);

    // Initialize clients
    this.mail = new Mail(clientConfig);
    this.cdn = new CDN(clientConfig, config.cdnUrl);
    this.screenshots = new Screenshots(clientConfig);
    this.extraction = new Extraction(clientConfig);
    this.crawl = new Crawl$(clientConfig);
    this.map = new Map$(clientConfig);
    this.documents = new Documents(clientConfig);
    this.integrations = new Integrations(clientConfig);
    this.marketing = new Marketing(clientConfig);
    this.workflows = new Workflows(clientConfig);
    this.memory = new Memory(clientConfig);

    // Keep webdata for backward compatibility
    this.webdata = new Webdata(clientConfig);
  }

  // ============================================================================
  // PROJECTS
  // ============================================================================

  async listProjects(): Promise<Project[]> {
    return this.http.get<Project[]>("/projects");
  }

  async getProject(id: string): Promise<Project> {
    return this.http.get<Project>(`/projects/${id}`);
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    return this.http.get<Project>(`/projects/by-slug/${slug}`);
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    return this.http.post<Project>("/projects", request);
  }

  async updateProject(request: UpdateProjectRequest): Promise<Project> {
    const { id, ...data } = request;
    return this.http.patch<Project>(`/projects/${id}`, data);
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.http.delete(`/projects/${id}`);
  }
}

// Export sub-modules
export * from "./mail";
export * from "./cdn";
export * from "./screenshots";
export * from "./extraction";
export * from "./crawl";
export * from "./map";
export * from "./documents";
export * from "./integrations";
export * from "./marketing";
export * from "./workflows";
export * from "./memory";

// Export shared types (Environment excluded — already exported by ./workflows)
export {
  type Stack0Error,
  type PaginatedRequest,
  type PaginatedResponse,
  type BatchJobStatus,
  type ScheduleFrequency,
  type GetBatchJobRequest,
  type ListBatchJobsRequest,
  type CreateBatchResponse,
  type GetScheduleRequest,
  type ListSchedulesRequest,
  type CreateScheduleResponse,
} from "./lib/shared-types";

// Re-export webdata client only (types are available from screenshots/extraction)
export { Webdata } from "./webdata/client";

// Default export
export default Stack0;
