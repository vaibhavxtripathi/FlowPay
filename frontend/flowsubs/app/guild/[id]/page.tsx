"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { StatsCard } from "../../../components/ui/StatsCard";
import { Timeline } from "../../../components/ui/Timeline";
import Donut from "../../../components/ui/Donut";
import { Wallet, Users, DollarSign } from "lucide-react";

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

export default function PublicGuildPage() {
  const params = useParams<{ id: string }>();
  const guildId = params?.id;
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!guildId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transactions/${guildId}`);
        const json = await res.json();
        if (json?.events) setEvents(json.events);
      } finally {
        setLoading(false);
      }
    })();
  }, [guildId]);

  const totalDistributed = useMemo(() => {
    return events
      .filter((e) => e.type === "PayoutExecuted")
      .reduce((sum, e) => sum + (parseFloat(e.amount || "0") || 0), 0);
  }, [events]);

  const members = useMemo(() => {
    const unique = Array.from(new Set(events.map((e) => e.payee)));
    return unique;
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
    <div className="w-full min-h-screen bg-[#FAFBFB] pb-20">
      <section className="w-full max-w-7xl mx-auto px-5 py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#101828]">Public Guild</h1>
          <p className="text-[#707480] mt-1">Read-only view for guild activity and member shares.</p>
          <div className="mt-2 text-xs text-[color:var(--muted)]">Guild ID: {guildId}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard icon={<Wallet className="w-5 h-5" />} label="Total Distributed" value={`${totalDistributed.toFixed(2)} FLOW`} />
          <StatsCard icon={<Users className="w-5 h-5" />} label="Active Members" value={`${members.length}`} />
          <StatsCard icon={<DollarSign className="w-5 h-5" />} label="Recent Payouts" value={`${events.filter((e) => e.type === "PayoutExecuted").length}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Guild Activity</h3>
              {loading && <span className="text-xs text-[color:var(--muted)]">Loading…</span>}
            </div>
            {events.length ? (
              <Timeline
                events={events.slice(0, 12).map((e) => ({
                  type: e.type === "PayoutExecuted" ? "paid" : e.type === "PayoutCreated" ? "created" : "default",
                  label: e.type,
                  date: e.timestamp,
                  meta: `${e.transactionId.slice(0, 8)}… · ${e.payee}`,
                }))}
              />
            ) : (
              <div className="text-sm text-[color:var(--muted)] py-6 text-center">No activity yet.</div>
            )}
          </div>
          <div className="surface rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Member Roles</h3>
            <ul className="space-y-2">
              {members.length ? (
                members.map((addr, i) => (
                  <li key={addr} className="flex items-center justify-between text-sm text-white">
                    <span className="font-mono text-xs">{addr.slice(0, 12)}...</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${i === 0 ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]" : "surface-muted text-[color:var(--muted)]"}`}>
                      {i === 0 ? "Admin" : "Member"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-[color:var(--muted)]">No members yet.</li>
              )}
            </ul>
            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Share Distribution</h3>
            <Donut data={memberShares.length ? memberShares : [{ name: "—", value: 100, color: "#e5e7eb" }]} />
          </div>
        </div>
      </section>
    </div>
  );
}


