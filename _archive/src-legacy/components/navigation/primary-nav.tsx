import Link from "next/link";
import { NAV_ITEMS } from "@/constants/routes";

export function PrimaryNav() {
  return (
    <nav className="space-y-1 text-sm">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-md border border-transparent px-3 py-2 text-zinc-300 transition hover:border-zinc-800 hover:bg-zinc-900 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
