export const designSystem = {
  colors: {
    background: "#04070d",
    surface: "#0b1220",
    surfaceAlt: "#101a2b",
    border: "rgba(148, 163, 184, 0.18)",
    text: "#eff6ff",
    muted: "#cbd5e1",
    accent: "#8b5cf6",
    cyan: "#22d3ee",
    emerald: "#34d399",
    rose: "#fb7185",
  },
  typography: {
    heading: "font-semibold tracking-tight text-slate-100",
    body: "text-sm text-slate-300",
    label: "text-xs uppercase tracking-[0.35em] text-slate-400",
  },
  spacing: {
    shell: "p-6",
    card: "rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]",
  },
  shadows: {
    soft: "shadow-[0_18px_40px_rgba(15,23,42,0.35)]",
    glow: "shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_18px_45px_rgba(56,189,248,0.12)]",
  },
  motion: {
    transition: "transition duration-200 ease-out",
    hover: "hover:-translate-y-0.5 hover:border-violet-400/50",
  },
  glass: {
    panel: "bg-slate-950/60 backdrop-blur-xl border border-white/10",
    chip: "bg-white/5 backdrop-blur-md border border-white/10",
  },
};

export const themeConfig = {
  mode: "dark" as const,
  accent: "violet",
  radius: "2xl",
};
