/**
 * Stack0 CDN Client
 * Upload, manage, and transform assets
 */

import { HttpClient, type HttpClientConfig } from "../lib/http-client";
import type {
  Asset,
  UploadUrlRequest,
  UploadUrlResponse,
  UpdateAssetRequest,
  DeleteAssetsResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  MoveAssetsRequest,
  MoveAssetsResponse,
  TransformOptions,
  GetFolderTreeRequest,
  FolderTreeNode,
  CreateFolderRequest,
  Folder,
  TranscodeVideoRequest,
  TranscodeJob,
  ListJobsRequest,
  ListJobsResponse,
  StreamingUrls,
  ThumbnailRequest,
  ThumbnailResponse,
  RegenerateThumbnailRequest,
  RegenerateThumbnailResponse,
  ExtractAudioRequest,
  ExtractAudioResponse,
  // Private Files
  PrivateFile,
  PrivateUploadUrlRequest,
  PrivateUploadUrlResponse,
  PrivateDownloadUrlRequest,
  PrivateDownloadUrlResponse,
  ListPrivateFilesRequest,
  ListPrivateFilesResponse,
  UpdatePrivateFileRequest,
  MovePrivateFilesRequest,
  MovePrivateFilesResponse,
  // Bundles
  DownloadBundle,
  CreateBundleRequest,
  CreateBundleResponse,
  ListBundlesRequest,
  ListBundlesResponse,
  BundleDownloadUrlRequest,
  BundleDownloadUrlResponse,
  // Usage
  CdnUsageRequest,
  CdnUsageResponse,
  CdnUsageHistoryRequest,
  CdnUsageHistoryResponse,
  CdnUsageDataPoint,
  CdnStorageBreakdownRequest,
  CdnStorageBreakdownResponse,
  // Additional Folder Types
  UpdateFolderRequest,
  ListFoldersRequest,
  ListFoldersResponse,
  FolderListItem,
  MoveFolderRequest,
  MoveFolderResponse,
  // Additional Video Types
  VideoThumbnail,
  ListThumbnailsResponse,
  // Video Merge Types
  CreateMergeJobRequest,
  MergeJob,
  MergeJobWithOutput,
  ListMergeJobsRequest,
  ListMergeJobsResponse,
  // GIF Generation Types
  GenerateGifRequest,
  VideoGif,
  ListGifsRequest,
  // Image Watermark Types
  ImageWatermarkConfig,
  // Import Types
  CreateImportRequest,
  CreateImportResponse,
  ImportJob,
  ListImportsRequest,
  ListImportsResponse,
  ImportJobSummary,
  CancelImportResponse,
  RetryImportResponse,
  ListImportFilesRequest,
  ListImportFilesResponse,
  ImportFile,
} from "./types";

