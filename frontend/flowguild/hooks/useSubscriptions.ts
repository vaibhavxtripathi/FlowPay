import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import { useFlowUser } from "./useFlowUser";

export interface Subscription {
  id: string;
  payer: string;
  payee: string;
  amount: string;
  interval: number;
  gracePeriod: number;
  lastPaidAt: string | null;
  isActive: boolean;
}

export function useSubscriptions() {
  const { user } = useFlowUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // INSERT your deployed contract address below
  const contractAddress = "0x48d43b6b6f20d66b";

  const fetchSubscriptions = async () => {
    if (!user.loggedIn || !user.addr) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fcl.query({
        cadence: `
          import SubscriptionManager from ${contractAddress}

          access(all) fun main(payer: Address): [SubscriptionManager.Subscription] {
            return SubscriptionManager.getSubscriptions(payer: payer)
          }
        `,
        args: (arg, t) => [
          arg(user.addr!, types.Address)
        ]
      });

      setSubscriptions(result.map((sub: any) => ({
        id: sub.id.toString(),
        payer: sub.payer,
        payee: sub.payee,
        amount: sub.amount,
        interval: parseInt(sub.interval),
        gracePeriod: parseInt(sub.gracePeriod),
        lastPaidAt: sub.lastPaidAt ? new Date(parseInt(sub.lastPaidAt) * 1000).toISOString() : null,
        isActive: sub.isActive
      })));
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (payee: string, amount: string, interval: number, gracePeriod: number) => {
    if (!user.loggedIn) return;

    setLoading(true);
    setError(null);

    try {
      const transactionId = await fcl.mutate({
        cadence: `
          import SubscriptionManager from ${contractAddress}

          access(all) transaction(payee: Address, amount: UFix64, interval: UInt64, gracePeriod: UInt64) {
            prepare(acct: AuthAccount) {
              SubscriptionManager.createSubscription(
                payee: payee,
                amount: amount,
                interval: interval,
                gracePeriod: gracePeriod
              )
            }
          }
        `,
        args: (arg, t) => [
          arg(payee, types.Address),
          arg(amount, types.UFix64),
          arg(interval.toString(), types.UInt64),
          arg(gracePeriod.toString(), types.UInt64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      await fcl.tx(transactionId).onceSealed();
      await fetchSubscriptions(); // Refresh subscriptions
    } catch (err) {
      console.error("Error creating subscription:", err);
      setError("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const paySubscription = async (subscriptionId: string) => {
    if (!user.loggedIn || !user.addr) return;

    setLoading(true);
    setError(null);

    try {
      const transactionId = await fcl.mutate({
        cadence: `
          import SubscriptionManager from ${contractAddress}

          access(all) transaction(payer: Address, subID: UInt64) {
            prepare(acct: AuthAccount) {
              SubscriptionManager.paySubscription(
                payer: payer,
                subID: subID
              )
            }
          }
        `,
        args: (arg, t) => [
          arg(user.addr!, types.Address),
          arg(subscriptionId, types.UInt64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      await fcl.tx(transactionId).onceSealed();
      await fetchSubscriptions(); // Refresh subscriptions
    } catch (err) {
      console.error("Error paying subscription:", err);
      setError("Failed to pay subscription");
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!user.loggedIn || !user.addr) return;

    setLoading(true);
    setError(null);

    try {
      const transactionId = await fcl.mutate({
        cadence: `
          import SubscriptionManager from ${contractAddress}

          access(all) transaction(payer: Address, subID: UInt64) {
            prepare(acct: AuthAccount) {
              SubscriptionManager.cancelSubscription(
                payer: payer,
                subID: subID
              )
            }
          }
        `,
        args: (arg, t) => [
          arg(user.addr!, types.Address),
          arg(subscriptionId, types.UInt64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      });

      await fcl.tx(transactionId).onceSealed();
      await fetchSubscriptions(); // Refresh subscriptions
    } catch (err) {
      console.error("Error canceling subscription:", err);
      setError("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.loggedIn) {
      fetchSubscriptions();
    }
  }, [user.loggedIn]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    paySubscription,
    cancelSubscription
  };
}
