/**
 * Stack0 Marketing Client
 * Discover trends, generate content opportunities, and manage marketing content
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  Trend,
  DiscoverTrendsRequest,
  DiscoverTrendsResponse,
  ListTrendsRequest,
  ListTrendsResponse,
  UpdateTrendStatusRequest,
  UpdateTrendStatusResponse,
  Opportunity,
  GenerateOpportunitiesRequest,
  GenerateOpportunitiesResponse,
  ListOpportunitiesRequest,
  ListOpportunitiesResponse,
  DismissOpportunityRequest,
  Content,
  CreateContentRequest,
  ListContentRequest,
  ListContentResponse,
  UpdateContentRequest,
  ApproveContentRequest,
  RejectContentRequest,
  Script,
  CreateScriptRequest,
  ListScriptsRequest,
  ListScriptsResponse,
  UpdateScriptRequest,
  CreateScriptVersionRequest,
  DeleteScriptResponse,
  AnalyticsOverviewRequest,
  AnalyticsOverviewResponse,
  ContentPerformanceRequest,
  ContentPerformanceResponse,
  TrendAnalyticsRequest,
  TrendAnalyticsResponse,
  OpportunityConversionRequest,
  OpportunityConversionResponse,
  CalendarEntry,
  ScheduleContentRequest,
  ListCalendarEntriesRequest,
  UpdateCalendarEntryRequest,
  CancelCalendarEntryResponse,
  MarkPublishedRequest,
  AssetJob,
  CreateAssetJobRequest,
  ListAssetJobsRequest,
  UpdateAssetJobStatusRequest,
  MarketingSettings,
  GetSettingsRequest,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  MarketingUsage,
  GetCurrentUsageRequest,
  CurrentUsageResponse,
  GetUsageHistoryRequest,
  GetTotalUsageRequest,
  TotalUsageResponse,
  RecordUsageRequest,
} from "./types";

export class Marketing {
  private http: HttpClient;

  constructor(config: HttpClientConfig) {
    this.http = new HttpClient(config);
  }

  // ============================================================================
  // Trends
  // ============================================================================

  /**
   * Discover new trends from all sources
   *
   * @example
   * ```typescript
   * const { trendsDiscovered, trends } = await marketing.discoverTrends({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`Discovered ${trendsDiscovered} new trends`);
   * ```
   */
  async discoverTrends(request: DiscoverTrendsRequest): Promise<DiscoverTrendsResponse> {
    return this.http.post<DiscoverTrendsResponse>("/marketing/trends/discover", request);
  }

  /**
   * List trends for a project
   *
   * @example
   * ```typescript
   * const trends = await marketing.listTrends({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   *   limit: 20,
   * });
   * ```
   */
  async listTrends(request: ListTrendsRequest): Promise<Trend[]> {
    return this.http.get<Trend[]>(
      `/marketing/trends?${new URLSearchParams({
        projectSlug: request.projectSlug,
        environment: request.environment,
        ...(request.status && { status: request.status }),
        ...(request.limit && { limit: request.limit.toString() }),
      }).toString()}`,
    );
  }

  /**
   * Get a single trend by ID
   */
  async getTrend(trendId: string): Promise<Trend> {
    const response = await this.http.get<Trend>(`/marketing/trends/${trendId}`);
    return this.convertTrendDates(response);
  }

  /**
   * Update trend status
   *
   * @example
   * ```typescript
   * await marketing.updateTrendStatus({
   *   trendId: 'trend-id',
   *   status: 'active',
   * });
   * ```
   */
  async updateTrendStatus(request: UpdateTrendStatusRequest): Promise<UpdateTrendStatusResponse> {
    return this.http.patch<UpdateTrendStatusResponse>(`/marketing/trends/${request.trendId}/status`, {
      status: request.status,
    });
  }

  // ============================================================================
  // Opportunities
  // ============================================================================

  /**
   * Generate content opportunities from active trends
   *
   * @example
   * ```typescript
   * const { opportunitiesGenerated, opportunities } = await marketing.generateOpportunities({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`Generated ${opportunitiesGenerated} new content ideas`);
   * ```
   */
  async generateOpportunities(request: GenerateOpportunitiesRequest): Promise<GenerateOpportunitiesResponse> {
    return this.http.post<GenerateOpportunitiesResponse>("/marketing/opportunities/generate", request);
  }

  /**
   * List opportunities for a project
   *
   * @example
   * ```typescript
   * const opportunities = await marketing.listOpportunities({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   *   status: 'pending',
   *   limit: 20,
   * });
   * ```
   */
  async listOpportunities(request: ListOpportunitiesRequest): Promise<Opportunity[]> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      environment: request.environment,
      ...(request.status && { status: request.status }),
      ...(request.limit && { limit: request.limit.toString() }),
    });

    return this.http.get<Opportunity[]>(`/marketing/opportunities?${params.toString()}`);
  }

  /**
   * Get a single opportunity by ID
   */
  async getOpportunity(opportunityId: string): Promise<Opportunity> {
    const response = await this.http.get<Opportunity>(`/marketing/opportunities/${opportunityId}`);
    return this.convertOpportunityDates(response);
  }

  /**
   * Dismiss an opportunity
   *
   * @example
   * ```typescript
   * await marketing.dismissOpportunity({ opportunityId: 'opp-id' });
   * ```
   */
  async dismissOpportunity(request: DismissOpportunityRequest): Promise<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`/marketing/opportunities/${request.opportunityId}/dismiss`, {});
  }

  // ============================================================================
  // Content
  // ============================================================================

  /**
   * Create new marketing content
   *
   * @example
   * ```typescript
   * const content = await marketing.createContent({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   *   contentType: 'tiktok_slideshow',
   *   title: 'How AI is Changing Marketing',
   *   opportunityId: 'opp-id',
   * });
   * ```
   */
  async createContent(request: CreateContentRequest): Promise<Content> {
    const response = await this.http.post<Content>("/marketing/content", request);
    return this.convertContentDates(response);
  }

  /**
   * List content with filters
   *
   * @example
   * ```typescript
   * const content = await marketing.listContent({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   *   status: 'published',
   *   limit: 20,
   * });
   * ```
   */
  async listContent(request: ListContentRequest): Promise<Content[]> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      environment: request.environment,
      ...(request.status && { status: request.status }),
      ...(request.contentType && { contentType: request.contentType }),
      ...(request.approvalStatus && { approvalStatus: request.approvalStatus }),
      ...(request.limit && { limit: request.limit.toString() }),
      ...(request.offset && { offset: request.offset.toString() }),
    });

    const response = await this.http.get<Content[]>(`/marketing/content?${params.toString()}`);
    return response.map((c) => this.convertContentDates(c));
  }

  /**
   * Get a single content by ID
   */
  async getContent(contentId: string): Promise<Content> {
    const response = await this.http.get<Content>(`/marketing/content/${contentId}`);
    return this.convertContentDates(response);
  }

  /**
   * Update content
   *
   * @example
   * ```typescript
   * const updated = await marketing.updateContent({
   *   contentId: 'content-id',
   *   title: 'Updated Title',
   *   status: 'published',
   * });
   * ```
   */
  async updateContent(request: UpdateContentRequest): Promise<Content> {
    const { contentId, ...data } = request;
    const response = await this.http.patch<Content>(`/marketing/content/${contentId}`, data);
    return this.convertContentDates(response);
  }

  /**
   * Approve content for publishing
   *
   * @example
   * ```typescript
   * await marketing.approveContent({
   *   contentId: 'content-id',
   *   reviewNotes: 'Looks great!',
   * });
   * ```
   */
  async approveContent(request: ApproveContentRequest): Promise<Content> {
    const response = await this.http.post<Content>(`/marketing/content/${request.contentId}/approve`, request);
    return this.convertContentDates(response);
  }

  /**
   * Reject content
   *
   * @example
   * ```typescript
   * await marketing.rejectContent({
   *   contentId: 'content-id',
   *   reviewNotes: 'Needs revisions',
   * });
   * ```
   */
  async rejectContent(request: RejectContentRequest): Promise<Content> {
    const response = await this.http.post<Content>(`/marketing/content/${request.contentId}/reject`, request);
    return this.convertContentDates(response);
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<{ success: boolean }> {
    return this.http.deleteWithBody<{ success: boolean }>(`/marketing/content/${contentId}`, { contentId });
  }

  // ============================================================================
  // Scripts
  // ============================================================================

  /**
   * Create a new script
   *
   * @example
   * ```typescript
   * const script = await marketing.createScript({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   *   hook: 'Are you ready to see the future?',
   *   slides: [
   *     { order: 0, text: 'AI is changing everything', voiceoverText: 'AI is transforming how we work', duration: 3 },
   *   ],
   *   cta: 'Follow for more insights!',
   * });
   * ```
   */
  async createScript(request: CreateScriptRequest): Promise<Script> {
    const response = await this.http.post<Script>("/marketing/scripts", request);
    return this.convertScriptDates(response);
  }

  /**
   * List scripts
   */
  async listScripts(request: ListScriptsRequest): Promise<Script[]> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      environment: request.environment,
      ...(request.contentId && { contentId: request.contentId }),
      ...(request.limit && { limit: request.limit.toString() }),
    });

    const response = await this.http.get<Script[]>(`/marketing/scripts?${params.toString()}`);
    return response.map((s) => this.convertScriptDates(s));
  }

  /**
   * Get a single script by ID
   */
  async getScript(scriptId: string): Promise<Script> {
    const response = await this.http.get<Script>(`/marketing/scripts/${scriptId}`);
    return this.convertScriptDates(response);
  }

  /**
   * Update a script
   *
   * @example
   * ```typescript
   * const updated = await marketing.updateScript({
   *   scriptId: 'script-id',
   *   hook: 'Updated hook line',
   *   cta: 'New call to action!',
   * });
   * ```
   */
  async updateScript(request: UpdateScriptRequest): Promise<Script> {
    const { scriptId, ...data } = request;
    const response = await this.http.patch<Script>(`/marketing/scripts/${scriptId}`, data);
    return this.convertScriptDates(response);
  }

  /**
   * Create a new version of a script
   *
   * @example
   * ```typescript
   * const newVersion = await marketing.createScriptVersion({
   *   scriptId: 'script-id',
   *   hook: 'Updated hook for v2',
   *   slides: [...],
   *   cta: 'Updated CTA',
   * });
   * ```
   */
  async createScriptVersion(request: CreateScriptVersionRequest): Promise<Script> {
    const { scriptId, ...data } = request;
    const response = await this.http.post<Script>(`/marketing/scripts/${scriptId}/versions`, data);
    return this.convertScriptDates(response);
  }

  /**
   * Get all versions of a script
   */
  async getScriptVersions(scriptId: string): Promise<Script[]> {
    const response = await this.http.get<Script[]>(`/marketing/scripts/${scriptId}/versions`);
    return response.map((s) => this.convertScriptDates(s));
  }

  /**
   * Delete a script
   */
  async deleteScript(scriptId: string): Promise<DeleteScriptResponse> {
    return this.http.delete<DeleteScriptResponse>(`/marketing/scripts/${scriptId}`);
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Get analytics overview
   *
   * @example
   * ```typescript
   * const analytics = await marketing.getAnalyticsOverview({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`Total content: ${analytics.totalContent}`);
   * console.log(`Total views: ${analytics.engagement.views}`);
   * ```
   */
  async getAnalyticsOverview(request: AnalyticsOverviewRequest): Promise<AnalyticsOverviewResponse> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      environment: request.environment,
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
    });

    return this.http.get<AnalyticsOverviewResponse>(`/marketing/analytics/overview?${params.toString()}`);
  }

  /**
   * Get content performance metrics
   *
   * @example
   * ```typescript
   * const topContent = await marketing.getContentPerformance({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   *   contentType: 'tiktok_slideshow',
   *   limit: 10,
   * });
   * ```
   */
  async getContentPerformance(request: ContentPerformanceRequest): Promise<ContentPerformanceResponse> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      environment: request.environment,
      ...(request.contentType && { contentType: request.contentType }),
      ...(request.limit && { limit: request.limit.toString() }),
    });

    return this.http.get<ContentPerformanceResponse>(`/marketing/analytics/performance?${params.toString()}`);
  }

  /**
   * Get trend discovery analytics
   *
   * @example
   * ```typescript
   * const trendStats = await marketing.getTrendAnalytics({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`Total trends: ${trendStats.totalTrends}`);
   * ```
   */
  async getTrendAnalytics(request: TrendAnalyticsRequest): Promise<TrendAnalyticsResponse> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
    });

    return this.http.get<TrendAnalyticsResponse>(`/marketing/analytics/trends?${params.toString()}`);
  }

  /**
   * Get opportunity conversion analytics
   *
   * @example
   * ```typescript
   * const conversion = await marketing.getOpportunityConversion({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`Conversion rate: ${conversion.conversionRate}%`);
   * ```
   */
  async getOpportunityConversion(request: OpportunityConversionRequest): Promise<OpportunityConversionResponse> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
    });

    return this.http.get<OpportunityConversionResponse>(`/marketing/analytics/conversion?${params.toString()}`);
  }

  // ============================================================================
  // Calendar
  // ============================================================================

  /**
   * Schedule content for publishing
   *
   * @example
   * ```typescript
   * const entry = await marketing.scheduleContent({
   *   projectSlug: 'my-project',
   *   contentId: 'content-id',
   *   scheduledFor: new Date('2024-12-25T10:00:00Z'),
   *   autoPublish: true,
   * });
   * ```
   */
  async scheduleContent(request: ScheduleContentRequest): Promise<CalendarEntry> {
    const response = await this.http.post<CalendarEntry>("/marketing/calendar/schedule", {
      ...request,
      scheduledFor: request.scheduledFor.toISOString(),
    });
    return this.convertCalendarEntryDates(response);
  }

  /**
   * List scheduled content
   *
   * @example
   * ```typescript
   * const entries = await marketing.listCalendarEntries({
   *   projectSlug: 'my-project',
   *   startDate: new Date('2024-12-01'),
   *   endDate: new Date('2024-12-31'),
   * });
   * ```
   */
  async listCalendarEntries(request: ListCalendarEntriesRequest): Promise<CalendarEntry[]> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
      ...(request.limit && { limit: request.limit.toString() }),
      ...(request.offset && { offset: request.offset.toString() }),
    });

    const response = await this.http.get<CalendarEntry[]>(`/marketing/calendar?${params.toString()}`);
    return response.map((e) => this.convertCalendarEntryDates(e));
  }

  /**
   * Get a single calendar entry by ID
   */
  async getCalendarEntry(entryId: string): Promise<CalendarEntry> {
    const response = await this.http.get<CalendarEntry>(`/marketing/calendar/${entryId}`);
    return this.convertCalendarEntryDates(response);
  }

  /**
   * Update a calendar entry
   *
   * @example
   * ```typescript
   * const updated = await marketing.updateCalendarEntry({
   *   entryId: 'entry-id',
   *   scheduledFor: new Date('2024-12-26T10:00:00Z'),
   * });
   * ```
   */
  async updateCalendarEntry(request: UpdateCalendarEntryRequest): Promise<CalendarEntry> {
    const { entryId, ...data } = request;
    const response = await this.http.patch<CalendarEntry>(`/marketing/calendar/${entryId}`, {
      ...data,
      ...(data.scheduledFor && { scheduledFor: data.scheduledFor.toISOString() }),
    });
    return this.convertCalendarEntryDates(response);
  }

  /**
   * Cancel a scheduled calendar entry
   */
  async cancelCalendarEntry(entryId: string): Promise<CancelCalendarEntryResponse> {
    return this.http.post<CancelCalendarEntryResponse>(`/marketing/calendar/${entryId}/cancel`, {});
  }

  /**
   * Mark content as published
   */
  async markContentPublished(request: MarkPublishedRequest): Promise<CalendarEntry> {
    const response = await this.http.post<CalendarEntry>(`/marketing/calendar/${request.entryId}/published`, {
      ...(request.publishedAt && { publishedAt: request.publishedAt.toISOString() }),
    });
    return this.convertCalendarEntryDates(response);
  }

  // ============================================================================
  // Assets (Asset Jobs)
  // ============================================================================

  /**
   * Create an asset generation job
   *
   * @example
   * ```typescript
   * const job = await marketing.createAssetJob({
   *   projectSlug: 'my-project',
   *   contentId: 'content-id',
   *   jobType: 'slide_generation',
   *   input: { style: 'modern' },
   * });
   * ```
   */
  async createAssetJob(request: CreateAssetJobRequest): Promise<AssetJob> {
    const response = await this.http.post<AssetJob>("/marketing/assets/jobs", request);
    return this.convertAssetJobDates(response);
  }

  /**
   * List asset jobs
   *
   * @example
   * ```typescript
   * const jobs = await marketing.listAssetJobs({
   *   projectSlug: 'my-project',
   *   status: 'processing',
   * });
   * ```
   */
  async listAssetJobs(request: ListAssetJobsRequest): Promise<AssetJob[]> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.contentId && { contentId: request.contentId }),
      ...(request.status && { status: request.status }),
      ...(request.jobType && { jobType: request.jobType }),
      ...(request.limit && { limit: request.limit.toString() }),
      ...(request.offset && { offset: request.offset.toString() }),
    });

    const response = await this.http.get<AssetJob[]>(`/marketing/assets/jobs?${params.toString()}`);
    return response.map((j) => this.convertAssetJobDates(j));
  }

  /**
   * Get an asset job by ID
   */
  async getAssetJob(jobId: string): Promise<AssetJob> {
    const response = await this.http.get<AssetJob>(`/marketing/assets/jobs/${jobId}`);
    return this.convertAssetJobDates(response);
  }

  /**
   * Update asset job status
   */
  async updateAssetJobStatus(request: UpdateAssetJobStatusRequest): Promise<AssetJob> {
    const { jobId, ...data } = request;
    const response = await this.http.patch<AssetJob>(`/marketing/assets/jobs/${jobId}/status`, data);
    return this.convertAssetJobDates(response);
  }

  /**
   * Retry a failed asset job
   */
  async retryAssetJob(jobId: string): Promise<AssetJob> {
    const response = await this.http.post<AssetJob>(`/marketing/assets/jobs/${jobId}/retry`, {});
    return this.convertAssetJobDates(response);
  }

  /**
   * Cancel an asset job
   */
  async cancelAssetJob(jobId: string): Promise<AssetJob> {
    const response = await this.http.post<AssetJob>(`/marketing/assets/jobs/${jobId}/cancel`, {});
    return this.convertAssetJobDates(response);
  }

  // ============================================================================
  // Settings
  // ============================================================================

  /**
   * Get marketing settings for a project
   *
   * @example
   * ```typescript
   * const settings = await marketing.getSettings({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`Brand voice: ${settings.brandVoice}`);
   * ```
   */
  async getSettings(request: GetSettingsRequest): Promise<MarketingSettings> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
    });

    return this.http.get<MarketingSettings>(`/marketing/settings?${params.toString()}`);
  }

  /**
   * Update marketing settings
   *
   * @example
   * ```typescript
   * await marketing.updateSettings({
   *   projectSlug: 'my-project',
   *   brandVoice: 'Professional yet approachable',
   *   monitoredKeywords: ['AI', 'startup', 'tech'],
   * });
   * ```
   */
  async updateSettings(request: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
    return this.http.post<UpdateSettingsResponse>("/marketing/settings", request);
  }

  // ============================================================================
  // Usage
  // ============================================================================

  /**
   * Get current period usage
   *
   * @example
   * ```typescript
   * const usage = await marketing.getCurrentUsage({
   *   projectSlug: 'my-project',
   *   environment: 'production',
   * });
   * console.log(`AI tokens used: ${usage.aiTokensUsed}`);
   * ```
   */
  async getCurrentUsage(request: GetCurrentUsageRequest): Promise<CurrentUsageResponse> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
    });

    const response = await this.http.get<CurrentUsageResponse>(`/marketing/usage/current?${params.toString()}`);
    return this.convertUsageDates(response);
  }

  /**
   * Get usage history
   *
   * @example
   * ```typescript
   * const history = await marketing.getUsageHistory({
   *   projectSlug: 'my-project',
   *   limit: 6, // Last 6 months
   * });
   * ```
   */
  async getUsageHistory(request: GetUsageHistoryRequest): Promise<MarketingUsage[]> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
      ...(request.limit && { limit: request.limit.toString() }),
    });

    const response = await this.http.get<MarketingUsage[]>(`/marketing/usage/history?${params.toString()}`);
    return response.map((u) => this.convertMarketingUsageDates(u));
  }

  /**
   * Get total usage across all periods
   *
   * @example
   * ```typescript
   * const totals = await marketing.getTotalUsage({
   *   projectSlug: 'my-project',
   *   startDate: new Date('2024-01-01'),
   * });
   * console.log(`Total content generated: ${totals.contentGenerated}`);
   * ```
   */
  async getTotalUsage(request: GetTotalUsageRequest): Promise<TotalUsageResponse> {
    const params = new URLSearchParams({
      projectSlug: request.projectSlug,
      ...(request.environment && { environment: request.environment }),
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
    });

    return this.http.get<TotalUsageResponse>(`/marketing/usage/total?${params.toString()}`);
  }

  /**
   * Record usage (typically called internally)
   */
  async recordUsage(request: RecordUsageRequest): Promise<MarketingUsage> {
    const response = await this.http.post<MarketingUsage>("/marketing/usage/record", request);
    return this.convertMarketingUsageDates(response);
  }

  // ============================================================================
  // Date Conversion Helpers
  // ============================================================================

  private convertTrendDates(trend: Trend): Trend {
    if (typeof trend.firstSeenAt === "string") {
      trend.firstSeenAt = new Date(trend.firstSeenAt);
    }
    if (typeof trend.lastUpdatedAt === "string") {
      trend.lastUpdatedAt = new Date(trend.lastUpdatedAt);
    }
    if (trend.expiresAt && typeof trend.expiresAt === "string") {
      trend.expiresAt = new Date(trend.expiresAt);
    }
    if (typeof trend.createdAt === "string") {
      trend.createdAt = new Date(trend.createdAt);
    }
    return trend;
  }

  private convertOpportunityDates(opp: Opportunity): Opportunity {
    if (typeof opp.createdAt === "string") {
      opp.createdAt = new Date(opp.createdAt);
    }
    if (opp.expiresAt && typeof opp.expiresAt === "string") {
      opp.expiresAt = new Date(opp.expiresAt);
    }
    if (opp.usedAt && typeof opp.usedAt === "string") {
      opp.usedAt = new Date(opp.usedAt);
    }
    return opp;
  }

  private convertContentDates(content: Content): Content {
    if (typeof content.createdAt === "string") {
      content.createdAt = new Date(content.createdAt);
    }
    if (content.updatedAt && typeof content.updatedAt === "string") {
      content.updatedAt = new Date(content.updatedAt);
    }
    if (content.reviewedAt && typeof content.reviewedAt === "string") {
      content.reviewedAt = new Date(content.reviewedAt);
    }
    if (content.publishedAt && typeof content.publishedAt === "string") {
      content.publishedAt = new Date(content.publishedAt);
    }
    return content;
  }

  private convertScriptDates(script: Script): Script {
    if (typeof script.createdAt === "string") {
      script.createdAt = new Date(script.createdAt);
    }
    return script;
  }

  private convertCalendarEntryDates(entry: CalendarEntry): CalendarEntry {
    if (typeof entry.scheduledFor === "string") {
      entry.scheduledFor = new Date(entry.scheduledFor);
    }
    if (typeof entry.createdAt === "string") {
      entry.createdAt = new Date(entry.createdAt);
    }
    if (entry.updatedAt && typeof entry.updatedAt === "string") {
      entry.updatedAt = new Date(entry.updatedAt);
    }
    if (entry.publishedAt && typeof entry.publishedAt === "string") {
      entry.publishedAt = new Date(entry.publishedAt);
    }
    return entry;
  }

  private convertAssetJobDates(job: AssetJob): AssetJob {
    if (typeof job.createdAt === "string") {
      job.createdAt = new Date(job.createdAt);
    }
    if (job.startedAt && typeof job.startedAt === "string") {
      job.startedAt = new Date(job.startedAt);
    }
    if (job.completedAt && typeof job.completedAt === "string") {
      job.completedAt = new Date(job.completedAt);
    }
    return job;
  }

  private convertUsageDates(usage: CurrentUsageResponse): CurrentUsageResponse {
    if (typeof usage.periodStart === "string") {
      usage.periodStart = new Date(usage.periodStart);
    }
    if (typeof usage.periodEnd === "string") {
      usage.periodEnd = new Date(usage.periodEnd);
    }
    return usage;
  }

  private convertMarketingUsageDates(usage: MarketingUsage): MarketingUsage {
    if (typeof usage.periodStart === "string") {
      usage.periodStart = new Date(usage.periodStart);
    }
    if (typeof usage.periodEnd === "string") {
      usage.periodEnd = new Date(usage.periodEnd);
    }
    if (typeof usage.createdAt === "string") {
      usage.createdAt = new Date(usage.createdAt);
    }
    if (usage.updatedAt && typeof usage.updatedAt === "string") {
      usage.updatedAt = new Date(usage.updatedAt);
    }
    return usage;
  }
}