// Allowed widths that match the CloudFront url-rewriter configuration
const ALLOWED_WIDTHS = [256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export class CDN {
  private http: HttpClient;
  private cdnUrl?: string;

  constructor(config: HttpClientConfig, cdnUrl?: string) {
    this.http = new HttpClient(config);
    this.cdnUrl = cdnUrl;
  }

  /**
   * Generate a presigned URL for uploading a file
   *
   * @example
   * ```typescript
   * const { uploadUrl, assetId } = await cdn.getUploadUrl({
   *   projectSlug: 'my-project',
   *   filename: 'image.jpg',
   *   mimeType: 'image/jpeg',
   *   size: 1024 * 1024,
   * });
   *
   * // Upload file to the presigned URL
   * await fetch(uploadUrl, {
   *   method: 'PUT',
   *   body: file,
   *   headers: { 'Content-Type': 'image/jpeg' },
   * });
   *
   * // Confirm the upload
   * const asset = await cdn.confirmUpload(assetId);
   * ```
   */
  async getUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    const response = await this.http.post<UploadUrlResponse>("/cdn/upload", request);

    if (typeof response.expiresAt === "string") {
      response.expiresAt = new Date(response.expiresAt);
    }

    return response;
  }

  /**
   * Confirm that an upload has completed
   */
  async confirmUpload(assetId: string): Promise<Asset> {
    const response = await this.http.post<Asset>(`/cdn/upload/${assetId}/confirm`, {});
    return this.convertAssetDates(response);
  }

  /**
   * Upload a file directly (handles presigned URL flow automatically)
   *
   * @example
   * ```typescript
   * const asset = await cdn.upload({
   *   projectSlug: 'my-project',
   *   file: fileBuffer,
   *   filename: 'image.jpg',
   *   mimeType: 'image/jpeg',
   * });
   *
   * // With watermark
   * const watermarkedAsset = await cdn.upload({
   *   projectSlug: 'my-project',
   *   file: fileBuffer,
   *   filename: 'photo.jpg',
   *   mimeType: 'image/jpeg',
   *   watermark: {
   *     assetId: 'logo-asset-id', // or url: 'https://example.com/logo.png'
   *     position: 'bottom-right',
   *     opacity: 50,
   *     sizingMode: 'relative',
   *     width: 15, // 15% of image width
   *   },
   * });
   * ```
   */
  async upload(options: {
    projectSlug: string;
    file: Blob | Buffer | ArrayBuffer;
    filename: string;
    mimeType: string;
    folder?: string;
    metadata?: Record<string, unknown>;
    /** Watermark configuration for images (applied during upload processing) */
    watermark?: ImageWatermarkConfig;
  }): Promise<Asset> {
    const { projectSlug, file, filename, mimeType, folder, metadata, watermark } = options;

    // Get file size
    let size: number;
    if (file instanceof Blob) {
      size = file.size;
    } else if (file instanceof ArrayBuffer) {
      size = file.byteLength;
    } else {
      // Buffer
      size = (file as Buffer).length;
    }

    // Get presigned URL
    const { uploadUrl, assetId } = await this.getUploadUrl({
      projectSlug,
      filename,
      mimeType,
      size,
      folder,
      metadata,
      watermark,
    });

    // Upload file
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": mimeType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Confirm upload
    return this.confirmUpload(assetId);
  }

  /**
   * Get an asset by ID
   *
   * @example
   * ```typescript
   * const asset = await cdn.get('asset-id');
   * console.log(asset.cdnUrl);
   * ```
   */
  async get(id: string): Promise<Asset> {
    const response = await this.http.get<Asset>(`/cdn/assets/${id}`);
    return this.convertAssetDates(response);
  }

  /**
   * Update asset metadata
   *
   * @example
   * ```typescript
   * const asset = await cdn.update({
   *   id: 'asset-id',
   *   alt: 'A beautiful sunset',
   *   tags: ['nature', 'sunset'],
   * });
   * ```
   */
  async update(request: UpdateAssetRequest): Promise<Asset> {
    const { id, ...data } = request;
    const response = await this.http.patch<Asset>(`/cdn/assets/${id}`, data);
    return this.convertAssetDates(response);
  }

  /**
   * Delete an asset
   *
   * @example
   * ```typescript
   * await cdn.delete('asset-id');
   * ```
   */
  async delete(id: string): Promise<{ success: boolean }> {
    // NOTE: Our OpenAPI adapter parses JSON bodies for non-GET methods.
    // Some Fastify setups will throw if Content-Type is JSON but the body is empty.
    // Sending the id in the body keeps this endpoint compatible across adapters.
    return this.http.deleteWithBody<{ success: boolean }>(`/cdn/assets/${id}`, { id });
  }

  /**
   * Delete multiple assets
   *
   * @example
   * ```typescript
   * const result = await cdn.deleteMany(['asset-1', 'asset-2']);
   * console.log(`Deleted ${result.deletedCount} assets`);
   * ```
   */
  async deleteMany(ids: string[]): Promise<DeleteAssetsResponse> {
    return this.http.post<DeleteAssetsResponse>("/cdn/assets/delete", { ids });
  }

  /**
   * List assets with filters and pagination
   *
   * @example
   * ```typescript
   * const { assets, total, hasMore } = await cdn.list({
   *   projectSlug: 'my-project',
   *   type: 'image',
   *   limit: 20,
   * });
   * ```
   */
  async list(request: ListAssetsRequest): Promise<ListAssetsResponse> {
    const params = new URLSearchParams();

    params.set("projectSlug", request.projectSlug);
    if (request.folder !== undefined) params.set("folder", request.folder ?? "");
    if (request.type) params.set("type", request.type);
    if (request.status) params.set("status", request.status);
    if (request.search) params.set("search", request.search);
    if (request.tags) params.set("tags", request.tags.join(","));
    if (request.sortBy) params.set("sortBy", request.sortBy);
    if (request.sortOrder) params.set("sortOrder", request.sortOrder);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const response = await this.http.get<ListAssetsResponse>(`/cdn/assets?${params.toString()}`);

    return {
      ...response,
      assets: response.assets.map((asset) => this.convertAssetDates(asset)),
    };
  }

  /**
   * Move assets to a different folder
   *
   * @example
   * ```typescript
   * await cdn.move({
   *   assetIds: ['asset-1', 'asset-2'],
   *   folder: '/images/archive',
   * });
   * ```
   */
  async move(request: MoveAssetsRequest): Promise<MoveAssetsResponse> {
    return this.http.post<MoveAssetsResponse>("/cdn/assets/move", request);
  }

  /**
   * Get a transformed image URL (client-side, no API call)
   *
   * @example
   * ```typescript
   * // Using asset's cdnUrl directly
   * const url = cdn.getTransformUrl(asset.cdnUrl, {
   *   width: 800,
   *   height: 600,
   *   fit: 'cover',
   *   format: 'webp',
   *   quality: 80,
   * });
   *
   * // Or using cdnUrl from SDK config + s3Key
   * const url = cdn.getTransformUrl(asset.s3Key, { width: 400 });
   * ```
   */
  getTransformUrl(assetUrlOrS3Key: string, options: TransformOptions): string {
    // Determine base URL
    let baseUrl: string;
    if (assetUrlOrS3Key.startsWith("http://") || assetUrlOrS3Key.startsWith("https://")) {
      // It's already a full URL - extract base and path
      const url = new URL(assetUrlOrS3Key);
      baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    } else if (this.cdnUrl) {
      // It's an s3Key, use configured CDN URL
      const cdnBase = this.cdnUrl.endsWith("/") ? this.cdnUrl.slice(0, -1) : this.cdnUrl;
      baseUrl = `${cdnBase}/${assetUrlOrS3Key}`;
    } else {
      throw new Error("getTransformUrl requires either a full URL or cdnUrl to be configured in Stack0 options");
    }

    // Build query string
    const params = this.buildTransformQuery(options);
    if (!params) {
      return baseUrl;
    }
    return `${baseUrl}?${params}`;
  }

  /**
   * Build transform query parameters
   */
  private buildTransformQuery(options: TransformOptions): string {
    const params = new URLSearchParams();

    if (options.format) params.set("f", options.format);
    if (options.quality !== undefined) params.set("q", options.quality.toString());

    if (options.width !== undefined) {
      // Snap to nearest allowed width for better caching
      const width = this.getNearestWidth(options.width);
      params.set("w", width.toString());
    }
    if (options.height !== undefined) params.set("h", options.height.toString());
    if (options.fit) params.set("fit", options.fit);
    if (options.crop) params.set("crop", options.crop);
    if (options.cropX !== undefined) params.set("crop-x", options.cropX.toString());
    if (options.cropY !== undefined) params.set("crop-y", options.cropY.toString());
    if (options.cropWidth !== undefined) params.set("crop-w", options.cropWidth.toString());
    if (options.cropHeight !== undefined) params.set("crop-h", options.cropHeight.toString());
    if (options.blur !== undefined) params.set("blur", options.blur.toString());
    if (options.sharpen !== undefined) params.set("sharpen", options.sharpen.toString());
    if (options.brightness !== undefined) params.set("brightness", options.brightness.toString());
    if (options.saturation !== undefined) params.set("saturation", options.saturation.toString());
    if (options.grayscale) params.set("grayscale", "true");
    if (options.rotate !== undefined) params.set("rotate", options.rotate.toString());
    if (options.flip) params.set("flip", "y");
    if (options.flop) params.set("flop", "x");

    return params.toString();
  }

  /**
   * Find the nearest allowed width for optimal caching
   */
  private getNearestWidth(width: number): number {
    return ALLOWED_WIDTHS.reduce((prev, curr) => (Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev));
  }

  /**
   * Get folder tree for navigation
   *
   * @example
   * ```typescript
   * const tree = await cdn.getFolderTree({
   *   projectSlug: 'my-project',
   *   maxDepth: 3,
   * });
   * ```
   */
  async getFolderTree(request: GetFolderTreeRequest): Promise<FolderTreeNode[]> {
    const params = new URLSearchParams();
    params.set("projectSlug", request.projectSlug);
    if (request.maxDepth) params.set("maxDepth", request.maxDepth.toString());

    const response = await this.http.get<{ tree: FolderTreeNode[] }>(`/cdn/folders/tree?${params.toString()}`);
    return response.tree;
  }

  /**
   * Create a new folder
   *
   * @example
   * ```typescript
   * const folder = await cdn.createFolder({
   *   projectSlug: 'my-project',
   *   name: 'images',
   * });
   * ```
   */
  async createFolder(request: CreateFolderRequest): Promise<Folder> {
    const response = await this.http.post<Folder>("/cdn/folders", request);
    return this.convertFolderDates(response);
  }

  /**
   * Delete a folder
   *
   * @example
   * ```typescript
   * await cdn.deleteFolder('folder-id');
   * ```
   */
  async deleteFolder(id: string, deleteContents = false): Promise<{ success: boolean }> {
    const params = new URLSearchParams();
    if (deleteContents) params.set("deleteContents", "true");

    return this.http.deleteWithBody<{ success: boolean }>(`/cdn/folders/${id}?${params.toString()}`, {
      id,
      deleteContents,
    });
  }

  private convertAssetDates(asset: Asset): Asset {
    if (typeof asset.createdAt === "string") {
      asset.createdAt = new Date(asset.createdAt);
    }
    if (asset.updatedAt && typeof asset.updatedAt === "string") {
      asset.updatedAt = new Date(asset.updatedAt);
    }
    return asset;
  }

  private convertFolderDates(folder: Folder): Folder {
    if (typeof folder.createdAt === "string") {
      folder.createdAt = new Date(folder.createdAt);
    }
    if (folder.updatedAt && typeof folder.updatedAt === "string") {
      folder.updatedAt = new Date(folder.updatedAt);
    }
    return folder;
  }

  // ============================================================================
  // Video Transcoding Methods
  // ============================================================================

  /**
   * Start a video transcoding job
   *
   * @example
   * ```typescript
   * const job = await cdn.transcode({
   *   projectSlug: 'my-project',
   *   assetId: 'video-asset-id',
   *   outputFormat: 'hls',
   *   variants: [
   *     { quality: '720p', codec: 'h264' },
   *     { quality: '1080p', codec: 'h264' },
   *   ],
   *   webhookUrl: 'https://your-app.com/webhook',
   * });
   * console.log(`Job started: ${job.id}`);
   * ```
   */
  async transcode(request: TranscodeVideoRequest): Promise<TranscodeJob> {
    const response = await this.http.post<TranscodeJob>("/cdn/video/transcode", request);
    return this.convertJobDates(response);
  }

  /**
   * Get a transcoding job by ID
   *
   * @example
   * ```typescript
   * const job = await cdn.getJob('job-id');
   * console.log(`Status: ${job.status}, Progress: ${job.progress}%`);
   * ```
   */
  async getJob(jobId: string): Promise<TranscodeJob> {
    const response = await this.http.get<TranscodeJob>(`/cdn/video/jobs/${jobId}`);
    return this.convertJobDates(response);
  }

  /**
   * List transcoding jobs with filters
   *
   * @example
   * ```typescript
   * const { jobs, total } = await cdn.listJobs({
   *   projectSlug: 'my-project',
   *   status: 'processing',
   *   limit: 20,
   * });
   * ```
   */
  async listJobs(request: ListJobsRequest): Promise<ListJobsResponse> {
    const params = new URLSearchParams();
    params.set("projectSlug", request.projectSlug);
    if (request.assetId) params.set("assetId", request.assetId);
    if (request.status) params.set("status", request.status);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const response = await this.http.get<ListJobsResponse>(`/cdn/video/jobs?${params.toString()}`);
    return {
      ...response,
      jobs: response.jobs.map((job) => this.convertJobDates(job)),
    };
  }

  /**
   * Cancel a pending or processing transcoding job
   *
   * @example
   * ```typescript
   * await cdn.cancelJob('job-id');
   * ```
   */
  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`/cdn/video/jobs/${jobId}/cancel`, {});
  }

  /**
   * Get streaming URLs for a transcoded video
   *
   * @example
   * ```typescript
   * const urls = await cdn.getStreamingUrls('asset-id');
   * console.log(`HLS URL: ${urls.hlsUrl}`);
   * console.log(`MP4 720p: ${urls.mp4Urls.find(u => u.quality === '720p')?.url}`);
   * ```
   */
  async getStreamingUrls(assetId: string): Promise<StreamingUrls> {
    return this.http.get<StreamingUrls>(`/cdn/video/stream/${assetId}`);
  }

  /**
   * Generate a thumbnail from a video at a specific timestamp
   *
   * @example
   * ```typescript
   * const thumbnail = await cdn.getThumbnail({
   *   assetId: 'video-asset-id',
   *   timestamp: 10.5, // 10.5 seconds into the video
   *   width: 320,
   *   format: 'webp',
   * });
   * console.log(`Thumbnail URL: ${thumbnail.url}`);
   * ```
   */
  async getThumbnail(request: ThumbnailRequest): Promise<ThumbnailResponse> {
    const params = new URLSearchParams();
    params.set("timestamp", request.timestamp.toString());
    if (request.width) params.set("width", request.width.toString());
    if (request.format) params.set("format", request.format);

    return this.http.get<ThumbnailResponse>(`/cdn/video/thumbnail/${request.assetId}?${params.toString()}`);
  }

  /**
   * Regenerate a thumbnail for a video (force regeneration even if one exists)
   *
   * Useful for retrying failed thumbnail generation or regenerating with different settings.
   *
   * @example
   * ```typescript
   * const result = await cdn.regenerateThumbnail({
   *   assetId: 'video-asset-id',
   *   timestamp: 5, // 5 seconds into the video
   *   width: 1280,
   *   format: 'jpg',
   * });
   * console.log(`Thumbnail regeneration queued: ${result.status}`);
   * ```
   */
  async regenerateThumbnail(request: RegenerateThumbnailRequest): Promise<RegenerateThumbnailResponse> {
    return this.http.post<RegenerateThumbnailResponse>("/cdn/video/thumbnail/regenerate", request);
  }

  /**
   * Extract audio from a video file
   *
   * @example
   * ```typescript
   * const { jobId } = await cdn.extractAudio({
   *   projectSlug: 'my-project',
   *   assetId: 'video-asset-id',
   *   format: 'mp3',
   *   bitrate: 192,
   * });
   * ```
   */
  async extractAudio(request: ExtractAudioRequest): Promise<ExtractAudioResponse> {
    return this.http.post<ExtractAudioResponse>("/cdn/video/extract-audio", request);
  }

  // ============================================================================
  // GIF Generation Methods
  // ============================================================================

  /**
   * Generate an animated GIF from a video segment
   *
   * Creates an optimized GIF from a portion of the video. Uses two-pass
   * palette generation by default for smaller file sizes with better quality.
   *
   * @example
   * ```typescript
   * const gif = await cdn.generateGif({
   *   projectSlug: 'my-project',
   *   assetId: 'video-asset-id',
   *   startTime: 5,      // Start at 5 seconds
   *   duration: 3,       // 3 second GIF
   *   width: 480,        // 480px wide
   *   fps: 10,           // 10 frames per second
   * });
   *
   * // Poll for completion
   * let result = await cdn.getGif(gif.id);
   * while (result?.status === 'pending' || result?.status === 'processing') {
   *   await new Promise(r => setTimeout(r, 1000));
   *   result = await cdn.getGif(gif.id);
   * }
   *
   * console.log(`GIF URL: ${result?.url}`);
   * ```
   */
  async generateGif(request: GenerateGifRequest): Promise<VideoGif> {
    const response = await this.http.post<VideoGif>("/cdn/video/gif", request);
    return this.convertGifDates(response);
  }

  /**
   * Get a specific GIF by ID
   *
   * @example
   * ```typescript
   * const gif = await cdn.getGif('gif-id');
   * if (gif?.status === 'completed') {
   *   console.log(`GIF URL: ${gif.url}`);
   *   console.log(`Size: ${gif.sizeBytes} bytes`);
   * }
   * ```
   */
  async getGif(gifId: string): Promise<VideoGif | null> {
    const response = await this.http.get<VideoGif | null>(`/cdn/video/gif/${gifId}`);
    return response ? this.convertGifDates(response) : null;
  }

  /**
   * List all GIFs generated for a video asset
   *
   * @example
   * ```typescript
   * const gifs = await cdn.listGifs({ assetId: 'video-asset-id' });
   * for (const gif of gifs) {
   *   console.log(`GIF at ${gif.startTime}s: ${gif.url}`);
   * }
   * ```
   */
  async listGifs(request: ListGifsRequest): Promise<VideoGif[]> {
    const response = await this.http.get<VideoGif[]>(`/cdn/video/${request.assetId}/gifs`);
    return response.map((gif) => this.convertGifDates(gif));
  }

  private convertGifDates(gif: VideoGif): VideoGif {
    if (typeof gif.createdAt === "string") {
      gif.createdAt = new Date(gif.createdAt);
    }
    if (gif.completedAt && typeof gif.completedAt === "string") {
      gif.completedAt = new Date(gif.completedAt);
    }
    return gif;
  }

  private convertJobDates(job: TranscodeJob): TranscodeJob {
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

  // ============================================================================
  // Private Files Methods
  // ============================================================================

  /**
   * Generate a presigned URL for uploading a private file
   *
   * Private files are stored securely and can only be accessed through
   * authorized download links with configurable expiration.
   *
   * @example
   * ```typescript
   * const { uploadUrl, fileId } = await cdn.getPrivateUploadUrl({
   *   projectSlug: 'my-project',
   *   filename: 'confidential.pdf',
   *   mimeType: 'application/pdf',
   *   size: 1024 * 1024,
   * });
   *
   * // Upload file to the presigned URL
   * await fetch(uploadUrl, {
   *   method: 'PUT',
   *   body: file,
   *   headers: { 'Content-Type': 'application/pdf' },
   * });
   *
   * // Confirm the upload
   * const privateFile = await cdn.confirmPrivateUpload(fileId);
   * ```
   */
  async getPrivateUploadUrl(request: PrivateUploadUrlRequest): Promise<PrivateUploadUrlResponse> {
    const response = await this.http.post<PrivateUploadUrlResponse>("/cdn/private/upload", request);

    if (typeof response.expiresAt === "string") {
      response.expiresAt = new Date(response.expiresAt);
    }

    return response;
  }

  /**
   * Confirm that a private file upload has completed
   */
  async confirmPrivateUpload(fileId: string): Promise<PrivateFile> {
    const response = await this.http.post<PrivateFile>(`/cdn/private/upload/${fileId}/confirm`, {});
    return this.convertPrivateFileDates(response);
  }

  /**
   * Upload a private file directly (handles presigned URL flow automatically)
   *
   * @example
   * ```typescript
   * const privateFile = await cdn.uploadPrivate({
   *   projectSlug: 'my-project',
   *   file: fileBuffer,
   *   filename: 'confidential.pdf',
   *   mimeType: 'application/pdf',
   * });
   * ```
   */
  async uploadPrivate(options: {
    projectSlug: string;
    file: Blob | Buffer | ArrayBuffer;
    filename: string;
    mimeType: string;
    folder?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PrivateFile> {
    const { projectSlug, file, filename, mimeType, folder, description, metadata } = options;

    // Get file size
    let size: number;
    if (file instanceof Blob) {
      size = file.size;
    } else if (file instanceof ArrayBuffer) {
      size = file.byteLength;
    } else {
      size = (file as Buffer).length;
    }

    // Get presigned URL
    const { uploadUrl, fileId } = await this.getPrivateUploadUrl({
      projectSlug,
      filename,
      mimeType,
      size,
      folder,
      description,
      metadata,
    });

    // Upload file
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": mimeType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Confirm upload
    return this.confirmPrivateUpload(fileId);
  }

  /**
   * Generate a presigned download URL for a private file
   *
   * @example
   * ```typescript
   * const { downloadUrl, expiresAt } = await cdn.getPrivateDownloadUrl({
   *   fileId: 'file-id',
   *   expiresIn: 86400, // 24 hours
   * });
   * ```
   */
  async getPrivateDownloadUrl(request: PrivateDownloadUrlRequest): Promise<PrivateDownloadUrlResponse> {
    const response = await this.http.post<PrivateDownloadUrlResponse>(`/cdn/private/${request.fileId}/download`, {
      expiresIn: request.expiresIn,
    });

    if (typeof response.expiresAt === "string") {
      response.expiresAt = new Date(response.expiresAt);
    }

    return response;
  }

  /**
   * Get a private file by ID
   */
  async getPrivateFile(fileId: string): Promise<PrivateFile> {
    const response = await this.http.get<PrivateFile>(`/cdn/private/${fileId}`);
    return this.convertPrivateFileDates(response);
  }

  /**
   * Update a private file's metadata
   */
  async updatePrivateFile(request: UpdatePrivateFileRequest): Promise<PrivateFile> {
    const { fileId, ...data } = request;
    const response = await this.http.patch<PrivateFile>(`/cdn/private/${fileId}`, data);
    return this.convertPrivateFileDates(response);
  }

  /**
   * Delete a private file
   */
  async deletePrivateFile(fileId: string): Promise<{ success: boolean }> {
    return this.http.deleteWithBody<{ success: boolean }>(`/cdn/private/${fileId}`, { fileId });
  }

  /**
   * Delete multiple private files
   */
  async deletePrivateFiles(fileIds: string[]): Promise<{ success: boolean; deletedCount: number }> {
    return this.http.post<{ success: boolean; deletedCount: number }>("/cdn/private/delete", { fileIds });
  }

  /**
   * List private files with filters and pagination
   *
   * @example
   * ```typescript
   * const { files, total, hasMore } = await cdn.listPrivateFiles({
   *   projectSlug: 'my-project',
   *   limit: 20,
   * });
   * ```
   */
  async listPrivateFiles(request: ListPrivateFilesRequest): Promise<ListPrivateFilesResponse> {
    const params = new URLSearchParams();

    params.set("projectSlug", request.projectSlug);
    if (request.folder !== undefined) params.set("folder", request.folder ?? "");
    if (request.status) params.set("status", request.status);
    if (request.search) params.set("search", request.search);
    if (request.sortBy) params.set("sortBy", request.sortBy);
    if (request.sortOrder) params.set("sortOrder", request.sortOrder);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const response = await this.http.get<ListPrivateFilesResponse>(`/cdn/private?${params.toString()}`);

    return {
      ...response,
      files: response.files.map((file) => this.convertPrivateFileDates(file)),
    };
  }

  private convertPrivateFileDates(file: PrivateFile): PrivateFile {
    if (typeof file.createdAt === "string") {
      file.createdAt = new Date(file.createdAt);
    }
    if (file.updatedAt && typeof file.updatedAt === "string") {
      file.updatedAt = new Date(file.updatedAt);
    }
    return file;
  }

  // ============================================================================
  // Download Bundle Methods
  // ============================================================================

  /**
   * Create a download bundle from assets and/or private files
   *
   * The bundle will be created asynchronously. Check the status using getBundle().
   *
   * @example
   * ```typescript
   * const { bundle } = await cdn.createBundle({
   *   projectSlug: 'my-project',
   *   name: 'Project Assets - Dec 2024',
   *   assetIds: ['asset-1', 'asset-2'],
   *   privateFileIds: ['file-1', 'file-2'],
   *   expiresIn: 86400, // 24 hours
   * });
   * console.log(`Bundle ${bundle.id} status: ${bundle.status}`);
   * ```
   */
  async createBundle(request: CreateBundleRequest): Promise<CreateBundleResponse> {
    const response = await this.http.post<CreateBundleResponse>("/cdn/bundles", request);
    return {
      bundle: this.convertBundleDates(response.bundle),
    };
  }

  /**
   * Get a download bundle by ID
   */
  async getBundle(bundleId: string): Promise<DownloadBundle> {
    const response = await this.http.get<DownloadBundle>(`/cdn/bundles/${bundleId}`);
    return this.convertBundleDates(response);
  }

  /**
   * List download bundles with filters and pagination
   *
   * @example
   * ```typescript
   * const { bundles, total } = await cdn.listBundles({
   *   projectSlug: 'my-project',
   *   status: 'ready',
   * });
   * ```
   */
  async listBundles(request: ListBundlesRequest): Promise<ListBundlesResponse> {
    const params = new URLSearchParams();

    params.set("projectSlug", request.projectSlug);
    if (request.status) params.set("status", request.status);
    if (request.search) params.set("search", request.search);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const response = await this.http.get<ListBundlesResponse>(`/cdn/bundles?${params.toString()}`);

    return {
      ...response,
      bundles: response.bundles.map((bundle) => this.convertBundleDates(bundle)),
    };
  }

  /**
   * Generate a presigned download URL for a bundle
   *
   * @example
   * ```typescript
   * const { downloadUrl, expiresAt } = await cdn.getBundleDownloadUrl({
   *   bundleId: 'bundle-id',
   *   expiresIn: 3600, // 1 hour
   * });
   * ```
   */
  async getBundleDownloadUrl(request: BundleDownloadUrlRequest): Promise<BundleDownloadUrlResponse> {
    const response = await this.http.post<BundleDownloadUrlResponse>(`/cdn/bundles/${request.bundleId}/download`, {
      expiresIn: request.expiresIn,
    });

    if (typeof response.expiresAt === "string") {
      response.expiresAt = new Date(response.expiresAt);
    }

    return response;
  }

  /**
   * Delete a download bundle
   */
  async deleteBundle(bundleId: string): Promise<{ success: boolean }> {
    return this.http.deleteWithBody<{ success: boolean }>(`/cdn/bundles/${bundleId}`, { bundleId });
  }

  private convertBundleDates(bundle: DownloadBundle): DownloadBundle {
    if (typeof bundle.createdAt === "string") {
      bundle.createdAt = new Date(bundle.createdAt);
    }
    if (bundle.completedAt && typeof bundle.completedAt === "string") {
      bundle.completedAt = new Date(bundle.completedAt);
    }
    if (bundle.expiresAt && typeof bundle.expiresAt === "string") {
      bundle.expiresAt = new Date(bundle.expiresAt);
    }
    return bundle;
  }

  // ============================================================================
  // Usage Methods
  // ============================================================================

  /**
   * Get current usage stats for the billing period
   *
   * @example
   * ```typescript
   * const usage = await cdn.getUsage({
   *   projectSlug: 'my-project',
   * });
   * console.log(`Bandwidth: ${usage.bandwidthFormatted}`);
   * console.log(`Estimated cost: ${usage.estimatedCostFormatted}`);
   * ```
   */
  async getUsage(request: CdnUsageRequest = {}): Promise<CdnUsageResponse> {
    const params = new URLSearchParams();
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.periodStart) {
      const date = request.periodStart instanceof Date ? request.periodStart.toISOString() : request.periodStart;
      params.set("periodStart", date);
    }
    if (request.periodEnd) {
      const date = request.periodEnd instanceof Date ? request.periodEnd.toISOString() : request.periodEnd;
      params.set("periodEnd", date);
    }

    const query = params.toString();
    const response = await this.http.get<CdnUsageResponse>(`/cdn/usage${query ? `?${query}` : ""}`);
    return this.convertUsageDates(response);
  }

  /**
   * Get usage history (time series data for charts)
   *
   * @example
   * ```typescript
   * const history = await cdn.getUsageHistory({
   *   projectSlug: 'my-project',
   *   days: 30,
   * });
   * console.log(`Total requests: ${history.totals.requests}`);
   * ```
   */
  async getUsageHistory(request: CdnUsageHistoryRequest = {}): Promise<CdnUsageHistoryResponse> {
    const params = new URLSearchParams();
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.days) params.set("days", request.days.toString());
    if (request.granularity) params.set("granularity", request.granularity);

    const query = params.toString();
    const response = await this.http.get<CdnUsageHistoryResponse>(`/cdn/usage/history${query ? `?${query}` : ""}`);

    return {
      ...response,
      data: response.data.map((point) => this.convertUsageDataPointDates(point)),
    };
  }

  /**
   * Get storage breakdown by type or folder
   *
   * @example
   * ```typescript
   * const breakdown = await cdn.getStorageBreakdown({
   *   projectSlug: 'my-project',
   *   groupBy: 'type',
   * });
   * breakdown.items.forEach(item => {
   *   console.log(`${item.key}: ${item.sizeFormatted} (${item.percentage}%)`);
   * });
   * ```
   */
  async getStorageBreakdown(request: CdnStorageBreakdownRequest = {}): Promise<CdnStorageBreakdownResponse> {
    const params = new URLSearchParams();
    if (request.projectSlug) params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.groupBy) params.set("groupBy", request.groupBy);

    const query = params.toString();
    return this.http.get<CdnStorageBreakdownResponse>(`/cdn/usage/storage-breakdown${query ? `?${query}` : ""}`);
  }

  private convertUsageDates(usage: CdnUsageResponse): CdnUsageResponse {
    if (typeof usage.periodStart === "string") {
      usage.periodStart = new Date(usage.periodStart);
    }
    if (typeof usage.periodEnd === "string") {
      usage.periodEnd = new Date(usage.periodEnd);
    }
    return usage;
  }

  private convertUsageDataPointDates(point: CdnUsageDataPoint): CdnUsageDataPoint {
    if (typeof point.timestamp === "string") {
      point.timestamp = new Date(point.timestamp);
    }
    return point;
  }

  // ============================================================================
  // Additional Folder Methods
  // ============================================================================

  /**
   * Get a folder by ID
   *
   * @example
   * ```typescript
   * const folder = await cdn.getFolder('folder-id');
   * console.log(`Folder: ${folder.name}, Assets: ${folder.assetCount}`);
   * ```
   */
  async getFolder(id: string): Promise<Folder> {
    const response = await this.http.get<Folder>(`/cdn/folders/${id}`);
    return this.convertFolderDates(response);
  }

  /**
   * Get a folder by its path
   *
   * @example
   * ```typescript
   * const folder = await cdn.getFolderByPath('/images/avatars');
   * ```
   */
  async getFolderByPath(path: string): Promise<Folder> {
    const encodedPath = encodeURIComponent(path);
    const response = await this.http.get<Folder>(`/cdn/folders/path/${encodedPath}`);
    return this.convertFolderDates(response);
  }

  /**
   * Update a folder's name
   *
   * @example
   * ```typescript
   * const folder = await cdn.updateFolder({
   *   id: 'folder-id',
   *   name: 'New Folder Name',
   * });
   * ```
   */
  async updateFolder(request: UpdateFolderRequest): Promise<Folder> {
    const { id, ...data } = request;
    const response = await this.http.patch<Folder>(`/cdn/folders/${id}`, data);
    return this.convertFolderDates(response);
  }

  /**
   * List folders with optional filters
   *
   * @example
   * ```typescript
   * const { folders, total } = await cdn.listFolders({
   *   parentId: null, // root level
   *   limit: 50,
   * });
   * ```
   */
  async listFolders(request: ListFoldersRequest = {}): Promise<ListFoldersResponse> {
    const params = new URLSearchParams();
    if (request.parentId !== undefined) params.set("parentId", request.parentId ?? "");
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());
    if (request.search) params.set("search", request.search);

    const query = params.toString();
    const response = await this.http.get<ListFoldersResponse>(`/cdn/folders${query ? `?${query}` : ""}`);

    return {
      ...response,
      folders: response.folders.map((folder) => this.convertFolderListItemDates(folder)),
    };
  }

  /**
   * Move a folder to a new parent
   *
   * @example
   * ```typescript
   * await cdn.moveFolder({
   *   id: 'folder-id',
   *   newParentId: 'new-parent-id', // or null for root
   * });
   * ```
   */
  async moveFolder(request: MoveFolderRequest): Promise<MoveFolderResponse> {
    return this.http.post<MoveFolderResponse>("/cdn/folders/move", request);
  }

  private convertFolderListItemDates(folder: FolderListItem): FolderListItem {
    if (typeof folder.createdAt === "string") {
      folder.createdAt = new Date(folder.createdAt);
    }
    return folder;
  }

  // ============================================================================
  // Additional Video Methods
  // ============================================================================

  /**
   * List all thumbnails for a video asset
   *
   * @example
   * ```typescript
   * const { thumbnails } = await cdn.listThumbnails('video-asset-id');
   * thumbnails.forEach(thumb => {
   *   console.log(`${thumb.timestamp}s: ${thumb.url}`);
   * });
   * ```
   */
  async listThumbnails(assetId: string): Promise<ListThumbnailsResponse> {
    const response = await this.http.get<ListThumbnailsResponse>(`/cdn/video/${assetId}/thumbnails`);
    return response;
  }

  // ============================================================================
  // Additional Private Files Methods
  // ============================================================================

  /**
   * Move private files to a different folder
   *
   * @example
   * ```typescript
   * const result = await cdn.movePrivateFiles({
   *   fileIds: ['file-1', 'file-2'],
   *   folder: '/confidential/archive',
   * });
   * console.log(`Moved ${result.movedCount} files`);
   * ```
   */
  async movePrivateFiles(request: MovePrivateFilesRequest): Promise<MovePrivateFilesResponse> {
    return this.http.post<MovePrivateFilesResponse>("/cdn/private/move", request);
  }

  // ============================================================================
  // Video Merge Methods
  // ============================================================================

  /**
   * Create a merge job to combine multiple videos/images with optional audio overlay
   *
   * Merge jobs combine multiple assets (videos, images) in sequence and can
   * optionally overlay an audio track. Images require a duration to be specified.
   *
   * @example
   * ```typescript
   * const job = await cdn.createMergeJob({
   *   projectSlug: 'my-project',
   *   inputs: [
   *     { assetId: 'intro-video-id' },
   *     { assetId: 'image-id', duration: 5 }, // Show image for 5 seconds
   *     { assetId: 'main-video-id', startTime: 10, endTime: 60 }, // Trim to 50 seconds
   *   ],
   *   audioTrack: {
   *     assetId: 'background-music-id',
   *     loop: true,
   *     fadeIn: 2,
   *     fadeOut: 3,
   *   },
   *   output: {
   *     format: 'mp4',
   *     quality: '1080p',
   *     filename: 'final-video.mp4',
   *   },
   *   webhookUrl: 'https://your-app.com/webhook',
   * });
   * console.log(`Merge job started: ${job.id}`);
   * ```
   */
  async createMergeJob(request: CreateMergeJobRequest): Promise<MergeJob> {
    const response = await this.http.post<MergeJob>("/cdn/video/merge", request);
    return this.convertMergeJobDates(response);
  }

  /**
   * Get a merge job by ID with output asset details
   *
   * @example
   * ```typescript
   * const job = await cdn.getMergeJob('job-id');
   * if (job.status === 'completed' && job.outputAsset) {
   *   console.log(`Output video: ${job.outputAsset.cdnUrl}`);
   * }
   * ```
   */
  async getMergeJob(jobId: string): Promise<MergeJobWithOutput> {
    const response = await this.http.get<MergeJobWithOutput>(`/cdn/video/merge/${jobId}`);
    return this.convertMergeJobWithOutputDates(response);
  }

  /**
   * List merge jobs with optional filters
   *
   * @example
   * ```typescript
   * const { jobs, total, hasMore } = await cdn.listMergeJobs({
   *   projectSlug: 'my-project',
   *   status: 'completed',
   *   limit: 20,
   * });
   * ```
   */
  async listMergeJobs(request: ListMergeJobsRequest): Promise<ListMergeJobsResponse> {
    const params = new URLSearchParams();
    params.set("projectSlug", request.projectSlug);
    if (request.status) params.set("status", request.status);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const response = await this.http.get<ListMergeJobsResponse>(`/cdn/video/merge?${params.toString()}`);
    return {
      ...response,
      jobs: response.jobs.map((job) => this.convertMergeJobDates(job)),
    };
  }

  /**
   * Cancel a pending or processing merge job
   *
   * @example
   * ```typescript
   * await cdn.cancelMergeJob('job-id');
   * console.log('Merge job cancelled');
   * ```
   */
  async cancelMergeJob(jobId: string): Promise<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`/cdn/video/merge/${jobId}/cancel`, {});
  }

  private convertMergeJobDates(job: MergeJob): MergeJob {
    if (typeof job.createdAt === "string") {
      job.createdAt = new Date(job.createdAt);
    }
    if (job.updatedAt && typeof job.updatedAt === "string") {
      job.updatedAt = new Date(job.updatedAt);
    }
    if (job.startedAt && typeof job.startedAt === "string") {
      job.startedAt = new Date(job.startedAt);
    }
    if (job.completedAt && typeof job.completedAt === "string") {
      job.completedAt = new Date(job.completedAt);
    }
    return job;
  }

  private convertMergeJobWithOutputDates(job: MergeJobWithOutput): MergeJobWithOutput {
    return this.convertMergeJobDates(job) as MergeJobWithOutput;
  }

  // ============================================================================
  // S3 Import Methods
  // ============================================================================

  /**
   * Create an S3 import job to bulk import files from an external S3 bucket.
   * Requires Pro plan or higher.
   *
   * @example
   * ```typescript
   * // Using IAM credentials
   * const job = await cdn.createImport({
   *   projectSlug: 'my-project',
   *   sourceBucket: 'my-external-bucket',
   *   sourceRegion: 'us-east-1',
   *   sourcePrefix: 'images/',
   *   authType: 'iam_credentials',
   *   accessKeyId: 'AKIA...',
   *   secretAccessKey: 'secret...',
   *   pathMode: 'flatten',
   *   notifyEmail: 'admin@example.com',
   * });
   *
   * // Using role assumption
   * const job = await cdn.createImport({
   *   projectSlug: 'my-project',
   *   sourceBucket: 'partner-bucket',
   *   sourceRegion: 'eu-west-1',
   *   authType: 'role_assumption',
   *   roleArn: 'arn:aws:iam::123456789012:role/Stack0ImportRole',
   *   externalId: 'optional-external-id',
   *   pathMode: 'preserve',
   *   targetFolder: '/imported',
   * });
   *
   * console.log(`Import job started: ${job.importId}`);
   * ```
   */
  async createImport(request: CreateImportRequest): Promise<CreateImportResponse> {
    const response = await this.http.post<CreateImportResponse>("/cdn/imports", request);
    return this.convertCreateImportDates(response);
  }

  /**
   * Get an import job by ID
   *
   * @example
   * ```typescript
   * const job = await cdn.getImport('import-id');
   * console.log(`Status: ${job.status}`);
   * console.log(`Progress: ${job.processedFiles}/${job.totalFiles} files`);
   * console.log(`Bytes: ${job.processedBytes}/${job.totalBytes}`);
   * ```
   */
  async getImport(importId: string): Promise<ImportJob | null> {
    const response = await this.http.get<ImportJob | null>(`/cdn/imports/${importId}`);
    return response ? this.convertImportJobDates(response) : null;
  }

  /**
   * List import jobs with pagination and filters
   *
   * @example
   * ```typescript
   * const { imports, total, hasMore } = await cdn.listImports({
   *   projectSlug: 'my-project',
   *   status: 'importing',
   *   limit: 20,
   * });
   *
   * for (const job of imports) {
   *   console.log(`${job.sourceBucket}: ${job.processedFiles}/${job.totalFiles}`);
   * }
   * ```
   */
  async listImports(request: ListImportsRequest): Promise<ListImportsResponse> {
    const params = new URLSearchParams();

    params.set("projectSlug", request.projectSlug);
    if (request.environment) params.set("environment", request.environment);
    if (request.status) params.set("status", request.status);
    if (request.sortBy) params.set("sortBy", request.sortBy);
    if (request.sortOrder) params.set("sortOrder", request.sortOrder);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const response = await this.http.get<ListImportsResponse>(`/cdn/imports?${params.toString()}`);

    return {
      ...response,
      imports: response.imports.map((job) => this.convertImportJobSummaryDates(job)),
    };
  }

  /**
   * Cancel a running import job
   *
   * Files already imported will remain. Only pending/validating/importing jobs can be cancelled.
   *
   * @example
   * ```typescript
   * const result = await cdn.cancelImport('import-id');
   * console.log(`Cancelled: ${result.success}`);
   * ```
   */
  async cancelImport(importId: string): Promise<CancelImportResponse> {
    return this.http.post<CancelImportResponse>(`/cdn/imports/${importId}/cancel`, {});
  }

  /**
   * Retry failed files in a completed or failed import job
   *
   * This resets failed files to pending and re-queues the import for processing.
   *
   * @example
   * ```typescript
   * const result = await cdn.retryImport('import-id');
   * console.log(`Retrying ${result.retriedCount} files`);
   * ```
   */
  async retryImport(importId: string): Promise<RetryImportResponse> {
    return this.http.post<RetryImportResponse>(`/cdn/imports/${importId}/retry`, {});
  }

  /**
   * List files in an import job with optional status filter
   *
   * @example
   * ```typescript
   * // List all files
   * const { files, total } = await cdn.listImportFiles({
   *   importId: 'import-id',
   *   limit: 100,
   * });
   *
   * // List only failed files
   * const { files: failedFiles } = await cdn.listImportFiles({
   *   importId: 'import-id',
   *   status: 'failed',
   * });
   *
   * for (const file of failedFiles) {
   *   console.log(`${file.sourceKey}: ${file.errorMessage}`);
   * }
   * ```
   */
  async listImportFiles(request: ListImportFilesRequest): Promise<ListImportFilesResponse> {
    const params = new URLSearchParams();

    if (request.status) params.set("status", request.status);
    if (request.sortBy) params.set("sortBy", request.sortBy);
    if (request.sortOrder) params.set("sortOrder", request.sortOrder);
    if (request.limit) params.set("limit", request.limit.toString());
    if (request.offset) params.set("offset", request.offset.toString());

    const query = params.toString();
    const response = await this.http.get<ListImportFilesResponse>(
      `/cdn/imports/${request.importId}/files${query ? `?${query}` : ""}`,
    );

    return {
      ...response,
      files: response.files.map((file) => this.convertImportFileDates(file)),
    };
  }

  private convertCreateImportDates(response: CreateImportResponse): CreateImportResponse {
    if (typeof response.createdAt === "string") {
      response.createdAt = new Date(response.createdAt);
    }
    return response;
  }

  private convertImportJobDates(job: ImportJob): ImportJob {
    if (typeof job.createdAt === "string") {
      job.createdAt = new Date(job.createdAt);
    }
    if (job.updatedAt && typeof job.updatedAt === "string") {
      job.updatedAt = new Date(job.updatedAt);
    }
    if (job.startedAt && typeof job.startedAt === "string") {
      job.startedAt = new Date(job.startedAt);
    }
    if (job.completedAt && typeof job.completedAt === "string") {
      job.completedAt = new Date(job.completedAt);
    }
    return job;
  }

  private convertImportJobSummaryDates(job: ImportJobSummary): ImportJobSummary {
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

  private convertImportFileDates(file: ImportFile): ImportFile {
    if (typeof file.createdAt === "string") {
      file.createdAt = new Date(file.createdAt);
    }
    if (file.completedAt && typeof file.completedAt === "string") {
      file.completedAt = new Date(file.completedAt);
    }
    if (file.lastAttemptAt && typeof file.lastAttemptAt === "string") {
      file.lastAttemptAt = new Date(file.lastAttemptAt);
    }
    return file;
  }
}
