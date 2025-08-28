"use client";
import { useEffect } from "react";
import { ArrowLeft, Home, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { fetchAppointments } from "@/redux/features/appointmentSlice";
import { AppointmentFormData } from "@/components/screens/Appointment";

// A reusable component for each reservation card
const ReservationCard = ({
  reservation,
}: {
  reservation: AppointmentFormData;
}) => {
  // Determine status color based on the status from the API
  const statusInfo = {
    booked: { text: "Confirm", color: "bg-[#0066C3]/10 text-[#0066C3]" },
    draft: { text: "Pending", color: "bg-[#FD5E2D]/10 text-[#FD5E2D]" },
  };
  const currentStatus = statusInfo[reservation.status] || statusInfo.draft;

  return (
    <div className="mb-8">
      <div className="mb-2 rounded-lg border border-gray-300 bg-white p-3 text-gray-700">
        {new Date(reservation.date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        {reservation.timeSlot} {reservation.time}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between py-2 mb-4">
          <span
            className={`rounded px-3 py-1 text-sm font-semibold ${currentStatus.color}`}
          >
            {currentStatus.text}
          </span>
          <Link
            href={`/dashboard/booking/appointments/${reservation.id}`} // Use dynamic ID
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            View details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {reservation.pets.map((item) => (
          <div className="rounded-b-lg bg-primary/10 p-4">
            <div className="flex justify-between py-2">
              <p className="text-[#222222]">Pet Name</p>
              <p className="font-medium text-[#0066C3]">
                {item.selectedPet.name}
              </p>
            </div>
            <div className="flex justify-between py-2">
              <p className="text-[#222222]">Purpose of visit</p>
              <p className="font-medium text-[#0066C3]">
                {item.purposeOfVisit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main component for the Pet Reservation page
export default function PetReservation() {
  const dispatch = useAppDispatch();
  const { appointments, loading, error } = useAppSelector(
    (state) => state.appointment
  );

  // Fetch appointments when the component mounts
  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <div className="bg-white fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10">
        <Link href={"/dashboard"}>
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[20px] font-medium text-[#1B1B1C]">
          Pet Reservations
        </h1>
        <Link href={"/dashboard"}>
          <Home className="w-6 h-6" />
        </Link>
      </div>

      <main className="p-4 mt-20">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          Pet Reservation information
        </h2>

        {loading && (
          <div className="flex justify-center items-center py-10 min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500">
            <p>Error fetching appointments: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {appointments.length > 0 ? (
              appointments.map((res, index) => (
                <ReservationCard key={index} reservation={res} />
              ))
            ) : (
              <p className="text-center py-10 text-gray-500">
                No reservations found.
              </p>
            )}
          </>
        )}
      </main>

      <footer className="fixed md:max-w-3xl md:relative w-full bottom-0 bg-white p-4">
        <Link href="/dashboard/new-appointment">
          <button className="w-full rounded-lg bg-cyan-400 py-3 text-lg font-semibold text-white shadow-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75">
            New Appointment
          </button>
        </Link>
      </footer>
    </div>
  );
}
