/**
 * Tests for CDN client video thumbnail retrieval
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { CDN } from "./client";
import type { ThumbnailResponse } from "./types";

const ASSET_ID = "0b8a2c1e-1111-4222-8333-444455556666";

const pendingResponse: ThumbnailResponse = {
  id: null,
  assetId: ASSET_ID,
  timestamp: 3.5,
  url: null,
  width: null,
  height: null,
  format: "jpg",
  status: "pending",
};

const readyResponse: ThumbnailResponse = {
  id: "9f8e7d6c-1111-4222-8333-444455556666",
  assetId: ASSET_ID,
  timestamp: 3,
  url: "https://cdn.example.com/org/asset/thumbnails/thumb_300.jpg",
  width: 640,
  height: 360,
  format: "jpg",
  status: "ready",
};

describe("CDN thumbnail retrieval", () => {
  const originalFetch = globalThis.fetch;
  let cdn: CDN;
  let requests: { url: string; method: string }[];
  let responses: ThumbnailResponse[];

  beforeEach(() => {
    cdn = new CDN({ apiKey: "stack0_test_key", baseUrl: "http://localhost:3002/v1" });
    requests = [];
    responses = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(input), method: init?.method ?? "GET" });
      const body = responses.shift() ?? pendingResponse;
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("getThumbnail GETs /cdn/video/thumbnail/{assetId} with query params", async () => {
    responses = [readyResponse];
    const thumbnail = await cdn.getThumbnail({ assetId: ASSET_ID, timestamp: 3.5, width: 640, format: "jpg" });

    expect(requests).toHaveLength(1);
    const request = requests[0]!;
    expect(request.method).toBe("GET");
    const url = new URL(request.url);
    expect(url.pathname).toBe(`/v1/cdn/video/thumbnail/${ASSET_ID}`);
    expect(url.searchParams.get("timestamp")).toBe("3.5");
    expect(url.searchParams.get("width")).toBe("640");
    expect(url.searchParams.get("format")).toBe("jpg");
    expect(thumbnail.status).toBe("ready");
    expect(thumbnail.url).toBe(readyResponse.url);
  });

  test("getThumbnail returns the pending response while generation is queued", async () => {
    responses = [pendingResponse];
    const thumbnail = await cdn.getThumbnail({ assetId: ASSET_ID, timestamp: 3.5 });

    expect(thumbnail.status).toBe("pending");
    expect(thumbnail.url).toBeNull();
  });

  test("getThumbnailAndWait polls until the thumbnail is ready", async () => {
    responses = [pendingResponse, pendingResponse, readyResponse];
    const thumbnail = await cdn.getThumbnailAndWait({ assetId: ASSET_ID, timestamp: 3.5 }, { pollInterval: 1 });

    expect(requests).toHaveLength(3);
    expect(thumbnail.status).toBe("ready");
    expect(thumbnail.url).toBe(readyResponse.url);
  });

  test("getThumbnailAndWait throws when generation never completes in time", async () => {
    responses = [pendingResponse, pendingResponse, pendingResponse, pendingResponse];
    await expect(
      cdn.getThumbnailAndWait({ assetId: ASSET_ID, timestamp: 3.5 }, { pollInterval: 1, timeout: 3 }),
    ).rejects.toThrow("Thumbnail generation timed out");
  });
});
