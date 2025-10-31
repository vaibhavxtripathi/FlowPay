"use client";
import { useState } from "react";
import * as fcl from "@onflow/fcl";
import "../../lib/flow-config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Donut from "../../components/ui/Donut";
import SuccessBanner from "../../components/ui/SuccessBanner";
import { useFlowUser } from "../../hooks/useFlowUser";
import { Lock, PiggyBank, Wallet, ArrowRightCircle } from "lucide-react";

const allocationDefaults = [
  { label: "Savings (Vault)", color: "#31D183", value: 0, icon: PiggyBank },
  { label: "DeFi Investments (Pool)", color: "#4F8DFD", value: 0, icon: Lock },
  { label: "Spending (Wallet)", color: "#FFC53D", value: 0, icon: Wallet },
];

export default function SubscriptionsSplitPage() {
  const { user } = useFlowUser();
  const [salary, setSalary] = useState(0);
  const [lock, setLock] = useState(false);
  const [alloc, setAlloc] = useState(() => [...allocationDefaults]);
  const remaining = 100 - alloc.reduce((sum, f) => sum + f.value, 0);
  const [banner, setBanner] = useState<{
    show: boolean;
    title: string;
    subtitle?: string;
  }>({ show: false, title: "" });
  const [optimizing, setOptimizing] = useState(false);
  const [suggested, setSuggested] = useState<number[] | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const handleSlider = (idx: number, newValue: number) => {
    let total = 0;
    const next = alloc.map((a, i) =>
      i === idx ? { ...a, value: newValue } : { ...a }
    );
    next.forEach((a, i) => {
      if (i !== idx) total += a.value;
    });
    if (total + newValue > 100) next[idx].value = Math.max(0, 100 - total);
    setAlloc(next);
  };
  const summary = {
    allocated: alloc.reduce((s, a) => s + a.value, 0),
    yield: 15,
    locked: lock ? 30 : 0,
  };
  const [payId, setPayId] = useState<string>("");
  const handleCreate = async () => {
    if (!salary || summary.allocated !== 100) {
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
    alloc.forEach((a) => {
      allocations[a.label] = ((salary * a.value) / 100).toFixed(2);
    });
    const addrNo0x = (
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xDeployer"
    ).replace(/^0x/, "");
    const contractName =
      process.env.NEXT_PUBLIC_CONTRACT_NAME || "SubscriptionManagerV2";
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
          arg(String(salary.toFixed(2)), t.UFix64),
          arg(
            Object.entries(allocations).map(([k, v]) => ({ key: k, value: v })),
            t.Dictionary({ key: t.String, value: t.UFix64 })
          ),
        ],
        limit: 200,
      });
      toast.loading(`Submitting… ${txId}`, { id: "create-sub" });
      const sealed = await fcl.tx(txId).onceSealed();
      toast.success(`Created! ${txId.slice(0, 8)}…`, { id: "create-sub" });
      setBanner({ show: true, title: "Subscription Created", subtitle: txId });
      fetch(`/api/transactions/${payerAddr}`).catch(() => {});
    } catch (e) {
      toast.error("Transaction failed");
    }
  };
  const handlePay = async () => {
    if (!payId) {
      toast.error("Enter a subscription ID");
      return;
    }
    const current = await fcl.currentUser().snapshot();
    const payerAddr = current?.addr;
    if (!payerAddr) {
      toast.error("Connect wallet first");
      return;
    }
    const addrNo0x = (
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xDeployer"
    ).replace(/^0x/, "");
    const contractName =
      process.env.NEXT_PUBLIC_CONTRACT_NAME || "SubscriptionManagerV2";
    const cadence = `
      import ${contractName} from 0x${addrNo0x}
      transaction(payer: Address, subID: UInt64) {
        prepare() {}
        execute {
          ${contractName}.paySubscription(payer: payer, subID: subID)
        }
      }
    `;
    try {
      const txId = await fcl.mutate({
        cadence,
        args: (arg, t) => [arg(payerAddr, t.Address), arg(payId, t.UInt64)],
        limit: 200,
      });
      toast.loading(`Paying… ${txId}`, { id: "pay-sub" });
      const sealed = await fcl.tx(txId).onceSealed();
      toast.success(`Paid! ${txId.slice(0, 8)}…`, { id: "pay-sub" });
      setBanner({ show: true, title: "Subscription Paid", subtitle: txId });
      fetch(`/api/transactions/${payerAddr}`).catch(() => {});
    } catch (e) {
      toast.error("Payment failed");
    }
  };
  const canSubmit = salary > 0 && remaining === 0;
  const animateAllocTo = (targets: number[]) => {
    const steps = 20;
    const duration = 400;
    const current = alloc.map((a) => a.value);
    const delta = targets.map((t, i) => (t - current[i]) / steps);
    let i = 0;
    setOptimizing(true);
    const id = setInterval(() => {
      i++;
      setAlloc((prev) =>
        prev.map((a, idx) => ({
          ...a,
          value: Math.round((current[idx] + delta[idx] * i) * 100) / 100,
        }))
      );
      if (i >= steps) {
        clearInterval(id);
        // snap to exact targets and ensure sum == 100
        setAlloc((prev) => {
          let vals = targets.slice();
          let sum = vals.reduce((s, n) => s + n, 0);
          if (sum !== 100) {
            vals[vals.length - 1] = Math.max(
              0,
              Math.min(100, vals[vals.length - 1] + (100 - sum))
            );
          }
          return prev.map((a, idx) => ({ ...a, value: vals[idx] }));
        });
        setOptimizing(false);
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 900);
      }
    }, duration / steps);
  };

  const optimizeSplit = async () => {
    if (!user.loggedIn || !user.addr) {
      toast.error("Connect wallet to analyze history");
      return;
    }
    try {
      const res = await fetch(`/api/transactions/${user.addr}`);
      const json = await res.json();
      const paid = (json?.events || []).filter(
        (e: any) => e.type === "SubscriptionPaid"
      );
      const last = paid.slice(0, 12);
      const amounts: number[] = last
        .map((e: any) => parseFloat(e.amount || "0"))
        .filter((n: number) => Number.isFinite(n));
      const avg = amounts.length
        ? amounts.reduce((s, n) => s + n, 0) / amounts.length
        : 0;
      let rec: [number, number, number]; // [Savings, DeFi, Spending]
      if (avg < 100) rec = [45, 35, 20];
      else if (avg < 300) rec = [35, 40, 25];
      else rec = [25, 35, 40];
      const total = rec.reduce((s, n) => s + n, 0);
      // normalize to 100 and clamp
      let targets = rec.map((n) =>
        Math.max(0, Math.min(100, Math.round((n / total) * 100)))
      );
      let sum = targets.reduce((s, n) => s + n, 0);
      if (sum !== 100) {
        const iMax = targets.indexOf(Math.max(...targets));
        targets[iMax] = Math.max(0, Math.min(100, targets[iMax] + (100 - sum)));
      }
      setSuggested(targets);
      animateAllocTo(targets);
      toast.success("Smart Split calculated from on-chain history");
    } catch (e) {
      toast.error("Failed to analyze history");
    }
  };
  return (
    <div className="w-full min-h-screen bg-[#FAFBFB] p-0">
      <section className="w-full max-w-6xl mx-auto px-5 py-12 flex flex-col gap-8">
        <SuccessBanner
          show={banner.show}
          title={banner.title}
          subtitle={banner.subtitle}
          onClose={() => setBanner({ show: false, title: "" })}
        />
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#101828] mb-2">
              Create a Split
            </h1>
            <p className="text-[#707480]">
              Automate recurring payments — allocate your amount across
              categories.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md py-6 px-6">
              <div className="font-semibold text-[#181A1B] mb-3">
                Monthly Amount
              </div>
              <div className="flex items-end gap-3">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="bg-[#F8F9FA] text-2xl font-bold rounded-xl border border-[#F3F3F3] p-4 w-56"
                  placeholder="0.00"
                  value={salary || ""}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                />
                <span className="text-lg text-[#13B26B] font-bold">FLOW</span>
                <span className="ml-auto text-sm text-gray-500">
                  Remaining: {Math.max(0, remaining)}%
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md py-6 px-6 flex flex-col gap-4">
              <div className="font-semibold text-[#181A1B]">Allocations</div>
              {alloc.map((a, i) => (
                <div
                  key={a.label}
                  className="rounded-xl border border-[#F3F3F3] p-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shadow"
                      style={{ background: a.color + "22" }}
                    >
                      <a.icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <div className="text-sm font-semibold text-[#181A1B]">
                      {a.label}
                    </div>
                    <div className="ml-auto font-mono text-sm text-[#13B26B]">
                      {((salary * a.value) / 100).toFixed(2)} FLOW
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={
                      100 -
                      alloc.reduce(
                        (s, _, idx) => s + (idx !== i ? alloc[idx].value : 0),
                        0
                      )
                    }
                    value={a.value}
                    onChange={(e) => handleSlider(i, parseInt(e.target.value))}
                    className="w-full accent-[#13B26B]"
                  />
                  <div className="flex justify-between text-xs text-[#72A840] mt-1">
                    <span>{a.value}%</span>
                    <span>Max: 100%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-md py-5 px-6 flex items-center gap-6">
              <div className="flex-1 flex flex-col">
                <label className="font-semibold text-[#181A1B] text-md mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#4F8DFD]" /> Lock in Vault (30
                  days)
                </label>
                <span className="text-xs text-[#707480]">
                  Earn additional 2% APY on locked savings
                </span>
              </div>
              <input
                type="checkbox"
                checked={lock}
                onChange={() => setLock(!lock)}
                className="w-6 h-6 accent-[#4F8DFD]"
              />
            </div>
            <div className="bg-[#F8F9FA] rounded-xl p-5 text-[#181A1B] flex items-center gap-6 relative overflow-hidden">
              {celebrate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute -top-2 left-10 text-2xl">✨</div>
                  <div className="absolute top-2 right-14 text-2xl">🎉</div>
                  <div className="absolute bottom-3 left-1/3 text-2xl">🌟</div>
                </motion.div>
              )}
              <div className="flex-1">
                <div className="font-semibold mb-1">Summary</div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="font-bold text-[#13B26B]">
                    {summary.allocated}% Allocated
                  </span>
                  <span className="text-[#707480]">
                    {100 - summary.allocated}% Remaining
                  </span>
                  <span className="text-[#707480]">
                    {summary.yield}% Expected Yield
                  </span>
                  <span className="text-[#707480]">
                    {summary.locked} Lock Days
                  </span>
                </div>
                {suggested && (
                  <div className="mt-1 text-xs text-gray-600">
                    Suggested: {suggested[0]}% Savings, {suggested[1]}%
                    Investments, {suggested[2]}% Spending
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Powered by on-chain analytics
                </div>
              </div>
              <button
                disabled={!canSubmit}
                onClick={handleCreate}
                className={`px-7 py-3 rounded-xl text-white font-semibold text-lg flex items-center gap-2 shadow-md transition ${
                  canSubmit
                    ? "bg-[#13B26B] hover:bg-[#10a95c]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Create Split <ArrowRightCircle className="w-5 h-5" />
              </button>
              <button
                onClick={optimizeSplit}
                disabled={optimizing}
                className="px-4 py-3 rounded-xl border border-violet-200 text-violet-700 font-semibold text-sm hover:bg-violet-50 transition"
              >
                {optimizing ? "Optimizing…" : "Optimize Split"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Donut
              data={alloc.map((a) => ({
                name: a.label,
                value: a.value,
                color: a.color,
              }))}
            />
            <div className="bg-white rounded-2xl shadow-md py-5 px-6 flex items-center gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-[#181A1B] text-md mb-1">
                  Pay Subscription
                </label>
                <span className="text-xs text-[#707480]">
                  Enter a subscription ID to pay now
                </span>
              </div>
              <input
                type="number"
                placeholder="ID"
                className="bg-[#F8F9FA] rounded-xl border border-[#F3F3F3] p-3 w-28"
                value={payId}
                onChange={(e) => setPayId(e.target.value)}
              />
              <button
                onClick={handlePay}
                className="px-5 py-3 rounded-xl bg-[#4F8DFD] text-white font-semibold text-sm shadow-md hover:bg-[#3f79e0] transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
