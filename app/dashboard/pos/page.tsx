import { getFacilityId } from "@/lib/get-facility-id";
import { fetchResourceUnits } from "@/lib/actions/resources";
import { fetchProducts } from "@/lib/actions/inventory";
import { fetchCustomers } from "@/lib/actions/customers";
import { PosInterface } from "@/components/pos/PosInterface";
import { Zap } from "lucide-react";

export default async function PosPage() {
  const facilityId = await getFacilityId();
  if (!facilityId) return null;

  const [resources, products, customers] = await Promise.all([
    fetchResourceUnits(facilityId),
    fetchProducts(facilityId),
    fetchCustomers(facilityId)
  ]);

  const sanitizedCustomers = (customers || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone || '',
    email: c.email || ''
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" /> Fast Terminal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-foreground">
            Counter POS & Walk-in
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Ultra-fast match check-in, equipment rentals, refreshments, and instant billing.
          </p>
        </div>
      </div>

      {/* POS Interactive Interface */}
      <PosInterface
        facilityId={facilityId}
        resources={resources || []}
        products={products || []}
        customers={sanitizedCustomers}
      />
    </div>
  );
}
