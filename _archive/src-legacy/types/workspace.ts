export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: "personal" | "creator" | "startup";
  description?: string;
  focus?: string;
}
