import SubscriptionManager from 0xDeployer

transaction(
    payee: Address,
    amount: UFix64,
    interval: UInt64,
    gracePeriod: UInt64
) {
    prepare(acct: AuthAccount) {
        SubscriptionManager.createSubscription(
            payee: payee,
            amount: amount,
            interval: interval,
            gracePeriod: gracePeriod
        )
    }
}