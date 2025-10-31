"use client";
import { useEffect, useMemo, useState } from "react";
import { useFlowUser } from "../../hooks/useFlowUser";
import { StatsCard } from "../../components/ui/StatsCard";
import { Chart } from "../../components/ui/Chart";
import Donut from "../../components/ui/Donut";
import { Timeline } from "../../components/ui/Timeline";
import { Wallet, TrendingUp, DollarSign, Coins, Zap, RefreshCw } from "lucide-react";
import { fetchFlowBalance } from "../../lib/flow-scripts";
import toast from "react-hot-toast";

type ApiEvent = {
  id: string;
  type: "PayoutCreated" | "PayoutExecuted" | "PayoutCanceled";
  subscriptionID: string;
  payer: string;
  payee: string;
  amount?: string;
  timestamp: string;
  transactionId: string;
};

export default function DashboardPage() {
  const { user } = useFlowUser();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Guild Vault State
  const [vaultBalance, setVaultBalance] = useState(1000); // Initial vault balance
  const [autoCompounding, setAutoCompounding] = useState(true);
  const [vaultGrowthData, setVaultGrowthData] = useState<{ time: string; balance: number }[]>([]);
  const [vaultYieldThisMonth, setVaultYieldThisMonth] = useState(0);

  const fetchTx = async () => {
    if (!user.loggedIn || !user.addr) {
      toast.error("Connect your wallet to fetch transactions");
      return;
    }
    setLoading(true);
    toast.loading("Refreshing guild activity...", { id: "refresh-tx" });
    try {
      const res = await fetch(`/api/transactions/${user.addr}`);
      const json = await res.json();
      if (json?.events) {
        setEvents(json.events);
        toast.success(`Loaded ${json.events.length} events`, { id: "refresh-tx" });
      } else {
        toast.success("Activity refreshed", { id: "refresh-tx" });
      }
    } catch (e) {
      toast.error("Failed to fetch transactions", { id: "refresh-tx" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTx();
  }, [user.loggedIn, user.addr]);

  // Simulate 5–10% monthly yield growth visually
  const yieldSeries = useMemo(() => {
    // 12 months history, base 1000 FLOW
    let value = 1000;
    const data: { month: string; balance: number }[] = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    for (let i = 0; i < 12; i++) {
      const growth = 1 + (0.05 + Math.random() * 0.05); // 5–10%
      value = parseFloat((value * growth).toFixed(2));
      data.push({ month: months[i], balance: value });
    }
    return data;
  }, []);

  const [onchainBalance, setOnchainBalance] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      if (!user.loggedIn || !user.addr) {
        setOnchainBalance(null);
        return;
      }
      try {
        setOnchainBalance(await fetchFlowBalance(user.addr));
      } catch {}
    })();
  }, [user.loggedIn, user.addr]);
  const totalBalance =
    onchainBalance ?? (yieldSeries[yieldSeries.length - 1]?.balance || 0);
  const monthlyYieldPct = useMemo(() => {
    if (yieldSeries.length < 2) return 0;
    const prev = yieldSeries[yieldSeries.length - 2].balance;
    const curr = yieldSeries[yieldSeries.length - 1].balance;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(2));
  }, [yieldSeries]);

  const topCategories = useMemo(() => {
    // simple demo categories based on events types
    const counts: Record<string, number> = { Payouts: 0, Other: 0 };
    events.forEach((e) => {
      if (e.type === "PayoutExecuted" || e.type === "PayoutCreated")
        counts["Payouts"] += 1;
      else counts["Other"] += 1;
    });
    const total = Math.max(1, counts.Payouts + counts.Other);
    return {
      payouts: Math.round((counts.Payouts / total) * 100),
      other: Math.round((counts.Other / total) * 100),
    };
  }, [events]);

  const nextPayment = useMemo(() => {
    const paid = events.find((e) => e.type === "PayoutExecuted");
    const created = events.find((e) => e.type === "PayoutCreated");
    const base = paid?.timestamp || created?.timestamp;
    if (!base) return null;
    const d = new Date(base);
    d.setDate(d.getDate() + 30);
    return d;
  }, [events]);

  // Compute total distributed from events
  const totalDistributed = useMemo(() => {
    return events
      .filter((e) => e.type === "PayoutExecuted")
      .reduce((sum, e) => sum + (parseFloat(e.amount || "0") || 0), 0);
  }, [events]);

  // Initialize vault growth data
  useEffect(() => {
    if (vaultGrowthData.length === 0) {
      const now = new Date();
      const hours: { time: string; balance: number }[] = [];
      let currentBalance = vaultBalance;
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        hours.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          balance: currentBalance * Math.pow(1.00015, i), // Simulate past growth
        });
      }
      setVaultGrowthData(hours);
    }
  }, [vaultBalance, vaultGrowthData.length]);

  // Auto-compounding simulation
  useEffect(() => {
    if (!autoCompounding) return;
    
    const interval = setInterval(() => {
      setVaultBalance((prev) => {
        const growthRate = 1.00003; // ~0.003% every 3 seconds = ~8% monthly
        const newBalance = prev * growthRate;
        
        // Update growth data
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        setVaultGrowthData((prevData) => {
          const newData = [...prevData.slice(-23), { time: currentTime, balance: newBalance }];
          return newData;
        });
        
        // Update monthly yield
        const monthlyGrowth = ((newBalance / 1000 - 1) * 100);
        setVaultYieldThisMonth(monthlyGrowth);
        
        return newBalance;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [autoCompounding]);

  // Track processed payout IDs to avoid double-deducting
  const [processedPayoutIds, setProcessedPayoutIds] = useState<Set<string>>(new Set());

  // Deduct payout amounts from vault when payouts execute
  useEffect(() => {
    const executedPayouts = events.filter((e) => e.type === "PayoutExecuted");
    executedPayouts.forEach((payout) => {
      if (!processedPayoutIds.has(payout.id)) {
        const payoutAmount = parseFloat(payout.amount || "0");
        if (payoutAmount > 0) {
          setVaultBalance((prev) => {
            const newBalance = Math.max(0, prev - payoutAmount);
            toast.success(`Payout of ${payoutAmount.toFixed(2)} FLOW deducted from vault`, {
              icon: "💰",
            });
            return newBalance;
          });
          setProcessedPayoutIds((prev) => new Set([...prev, payout.id]));
        }
      }
    });
  }, [events, processedPayoutIds]);

  const memberShares = useMemo(() => {
    const map = new Map<string, number>();
    events
      .filter((e) => e.type === "PayoutExecuted")
      .forEach((e) => {
        const amt = parseFloat(e.amount || "0");
        if (!Number.isFinite(amt)) return;
        map.set(e.payee, (map.get(e.payee) || 0) + amt);
      });
    const entries = Array.from(map.entries());
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    return entries.map(([addr, v], i) => ({
      name: addr,
      value: Math.round((v / total) * 100),
      color: ["#31D183", "#4F8DFD", "#FFC53D", "#00AEEF", "#8B5CF6"][i % 5],
    }));
  }, [events]);

  return (
    <div className="w-full min-h-screen pb-20">
      <section className="w-full max-w-7xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Guild Treasury Overview
          </h1>
          <p className="text-[color:var(--muted)]">
            Automated team payouts and transparent guild activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<Wallet className="w-5 h-5" />}
            label="Total Treasury"
            value={`${totalBalance.toLocaleString()}`}
            status={
              <span className="text-xs text-[color:var(--muted)]">FLOW</span>
            }
          />
          <StatsCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Monthly Yield"
            value={`${monthlyYieldPct}%`}
            status={
              <span className="text-[color:var(--accent)] text-xs">
                Avg 5–10%
              </span>
            }
          />
          <StatsCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Distributed"
            value={`${totalDistributed.toFixed(2)}`}
            status={
              <span className="text-xs text-[color:var(--muted)]">FLOW</span>
            }
          />
          <StatsCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Active Members"
            value={`${new Set(events.map((e) => e.payee)).size}`}
          />
        </div>

        {/* Guild Vault Section */}
        <div className="mb-8 surface rounded-2xl p-6 border border-[color:var(--border)] relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent opacity-0 transition-opacity duration-300 ${autoCompounding ? 'opacity-100' : ''}`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Guild Vault Is Working for You</h2>
                <p className="text-sm text-[color:var(--muted)]">
                  Idle treasury funds automatically earn yield through Flow's DeFi vaults — compounding continuously.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded ${autoCompounding ? 'bg-[color:var(--accent)]/20 text-[color:var(--accent)]' : 'bg-white/5 text-[color:var(--muted)]'}`}>
                  {autoCompounding ? 'ON' : 'OFF'}
                </span>
                <button
                  onClick={() => {
                    const newState = !autoCompounding;
                    setAutoCompounding(newState);
                    if (newState) {
                      toast.success("Auto-compounding enabled. Your vault is now earning yield!");
                    } else {
                      toast("Auto-compounding paused", { icon: "⏸️" });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2 focus:ring-offset-[color:var(--background)] ${
                    autoCompounding ? 'bg-[color:var(--accent)]' : 'bg-white/10'
                  }`}
                  title={autoCompounding ? "Simulated compounding for demo. Represents automated yield optimization on Flow." : "Click to enable auto-compounding"}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoCompounding ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatsCard
                icon={<Coins className="w-5 h-5" />}
                label="Guild Treasury"
                value={`${vaultBalance.toFixed(2)}`}
                status={<span className="text-xs text-[color:var(--muted)]">FLOW</span>}
              />
              <StatsCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Auto-Compound Yield"
                value={`+${vaultYieldThisMonth.toFixed(2)}%`}
                status={
                  <span className="text-[color:var(--accent)] text-xs">
                    {autoCompounding ? 'This month' : 'Paused'}
                  </span>
                }
              />
              <StatsCard
                icon={<Zap className="w-5 h-5" />}
                label="Auto-Compounding"
                value={autoCompounding ? 'Active' : 'Paused'}
                status={
                  <span className={`text-xs ${autoCompounding ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)]'}`}>
                    {autoCompounding ? 'Earning yield' : 'Disabled'}
                  </span>
                }
              />
            </div>

            <div className="mb-4">
              <Chart
                title="Vault Growth Over Time"
                data={vaultGrowthData}
                xKey="time"
                yKey="balance"
                type="line"
                color="#00ef8b"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              <Zap className="w-3.5 h-3.5" />
              <span>Unallocated funds are auto-deployed into Flow yield pools. Simulated compounding growth shown below.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Chart
              title="Yield Growth (Simulated)"
              data={yieldSeries}
              xKey="month"
              yKey="balance"
              type="line"
              color="#7C3AED"
            />
          </div>
          <div className="surface rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Guild Activity
              </h3>
              <button
                onClick={fetchTx}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[color:var(--border)] text-white hover:bg-[color:var(--card-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {events.length ? (
              <Timeline
                events={events.slice(0, 8).map((e) => ({
                  type:
                    e.type === "PayoutExecuted"
                      ? "paid"
                      : e.type === "PayoutCreated"
                      ? "created"
                      : "default",
                  label: e.type,
                  date: e.timestamp,
                  meta: `Sub #${e.subscriptionID} · ${e.transactionId.slice(
                    0,
                    8
                  )}…`,
                }))}
              />
            ) : (
              <div className="text-sm text-[color:var(--muted)] py-6 text-center">
                {user.loggedIn
                  ? "No guild payout activity yet."
                  : "Connect your wallet to see activity."}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="surface rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Member Share Distribution
            </h3>
            <Donut
              data={
                memberShares.length
                  ? memberShares
                  : [{ name: "—", value: 100, color: "#333" }]
              }
            />
          </div>
          <div className="surface rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Smart Auto-Split
            </h3>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed">
              Suggest member shares based on your payout history.
            </p>
          </div>
          <div className="surface rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Next Payout (est.)
            </h3>
            <p className="text-2xl font-bold text-[color:var(--accent)]">
              {nextPayment ? nextPayment.toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
