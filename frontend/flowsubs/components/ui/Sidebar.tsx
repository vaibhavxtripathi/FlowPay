"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, CreditCard, Activity, LayoutDashboard, User2 } from "lucide-react";
import { cn } from "../../lib/utils";

const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Payout",
    href: "/payouts",
    icon: CreditCard,
  },
  {
    name: "Activity",
    href: "/dashboard#activity",
    icon: Activity,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen px-4 py-8 surface-muted border-r border-[color:var(--border)] z-30">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 mb-10 px-2 text-[color:var(--flow-700)] hover:text-[color:var(--flow-800)] font-bold text-2xl tracking-tight"
      >
        <PanelLeft className="w-7 h-7" />
        FlowGuild
      </Link>

      <nav className="flex flex-col gap-1 mb-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium hover:bg-[color:var(--flow-50)] hover:text-[color:var(--flow-800)] transition",
              pathname === link.href ? "bg-[color:rgba(0,239,139,0.08)] text-[color:var(--flow-800)] font-semibold" : "text-gray-700"
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </Link>
        ))}
      </nav>

      {/* User (placeholder) */}
      <div className="flex items-center gap-3 mt-10 px-2 py-4 border-t border-[color:rgba(0,239,139,0.2)]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[color:var(--flow-500)] to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
          <User2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">You</span>
          <span className="text-xs text-gray-500">Testnet</span>
        </div>
      </div>
    </aside>
  );
}
