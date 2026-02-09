# Marketing SDK

The Marketing SDK provides comprehensive tools for trend discovery, content opportunity generation, and marketing content management.

## Quick Start

```typescript
import { Stack0 } from '@stack0/sdk';

const stack0 = new Stack0({
  apiKey: 'stack0_...',
  baseUrl: 'https://api.stack0.dev'
});

// Discover trending topics
const { trendsDiscovered, trends } = await stack0.marketing.discoverTrends({
  projectSlug: 'my-project',
  environment: 'production',
});

console.log(`Discovered ${trendsDiscovered} new trends!`);
```

## Features

### 🔍 Trend Discovery

Discover trending topics from multiple sources (Google Trends, TikTok, Reddit, etc.)

```typescript
// Discover new trends
const result = await stack0.marketing.discoverTrends({
  projectSlug: 'my-project',
  environment: 'production',
});

// List all trends
const trends = await stack0.marketing.listTrends({
  projectSlug: 'my-project',
  environment: 'production',
  status: 'active', // 'discovered' | 'analyzing' | 'active' | 'declining' | 'expired'
  limit: 20,
});

// Get a specific trend
const trend = await stack0.marketing.getTrend('trend-id');
```

### 💡 Content Opportunities

Generate AI-powered content ideas based on trending topics

```typescript
// Generate new content opportunities
const result = await stack0.marketing.generateOpportunities({
  projectSlug: 'my-project',
  environment: 'production',
});

console.log(`Generated ${result.opportunitiesGenerated} new content ideas!`);

// List opportunities
const opportunities = await stack0.marketing.listOpportunities({
  projectSlug: 'my-project',
  environment: 'production',
  status: 'pending',
  limit: 10,
});

// Get a specific opportunity
const opportunity = await stack0.marketing.getOpportunity('opp-id');

// Dismiss an opportunity
await stack0.marketing.dismissOpportunity({
  opportunityId: 'opp-id',
});
```

### 📝 Content Management

Create, manage, and publish marketing content

```typescript
// Create new content
const content = await stack0.marketing.createContent({
  projectSlug: 'my-project',
  environment: 'production',
  contentType: 'tiktok_slideshow', // 'instagram_reel' | 'youtube_short' | 'blog_post' | 'twitter_thread'
  title: 'How AI is Changing Marketing',
  description: 'A deep dive into AI marketing tools',
  opportunityId: 'opp-id', // optional
  scriptId: 'script-id', // optional
});

// List content with filters
const allContent = await stack0.marketing.listContent({
  projectSlug: 'my-project',
  environment: 'production',
  status: 'published', // 'draft' | 'pending_review' | 'approved' | 'rejected' | 'publishing' | 'published' | 'failed' | 'archived'
  contentType: 'tiktok_slideshow',
  approvalStatus: 'approved', // 'pending' | 'approved' | 'rejected'
  limit: 50,
  offset: 0,
});

// Get specific content
const content = await stack0.marketing.getContent('content-id');

// Update content
const updated = await stack0.marketing.updateContent({
  contentId: 'content-id',
  title: 'Updated Title',
  status: 'published',
  assetUrls: {
    video: 'https://cdn.example.com/video.mp4',
    thumbnail: 'https://cdn.example.com/thumb.jpg',
  },
  publishedUrl: 'https://tiktok.com/@user/video/123',
});

// Approve content for publishing
await stack0.marketing.approveContent({
  contentId: 'content-id',
  reviewNotes: 'Looks great!',
});

// Reject content with feedback
await stack0.marketing.rejectContent({
  contentId: 'content-id',
  reviewNotes: 'Needs more engagement in the hook',
});

// Delete content
await stack0.marketing.deleteContent('content-id');
```

### 📜 Script Management

Create and manage content scripts with slides

```typescript
// Create a script
const script = await stack0.marketing.createScript({
  projectSlug: 'my-project',
  environment: 'production',
  contentId: 'content-id', // optional
  hook: 'Are you ready to see the future of marketing?',
  slides: [
    {
      order: 0,
      text: 'AI is transforming how we create content',
      voiceoverText: 'Artificial intelligence is completely revolutionizing content creation',
      duration: 3,
      visualStyle: 'bold-text-on-gradient',
    },
    {
      order: 1,
      text: 'Save 10 hours per week',
      voiceoverText: 'You can save up to 10 hours every single week',
      duration: 3,
      visualStyle: 'stats-display',
    },
  ],
  cta: 'Follow for more AI marketing tips!',
  prompt: 'Create a viral TikTok script about AI in marketing',
  model: 'gpt-4',
  tokensUsed: 1500,
  generationTimeMs: 3500,
});

// List scripts
const scripts = await stack0.marketing.listScripts({
  projectSlug: 'my-project',
  environment: 'production',
  contentId: 'content-id', // optional
  limit: 20,
});

// Get a specific script
const script = await stack0.marketing.getScript('script-id');
```

### 📊 Analytics

Track content performance and engagement metrics

