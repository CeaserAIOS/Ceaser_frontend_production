export function ContentArea({ children }: { children: React.ReactNode }) {
  return <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">{children}</section>;
}
