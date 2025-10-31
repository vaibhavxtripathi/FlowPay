"use client";
import { useEffect, useMemo, useState } from "react";
import { useFlowUser } from "../../hooks/useFlowUser";
import { StatsCard } from "../../components/ui/StatsCard";
import { Chart } from "../../components/ui/Chart";
import Donut from "../../components/ui/Donut";
import { Timeline } from "../../components/ui/Timeline";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";
import { fetchFlowBalance } from "../../lib/flow-scripts";

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

  const fetchTx = async () => {
    if (!user.loggedIn || !user.addr) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${user.addr}`);
      const json = await res.json();
      if (json?.events) setEvents(json.events);
    } catch (e) {
      // swallow for demo
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
              {loading && (
                <span className="text-xs text-[color:var(--muted)]">
                  Loading…
                </span>
              )}
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
