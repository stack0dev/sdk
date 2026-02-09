# Stack0 SDK

Official TypeScript/JavaScript SDK for Stack0 services.

## Installation

```bash
npm install @stack0/sdk
# or
yarn add @stack0/sdk
# or
pnpm add @stack0/sdk
# or
bun add @stack0/sdk
```

## Quick Start

```typescript
import { Stack0 } from '@stack0/sdk';

const stack0 = new Stack0({
  apiKey: 'stack0_...',
});

// Send an email
const email = await stack0.mail.send({
  from: 'noreply@example.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello World</h1>',
});

// Upload a file to CDN
const asset = await stack0.cdn.upload({
  projectSlug: 'my-project',
  file: fileBuffer,
  filename: 'image.jpg',
  mimeType: 'image/jpeg',
});

console.log(asset.cdnUrl); // https://cdn.stack0.com/...
```

## Configuration

```typescript
import { Stack0 } from '@stack0/sdk';

const stack0 = new Stack0({
  apiKey: 'stack0_...', // Required: Your API key
  baseUrl: 'https://api.stack0.dev/v1', // Optional: Custom API endpoint
  cdnUrl: 'https://cdn.yourproject.stack0.dev', // Optional: For client-side image transforms
});
```

## CDN API

Upload, manage, and transform assets with the CDN API.

### Upload File

```typescript
// Simple upload (handles presigned URL flow automatically)
const asset = await stack0.cdn.upload({
  projectSlug: 'my-project',
  file: fileBuffer, // Blob, Buffer, or ArrayBuffer
  filename: 'photo.jpg',
  mimeType: 'image/jpeg',
  folder: '/images/avatars', // Optional
  metadata: { userId: 'user_123' }, // Optional
});

console.log(asset.id); // Asset ID
console.log(asset.cdnUrl); // CDN URL
console.log(asset.status); // 'ready', 'processing', etc.
```

### Manual Upload Flow

For more control, use the presigned URL flow:

```typescript
// 1. Get presigned upload URL
const { uploadUrl, assetId } = await stack0.cdn.getUploadUrl({
  projectSlug: 'my-project',
  filename: 'document.pdf',
  mimeType: 'application/pdf',
  size: file.size,
});

// 2. Upload directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'application/pdf' },
});

// 3. Confirm upload
const asset = await stack0.cdn.confirmUpload(assetId);
```

### List Assets

```typescript
const { assets, total, hasMore } = await stack0.cdn.list({
  projectSlug: 'my-project',
  type: 'image', // Optional: 'image', 'video', 'audio', 'document', 'other'
  folder: '/images', // Optional
  status: 'ready', // Optional
  search: 'avatar', // Optional: search in filename
  tags: ['profile'], // Optional
  sortBy: 'createdAt', // Optional: 'createdAt', 'filename', 'size', 'type'
  sortOrder: 'desc', // Optional: 'asc', 'desc'
  limit: 20, // Optional
  offset: 0, // Optional
});

for (const asset of assets) {
  console.log(asset.filename, asset.cdnUrl);
}
```

### Get Asset

```typescript
const asset = await stack0.cdn.get('asset-id');

console.log(asset.filename);
console.log(asset.size);
console.log(asset.mimeType);
console.log(asset.width, asset.height); // For images/videos
```

### Update Asset

```typescript
const asset = await stack0.cdn.update({
  id: 'asset-id',
  filename: 'new-name.jpg', // Optional
  folder: '/images/archived', // Optional
  tags: ['nature', 'sunset'], // Optional
  alt: 'A beautiful sunset', // Optional
  metadata: { category: 'landscape' }, // Optional
});
```

### Delete Assets

```typescript
// Delete single asset
await stack0.cdn.delete('asset-id');

// Delete multiple assets
const { deletedCount } = await stack0.cdn.deleteMany([
  'asset-1',
  'asset-2',
  'asset-3',
]);
```

### Move Assets

```typescript
await stack0.cdn.move({
  assetIds: ['asset-1', 'asset-2'],
  folder: '/images/archive', // Use null for root folder
});
```

### Image Transformations

Generate optimized and transformed image URLs client-side (no API call):

```typescript
// Using asset's cdnUrl directly (recommended)
const url = stack0.cdn.getTransformUrl(asset.cdnUrl, {
  width: 800,
  height: 600,
  fit: 'cover', // 'cover', 'contain', 'fill', 'inside', 'outside'
  format: 'webp', // 'webp', 'jpeg', 'png', 'avif', 'auto'
  quality: 80,
});

// Or using s3Key when cdnUrl is configured in Stack0 options
const url = stack0.cdn.getTransformUrl(asset.s3Key, { width: 400 });

// Use in <img> tag
// <img src={url} alt="Optimized image" />
```

Advanced transform options:

