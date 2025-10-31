import { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import "../lib/flow-config"; // Ensure FCL config is initialized

type FlowUser = {
  addr: string | null;
  loggedIn: boolean;
};

export function useFlowUser() {
  const [user, setUser] = useState<FlowUser>({ addr: null, loggedIn: false });

  useEffect(() => {
    // Subscribes to current user's login/logout state
    return fcl.currentUser().subscribe((user) => {
      setUser({ addr: user?.addr ?? null, loggedIn: !!user?.addr });
    });
  }, []);

  const logIn = () => fcl.authenticate();
  const logOut = () => fcl.unauthenticate();

  return { user, logIn, logOut };
}
