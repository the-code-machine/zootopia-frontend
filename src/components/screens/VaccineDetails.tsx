"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronUp,
  ChevronRight,
  Loader2,
  ChevronDown,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import PetDropDown from "@/utils/PetDropDown";
import Calender from "@/utils/Calender"; // Assuming this is your calendar component
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { fetchVaccines, Vaccine } from "@/redux/features/vaccineslice";
import {
  fetchVaccineHistory,
  VaccineHistory,
} from "@/redux/features/vaccineHistory";
import { Pet } from "@/redux/features/petSlice";

const VaccineRecordApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pets } = useAppSelector((state) => state.pet);
  const {
    vaccines,
    loading: vaccinesLoading,
    error: vaccinesError,
  } = useAppSelector((state) => state.vaccine);
  const {
    histories,
    loading: historyLoading,
    error: historyError,
  } = useAppSelector((state) => state.vaccineHistory);

  // State for calendar and filtering
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<
    Pet | { id: "all"; name: string }
  >({ id: "all", name: "All" });
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  // Fetch all vaccine records on component mount
  useEffect(() => {
    dispatch(fetchVaccines());
  }, [dispatch]);

  // Fetch history for each vaccine record when it's expanded
  const toggleExpanded = (recordId: number) => {
    const newExpandedRecord = expandedRecord === recordId ? null : recordId;
    setExpandedRecord(newExpandedRecord);
    if (newExpandedRecord !== null && !histories[newExpandedRecord]) {
      dispatch(fetchVaccineHistory(newExpandedRecord));
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setDate(1); // Set to the first to avoid month-end issues
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // Filter records based on selected pet and date
  const filteredRecords = useMemo(() => {
    let records = vaccines;

    // Filter by pet
    if (selectedPet.id !== "all") {
      records = records.filter((record) => record.petId === selectedPet.id);
    }

    if (selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dateStr = formatDate(nextDay);
      records = records.filter((record) =>
        record.vaccinationDate.startsWith(dateStr)
      );
    }

    return records;
  }, [vaccines, selectedPet, selectedDate]);

  const getPetForRecord = (petId: number) => {
    return pets.find((p) => p.id === petId);
  };

  const loading = vaccinesLoading;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10">
        <Link href={"/dashboard"}>
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[20px] font-medium text-[#1B1B1C]">
          Vaccine Records
        </h1>
        <div>
          <Link href={"/dashboard/vaccine-registration"}>
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

      {/* Filters */}
      <div className="bg-white py-4 shadow pt-16">
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

      {/* Vaccine Records */}
      <div className="px-4 py-4 space-y-4">
        {loading && (
          <div className="flex justify-center items-center p-8 min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {vaccinesError && (
          <p className="text-center text-red-500">{vaccinesError}</p>
        )}

        {!loading && filteredRecords.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No vaccine records found for the selected criteria.
          </p>
        )}

        {!loading &&
          filteredRecords.map((record) => {
            const pet = getPetForRecord(record.petId);
            const recordHistory = histories[record.id] || [];

            return (
              <div
                key={record.id}
                className="bg-white border-[#E5E5EA] border rounded-lg"
              >
                <div className="px-4 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#1B1B1C] font-semibold text-sm">
                        {record.vaccineName}
                      </span>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        Vaccine
                      </span>
                    </div>
                    <span className="text-[#AEAEB2] text-sm font-normal">
                      {record.vaccinationDate
                        ? (() => {
                            const d = new Date(record.vaccinationDate);
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(d.getDate()).padStart(2, "0");
                            const year = d.getFullYear();
                            return `${month}-${day}-${year}`;
                          })()
                        : "N/A"}
                    </span>
                  </div>
                  <Link
                    href={"/dashboard/booking/vaccine-details/" + record.id}
                    className="flex items-center space-x-3 mb-4"
                  >
                    <img
                      src={pet?.image || ""}
                      alt={pet?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-[#1B1B1C] text-sm font-medium">
                        {pet?.name}
                      </div>
                      <div className="text-[#8E8E93] text-sm font-normal">
                        {pet?.breed}
                      </div>
                    </div>
                  </Link>
                  <div className="space-y-2 text-sm">
                    <div className="flex space-x-3">
                      <span className="text-[#AEAEB2] font-normal w-28">
                        vaccination date
                      </span>
                      <span className="text-[#1B1B1C] font-normal">
                        {record.vaccinationDate
                          ? (() => {
                              const d = new Date(record.vaccinationDate);
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              const day = String(d.getDate()).padStart(2, "0");
                              const year = d.getFullYear();
                              return `${month}-${day}-${year}`;
                            })()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex space-x-3">
                      <span className="text-[#AEAEB2] font-normal w-28">
                        expiration period
                      </span>
                      <span className="text-[#1B1B1C] font-normal">
                        {record.dueDate
                          ? (() => {
                              const d = new Date(record.dueDate);
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              const day = String(d.getDate()).padStart(2, "0");
                              const year = d.getFullYear() + 1; // ✅ add one year
                              return `${month}-${day}-${year}`;
                            })()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <span className="text-[#AEAEB2] font-normal w-28">
                        vaccination cycle
                      </span>
                      <span className="text-[#1B1B1C] font-normal">
                        1 year apart
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpanded(record.id)}
                    className="flex items-center justify-between w-full mt-4 py-3 border-t border-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.4897 19.8018C15.1683 20.5639 13.635 21 11.9999 21C7.02931 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 13.6351 20.564 15.1684 19.8018 16.4899L19.7989 16.495C19.7255 16.6221 19.6885 16.6863 19.6718 16.7469C19.656 16.804 19.6506 16.8554 19.6547 16.9146C19.6589 16.9773 19.6806 17.0424 19.7235 17.171L19.7253 17.1758L20.4941 19.4823L20.4951 19.4853C20.6573 19.9719 20.7384 20.2152 20.6806 20.3774C20.6302 20.5187 20.5188 20.6303 20.3774 20.6807C20.2152 20.7386 19.9711 20.6572 19.4838 20.4947L19.4819 20.4939L17.1724 19.7241C17.0427 19.6808 16.9775 19.6591 16.9144 19.6548C16.8552 19.6507 16.8042 19.6561 16.7471 19.6719C16.6857 19.6888 16.6203 19.7265 16.4897 19.8018Z"
                          fill="#A1534E"
                        />
                        <path
                          d="M12 15V12M12 12V9M12 12H15M12 12H9M11.9999 21C13.635 21 15.1683 20.5639 16.4897 19.8018C16.6203 19.7265 16.6857 19.6888 16.7471 19.6719C16.8042 19.6561 16.8552 19.6507 16.9144 19.6548C16.9775 19.6591 17.0427 19.6808 17.1724 19.7241L19.4819 20.4939L19.4838 20.4947C19.9711 20.6572 20.2152 20.7386 20.3774 20.6807C20.5188 20.6303 20.6302 20.5187 20.6806 20.3774C20.7384 20.2152 20.6573 19.9719 20.4951 19.4853L20.4941 19.4823L19.7253 17.1758L19.7235 17.171C19.6806 17.0424 19.6589 16.9773 19.6547 16.9146C19.6506 16.8554 19.656 16.804 19.6718 16.7469C19.6885 16.6863 19.7255 16.6221 19.7989 16.495L19.8018 16.4899C20.564 15.1684 21 13.6351 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02931 21 11.9999 21Z"
                          stroke="#A1534E"
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
                      <span className="text-primary font-medium">
                        Visit History
                      </span>
                    </div>
                    {expandedRecord === record.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                {expandedRecord === record.id && (
                  <div className="p-3 ">
                    {historyLoading && (
                      <div className="text-center p-4 w-full h-32 flex justify-center items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                    {historyError && (
                      <p className="text-center text-red-500 p-4">
                        {historyError}
                      </p>
                    )}
                    {!historyLoading && recordHistory.length === 0 && (
                      <p className="text-center text-gray-500 p-4">
                        No visit history found.
                      </p>
                    )}
                    {recordHistory.map((history) => (
                      <div
                        key={history.id}
                        className="px-4 py-4 rounded-lg bg-gray-50 space-y-4 mt-2"
                      >
                        <div>
                          <div className="text-gray-500 text-sm mb-1">
                            Date of treatment
                          </div>
                          <div className="text-sm">
                            {history.dateAdministered
                              ? (() => {
                                  const d = new Date(history.dateAdministered);
                                  const month = String(
                                    d.getMonth() + 1
                                  ).padStart(2, "0");
                                  const day = String(d.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const year = d.getFullYear();
                                  return `${month}-${day}-${year}`;
                                })()
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-1">
                            Medical treatment information
                          </div>
                          <div className="text-sm leading-relaxed">
                            {history.treatmentInfo}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-1">
                            vaccination cycle
                          </div>
                          <div className="text-sm leading-relaxed">
                            1 year apart
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-2">
                            Photo
                          </div>
                          <div className="flex space-x-3">
                            {history.photos.map((photo, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={photo.url}
                                  alt={photo.type}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-primary text-white text-xs rounded-tl-lg rounded-br-lg">
                                  {photo.type}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default VaccineRecordApp;