```typescript
const url = stack0.cdn.getTransformUrl(asset.cdnUrl, {
  width: 800,
  height: 600,
  fit: 'cover',
  format: 'webp',
  quality: 80,
  crop: 'attention', // Smart crop: 'attention', 'entropy', 'center', etc.
  blur: 5, // Blur sigma (0.3-100)
  sharpen: 1.5, // Sharpen sigma
  brightness: 10, // -100 to 100
  saturation: -50, // -100 to 100
  grayscale: true, // Convert to grayscale
  rotate: 90, // 0, 90, 180, 270
  flip: true, // Flip vertically
  flop: true, // Flip horizontally
});
```

### Folders

```typescript
// Get folder tree
const tree = await stack0.cdn.getFolderTree({
  projectSlug: 'my-project',
  maxDepth: 3,
});

// Create folder
const folder = await stack0.cdn.createFolder({
  projectSlug: 'my-project',
  name: 'avatars',
  parentId: 'parent-folder-id', // Optional
});

// Delete folder
await stack0.cdn.deleteFolder('folder-id');
await stack0.cdn.deleteFolder('folder-id', true); // Delete with contents
```

### Video Transcoding

Transcode videos into HLS adaptive streaming or MP4 formats for optimal playback.

```typescript
// Start a transcoding job
const job = await stack0.cdn.transcode({
  projectSlug: 'my-project',
  assetId: 'video-asset-id',
  outputFormat: 'hls', // 'hls' for adaptive streaming, 'mp4' for progressive download
  variants: [
    { quality: '720p', codec: 'h264' },
    { quality: '1080p', codec: 'h264' },
  ],
  webhookUrl: 'https://your-app.com/webhook', // Optional: get notified when complete
});

console.log(`Job started: ${job.id}, Status: ${job.status}`);
```

### Check Job Status

```typescript
// Get job by ID
const job = await stack0.cdn.getJob('job-id');
console.log(`Status: ${job.status}, Progress: ${job.progress}%`);

// List all jobs
const { jobs, total } = await stack0.cdn.listJobs({
  projectSlug: 'my-project',
  status: 'processing', // Optional filter
  limit: 20,
});

// Cancel a pending/processing job
await stack0.cdn.cancelJob('job-id');
```

### Get Streaming URLs

```typescript
const urls = await stack0.cdn.getStreamingUrls('asset-id');

// HLS URL for adaptive streaming (recommended)
console.log(`HLS Master Playlist: ${urls.hlsUrl}`);

// MP4 URLs for direct download
for (const mp4 of urls.mp4Urls) {
  console.log(`${mp4.quality}: ${mp4.url}`);
}

// Thumbnails
for (const thumb of urls.thumbnails) {
  console.log(`Thumbnail at ${thumb.timestamp}s: ${thumb.url}`);
}
```

### Generate Thumbnails

```typescript
const thumbnail = await stack0.cdn.getThumbnail({
  assetId: 'video-asset-id',
  timestamp: 10.5, // 10.5 seconds into the video
  width: 320, // Optional: resize
  format: 'webp', // 'jpg', 'png', 'webp'
});

console.log(`Thumbnail URL: ${thumbnail.url}`);
```

### Extract Audio

```typescript
const { jobId, status } = await stack0.cdn.extractAudio({
  projectSlug: 'my-project',
  assetId: 'video-asset-id',
  format: 'mp3', // 'mp3', 'aac', 'wav'
  bitrate: 192, // Optional: kbps
});
```

### Video Playback with HLS.js

```typescript
import Hls from 'hls.js';

const urls = await stack0.cdn.getStreamingUrls('asset-id');

const video = document.getElementById('video');
if (Hls.isSupported() && urls.hlsUrl) {
  const hls = new Hls();
  hls.loadSource(urls.hlsUrl);
  hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  // Safari native HLS support
  video.src = urls.hlsUrl;
}
```

## Mail API

The Mail API is compatible with the Resend API for easy migration.

### Send Email

```typescript
// Simple email
await stack0.mail.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Welcome to Stack0!</p>',
});

// With multiple recipients
await stack0.mail.send({
  from: 'hello@example.com',
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Newsletter',
  html: '<p>Monthly update</p>',
});

// With name and email
await stack0.mail.send({
  from: { name: 'Acme Inc', email: 'noreply@acme.com' },
  to: { name: 'John Doe', email: 'john@example.com' },
  subject: 'Important Update',
  html: '<p>Your account has been updated</p>',
});

// With CC and BCC
await stack0.mail.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  cc: 'manager@example.com',
  bcc: ['audit@example.com', 'compliance@example.com'],
  subject: 'Team Update',
  html: '<p>Quarterly results</p>',
});

// With plain text alternative
await stack0.mail.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Welcome!</h1><p>Thanks for joining</p>',
  text: 'Welcome! Thanks for joining',
});

// With tags and metadata
await stack0.mail.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  subject: 'Order Confirmation',
  html: '<p>Your order #12345 is confirmed</p>',
  tags: ['transactional', 'order'],
  metadata: {
    orderId: '12345',
    customerId: 'cus_abc123',
  },
});

// With template
await stack0.mail.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  subject: 'Welcome {{name}}',
  templateId: 'template-uuid',
  templateVariables: {
    name: 'John',
    activationUrl: 'https://example.com/activate?token=...',
  },
});

// With attachments
await stack0.mail.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  subject: 'Invoice',
  html: '<p>Your invoice is attached</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: 'base64-encoded-content',
      contentType: 'application/pdf',
    },
  ],
});
```

