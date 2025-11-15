import DashboardOverview from "@/components/Dashboard/DashboardOverview";
import { Suspense } from "react";

function DashboardContent() {
  return <DashboardOverview />;
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-funlearn1">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-funlearn6"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