```typescript
// Get analytics overview
const analytics = await stack0.marketing.getAnalyticsOverview({
  projectSlug: 'my-project',
  environment: 'production',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
});

console.log(`Total content: ${analytics.totalContent}`);
console.log(`Total views: ${analytics.engagement.views}`);
console.log(`Total likes: ${analytics.engagement.likes}`);
console.log(`Total shares: ${analytics.engagement.shares}`);

// Get top performing content
const topContent = await stack0.marketing.getContentPerformance({
  projectSlug: 'my-project',
  environment: 'production',
  contentType: 'tiktok_slideshow', // optional
  limit: 10,
});

topContent.forEach(item => {
  console.log(`${item.title}: ${item.views} views, ${item.engagementRate}% engagement`);
});
```

## Type Definitions

### Content Types

- `tiktok_slideshow` - TikTok slideshow format
- `instagram_reel` - Instagram Reels
- `youtube_short` - YouTube Shorts
- `blog_post` - Blog articles
- `twitter_thread` - Twitter/X threads

### Content Status

- `draft` - Initial draft state
- `pending_review` - Awaiting review
- `approved` - Approved for publishing
- `rejected` - Rejected with feedback
- `publishing` - Currently being published
- `published` - Successfully published
- `failed` - Publishing failed
- `archived` - Archived content

### Trend Status

- `discovered` - Newly discovered trend
- `analyzing` - Being analyzed for opportunities
- `active` - Currently trending
- `declining` - Losing momentum
- `expired` - No longer trending

## Complete Example

```typescript
import { Stack0 } from '@stack0/sdk';

const stack0 = new Stack0({ apiKey: process.env.STACK0_API_KEY! });

async function runMarketingWorkflow() {
  // 1. Discover trending topics
  console.log('Discovering trends...');
  const { trendsDiscovered, trends } = await stack0.marketing.discoverTrends({
    projectSlug: 'my-saas',
    environment: 'production',
  });
  console.log(`✅ Discovered ${trendsDiscovered} trends`);

  // 2. Generate content opportunities from trends
  console.log('\nGenerating content ideas...');
  const { opportunitiesGenerated, opportunities } = await stack0.marketing.generateOpportunities({
    projectSlug: 'my-saas',
    environment: 'production',
  });
  console.log(`✅ Generated ${opportunitiesGenerated} content opportunities`);

  // 3. Create content from top opportunity
  if (opportunities.length > 0) {
    const topOpportunity = opportunities[0];
    console.log(`\nCreating content for: ${topOpportunity.title}`);

    const content = await stack0.marketing.createContent({
      projectSlug: 'my-saas',
      environment: 'production',
      contentType: topOpportunity.contentType,
      title: topOpportunity.title,
      description: topOpportunity.description || undefined,
      opportunityId: topOpportunity.id,
    });
    console.log(`✅ Created content: ${content.id}`);

    // 4. Create a script for the content
    console.log('\nGenerating script...');
    const script = await stack0.marketing.createScript({
      projectSlug: 'my-saas',
      environment: 'production',
      contentId: content.id,
      hook: 'Want to know the secret to viral content?',
      slides: [
        {
          order: 0,
          text: topOpportunity.title,
          voiceoverText: topOpportunity.description || topOpportunity.title,
          duration: 3,
        },
        {
          order: 1,
          text: 'Here\'s what you need to know',
          voiceoverText: topOpportunity.suggestedAngle || 'Let me show you',
          duration: 3,
        },
      ],
      cta: 'Follow for more tips!',
    });
    console.log(`✅ Created script: ${script.id}`);

    // 5. Approve the content
    console.log('\nApproving content...');
    await stack0.marketing.approveContent({
      contentId: content.id,
      reviewNotes: 'Auto-approved via SDK',
    });
    console.log('✅ Content approved');

    // 6. Check analytics
    console.log('\nFetching analytics...');
    const analytics = await stack0.marketing.getAnalyticsOverview({
      projectSlug: 'my-saas',
      environment: 'production',
    });
    console.log(`Total content: ${analytics.totalContent}`);
    console.log(`Total views: ${analytics.engagement.views.toLocaleString()}`);
  }
}

runMarketingWorkflow().catch(console.error);
```

## Error Handling

```typescript
try {
  const content = await stack0.marketing.createContent({
    projectSlug: 'my-project',
    environment: 'production',
    contentType: 'tiktok_slideshow',
    title: 'My Content',
  });
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Invalid API key');
  } else if (error.response?.status === 404) {
    console.error('Project not found');
  } else {
    console.error('Failed to create content:', error.message);
  }
}
```

## Best Practices

1. **Use Environment Variables**: Store your API key in environment variables
2. **Handle Errors**: Always wrap API calls in try-catch blocks
3. **Filter Results**: Use status filters to get relevant content
4. **Track Performance**: Regularly check analytics to optimize content
5. **Workflow Automation**: Chain operations to create complete content workflows
6. **Rate Limiting**: Be mindful of API rate limits when making bulk requests

## Support

For questions or issues, contact support@stack0.dev or visit https://www.stack0.dev/docs
