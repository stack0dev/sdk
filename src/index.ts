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
import { Integrations } from "./integrations/client";
import { Marketing } from "./marketing/client";
import { Workflows } from "./workflows/client";
import { Memory } from "./memory/client";
import type { HttpClientConfig } from "./lib/http-client";

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
  public mail: Mail;
  public cdn: CDN;
  public screenshots: Screenshots;
  public extraction: Extraction;
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

    // Initialize clients
    this.mail = new Mail(clientConfig);
    this.cdn = new CDN(clientConfig, config.cdnUrl);
    this.screenshots = new Screenshots(clientConfig);
    this.extraction = new Extraction(clientConfig);
    this.integrations = new Integrations(clientConfig);
    this.marketing = new Marketing(clientConfig);
    this.workflows = new Workflows(clientConfig);
    this.memory = new Memory(clientConfig);

    // Keep webdata for backward compatibility
    this.webdata = new Webdata(clientConfig);
  }
}

// Export sub-modules
export * from "./mail";
export * from "./cdn";
export * from "./screenshots";
export * from "./extraction";
export * from "./integrations";
export * from "./marketing";
export * from "./workflows";
export * from "./memory";

// Export shared types
export * from "./lib/shared-types";

// Re-export webdata client only (types are available from screenshots/extraction)
export { Webdata } from "./webdata/client";

// Default export
export default Stack0;
