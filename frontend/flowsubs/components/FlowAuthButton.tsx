"use client";

import { motion } from "framer-motion";
import { useFlowUser } from "../hooks/useFlowUser";
import { Wallet, LogOut, CheckCircle } from "lucide-react";
import { formatAddress } from "../lib/utils";

export default function FlowAuthButton() {
  const { user, logIn, logOut } = useFlowUser();

  if (!user.loggedIn) {
    return (
      <motion.button
        onClick={logIn}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-3 rounded-xl border border-[color:var(--border)] text-white font-semibold hover:bg-[color:var(--card-hover)] transition-colors shadow-lg"
      >
        <span className="inline-flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Connect Wallet
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] surface px-4 py-2.5 shadow-lg">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--accent)]">
          <CheckCircle className="w-3.5 h-3.5 text-white" />
        </span>
        <span className="text-xs font-mono text-white">
          {formatAddress(user.addr || "")}
        </span>
        <button
          onClick={logOut}
          className="ml-1 text-xs text-[color:var(--muted)] hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
