"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Stethoscope,
  Shield,
  Heart,
  ChevronRight,
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Home,
  BookOpen,
  User,
  ShoppingBag,
  BookMinusIcon,
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { setUserProfile } from "@/redux/features/userSlice";
import axiosClient from "@/utils/axiosClient";
import { fetchPets } from "@/redux/features/petSlice";
import FloatingActionButton from "@/utils/FloatingButton";

// Define the type for an upcoming event based on your API response
interface UpcomingEvent {
  id: number;
  event_type: "appointment" | "vaccine" | string; // Allow for other types
  title: string;
  description: string;
  event_date: string; // ISO string e.g., "2025-08-26T18:30:00.000Z"
  event_time: string; // e.g., "10:00:00"
  appointment_id?: string; // Optional, only for appointment events
  vaccine_record_id?: string;
}

// ✨ NEW: UpcomingEvents Component
const UpcomingEvents = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.user.profile);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosClient.get("/auth/profile");
        dispatch(fetchPets());
        const data = await response.data.profile;
        dispatch(setUserProfile(data));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, [dispatch]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/upcoming-events/${profile?.id}`);
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };
    if (profile?.id) {
      fetchUpcomingEvents();
    }
  }, [profile?.id]);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-6 h-6 text-blue-500" />;
      case "vaccine":
        return <Shield className="w-6 h-6 text-orange-500" />;
      default:
        return <Bell className="w-6 h-6 text-purple-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Assuming time is in "HH:mm:ss" format
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="px-4 mt-6">
        <h2 className="font-medium text-gray-900 mb-3">Upcoming Events</h2>
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <h2 className="font-medium text-gray-900 mb-3">Upcoming Events</h2>
      {events.length > 0 ? (
        <div className="flex space-y-3 min-h-96 flex-col overflow-y-auto pb-2 scrollbar-hide">
          {events.map((event) => (
            <Link
              href={
                event?.event_type === "appointment"
                  ? `/dashboard/booking/appointments/${event.appointment_id}`
                  : `/dashboard/booking/vaccine-details/${event?.vaccine_record_id}`
              }
              key={event.id}
              className="flex-shrink-0 w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getEventTypeIcon(event.event_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.description}
                  </p>
                  <div className="mt-3 text-xs font-medium text-gray-700">
                    <span>{formatDate(event.event_date)}</span>
                    {event.event_time && (
                      <>
                        {" "}
                        <span className="mx-1">•</span>
                        <span>{formatTime(event.event_time)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          No upcoming events scheduled.
        </p>
      )}
    </div>
  );
};

const HomePage = (userData: any) => {
  const [selectedPetId, setSelectedPetId] = useState("1");
  const profile = useAppSelector((state) => state.user.profile);
  const dispatch = useAppDispatch();
  const { pets } = useAppSelector((state) => state.pet);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosClient.get("/auth/profile");
        dispatch(fetchPets());
        const data = await response.data.profile;
        dispatch(setUserProfile(data));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, [dispatch]);

  const quickActions = [
    {
      id: "1",
      title: "New Appointment",
      icon: <Calendar size={24} />,
      color: "bg-[#A1534E]/10 text-[#A1534E]",
      route: "/dashboard/new-appointment",
    },
    {
      id: "2",
      title: "Add Medical Record",
      icon: <Stethoscope size={24} />,
      color: "bg-[#A1534E]/10 text-[#A1534E]",
      route: "/dashboard/medical-record",
    },
    {
      id: "3",
      title: "Add Vaccine Record",
      icon: <Shield size={24} />,
      color: "bg-[#A1534E]/10 text-[#A1534E]",
      route: "/dashboard/vaccine-registration",
    },
    {
      id: "4",
      title: "View Bookings",
      icon: <BookMinusIcon size={24} />,
      color: "bg-[#A1534E]/10 text-[#A1534E]",
      route: "/dashboard/booking",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col min-h-screen ">
      <main className="flex-1 pb-20">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xl font-medium text-gray-900">
            {getGreeting()},{" "}
            {profile?.firstName || profile?.email.split("@")[0]}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Today is{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="px-4 py-3">
          <h2 className="font-medium text-gray-900 mb-2">Your Pets</h2>
          <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide">
            {pets.map((pet) => (
              <div
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex-shrink-0 w-64 p-4 rounded-xl cursor-pointer transition-all ${
                  selectedPetId === pet.id
                    ? "bg-[#A1534E]/10 border-2 border-[#A1534E] shadow-sm"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className={`w-14 h-14 rounded-full object-cover  ${
                      selectedPetId === pet.id
                        ? "border-[#A1534E]"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {pet.breed}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href={"/dashboard/pet-registration"}
              className="flex-shrink-0 w-64 h-auto p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer flex flex-col items-center justify-center"
            >
              <Plus size={24} className="text-[#A1534E] mb-2" />
              <span className="text-xs text-gray-500 text-center">Add Pet</span>
            </Link>
          </div>
        </div>

        <div className="px-4 mt-4">
          <h2 className="font-medium text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                href={action.route}
                key={action.id}
                className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  {action.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {action.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* ✨ NEW: Section added here */}
        <UpcomingEvents />

        <FloatingActionButton />
      </main>
    </div>
  );
};

export default HomePage;
