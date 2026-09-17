"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";

interface BreadcrumbContextType {
  breadcrumbs: string[];
  setCustomBreadcrumbs: (crumbs: string[] | null) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | undefined>(
  undefined,
);

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  jobs: "Jobs",
  new: "New job",
  applications: "Applications",
  candidates: "Candidates",
  interviews: "Interviews",
  evaluations: "Evaluations",
  analytics: "Analytics",
  settings: "Settings",
};

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { organization } = useAuth();
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState<
    string[] | null
  >(null);

  // Reset custom breadcrumbs whenever the route changes
  React.useEffect(() => {
    setCustomBreadcrumbs(null);
  }, [pathname]);

  const defaultBreadcrumbs = React.useMemo(() => {
    const orgName = organization?.name || "AI-Recruit360";
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0 || segments[0] === "dashboard") {
      return [orgName, "Overview"];
    }

    const crumbList = [orgName];
    for (const seg of segments) {
      if (ROUTE_LABELS[seg]) {
        crumbList.push(ROUTE_LABELS[seg]);
      }
    }
    return crumbList.length > 1 ? crumbList : [orgName, "Workspace"];
  }, [pathname, organization?.name]);

  const breadcrumbs = customBreadcrumbs || defaultBreadcrumbs;

  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumbs, setCustomBreadcrumbs }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    return {
      breadcrumbs: ["Workspace", "Overview"],
      setCustomBreadcrumbs: () => {},
    };
  }
  return context;
}

export function useSetBreadcrumbs(crumbs: string[]) {
  const { setCustomBreadcrumbs } = useBreadcrumbs();
  const serialized = JSON.stringify(crumbs);

  React.useEffect(() => {
    setCustomBreadcrumbs(JSON.parse(serialized));
    return () => {
      setCustomBreadcrumbs(null);
    };
  }, [serialized, setCustomBreadcrumbs]);
}
