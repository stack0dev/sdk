/**
 * Tests for CDN client video render methods
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { CDN } from "./client";
import type { RenderJob, RenderJobWithOutput } from "./types";

const JOB_ID = "6f0d2a1c-1111-4222-8333-444455556666";
const AFTER_IMAGE = "8f14e45f-ceea-4c1e-8b1e-1a2b3c4d5e6f";

/** The shape reelbear actually sends: nested scenes and messages, no code. */
const SPEC = {
  canvas: { width: 1080, height: 1920, fps: 30 },
  audio: [{ src: "3c79f34e-9e2b-4c6a-8f1d-2e3f4a5b6c7d", volume: 0.34 }],
  scenes: [
    {
      id: "hook",
      duration: 2.5,
      layers: [
        { type: "image", src: AFTER_IMAGE, zoom: { from: 1, to: 1.06 } },
        { type: "caption", text: "i told my mom\nthe kitchen exploded", position: "upperThird" },
      ],
    },
    {
      id: "payoff",
      layers: [
        {
          type: "messageThread",
          recipient: "Mom",
          imageSrc: AFTER_IMAGE,
          messages: [
            { sender: "recipient", text: "you home?", history: true },
            { sender: "user", text: "[IMAGE]" },
            { sender: "recipient", text: "WHAT IS THAT" },
          ],
        },
      ],
    },
  ],
};

const jobResponse = {
  id: JOB_ID,
  organizationId: "org-id",
  projectId: "project-id",
  environment: "production",
  spec: SPEC,
  outputFormat: "mp4",
  outputScale: 1,
  outputFilename: null,
  outputLoudness: null,
  outputAssetId: null,
  status: "pending",
  progress: 0,
  errorMessage: null,
  startedAt: null,
  completedAt: null,
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 313,
  outputDurationSeconds: null,
  webhookUrl: null,
  createdAt: "2026-08-30T10:00:00.000Z",
  updatedAt: null,
};

const completedJobResponse = {
  ...jobResponse,
  status: "completed",
  progress: 100,
  outputAssetId: "output-asset-id",
  outputDurationSeconds: 10,
  startedAt: "2026-08-30T10:00:05.000Z",
  completedAt: "2026-08-30T10:02:00.000Z",
  outputAsset: {
    id: "output-asset-id",
    cdnUrl: "https://cdn.example.com/org-id/job-id/render.mp4",
    directUrl: "https://uploads.example.com/org-id/job-id/render.mp4",
    filename: "render.mp4",
    size: 2_400_000,
    duration: 10,
  },
};

