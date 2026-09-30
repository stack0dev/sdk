import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { verifyInboundWebhook, WebhookVerificationError } from "./webhooks";

const secret = "ab".repeat(32); // a mailbox secret: 64 hex characters
const now = new Date("2026-09-30T12:00:00Z");
const ts = Math.floor(now.getTime() / 1000);

function sign(id: string, timestamp: number, body: string, key = secret): string {
  return `v1,${createHmac("sha256", Buffer.from(key, "base64")).update(`${id}.${timestamp}.${body}`).digest("base64")}`;
}

const body = JSON.stringify({ id: "m1", event: "email.inbound", tag: "42", headers: {} });

describe("verifyInboundWebhook", () => {
  test("accepts a signed delivery and returns the payload", async () => {
    const event = await verifyInboundWebhook({
      payload: body,
      headers: { "webhook-id": "m1", "webhook-timestamp": String(ts), "webhook-signature": sign("m1", ts, body) },
      secret,
      now,
    });
    expect(event.id).toBe("m1");
    expect(event.tag).toBe("42");
  });

  test("accepts a Headers object, bytes, and several signatures", async () => {
    const headers = new Headers({
      "Webhook-Id": "m1",
      "Webhook-Timestamp": String(ts),
      "Webhook-Signature": `v1,bm90IGl0 ${sign("m1", ts, body)}`,
    });
    const event = await verifyInboundWebhook({ payload: new TextEncoder().encode(body), headers, secret, now });
    expect(event.event).toBe("email.inbound");
  });

  test("matches the Standard Webhooks test vector", async () => {
    const vectorBody = '{"test": 2432232314}';
    // The spec's example payload has no id; check the signature step alone.
    const promise = verifyInboundWebhook({
      payload: vectorBody,
      headers: {
        "webhook-id": "msg_p5jXN8AQM9LWM0D4loKWxJek",
        "webhook-timestamp": "1614265330",
        "webhook-signature": "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
      },
      secret: "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw",
      now: new Date(1614265330 * 1000),
    });
    await expect(promise).rejects.toThrow("the payload id does not match webhook-id");
  });

  test("refuses a stale timestamp (a replay)", async () => {
    const old = ts - 301;
    await expect(
      verifyInboundWebhook({
        payload: body,
        headers: { "webhook-id": "m1", "webhook-timestamp": String(old), "webhook-signature": sign("m1", old, body) },
        secret,
        now,
      }),
    ).rejects.toThrow(WebhookVerificationError);
  });

  test("refuses a changed body, id, or secret", async () => {
    const headers = { "webhook-id": "m1", "webhook-timestamp": String(ts), "webhook-signature": sign("m1", ts, body) };
    await expect(verifyInboundWebhook({ payload: body.replace("42", "43"), headers, secret, now })).rejects.toThrow(
      "no webhook-signature matches",
    );
    await expect(
      verifyInboundWebhook({ payload: body, headers: { ...headers, "webhook-id": "m2" }, secret, now }),
    ).rejects.toThrow("no webhook-signature matches");
    await expect(verifyInboundWebhook({ payload: body, headers, secret: "cd".repeat(32), now })).rejects.toThrow(
      "no webhook-signature matches",
    );
  });

  test("refuses missing headers", async () => {
    await expect(verifyInboundWebhook({ payload: body, headers: {}, secret, now })).rejects.toThrow("missing");
  });
});
