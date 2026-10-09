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
  /**
   * Where an image's content sits inside the margin it was captured with (an
   * app window inside page background, a card inside its padding), in
   * fractions of the image. Crop a screenshot to it in a video spec so the
   * corners and shadow drawn around it are the content's own edges. Null for
   * other types and for images uploaded before it was measured.
   */
  contentBox?: { x: number; y: number; width: number; height: number } | null;
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

export interface UploadFromUrlRequest {
  projectSlug: string;
  /** URL to fetch the file from */
  sourceUrl: string;
  filename: string;
  mimeType: string;
  folder?: string;
  metadata?: Record<string, unknown>;
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
  /**
   * Bytes actually written to storage for this rendition, measured after the job completes.
   * For HLS this covers the variant playlist and its segments; for MP4, the single file.
   *
   * Response-only — ignored if you set it on a transcode request.
   *
   * Undefined means not measured (job still running, job predates measurement, or the
   * measurement failed), never zero. `bitrate * duration` is an estimate; this is not.
   */
  sizeBytes?: number;
}

/**
 * Watermark burned into a video during transcode.
 *
 * Image watermarks mirror the image-upload controls. Image and text watermarks share
 * placement, opacity, rotation, and tiling. The original asset stays clean and every
 * transcoded rendition is watermarked.
 */
interface BaseVideoWatermarkOptions {
  /** Placement on the frame (default: "bottom-right"). */
  position?: ImageWatermarkPosition;
  /** Horizontal inset from the anchored edge in pixels (default: 20). */
  offsetX?: number;
  /** Vertical inset from the anchored edge in pixels (default: 20). */
  offsetY?: number;
  /** Opacity 0-100 (default: 80). */
  opacity?: number;
  /** Repeat the watermark across the whole frame (default: false). */
  tile?: boolean;
  /** Horizontal spacing between tiles in pixels (default: 100). */
  tileSpacingX?: number;
  /** Vertical spacing between tiles in pixels (default: 100). */
  tileSpacingY?: number;
  /** Rotation in degrees, -360 to 360 (default: 0). */
  rotation?: number;
}

export interface ImageVideoWatermarkOptions extends BaseVideoWatermarkOptions {
  /** Omit for backward compatibility; image is the default watermark type. */
  type?: "image";
  /** Logo source: another CDN asset. Provide `assetId` or `url`. */
  assetId?: string;
  /** Logo source: a direct URL (alternative to `assetId`). */
  url?: string;
  /** "relative" sizes by a percentage of the video width; "absolute" uses width/height (default: "relative"). */
  sizingMode?: ImageWatermarkSizingMode;
  /** Absolute width in pixels (used when `sizingMode` is "absolute"). */
  width?: number;
  /** Absolute height in pixels (used when `sizingMode` is "absolute"). */
  height?: number;
  /** Relative size as a percentage of the video width (used when `sizingMode` is "relative"; default: 15). */
  scale?: number;
  /** Corner radius in pixels clipping the logo, 0-500 (default: 0). */
  borderRadius?: number;
}

export interface TextVideoWatermarkOptions extends BaseVideoWatermarkOptions {
  type: "text";
  /** Text to render. */
  text: string;
  /** Font family (default: "Liberation Sans"). */
  fontFamily?: string;
  /** Font size in pixels (default: 48). */
  fontSize?: number;
  /** Text color as `#RRGGBB` (default: "#FFFFFF"). */
  fontColor?: string;
}

export type WatermarkOptions = ImageVideoWatermarkOptions | TextVideoWatermarkOptions;

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
  /** Provider or preprocessing failure details when status is `failed`. */
  errorMessage: string | null;
  mediaConvertJobId: string | null;
  /**
   * Every byte this job wrote: renditions, HLS segments, and manifests together, since
   * storage is billed per object rather than for the media alone.
   *
   * Null until the job completes, and null if the measurement failed. Not zero.
   */
  totalOutputBytes: number | null;
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
  id: string | null;
  assetId: string;
  timestamp: number;
  /** CDN URL of the frame; null while status is "pending" */
  url: string | null;
  width: number | null;
  height: number | null;
  format: string;
  /** "ready" when the frame exists; "pending" while generation is queued/in flight */
  status: "ready" | "pending";
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
  /**
   * Virtual folder path to scope the stats to, e.g. "/customers/acme". Covers the folder
   * itself and everything nested under it — the same scoping as `getStorageUsage`. Use
   * this to meter bandwidth per tenant when each tenant uploads under its own folder.
   * Folder-scoped stats only cover assets that still exist; deleting an asset removes
   * its serving history, so a period total can shrink.
   */
  folder?: string;
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
  /**
   * Echoes the folder the stats cover, null when the whole project or org was counted.
   * When metering a tenant, check this echo — a server that predates folder scoping
   * ignores the parameter and silently returns org-wide numbers.
   */
  folder: string | null;
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

