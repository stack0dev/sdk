export type FeedbackStatus = "review" | "planned" | "in_progress" | "completed" | "closed";
export interface FeedbackConfig {
  apiKey: string;
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
}
export interface FeedbackRequest {
  id: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  createdAt: string;
  votes: number;
  voted: boolean;
}
export interface FeedbackBoard {
  board: {
    id: string;
    name: string;
    slug: string;
    description: string;
    visibility: string;
    projectId: string;
    environment: string;
  };
  member: boolean;
  canManage: boolean;
  requests: FeedbackRequest[];
  changelog: { id: string; title: string; body: string; published: boolean; createdAt: string }[];
}
export interface FeedbackReport {
  id: string;
  organizationId: string;
  projectId: string;
  environment: string;
  boardId: string;
  requestId: string;
  authorId: string;
  body: string;
  pageUrl?: string;
  appVersion?: string;
  createdAt: string;
}
export interface FeedbackDetail {
  comments: { id: string; body: string; internal: boolean; createdAt: string }[];
  reports: FeedbackReport[];
}
