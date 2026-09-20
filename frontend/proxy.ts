import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  function redirectWithCookies(url: URL) {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/jobs",
    "/candidates",
    "/applications",
    "/interviews",
    "/evaluations",
    "/analytics",
    "/settings",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  const isOnboardingRoute =
    pathname === "/onboarding/organization" ||
    pathname.startsWith("/onboarding/");

  // OPTIMIZATION: If request is for a public route (e.g., /apply/..., /, static assets, api), skip Supabase Auth network call
  if (!isProtectedRoute && !isAuthRoute && !isOnboardingRoute) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated user trying to access protected route or onboarding route -> Redirect to /login
  if ((isProtectedRoute || isOnboardingRoute) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return redirectWithCookies(redirectUrl);
  }

  // 2. Authenticated user checks organization membership status
  if (user && (isProtectedRoute || isAuthRoute || isOnboardingRoute)) {
    // Protected pages resolve fresh membership in their server data loaders.
    // Auth/onboarding redirects must check membership, not trust a preference cookie.
    if (isProtectedRoute) return response;
    const { data: members, error: membershipError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1);
    if (membershipError) return response;
    const hasOrg = Boolean(members?.length);

    // Authenticated user on auth routes (/login, /signup)
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = hasOrg ? "/dashboard" : "/onboarding/organization";
      return redirectWithCookies(redirectUrl);
    }

    // Authenticated user on onboarding route but already has an organization
    if (isOnboardingRoute && hasOrg) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return redirectWithCookies(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
