import { Bell, ChevronDown, UserCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import FlowAuthButton from "../FlowAuthButton";

export default function Header() {
  return (
    <header className={cn(
      "sticky top-0 z-20 glass backdrop-blur-xl border-b border-[color:var(--border)] h-16 flex items-center justify-between px-8"
    )}>
      <div className="flex items-center gap-5">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          FlowPay
        </h1>
      </div>
      <div className="flex items-center gap-8">
        <button className="relative group text-gray-500 hover:text-violet-700 focus:outline-none">
          <Bell className="w-6 h-6" />
          <span className="sr-only">Notifications</span>
          <span className="hidden group-hover:inline absolute top-7 left-1/2 -translate-x-1/2 surface-muted px-2 py-1 text-xs text-white rounded border border-[color:var(--border)]">Notifications</span>
        </button>
        <div className="hidden md:block min-w-[220px]">
          <FlowAuthButton />
        </div>
        {/* Profile Dropdown (future) */}
        <div className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl hover:bg-violet-100 active:bg-violet-100">
          <UserCircle className="w-8 h-8 text-violet-600" />
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
