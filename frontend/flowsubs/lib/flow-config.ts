import * as fcl from "@onflow/fcl";

fcl.config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn")
  .put("app.detail.title", "FlowSplit+")
  .put("app.detail.icon", `${typeof window !== 'undefined' ? window.location.origin : ''}/favicon.ico`);

// WalletConnect project id (required for some wallets)
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (wcProjectId) {
  fcl.config().put("walletconnect.projectId", wcProjectId);
}

export default fcl;