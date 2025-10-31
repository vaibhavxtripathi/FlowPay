"use client";
import { motion } from "framer-motion";
import FlowAuthButton from "../components/FlowAuthButton";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Coins,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[color:var(--border)] mb-6">
            <Zap className="w-4 h-4 text-[color:var(--accent)]" />
            <span className="text-sm text-[color:var(--muted)]">
              Powered by Flow Blockchain
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mb-6 leading-tight">
            The Financial OS for{" "}
            <span className="gradient-text">Web3 Teams</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[color:var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Automated team payouts on-chain. Split revenue, manage treasury, and
            distribute funds with complete transparency.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="/dashboard"
              className="group px-6 py-3 rounded-xl cta font-semibold flex items-center gap-2 shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <FlowAuthButton />
          </div>

          <div className="mt-16 flex flex-wrap gap-8 justify-center items-center text-sm text-[color:var(--muted)]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[color:var(--accent)]" />
              <span>On-chain security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[color:var(--accent)]" />
              <span>Instant execution</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[color:var(--accent)]" />
              <span>Built for teams</span>
            </div>
          </div>
        </motion.div>

        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[color:var(--accent)]/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-32 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Everything you need to manage team finances
          </h2>
          <p className="text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
            Powerful tools designed for DAOs, teams, and communities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Coins,
              title: "Instant Split Payouts",
              description:
                "Distribute shared income automatically across team wallets with a single transaction.",
              color: "from-emerald-500 to-teal-500",
            },
            {
              icon: Shield,
              title: "Transparent Activity",
              description:
                "Every transaction is recorded on-chain. Full audit trail and complete visibility for all members.",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: BarChart3,
              title: "Treasury Dashboard",
              description:
                "Track total funds, member shares, and payout history with real-time analytics.",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: TrendingUp,
              title: "Smart Auto-Split",
              description:
                "AI-powered suggestions based on historical data and on-chain activity patterns.",
              color: "from-orange-500 to-red-500",
            },
            {
              icon: Users,
              title: "Role-Based Access",
              description:
                "Granular permissions for admins and members. Control who can create and approve payouts.",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: Zap,
              title: "One-Click Execution",
              description:
                "No complicated multi-sig. Execute payouts instantly with your connected wallet.",
              color: "from-green-500 to-emerald-500",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group surface p-6 rounded-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:shadow-lg transition-shadow`}
              >
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="relative px-6 py-32 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Built for the future of work
          </h2>
          <p className="text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
            FlowGuild reimagines team payments for the on-chain era
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="surface rounded-2xl p-8"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[color:var(--accent)] to-teal-500 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Trustless & Transparent</h3>
            <p className="text-[color:var(--muted)] leading-relaxed mb-4">
              Every transaction is recorded on Flow blockchain. No hidden fees,
              no intermediaries, no trust required. Your team can verify every
              payout independently.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full surface-muted text-xs text-[color:var(--accent)]">
                On-chain
              </span>
              <span className="px-3 py-1 rounded-full surface-muted text-xs text-[color:var(--accent)]">
                Verifiable
              </span>
              <span className="px-3 py-1 rounded-full surface-muted text-xs text-[color:var(--accent)]">
                Immutable
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="surface rounded-2xl p-8"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast Execution</h3>
            <p className="text-[color:var(--muted)] leading-relaxed mb-4">
              Powered by Flow's high-performance blockchain, execute complex
              multi-party payouts in seconds. No more waiting days for bank
              transfers.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full surface-muted text-xs text-blue-400">
                Instant
              </span>
              <span className="px-3 py-1 rounded-full surface-muted text-xs text-blue-400">
                Low-cost
              </span>
              <span className="px-3 py-1 rounded-full surface-muted text-xs text-blue-400">
                Scalable
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 md:p-12 border border-[color:var(--border)]"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[color:var(--accent)] mb-2">
                100%
              </div>
              <div className="text-sm text-[color:var(--muted)]">
                Transparent
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1">
                All transactions public
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[color:var(--accent)] mb-2">
                &lt;2s
              </div>
              <div className="text-sm text-[color:var(--muted)]">
                Execution Time
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1">
                Average payout speed
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[color:var(--accent)] mb-2">
                $0.001
              </div>
              <div className="text-sm text-[color:var(--muted)]">
                Transaction Cost
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1">
                Typical Flow fee
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-32 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 md:p-20 border border-[color:var(--border)]"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to automate your team treasury?
          </h2>
          <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
            Join teams already using FlowGuild to manage their on-chain finances
          </p>
          <a
            href="/dashboard"
            className="inline-flex px-6 py-3 rounded-xl cta font-semibold items-center gap-2 shadow-xl"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
