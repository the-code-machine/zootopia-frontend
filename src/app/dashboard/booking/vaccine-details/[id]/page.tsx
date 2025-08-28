"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Camera, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Calender from "@/utils/Calender";
import { useAppSelector } from "@/redux/lib/hooks";
import { Pet } from "@/redux/features/petSlice";

// This is a view-only page, so we don't need the file object for photos
interface PhotoData {
  preview: string;
}

const VaccineDetails: React.FC = () => {
  const router = useRouter();
  const params = useParams();

  // Fetch data from Redux store
  const { pets } = useAppSelector((state) => state.pet);
  const { vaccines, loading: vaccinesLoading } = useAppSelector(
    (state) => state.vaccine
  );

  const vaccineId = params.id ? parseInt(params.id as string, 10) : null;

  // Find the specific vaccine record and its pet
  const vaccineRecord = useMemo(
    () => vaccines.find((v) => v.id === vaccineId),
    [vaccines, vaccineId]
  );
  const pet = useMemo(
    () => pets.find((p) => p.id === vaccineRecord?.petId),
    [pets, vaccineRecord]
  );

  // State to hold the details for display
  const [showNext, setShowNext] = useState(true); // Always show the details form
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();
  const [vaccinationDate, setVaccinationDate] = useState<string>("");
  const [selectedVaccineType, setSelectedVaccineType] = useState<string>("");
  const [selectedVaccineName, setSelectedVaccineName] = useState<string>("");
  const [numberOfVaccinations, setNumberOfVaccinations] = useState<string>("");
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // Populate state once the vaccine record is found
  useEffect(() => {
    if (vaccineRecord && pet) {
      const date = new Date(vaccineRecord.vaccinationDate);
      setSelectedDate(date);
      setVaccinationDate(formatDate(date));
      setSelectedPet(pet);
      setSelectedVaccineType(vaccineRecord.vaccineType);
      setSelectedVaccineName(vaccineRecord.vaccineName);
      setNumberOfVaccinations(String(vaccineRecord.numberOfVaccinations));
      setPhotos(vaccineRecord.images?.map((img) => ({ preview: img })) || []);
    }
  }, [vaccineRecord, pet]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // Loading and error handling
  if (vaccinesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!vaccineRecord || !pet) {
    return (
      <div className="p-4 pt-20 text-center text-gray-500">
        Vaccine record not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10 bg-white">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[20px] font-medium text-[#1B1B1C]">
          Vaccine Details
        </h1>
        <div className="w-6"></div>
      </div>

      {/* Details Form (View-Only) */}
      <div className="p-4 space-y-6 pt-20 pb-24">
        <h2 className="text-xl font-semibold text-[#1B1B1C]">
          Vaccine Details
        </h2>

        {/* Pet Display */}
        <div>
          <h3 className="text-sm font-semibold text-[#1B1B1C] mb-3">
            Whose record is this?
          </h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <div className="flex shrink-0 items-center p-3 rounded-xl border-2 border-cyan-400 bg-cyan-50 w-52">
              <img
                src={
                  selectedPet?.image ||
                  "https://placehold.co/100x100/E2E8F0/A0AEC0?text=Pet"
                }
                alt={selectedPet?.name}
                className="w-12 h-12 object-cover rounded-full mr-3"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  {selectedPet?.name}
                </p>
                <p className="text-gray-500 text-sm">{selectedPet?.breed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vaccine Type */}
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
            Vaccine Type
          </label>
          <div className="w-full rect-pet px-4 py-3 text-gray-700 bg-gray-100">
            {selectedVaccineType}
          </div>
        </div>

        {/* Vaccine Name */}
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
            Vaccine Name
          </label>
          <div className="w-full rect-pet px-4 py-3 text-gray-700 bg-gray-100">
            {selectedVaccineName}
          </div>
        </div>

        {/* Vaccine Date */}
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
            Vaccine Date
          </label>
          <div className="w-full rect-pet px-4 py-3 text-gray-700 bg-gray-100">
            {selectedDate ? formatDisplayDate(selectedDate) : ""}
          </div>
        </div>

        {/* Number of Vaccinations */}
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
            Number Of Vaccinations
          </label>
          <div className="w-full rect-pet px-4 py-3 text-gray-700 bg-gray-100">
            {numberOfVaccinations}
          </div>
        </div>

        {/* Photo Display */}
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1C] mb-2">
            Photos
          </label>
          <div className="flex gap-5 flex-wrap">
            {photos.length > 0 ? (
              photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={photo.preview}
                    alt={`Vaccine photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No photos were uploaded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 sm:max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="w-full bg-primary text-white py-4 rounded-lg font-medium text-lg"
        >
          Back to List
        </button>
      </div>
    </div>
  );
};

export default VaccineDetails;
