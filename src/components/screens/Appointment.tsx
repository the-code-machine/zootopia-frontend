"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Home, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { createAppointment } from "@/redux/features/appointmentSlice";
import axiosClient from "@/utils/axiosClient";
import toast from "react-hot-toast";
export interface BlockedSlot {
  id: number;
  date: string;
  time: string | null; // HH:MM or null
  reason?: string;
}
interface Pet {
  id: string | null;
  name?: string;
  type?: string;
  gender?: string;
  age?: string;
  weight?: string;
  is_neutered?: boolean;
  image?: string;
}

interface PetFormData {
  selectedPet?: Pet;
  purposeOfVisit: string;
  memo: string;
}

export interface AppointmentFormData {
  id?: string;
  status?: string;
  date: string;
  time: string;
  timeSlot: "AM" | "PM";
  numberOfPets: number;
  pets: PetFormData[];
  memberInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  agreedToPolicy: boolean;
}

const AppointmentPage: React.FC = () => {
  const user = useAppSelector((state) => state.user);
  const { pets } = useAppSelector((state) => state.pet);
  const { loading } = useAppSelector((state) => state.appointment);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State for blocked slots
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedTime, setSelectedTime] = useState("05:00");
  const [timeSlot, setTimeSlot] = useState<"AM" | "PM">("PM");
  const [numberOfPets, setNumberOfPets] = useState(1);
  const [petForms, setPetForms] = useState<PetFormData[]>([
    { selectedPet: undefined, purposeOfVisit: "", memo: "" },
  ]);
  const [showPetModal, setShowPetModal] = useState(false);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  // Fetch blocked slots on component mount
  useEffect(() => {
    const fetchBlockedSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const response = await axiosClient.get(
          "/admin/blocked_slot?limit=1000"
        );
        setBlockedSlots(response.data.data);
      } catch (error) {
        console.error("Failed to fetch blocked slots:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchBlockedSlots();
  }, []);

  const formatDateForAPI = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };
  // Helper to format a Date object to 'YYYY-MM-DD' regardless of timezone
  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // CORRECTED: Helper function to check if a specific date or time slot is blocked
  const isSlotBlocked = (date: Date, time: string | null = null): boolean => {
    const dateToCheck = formatDateToYYYYMMDD(date);

    const isDayBlocked = blockedSlots.some(
      (slot) => slot.date.substring(0, 10) === dateToCheck && slot.time === null
    );
    if (isDayBlocked) return true;

    if (time) {
      return blockedSlots.some(
        (slot) =>
          slot.date.substring(0, 10) === dateToCheck &&
          slot.time === `${time}:00`
      );
    }

    return false;
  };

  // Sample member info (in real app, this would come from user context/auth)
  const memberInfo = useMemo(() => {
    return {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      phoneNumber: user?.profile?.email?.substring(0, 20) || "",
    };
  }, [user]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const amTimes = [
    { display: "09:00", value: "09:00" },
    { display: "10:00", value: "10:00" },
    { display: "11:00", value: "11:00" },
  ];
  const pmTimes = [
    { display: "12:00", value: "12:00" },
    { display: "01:00", value: "13:00" },
    { display: "02:00", value: "14:00" },
    { display: "03:00", value: "15:00" },
    { display: "04:00", value: "16:00" },
    { display: "05:00", value: "17:00" },
    { display: "06:00", value: "18:00" },
    { display: "07:00", value: "19:00" },
    { display: "08:00", value: "20:00" },
    { display: "09:00", value: "21:00" },
  ];

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push({
        day: null,
        isCurrentMonth: false,
        isPast: true,
        isBlocked: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const past = date < new Date(today.toDateString());
      const blocked = isSlotBlocked(date);
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isPast: past,
        isBlocked: blocked,
      });
    }

    return calendarDays;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setDate(1);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate each pet form
    petForms.forEach((form, index) => {
      if (!form.selectedPet) {
        newErrors[`pet_${index}_selection`] = `Please select a pet for Pet ${
          index + 1
        }`;
      }
      if (!form.purposeOfVisit.trim()) {
        newErrors[
          `pet_${index}_purpose`
        ] = `Please enter purpose of visit for Pet ${index + 1}`;
      }
      if (!form.memo.trim()) {
        newErrors[`pet_${index}_memo`] = `Please enter memo for Pet ${
          index + 1
        }`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return petForms.every(
      (form) =>
        form.selectedPet && form.purposeOfVisit.trim() && form.memo.trim()
    );
  };

  const handlePetCountChange = (operation: "increase" | "decrease") => {
    if (operation === "increase" && numberOfPets < 10) {
      const newCount = numberOfPets + 1;
      setNumberOfPets(newCount);
      setPetForms((prev) => [
        ...prev,
        { selectedPet: undefined, purposeOfVisit: "", memo: "" },
      ]);
    } else if (operation === "decrease" && numberOfPets > 1) {
      const newCount = numberOfPets - 1;
      setNumberOfPets(newCount);
      setPetForms((prev) => prev.slice(0, newCount));
      // Clear errors for removed forms
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`pet_${newCount}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const handlePetSelection = (pet: Pet) => {
    // Check if the pet (by ID) is already selected in another form,
    // excluding the current one being edited.
    // Don't check for unregistered pets (id === null).
    const isAlreadySelected = petForms.some(
      (form, index) =>
        index !== currentFormIndex &&
        form.selectedPet?.id !== null &&
        form.selectedPet?.id === pet.id
    );

    if (isAlreadySelected) {
      toast.error("This pet has already been added to the appointment.");
      return; // Stop the function here
    }

    // If not selected, proceed as normal
    const updatedForms = [...petForms];
    updatedForms[currentFormIndex].selectedPet = pet;
    setPetForms(updatedForms);
    setShowPetModal(false);
  };

  const updatePetForm = (
    index: number,
    field: keyof PetFormData,
    value: string
  ) => {
    const updatedForms = [...petForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setPetForms(updatedForms);

    // Clear field error when user starts typing
    const newErrors = { ...errors };
    delete newErrors[
      `pet_${index}_${field === "purposeOfVisit" ? "purpose" : "memo"}`
    ];
    setErrors(newErrors);
  };

  const openPetModal = (formIndex: number) => {
    setCurrentFormIndex(formIndex);
    setShowPetModal(true);
  };

  const handleNextClick = () => {
    if (validateForm()) {
      setShowConfirmationModal(true);
    }
  };

  const prepareAppointmentData = (): AppointmentFormData => {
    // Formats the date into YYYY-MM-DD
    const formattedDate = formatDateToYYYYMMDD(selectedDate);

    return {
      date: formattedDate, // Use the correctly formatted date
      time: selectedTime,
      timeSlot,
      numberOfPets,
      pets: petForms,
      memberInfo,
      agreedToPolicy: isChecked,
    };
  };
  const handleConfirmAppointment = async () => {
    if (!isChecked) {
      alert("Please agree to the cancellation policy before confirming.");
      return;
    }

    try {
      const appointmentData = prepareAppointmentData();
      console.log("Submitting appointment data:", appointmentData);

      // Dispatch the action and get the result
      const resultAction = await dispatch(createAppointment(appointmentData));

      // Check if the action was fulfilled (successful)
      if (resultAction) {
        setShowConfirmationModal(false);
        setShowSuccessModal(true);
      } else {
        // Handle the rejected case (failure)
        console.error("Submission failed:", resultAction.payload);
        alert(
          "Failed to create appointment. Please review your details and try again."
        );

        // IMPORTANT: Close the confirmation modal to return the user to the form
        setShowConfirmationModal(false);
      }
    } catch (error) {
      // This catches any other unexpected errors
      console.error("Error submitting appointment:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleModalBackdropClick = (
    e: React.MouseEvent,
    closeModal: () => void
  ) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const formatDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getErrorForField = (
    petIndex: number,
    field: string
  ): string | undefined => {
    return errors[`pet_${petIndex}_${field}`];
  };
  function formatAge(birthday: string | Date): string {
    const birthDate = new Date(birthday);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // days in previous month
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (years === 0 && months === 0)
      parts.push(`${days} day${days > 1 ? "s" : ""}`);

    return parts.join(", ");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      {!showConfirmationModal && (
        <>
          <div className="bg-white fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10">
            <Link href={"/dashboard"}>
              <svg
                width="18"
                height="17"
                viewBox="0 0 18 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.5 1.35355C7.69526 1.15829 8.01184 1.15829 8.20711 1.35355C8.40237 1.54882 8.40237 1.8654 8.20711 2.06066L1.91421 8.35355H16.7071C16.9832 8.35355 17.2071 8.57741 17.2071 8.85355C17.2071 9.1297 16.9833 9.35355 16.7071 9.35355H1.91421L8.20711 15.6464C8.40237 15.8417 8.40237 16.1583 8.20711 16.3536C8.01184 16.5488 7.69526 16.5488 7.5 16.3536L0.707107 9.56066C0.316582 9.17014 0.316583 8.53697 0.707107 8.14645L7.5 1.35355Z"
                  fill="#1B1B1C"
                  stroke="black"
                  strokeWidth="0.5"
                />
              </svg>
            </Link>
            <h1 className="text-[20px] font-medium text-[#1B1B1C]">
              New Appointment
            </h1>
            <Link href={"/dashboard"}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_12564_3123)">
                  <path
                    d="M19.2677 7.55739L12.9468 1.23572C12.1645 0.455713 11.1049 0.0177002 10.0002 0.0177002C8.89544 0.0177002 7.83579 0.455713 7.0535 1.23572L0.732663 7.55739C0.499684 7.78888 0.314971 8.0643 0.189231 8.36771C0.063492 8.67111 -0.000772746 8.99646 0.000162654 9.32489V17.5057C0.000162654 18.1688 0.263555 18.8046 0.732396 19.2735C1.20124 19.7423 1.83712 20.0057 2.50016 20.0057H17.5002C18.1632 20.0057 18.7991 19.7423 19.2679 19.2735C19.7368 18.8046 20.0002 18.1688 20.0002 17.5057V9.32489C20.0011 8.99646 19.9368 8.67111 19.8111 8.36771C19.6854 8.0643 19.5006 7.78888 19.2677 7.55739ZM12.5002 18.3391H7.50016V15.0607C7.50016 14.3977 7.76356 13.7618 8.2324 13.293C8.70124 12.8241 9.33712 12.5607 10.0002 12.5607C10.6632 12.5607 11.2991 12.8241 11.7679 13.293C12.2368 13.7618 12.5002 14.3977 12.5002 15.0607V18.3391ZM18.3335 17.5057C18.3335 17.7267 18.2457 17.9387 18.0894 18.095C17.9331 18.2513 17.7212 18.3391 17.5002 18.3391H14.1668V15.0607C14.1668 13.9557 13.7278 12.8958 12.9464 12.1144C12.165 11.333 11.1052 10.8941 10.0002 10.8941C8.89509 10.8941 7.83529 11.333 7.05389 12.1144C6.27248 12.8958 5.8335 13.9557 5.8335 15.0607V18.3391H2.50016C2.27915 18.3391 2.06719 18.2513 1.91091 18.095C1.75463 17.9387 1.66683 17.7267 1.66683 17.5057V9.32489C1.6676 9.10404 1.75532 8.89238 1.911 8.73572L8.23183 2.41656C8.70158 1.949 9.33738 1.68651 10.0002 1.68651C10.6629 1.68651 11.2987 1.949 11.7685 2.41656L18.0893 8.73822C18.2444 8.89426 18.3321 9.10491 18.3335 9.32489V17.5057Z"
                    fill="#222222"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_12564_3123">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </Link>
          </div>

          <div className="pt-16">
            {/* Appointment Info */}
            <div className="bg-white p-6 border-[#E7E7E7] border-b mb-3">
              <h2 className="text-xl font-bold mb-3">Appointment</h2>
              <p className="text-sm text-gray-600 mb-1">
                Note : Consultation hours is 9:00 am to 6:00 pm : Cut off will
                be at 6:00 PM &{" "}
                <span className="text-red-500 font-semibold">
                  Emergency hours is 7:00 PM to 9:00 PM
                </span>
              </p>
            </div>

            {/* Calendar */}
            <div className="bg-white p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold mx-4 text-lg">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayObj, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      dayObj.isCurrentMonth &&
                      !dayObj.isPast &&
                      !dayObj.isBlocked &&
                      setSelectedDate(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          dayObj.day!
                        )
                      )
                    }
                    disabled={
                      dayObj.isPast ||
                      dayObj.isBlocked ||
                      !dayObj.isCurrentMonth
                    }
                    className={`w-10 h-10 text-sm rounded-lg flex items-center justify-center mx-auto transition-colors
                      ${
                        dayObj.isPast || !dayObj.isCurrentMonth
                          ? "text-gray-300"
                          : ""
                      }
                      ${
                        dayObj.isBlocked
                          ? "bg-red-200 text-red-400 cursor-not-allowed line-through"
                          : ""
                      }
                      ${
                        dayObj.isCurrentMonth &&
                        !dayObj.isBlocked &&
                        !dayObj.isPast
                          ? selectedDate.toDateString() ===
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth(),
                              dayObj.day!
                            ).toDateString()
                            ? "bg-primary text-white"
                            : "text-gray-800 hover:bg-gray-100"
                          : ""
                      }
                    `}
                  >
                    {dayObj.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white border-b p-6 border-gray-100">
              <h3 className="font-semibold mb-3">AM</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {amTimes.map((time) => {
                  const isDisabled = isSlotBlocked(selectedDate, time.value);
                  return (
                    <button
                      key={time.value}
                      onClick={() => {
                        setSelectedTime(time.value);
                        setTimeSlot("AM");
                      }}
                      disabled={isDisabled}
                      className={`py-2 px-3 text-sm rounded-md border ${
                        selectedTime === time.value && timeSlot === "AM"
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300"
                      } ${
                        isDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "hover:border-gray-400"
                      }`}
                    >
                      {time.display}
                    </button>
                  );
                })}
              </div>
              <h3 className="font-semibold mb-3">PM</h3>
              <div className="grid grid-cols-4 gap-2">
                {pmTimes.map((time) => {
                  const isDisabled = isSlotBlocked(selectedDate, time.value);
                  return (
                    <button
                      key={time.value}
                      onClick={() => {
                        setSelectedTime(time.value);
                        setTimeSlot("PM");
                      }}
                      disabled={isDisabled}
                      className={`py-2 px-3 text-sm rounded-md border ${
                        selectedTime === time.value && timeSlot === "PM"
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300"
                      } ${
                        isDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "hover:border-gray-400"
                      }`}
                    >
                      {time.display}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of pets */}
            <div className="bg-white border-[#E7E7E7] border-t p-6">
              <div className="flex justify-between">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of pets <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-blue-500 mt-1">
                    Up to 10 animals can be registered.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handlePetCountChange("decrease")}
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    disabled={numberOfPets <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                    {numberOfPets}
                  </span>
                  <button
                    onClick={() => handlePetCountChange("increase")}
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    disabled={numberOfPets >= 10}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pet Forms */}
            {petForms.map((form, index) => (
              <div
                key={index}
                className="bg-white border-[#E7E7E7] border-t p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pet {index + 1} Information
                </h3>

                {/* Pet reservation */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pet reservation <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={() => openPetModal(index)}
                    className={`w-full p-3 rect text-left focus:ring-2 flex justify-between focus:ring-cyan-500 focus:border-primary ${
                      form.selectedPet ? "text-[#3BB8AF] font-semibold" : ""
                    } ${
                      getErrorForField(index, "selection")
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <span>
                      {form.selectedPet
                        ? `${form.selectedPet.name}`
                        : "Select pet"}
                    </span>
                    <span>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.24664 9.25191C7.41106 9.08397 7.62033 9 7.87444 9C8.12855 9 8.33782 9.08397 8.50224 9.25191L12 12.8244L15.4978 9.25191C15.6622 9.08397 15.8714 9 16.1256 9C16.3797 9 16.5889 9.08397 16.7534 9.25191C16.9178 9.41985 17 9.63359 17 9.89313C17 10.1527 16.9178 10.3664 16.7534 10.5344L12.6278 14.7481C12.5381 14.8397 12.441 14.9046 12.3363 14.9427C12.2317 14.9809 12.1196 15 12 15C11.8804 15 11.7683 14.9809 11.6637 14.9427C11.559 14.9046 11.4619 14.8397 11.3722 14.7481L7.24664 10.5344C7.08221 10.3664 7 10.1527 7 9.89313C7 9.63359 7.08221 9.41985 7.24664 9.25191Z"
                          fill="#222222"
                        />
                      </svg>
                    </span>
                  </button>
                  {getErrorForField(index, "selection") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getErrorForField(index, "selection")}
                    </p>
                  )}
                </div>

                {/* Purpose of visit */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purpose of visit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.purposeOfVisit}
                    onChange={(e) =>
                      updatePetForm(index, "purposeOfVisit", e.target.value)
                    }
                    placeholder="Enter purpose of visit"
                    className={`w-full p-3 rect focus:ring-2 focus:ring-primary focus:outline-none ${
                      getErrorForField(index, "purpose") ? "border-red-500" : ""
                    }`}
                  />
                  {getErrorForField(index, "purpose") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getErrorForField(index, "purpose")}
                    </p>
                  )}
                </div>

                {/* Memo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Memo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.memo}
                    onChange={(e) =>
                      updatePetForm(index, "memo", e.target.value)
                    }
                    placeholder="More details or concerns"
                    rows={4}
                    className={`w-full p-3 rect resize-none focus:ring-1 focus:ring-primary focus:outline-none ${
                      getErrorForField(index, "memo") ? "border-red-500" : ""
                    }`}
                  />
                  {getErrorForField(index, "memo") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getErrorForField(index, "memo")}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Next Button */}
            <div className="w-full px-4 py-4 bg-white">
              <button
                onClick={handleNextClick}
                disabled={!isFormValid()}
                className={`w-full ${
                  isFormValid()
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#999999] cursor-not-allowed"
                } text-white py-4 rounded-lg mx-auto font-semibold transition-colors`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Pet Selection Modal */}
      {showPetModal && (
        <div
          className="fixed md:mx-auto md:max-w-3xl inset-0 bg-black/30 z-50 flex items-end"
          onClick={(e) =>
            handleModalBackdropClick(e, () => setShowPetModal(false))
          }
        >
          <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-hidden">
            <div className="p-8 max-h-[36rem] overflow-y-auto">
              {pets.map((pet) => {
                const isSelected =
                  petForms[currentFormIndex]?.selectedPet?.id === pet.id;
                return (
                  <div
                    key={pet.id}
                    onClick={() => handlePetSelection(pet)}
                    className={`
                      p-4 rounded mb-3 cursor-pointer transition-colors rect min-h-24
                      ${
                        isSelected
                          ? "border-primary bg-primary/10 border"
                          : "border-gray-200 border"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`
                          text-lg font-semibold
                          ${pet.id ? "text-[#3BB8AF]" : "text-[#6C6C70]"}
                        `}
                        >
                          {pet.name}
                        </span>
                        {pet.id && (
                          <span className="text-gray-600">• {pet.type}</span>
                        )}
                      </div>
                    </div>
                    {pet.id && (
                      <div className="text-sm text-gray-600">
                        {pet.gender}
                        {pet.is_neutered && "(Neutering)"} |{" "}
                        {formatAge(pet.birthday)}
                      </div>
                    )}
                  </div>
                );
              })}
              <div
                onClick={() =>
                  handlePetSelection({ id: null, name: "Unregistered Pet" })
                }
                className={`p-4 rounded mb-3 cursor-pointer border ${
                  petForms[currentFormIndex]?.selectedPet?.id === null
                    ? "border-primary bg-primary/10"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2 h-14">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg font-semibold text-[#6C6C70]">
                      Unregistered Pet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="flex bg-white min-h-screen">
          <div className="w-full">
            {/* Header */}
            <div className="bg-white fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10">
              <button onClick={() => setShowConfirmationModal(false)}>
                <svg
                  width="18"
                  height="17"
                  viewBox="0 0 18 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5 1.35355C7.69526 1.15829 8.01184 1.15829 8.20711 1.35355C8.40237 1.54882 8.40237 1.8654 8.20711 2.06066L1.91421 8.35355H16.7071C16.9832 8.35355 17.2071 8.57741 17.2071 8.85355C17.2071 9.1297 16.9833 9.35355 16.7071 9.35355H1.91421L8.20711 15.6464C8.40237 15.8417 8.40237 16.1583 8.20711 16.3536C8.01184 16.5488 7.69526 16.5488 7.5 16.3536L0.707107 9.56066C0.316582 9.17014 0.316583 8.53697 0.707107 8.14645L7.5 1.35355Z"
                    fill="#1B1B1C"
                    stroke="black"
                    strokeWidth="0.5"
                  />
                </svg>
              </button>
              <h1 className="text-[20px] font-medium text-[#1B1B1C]"></h1>
              <Link href={"/dashboard/booking/appointments"}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_12564_3123)">
                    <path
                      d="M19.2677 7.55739L12.9468 1.23572C12.1645 0.455713 11.1049 0.0177002 10.0002 0.0177002C8.89544 0.0177002 7.83579 0.455713 7.0535 1.23572L0.732663 7.55739C0.499684 7.78888 0.314971 8.0643 0.189231 8.36771C0.063492 8.67111 -0.000772746 8.99646 0.000162654 9.32489V17.5057C0.000162654 18.1688 0.263555 18.8046 0.732396 19.2735C1.20124 19.7423 1.83712 20.0057 2.50016 20.0057H17.5002C18.1632 20.0057 18.7991 19.7423 19.2679 19.2735C19.7368 18.8046 20.0002 18.1688 20.0002 17.5057V9.32489C20.0011 8.99646 19.9368 8.67111 19.8111 8.36771C19.6854 8.0643 19.5006 7.78888 19.2677 7.55739ZM12.5002 18.3391H7.50016V15.0607C7.50016 14.3977 7.76356 13.7618 8.2324 13.293C8.70124 12.8241 9.33712 12.5607 10.0002 12.5607C10.6632 12.5607 11.2991 12.8241 11.7679 13.293C12.2368 13.7618 12.5002 14.3977 12.5002 15.0607V18.3391ZM18.3335 17.5057C18.3335 17.7267 18.2457 17.9387 18.0894 18.095C17.9331 18.2513 17.7212 18.3391 17.5002 18.3391H14.1668V15.0607C14.1668 13.9557 13.7278 12.8958 12.9464 12.1144C12.165 11.333 11.1052 10.8941 10.0002 10.8941C8.89509 10.8941 7.83529 11.333 7.05389 12.1144C6.27248 12.8958 5.8335 13.9557 5.8335 15.0607V18.3391H2.50016C2.27915 18.3391 2.06719 18.2513 1.91091 18.095C1.75463 17.9387 1.66683 17.7267 1.66683 17.5057V9.32489C1.6676 9.10404 1.75532 8.89238 1.911 8.73572L8.23183 2.41656C8.70158 1.949 9.33738 1.68651 10.0002 1.68651C10.6629 1.68651 11.2987 1.949 11.7685 2.41656L18.0893 8.73822C18.2444 8.89426 18.3321 9.10491 18.3335 9.32489V17.5057Z"
                      fill="#222222"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_12564_3123">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
            </div>

            {/* Content */}
            <div className="p-6 pt-20 pb-32">
              <h2 className="text-2xl font-semibold mb-6 text-[#222222]">
                Please confirm appointment details below
              </h2>

              {/* Appointment Time */}
              <div className="rect p-4 mb-6 flex justify-between items-center">
                <div>
                  <div className="text-sm font-normal text-[#222222]">
                    {formatDate()} {timeSlot} {selectedTime}
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="text-[#222222] px-3 py-1 bg-[#E5E5EA] rounded text-sm"
                >
                  Edit
                </button>
              </div>

              {/* Member Information */}
              <div className="mb-6">
                <h3 className="font-medium text-lg text-[#222222] mb-3">
                  Member Information
                </h3>
                <div className="bg-primary/10 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#222222]">First Name</span>
                    <span className="text-sm text-[#0066C3] font-medium">
                      {memberInfo.firstName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#222222]">Last Name</span>
                    <span className="text-sm text-[#0066C3] font-medium">
                      {memberInfo.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#222222]">Phone Number</span>
                    <span className="text-sm text-[#0066C3] font-medium">
                      {memberInfo.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pet Reservations */}
              {petForms.map((form, index) => (
                <div key={index} className="mb-6">
                  <h3 className="font-medium text-lg text-[#222222] mb-3">
                    Pet reservation {index + 1}
                  </h3>
                  <div className="bg-primary/10 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pet Name</span>
                      <span className="text-sm text-[#0066C3] font-medium">
                        {form.selectedPet?.name || "Not selected"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Purpose of visit
                      </span>
                      <span className="text-sm text-[#0066C3] font-medium">
                        {form.purposeOfVisit || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Fixed Section */}
            <div className=" bg-white border-t border-[#E5E5EA] p-4 mx-4 z-10">
              <label className="flex items-start space-x-3 cursor-pointer mb-4">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                  />
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isChecked ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        isChecked ? "text-white" : "text-white"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-[#222222] font-normal">
                  I HAVE READ AND AGREE TO FOLLOW ZOOTOPIA'S CANCELLATION POLICY
                </span>
              </label>

              <p className="text-xs text-[#6C6C70] font-normal mb-4">
                When you book an appointment at ZAWC, we reserve that time
                specifically for your pet. Short-Notice Cancellations or
                Reschedules (Within 24 hours of the appointment) No-Show, your
                appointment will be automatically cancel.
              </p>

              <button
                onClick={handleConfirmAppointment}
                disabled={!isChecked || loading}
                className={`w-full ${
                  isChecked && !loading
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#999999]"
                } text-white py-4 rounded-lg font-semibold transition-colors relative`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Confirming...
                  </div>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={(e) =>
            handleModalBackdropClick(e, () => setShowSuccessModal(false))
          }
        >
          <div className="bg-white w-full max-w-md mx-4 rounded-lg overflow-hidden">
            <div className="p-12 text-center">
              <h2 className="text-[16px] font-medium mb-20 text-[#222222]">
                Reservation completed
              </h2>
              <button
                onClick={() => {
                  window.location.href = "/dashboard/booking/appointments";
                  setShowSuccessModal(false);
                }}
                className="text-[#0066C3] text-[16px] font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
