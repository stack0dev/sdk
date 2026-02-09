/**
 * Marketing SDK Types
 */

export type MarketingEnvironment = "sandbox" | "production";
export type ContentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "publishing"
  | "published"
  | "failed"
  | "archived";
export type TrendStatus = "discovered" | "analyzing" | "active" | "declining" | "expired";
export type ContentType = "tiktok_slideshow" | "instagram_reel" | "youtube_short" | "blog_post" | "twitter_thread";
export type ApprovalStatus = "pending" | "approved" | "rejected";

// ============================================================================
// Trends
// ============================================================================

export interface Trend {
  id: string;
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  keyword: string;
  source: string;
  category?: string | null;
  searchVolume?: number | null;
  growthRate?: number | null;
  trendScore: number;
  status: TrendStatus;
  sourceData?: Record<string, unknown> | null;
  firstSeenAt: Date;
  lastUpdatedAt: Date;
  expiresAt?: Date | null;
  createdAt: Date;
}

export interface DiscoverTrendsRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
}

export interface DiscoverTrendsResponse {
  success: boolean;
  trendsDiscovered: number;
  trends: Trend[];
}

export interface ListTrendsRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  status?: TrendStatus;
  limit?: number;
}

export type ListTrendsResponse = Trend[];

// ============================================================================
// Opportunities
// ============================================================================

export interface Opportunity {
  id: string;
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  title: string;
  description?: string | null;
  contentType: ContentType;
  opportunityScore: number;
  estimatedViews?: number | null;
  confidenceLevel?: number | null;
  trendIds?: string[] | null;
  reasoning?: string | null;
  suggestedAngle?: string | null;
  targetAudience?: string | null;
  contentId?: string | null;
  status: string;
  usedAt?: Date | null;
  createdAt: Date;
  expiresAt?: Date | null;
}

export interface GenerateOpportunitiesRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
}

export interface GenerateOpportunitiesResponse {
  success: boolean;
  opportunitiesGenerated: number;
  opportunities: Opportunity[];
}

export interface ListOpportunitiesRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  status?: string;
  limit?: number;
}

export type ListOpportunitiesResponse = Opportunity[];

export interface DismissOpportunityRequest {
  opportunityId: string;
}

// ============================================================================
// Content
// ============================================================================

export interface Content {
  id: string;
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  contentType: ContentType;
  title: string;
  description?: string | null;
  opportunityId?: string | null;
  scriptId?: string | null;
  assetUrls?: {
    slides?: string[];
    video?: string;
    thumbnail?: string;
    captions?: string;
  } | null;
  duration?: number | null;
  slideCount?: number | null;
  fileSize?: number | null;
  platformData?: Record<string, unknown> | null;
  status: ContentStatus;
  approvalStatus: ApprovalStatus;
  reviewedByUserId?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  publishedAt?: Date | null;
  publishedUrl?: string | null;
  views?: number | null;
  likes?: number | null;
  shares?: number | null;
  comments?: number | null;
  creditsUsed?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface CreateContentRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  contentType: ContentType;
  title: string;
  description?: string;
  opportunityId?: string;
  scriptId?: string;
}

export interface ListContentRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  status?: ContentStatus;
  contentType?: ContentType;
  approvalStatus?: ApprovalStatus;
  limit?: number;
  offset?: number;
}

export type ListContentResponse = Content[];

export interface UpdateContentRequest {
  contentId: string;
  title?: string;
  description?: string;
  status?: ContentStatus;
  assetUrls?: {
    slides?: string[];
    video?: string;
    thumbnail?: string;
    captions?: string;
  };
  platformData?: Record<string, unknown>;
  publishedUrl?: string;
}

export interface ApproveContentRequest {
  contentId: string;
  reviewNotes?: string;
}

export interface RejectContentRequest {
  contentId: string;
  reviewNotes: string;
}

// ============================================================================
// Scripts
// ============================================================================

export interface ScriptSlide {
  order: number;
  text: string;
  voiceoverText: string;
  duration: number;
  visualStyle?: string;
}

export interface Script {
  id: string;
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  contentId?: string | null;
  hook: string;
  slides: ScriptSlide[];
  cta: string;
  prompt?: string | null;
  model?: string | null;
  tokensUsed?: number | null;
  generationTimeMs?: number | null;
  version: number;
  previousVersionId?: string | null;
  createdAt: Date;
}

export interface CreateScriptRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  contentId?: string;
  hook: string;
  slides: ScriptSlide[];
  cta: string;
  prompt?: string;
  model?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
}

export interface ListScriptsRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  contentId?: string;
  limit?: number;
}

export type ListScriptsResponse = Script[];

// ============================================================================
// Analytics
// ============================================================================

export interface AnalyticsOverviewRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  startDate?: Date;
  endDate?: Date;
}

export interface AnalyticsOverviewResponse {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  contentByType: Array<{
    contentType: ContentType;
    count: number;
  }>;
  contentByStatus: Array<{
    status: ContentStatus;
    count: number;
  }>;
}

export interface ContentPerformanceRequest {
  projectSlug: string;
  environment: MarketingEnvironment;
  contentType?: ContentType;
  limit?: number;
}

export interface ContentPerformanceItem {
  id: string;
  title: string;
  contentType: ContentType;
  views: number | null;
  likes: number | null;
  shares: number | null;
  comments: number | null;
  publishedAt: Date | null;
  engagementRate: number;
}

export type ContentPerformanceResponse = ContentPerformanceItem[];

// ============================================================================
// Trends - Additional Types
// ============================================================================

export interface UpdateTrendStatusRequest {
  trendId: string;
  status: TrendStatus;
}