### Get Email

Retrieve details about a sent email:

```typescript
const email = await stack0.mail.get('email-id-uuid');

console.log(email.status); // 'sent', 'delivered', 'bounced', etc.
console.log(email.openedAt); // Date or null
console.log(email.deliveredAt); // Date or null
```

## Error Handling

```typescript
try {
  await stack0.mail.send({
    from: 'hello@example.com',
    to: 'user@example.com',
    subject: 'Test',
    html: '<p>Test</p>',
  });
} catch (error) {
  if (error.statusCode === 401) {
    console.error('Invalid API key');
  } else if (error.statusCode === 403) {
    console.error('Insufficient permissions');
  } else if (error.statusCode === 400) {
    console.error('Validation error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  // Mail types
  SendEmailRequest,
  SendEmailResponse,
  // CDN types
  Asset,
  UploadUrlRequest,
  ListAssetsRequest,
  TransformOptions,
} from '@stack0/sdk';
```

## Environment Variables

For security, store your API key in environment variables:

```typescript
const stack0 = new Stack0({
  apiKey: process.env.STACK0_API_KEY!,
});
```

## Migration from Resend

Stack0 Mail API is designed to be compatible with Resend:

```typescript
// Before (Resend)
import { Resend } from 'resend';
const resend = new Resend('re_...');
await resend.emails.send({ ... });

// After (Stack0)
import { Stack0 } from '@stack0/sdk';
const stack0 = new Stack0({ apiKey: 'stack0_...' });
await stack0.mail.send({ ... });
```

## Screenshots API

Capture high-quality screenshots of any webpage.

### Basic Screenshot

```typescript
// Capture a screenshot and wait for completion
const screenshot = await stack0.screenshots.captureAndWait({
  url: 'https://example.com',
  format: 'png',
  fullPage: true,
  blockAds: true,
});

console.log(screenshot.imageUrl);
console.log(screenshot.imageWidth, screenshot.imageHeight);
```

### Screenshot Options

```typescript
const screenshot = await stack0.screenshots.captureAndWait({
  url: 'https://example.com',
  format: 'png', // 'png' | 'jpeg' | 'webp' | 'pdf'
  quality: 90, // JPEG/WebP quality
  fullPage: true,
  deviceType: 'desktop', // 'desktop' | 'tablet' | 'mobile'
  viewportWidth: 1280,
  viewportHeight: 720,
  // Block unwanted elements
  blockAds: true,
  blockCookieBanners: true,
  blockChatWidgets: true,
  // Wait for content
  waitForSelector: '.main-content',
  waitForTimeout: 2000,
  // Custom headers/cookies for auth
  headers: { 'Authorization': 'Bearer token' },
  cookies: [{ name: 'session', value: 'abc123' }],
});
```

### Batch Screenshots

```typescript
const job = await stack0.screenshots.batchAndWait({
  urls: ['https://example.com', 'https://example.org'],
  config: { format: 'png', fullPage: true },
});

console.log(`Success: ${job.successfulUrls}, Failed: ${job.failedUrls}`);
```

## Extraction API

Extract structured data from any webpage using AI.

### Basic Extraction

```typescript
// Extract content as markdown
const extraction = await stack0.extraction.extractAndWait({
  url: 'https://example.com/article',
  mode: 'markdown',
  includeMetadata: true,
});

console.log(extraction.markdown);
console.log(extraction.pageMetadata?.title);
```

### Schema-Based Extraction

```typescript
// Extract structured data using a JSON schema
const extraction = await stack0.extraction.extractAndWait({
  url: 'https://example.com/product',
  mode: 'schema',
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      price: { type: 'number' },
      description: { type: 'string' },
    },
    required: ['name', 'price'],
  },
});

console.log(extraction.extractedData);
// { name: 'Product Name', price: 29.99, description: '...' }
```

### Extraction Modes

- `markdown`: AI-cleaned markdown content
- `schema`: Structured data matching your schema
- `auto`: AI determines best extraction
- `raw`: Raw HTML content

## Support

- Documentation: https://docs.stack0.com
- Issues: https://github.com/CampbellVentures/stack0/issues
- Email: support@stack0.com

## License

MIT