describe("CDN render methods", () => {
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

  test("createRenderJob POSTs /cdn/video/render with the spec verbatim", async () => {
    responses = [jobResponse];
    const job = await cdn.createRenderJob({
      projectSlug: "my-project",
      spec: SPEC,
      output: { format: "mp4" },
    });

    expect(requests).toHaveLength(1);
    const request = requests[0]!;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/v1/cdn/video/render");
    // Deep equality: the SDK must not reshape a spec on its way out.
    expect((request.body as { spec: unknown }).spec).toEqual(SPEC);
    expect(job.status).toBe("pending");
    expect(job.createdAt).toBeInstanceOf(Date);
  });

  test("reports the canvas and length before anything has rendered", async () => {
    responses = [jobResponse];
    const job = await cdn.createRenderJob({ projectSlug: "my-project", spec: SPEC });

    expect(job.width).toBe(1080);
    expect(job.height).toBe(1920);
    expect(job.fps).toBe(30);
    expect(job.durationInFrames).toBe(313);
  });

  test("renderFrames POSTs a frames render and getRenderJob returns the stills", async () => {
    const frames = [
      { time: 0.5, assetId: "frame-asset-1", url: "https://cdn.example.com/org-id/job-id/frames/00-500ms.jpg" },
      { time: 4, assetId: "frame-asset-2", url: "https://cdn.example.com/org-id/job-id/frames/01-4000ms.jpg" },
    ];
    responses = [
      {
        ...jobResponse,
        outputFormat: "frames",
        frameTimes: [0.5, 4],
        frameWidth: 960,
        outputFrames: null,
        ignored: ["scenes[0].layers[0].rotate"],
      },
      {
        ...jobResponse,
        outputFormat: "frames",
        status: "completed",
        frameTimes: [0.5, 4],
        frameWidth: 960,
        outputFrames: frames,
        outputAsset: null,
      },
    ];

    const job = await cdn.renderFrames({ projectSlug: "my-project", spec: SPEC, frames: [0.5, 4], frameWidth: 960 });
    expect(requests[0]!.method).toBe("POST");
    expect(new URL(requests[0]!.url).pathname).toBe("/v1/cdn/video/render");
    expect(requests[0]!.body).toEqual({
      projectSlug: "my-project",
      spec: SPEC,
      output: { format: "frames", frames: [0.5, 4], frameWidth: 960 },
    });
    expect(job.outputFormat).toBe("frames");
    expect(job.ignored).toEqual(["scenes[0].layers[0].rotate"]);

    const done = await cdn.getRenderJob(job.id);
    expect(done.outputFrames).toEqual(frames);
  });

  test("sends a loudness target in the output options", async () => {
    responses = [{ ...jobResponse, outputLoudness: { integrated: -14, truePeak: -1 } }];
    const job = await cdn.createRenderJob({
      projectSlug: "my-project",
      spec: SPEC,
      output: { format: "mp4", loudness: { integrated: -14 } },
    });

    expect((requests[0]!.body as { output: unknown }).output).toEqual({ format: "mp4", loudness: { integrated: -14 } });
    expect(job.outputLoudness).toEqual({ integrated: -14, truePeak: -1 });
  });

  test("sends a webhook URL when one is given", async () => {
    responses = [jobResponse];
    await cdn.createRenderJob({
      projectSlug: "my-project",
      spec: SPEC,
      webhookUrl: "https://your-app.com/webhook",
    });

    expect((requests[0]!.body as { webhookUrl: string }).webhookUrl).toBe("https://your-app.com/webhook");
  });

  test("getRenderJob returns the output asset once the render completes", async () => {
    responses = [completedJobResponse];
    const job = (await cdn.getRenderJob(JOB_ID)) as RenderJobWithOutput;

    expect(new URL(requests[0]!.url).pathname).toBe(`/v1/cdn/video/render/${JOB_ID}`);
    expect(job.status).toBe("completed");
    expect(job.outputAsset?.cdnUrl).toBe(completedJobResponse.outputAsset.cdnUrl);
    expect(job.startedAt).toBeInstanceOf(Date);
    expect(job.completedAt).toBeInstanceOf(Date);
  });

  test("getRenderJob returns the spec that was rendered", async () => {
    responses = [completedJobResponse];
    const job = await cdn.getRenderJob(JOB_ID);

    expect(job.spec).toEqual(SPEC);
  });

  test("listRenderJobs passes the status filter", async () => {
    responses = [{ jobs: [jobResponse], total: 1, hasMore: false }];
    const result = await cdn.listRenderJobs({ projectSlug: "my-project", status: "processing" });

    const url = new URL(requests[0]!.url);
    expect(url.pathname).toBe("/v1/cdn/video/render");
    expect(url.searchParams.get("status")).toBe("processing");
    expect(result.total).toBe(1);
    expect(result.jobs[0]!.createdAt).toBeInstanceOf(Date);
  });

  test("cancelRenderJob POSTs the cancel path", async () => {
    responses = [{ success: true }];
    const result = await cdn.cancelRenderJob(JOB_ID);

    expect(requests[0]!.method).toBe("POST");
    expect(new URL(requests[0]!.url).pathname).toBe(`/v1/cdn/video/render/${JOB_ID}/cancel`);
    expect(result.success).toBe(true);
  });

  test("render types stay assignable to the SDK surface", () => {
    const job: RenderJob = { ...jobResponse, createdAt: new Date(), updatedAt: null } as unknown as RenderJob;
    expect(job.spec).toEqual(SPEC);
    expect(job.outputScale).toBe(1);
  });
});
