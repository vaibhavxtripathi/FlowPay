// FlowSubs: SubscriptionManager (Cadence 1.0)
// Manages recurring, on-chain subscriptions. All access patterns are updated for Cadence 1.0.

access(all) contract SubscriptionManagerV2 {

access(all) event SubscriptionCreated(
    subscriptionID: UInt64,
    payer: Address,
    amount: UFix64,
    allocations: {String: UFix64}
)
access(all) event SubscriptionPaid(
        subscriptionID: UInt64,
        payer: Address,
        amount: UFix64
    )
    access(all) event SubscriptionCanceled(
        subscriptionID: UInt64,
        payer: Address
    )

    access(all) struct Subscription {
        access(all) let id: UInt64
        access(all) let payer: Address
        access(all) let amount: UFix64
        access(all) let allocations: {String: UFix64}
        access(contract) var lastPaidAt: UFix64?
        access(contract) var isActive: Bool

        init(
            id: UInt64,
            payer: Address,
            amount: UFix64,
            allocations: {String: UFix64}
        ) {
            self.id = id
            self.payer = payer
            self.amount = amount
            self.allocations = allocations
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

    access(all) fun setupAccount(payer: Address) {
        if self.subscriptions[payer] == nil {
            self.subscriptions[payer] = {}
        }
    }

    access(all) fun createSubscription(
        payer: Address,
        amount: UFix64,
        allocations: {String: UFix64}
    ): UInt64 {
        let subID = self.nextSubID
        self.nextSubID = self.nextSubID + 1
        let sub = Subscription(
            id: subID,
            payer: payer,
            amount: amount,
            allocations: allocations
        )
        if self.subscriptions[payer] == nil { self.subscriptions[payer] = {} }
        var map = self.subscriptions[payer]!
        map[subID] = sub
        self.subscriptions[payer] = map
        emit SubscriptionCreated(
            subscriptionID: subID,
            payer: payer,
            amount: amount,
            allocations: allocations
        )
        return subID
    }

    access(all) fun paySubscription(payer: Address, subID: UInt64) {
        if let subMap = self.subscriptions[payer] {
            if let sub = subMap[subID] {
                emit SubscriptionPaid(subscriptionID: subID, payer: sub.payer, amount: sub.amount)
            }
        }
    }

    access(all) fun cancelSubscription(payer: Address, subID: UInt64) {
        if let subMap = self.subscriptions[payer] {
            if let sub = subMap[subID] {
                emit SubscriptionCanceled(subscriptionID: subID, payer: sub.payer)
            }
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