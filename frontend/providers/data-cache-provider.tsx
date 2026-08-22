"use client";

import * as React from "react";
import { useAuth } from "@/providers/auth-provider";
import { prefetchAllWorkspaceData, ApplicationDataCache } from "@/lib/services/prefetch-service";

interface DataCacheContextType {
  cache: ApplicationDataCache | null;
  refreshCache: () => Promise<void>;
  isPreloading: boolean;
}

const DataCacheContext = React.createContext<DataCacheContextType>({
  cache: null,
  refreshCache: async () => {},
  isPreloading: false,
});

export function DataCacheProvider({ children }: { children: React.ReactNode }) {
  const { user, organization } = useAuth();
  const [cache, setCache] = React.useState<ApplicationDataCache | null>(null);
  const [isPreloading, setIsPreloading] = React.useState(false);

  React.useEffect(() => {
    let isCancelled = false;
    if (user && organization) {
      prefetchAllWorkspaceData(false)
        .then((data) => {
          if (!isCancelled) {
            setCache(data);
          }
        })
        .catch(() => {
          // ignore
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [user, organization]);

  const refreshCache = React.useCallback(async () => {
    if (!user || !organization) return;
    setIsPreloading(true);
    try {
      const data = await prefetchAllWorkspaceData(true);
      setCache(data);
    } finally {
      setIsPreloading(false);
    }
  }, [user, organization]);

  return (
    <DataCacheContext.Provider value={{ cache, refreshCache, isPreloading }}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useWorkspaceCache() {
  return React.useContext(DataCacheContext);
}