export interface CdnStorageUsageRequest {
  projectSlug?: string;
  environment?: CdnEnvironment;
  /**
   * Virtual folder path to scope the total to, e.g. "/customers/acme". The folder itself and
   * everything nested under it are counted. Omit to total the whole project or organization.
   */
  folder?: string;
}

export interface CdnStorageUsageBucket {
  bytes: number;
  bytesFormatted: string;
  objectCount: number;
}

export interface CdnStorageUsageResponse {
  /** Uploads plus every measured derived object stored under the scope. */
  totalBytes: number;
  totalFormatted: string;
  /** Objects behind that total. Storage is billed per object, so segments and manifests count. */
  objectCount: number;
  /** Split by asset type; a video's renditions count as video. */
  byType: Record<string, CdnStorageUsageBucket>;
  breakdown: {
    /** The uploaded files themselves. */
    originals: CdnStorageUsageBucket;
    /** Renditions, HLS segments and manifests, thumbnails, GIFs. */
    derived: CdnStorageUsageBucket;
  };
  /**
   * Assets known to have derivatives whose bytes have not been measured yet. Their storage is
   * missing from `totalBytes`, so a nonzero count means the total is a floor, not the answer.
   */
  unmeasuredAssets: number;
  /** The folder the total covers, or null when the whole project or org was counted. */
  folder: string | null;
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
export type MergeAspectRatio = "auto" | "16:9" | "9:16" | "1:1";

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

/** A point in background pixel coordinates */
export interface CompositePoint {
  x: number;
  y: number;
}

/**
 * Perspective destination quad: where the overlay's four corners land on the
 * background, in background pixels. Use for corner-pinning a clip onto an
 * angled surface like a phone screen in a held-phone shot.
 */
export interface CompositeQuad {
  topLeft: CompositePoint;
  topRight: CompositePoint;
  bottomLeft: CompositePoint;
  bottomRight: CompositePoint;
}

/** Axis-aligned destination rectangle in background pixels (no perspective) */
export interface CompositeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Chroma key applied to the background: the keyed color becomes transparent so
 * the overlay shows through only there, and real foreground (fingers, hands)
 * occludes the overlay.
 */
export interface CompositeChromaKey {
  /** Key color in hex format (e.g., "#F500FA") */
  color: string;
  /** Color distance tolerance 0.01-1 (default: 0.3) */
  similarity?: number;
  /** Edge blend 0-1 (default: 0.1) */
  blend?: number;
}

/**
 * Composite configuration: place this input (the overlay) into a region of a
 * background asset. The background can be an image or video. The keyed or
 * masked background is layered on top of the placed overlay, so foreground in
 * the background shot occludes the inset — ideal for "POV holding my phone"
 * style UGC where an app recording is pinned onto the phone's (keyed) screen.
 */
export interface CompositeConfig {
  /** Asset ID of the background image or video */
  backgroundAssetId: string;
  /** Perspective corner-pin destination (requires chromaKey or maskAssetId) */
  quad?: CompositeQuad;
  /** Axis-aligned destination rectangle (simple PiP when no key/mask) */
  rect?: CompositeRect;
  /** How the overlay fills the destination region's aspect ratio (default: "cover") */
  fit?: "cover" | "contain" | "fill";
  /** Chroma key applied to the background */
  chromaKey?: CompositeChromaKey;
  /** Grayscale mask image asset: white keeps the background, black reveals the overlay */
  maskAssetId?: string;
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
  /** Composite this input into a region of a background asset */
  composite?: CompositeConfig;
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
  /**
   * Output aspect ratio (default: "auto").
   * "auto" matches the orientation of the first visual input — portrait inputs
   * produce portrait output (e.g. 1080x1920 at 1080p), ideal for Reels/TikTok.
   * Explicit values force the canvas; the quality sets the short edge.
   */
  aspectRatio?: MergeAspectRatio;
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
  outputAspectRatio: MergeAspectRatio;
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
// Video Render Types
// ============================================================================

export type RenderStatus = TranscodingStatus;
/** "frames" is a frames render: JPEG stills at chosen times instead of a video. */
export type RenderOutputFormat = "mp4" | "webm" | "frames";

/**
 * The declarative video spec.
 *
 * Typed loosely on purpose. The authoritative schema lives in
 * `@stack0/video-spec`, which also ships worked examples and the timing engine;
 * restating its shape here would create a second description of one contract
 * that silently drifts. Install that package for full types and validation:
 *
 * ```typescript
 * import { validateSpec, prankWithDemoExample } from '@stack0/video-spec'
 * ```
 */
export type VideoSpec = Record<string, unknown>;

/**
 * How the finished video is encoded.
 *
 * There is no quality or aspect ratio here: the spec's canvas declares width,
 * height and fps, so scale is the only encode-side lever left.
 */
export interface RenderOutputConfig {
  /** Container and codec: mp4/h264 or webm/vp8 (default: mp4) */
  format?: RenderOutputFormat;
  /** Multiplier on the spec's canvas, 0.1-4 (default: 1). Cost scales with the square of this. */
  scale?: number;
  /** Custom filename for the output */
  filename?: string;
  /**
   * Normalize the soundtrack after the render (EBU R128, two-pass). The video stream is
   * copied untouched; the audio is re-encoded (AAC 192k 48 kHz for mp4, Opus for webm).
   * A render with no audio is left as is.
   */
  loudness?: RenderLoudness;
  /** With format "frames": seconds into the video, 1-24 of them, each before the end. */
  frames?: number[];
  /** With format "frames": the width of each still in pixels, 320-1920 (default: 960). */
  frameWidth?: number;
}

/**
 * Request to render single frames of a spec as JPEG stills. Billed per still,
 * far below a video render: the check to run on a draft before rendering it.
 */
export interface RenderFramesRequest {
  /** Project slug to create the render job in */
  projectSlug: string;
  /** The video spec: scenes, layers, timing and media. Data, not code. */
  spec: VideoSpec;
  /** Seconds into the video, 1-24 of them, each before the end */
  frames: number[];
  /** Width of each still in pixels, 320-1920 (default: 960). The height follows the canvas. */
  frameWidth?: number;
  /** Webhook URL for completion notification */
  webhookUrl?: string;
}

/** One still from a frames render. */
export interface RenderFrame {
  /** Seconds into the video */
  time: number;
  /** The JPEG asset */
  assetId: string;
  url: string;
  /**
   * The share of the still with visible detail, 0 to 1: about 0 for a blank
   * frame, 0.15 for a sparse end card, 0.5 for a screen that fills the frame.
   * Missing on stills rendered before it was measured.
   */
  filled?: number;
}

export interface RenderLoudness {
  /** Integrated loudness target in LUFS, -24 to -8. Social platforms play at about -14. */
  integrated: number;
  /** True peak ceiling in dBTP, -3 to 0 (default: -1) */
  truePeak?: number;
}

/**
 * Request to render a video spec
 */
export interface CreateRenderJobRequest {
  /** Project slug to create the render job in */
  projectSlug: string;
  /** The video spec: scenes, layers, timing and media. Data, not code. */
  spec: VideoSpec;
  /** Output configuration */
  output?: RenderOutputConfig;
  /** Webhook URL for completion notification */
  webhookUrl?: string;
}

/** The shapes a film renders in. */
export type FilmComposition = "landscape" | "vertical" | "square";

/**
 * Request to render a film written as code: Remotion source files rendered
 * inside Stack0's fixed film project (an entry, a Root registering one
 * composition per shape, and a kit of helpers under src/kit/). Send your own
 * files under src/: src/film.tsx exporting `Film` and `DURATION` (frames at
 * 30 fps), any modules it imports, and src/media.ts exporting `MEDIA`. A film
 * may import only react, remotion and the @remotion packages Stack0 installs,
 * and its page can load media only from the Stack0 CDN and Google Fonts. It
 * runs in an isolated sandbox.
 */
export interface CreateFilmRenderJobRequest {
  projectSlug: string;
  film: {
    /** Source files by path, e.g. { "src/film.tsx": "...", "src/media.ts": "..." } */
    files: Record<string, string>;
    composition: FilmComposition;
    /** The film's length in seconds, up to 180. The render fails if the film runs longer. */
    durationSeconds: number;
  };
  output?: RenderOutputConfig;
  webhookUrl?: string;
}

/**
 * Request to list render jobs
 */
export interface ListRenderJobsRequest {
  projectSlug: string;
  /** Filter by status */
  status?: RenderStatus;
  /** Maximum number of results (default: 20, max: 100) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Render job response
 */
export interface RenderJob {
  id: string;
  organizationId: string;
  projectId: string;
  environment: "sandbox" | "production";
  /** The submitted spec, with media references resolved to URLs. Null for a film. */
  spec: VideoSpec | null;
  /** A film render's shape and declared length. Absent for a spec render. */
  film?: { composition: FilmComposition; durationSeconds: number } | null;
  outputFormat: RenderOutputFormat;
  outputScale: number;
  outputFilename: string | null;
  /** The loudness target the soundtrack was normalized to, or null */
  outputLoudness: { integrated: number; truePeak: number } | null;
  /** A frames render: the times asked for, and the still width */
  frameTimes: number[] | null;
  frameWidth: number | null;
  /** A frames render's stills, in the order asked for. Null until it completes, and for videos. */
  outputFrames: RenderFrame[] | null;
  /**
   * Paths of spec fields the schema does not know and dropped, e.g.
   * "scenes[0].layers[2].zoom". The spec still rendered without them.
   */
  ignored: string[] | null;
  outputAssetId: string | null;
  status: RenderStatus;
  progress: number | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  /** Resolved from the spec at submission, before a single frame renders */
  width: number | null;
  height: number | null;
  fps: number | null;
  durationInFrames: number | null;
  outputDurationSeconds: number | null;
  webhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Render job with output asset details
 */
export interface RenderJobWithOutput extends RenderJob {
  outputAsset: {
    id: string;
    cdnUrl: string;
    directUrl: string;
    filename: string;
    size: number;
    duration: number | null;
  } | null;
}

export interface ListRenderJobsResponse {
  jobs: RenderJob[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Video Analysis Types
// ============================================================================

export type VideoAnalysisStatus = TranscodingStatus;

/**
 * Request to analyse a video or audio asset
 */
export interface CreateVideoAnalysisRequest {
  /** Project slug. When omitted, the job runs in the asset's own project. */
  projectSlug?: string;
  /** The video or audio asset to analyse. For audio, the frame options have no effect. */
  assetId: string;
  /** Seconds between sampled frames, 0.25-10 (default: 1) */
  frameIntervalSeconds?: number;
  /** Width of each frame cell in pixels, 160-640 (default: 320) */
  frameWidth?: number;
  /** Scene-change score that counts as a cut, 0.1-0.9 (default: 0.3) */
  sceneThreshold?: number;
  /**
   * Extract a mono 16 kHz MP3 when the video has audio. Ignored for audio assets.
   * Default: true, or false when `motion` is true.
   */
  extractAudio?: boolean;
  /** Make the frame contact sheets. Default: true, or false when `motion` is true. */
  frames?: boolean;
  /**
   * Measure how much the video moves (default: false). A job with only `motion` skips the
   * sheets and the audio copy, so it costs one decode. Ignored for audio assets.
   */
  motion?: boolean;
  /** Analyse beats, kicks, the drop and loudness of the soundtrack (default: false) */
  beats?: boolean;
  /** Known tempo, 40-220. Fixes the beat period; only the phase is searched. */
  expectedBpm?: number;
  /** Seconds into the track near the drop. The drop is searched within 1.5 s of it. */
  dropHint?: number;
  /** Webhook URL for completion notification */
  webhookUrl?: string;
}

/**
 * Request to list video analysis jobs
 */
export interface ListVideoAnalysesRequest {
  projectSlug: string;
  /** Only jobs for this asset */
  assetId?: string;
  /** Filter by status */
  status?: VideoAnalysisStatus;
  /** Maximum number of results (default: 20, max: 100) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * What an analysis found.
 *
 * Frame i is sampled at min(i * frames.intervalSeconds, probe.durationSeconds - 0.05).
 * Each sheet is a JPEG grid of `columns` x `rows` cells, filled row by row, starting at
 * frame `firstIndex`.
 *
 * For an audio asset, `frames` and `audio` are null, `cuts` is empty, and the probe's
 * width, height and fps are 0.
 */
export interface VideoAnalysisResult {
  probe: {
    durationSeconds: number;
    /** Display width, rotation applied */
    width: number;
    /** Display height, rotation applied */
    height: number;
    fps: number;
    /** Rotation in degrees, 0-359 */
    rotation: number;
    hasAudio: boolean;
    videoCodec: string | null;
    audioCodec: string | null;
  };
  /** Scene changes in seconds, ascending */
  cuts: { time: number; score: number }[];
  frames: {
    intervalSeconds: number;
    count: number;
    cellWidth: number;
    cellHeight: number;
    columns: number;
    rows: number;
    sheets: { assetId: string; url: string; firstIndex: number; count: number }[];
  } | null;
  audio: { assetId: string; url: string; format: "mp3"; sampleRate: 16000; channels: 1 } | null;
  /** Set when the job asked for beats and the source has audio */
  music: VideoAnalysisMusic | null;
  /** Set when the job asked for motion and the source is a video */
  motion: VideoAnalysisMotion | null;
}

/**
 * How much a video moves. Each value is the mean absolute difference between consecutive
 * frames, grayscale, scaled to 320 px wide, sampled at 10 fps, on a 0-255 scale: the same
 * as ffmpeg's `scale=320:-2,fps=10,format=gray,tblend=all_mode=difference,signalstats`
 * reading lavfi.signalstats.YAVG.
 */
export interface VideoAnalysisMotion {
  /** Seconds between values: 0.1 */
  step: number;
  values: number[];
}

/**
 * Beat analysis of a soundtrack. All times are seconds from the start of the track.
 */
export interface VideoAnalysisMusic {
  bpm: number;
  /** A constant-tempo grid over the whole track */
  beats: number[];
  /** Every 4th beat, phased to the strongest kicks */
  downbeats: number[];
  /** Low-band (<150 Hz) onsets */
  kicks: number[];
  /** The largest sustained step up in bass, on a beat. Null when there is none. */
  drop: number | null;
  /** Loudness 0..1 every 0.1 s */
  envelope: number[];
}

/**
 * Video analysis job
 */
export interface VideoAnalysisJob {
  id: string;
  organizationId: string;
  projectId: string;
  assetId: string;
  environment: "sandbox" | "production";
  frameIntervalSeconds: number;
  frameWidth: number;
  sceneThreshold: number;
  extractAudio: boolean;
  frames: boolean;
  motion: boolean;
  beats: boolean;
  expectedBpm: number | null;
  dropHint: number | null;
  status: VideoAnalysisStatus;
  progress: number | null;
  errorMessage: string | null;
  /** Set when status is "completed" */
  result: VideoAnalysisResult | null;
  sourceDurationSeconds: number | null;
  webhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface ListVideoAnalysesResponse {
  jobs: VideoAnalysisJob[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Multipart Upload Types
// ============================================================================

/**
 * Request to start a multipart upload
 */
export interface CreateMultipartUploadRequest {
  projectSlug: string;
  filename: string;
  mimeType: string;
  /** File size in bytes */
  size: number;
  folder?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMultipartUploadResponse {
  assetId: string;
  uploadId: string;
  /** Bytes in every part except the last */
  partSize: number;
  /** One presigned PUT URL per part */
  parts: { partNumber: number; url: string }[];
  expiresAt: Date;
}

export interface CompleteMultipartUploadRequest {
  assetId: string;
  uploadId: string;
  /** Every part's number and the ETag header from its PUT response */
  parts: { partNumber: number; etag: string }[];
}

export interface AbortMultipartUploadRequest {
  assetId: string;
  uploadId: string;
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
