"use client";
import Calender from "@/utils/Calender";
import FloatingActionButton from "@/utils/FloatingButton";
import Header from "@/utils/Header";
import PetDropDown from "@/utils/PetDropDown";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { Pet } from "@/redux/features/petSlice";
import { fetchAppointments } from "@/redux/features/appointmentSlice";
import { fetchMedicalRecords } from "@/redux/features/medicalSlice";
import { fetchVaccines } from "@/redux/features/vaccineslice";
import { fetchVaccineHistory } from "@/redux/features/vaccineHistory";

const BookingHistoryPage = () => {
  const dispatch = useAppDispatch();
  const { pets } = useAppSelector((state) => state.pet);
  const { appointments, loading: appointmentsLoading } = useAppSelector(
    (state) => state.appointment
  );
  const { records: medicalRecords, loading: medicalLoading } = useAppSelector(
    (state) => state.medical
  );
  const { vaccines, loading: vaccinesLoading } = useAppSelector(
    (state) => state.vaccine
  );

  const {
    histories,
    loading: historyLoading,
    error: historyError,
  } = useAppSelector((state) => state.vaccineHistory);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<
    Pet | { id: "all"; name: string }
  >({ id: "all", name: "All" });

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchMedicalRecords());
    dispatch(fetchVaccines());
  }, [dispatch]);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const filteredVisitRecords = useMemo(() => {
    let records = medicalRecords;
    if (selectedPet.id !== "all") {
      records = records.filter((r) => r.petId === Number(selectedPet.id));
    }
    if (selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dateStr = formatDate(nextDay);
      records = records.filter((r) => r.date.startsWith(dateStr));
    }
    return records;
  }, [medicalRecords, selectedPet, selectedDate]);

  const filteredVaccineRecords = useMemo(() => {
    let records = vaccines;
    if (selectedPet.id !== "all") {
      records = records.filter((r) => r.petId === Number(selectedPet.id));
    }
    if (selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dateStr = formatDate(nextDay);
      records = records.filter((r) => r.vaccinationDate.startsWith(dateStr));
    }
    return records;
  }, [vaccines, selectedPet, selectedDate]);

  const filteredAppointments = useMemo(() => {
    let records = appointments;
    if (selectedPet.id !== "all") {
      records = records.filter((appt) =>
        appt.pets.some((p) => p.selectedPet.id === selectedPet.id)
      );
    }
    if (selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dateStr = formatDate(nextDay);
      records = records.filter((appt) => appt.date.startsWith(dateStr));
    }
    return records;
  }, [appointments, selectedPet, selectedDate]);

  const toggleExpanded = (recordId: number) => {
    const newExpandedRecord = expandedRecord === recordId ? null : recordId;
    setExpandedRecord(newExpandedRecord);
    if (newExpandedRecord !== null && !histories[newExpandedRecord]) {
      dispatch(fetchVaccineHistory(newExpandedRecord));
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header section */}
      <Header title="Bookings" />
      <div className="flex-none pt-16">
        {/* Calendar section */}
        <Calender onDateSelect={(date) => setSelectedDate(date)} />
        {/* Custom dropdown for pet selection */}
        <PetDropDown
          selectedPet={selectedPet}
          setSelectedPet={setSelectedPet}
        />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Section divider with title */}
        <div className="flex items-center px-4 py-2 z-10">
          <div className="flex-1 h-px bg-[#545BDE]"></div>
          <div className="px-4">
            <button className="px-4 py-1 text-[#545BDE] bg-[#545BDE]/15 border border-[#545BDE] rounded-md text-sm font-medium">
              Visit Record
            </button>
          </div>
          <div className="flex-1 h-px bg-[#545BDE]"></div>
        </div>

        {/* Visit Records */}
        <div className="px-4 py-2">
          {medicalLoading ? (
            <Loader2 className="mx-auto my-4 animate-spin" />
          ) : filteredVisitRecords.length > 0 ? (
            filteredVisitRecords.map((record) => {
              const pet = pets.find((p) => p.id === record.petId);
              return (
                <div
                  key={record.id}
                  className="mb-8 bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="border-t-4 border-[#545BDE] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-medium">
                        {record.date
                          ? (() => {
                              const d = new Date(record.date);
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              const day = String(d.getDate()).padStart(2, "0");
                              const year = d.getFullYear();
                              return `${month}-${day}-${year}`;
                            })()
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center mb-4">
                      <img
                        src={pet?.image || ""}
                        alt={pet?.name}
                        className="w-14 h-14 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="text-xl font-medium">{pet?.name}</div>
                        <div className="text-base text-gray-500">
                          {pet?.breed}
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 pb-2 mb-3"></div>
                    <Link
                      href={`/dashboard/booking/medical-history/${record.id}`}
                      key={record.id}
                    >
                      <div className="flex items-center py-3 cursor-pointer">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
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
                        <div className="text-lg font-medium ml-3 text-[#545BDE]">
                          {record.title}
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
                              d="M1.39378 4.39378C1.65221 4.13534 2.07122 4.13534 2.32965 4.39378L8.03819 10.1023L13.7467 4.39378C14.0052 4.13534 14.4242 4.13534 14.6826 4.39378C14.941 4.65221 14.941 5.07122 14.6826 5.32965L8.50612 11.5061C8.38202 11.6302 8.2137 11.7 8.03819 11.7C7.86268 11.7 7.69435 11.6302 7.57025 11.5061L1.39378 5.32965C1.13534 5.07122 1.13534 4.65221 1.39378 4.39378Z"
                              fill="#8E8E93"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-4">
              No visit records for this day.
            </p>
          )}
        </div>

        {/* Section divider with title */}
        <div className="flex items-center px-4 py-2 z-10">
          <div className="flex-1 h-px bg-[#A1534E]"></div>
          <div className="px-4">
            <button className="px-4 py-1 text-[#A1534E] border border-[#A1534E] bg-[#A1534E]/15 rounded-md text-sm font-medium">
              Vaccine
            </button>
          </div>
          <div className="flex-1 h-px bg-[#A1534E]"></div>
        </div>

        {/* Vaccine Records */}
        <div className="px-4 py-2">
          {vaccinesLoading ? (
            <Loader2 className="mx-auto my-4 animate-spin" />
          ) : filteredVaccineRecords.length > 0 ? (
            filteredVaccineRecords.map((record) => {
              const pet = pets.find((p) => Number(p.id) === record.petId);
              const recordHistory = histories[record.id] || [];
              return (
                <div
                  key={record.id}
                  className="mb-8 bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="border-t-4 border-[#A1534E] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-xl font-medium mr-2">
                          {record.vaccineName}
                        </span>
                        <span className="px-3 py-1 bg-[#A1534E] text-white text-xs rounded-full">
                          {"Vaccine"}
                        </span>
                      </div>
                      <div className="text-base text-gray-400">
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
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/booking/vaccine-details/${record.id}`}
                      className="flex items-center mb-4"
                    >
                      <img
                        src={pet?.image}
                        alt={pet?.name}
                        className="w-14 h-14 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="text-xl font-medium">{pet?.name}</div>
                        <div className="text-base text-gray-500">
                          {pet?.breed}
                        </div>
                      </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-y-3 text-base border-b border-gray-200 pb-5">
                      <div className="text-gray-400">Vaccination date</div>
                      <div>
                        {" "}
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
                      </div>
                      <div className="text-gray-400">Expiration period</div>
                      <div>
                        {record.dueDate
                          ? (() => {
                              const d = new Date(record.dueDate);
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              const day = String(d.getDate()).padStart(2, "0");
                              const year = d.getFullYear() + 1;
                              return `${month}-${day}-${year}`;
                            })()
                          : "N/A"}
                      </div>
                      <div className="text-gray-400">Vaccination cycle</div>
                      <div>1 year apart</div>
                    </div>
                    <div className="mt-3 w-full">
                      <button
                        onClick={() => toggleExpanded(record.id)}
                        className="w-full flex items-center justify-between  py-3 cursor-pointer"
                      >
                        <div className="text-lg font-medium text-[#A1534E] flex items-center">
                          <svg
                            className="mr-3"
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
                          Visit History
                        </div>

                        <div className="ml-auto">
                          {expandedRecord === record.id ? (
                            <ChevronUp className="h-6 w-6 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </button>
                    </div>
                    {expandedRecord === record.id && (
                      <div className="p-3 w-full">
                        {historyLoading &&
                        histories[record.id] === undefined ? (
                          <div className=" p-4 flex justify-between items-center w-full min-h-32">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : historyError ? (
                          <p className="text-center text-red-500 p-4">
                            {historyError}
                          </p>
                        ) : recordHistory.length === 0 ? (
                          <p className="text-center text-gray-500 p-4">
                            No visit history found.
                          </p>
                        ) : (
                          recordHistory.map((history) => (
                            <div
                              key={history.id}
                              className="px-4 py-4 rounded-lg bg-gray-50 space-y-4 mt-2"
                            >
                              <div>
                                <div className="text-gray-500 text-sm mb-1">
                                  Date of treatment
                                </div>
                                <div className="text-sm">
                                  {new Date(
                                    history.dateAdministered
                                  ).toLocaleDateString()}
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
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-4">
              No vaccine records for this day.
            </p>
          )}
        </div>

        {/* Section divider with title */}
        <div className="flex items-center px-4 py-2 bg-white z-10">
          <div className="flex-1 h-px bg-[#E15FCE]"></div>
          <div className="px-4">
            <button className="px-4 py-1 text-[#E15FCE] border border-[#E15FCE] bg-[#E15FCE]/15 rounded-md text-sm font-medium">
              Appointment
            </button>
          </div>
          <div className="flex-1 h-px bg-[#E15FCE]"></div>
        </div>

        {/* Appointments */}
        <div className="px-4 py-2">
          {appointmentsLoading ? (
            <Loader2 className="mx-auto my-4 animate-spin" />
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Link
                href={`/dashboard/booking/appointments/${appointment.id}`}
                key={appointment.id}
                className="block mb-8 bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="border-t-4 border-[#E15FCE] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xl font-medium flex justify-between w-full">
                      <span>
                        {(() => {
                          const d = new Date(appointment.date);
                          const month = String(d.getMonth() + 1).padStart(
                            2,
                            "0"
                          ); // months are 0-based
                          const day = String(d.getDate()).padStart(2, "0");
                          const year = d.getFullYear();
                          return `${month}-${day}-${year}`;
                        })()}
                      </span>
                      <span>
                        {" "}
                        {appointment.timeSlot} {appointment.time}
                      </span>
                    </div>
                  </div>
                  {appointment.pets.map((petData, index) => {
                    // FIX: Use optional chaining and ensure IDs are compared as strings
                    const matchedPet = pets.find(
                      (p) => p.id == String(petData.selectedPet?.id)
                    );

                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-3 py-2 border-b border-gray-100"
                      >
                        {matchedPet?.image && (
                          <img
                            src={matchedPet?.image || ""}
                            alt={matchedPet?.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {matchedPet?.name ||
                              petData.selectedPet?.name ||
                              "Unknown Pet"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {petData.purposeOfVisit}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No appointments for this day.
            </p>
          )}
        </div>
      </div>
      <FloatingActionButton />
    </div>
  );
};

export default BookingHistoryPage;
