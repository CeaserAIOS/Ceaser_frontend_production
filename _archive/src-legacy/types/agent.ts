import type { LucideIcon } from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  modules: string[];
  icon: LucideIcon;
  color: string;
}
