import { DashboardShell } from "@/components/layout/DashboardShell";
import { CareerProfileProvider } from "@/contexts/CareerProfileContext";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CareerProfileProvider>
      <DashboardShell>{children}</DashboardShell>
    </CareerProfileProvider>
  );
}
