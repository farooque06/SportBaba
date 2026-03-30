import { auth } from "@clerk/nextjs/server";
import { fetchCustomers } from "@/lib/actions/customers";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage() {
  const { orgId } = await auth();
  const customers = orgId ? await fetchCustomers(orgId) : [];

  return <CustomersClient initialCustomers={customers} facilityId={orgId || ''} />;
}
