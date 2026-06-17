import { fetchPlatformAnalytics } from "@/lib/actions/admin";
import { PlatformAnalytics } from "@/components/admin/PlatformAnalytics";

export default async function AdminAnalyticsPage() {
  const result = await fetchPlatformAnalytics();

  // If there's an error, fallback to 0 values gracefully.
  const data = result.success && result.data ? result.data : {
    totalHubs: 0,
    activeHubs: 0,
    pendingHubs: 0,
    suspendedHubs: 0,
    totalRevenue: 0,
    totalBookings: 0,
    topHubs: []
  };

  return <PlatformAnalytics data={data} />;
}
