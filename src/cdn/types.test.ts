import { describe, expect, expectTypeOf, it } from "bun:test";
import type { TranscodeVideoRequest, WatermarkOptions } from "./types";

describe("video watermark types", () => {
  it("accepts tiled text watermarks", () => {
    const watermark = {
      type: "text",
      text: "CONFIDENTIAL",
      tile: true,
      tileSpacingX: 80,
      tileSpacingY: 120,
      rotation: -30,
    } satisfies WatermarkOptions;

    const request = {
      projectSlug: "my-project",
      assetId: "video-asset-id",
      outputFormat: "hls",
      variants: [{ quality: "720p", codec: "h264" }],
      watermark,
    } satisfies TranscodeVideoRequest;

    expect(request.watermark.tile).toBe(true);
    expectTypeOf(request.watermark).toMatchTypeOf<WatermarkOptions>();
  });
});
