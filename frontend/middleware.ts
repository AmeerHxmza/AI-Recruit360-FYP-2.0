import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/jobs",
    "/candidates",
    "/applications",
    "/interviews",
    "/evaluations",
    "/analytics",
    "/ai-activity",
    "/settings",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";

  const isOnboardingRoute = pathname === "/onboarding/organization" || pathname.startsWith("/onboarding/");

  // OPTIMIZATION: If request is for a public route (e.g., /apply/..., /, static assets, api), skip Supabase Auth network call
  if (!isProtectedRoute && !isAuthRoute && !isOnboardingRoute) {
    return response;
  }

  // FAST-PATH: If the user already has a valid auth token cookie, verified session, and org, bypass remote auth roundtrips
  const hasAuthToken = request.cookies.getAll().some(
    (c) => c.name.includes("-auth-token") || c.name.startsWith("sb-")
  );
  const isAuthVerified = request.cookies.get("auth_verified")?.value === "true";
  const hasOrgCookie = request.cookies.get("has_org")?.value === "true";

  if (isProtectedRoute && isAuthVerified && hasOrgCookie && hasAuthToken) {
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
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated user trying to access protected route or onboarding route -> Redirect to /login
  if ((isProtectedRoute || isOnboardingRoute) && !user) {
    response.cookies.delete("auth_verified");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    response.cookies.set("auth_verified", "true", {
      path: "/",
      maxAge: 60 * 60, // 1 hour session verification cache
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // 2. Authenticated user checks organization membership status
  if (user && (isProtectedRoute || isAuthRoute || isOnboardingRoute)) {
    let hasOrg = request.cookies.get("has_org")?.value === "true";
    const orgCookieChecked = request.cookies.has("has_org");

    if (!orgCookieChecked) {
      const { data: members } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1);

      hasOrg = Boolean(members && members.length > 0);
      
      response.cookies.set("has_org", hasOrg ? "true" : "false", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }

    // Authenticated user on auth routes (/login, /signup)
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = hasOrg ? "/dashboard" : "/onboarding/organization";
      return NextResponse.redirect(redirectUrl);
    }

    // Authenticated user on onboarding route but already has an organization
    if (isOnboardingRoute && hasOrg) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    // Authenticated user trying to access protected routes without an organization
    if (isProtectedRoute && !hasOrg) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding/organization";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
