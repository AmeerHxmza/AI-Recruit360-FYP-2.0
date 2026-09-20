import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (input, init) => {
        // Auth requests must finish or fail, rather than leave forms spinning.
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        if (!url.startsWith(`${supabaseUrl}/auth/v1/`))
          return fetch(input, init);
        const deadline = AbortSignal.timeout(15_000);
        const originalSignal =
          init?.signal ?? (input instanceof Request ? input.signal : undefined);
        return fetch(input, {
          ...init,
          signal: originalSignal
            ? AbortSignal.any([originalSignal, deadline])
            : deadline,
        });
      },
    },
  });
}
