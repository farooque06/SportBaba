import { fetchCustomers } from "@/lib/actions/customers";
import { CustomersClient } from "./CustomersClient";
import { getFacilityId } from "@/lib/get-facility-id";

export default async function CustomersPage() {
  const facilityId = await getFacilityId();
  const customers = facilityId ? await fetchCustomers(facilityId) : [];

  return <CustomersClient initialCustomers={customers} facilityId={facilityId || ''} />;
}
