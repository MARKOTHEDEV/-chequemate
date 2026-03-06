import { AdminLayout } from "@/components/layout";
import ComingSoon from "@/components/ComingSoon";

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <ComingSoon title="Dashboard Coming Soon" />
    </AdminLayout>
  );
}
