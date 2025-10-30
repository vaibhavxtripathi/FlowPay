import SubscriptionManager from 0xDeployer

transaction() {
    prepare(acct: AuthAccount) {
        SubscriptionManager.setupAccount()
    }
}