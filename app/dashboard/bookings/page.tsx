import { auth } from "@clerk/nextjs/server";
import { fetchBookings } from "@/lib/actions/booking";
import { fetchResourceUnits } from "@/lib/actions/resources";
import { BookingsList } from "@/components/booking/BookingsList";
import { BookingsHeader } from "@/components/booking/BookingsHeader";

export default async function BookingsPage() {
  const { orgId } = await auth();
  
  if (!orgId) return null;

  const [bookings, resources] = await Promise.all([
    fetchBookings(orgId),
    fetchResourceUnits(orgId)
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <BookingsHeader facilityId={orgId} resources={resources} />

      <BookingsList bookings={bookings} />
    </div>
  );
}

