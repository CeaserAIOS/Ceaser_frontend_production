import {
  Bot,
  BrainCircuit,
  Compass,
  Globe,
  Shield,
  Sparkles,
} from "lucide-react";

export const agentRegistry = [
  {
    id: "bolt",
    name: "Bolt",
    icon: Bot,
    description: "Execution engine for automation and implementation workflows.",
    color: "from-violet-500 to-fuchsia-500",
    modules: ["Automation", "Execution", "Ops"],
  },
  {
    id: "alex",
    name: "Alex",
    icon: BrainCircuit,
    description: "Learning and personal productivity companion for long-term goals.",
    color: "from-cyan-400 to-sky-500",
    modules: ["Learning", "Goals", "Productivity"],
  },
  {
    id: "friday",
    name: "Friday",
    icon: Globe,
    description: "Creative strategist for content, social, and brand planning.",
    color: "from-emerald-400 to-lime-500",
    modules: ["Content", "Social", "Email"],
  },
  {
    id: "zeus",
    name: "Zeus",
    icon: Shield,
    description: "Executive orchestrator for strategic direction and decision support.",
    color: "from-amber-400 to-orange-500",
    modules: ["CEO", "CTO", "CFO"],
  },
  {
    id: "nova",
    name: "Nova",
    icon: Sparkles,
    description: "Creative explorer for ideation, experiments, and fresh thinking.",
    color: "from-pink-400 to-rose-500",
    modules: ["Ideas", "Research", "Design"],
  },
  {
    id: "atlas",
    name: "Atlas",
    icon: Compass,
    description: "Systems navigator for architecture, operations, and infrastructure.",
    color: "from-indigo-400 to-blue-500",
    modules: ["Systems", "Infra", "Planning"],
  },
] as const;
