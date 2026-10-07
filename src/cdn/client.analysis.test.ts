/**
 * Tests for CDN client video analysis and multipart upload methods
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { CDN } from "./client";

const JOB_ID = "6f0d2a1c-1111-4222-8333-444455556666";
const ASSET_ID = "8f14e45f-ceea-4c1e-8b1e-1a2b3c4d5e6f";

const jobResponse = {
  id: JOB_ID,
  organizationId: "org-id",
  projectId: "project-id",
  assetId: ASSET_ID,
  environment: "production",
  frameIntervalSeconds: 1,
  frameWidth: 320,
  sceneThreshold: 0.3,
  extractAudio: true,
  beats: false,
  expectedBpm: null,
  dropHint: null,
  status: "pending",
  progress: 0,
  errorMessage: null,
  result: null,
  sourceDurationSeconds: 13,
  webhookUrl: null,
  createdAt: "2026-10-06T10:00:00.000Z",
  updatedAt: null,
  startedAt: null,
  completedAt: null,
};

const completedJobResponse = {
  ...jobResponse,
  status: "completed",
  progress: 100,
  startedAt: "2026-10-06T10:00:02.000Z",
  completedAt: "2026-10-06T10:00:09.000Z",
  result: {
    probe: {
      durationSeconds: 12.966667,
      width: 1080,
      height: 1920,
      fps: 30,
      rotation: 90,
      hasAudio: true,
      videoCodec: "h264",
      audioCodec: "aac",
    },
    cuts: [
      { time: 3, score: 0.5543 },
      { time: 5, score: 0.6921 },
    ],
    frames: {
      intervalSeconds: 1,
      count: 13,
      cellWidth: 320,
      cellHeight: 568,
      columns: 10,
      rows: 2,
      sheets: [
        {
          assetId: "sheet-asset",
          url: "https://cdn.example.com/org/sheet-asset/frames-0000.jpg",
          firstIndex: 0,
          count: 13,
        },
      ],
    },
    audio: {
      assetId: "audio-asset",
      url: "https://cdn.example.com/org/audio-asset/audio-16k.mp3",
      format: "mp3",
      sampleRate: 16000,
      channels: 1,
    },
    music: null,
  },
};

describe("CDN video analysis and multipart methods", () => {
  const originalFetch = globalThis.fetch;
  let cdn: CDN;
  let requests: { url: string; method: string; body?: unknown }[];
  let responses: unknown[];

  beforeEach(() => {
    cdn = new CDN({ apiKey: "stack0_test_key", baseUrl: "http://localhost:3002/v1" });
    requests = [];
    responses = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      requests.push({
        url: String(input),
        method: init?.method ?? "GET",
        body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
      });
      return new Response(JSON.stringify(responses.shift() ?? jobResponse), { status: 200 });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("createVideoAnalysis POSTs /cdn/video/analyze with the options", async () => {
    responses = [jobResponse];
    const job = await cdn.createVideoAnalysis({ assetId: ASSET_ID, frameIntervalSeconds: 0.5, extractAudio: false });

    const request = requests[0]!;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/v1/cdn/video/analyze");
    expect(request.body).toEqual({ assetId: ASSET_ID, frameIntervalSeconds: 0.5, extractAudio: false });
    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.result).toBeNull();
  });

  test("createVideoAnalysis sends the beat options", async () => {
    responses = [{ ...jobResponse, beats: true, expectedBpm: 120, dropHint: 16 }];
    const job = await cdn.createVideoAnalysis({ assetId: ASSET_ID, beats: true, expectedBpm: 120, dropHint: 16 });

    expect(requests[0]!.body).toEqual({ assetId: ASSET_ID, beats: true, expectedBpm: 120, dropHint: 16 });
    expect(job.beats).toBe(true);
  });

  test("getVideoAnalysis returns an audio-only result with music", async () => {
    responses = [
      {
        ...completedJobResponse,
        beats: true,
        result: {
          ...completedJobResponse.result,
          cuts: [],
          frames: null,
          audio: null,
          music: { bpm: 120.04, beats: [0.006, 0.506], downbeats: [0.006], kicks: [0.012], drop: 4.005, envelope: [1] },
        },
      },
    ];
    const job = await cdn.getVideoAnalysis(JOB_ID);

    expect(job.result?.frames).toBeNull();
    expect(job.result?.music?.drop).toBe(4.005);
  });

  test("getVideoAnalysis returns the result with dates converted", async () => {
    responses = [completedJobResponse];
    const job = await cdn.getVideoAnalysis(JOB_ID);

    expect(new URL(requests[0]!.url).pathname).toBe(`/v1/cdn/video/analyze/${JOB_ID}`);
    expect(job.completedAt).toBeInstanceOf(Date);
    expect(job.result?.cuts.map((cut) => cut.time)).toEqual([3, 5]);
    expect(job.result?.frames?.sheets[0]?.count).toBe(13);
    expect(job.result?.audio?.sampleRate).toBe(16000);
  });

  test("listVideoAnalyses sends the filters as query parameters", async () => {
    responses = [{ jobs: [completedJobResponse], total: 1, hasMore: false }];
    const list = await cdn.listVideoAnalyses({
      projectSlug: "my-project",
      assetId: ASSET_ID,
      status: "completed",
      limit: 5,
    });

    const url = new URL(requests[0]!.url);
    expect(url.pathname).toBe("/v1/cdn/video/analyze");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      projectSlug: "my-project",
      assetId: ASSET_ID,
      status: "completed",
      limit: "5",
    });
    expect(list.jobs[0]?.createdAt).toBeInstanceOf(Date);
  });

  test("createMultipartUpload returns part URLs and a Date expiry", async () => {
    responses = [
      {
        assetId: ASSET_ID,
        uploadId: "upload-1",
        partSize: 8388608,
        parts: [
          { partNumber: 1, url: "https://bucket.s3.amazonaws.com/a?partNumber=1" },
          { partNumber: 2, url: "https://bucket.s3.amazonaws.com/a?partNumber=2" },
        ],
        expiresAt: "2026-10-06T16:00:00.000Z",
      },
    ];
    const upload = await cdn.createMultipartUpload({
      projectSlug: "my-project",
      filename: "clip.mov",
      mimeType: "video/quicktime",
      size: 12_000_000,
    });

    expect(new URL(requests[0]!.url).pathname).toBe("/v1/cdn/upload/multipart");
    expect(requests[0]!.body).toMatchObject({ filename: "clip.mov", size: 12_000_000 });
    expect(upload.parts).toHaveLength(2);
    expect(upload.expiresAt).toBeInstanceOf(Date);
  });

  test("completeMultipartUpload puts the asset id in the path and the parts in the body", async () => {
    responses = [{ id: ASSET_ID, status: "processing", createdAt: "2026-10-06T10:00:00.000Z", updatedAt: null }];
    const parts = [
      { partNumber: 1, etag: '"a"' },
      { partNumber: 2, etag: '"b"' },
    ];
    const asset = await cdn.completeMultipartUpload({ assetId: ASSET_ID, uploadId: "upload-1", parts });

    expect(new URL(requests[0]!.url).pathname).toBe(`/v1/cdn/upload/multipart/${ASSET_ID}/complete`);
    expect(requests[0]!.body).toEqual({ uploadId: "upload-1", parts });
    expect(asset.createdAt).toBeInstanceOf(Date);
  });

  test("abortMultipartUpload POSTs the upload id", async () => {
    responses = [{ success: true }];
    const result = await cdn.abortMultipartUpload({ assetId: ASSET_ID, uploadId: "upload-1" });

    expect(new URL(requests[0]!.url).pathname).toBe(`/v1/cdn/upload/multipart/${ASSET_ID}/abort`);
    expect(requests[0]!.body).toEqual({ uploadId: "upload-1" });
    expect(result.success).toBe(true);
  });
});
