import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl surface",
        gradient && "bg-gradient-to-br from-white/5 to-transparent",
        hover && "hover:scale-[1.02] transition-all",
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("px-6 pb-6", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-bold text-white mb-2", className)}>
      {children}
    </h3>
  );
}
