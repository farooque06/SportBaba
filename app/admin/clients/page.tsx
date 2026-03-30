import { fetchAllFacilities } from "@/lib/actions/admin";
import { fetchSubscriptionPlans } from "@/lib/actions/plans";
import { Users } from "lucide-react";
import { ClientRegistry } from "@/components/admin/ClientRegistry";

export default async function ClientRegistryPage() {
  const [facilities, plansResult] = await Promise.all([
    fetchAllFacilities(),
    fetchSubscriptionPlans()
  ]);

  const plans = plansResult.success ? plansResult.data || [] : [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Registry</h1>
          <p className="text-muted-foreground font-medium text-sm tracking-tight opacity-80 uppercase flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Full Client Directory & Management
          </p>
        </div>
      </div>

      {/* Full Registry List Component */}
      <ClientRegistry facilities={facilities as any} plans={plans} />
    </div>
  );
}
