import { fetchSubscriptionPlans } from "@/lib/actions/plans";
import { SubscriptionManager } from "@/components/admin/SubscriptionManager";

export default async function SubscriptionsAdminPage() {
  const result = await fetchSubscriptionPlans();
  const plans = result.success ? result.data || [] : [];

  return <SubscriptionManager initialPlans={plans} />;
}
