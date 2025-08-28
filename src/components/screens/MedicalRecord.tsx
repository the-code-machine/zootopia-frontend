"use client";
import React, { useState } from "react";
import { ChevronLeft, Camera, X, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Calender from "@/utils/Calender";
import PetBottomBar from "@/utils/PetBottomBar";
import { Pet } from "@/redux/features/petSlice";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { createMedicalRecord } from "@/redux/features/medicalSlice";
import { unwrapResult } from "@reduxjs/toolkit";

interface PhotoData {
  id: string;
  file: File;
  preview: string; // This is the base64 string
}

const MedicalRecord = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.medical);

  const [showNext, setShowNext] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();
  const [detail, setDetail] = useState("");
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const formatDate = (date: string | number | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(formatDate(date));
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

  const handleRegister = async () => {
    if (!selectedDate || !selectedPet || !detail.trim()) return;

    const medicalData = {
      petId: Number(selectedPet.id),
      title: "Vist History", // A default title as UI doesn't have it
      date: selectedDate,
      userDetails: detail,
      photos: photos.map((p) => ({
        imageData: p.preview,
        uploadedBy: "user" as const,
      })),
    };

    try {
      const resultAction = await dispatch(createMedicalRecord(medicalData));
      unwrapResult(resultAction);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to register medical record:", err);
      alert("Error registering medical record. Please try again.");
    }
  };

  const isFormValid = selectedDate && selectedPet && detail.trim();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between border-[#E7E7E7] border z-10 bg-white">
        <Link href={"/dashboard"}>
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[20px] font-medium text-[#1B1B1C]">
          Medical History
        </h1>
        <div className="w-6"></div>
      </div>

      {showNext ? (
        <>
          <div className="px-4 py-6 space-y-4 pt-20 pb-24">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6831 10.0571L9.14154 13.5987L7.31689 11.774C7.07275 11.5299 6.67725 11.5299 6.43311 11.774C6.18896 12.0182 6.18896 12.4137 6.43311 12.6578L8.69965 14.9244C8.82172 15.0464 8.98163 15.1075 9.14154 15.1075C9.30145 15.1075 9.46136 15.0464 9.58344 14.9244L13.5669 10.9409C13.811 10.6968 13.811 10.3013 13.5669 10.0571C13.3228 9.81299 12.9272 9.81299 12.6831 10.0571Z"
                    fill="#8E8E93"
                  />
                  <path
                    d="M15.625 2.47498H14.6875V1.875C14.6875 1.52985 14.4077 1.25 14.0625 1.25C13.7173 1.25 13.4375 1.52985 13.4375 1.875V2.47498H6.5625V1.875C6.5625 1.52985 6.28265 1.25 5.9375 1.25C5.59235 1.25 5.3125 1.52985 5.3125 1.875V2.47498H4.375C2.65198 2.47498 1.25 3.87695 1.25 5.59998V15.625C1.25 17.348 2.65198 18.75 4.375 18.75H15.625C17.348 18.75 18.75 17.348 18.75 15.625V5.59998C18.75 3.87695 17.348 2.47498 15.625 2.47498ZM2.5 5.59998C2.5 4.56604 3.34106 3.72498 4.375 3.72498H5.3125V4.32465C5.3125 4.6698 5.59235 4.94965 5.9375 4.94965C6.28265 4.94965 6.5625 4.6698 6.5625 4.32465V3.72498H13.4375V4.32465C13.4375 4.6698 13.7173 4.94965 14.0625 4.94965C14.4077 4.94965 14.6875 4.6698 14.6875 4.32465V3.72498H15.625C16.6589 3.72498 17.5 4.56604 17.5 5.59998V6.23108H2.5V5.59998ZM15.625 17.5H4.375C3.34106 17.5 2.5 16.6589 2.5 15.625V7.48108H17.5V15.625C17.5 16.6589 16.6589 17.5 15.625 17.5Z"
                    fill="#8E8E93"
                  />
                </svg>
                <button className="text-[16px] font-semibold">
                  {selectedDate
                    ? formatDisplayDate(selectedDate)
                    : "Select Date"}
                </button>
              </div>
            </div>
            <PetBottomBar
              selectedPet={selectedPet}
              onSelectPet={(pet) => setSelectedPet(pet)}
              showModal={showPetPicker}
              setShowModal={setShowPetPicker}
            />
            <div className="space-y-2">
              <label className="text-gray-900 font-medium">Detail</label>
              <textarea
                value={detail}
                rows={8}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Please Enter The Detail"
                className="w-full h-40 px-4 py-3 rect-pet focus:outline-none mt-2 resize-none"
              />
            </div>
            <div>
              <label className="text-gray-900 font-medium">Photos</label>
              <div className="flex gap-5 flex-wrap mt-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative w-20 h-20">
                    <img
                      src={photo.preview}
                      alt="Uploaded"
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
                <label className="cursor-pointer w-20 h-20 rect-pet flex items-center justify-center border-2 border-dashed border-gray-300">
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
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-50 sm:max-w-3xl mx-auto">
            <button
              onClick={handleRegister}
              disabled={!isFormValid || loading}
              className="w-full bg-primary text-white py-4 rounded-lg font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="pt-16">
            <Calender onDateSelect={handleDateSelect} />
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-50 sm:max-w-3xl mx-auto">
            <button
              onClick={() => setShowNext(true)}
              disabled={!selectedDate}
              className="w-full bg-primary text-white py-4 rounded-lg font-medium text-lg disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center max-w-sm mx-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              The medical record has been registered successfully.
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

export default MedicalRecord;
