/**
 * @deprecated The webdata module is deprecated.
 * Use the separate `screenshots` and `extraction` modules instead.
 *
 * @example
 * ```typescript
 * // Old way (deprecated)
 * await stack0.webdata.screenshotAndWait({ url: '...' });
 * await stack0.webdata.extractAndWait({ url: '...' });
 *
 * // New way
 * await stack0.screenshots.captureAndWait({ url: '...' });
 * await stack0.extraction.extractAndWait({ url: '...' });
 * ```
 */
export { Webdata } from "./client";
export * from "./types";
