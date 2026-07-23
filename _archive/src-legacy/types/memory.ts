export interface MemoryRecord {
  id: string;
  kind: "conversation" | "project" | "goal" | "workspace";
  title: string;
  content: string;
  createdAt: string;
}
