"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import PetDropDown from "@/utils/PetDropDown";
import Calender from "@/utils/Calender"; // Assuming you have this component
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import {
  fetchMedicalRecords,
  MedicalRecord,
} from "@/redux/features/medicalSlice";
import { Pet } from "@/redux/features/petSlice";

// Define the structure the UI will use
type UIDateGroup = {
  date: string;
  pets: {
    id: number; // This is the unique medical record ID
    petName: string;
    petType: string | null;
    petImage: string;
    history: MedicalRecord[]; // This will contain a single medical record
  }[];
};

const MedicalHistory = () => {
  const dispatch = useAppDispatch();
  const { pets } = useAppSelector((state) => state.pet);
  const { records, loading, error } = useAppSelector((state) => state.medical);

  // State for calendar and filtering
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<
    Pet | { id: "all"; name: string }
  >({ id: "all", name: "All" });

  useEffect(() => {
    dispatch(fetchMedicalRecords());
  }, [dispatch]);

  // Function to change the month in the calendar
  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setDate(1); // Avoid issues with month lengths
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  // Transform the fetched records into the structure needed by the UI
  const timelineData: UIDateGroup[] = useMemo(() => {
    const groupedByDate: { [date: string]: MedicalRecord[] } = {};

    records.forEach((record) => {
      const date = record.date.split("T")[0]; // Use YYYY-MM-DD for grouping
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(record);
    });

    return Object.keys(groupedByDate)
      .map((date) => {
        const recordsForDate = groupedByDate[date];
        return {
          date: date.replace(/-/g, "."), // Format date for display
          pets: recordsForDate.map((record) => {
            const petInfo = pets.find((p) => p.id === record.petId);
            return {
              id: record.id,
              petName: petInfo?.name || "Unknown Pet",
              petType: petInfo?.breed || null,
              petImage: petInfo?.image || "",
              history: [record],
            };
          }),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, pets]);

  // Filter timeline data based on selected pet AND selected date
  const filteredTimelineData = useMemo(() => {
    let dataToFilter = timelineData;

    // Filter by date if one is selected
    // Filter by date if one is selected
    if (selectedDate) {
      // Add 1 day to selectedDate
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Format as YYYY.MM.DD
      const dateStr = nextDay.toISOString().split("T")[0].replace(/-/g, ".");

      dataToFilter = dataToFilter.filter((group) => group.date === dateStr);
    }

    // Filter by pet
    if (selectedPet.id !== "all") {
      dataToFilter = dataToFilter
        .map((dateGroup) => ({
          ...dateGroup,
          pets: dateGroup.pets.filter(
            (pet) => pet.history[0].petId === selectedPet.id
          ),
        }))
        .filter((dateGroup) => dateGroup.pets.length > 0);
    }

    return dataToFilter;
  }, [timelineData, selectedPet, selectedDate]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10">
        <Link href={"/dashboard"}>
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[20px] font-medium text-[#1B1B1C]">
          Medical History
        </h1>
        <div>
          <Link href={"/dashboard/medical-record"}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10.25"
                fill="white"
                stroke="#1B1B1C"
                strokeWidth="1.5"
              />
              <path
                d="M16.5436 11.5436H12.4564V7.45641C12.4564 7.20402 12.2519 7 12 7C11.7481 7 11.5436 7.20402 11.5436 7.45641V11.5436H7.45641C7.20447 11.5436 7 11.7476 7 12C7 12.2524 7.20447 12.4564 7.45641 12.4564H11.5436V16.5436C11.5436 16.796 11.7481 17 12 17C12.2519 17 12.4564 16.796 12.4564 16.5436V12.4564H16.5436C16.7955 12.4564 17 12.2524 17 12C17 11.7476 16.7955 11.5436 16.5436 11.5436Z"
                fill="#1B1B1C"
                stroke="black"
                strokeWidth="0.5"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Dynamic Calendar Section */}
      <div className="bg-white  shadow pt-16">
        {/* <div className="flex items-center px-4 mb-2 justify-between">
          <h2 className="text-lg font-semibold">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleMonthChange("prev")}
              className="p-1 text-primary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleMonthChange("next")}
              className="p-1 text-primary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div> */}
        <Calender currentMonth={currentMonth} onDateSelect={setSelectedDate} />
        <PetDropDown
          selectedPet={selectedPet}
          setSelectedPet={setSelectedPet}
        />
      </div>

      {/* Timeline Records */}
      <div className="px-4 pt-8">
        {loading && (
          <div className="flex justify-center items-center p-8 min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && filteredTimelineData.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No medical records found for the selected criteria.
          </p>
        )}
        {!loading &&
          filteredTimelineData.map((dateGroup) => (
            <div key={dateGroup.date} className="relative mb-10">
              <div className="absolute left-1 top-8 h-full w-0.5 bg-[#D9D9D9]"></div>
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-[#545BDE] rounded-full z-0"></div>
                <div className="ml-4 text-lg font-medium text-[#1B1B1C]">
                  {dateGroup.date}
                </div>
              </div>
              <div className="ml-6 space-y-4">
                {dateGroup.pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="border-t-4 border-[#545BDE] px-4 pt-4">
                      <div className="flex items-center mb-4">
                        <img
                          src={pet.petImage}
                          alt={pet.petName}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="text-lg font-medium text-[#1B1B1C]">
                            {pet.petName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pet.petType}
                          </div>
                        </div>
                      </div>
                      {pet.history.map((historyItem) => (
                        <Link
                          href={`/dashboard/booking/medical-history/${historyItem.id}`}
                          key={historyItem.id}
                          className="block border-t border-[#E7E7E7]"
                        >
                          <div className="flex items-center py-4 cursor-pointer">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-3"
                            >
                              <path
                                d="M16.4897 19.8018C15.1683 20.5639 13.635 21 11.9999 21C7.02931 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 13.6351 20.564 15.1684 19.8018 16.4899L19.7989 16.495C19.7255 16.6221 19.6885 16.6863 19.6718 16.7469C19.656 16.804 19.6506 16.8554 19.6547 16.9146C19.6589 16.9773 19.6806 17.0424 19.7235 17.171L19.7253 17.1758L20.4941 19.4823L20.4951 19.4853C20.6573 19.9719 20.7384 20.2152 20.6806 20.3774C20.6302 20.5187 20.5188 20.6303 20.3774 20.6807C20.2152 20.7386 19.9711 20.6572 19.4838 20.4947L19.4819 20.4939L17.1724 19.7241C17.0427 19.6808 16.9775 19.6591 16.9144 19.6548C16.8552 19.6507 16.8042 19.6561 16.7471 19.6719C16.6857 19.6888 16.6203 19.7265 16.4897 19.8018Z"
                                fill="#545BDE"
                              />
                              <path
                                d="M12 15V12M12 12V9M12 12H15M12 12H9M11.9999 21C13.635 21 15.1683 20.5639 16.4897 19.8018C16.6203 19.7265 16.6857 19.6888 16.7471 19.6719C16.8042 19.6561 16.8552 19.6507 16.9144 19.6548C16.9775 19.6591 17.0427 19.6808 17.1724 19.7241L19.4819 20.4939L19.4838 20.4947C19.9711 20.6572 20.2152 20.7386 20.3774 20.6807C20.5188 20.6303 20.6302 20.5187 20.6806 20.3774C20.7384 20.2152 20.6573 19.9719 20.4951 19.4853L20.4941 19.4823L19.7253 17.1758L19.7235 17.171C19.6806 17.0424 19.6589 16.9773 19.6547 16.9146C19.6506 16.8554 19.656 16.804 19.6718 16.7469C19.6885 16.6863 19.7255 16.6221 19.7989 16.495L19.8018 16.4899C20.564 15.1684 21 13.6351 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02931 21 11.9999 21Z"
                                stroke="#545BDE"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 15V12M12 12V9M12 12H15M12 12H9"
                                stroke="white"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="text-base font-medium text-[#545BDE] flex-1">
                              {historyItem.title}
                            </div>
                            <div className="ml-auto">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M1.39378 4.39402C1.65221 4.13559 2.07122 4.13559 2.32965 4.39402L8.03819 10.1026L13.7467 4.39402C14.0052 4.13559 14.4242 4.13559 14.6826 4.39402C14.941 4.65246 14.941 5.07146 14.6826 5.3299L8.50612 11.5064C8.38202 11.6305 8.2137 11.7002 8.03819 11.7002C7.86268 11.7002 7.69435 11.6305 7.57025 11.5064L1.39378 5.3299C1.13534 5.07146 1.13534 4.65246 1.39378 4.39402Z"
                                  fill="#8E8E93"
                                />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MedicalHistory;
