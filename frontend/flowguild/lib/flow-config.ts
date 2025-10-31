import * as fcl from "@onflow/fcl";

// Explicitly configure for Flow Testnet
fcl.config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("app.detail.title", "FlowGuild")
  .put("app.detail.icon", typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : "")
  .put("service.OpenID.scopes", "email");

// WalletConnect project id (if provided)
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (wcProjectId) {
  fcl.config().put("walletconnect.projectId", wcProjectId);
}

export default fcl;