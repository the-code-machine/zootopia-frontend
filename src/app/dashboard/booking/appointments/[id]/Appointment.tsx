"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import {
  fetchAppointmentById,
  deleteAppointment,
} from "@/redux/features/appointmentSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import axiosClient from "@/utils/axiosClient";
import { setUserProfile } from "@/redux/features/userSlice";

export default function PetReservationDetails() {
  const profile = useAppSelector((state) => state.user.profile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const appointmentId = params.id as string;
  const {
    selectedAppointment: appointment,
    loading,
    error,
  } = useAppSelector((state) => state.appointment);

  useEffect(() => {
    if (appointmentId) {
      dispatch(fetchAppointmentById(appointmentId));
    }
  }, [appointmentId, dispatch]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosClient.get("/auth/profile");
        const data = await response.data.profile;
        dispatch(setUserProfile(data));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, [dispatch]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirmCancel = async () => {
    try {
      const resultAction = await dispatch(deleteAppointment(appointmentId));
      unwrapResult(resultAction);
      handleCloseModal();
      router.push("/dashboard/booking/appointments");
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      handleCloseModal();
    }
  };

  if (loading && !appointment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 pt-20 text-center text-red-500">Error: {error}</div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-4 pt-20 text-center text-gray-500">
        Appointment not found.
      </div>
    );
  }

  const statusInfo = {
    booked: { text: "Confirm", color: "bg-[#0066C3]/50 text-[#0066C3]" },
    draft: { text: "Pending", color: "bg-[#FFF5F3]/80 text-[#FD5E2D]" },
  };
  const currentStatus = statusInfo[appointment.status] || statusInfo.draft;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Header */}
      <header className="fixed top-0 z-10 w-full max-w-3xl bg-white px-4 py-4 flex items-center justify-between border-b border-[#E7E7E7]">
        <Link href="/dashboard/booking/appointments">
          <ArrowLeft className="h-6 w-6 text-[#1B1B1C]" />
        </Link>
        <h1 className="text-xl font-medium text-[#1B1B1C]">Pet Reservation</h1>
        <Link href="/dashboard">
          <Home className="h-6 w-6 text-[#222222]" />
        </Link>
      </header>

      <main className="p-4 pt-20">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Pet Reservation Details
        </h2>

        {/* Date and Edit Button */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3 text-gray-700">
          <span>
            {appointment.date
              ? (() => {
                  const d = new Date(appointment.date);
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  const year = d.getFullYear();
                  return `${month}-${day}-${year}`;
                })()
              : "N/A"}
            {appointment.timeSlot} {appointment.time}
          </span>
          <button className="rounded bg-gray-200 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300">
            Edit
          </button>
        </div>

        {/* Member Information */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            Member Information
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex justify-between py-2">
              <p className="text-gray-600">Name</p>
              <p className="font-medium text-[#0066C3]">
                {profile?.firstName || profile?.email.split("@")[0]}
              </p>
            </div>
            <div className="flex justify-between py-2">
              <p className="text-gray-600">Phone</p>
              <p className="font-medium text-[#0066C3]">
                {appointment.memberInfo.phoneNumber ||
                  profile?.phone ||
                  profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Pet Reservation Details - Mapped for each pet */}
        <div className="space-y-6">
          {appointment.pets?.map((petForm, index) => {
            const petName = petForm.selectedPet?.name || "N/A";
            const purpose = petForm.purposeOfVisit || "N/A";

            return (
              <div key={index}>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 mr-2">
                    Pet Reservation{" "}
                    {appointment.pets.length > 1 ? `(${index + 1})` : ""}
                  </h3>
                  <span
                    className={`rounded px-3 py-1 text-sm font-semibold ${currentStatus.color}`}
                  >
                    {currentStatus.text}
                  </span>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex justify-between py-2">
                    <p className="text-gray-600">Pet Name</p>
                    <p className="font-medium text-[#0066C3]">{petName}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p className="text-gray-600">Purpose of visit</p>
                    <p className="font-medium text-[#0066C3]">{purpose}</p>
                  </div>
                  <div className="py-2">
                    <p className="mb-1 text-gray-600">Memo</p>
                    <textarea
                      readOnly
                      value={petForm.memo || ""}
                      rows={3}
                      className="w-full rounded-lg bg-[#EEF5FC] p-4 text-gray-700 outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cancellation Button */}
      <footer className="fixed bottom-0 w-full max-w-3xl bg-white p-4">
        <button
          onClick={handleOpenModal}
          className="w-full rounded-lg bg-primary py-3 text-lg font-semibold text-white shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          {loading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : (
            "Cancellation"
          )}
        </button>
      </footer>

      {/* Cancellation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-lg bg-white p-6 text-center shadow-xl">
            <p className="mb-4 text-lg">
              Do you want to cancel the reservation? This action cannot be
              recovered.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmCancel}
                className="rounded-lg px-6 py-2 font-semibold text-[#0066C3]"
              >
                OK
              </button>
              <button
                onClick={handleCloseModal}
                className="rounded-lg px-6 py-2 font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
