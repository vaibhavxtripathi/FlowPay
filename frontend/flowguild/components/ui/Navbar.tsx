"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FlowAuthButton from "../FlowAuthButton";

export default function Navbar() {
  const pathname = usePathname();
  const nav = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/payouts", label: "Create Payout" },
  ];
  return (
    <nav className="sticky top-0 z-30 w-full border-b border-[color:var(--border)] glass backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[20px] brand flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[color:var(--accent)] to-teal-500" />
            FlowGuild
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} className="relative text-sm font-medium text-[color:var(--muted)] hover:text-white transition-colors">
                  {n.label}
                  {active && <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--accent)] to-teal-500 rounded-full" />}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/payouts" className="hidden md:inline-flex items-center px-4 py-2 text-sm rounded-xl border border-[color:var(--border)] text-white hover:bg-[color:var(--card-hover)] transition-colors">Create Payout</Link>
          <FlowAuthButton />
        </div>
      </div>
    </nav>
  );
}


