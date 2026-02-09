# Stack0 SDK

Official TypeScript/JavaScript SDK for [Stack0](https://stack0.dev) -- a modular platform for email, CDN, screenshots, web extraction, integrations, marketing, and AI workflows.

- **Fully typed** -- written in TypeScript with complete type definitions
- **Zero dependencies** -- uses the native `fetch` API
- **Tree-shakable** -- import only the modules you need
- **Isomorphic** -- works in Node.js, Bun, Deno, and edge runtimes

[Full API Reference](https://stack0.dev/docs)

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
  apiKey: process.env.STACK0_API_KEY!,
});

// Send an email
await stack0.mail.send({
  from: 'hello@yourapp.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello World</h1>',
});

// Upload a file to CDN
const asset = await stack0.cdn.upload({
  projectSlug: 'my-project',
  file: fileBuffer,
  filename: 'photo.jpg',
  mimeType: 'image/jpeg',
});

// Capture a screenshot
const screenshot = await stack0.screenshots.captureAndWait({
  url: 'https://example.com',
  format: 'png',
  fullPage: true,
});

// Extract structured data from a page
const result = await stack0.extraction.extractAndWait({
  url: 'https://example.com/article',
  mode: 'markdown',
});

// Run an AI workflow
const run = await stack0.workflows.runAndWait({
  workflowSlug: 'content-pipeline',
  variables: { topic: 'AI trends' },
});
```

## Configuration

```typescript
const stack0 = new Stack0({
  apiKey: 'stack0_...',            // Required -- your API key
  baseUrl: 'https://api.stack0.dev/v1', // Optional -- custom API endpoint
  cdnUrl: 'https://cdn.myproject.stack0.dev', // Optional -- for client-side image transforms
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | -- | Your Stack0 API key (required) |
| `baseUrl` | `string` | `https://api.stack0.dev/v1` | API base URL |
| `cdnUrl` | `string` | -- | CDN base URL for client-side image transform URLs |

## Modules

The SDK is organized into modules, each accessible as a property on the main `Stack0` client:

| Module | Accessor | Description |
|--------|----------|-------------|
| [Mail](#mail) | `stack0.mail` | Transactional email, campaigns, sequences, contacts |
| [CDN](#cdn) | `stack0.cdn` | File upload, asset management, image transforms, video |
| [Screenshots](#screenshots) | `stack0.screenshots` | Webpage screenshot capture |
| [Extraction](#extraction) | `stack0.extraction` | AI-powered web data extraction |
| [Integrations](#integrations) | `stack0.integrations` | Unified CRM, storage, communication APIs |
| [Marketing](#marketing) | `stack0.marketing` | Trend discovery, content generation, scheduling |
| [Workflows](#workflows) | `stack0.workflows` | AI workflow orchestration |

---

## Mail

Send transactional emails, manage domains, templates, contacts, campaigns, and automated sequences. The Mail API is designed to be compatible with the [Resend](https://resend.com) API for easy migration.

### Sending Emails

```typescript
// Simple email
const { id } = await stack0.mail.send({
  from: 'hello@yourapp.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello World</h1>',
});

// With name, CC, BCC, reply-to, and attachments
await stack0.mail.send({
  from: { name: 'Acme Inc', email: 'noreply@acme.com' },
  to: { name: 'Jane Doe', email: 'jane@example.com' },
  cc: 'manager@example.com',
  bcc: ['audit@example.com'],
  replyTo: 'support@acme.com',
  subject: 'Invoice #1234',
  html: '<p>Your invoice is attached.</p>',
  text: 'Your invoice is attached.',
  tags: ['transactional', 'invoice'],
  metadata: { orderId: '1234' },
  attachments: [
    {
      filename: 'invoice.pdf',
      content: 'base64-encoded-content',
      contentType: 'application/pdf',
    },
  ],
});

// Using a template
await stack0.mail.send({
  from: 'hello@yourapp.com',
  to: 'user@example.com',
  subject: 'Welcome {{name}}',
  templateId: 'template-uuid',
  templateVariables: { name: 'Jane', activationUrl: 'https://...' },
});

// Batch send (up to 100 emails, each with different content)
await stack0.mail.sendBatch({
  emails: [
    { from: 'hi@app.com', to: 'user1@example.com', subject: 'Hi', html: '<p>Hello User 1</p>' },
    { from: 'hi@app.com', to: 'user2@example.com', subject: 'Hi', html: '<p>Hello User 2</p>' },
  ],
});

// Broadcast (same content to up to 1000 recipients)
await stack0.mail.sendBroadcast({
  from: 'newsletter@app.com',
  to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Monthly Update',
  html: '<p>Here is what happened this month...</p>',
});
```

### Retrieving and Managing Emails

```typescript
// Get email details
const email = await stack0.mail.get('email-id');
console.log(email.status);      // 'delivered', 'bounced', etc.
console.log(email.openedAt);    // Date or null
console.log(email.deliveredAt); // Date or null

// List emails with filters
const { emails, total } = await stack0.mail.list({
  status: 'delivered',
  from: 'hello@yourapp.com',
  startDate: '2024-01-01',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  limit: 50,
});

// Resend or cancel
await stack0.mail.resend('email-id');
await stack0.mail.cancel('scheduled-email-id');
```

### Analytics

```typescript
const analytics = await stack0.mail.getAnalytics();
console.log(`Delivery rate: ${analytics.deliveryRate}%`);
console.log(`Open rate: ${analytics.openRate}%`);

const timeSeries = await stack0.mail.getTimeSeriesAnalytics({ days: 30 });
const hourly = await stack0.mail.getHourlyAnalytics();
const senders = await stack0.mail.listSenders({ search: '@yourapp.com' });
```

### Sub-clients

The mail module exposes several sub-clients for managing related resources:

#### Domains

```typescript
// Add and verify a sending domain
const { dnsRecords } = await stack0.mail.domains.add({ domain: 'yourapp.com' });
// Configure DNS records, then verify
const { verified } = await stack0.mail.domains.verify('domain-id');

// List, get DNS records, delete, set default
const domains = await stack0.mail.domains.list({ projectSlug: 'my-project' });
const dns = await stack0.mail.domains.getDNSRecords('domain-id');
await stack0.mail.domains.setDefault('domain-id');
await stack0.mail.domains.delete('domain-id');
```

#### Templates

```typescript
const template = await stack0.mail.templates.create({
  name: 'Welcome Email',
  slug: 'welcome',
  subject: 'Welcome {{name}}!',
  html: '<h1>Hello {{name}}</h1>',
});

const { templates } = await stack0.mail.templates.list({ search: 'welcome' });
const found = await stack0.mail.templates.getBySlug('welcome');
const preview = await stack0.mail.templates.preview({ id: template.id, variables: { name: 'Jane' } });
```

#### Contacts and Audiences

```typescript
// Create and manage contacts
const contact = await stack0.mail.contacts.create({
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  metadata: { plan: 'pro' },
});

// Bulk import contacts
const importResult = await stack0.mail.contacts.import({
  audienceId: 'audience-id',
  contacts: [
    { email: 'user1@example.com', firstName: 'Alice' },
    { email: 'user2@example.com', firstName: 'Bob' },
  ],
});

// Create audiences and add contacts
const audience = await stack0.mail.audiences.create({
  name: 'Newsletter Subscribers',
  description: 'Users opted in to the newsletter',
});
await stack0.mail.audiences.addContacts({ id: audience.id, contactIds: [contact.id] });
```

#### Campaigns

```typescript
const campaign = await stack0.mail.campaigns.create({
  name: 'Product Launch',
  subject: 'Introducing our new feature!',
  fromEmail: 'hello@yourapp.com',
  audienceId: 'audience-id',
  html: '<p>We are excited to announce...</p>',
});

await stack0.mail.campaigns.send({ id: campaign.id, sendNow: true });
const stats = await stack0.mail.campaigns.getStats(campaign.id);
console.log(`Open rate: ${stats.openRate}%`);
```

#### Sequences

Build automated email flows with a visual node-based editor:

```typescript
const sequence = await stack0.mail.sequences.create({
  name: 'Onboarding Flow',
  triggerType: 'contact_added',
  triggerFrequency: 'once',
});

// Add nodes and connections
const emailNode = await stack0.mail.sequences.createNode({
  id: sequence.id,
  nodeType: 'email',
  name: 'Welcome Email',
  positionX: 200,
  positionY: 100,
});

await stack0.mail.sequences.setNodeEmail(sequence.id, {
  nodeId: emailNode.id,
  subject: 'Welcome!',
  html: '<p>Thanks for signing up.</p>',
});

await stack0.mail.sequences.publish(sequence.id);
```

#### Events

Track custom events that can trigger sequences:

```typescript
await stack0.mail.events.track({
  eventName: 'purchase_completed',
  contactEmail: 'user@example.com',
  properties: { orderId: '12345', amount: 99.99 },
});

// Batch tracking
await stack0.mail.events.trackBatch({
  events: [
    { eventName: 'page_viewed', contactEmail: 'user1@example.com', properties: { page: '/pricing' } },
    { eventName: 'page_viewed', contactEmail: 'user2@example.com', properties: { page: '/features' } },
  ],
});
```

### Mail Method Reference

| Method | Description |
|--------|-------------|
| `mail.send(req)` | Send a single email |
| `mail.sendBatch(req)` | Send up to 100 emails in a batch |
| `mail.sendBroadcast(req)` | Broadcast to up to 1000 recipients |
| `mail.get(id)` | Get email by ID |
| `mail.list(req?)` | List emails with filters |
| `mail.resend(id)` | Resend an email |
| `mail.cancel(id)` | Cancel a scheduled email |
| `mail.getAnalytics()` | Get overall email analytics |
| `mail.getTimeSeriesAnalytics(req?)` | Get daily analytics breakdown |
| `mail.getHourlyAnalytics()` | Get hourly analytics |
| `mail.listSenders(req?)` | List unique senders with stats |
| `mail.domains.*` | Domain management (list, add, verify, delete, setDefault, getDNSRecords) |
| `mail.templates.*` | Template CRUD + preview and getBySlug |
| `mail.audiences.*` | Audience CRUD + addContacts, removeContacts, listContacts |
| `mail.contacts.*` | Contact CRUD + import |
| `mail.campaigns.*` | Campaign CRUD + send, pause, cancel, duplicate, getStats |
| `mail.sequences.*` | Sequence CRUD + node/connection management + publish/pause/resume/archive |
| `mail.events.*` | Event CRUD + track, trackBatch, listOccurrences, getAnalytics |

---

## CDN

Upload, manage, and transform files. Supports images, video transcoding, private files, download bundles, and S3 imports.

### Uploading Files

```typescript
// Simple upload (handles presigned URL flow automatically)
const asset = await stack0.cdn.upload({
  projectSlug: 'my-project',
  file: fileBuffer, // Blob, Buffer, or ArrayBuffer
  filename: 'photo.jpg',
  mimeType: 'image/jpeg',
  folder: '/images/avatars',
  metadata: { userId: 'user_123' },
});

console.log(asset.id);      // Asset ID
console.log(asset.cdnUrl);  // Public CDN URL

// Manual presigned URL flow for more control
const { uploadUrl, assetId } = await stack0.cdn.getUploadUrl({
  projectSlug: 'my-project',
  filename: 'document.pdf',
  mimeType: 'application/pdf',
  size: file.size,
});

await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': 'application/pdf' } });
const confirmed = await stack0.cdn.confirmUpload(assetId);
```

### Asset Management

```typescript
// Get, update, delete
const asset = await stack0.cdn.get('asset-id');
await stack0.cdn.update({ id: 'asset-id', alt: 'Sunset photo', tags: ['nature'] });
await stack0.cdn.delete('asset-id');
await stack0.cdn.deleteMany(['asset-1', 'asset-2']);

// List with filters
const { assets, total, hasMore } = await stack0.cdn.list({
  projectSlug: 'my-project',
  type: 'image',
  folder: '/images',
  search: 'avatar',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  limit: 20,
});

// Move assets between folders
await stack0.cdn.move({ assetIds: ['asset-1', 'asset-2'], folder: '/archive' });
```

### Image Transformations

Generate optimized image URLs client-side (no API call required):

```typescript
const url = stack0.cdn.getTransformUrl(asset.cdnUrl, {
  width: 800,
  height: 600,
  fit: 'cover',
  format: 'webp',
  quality: 80,
});

// Advanced transforms
const advancedUrl = stack0.cdn.getTransformUrl(asset.cdnUrl, {
  width: 400,
  crop: 'attention', // Smart crop: 'attention', 'entropy', 'center'
  blur: 5,
  sharpen: 1.5,
  brightness: 10,
  saturation: -50,
  grayscale: true,
  rotate: 90,
  flip: true,
  flop: true,
});
```

| Transform | Type | Description |
|-----------|------|-------------|
| `width` | `number` | Target width (snapped to nearest allowed width for caching) |
| `height` | `number` | Target height |
| `fit` | `string` | `cover`, `contain`, `fill`, `inside`, `outside` |
| `format` | `string` | `webp`, `jpeg`, `png`, `avif`, `auto` |
| `quality` | `number` | Output quality (1-100) |
| `crop` | `string` | Smart crop strategy: `attention`, `entropy`, `center` |
| `blur` | `number` | Gaussian blur sigma (0.3-100) |
| `sharpen` | `number` | Sharpen sigma |
| `brightness` | `number` | -100 to 100 |
| `saturation` | `number` | -100 to 100 |
| `grayscale` | `boolean` | Convert to grayscale |
| `rotate` | `number` | 0, 90, 180, 270 |
| `flip` | `boolean` | Flip vertically |
| `flop` | `boolean` | Flip horizontally |

### Folders

```typescript
const tree = await stack0.cdn.getFolderTree({ projectSlug: 'my-project', maxDepth: 3 });
const folder = await stack0.cdn.createFolder({ projectSlug: 'my-project', name: 'avatars' });
const byPath = await stack0.cdn.getFolderByPath('/images/avatars');
await stack0.cdn.updateFolder({ id: folder.id, name: 'profile-pictures' });
await stack0.cdn.moveFolder({ id: folder.id, newParentId: 'other-folder-id' });
await stack0.cdn.deleteFolder(folder.id, true); // true = delete contents
```

### Video Transcoding

```typescript
// Start a transcoding job
const job = await stack0.cdn.transcode({
  projectSlug: 'my-project',
  assetId: 'video-asset-id',
  outputFormat: 'hls',
  variants: [
    { quality: '720p', codec: 'h264' },
    { quality: '1080p', codec: 'h264' },
  ],
  webhookUrl: 'https://your-app.com/webhook',
});

// Check job status
const status = await stack0.cdn.getJob(job.id);
console.log(`Progress: ${status.progress}%`);

// Get streaming URLs for playback
const urls = await stack0.cdn.getStreamingUrls('asset-id');
console.log(urls.hlsUrl);

// Generate thumbnails
const thumb = await stack0.cdn.getThumbnail({
  assetId: 'video-asset-id',
  timestamp: 10.5,
  width: 320,
  format: 'webp',
});

// Extract audio
const { jobId } = await stack0.cdn.extractAudio({
  projectSlug: 'my-project',
  assetId: 'video-asset-id',
  format: 'mp3',
  bitrate: 192,
});
```

### GIF Generation

```typescript
const gif = await stack0.cdn.generateGif({
  projectSlug: 'my-project',
  assetId: 'video-asset-id',
  startTime: 5,
  duration: 3,
  width: 480,
  fps: 10,
});

// Poll for completion
let result = await stack0.cdn.getGif(gif.id);
while (result?.status === 'pending' || result?.status === 'processing') {
  await new Promise(r => setTimeout(r, 1000));
  result = await stack0.cdn.getGif(gif.id);
}
console.log(result?.url);
```

### Video Merge

```typescript
const mergeJob = await stack0.cdn.createMergeJob({
  projectSlug: 'my-project',
  inputs: [
    { assetId: 'intro-video-id' },
    { assetId: 'image-id', duration: 5 },
    { assetId: 'main-video-id', startTime: 10, endTime: 60 },
  ],
  audioTrack: { assetId: 'music-id', loop: true, fadeIn: 2, fadeOut: 3 },
  output: { format: 'mp4', quality: '1080p', filename: 'final.mp4' },
});
```

### Private Files

Private files are stored securely and can only be accessed through authorized, time-limited download URLs.

```typescript
// Upload a private file
const privateFile = await stack0.cdn.uploadPrivate({
  projectSlug: 'my-project',
  file: fileBuffer,
  filename: 'confidential.pdf',
  mimeType: 'application/pdf',
});

// Generate a time-limited download URL
const { downloadUrl, expiresAt } = await stack0.cdn.getPrivateDownloadUrl({
  fileId: privateFile.id,
  expiresIn: 86400, // 24 hours in seconds
});
```

### Download Bundles

```typescript
const { bundle } = await stack0.cdn.createBundle({
  projectSlug: 'my-project',
  name: 'December Assets',
  assetIds: ['asset-1', 'asset-2'],
  privateFileIds: ['file-1'],
  expiresIn: 86400,
});

const { downloadUrl } = await stack0.cdn.getBundleDownloadUrl({
  bundleId: bundle.id,
  expiresIn: 3600,
});
```

### Usage Tracking

```typescript
const usage = await stack0.cdn.getUsage({ projectSlug: 'my-project' });
console.log(`Bandwidth: ${usage.bandwidthFormatted}`);

const history = await stack0.cdn.getUsageHistory({ projectSlug: 'my-project', days: 30 });
const breakdown = await stack0.cdn.getStorageBreakdown({ projectSlug: 'my-project', groupBy: 'type' });
```

---

## Screenshots

Capture high-quality screenshots of any webpage with options for format, viewport, device emulation, and more.

### Basic Capture

```typescript
// Capture and wait for the result (recommended for most use cases)
const screenshot = await stack0.screenshots.captureAndWait({
  url: 'https://example.com',
  format: 'png',
  fullPage: true,
  blockAds: true,
  blockCookieBanners: true,
});

console.log(screenshot.imageUrl);
console.log(screenshot.imageWidth, screenshot.imageHeight);
```

### Capture Options

```typescript
const screenshot = await stack0.screenshots.captureAndWait({
  url: 'https://example.com',
  format: 'png',              // 'png' | 'jpeg' | 'webp' | 'pdf'
  quality: 90,                // JPEG/WebP quality (1-100)
  fullPage: true,             // Capture entire scrollable page
  deviceType: 'desktop',      // 'desktop' | 'tablet' | 'mobile'
  viewportWidth: 1280,
  viewportHeight: 720,
  blockAds: true,
  blockCookieBanners: true,
  blockChatWidgets: true,
  waitForSelector: '.main-content',
  waitForTimeout: 2000,       // Wait ms after page load
  darkMode: true,
  hideSelectors: ['.popup', '.banner'],
  customCss: 'body { background: white; }',
  customJs: 'document.querySelector(".modal")?.remove()',
  headers: { 'Authorization': 'Bearer token' },
  cookies: [{ name: 'session', value: 'abc123' }],
  clip: { x: 0, y: 0, width: 800, height: 600 },
  cacheKey: 'homepage-v2',
  cacheTtl: 3600,
  webhookUrl: 'https://your-app.com/webhook',
  webhookSecret: 'secret',
});
```

### Async Capture (Manual Polling)

```typescript
const { id } = await stack0.screenshots.capture({
  url: 'https://example.com',
  format: 'png',
});

// Poll for completion
const screenshot = await stack0.screenshots.get({ id });
if (screenshot.status === 'completed') {
  console.log(screenshot.imageUrl);
}
```

### Batch Screenshots

```typescript
// Capture multiple URLs and wait for all to complete
const job = await stack0.screenshots.batchAndWait({
  urls: ['https://example.com', 'https://example.org'],
  config: { format: 'png', fullPage: true },
});

console.log(`Processed: ${job.processedUrls}/${job.totalUrls}`);
```

### Scheduled Screenshots

```typescript
const { id } = await stack0.screenshots.createSchedule({
  name: 'Daily homepage capture',
  url: 'https://example.com',
  frequency: 'daily',
  config: { format: 'png', fullPage: true },
});

await stack0.screenshots.toggleSchedule({ id }); // Toggle on/off
```

### Screenshots Method Reference

| Method | Description |
|--------|-------------|
| `capture(req)` | Start a screenshot capture |
| `get(req)` | Get screenshot by ID |
| `list(req?)` | List screenshots with filters |
| `delete(req)` | Delete a screenshot |
| `captureAndWait(req, opts?)` | Capture and poll until complete |
| `batch(req)` | Start a batch capture job |
| `getBatchJob(req)` | Get batch job status |
| `listBatchJobs(req?)` | List batch jobs |
| `cancelBatchJob(req)` | Cancel a batch job |
| `batchAndWait(req, opts?)` | Batch capture and poll until complete |
| `createSchedule(req)` | Create a recurring capture schedule |
| `updateSchedule(req)` | Update a schedule |
| `getSchedule(req)` | Get a schedule |
| `listSchedules(req?)` | List schedules |
| `deleteSchedule(req)` | Delete a schedule |
| `toggleSchedule(req)` | Toggle a schedule on/off |

---

## Extraction

Extract structured data from any webpage using AI. Supports markdown, JSON schema, and raw HTML extraction modes.

### Markdown Extraction

```typescript
const result = await stack0.extraction.extractAndWait({
  url: 'https://example.com/article',
  mode: 'markdown',
  includeMetadata: true,
});

console.log(result.markdown);
console.log(result.pageMetadata?.title);
console.log(result.pageMetadata?.description);
```

### Schema-Based Extraction

Extract structured data that matches a JSON schema:

```typescript
const result = await stack0.extraction.extractAndWait({
  url: 'https://example.com/product',
  mode: 'schema',
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      price: { type: 'number' },
      description: { type: 'string' },
      inStock: { type: 'boolean' },
    },
    required: ['name', 'price'],
  },
});

console.log(result.extractedData);
// { name: 'Product X', price: 29.99, description: '...', inStock: true }
```

### Extraction Modes

| Mode | Description |
|------|-------------|
| `markdown` | AI-cleaned markdown content |
| `schema` | Structured data matching a provided JSON schema |
| `auto` | AI determines the best extraction strategy |
| `raw` | Raw HTML content |

### Batch Extraction

```typescript
const job = await stack0.extraction.batchAndWait({
  urls: [
    'https://example.com/article-1',
    'https://example.com/article-2',
  ],
  config: { mode: 'markdown' },
});
```

### Scheduled Extraction

```typescript
const { id } = await stack0.extraction.createSchedule({
  name: 'Daily price monitor',
  url: 'https://competitor.com/pricing',
  frequency: 'daily',
  config: { mode: 'schema', schema: { /* ... */ } },
});
```

### Usage Stats

```typescript
const usage = await stack0.extraction.getUsage({
  periodStart: '2024-01-01T00:00:00Z',
  periodEnd: '2024-01-31T23:59:59Z',
});
console.log(`Extractions: ${usage.extractionsTotal}`);
console.log(`Tokens used: ${usage.extractionTokensUsed}`);

const daily = await stack0.extraction.getUsageDaily({ /* ... */ });
```

### Extraction Method Reference

| Method | Description |
|--------|-------------|
| `extract(req)` | Start an extraction |
| `get(req)` | Get extraction by ID |
| `list(req?)` | List extractions |
| `delete(req)` | Delete an extraction |
| `extractAndWait(req, opts?)` | Extract and poll until complete |
| `batch(req)` | Start a batch extraction |
| `getBatchJob(req)` | Get batch job status |
| `listBatchJobs(req?)` | List batch jobs |
| `cancelBatchJob(req)` | Cancel a batch job |
| `batchAndWait(req, opts?)` | Batch extract and poll until complete |
| `createSchedule(req)` | Create a recurring schedule |
| `updateSchedule(req)` | Update a schedule |
| `getSchedule(req)` | Get a schedule |
| `listSchedules(req?)` | List schedules |
| `deleteSchedule(req)` | Delete a schedule |
| `toggleSchedule(req)` | Toggle a schedule on/off |
| `getUsage(req?)` | Get usage statistics |
| `getUsageDaily(req?)` | Get daily usage breakdown |

---

## Integrations

Unified API for connecting to third-party services. Manage OAuth connections and interact with CRM, storage, communication, and productivity platforms through a single interface.

### Managing Connections

```typescript
// Initiate OAuth flow
const { authUrl, connectionId } = await stack0.integrations.initiateOAuth({
  connectorSlug: 'hubspot',
  redirectUrl: 'https://yourapp.com/oauth/callback',
  name: 'My HubSpot',
});
// Redirect user to authUrl...

// Complete OAuth after callback
await stack0.integrations.completeOAuth({
  code: 'auth_code_from_callback',
  state: 'state_from_initiate',
  redirectUrl: 'https://yourapp.com/oauth/callback',
});

// List and manage connections
const { connections } = await stack0.integrations.listConnections({
  status: 'connected',
});

const stats = await stack0.integrations.getStats({ environment: 'production' });
console.log(`Active connections: ${stats.activeConnections}`);
```

### CRM

```typescript
// Contacts
const contacts = await stack0.integrations.crm.listContacts('conn_123');
const contact = await stack0.integrations.crm.createContact('conn_123', {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
});

// Companies
const companies = await stack0.integrations.crm.listCompanies('conn_123');

// Deals
const deals = await stack0.integrations.crm.listDeals('conn_123');
const deal = await stack0.integrations.crm.createDeal('conn_123', {
  name: 'Enterprise Contract',
  amount: 50000,
  stage: 'negotiation',
});
```

### Storage

```typescript
// Files
const files = await stack0.integrations.storage.listFiles('conn_456', 'folder-id');
await stack0.integrations.storage.uploadFile('conn_456', {
  name: 'report.pdf',
  mimeType: 'application/pdf',
  data: fileBuffer,
  folderId: 'folder-id',
});
const { data, filename } = await stack0.integrations.storage.downloadFile('conn_456', 'file-id');

// Folders
const folders = await stack0.integrations.storage.listFolders('conn_456');
await stack0.integrations.storage.createFolder('conn_456', { name: 'Reports', parentId: 'root' });
```

### Communication

```typescript
// Send a message via Slack, Teams, etc.
await stack0.integrations.communication.sendMessage('conn_789', {
  channelId: 'C123',
  content: 'Hello from Stack0!',
});

const channels = await stack0.integrations.communication.listChannels('conn_789');
const messages = await stack0.integrations.communication.listMessages('conn_789', 'C123');
const users = await stack0.integrations.communication.listUsers('conn_789');
```

### Productivity

```typescript
// Documents (Notion, Google Docs, etc.)
const docs = await stack0.integrations.productivity.listDocuments('conn_abc');
await stack0.integrations.productivity.createDocument('conn_abc', {
  title: 'Meeting Notes',
  content: 'Agenda: ...',
});

// Tables (Airtable, Google Sheets, etc.)
const tables = await stack0.integrations.productivity.listTables('conn_abc');
const rows = await stack0.integrations.productivity.listTableRows('conn_abc', 'table-id');
await stack0.integrations.productivity.createTableRow('conn_abc', 'table-id', {
  fields: { Name: 'Alice', Email: 'alice@example.com' },
});
```

---

## Marketing

AI-powered trend discovery, content opportunity generation, script creation, and content calendar management.

### Discovering Trends

```typescript
const { trendsDiscovered, trends } = await stack0.marketing.discoverTrends({
  projectSlug: 'my-project',
  environment: 'production',
});
console.log(`Discovered ${trendsDiscovered} new trends`);

const allTrends = await stack0.marketing.listTrends({
  projectSlug: 'my-project',
  environment: 'production',
  status: 'active',
});
```

### Generating Content Opportunities

```typescript
const { opportunitiesGenerated } = await stack0.marketing.generateOpportunities({
  projectSlug: 'my-project',
  environment: 'production',
});

const opportunities = await stack0.marketing.listOpportunities({
  projectSlug: 'my-project',
  environment: 'production',
  status: 'pending',
});
```

### Content and Scripts

```typescript
// Create content from an opportunity
const content = await stack0.marketing.createContent({
  projectSlug: 'my-project',
  environment: 'production',
  contentType: 'tiktok_slideshow',
  title: 'How AI is Changing Marketing',
  opportunityId: 'opp-id',
});

// Review workflow
await stack0.marketing.approveContent({ contentId: content.id, reviewNotes: 'Looks great!' });
// or
await stack0.marketing.rejectContent({ contentId: content.id, reviewNotes: 'Needs revisions' });

// Create and version scripts
const script = await stack0.marketing.createScript({
  projectSlug: 'my-project',
  environment: 'production',
  hook: 'Are you ready to see the future?',
  slides: [{ order: 0, text: 'AI is changing everything', voiceoverText: '...', duration: 3 }],
  cta: 'Follow for more!',
});
```

### Content Calendar

```typescript
const entry = await stack0.marketing.scheduleContent({
  projectSlug: 'my-project',
  contentId: 'content-id',
  scheduledFor: new Date('2024-12-25T10:00:00Z'),
  autoPublish: true,
});

const entries = await stack0.marketing.listCalendarEntries({
  projectSlug: 'my-project',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2024-12-31'),
});
```

### Analytics and Usage

```typescript
const overview = await stack0.marketing.getAnalyticsOverview({
  projectSlug: 'my-project',
  environment: 'production',
});

const performance = await stack0.marketing.getContentPerformance({
  projectSlug: 'my-project',
  environment: 'production',
  contentType: 'tiktok_slideshow',
});

const usage = await stack0.marketing.getCurrentUsage({
  projectSlug: 'my-project',
  environment: 'production',
});
```

---

## Workflows

Create and execute AI-powered workflows with step-by-step orchestration.

### Creating Workflows

```typescript
const workflow = await stack0.workflows.create({
  slug: 'content-pipeline',
  name: 'Content Generation Pipeline',
  steps: [
    {
      id: 'generate',
      name: 'Generate Content',
      type: 'llm',
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      config: {
        prompt: 'Write a blog post about {{topic}}',
        maxTokens: 2000,
      },
    },
  ],
  variables: [
    { name: 'topic', type: 'string', required: true },
  ],
});
```

### Running Workflows

```typescript
// Run and wait for the result (simplest approach)
const run = await stack0.workflows.runAndWait({
  workflowSlug: 'content-pipeline',
  variables: { topic: 'artificial intelligence' },
}, { timeout: 120000 }); // 2 minute timeout

console.log(run.output);

// Async run with webhook notification
const { id } = await stack0.workflows.run({
  workflowSlug: 'content-pipeline',
  variables: { topic: 'machine learning' },
  webhook: {
    url: 'https://your-app.com/webhook',
    secret: 'webhook-secret',
  },
});

// Check run status
const status = await stack0.workflows.getRun({ id });
console.log(status.status); // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
```

### Managing Workflows

```typescript
const { items } = await stack0.workflows.list({ environment: 'production', isActive: true });
await stack0.workflows.update({ id: 'workflow-id', name: 'Updated Pipeline', isActive: false });
await stack0.workflows.delete({ id: 'workflow-id' });
await stack0.workflows.cancelRun({ id: 'run-id' });
```

### Workflows Method Reference

| Method | Description |
|--------|-------------|
| `create(req)` | Create a new workflow |
| `get(req)` | Get workflow by ID or slug |
| `list(req?)` | List workflows |
| `update(req)` | Update a workflow |
| `delete(req)` | Delete a workflow |
| `run(req)` | Start a workflow run |
| `getRun(req)` | Get run status and output |
| `listRuns(req?)` | List workflow runs |
| `cancelRun(req)` | Cancel a running workflow |
| `runAndWait(req, opts?)` | Run and poll until complete |

---

## Error Handling

All SDK methods throw errors with additional properties for API errors:

```typescript
import { Stack0 } from '@stack0/sdk';
import type { Stack0Error } from '@stack0/sdk';

try {
  await stack0.mail.send({
    from: 'hello@yourapp.com',
    to: 'user@example.com',
    subject: 'Test',
    html: '<p>Hello</p>',
  });
} catch (err) {
  const error = err as Stack0Error;

  if (error.statusCode === 401) {
    console.error('Invalid API key');
  } else if (error.statusCode === 403) {
    console.error('Insufficient permissions');
  } else if (error.statusCode === 400) {
    console.error('Validation error:', error.message);
  } else if (error.statusCode === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Unexpected error:', error.message);
  }

  // Full error response from the API
  console.error(error.response);
  console.error(error.code);
}
```

The `Stack0Error` interface extends `Error` with:

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number` | HTTP status code |
| `code` | `string` | Machine-readable error code |
| `response` | `unknown` | Full error response body from the API |

---

## TypeScript Types

The SDK exports all request/response types for each module. Import them directly:

```typescript
import type {
  // Shared
  Environment,
  Stack0Error,
  BatchJobStatus,
  ScheduleFrequency,
  PaginatedRequest,
  PaginatedResponse,

  // Mail
  SendEmailRequest,
  SendEmailResponse,
  EmailStatus,
  ListEmailsRequest,
  Template,
  Campaign,
  Sequence,
  MailContact,

  // CDN
  Asset,
  TransformOptions,
  UploadUrlRequest,
  ListAssetsRequest,
  TranscodeVideoRequest,
  PrivateFile,

  // Screenshots
  Screenshot,
  CreateScreenshotRequest,

  // Extraction
  ExtractionResult,
  CreateExtractionRequest,

  // Integrations
  Connection,
  Contact,
  Company,
  Deal,

  // Marketing
  Trend,
  Opportunity,
  Content,
  Script,
  CalendarEntry,

  // Workflows
  Workflow,
  WorkflowRun,
  CreateWorkflowRequest,
  RunWorkflowRequest,
} from '@stack0/sdk';
```

You can also import types from individual module entry points:

```typescript
import type { SendEmailRequest } from '@stack0/sdk/mail';
import type { Asset, TransformOptions } from '@stack0/sdk/cdn';
import type { Screenshot } from '@stack0/sdk/screenshots';
import type { ExtractionResult } from '@stack0/sdk/extraction';
```

---

## Polling Helpers

Several methods include built-in polling for async operations:

| Method | Default Poll Interval | Default Timeout |
|--------|----------------------|-----------------|
| `screenshots.captureAndWait()` | 1s | 60s |
| `screenshots.batchAndWait()` | 2s | 5min |
| `extraction.extractAndWait()` | 1s | 60s |
| `extraction.batchAndWait()` | 2s | 5min |
| `workflows.runAndWait()` | 2s | 10min |

Override defaults via the options parameter:

```typescript
const result = await stack0.screenshots.captureAndWait(
  { url: 'https://example.com', format: 'png' },
  { pollInterval: 500, timeout: 30000 }, // 500ms interval, 30s timeout
);
```

---

## Migration from Resend

The Stack0 Mail API is designed for compatibility with the Resend API:

```typescript
// Before (Resend)
import { Resend } from 'resend';
const resend = new Resend('re_...');
await resend.emails.send({ from: '...', to: '...', subject: '...', html: '...' });

// After (Stack0)
import { Stack0 } from '@stack0/sdk';
const stack0 = new Stack0({ apiKey: 'stack0_...' });
await stack0.mail.send({ from: '...', to: '...', subject: '...', html: '...' });
```

---

## Links

- [Documentation](https://stack0.dev/docs)
- [GitHub](https://github.com/stack0dev/sdk)
- [Changelog](https://github.com/stack0dev/sdk/releases)

## License

[MIT](https://opensource.org/licenses/MIT)
