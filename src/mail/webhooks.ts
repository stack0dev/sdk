/**
 * Verify inbound email webhooks.
 *
 * Stack0 signs each delivery with the Standard Webhooks scheme
 * (https://www.standardwebhooks.com): `webhook-signature` is
 * `v1,<base64 HMAC-SHA256 of "<webhook-id>.<webhook-timestamp>.<raw body>">`,
 * keyed by the mailbox secret, base64-decoded. Uses Web Crypto, so it runs in
 * Node 18+, Bun, Deno, and edge runtimes.
 */

import type { InboundWebhookPayload } from "./types";

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

export interface VerifyInboundWebhookOptions {
  /** The raw request body, exactly as received. Do not parse and re-serialize it first. */
  payload: string | Uint8Array | ArrayBuffer;
  /** The request headers: a `Headers` object or a plain record (any case). */
  headers: Headers | Record<string, string | string[] | undefined>;
  /** The mailbox's webhook secret, from `mailboxes.create` or `mailboxes.rotateSecret`. */
  secret: string;
  /** How far the timestamp may be from now, in seconds. Default 300. */
  toleranceSeconds?: number;
  /** The current time, for tests. */
  now?: Date;
}

function header(headers: VerifyInboundWebhookOptions["headers"], name: string): string | undefined {
  if (typeof (headers as Headers).get === "function") return (headers as Headers).get(name) ?? undefined;
  const record = headers as Record<string, string | string[] | undefined>;
  for (const key of Object.keys(record)) {
    if (key.toLowerCase() === name) {
      const v = record[key];
      return Array.isArray(v) ? v[0] : v;
    }
  }
  return undefined;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Check an inbound email webhook and return its payload. Throws
 * `WebhookVerificationError` when a header is missing, the timestamp is
 * outside the tolerance (a replay), or no signature matches.
 *
 * ```ts
 * const event = await verifyInboundWebhook({
 *   payload: await request.text(),
 *   headers: request.headers,
 *   secret: process.env.STACK0_MAILBOX_SECRET!,
 * });
 * ```
 */
export async function verifyInboundWebhook(options: VerifyInboundWebhookOptions): Promise<InboundWebhookPayload> {
  const id = header(options.headers, "webhook-id");
  const timestamp = header(options.headers, "webhook-timestamp");
  const signatures = header(options.headers, "webhook-signature");
  if (!id || !timestamp || !signatures) {
    throw new WebhookVerificationError("missing webhook-id, webhook-timestamp, or webhook-signature header");
  }

  const seconds = Number(timestamp);
  if (!Number.isInteger(seconds)) throw new WebhookVerificationError("webhook-timestamp is not a whole number");
  const now = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const tolerance = options.toleranceSeconds ?? 300;
  if (Math.abs(now - seconds) > tolerance) {
    throw new WebhookVerificationError(`webhook-timestamp is more than ${tolerance} seconds from now`);
  }

  const body =
    typeof options.payload === "string"
      ? options.payload
      : new TextDecoder().decode(options.payload instanceof ArrayBuffer ? new Uint8Array(options.payload) : options.payload);
  const secret = options.secret.startsWith("whsec_") ? options.secret.slice(6) : options.secret;
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${seconds}.${body}`)),
  );
  const expected = bytesToBase64(mac);

  // The header may carry several space-separated signatures (during a secret rotation).
  const matched = signatures
    .split(" ")
    .map((s) => s.split(",", 2))
    .some(([version, sig]) => version === "v1" && sig !== undefined && timingSafeEqual(sig, expected));
  if (!matched) throw new WebhookVerificationError("no webhook-signature matches");

  let payload: InboundWebhookPayload;
  try {
    payload = JSON.parse(body) as InboundWebhookPayload;
  } catch {
    throw new WebhookVerificationError("the payload is not JSON");
  }
  if (payload.id !== id) throw new WebhookVerificationError("the payload id does not match webhook-id");
  return payload;
}
