"use client";
import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { requestForToken } from "@/utils/firebase";
import axiosClient from "@/utils/axiosClient";
import { backend_url } from "@/config";
import { setUserProfile } from "@/redux/features/userSlice";
import { fetchPets } from "@/redux/features/petSlice";
import { fetchVaccines } from "@/redux/features/vaccineslice";
import { fetchMedicalRecords } from "@/redux/features/medicalSlice";
import { fetchAppointments } from "@/redux/features/appointmentSlice";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { AppStore, makeStore } from "@/redux/lib/store";
import { usePathname } from "next/navigation";
// ... your other imports
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders

    storeRef.current = makeStore();
  }

  return (
    <div
      className={` ${
        path.includes("login") ? " w-full" : "max-w-3xl mx-auto"
      } `}
    >
      <Provider store={storeRef.current}>
        <Toaster />

        <FetchPets />

        {children}
      </Provider>
    </div>
  );
}
const FetchPets = () => {
  const dispatch = useAppDispatch();
  const { pets, vaccines, records, appointments } = useAppSelector((state) => ({
    pets: state.pet.pets,
    vaccines: state.vaccine.vaccines,
    records: state.medical.records,
    appointments: state.appointment.appointments,
  }));

  // Use a ref to ensure the token logic runs only once per session
  const fcmTokenSent = useRef(false);

  // Effect specifically for handling the FCM token
  useEffect(() => {
    const auth = Cookies.get("auth_token");

    // Only run if user is authenticated and we haven't tried to send the token yet
    if (auth && !fcmTokenSent.current) {
      const handleGetToken = async () => {
        console.log("Requesting FCM token...");
        const fcmToken = await requestForToken();
        if (fcmToken) {
          try {
            await axiosClient.post(`${backend_url}/fcm/save`, { fcmToken });
            console.log("FCM Token saved successfully:", fcmToken);
          } catch (error) {
            console.error("Error saving FCM token:", error);
          }
        }
      };

      handleGetToken();
      // Mark as true so this logic doesn't re-run on subsequent renders
      fcmTokenSent.current = true;
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const auth = Cookies.get("auth_token");

    if (auth) {
      const fetchUserProfile = async () => {
        try {
          const response = await axiosClient.get("/auth/profile");
          dispatch(setUserProfile(response.data.profile));
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      };

      fetchUserProfile();
      dispatch(fetchPets());
      dispatch(fetchVaccines());
      dispatch(fetchMedicalRecords());
      dispatch(fetchAppointments());
    }
  }, [dispatch]); // only depends on dispatch

  return null; // This component doesn't need to render anything
};
