"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronDown,
  Camera,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Calender from "@/utils/Calender";
import { useAppSelector, useAppDispatch } from "@/redux/lib/hooks";
import { Pet } from "@/redux/features/petSlice";
import { createVaccine } from "@/redux/features/vaccineslice";
import { unwrapResult } from "@reduxjs/toolkit";
import axiosClient from "@/utils/axiosClient"; // Assuming you have this utility

// Define the types for the fetched data
interface VaccineType {
  id: number;
  name: string;
  description: string;
}

interface VaccineName {
  id: number;
  name: string;
  description: string;
}

interface PhotoData {
  id: string;
  file: File;
  preview: string; // This will be the base64 string
}

const VaccineRegistration: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pets } = useAppSelector((state) => state.pet);
  const { loading, error } = useAppSelector((state) => state.vaccine);

  // State for API-fetched data
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
  const [vaccineNames, setVaccineNames] = useState<VaccineName[]>([]);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showNext, setShowNext] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>(pets[0]);
  const [vaccinationDate, setVaccinationDate] = useState<string>("");
  const [selectedVaccineType, setSelectedVaccineType] = useState<string>("");
  const [selectedVaccineName, setSelectedVaccineName] = useState<string>("");
  const [showVaccineTypeModal, setShowVaccineTypeModal] = useState(false);
  const [showVaccineNameModal, setShowVaccineNameModal] = useState(false);
  const [vaccineTypeSearchQuery, setVaccineTypeSearchQuery] = useState("");
  const [vaccineNameSearchQuery, setVaccineNameSearchQuery] = useState("");
  const [numberOfVaccinations, setNumberOfVaccinations] = useState<string>("");
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch vaccine types and names from the API on component mount
  useEffect(() => {
    const fetchDefinitions = async () => {
      setIsLoadingDefinitions(true);
      setFetchError(null);
      try {
        const [typesRes, namesRes] = await Promise.all([
          axiosClient.get("/vaccine-types"),
          axiosClient.get("/vaccine-names"),
        ]);
        setVaccineTypes(typesRes.data);
        setVaccineNames(namesRes.data);
      } catch (err) {
        console.error("Failed to fetch vaccine definitions:", err);
        setFetchError(
          "Could not load vaccine options. Please try again later."
        );
      } finally {
        setIsLoadingDefinitions(false);
      }
    };
    fetchDefinitions();
  }, []);

  const filteredVaccineTypes = useMemo(() => {
    if (!vaccineTypeSearchQuery.trim()) return vaccineTypes;
    return vaccineTypes.filter((type) =>
      type.name.toLowerCase().includes(vaccineTypeSearchQuery.toLowerCase())
    );
  }, [vaccineTypeSearchQuery, vaccineTypes]);

  const filteredVaccineNames = useMemo(() => {
    if (!vaccineNameSearchQuery.trim()) return vaccineNames;
    return vaccineNames.filter((name) =>
      name.name.toLowerCase().includes(vaccineNameSearchQuery.toLowerCase())
    );
  }, [vaccineNameSearchQuery, vaccineNames]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}-${year}`;
  };

  const formatDisplayDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    // Before (Incorrect): return `${month}.${date}.${year}`;
    // After (Correct):
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setVaccinationDate(formatDate(date));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhoto: PhotoData = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file: file,
            preview: event.target?.result as string,
          };
          setPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const selectVaccineType = (type: string) => {
    setSelectedVaccineType(type);
    setShowVaccineTypeModal(false);
  };

  const selectVaccineName = (name: string) => {
    setSelectedVaccineName(name);
    setShowVaccineNameModal(false);
  };

  const handleRegister = async () => {
    if (!isFormValid || !selectedPet) return;

    const vaccineData = {
      petId: Number(selectedPet.id),
      vaccineType: selectedVaccineType,
      vaccineName: selectedVaccineName,
      vaccinationDate: vaccinationDate,
      dueDate: vaccinationDate, // Assuming due date is same as vaccination date
      numberOfVaccinations: parseInt(numberOfVaccinations, 10),
      images: photos.map((p) => p.preview), // Send base64 strings
    };

    try {
      const resultAction = await dispatch(createVaccine(vaccineData));
      unwrapResult(resultAction); // This will throw an error if the thunk is rejected
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to create vaccine:", err);
      // Optionally, show an error toast or message here
    }
  };

  const isFormValid =
    selectedPet &&
    selectedVaccineType &&
    selectedVaccineName &&
    vaccinationDate &&
    numberOfVaccinations;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10 bg-white">
        <Link href={"/dashboard"}>
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[20px] font-medium text-[#1B1B1C]">
          Vaccine Registration
        </h1>
        <div className="w-6"></div>
      </div>

      {showNext ? (
        <div className="p-4 space-y-6 pt-20 pb-24">
          <h2 className="text-xl font-semibold text-[#1B1B1C]">
            Vaccine Registration
          </h2>
          {/* Pet Selection */}
          <div>
            <h3 className="text-sm font-semibold text-[#1B1B1C] mb-3">
              Whose Record Is This?
            </h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`flex shrink-0 items-center p-3 rounded-xl border-2 transition-colors w-52 ${
                    selectedPet?.id === pet?.id
                      ? "border-[#A1534E] bg-[#A1534E]/30"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <img
                    src={
                      pet.image ||
                      "https://placehold.co/100x100/E2E8F0/A0AEC0?text=Pet"
                    }
                    alt={pet.name}
                    className="w-12 h-12 object-cover rounded-full mr-3"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{pet.name}</p>
                    <p className="text-gray-500 text-sm">{pet.breed}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vaccine Type */}
          <div>
            <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
              Vaccine Type
            </label>
            <button
              onClick={() => setShowVaccineTypeModal(true)}
              className="w-full rect-pet px-4 py-3 text-[#1B1B1C] flex justify-between items-center text-left"
            >
              <span className={selectedVaccineType ? "" : "text-gray-400"}>
                {selectedVaccineType || "Please select vaccine type"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Vaccine Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
              Vaccine Name
            </label>
            <button
              onClick={() => setShowVaccineNameModal(true)}
              className="w-full rect-pet px-4 py-3 text-[#1B1B1C] flex justify-between items-center text-left"
            >
              <span className={selectedVaccineName ? "" : "text-gray-400"}>
                {selectedVaccineName || "Please select vaccine name"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Vaccine Date */}
          <div>
            <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
              Vaccine Date
            </label>
            <button
              onClick={() => setShowNext(false)}
              className="w-full rect-pet px-4 py-3 text-[#1B1B1C] flex justify-between items-center text-left"
            >
              <span className={selectedDate ? "" : "text-gray-400"}>
                {selectedDate
                  ? formatDisplayDate(selectedDate)
                  : "Please select vaccine date"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Number of Vaccinations */}
          <div>
            <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
              Number Of Vaccinations
            </label>
            <input
              min={1}
              type="number"
              value={numberOfVaccinations}
              onChange={(e) => setNumberOfVaccinations(e.target.value)}
              placeholder="Please Enter Number Of Vaccinations"
              className="w-full rect-pet px-4 py-3 text-[#1B1B1C]"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
              Photos
            </label>
            <div className="flex gap-5 flex-wrap">
              {photos.map((photo) => (
                <div key={photo.id} className="relative w-20 h-20">
                  <img
                    src={photo.preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-16">
          <Calender onDateSelect={handleDateSelect} />
        </div>
      )}

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-50 sm:max-w-3xl mx-auto">
        {showNext ? (
          <button
            onClick={handleRegister}
            disabled={!isFormValid || loading}
            className="w-full bg-primary text-white py-4 rounded-lg font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              "Register"
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowNext(true)}
            disabled={!selectedDate}
            className="w-full bg-primary text-white py-4 rounded-lg font-medium text-lg disabled:bg-gray-400"
          >
            Next
          </button>
        )}
      </div>

      {/* Vaccine Type Modal */}
      {showVaccineTypeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Select Vaccine Type</h3>
            <div className="overflow-y-auto">
              {isLoadingDefinitions ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : fetchError ? (
                <p className="text-red-500 text-center">{fetchError}</p>
              ) : (
                filteredVaccineTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => selectVaccineType(type.name)}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
                  >
                    {type.name}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowVaccineTypeModal(false)}
              className="mt-4 bg-gray-200 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Vaccine Name Modal */}
      {showVaccineNameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Select Vaccine Name</h3>
            <div className="overflow-y-auto">
              {isLoadingDefinitions ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : fetchError ? (
                <p className="text-red-500 text-center">{fetchError}</p>
              ) : (
                filteredVaccineNames.map((name) => (
                  <button
                    key={name.id}
                    onClick={() => selectVaccineName(name.name)}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
                  >
                    {name.name}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowVaccineNameModal(false)}
              className="mt-4 bg-gray-200 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center max-w-sm mx-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              The vaccine record has been registered successfully.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineRegistration;
