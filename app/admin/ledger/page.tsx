import { fetchPlatformLedger, fetchAllFacilities } from "@/lib/actions/admin";
import { RevenueLedger } from "@/components/admin/RevenueLedger";

export default async function LedgerPage() {
  const [ledgerResult, facilities] = await Promise.all([
    fetchPlatformLedger(),
    fetchAllFacilities()
  ]);

  const payments = ledgerResult.success ? (ledgerResult.data as any[]) : [];
  const totalCollected = ledgerResult.totalCollected ?? 0;
  const totalOutstanding = ledgerResult.totalOutstanding ?? 0;
  const facilityOptions = (facilities as any[]).map((f: any) => ({ id: f.id, name: f.name }));

  return (
    <RevenueLedger
      payments={payments}
      totalCollected={totalCollected}
      totalOutstanding={totalOutstanding}
      facilityOptions={facilityOptions}
    />
  );
}
