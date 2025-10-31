import * as fcl from "@onflow/fcl";
import "./flow-config";

// Testnet addresses
const FT = "0x9a0766d93b6608b7"; // FungibleToken
const FLOW = "0x7e60df042a9c0868"; // FlowToken

export async function fetchFlowBalance(address: string): Promise<number> {
  const cadence = `
    import FungibleToken from ${FT}
    import FlowToken from ${FLOW}
    access(all) fun main(addr: Address): UFix64 {
      let acct = getAccount(addr)
      let cap = acct.capabilities.get<&{FungibleToken.Balance}>(/public/flowTokenBalance)
      if cap == nil { return 0.0 }
      let ref = cap!.borrow()
      if ref == nil { return 0.0 }
      return ref!.balance
    }
  `;
  const res = await fcl.query({
    cadence,
    args: (arg, t) => [arg(address, t.Address)],
  });
  const num = typeof res === "string" ? parseFloat(res) : Number(res);
  return Number.isFinite(num) ? num : 0;
}


