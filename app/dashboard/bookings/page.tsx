import { fetchBookings } from "@/lib/actions/booking";
import { fetchResourceUnits } from "@/lib/actions/resources";
import { BookingsList } from "@/components/booking/BookingsList";
import { BookingsHeader } from "@/components/booking/BookingsHeader";
import { getFacilityId } from "@/lib/get-facility-id";

export default async function BookingsPage() {
  const facilityId = await getFacilityId();
  
  if (!facilityId) return null;

  const [bookings, resources] = await Promise.all([
    fetchBookings(facilityId),
    fetchResourceUnits(facilityId)
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <BookingsHeader facilityId={facilityId} resources={resources} />

      <BookingsList bookings={bookings} />
    </div>
  );
}

