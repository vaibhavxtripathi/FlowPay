import SubscriptionManager from 0xDeployer

transaction(
    payer: Address,
    subID: UInt64
) {
    prepare(acct: AuthAccount) {
        SubscriptionManager.paySubscription(
            payer: payer,
            subID: subID
        )
    }
}