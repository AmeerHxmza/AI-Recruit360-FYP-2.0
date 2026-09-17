import { ApplicationShell } from "@/components/layout/application-shell";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
      <ApplicationShell>{children}</ApplicationShell>
    </BreadcrumbProvider>
  );
}
