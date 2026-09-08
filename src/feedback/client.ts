import type { FeedbackConfig, FeedbackBoard, FeedbackDetail, FeedbackStatus } from "./types";

/** Server-side client. Feedback keys are scoped to one board. */
export class Feedback {
  private readonly baseUrl: string;
  private readonly fetcher: typeof globalThis.fetch;
  constructor(private readonly config: FeedbackConfig) {
    const url = new URL(config.baseUrl);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
      throw new Error("Feedback requires HTTPS outside localhost.");
    if (url.username || url.password || url.search || url.hash) throw new Error("Invalid Feedback base URL.");
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.fetcher = config.fetch ?? globalThis.fetch;
  }
  private async call<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}/api/fn/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...args, key: this.config.apiKey }),
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Feedback request failed (${response.status}).`);
    return response.json() as Promise<T>;
  }
  readBoard(slug: string) {
    return this.call<FeedbackBoard>("readBoard", { slug });
  }
  readRequest(requestId: string) {
    return this.call<FeedbackDetail>("readRequest", { requestId });
  }
  submitRequest(input: { boardId: string; title: string; description: string; pageUrl?: string; appVersion?: string }) {
    return this.call<{ id: string }>("submitRequest", input);
  }
  setStatus(requestId: string, status: FeedbackStatus) {
    return this.call<{ ok: boolean }>("setStatus", { requestId, status });
  }
  addComment(input: { requestId: string; body: string; internal: boolean }) {
    return this.call<{ id: string }>("addComment", input);
  }
  createChangelog(input: { boardId: string; title: string; body: string; published: boolean }) {
    return this.call<{ id: string }>("createChangelog", input);
  }
  updateChangelog(input: { id: string; title: string; body: string; published: boolean }) {
    return this.call<{ ok: boolean }>("updateChangelog", input);
  }
}
