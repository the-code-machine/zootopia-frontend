"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/redux/lib/store";
import { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { fetchPets } from "@/redux/features/petSlice";
import Cookies from "js-cookie";
import { fetchVaccineHistory } from "@/redux/features/vaccineHistory";
import { fetchVaccines } from "@/redux/features/vaccineslice";
import { fetchMedicalRecords } from "@/redux/features/medicalSlice";
import { fetchAppointments } from "@/redux/features/appointmentSlice";
import { usePathname } from "next/navigation";
import axiosClient from "@/utils/axiosClient";
import { setUserProfile } from "@/redux/features/userSlice";

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
  const { pets } = useAppSelector((state) => state.pet);
  const { vaccines } = useAppSelector((state) => state.vaccine);
  const { records } = useAppSelector((state) => state.medical);
  const { appointments } = useAppSelector((state) => state.appointment);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const auth = Cookies.get("auth_token");
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

    if (
      pets.length <= 0 &&
      auth &&
      vaccines.length <= 0 &&
      records.length <= 0 &&
      appointments.length <= 0
    ) {
      fetchUserProfile();
      dispatch(fetchPets());
      dispatch(fetchVaccines());
      dispatch(fetchMedicalRecords());
      dispatch(fetchAppointments());
    }
  }, [dispatch]);
  return <></>;
};
