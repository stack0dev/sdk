/**
 * Type definitions for Stack0 CDN API
 */

export type AssetStatus = "pending" | "processing" | "ready" | "failed" | "deleted";
export type AssetType = "image" | "video" | "audio" | "document" | "other";

export interface Asset {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  type: AssetType;
  s3Key: string;
  cdnUrl: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  status: AssetStatus;
  folder: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  alt: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface UploadUrlRequest {
  projectSlug: string;
  filename: string;
  mimeType: string;
  size: number;
  folder?: string;
  metadata?: Record<string, unknown>;
  /**
   * Watermark configuration for images.
   * When provided, the watermark will be automatically applied during upload processing.
   */
  watermark?: ImageWatermarkConfig;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
  cdnUrl: string;
  expiresAt: Date;
}

export interface ConfirmUploadRequest {
  assetId: string;
}

export interface ConfirmUploadResponse {
  asset: Asset;
}

export interface GetAssetRequest {
  id: string;
}

export interface UpdateAssetRequest {
  id: string;
  filename?: string;
  folder?: string;
  tags?: string[];
  alt?: string;
  metadata?: Record<string, unknown>;
}

export interface DeleteAssetRequest {
  id: string;
}

export interface DeleteAssetsRequest {
  ids: string[];
}

export interface DeleteAssetsResponse {
  success: boolean;
  deletedCount: number;
}

export interface ListAssetsRequest {
  projectSlug: string;
  folder?: string | null;
  type?: AssetType;
  status?: AssetStatus;
  search?: string;
  tags?: string[];
  sortBy?: "createdAt" | "filename" | "size" | "type";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ListAssetsResponse {
  assets: Asset[];
  total: number;
  hasMore: boolean;
}

export interface MoveAssetsRequest {
  assetIds: string[];
  folder: string | null;
}

export interface MoveAssetsResponse {
  success: boolean;
  movedCount: number;
}

export interface TransformOptions {
  /** Output width (snapped to nearest allowed width for caching) */
  width?: number;
  /** Output height */
  height?: number;
  /** Resize fit mode */
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  /** Output format */
  format?: "webp" | "jpeg" | "png" | "avif" | "auto";
  /** Quality 1-100 */
  quality?: number;
  /** Smart crop position */
  crop?: "attention" | "entropy" | "center" | "top" | "bottom" | "left" | "right";
  /** Manual crop X offset */
  cropX?: number;
  /** Manual crop Y offset */
  cropY?: number;
  /** Manual crop width */
  cropWidth?: number;
  /** Manual crop height */
  cropHeight?: number;
  /** Blur sigma (0.3-100) */
  blur?: number;
  /** Sharpen sigma */
  sharpen?: number;
  /** Brightness adjustment (-100 to 100) */
  brightness?: number;
  /** Saturation adjustment (-100 to 100) */
  saturation?: number;
  /** Convert to grayscale */
  grayscale?: boolean;
  /** Rotation angle (0, 90, 180, 270) */
  rotate?: number;
  /** Flip vertically */
  flip?: boolean;
  /** Flop horizontally */
  flop?: boolean;
}

export interface FolderTreeNode {
  id: string;
  name: string;
  path: string;
  assetCount: number;
  children: FolderTreeNode[];
}

export interface GetFolderTreeRequest {
  projectSlug: string;
  maxDepth?: number;
}

export interface CreateFolderRequest {
  projectSlug: string;
  name: string;
  parentId?: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  assetCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date | null;
}

// ============================================================================
// Video Transcoding Types
// ============================================================================

export type VideoQuality = "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p";
export type VideoCodec = "h264" | "h265";
export type VideoOutputFormat = "hls" | "mp4";
export type TranscodingStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface VideoVariant {
  quality: VideoQuality;
  codec?: VideoCodec;
  bitrate?: number;
}

export interface WatermarkOptions {
  type: "image" | "text";
  imageAssetId?: string;
  text?: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  opacity?: number;
}

// ============================================================================
// Image Watermark Types
// ============================================================================

/** Position options for image watermarks */
export type ImageWatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** Sizing mode for image watermarks */
export type ImageWatermarkSizingMode = "absolute" | "relative";

/**
 * Configuration for applying a watermark to an uploaded image.
 * Watermarks are applied automatically during the upload processing.
 */
export interface ImageWatermarkConfig {
  /**
   * Source of the watermark image.
   * Provide either assetId (another CDN asset) or url (direct URL).
   */
  assetId?: string;
  /** Direct URL to watermark image (alternative to assetId) */
  url?: string;
  /** Position of the watermark on the image (default: "bottom-right") */
  position?: ImageWatermarkPosition;
  /** Horizontal offset from position in pixels (default: 0) */
  offsetX?: number;
  /** Vertical offset from position in pixels (default: 0) */
  offsetY?: number;
  /**
   * Sizing mode for the watermark.
   * - "absolute": Use exact width/height in pixels
   * - "relative": Width/height as percentage of the main image (1-100)
   */
  sizingMode?: ImageWatermarkSizingMode;
  /** Width of the watermark (pixels or percentage based on sizingMode) */
  width?: number;
  /** Height of the watermark (pixels or percentage based on sizingMode) */
  height?: number;
  /** Opacity of the watermark (0-100, default: 100) */
  opacity?: number;
  /** Rotation angle in degrees (-360 to 360, default: 0) */
  rotation?: number;
  /** Whether to tile/repeat the watermark across the image (default: false) */
  tile?: boolean;
  /** Spacing between tiles when tile is true (pixels, default: 100) */
  tileSpacing?: number;
  /** Corner radius in pixels (0-500, default: 0) */
  borderRadius?: number;
}

export interface TrimOptions {
  start: number;
  end: number;
}

export interface TranscodeVideoRequest {
  projectSlug: string;
  assetId: string;
  outputFormat: VideoOutputFormat;
  variants: VideoVariant[];
  watermark?: WatermarkOptions;
  trim?: TrimOptions;
  webhookUrl?: string;
}

export interface TranscodeJob {
  id: string;
  assetId: string;
  status: TranscodingStatus;
  outputFormat: VideoOutputFormat;
  variants: VideoVariant[];
  progress: number | null;
  error: string | null;
  mediaConvertJobId: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface ListJobsRequest {
  projectSlug: string;
  assetId?: string;
  status?: TranscodingStatus;
  limit?: number;
  offset?: number;
}

export interface ListJobsResponse {
  jobs: TranscodeJob[];
  total: number;
  hasMore: boolean;
}

export interface StreamingUrls {
  hlsUrl: string | null;
  mp4Urls: Array<{
    quality: VideoQuality;
    url: string;
  }>;
  thumbnails: Array<{
    url: string;
    timestamp: number;
    width: number;
    height: number;
  }>;
}

export interface ThumbnailRequest {
  assetId: string;
  timestamp: number;
  width?: number;
  format?: "jpg" | "png" | "webp";
}

export interface ThumbnailResponse {
  url: string;
  timestamp: number;
  width: number;
  height: number;
}

export interface RegenerateThumbnailRequest {
  assetId: string;
  timestamp: number;
  width?: number;
  format?: "jpg" | "png" | "webp";
}

export interface RegenerateThumbnailResponse {
  id: string | null;
  assetId: string;
  timestamp: number;
  url: string | null;
  width: number | null;
  height: number | null;
  format: string;
  status?: string;
}

export interface ExtractAudioRequest {
  projectSlug: string;
  assetId: string;
  format: "mp3" | "aac" | "wav";
  bitrate?: number;
}

export interface ExtractAudioResponse {
  jobId: string;
  status: TranscodingStatus;
}

// ============================================================================
// GIF Generation Types
// ============================================================================

export type GifStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerateGifRequest {
  /** Project slug */
  projectSlug: string;
  /** ID of the video asset to generate GIF from */
  assetId: string;
  /** Start time in seconds (default: 0) */
  startTime?: number;
  /** Duration in seconds (0.5-30, default: 5) */
  duration?: number;
  /** Output width in pixels (100-800, default: 480) */
  width?: number;
  /** Frames per second (5-30, default: 10) */
  fps?: number;
  /** Use two-pass palette optimization for smaller file size (default: true) */
  optimizePalette?: boolean;
}

export interface VideoGif {
  id: string;
  assetId: string;
  /** Start time in seconds */
  startTime: number;
  /** Duration in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** CDN URL of the generated GIF (null if pending/processing) */
  url: string | null;
  /** Width in pixels */
  width: number | null;
  /** Height in pixels */
  height: number | null;
  /** File size in bytes */
  sizeBytes: number | null;
  /** Number of frames in the GIF */
  frameCount: number | null;
  /** Current status of the GIF generation */
  status: GifStatus;
  /** Error message if failed */
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface ListGifsRequest {
  assetId: string;
}

// ============================================================================
// Private Files Types
// ============================================================================

export type PrivateFileStatus = "pending" | "ready" | "failed" | "deleted";

export interface PrivateFile {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  s3Key: string;
  folder: string | null;
  description: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  status: PrivateFileStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface PrivateUploadUrlRequest {
  projectSlug: string;
  filename: string;
  mimeType: string;
  size: number;
  folder?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PrivateUploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  expiresAt: Date;
}

export interface PrivateDownloadUrlRequest {
  fileId: string;
  /** Expiration time in seconds (default: 3600, min: 3600, max: 604800) */
  expiresIn?: number;
}

export interface PrivateDownloadUrlResponse {
  downloadUrl: string;
  expiresAt: Date;
}

export interface ListPrivateFilesRequest {
  projectSlug: string;
  folder?: string | null;
  status?: PrivateFileStatus;
  search?: string;
  sortBy?: "createdAt" | "filename" | "size";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ListPrivateFilesResponse {
  files: PrivateFile[];
  total: number;
  hasMore: boolean;
}

export interface UpdatePrivateFileRequest {
  fileId: string;
  description?: string;
  folder?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Download Bundle Types
// ============================================================================

export type BundleStatus = "pending" | "processing" | "ready" | "failed" | "expired";

export interface DownloadBundle {
  id: string;
  name: string;
  description: string | null;
  assetIds: string[] | null;
  privateFileIds: string[] | null;
  s3Key: string | null;
  size: number | null;
  fileCount: number | null;
  status: BundleStatus;
  error: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface CreateBundleRequest {
  projectSlug: string;
  name: string;
  description?: string;
  assetIds?: string[];
  privateFileIds?: string[];
  /** Expiration time in seconds (default: 86400, min: 3600, max: 604800) */
  expiresIn?: number;
}

export interface CreateBundleResponse {
  bundle: DownloadBundle;
}

export interface ListBundlesRequest {
  projectSlug: string;
  status?: BundleStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListBundlesResponse {
  bundles: DownloadBundle[];
  total: number;
  hasMore: boolean;
}

export interface BundleDownloadUrlRequest {
  bundleId: string;
  /** Expiration time in seconds (default: 3600, min: 3600, max: 604800) */
  expiresIn?: number;
}

export interface BundleDownloadUrlResponse {
  downloadUrl: string;
  expiresAt: Date;
}

// ============================================================================
// Usage Types
// ============================================================================

export type CdnEnvironment = "sandbox" | "production";

export interface CdnUsageRequest {
  projectSlug?: string;
  environment?: CdnEnvironment;
  periodStart?: Date | string;
  periodEnd?: Date | string;
}

export interface CdnUsageResponse {
  periodStart: Date;
  periodEnd: Date;
  requests: number;
  bandwidthBytes: number;
  bandwidthFormatted: string;
  transformations: number;
  storageBytes: number;
  storageFormatted: string;
  estimatedCostCents: number;
  estimatedCostFormatted: string;
}

export interface CdnUsageHistoryRequest {
  projectSlug?: string;
  environment?: CdnEnvironment;
  days?: number;
  granularity?: "hour" | "day" | "week" | "month";
}

export interface CdnUsageDataPoint {
  timestamp: Date;
  requests: number;
  bandwidthBytes: number;
  transformations: number;
}

export interface CdnUsageHistoryResponse {
  data: CdnUsageDataPoint[];
  totals: {
    requests: number;
    bandwidthBytes: number;
    transformations: number;
  };
}

export interface CdnStorageBreakdownRequest {
  projectSlug?: string;
  environment?: CdnEnvironment;
  groupBy?: "type" | "folder";
}

export interface CdnStorageBreakdownItem {
  key: string;
  count: number;
  sizeBytes: number;
  sizeFormatted: string;
  percentage: number;
}

export interface CdnStorageBreakdownResponse {
  items: CdnStorageBreakdownItem[];
  total: {
    count: number;
    sizeBytes: number;
    sizeFormatted: string;
  };
}

// ============================================================================
// Additional Folder Types
// ============================================================================

export interface GetFolderRequest {
  id: string;
}

export interface GetFolderByPathRequest {
  path: string;
}

export interface UpdateFolderRequest {
  id: string;
  name?: string;
}

export interface ListFoldersRequest {
  parentId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FolderListItem {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  assetCount: number;
  totalSize: number;
  createdAt: Date;
}

export interface ListFoldersResponse {
  folders: FolderListItem[];
  total: number;
  hasMore: boolean;
}

export interface MoveFolderRequest {
  id: string;
  newParentId: string | null;
}

export interface MoveFolderResponse {
  success: boolean;
}

// ============================================================================
// Additional Video Types
// ============================================================================

export interface VideoThumbnail {
  id: string;
  assetId: string;
  timestamp: number;
  url: string;
  width: number | null;
  height: number | null;
  format: string;
}

export interface ListThumbnailsRequest {
  assetId: string;
}

export interface ListThumbnailsResponse {
  thumbnails: VideoThumbnail[];
}

// ============================================================================
// Additional Private Files Types
// ============================================================================

export interface MovePrivateFilesRequest {
  fileIds: string[];
  folder: string | null;
}

export interface MovePrivateFilesResponse {
  success: boolean;
  movedCount: number;
}

// ============================================================================
// Video Merge Types
// ============================================================================

export type MergeStatus = TranscodingStatus;
export type MergeQuality = VideoQuality;
export type MergeOutputFormat = "mp4" | "webm";

/**
 * Text overlay shadow configuration
 */
export interface TextOverlayShadow {
  /** Shadow color in hex format (e.g., "#000000") */
  color?: string;
  /** Horizontal shadow offset in pixels (0-20) */
  offsetX?: number;
  /** Vertical shadow offset in pixels (0-20) */
  offsetY?: number;
}

/**
 * Text overlay stroke/outline configuration
 */
export interface TextOverlayStroke {
  /** Stroke color in hex format (e.g., "#000000") */
  color?: string;
  /** Stroke width in pixels (1-10) */
  width?: number;
}

/**
 * Text overlay configuration for adding captions to videos/images.
 * Perfect for creating TikTok/Instagram style videos with text overlays.
 */
export interface TextOverlay {
  /** The text to display (1-500 characters) */
  text: string;
  /** Vertical position of the text (default: "bottom") */
  position?: "top" | "center" | "bottom";
  /** Font size in pixels (12-200, default: 48) */
  fontSize?: number;
  /** Font family (default: "Liberation Sans") */
  fontFamily?: string;
  /** Font weight (default: "bold") */
  fontWeight?: "normal" | "bold";
  /** Text color in hex format (default: "#FFFFFF") */
  color?: string;
  /** Background color (e.g., "rgba(0,0,0,0.5)") */
  backgroundColor?: string;
  /** Padding from edges in pixels (0-100, default: 20) */
  padding?: number;
  /** Maximum width as percentage of video width (10-100, default: 90) */
  maxWidth?: number;
  /** Shadow configuration for depth effect */
  shadow?: TextOverlayShadow;
  /** Stroke/outline configuration for better visibility */
  stroke?: TextOverlayStroke;
}

/**
 * A single input item for the merge operation.
 * Can be a video, image, or audio file.
 */
export interface MergeInputItem {
  /** Asset ID of the file to include */
  assetId: string;
  /** Duration in seconds (required for images, optional for videos) */
  duration?: number;
  /** Start time in seconds for trimming (videos only) */
  startTime?: number;
  /** End time in seconds for trimming (videos only) */
  endTime?: number;
  /** Text overlay/caption configuration */
  textOverlay?: TextOverlay;
}

/**
 * Audio track overlay configuration for merge jobs.
 * Allows adding background audio to the merged video.
 */
export interface AudioTrackInput {
  /** Asset ID of the audio file */
  assetId: string;
  /** Loop audio if shorter than video (default: false) */
  loop?: boolean;
  /** Fade in duration in seconds (0-10) */
  fadeIn?: number;
  /** Fade out duration in seconds (0-10) */
  fadeOut?: number;
}

/**
 * Output configuration for merge jobs
 */
export interface MergeOutputConfig {
  /** Output format (default: mp4) */
  format?: MergeOutputFormat;
  /** Output quality (default: 720p) */
  quality?: MergeQuality;
  /** Custom filename for the output */
  filename?: string;
}

/**
 * Request to create a merge job
 */
export interface CreateMergeJobRequest {
  /** Project slug to create the merge job in */
  projectSlug: string;
  /** Array of assets to merge (in order), 1-100 items */
  inputs: MergeInputItem[];
  /** Optional audio track to overlay */
  audioTrack?: AudioTrackInput;
  /** Output configuration */
  output?: MergeOutputConfig;
  /** Webhook URL for completion notification */
  webhookUrl?: string;
}

/**
 * Request to get a merge job by ID
 */
export interface GetMergeJobRequest {
  /** Merge job ID (UUID) */
  jobId: string;
}

/**
 * Request to list merge jobs
 */
export interface ListMergeJobsRequest {
  /** Project slug to list jobs for */
  projectSlug: string;
  /** Filter by status */
  status?: MergeStatus;
  /** Maximum number of results (default: 20, max: 100) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Request to cancel a merge job
 */
export interface CancelMergeJobRequest {
  /** Merge job ID (UUID) */
  jobId: string;
}

/**
 * Merge job response
 */
export interface MergeJob {
  id: string;
  organizationId: string;
  projectId: string;
  environment: "sandbox" | "production";
  inputs: MergeInputItem[];
  audioTrackAssetId: string | null;
  outputFormat: MergeOutputFormat;
  outputQuality: MergeQuality;
  outputFilename: string | null;
  outputAssetId: string | null;
  status: MergeStatus;
  progress: number | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  totalDurationSeconds: number | null;
  webhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Merge job with output asset details
 */
export interface MergeJobWithOutput extends MergeJob {
  outputAsset: {
    id: string;
    cdnUrl: string;
    directUrl: string;
    filename: string;
    size: number;
    duration: number | null;
  } | null;
}

/**
 * List merge jobs response
 */
export interface ListMergeJobsResponse {
  jobs: MergeJob[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// S3 Import Types
// ============================================================================

export type ImportJobStatus = "pending" | "validating" | "importing" | "completed" | "failed" | "cancelled";
export type ImportAuthType = "iam_credentials" | "role_assumption";
export type ImportPathMode = "preserve" | "flatten";
export type ImportFileStatus = "pending" | "importing" | "completed" | "failed" | "skipped";

/**
 * Error recorded during import
 */
export interface ImportError {
  key: string;
  error: string;
  timestamp: string;
}

/**
 * Request to create an S3 import job
 */
export interface CreateImportRequest {
  projectSlug: string;
  environment?: CdnEnvironment;
  /** Source S3 bucket name */
  sourceBucket: string;
  /** AWS region of the source bucket */
  sourceRegion: string;
  /** Optional prefix to filter source files */
  sourcePrefix?: string;
  /** Authentication method */
  authType: ImportAuthType;
  /** AWS access key ID (required for iam_credentials auth) */
  accessKeyId?: string;
  /** AWS secret access key (required for iam_credentials auth) */
  secretAccessKey?: string;
  /** IAM role ARN (required for role_assumption auth) */
  roleArn?: string;
  /** External ID for role assumption */
  externalId?: string;
  /** How to handle source paths (flatten: use filename only, preserve: keep path structure) */
  pathMode?: ImportPathMode;
  /** Target folder for imported assets */
  targetFolder?: string;
  /** Email address for completion notification */
  notifyEmail?: string;
}

/**
 * Response from creating an import job
 */
export interface CreateImportResponse {
  importId: string;
  status: ImportJobStatus;
  sourceBucket: string;
  sourceRegion: string;
  sourcePrefix: string | null;
  createdAt: Date;
}

/**
 * Import job details
 */
export interface ImportJob {
  id: string;
  organizationId: string;
  projectId: string;
  environment: CdnEnvironment;
  sourceBucket: string;
  sourceRegion: string;
  sourcePrefix: string | null;
  authType: ImportAuthType;
  pathMode: ImportPathMode;
  targetFolder: string | null;
  status: ImportJobStatus;
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  totalBytes: number;
  processedBytes: number;
  errors: ImportError[] | null;
  notifyEmail: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Request to list import jobs
 */
export interface ListImportsRequest {
  projectSlug: string;
  environment?: CdnEnvironment;
  status?: ImportJobStatus;
  sortBy?: "createdAt" | "status" | "totalFiles";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Import job summary for list responses
 */
export interface ImportJobSummary {
  id: string;
  sourceBucket: string;
  sourceRegion: string;
  sourcePrefix: string | null;
  status: ImportJobStatus;
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  totalBytes: number;
  processedBytes: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

/**
 * Response from listing import jobs
 */
export interface ListImportsResponse {
  imports: ImportJobSummary[];
  total: number;
  hasMore: boolean;
}

/**
 * Response from cancelling an import job
 */
export interface CancelImportResponse {
  success: boolean;
  status: ImportJobStatus;
}

/**
 * Response from retrying failed files
 */
export interface RetryImportResponse {
  success: boolean;
  retriedCount: number;
  status: ImportJobStatus;
}

/**
 * Request to list files in an import job
 */
export interface ListImportFilesRequest {
  importId: string;
  status?: ImportFileStatus;
  sortBy?: "createdAt" | "sourceKey" | "sourceSize" | "status";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Individual file within an import job
 */
export interface ImportFile {
  id: string;
  importJobId: string;
  sourceKey: string;
  sourceSize: number;
  sourceMimeType: string | null;
  sourceEtag: string | null;
  assetId: string | null;
  status: ImportFileStatus;
  errorMessage: string | null;
  retryCount: number;
  lastAttemptAt: Date | null;
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Response from listing import files
 */
export interface ListImportFilesResponse {
  files: ImportFile[];
  total: number;
  hasMore: boolean;
}
