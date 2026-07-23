export interface ProjectSummary {
  id: string;
  name: string;
  status: "planned" | "active" | "complete";
  owner: string;
}
