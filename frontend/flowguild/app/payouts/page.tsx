"use client";
import { useState } from "react";
import * as fcl from "@onflow/fcl";
import "../../lib/flow-config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Donut from "../../components/ui/Donut";
import SuccessBanner from "../../components/ui/SuccessBanner";
import { useFlowUser } from "../../hooks/useFlowUser";
import { Users, Wallet, ArrowRightCircle } from "lucide-react";

type Member = { label: string; color: string; value: number };

const defaultMembers: Member[] = [
  { label: "Member A", color: "#31D183", value: 0 },
  { label: "Member B", color: "#4F8DFD", value: 0 },
  { label: "Member C", color: "#FFC53D", value: 0 },
];

export default function CreatePayoutPage() {
  const { user } = useFlowUser();
  const [amount, setAmount] = useState(0);
  const [members, setMembers] = useState<Member[]>(() => [...defaultMembers]);
  const remaining = 100 - members.reduce((sum, m) => sum + m.value, 0);
  const [banner, setBanner] = useState<{ show: boolean; title: string; subtitle?: string }>({ show: false, title: "" });
  const [optimizing, setOptimizing] = useState(false);

  const handleSlider = (idx: number, newValue: number) => {
    const next = members.map((m, i) => (i === idx ? { ...m, value: newValue } : { ...m }));
    const others = next.reduce((s, m, i) => s + (i !== idx ? m.value : 0), 0);
    if (others + newValue > 100) next[idx].value = Math.max(0, 100 - others);
    setMembers(next);
  };

  const animateAllocTo = (targets: number[]) => {
    const steps = 20;
    const duration = 400;
    const current = members.map((m) => m.value);
    const delta = targets.map((t, i) => (t - current[i]) / steps);
    let i = 0;
    setOptimizing(true);
    const id = setInterval(() => {
      i++;
      setMembers((prev) =>
        prev.map((m, idx) => ({ ...m, value: Math.round((current[idx] + delta[idx] * i) * 100) / 100 }))
      );
      if (i >= steps) {
        clearInterval(id);
        setMembers((prev) => {
          let vals = targets.slice();
          let sum = vals.reduce((s, n) => s + n, 0);
          if (sum !== 100) {
            vals[vals.length - 1] = Math.max(0, Math.min(100, vals[vals.length - 1] + (100 - sum)));
          }
          return prev.map((m, idx) => ({ ...m, value: vals[idx] }));
        });
        setOptimizing(false);
        toast.success("Optimized split based on on-chain history.");
      }
    }, duration / steps);
  };

  const suggestSplit = async () => {
    if (!user.loggedIn || !user.addr) {
      toast.error("Connect wallet to analyze history");
      return;
    }
    try {
      const res = await fetch(`/api/transactions/${user.addr}`);
      const json = await res.json();
      const paid = (json?.events || []).filter((e: any) => e.type === "PayoutExecuted");
      const last = paid.slice(0, 12);
      const amounts: number[] = last
        .map((e: any) => parseFloat(e.amount || "0"))
        .filter((n: number) => Number.isFinite(n));
      const avg = amounts.length ? amounts.reduce((s, n) => s + n, 0) / amounts.length : 0;
      let rec: number[];
      if (avg < 100) rec = [50, 30, 20];
      else if (avg < 300) rec = [40, 35, 25];
      else rec = [30, 40, 30];
      const total = rec.reduce((s, n) => s + n, 0);
      let targets = rec.map((n) => Math.max(0, Math.min(100, Math.round((n / total) * 100))));
      let sum = targets.reduce((s, n) => s + n, 0);
      if (sum !== 100) {
        const iMax = targets.indexOf(Math.max(...targets));
        targets[iMax] = Math.max(0, Math.min(100, targets[iMax] + (100 - sum)));
      }
      animateAllocTo(targets);
    } catch (e) {
      toast.error("Failed to analyze history");
    }
  };

  const handleExecute = async () => {
    if (!amount || remaining !== 0) {
      toast.error("Enter amount and allocate 100%.");
      return;
    }
    const current = await fcl.currentUser().snapshot();
    const payerAddr = current?.addr;
    if (!payerAddr) {
      toast.error("Connect wallet first");
      return;
    }
    const allocations: Record<string, string> = {};
    members.forEach((m) => {
      allocations[m.label] = ((amount * m.value) / 100).toFixed(2);
    });
    const addrNo0x = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xDeployer").replace(/^0x/, "");
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || "SubscriptionManagerV2";
    const cadence = `
      import ${contractName} from 0x${addrNo0x}
      transaction(payer: Address, amount: UFix64, allocations: {String: UFix64}) {
        prepare() {}
        execute {
          ${contractName}.createSubscription(payer: payer, amount: amount, allocations: allocations)
        }
      }
    `;
    try {
      const txId = await fcl.mutate({
        cadence,
        args: (arg, t) => [
          arg(payerAddr, t.Address),
          arg(String(amount.toFixed(2)), t.UFix64),
          arg(
            Object.entries(allocations).map(([k, v]) => ({ key: k, value: v })),
            t.Dictionary({ key: t.String, value: t.UFix64 })
          ),
        ],
        limit: 200,
      });
      toast.loading(`Submitting… ${txId}`, { id: "create-payout" });
      await fcl.tx(txId).onceSealed();
      toast.success(`Guild payout executed! Tx: ${txId.slice(0, 8)}…`, { id: "create-payout" });
      setBanner({ show: true, title: "Payout Executed", subtitle: txId });
      fetch(`/api/transactions/${payerAddr}`).catch(() => {});
    } catch (e) {
      toast.error("Transaction failed");
    }
  };

  const canSubmit = amount > 0 && remaining === 0;

  return (
    <div className="w-full min-h-screen p-0">
      <section className="w-full max-w-6xl mx-auto px-5 py-12 flex flex-col gap-8">
        <SuccessBanner
          show={banner.show}
          title={banner.title}
          subtitle={banner.subtitle}
          onClose={() => setBanner({ show: false, title: "" })}
        />

        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create New Guild Payout</h1>
            <p className="text-[color:var(--muted)]">Distribute shared income across team members automatically.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="surface rounded-2xl py-6 px-6">
              <div className="font-semibold text-white mb-3">Total Amount to Distribute</div>
              <div className="flex items-end gap-3">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="surface-muted text-2xl font-bold rounded-xl p-4 w-56 text-white"
                  placeholder="0.00"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
                <span className="text-lg text-[color:var(--accent)] font-bold">FLOW</span>
                <span className="ml-auto text-sm text-[color:var(--muted)]">Remaining: {Math.max(0, remaining)}%</span>
              </div>
            </div>

            <div className="surface rounded-2xl py-6 px-6 flex flex-col gap-4">
              <div className="font-semibold text-white">Member Allocations</div>
              {members.map((m, i) => (
                <div key={m.label} className="rounded-xl surface-muted p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10" style={{ background: m.color + "22" }}>
                      <Users className="w-5 h-5" style={{ color: m.color }} />
                    </div>
                    <div className="text-sm font-semibold text-white">{m.label}</div>
                    <div className="ml-auto font-mono text-sm text-[color:var(--accent)]">{((amount * m.value) / 100).toFixed(2)} FLOW</div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100 - members.reduce((s, _, idx) => s + (idx !== i ? members[idx].value : 0), 0)}
                    value={m.value}
                    onChange={(e) => handleSlider(i, parseInt(e.target.value))}
                    className="w-full accent-[color:var(--accent)]"
                  />
                  <div className="flex justify-between text-xs text-[color:var(--muted)] mt-1">
                    <span>{m.value}%</span>
                    <span>Max: 100%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="surface rounded-xl p-5 flex items-center gap-6">
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">Summary</div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="font-bold text-[color:var(--accent)]">{100 - remaining}% Allocated</span>
                  <span className="text-[color:var(--muted)]">{remaining}% Remaining</span>
                </div>
                <div className="mt-2 text-xs text-[color:var(--muted)]">Powered by Find Labs</div>
              </div>
              <button
                disabled={!canSubmit}
                onClick={handleExecute}
                className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition ${
                  canSubmit ? "cta" : "bg-white/10 cursor-not-allowed"
                }`}
              >
                Execute Payout <ArrowRightCircle className="w-4 h-4" />
              </button>
              <button
                onClick={suggestSplit}
                disabled={optimizing}
                className="px-4 py-2.5 rounded-xl border border-[color:var(--border)] text-white font-semibold text-sm hover:bg-[color:var(--card-hover)] transition"
              >
                {optimizing ? "Optimizing…" : "Suggest Split"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Donut
              data={members.map((m) => ({ name: m.label, value: m.value, color: m.color }))}
            />
            <div className="surface rounded-2xl py-5 px-6 flex items-center gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-white text-md mb-1">Quick Execute</label>
                <span className="text-xs text-[color:var(--muted)]">Payout executes immediately to member wallets.</span>
              </div>
              <Wallet className="w-5 h-5 text-[color:var(--accent)] ml-auto" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


