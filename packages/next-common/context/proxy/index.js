import React, { useContext, useMemo } from "react";
import useQueryMyProxied from "next-common/hooks/useQueryMyProxies";
import useAllOnChainProxies from "next-common/hooks/useAllOnChainProxies";
import { useUser } from "../user";
import { useChainSettings } from "../chain";
import { isSameAddress } from "next-common/utils";

const ProxiesContext = React.createContext(null);

export function ServerProxiesProvider({ children }) {
  const { proxies, loading } = useQueryMyProxied();

  return (
    <ProxiesContext.Provider
      value={{
        proxies,
        isLoading: loading,
      }}
    >
      {children}
    </ProxiesContext.Provider>
  );
}

export function OnChainProxiesProvider({ children }) {
  const { proxies: allProxies, loading } = useAllOnChainProxies();
  const user = useUser();

  const myProxied = useMemo(
    () =>
      allProxies.filter(
        (proxy) =>
          isSameAddress(proxy.delegatee, user?.address) && proxy.delay === 0,
      ),
    [allProxies, user?.address],
  );

  return (
    <ProxiesContext.Provider
      value={{
        proxies: myProxied,
        isLoading: loading,
      }}
    >
      {children}
    </ProxiesContext.Provider>
  );
}

export function GeneralProxiesProvider({ children }) {
  const { modules: { proxy: { provider = "chain" } = {} } = {} } =
    useChainSettings();

  const context = useContext(ProxiesContext);
  if (context) {
    return children;
  }

  return provider === "server" ? (
    <ServerProxiesProvider>{children}</ServerProxiesProvider>
  ) : (
    <OnChainProxiesProvider>{children}</OnChainProxiesProvider>
  );
}

export function useMyProxied() {
  return useContext(ProxiesContext) || {};
}
