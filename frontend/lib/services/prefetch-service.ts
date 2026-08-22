import { getJobsAction } from "@/app/actions/jobs";
import { getCandidatesAction } from "@/app/actions/candidates";
import { getDashboardDataAction } from "@/app/actions/organization";

export interface ApplicationDataCache {
  jobs: Array<Record<string, unknown>>;
  candidates: Array<Record<string, unknown>>;
  dashboard: Record<string, unknown> | null;
  lastFetchedAt: number;
}

let globalMemoryCache: ApplicationDataCache | null = null;
let activeFetchPromise: Promise<ApplicationDataCache> | null = null;

export async function prefetchAllWorkspaceData(forceRefresh = false): Promise<ApplicationDataCache> {
  const cacheMaxAgeMs = 60 * 1000; // 60 seconds TTL

  if (!forceRefresh && globalMemoryCache && (Date.now() - globalMemoryCache.lastFetchedAt < cacheMaxAgeMs)) {
    return globalMemoryCache;
  }

  if (activeFetchPromise && !forceRefresh) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const [jobsRes, candidatesRes, dashboardRes] = await Promise.allSettled([
        getJobsAction(),
        getCandidatesAction(),
        getDashboardDataAction(),
      ]);

      const jobs = (jobsRes.status === "fulfilled" && jobsRes.value.success ? jobsRes.value.data || [] : []) as Array<Record<string, unknown>>;
      const candidates = (candidatesRes.status === "fulfilled" && candidatesRes.value.success ? candidatesRes.value.data || [] : []) as Array<Record<string, unknown>>;
      const dashboard = (dashboardRes.status === "fulfilled" && dashboardRes.value.success ? dashboardRes.value.data || null : null) as Record<string, unknown> | null;

      globalMemoryCache = {
        jobs,
        candidates,
        dashboard,
        lastFetchedAt: Date.now(),
      };

      return globalMemoryCache;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

export function getCachedWorkspaceData(): ApplicationDataCache | null {
  return globalMemoryCache;
}
