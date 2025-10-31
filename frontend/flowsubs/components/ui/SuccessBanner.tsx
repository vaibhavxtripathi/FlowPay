"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessBanner({
  show,
  title,
  subtitle,
  onClose,
}: {
  show: boolean;
  title: string;
  subtitle?: string;
  onClose?: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 shadow-md px-5 py-4 flex items-start gap-3"
        >
          <div className="flex items-center justify-center mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{title}</div>
            {subtitle && (
              <div className="text-xs text-emerald-700/90 mt-0.5 font-mono break-all">
                {subtitle}
              </div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-emerald-700 hover:text-emerald-900"
            >
              Close
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


