export interface MessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}
