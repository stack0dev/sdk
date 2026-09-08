import { expect, test } from "bun:test";
import { Feedback } from "./client";
test("SDK methods match the API and attach the board key", async () => {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return Response.json({ ok: true });
  }) as typeof fetch;
  const c = new Feedback({ baseUrl: "https://feedback.example/", apiKey: "secret", fetch: fetcher });
  await c.readBoard("app");
  await c.readRequest("r1");
  await c.submitRequest({ boardId: "b1", title: "Title", description: "Details" });
  await c.setStatus("r1", "planned");
  await c.addComment({ requestId: "r1", body: "Note", internal: true });
  await c.createChangelog({ boardId: "b1", title: "Release", body: "Changes", published: false });
  await c.updateChangelog({ id: "entry1", title: "Release", body: "Changes", published: true });
  expect(calls.map((r) => r.url.split("/").pop())).toEqual([
    "readBoard",
    "readRequest",
    "submitRequest",
    "setStatus",
    "addComment",
    "createChangelog",
    "updateChangelog",
  ]);
  expect(calls.every((r) => r.body.key === "secret")).toBe(true);
  expect(calls[5].body.published).toBe(false);
});
test("SDK errors omit credentials and server content", async () => {
  const c = new Feedback({
    baseUrl: "https://feedback.example",
    apiKey: "secret",
    fetch: (async () => new Response("secret", { status: 403 })) as typeof fetch,
  });
  await expect(c.readBoard("app")).rejects.toThrow("Feedback request failed (403).");
});
test("SDK requires HTTPS outside localhost", () => {
  expect(() => new Feedback({ baseUrl: "http://example.com", apiKey: "secret" })).toThrow();
});
