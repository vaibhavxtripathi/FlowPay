import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, CreditCard, User } from "lucide-react";
import { formatAddress, formatFlow, formatDate } from "../../lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";

interface Subscription {
  id: string;
  payee: string;
  amount: string;
  interval: number;
  gracePeriod: number;
  lastPaidAt: string | null;
  isActive: boolean;
}

interface TableProps {
  data: Subscription[];
  loading?: boolean;
  onPay?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function SubscriptionsTable({ data, loading, onPay, onCancel }: TableProps) {
  const columns = useMemo(() => [
    {
      label: "ID",
      render: (sub: Subscription) => (
        <span className="font-mono text-gray-500">#{sub.id}</span>
      ),
    },
    {
      label: "Payee",
      render: (sub: Subscription) => (
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-gradient-to-br from-violet-400 to-purple-500 w-8 h-8 flex items-center justify-center text-white font-semibold">
            <User className="w-4 h-4" />
          </span>
          <span className="font-mono text-xs">{formatAddress(sub.payee)}</span>
        </span>
      )
    },
    {
      label: "Amount (FLOW)",
      render: (sub: Subscription) => (
        <span className="font-bold text-emerald-600">{formatFlow(sub.amount)}</span>
      )
    },
    {
      label: "Interval",
      render: (sub: Subscription) => (
        <span className="text-sm">{sub.interval}</span>
      )
    },
    {
      label: "Status",
      render: (sub: Subscription) => (
        <span>
          {sub.isActive ? (
            sub.lastPaidAt ? (
              <Badge variant="status" status="active">
                <CheckCircle className="w-4 h-4 inline-block mr-1" /> Paid
              </Badge>
            ) : (
              <Badge variant="status" status="pending">
                <Clock className="w-4 h-4 inline-block mr-1" /> Pending
              </Badge>
            )
          ) : (
            <Badge variant="status" status="canceled">
              <XCircle className="w-4 h-4 inline-block mr-1" /> Canceled
            </Badge>
          )}
        </span>
      )
    },
    {
      label: "Last Paid",
      render: (sub: Subscription) => (
        <span className="font-mono text-xs text-gray-500">
          {sub.lastPaidAt ? formatDate(sub.lastPaidAt) : "Never"}
        </span>
      )
    },
    {
      label: "Actions",
      render: (sub: Subscription) =>
        sub.isActive ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onPay && onPay(sub.id)}>
              Pay
            </Button>
            <Button size="sm" variant="danger" onClick={() => onCancel && onCancel(sub.id)}>
              Cancel
            </Button>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No actions</span>
        )
    },
  ], [onPay, onCancel]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        <span className="ml-4 text-gray-600">Loading subscriptions...</span>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 pt-20">No subscriptions yet.</div>
    );
  }

  return (
    <div className="rounded-2xl surface overflow-x-auto">
      <table className="min-w-full divide-y divide-violet-100">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 text-left text-xs font-semibold text-violet-700 uppercase tracking-wider border-b bg-violet-50"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((sub, idx) => (
            <motion.tr
              key={sub.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.025 }}
              className="hover:bg-violet-50/40 transition-colors group"
            >
              {columns.map((col, ci) => (
                <td key={ci} className="px-6 py-4 align-middle whitespace-nowrap">
                  {col.render(sub)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
