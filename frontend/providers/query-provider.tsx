"use client";

/**
 * providers/query-provider.tsx
 * ────────────────────────────
 * TanStack React Query (v5) client provider with production-grade defaults.
 *
 * Key settings:
 * - staleTime: 60s   — data stays "fresh" for 1 minute (no redundant re-fetches)
 * - gcTime:   5min   — cached data lives for 5 minutes after components unmount
 * - retry: 2         — retry failed requests twice with exponential backoff
 * - refetchOnWindowFocus: false — prevents waterfall re-fetches when switching tabs
 */

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is "fresh" for 60 seconds — prevents redundant API calls
        staleTime: 60 * 1_000,
        // Keep cache for 5 minutes after component unmounts
        gcTime: 5 * 60 * 1_000,
        // Retry failed requests 2 times with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1_000 * 2 ** attemptIndex, 30_000),
        // Don't re-fetch just because the user switched tabs
        refetchOnWindowFocus: false,
        // Still re-fetch when the user re-connects to network
        refetchOnReconnect: true,
      },
      mutations: {
        // Surface mutation errors to error boundaries
        throwOnError: false,
      },
    },
  });
}

// Browser singleton — avoid creating a new client on every render
let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always make a new client so requests are isolated per SSR render
    return makeQueryClient();
  }
  // Browser: reuse the singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
