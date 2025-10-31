import { cn, getStatusColor } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "status" | "outline";
  status?: string;
  className?: string;
}

export function Badge({ children, variant = "default", status, className }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

  if (variant === "status" && status) {
    return (
      <span className={cn(baseClasses, getStatusColor(status), className)}>
        {children}
      </span>
    );
  }

  const variants = {
    default: "bg-violet-100 text-violet-800 border border-violet-200",
    status: "border",
    outline: "border border-gray-300 text-gray-700 bg-transparent"
  };

  return (
    <span className={cn(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
}
