// FlowSubs: SubscriptionManager (Cadence 1.0)
// Manages recurring, on-chain subscriptions. All access patterns are updated for Cadence 1.0.

pub contract SubscriptionManager {

    pub event SubscriptionCreated(
        subscriptionID: UInt64,
        payer: Address,
        payee: Address,
        amount: UFix64,
        interval: UInt64,
        gracePeriod: UInt64
    )
    pub event SubscriptionPaid(
        subscriptionID: UInt64,
        payer: Address,
        payee: Address,
        amount: UFix64
    )
    pub event SubscriptionCanceled(
        subscriptionID: UInt64,
        payer: Address,
        payee: Address
    )

    pub struct Subscription {
        pub let id: UInt64
        pub let payer: Address
        pub let payee: Address
        pub let amount: UFix64
        pub let interval: UInt64
        pub let gracePeriod: UInt64
        pub var lastPaidAt: UFix64?
        pub var isActive: Bool

        init(
            id: UInt64,
            payer: Address,
            payee: Address,
            amount: UFix64,
            interval: UInt64,
            gracePeriod: UInt64
        ) {
            self.id = id
            self.payer = payer
            self.payee = payee
            self.amount = amount
            self.interval = interval
            self.gracePeriod = gracePeriod
            self.lastPaidAt = nil
            self.isActive = true
        }
    }

    access(account) var nextSubID: UInt64
    access(account) let subscriptions: {Address: {UInt64: Subscription}}

    init() {
        self.nextSubID = 1
        self.subscriptions = {}
    }

    access(all) fun setupAccount() {
        let sender = AuthAccount(payer: signer)
        if self.subscriptions[sender.address] == nil {
            self.subscriptions[sender.address] = {}
        }
    }

    access(all) fun createSubscription(
        payee: Address,
        amount: UFix64,
        interval: UInt64,
        gracePeriod: UInt64
    ): UInt64 {
        let payer = AuthAccount(payer: signer).address
        let subID = self.nextSubID
        self.nextSubID = self.nextSubID + 1
        let sub = Subscription(
            id: subID,
            payer: payer,
            payee: payee,
            amount: amount,
            interval: interval,
            gracePeriod: gracePeriod
        )
        if self.subscriptions[payer] == nil {
            self.subscriptions[payer] = {}
        }
        self.subscriptions[payer]![subID] = sub
        emit SubscriptionCreated(
            subscriptionID: subID,
            payer: payer,
            payee: payee,
            amount: amount,
            interval: interval,
            gracePeriod: gracePeriod
        )
        return subID
    }

    access(all) fun paySubscription(
        payer: Address,
        subID: UInt64
    ) {
        if let subMap = self.subscriptions[payer], let sub = subMap[subID] {
            pre {
                sub.isActive: "Subscription already cancelled."
            }
            let now: UFix64 = getCurrentBlock().timestamp
            sub.lastPaidAt = now
            emit SubscriptionPaid(
                subscriptionID: subID,
                payer: sub.payer,
                payee: sub.payee,
                amount: sub.amount
            )
        }
    }

    access(all) fun cancelSubscription(
        payer: Address,
        subID: UInt64
    ) {
        if let subMap = self.subscriptions[payer], let sub = subMap[subID] {
            pre {
                sub.isActive: "Subscription is already cancelled."
            }
            sub.isActive = false
            emit SubscriptionCanceled(
                subscriptionID: subID,
                payer: sub.payer,
                payee: sub.payee
            )
        }
    }

    access(all) fun getSubscriptions(payer: Address): [Subscription] {
        let res: [Subscription] = []
        if let subMap = self.subscriptions[payer] {
            for sub in subMap.values {
                res.append(sub)
            }
        }
        return res
    }
}