export interface UpdateTrendStatusResponse {
  success: boolean;
}

// ============================================================================
// Scripts - Additional Types
// ============================================================================

export interface UpdateScriptRequest {
  scriptId: string;
  hook?: string;
  slides?: ScriptSlide[];
  cta?: string;
}

export interface CreateScriptVersionRequest {
  scriptId: string;
  hook: string;
  slides: ScriptSlide[];
  cta: string;
  prompt?: string;
  model?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
}

export interface DeleteScriptResponse {
  success: boolean;
}

// ============================================================================
// Calendar
// ============================================================================

export interface CalendarEntry {
  id: string;
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  contentId: string;
  scheduledFor: Date;
  timezone: string;
  autoPublish: boolean;
  notifyUser: boolean;
  publishAttempted: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ScheduleContentRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  contentId: string;
  scheduledFor: Date;
  timezone?: string;
  autoPublish?: boolean;
  notifyUser?: boolean;
}

export interface ListCalendarEntriesRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export type ListCalendarEntriesResponse = CalendarEntry[];

export interface UpdateCalendarEntryRequest {
  entryId: string;
  scheduledFor?: Date;
  timezone?: string;
  autoPublish?: boolean;
  notifyUser?: boolean;
}

export interface CancelCalendarEntryResponse {
  success: boolean;
}

export interface MarkPublishedRequest {
  entryId: string;
  publishedAt?: Date;
}

// ============================================================================
// Assets (Asset Jobs)
// ============================================================================

export type AssetJobStatus = "pending" | "processing" | "completed" | "failed";
export type AssetJobType = "slide_generation" | "video_assembly";

export interface AssetJob {
  id: string;
  organizationId: string;
  projectId: string;
  contentId: string;
  jobType: AssetJobType;
  status: AssetJobStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface CreateAssetJobRequest {
  projectSlug: string;
  contentId: string;
  jobType: AssetJobType;
  input?: Record<string, unknown>;
}

export interface ListAssetJobsRequest {
  projectSlug: string;
  contentId?: string;
  status?: AssetJobStatus;
  jobType?: AssetJobType;
  limit?: number;
  offset?: number;
}

export type ListAssetJobsResponse = AssetJob[];

export interface UpdateAssetJobStatusRequest {
  jobId: string;
  status: AssetJobStatus;
  output?: Record<string, unknown>;
  error?: string;
}

export interface RetryAssetJobResponse {
  success: boolean;
}

export interface CancelAssetJobResponse {
  success: boolean;
}

// ============================================================================
// Settings
// ============================================================================

export interface MarketingSettings {
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  targetAudience: string | null;
  brandVoice: string | null;
  contentThemes: string[];
  avoidTopics: string[];
  preferredPlatforms: string[];
  preferredPostTimes: Record<string, unknown> | null;
  notifyOnNewOpportunities: boolean;
  notifyOnContentReady: boolean;
  notificationEmail: string | null;
  notificationSlackWebhook: string | null;
  monitoredKeywords: string[];
  monitoredSubreddits: string[];
  customInstructions: string | null;
}

export interface GetSettingsRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
}

export interface UpdateSettingsRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  targetAudience?: string;
  brandVoice?: string;
  contentThemes?: string[];
  avoidTopics?: string[];
  preferredPlatforms?: string[];
  monitoredKeywords?: string[];
  monitoredSubreddits?: string[];
  customInstructions?: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  created: boolean;
}

// ============================================================================
// Usage
// ============================================================================

export interface MarketingUsage {
  id: string;
  organizationId: string;
  projectId: string;
  environment: MarketingEnvironment;
  periodStart: Date;
  periodEnd: Date;
  contentGenerated: number;
  tiktokVideosGenerated: number;
  aiScriptsGenerated: number;
  aiTokensUsed: number;
  slidesGenerated: number;
  videosAssembled: number;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface GetCurrentUsageRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
}

export interface CurrentUsageResponse {
  periodStart: Date;
  periodEnd: Date;
  contentGenerated: number;
  tiktokVideosGenerated: number;
  aiScriptsGenerated: number;
  aiTokensUsed: number;
  slidesGenerated: number;
  videosAssembled: number;
  creditsUsed: number;
}

export interface GetUsageHistoryRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export type UsageHistoryResponse = MarketingUsage[];

export interface GetTotalUsageRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  startDate?: Date;
  endDate?: Date;
}

export interface TotalUsageResponse {
  contentGenerated: number;
  tiktokVideosGenerated: number;
  aiScriptsGenerated: number;
  aiTokensUsed: number;
  slidesGenerated: number;
  videosAssembled: number;
  creditsUsed: number;
}

export interface RecordUsageRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  contentGenerated?: number;
  tiktokVideosGenerated?: number;
  aiScriptsGenerated?: number;
  aiTokensUsed?: number;
  slidesGenerated?: number;
  videosAssembled?: number;
  creditsUsed?: number;
}

// ============================================================================
// Analytics - Additional Types
// ============================================================================

export interface TrendAnalyticsRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  startDate?: Date;
  endDate?: Date;
}

export interface TrendAnalyticsResponse {
  totalTrends: number;
  trendsByStatus: Array<{
    status: TrendStatus;
    count: number;
  }>;
  trendsBySource: Array<{
    source: string;
    count: number;
  }>;
}

export interface OpportunityConversionRequest {
  projectSlug: string;
  environment?: MarketingEnvironment;
  startDate?: Date;
  endDate?: Date;
}

export interface OpportunityConversionResponse {
  totalOpportunities: number;
  generatedContent: number;
  conversionRate: number;
  opportunitiesByStatus: Array<{
    status: string;
    count: number;
  }>;
}
