"use client";
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, X, CheckCircle, Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/lib/hooks";
import PetBottomBar from "@/utils/PetBottomBar";
import { useRouter, useParams } from "next/navigation";
import { Pet } from "@/redux/features/petSlice";
import {
  updateMedicalRecord,
  MedicalRecord,
} from "@/redux/features/medicalSlice";
import { unwrapResult } from "@reduxjs/toolkit";

type PhotoObject = {
  imageData: string;
  uploadedBy: "user" | "hospital";
};

const MedicalHistoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const { pets } = useAppSelector((state) => state.pet);
  const { records, loading, error } = useAppSelector((state) => state.medical);

  const recordId = params.id ? parseInt(params.id as string, 10) : null;
  const record = records.find((r) => r.id === recordId);

  // State to toggle between view and edit modes
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State for form data
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();
  const [userDetails, setUserDetails] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState("");
  const [photos, setPhotos] = useState<PhotoObject[]>([]);
  const [activeTab, setActiveTab] = useState<"User" | "Hospital">("User");

  // Populate state when the record is found
  useEffect(() => {
    if (record) {
      const petForRecord = pets.find((p) => p.id === record.petId);
      setSelectedPet(petForRecord);
      setUserDetails(record.userDetails || "");
      setHospitalDetails(record.hospitalDetails || "");
      setPhotos(record.photos || []);
    }
  }, [record, pets]);

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    if (!record || !selectedPet) return;

    const updatedData: MedicalRecord = {
      ...record,
      petId: Number(selectedPet.id),
      userDetails: userDetails,
      hospitalDetails: hospitalDetails, // Assuming hospital details might be edited elsewhere
      photos: photos,
    };

    try {
      const resultAction = await dispatch(updateMedicalRecord(updatedData));
      unwrapResult(resultAction);
      setIsEditing(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to save medical record:", err);
      alert("Failed to save. Please try again.");
    }
  };

  // Handler to remove a photo
  const handleRemovePhoto = (photoToRemove: PhotoObject) => {
    setPhotos(
      photos.filter((photo) => photo.imageData !== photoToRemove.imageData)
    );
  };

  // Handler to trigger file input
  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Handler for when a new file is selected
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: PhotoObject = {
          imageData: reader.result as string,
          uploadedBy: "user", // Assume new uploads are from the user
        };
        setPhotos([newPhoto, ...photos]);
      };
      reader.readAsDataURL(file);
    }
  };

  const userPhotos = photos.filter((p) => p.uploadedBy === "user");
  const hospitalPhotos = photos.filter((p) => p.uploadedBy === "hospital");

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Medical History</h1>
        {isEditing || activeTab == "Hospital" ? (
          <div className="w-12"></div> // Placeholder for spacing
        ) : (
          <button
            onClick={handleEditClick}
            className="text-lg font-medium text-cyan-500"
          >
            Edit
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 space-y-6">
        {/* Pet Selector / Display */}
        {isEditing ? (
          <div className="px-4">
            <PetBottomBar
              onSelectPet={(pet) => setSelectedPet(pet)}
              selectedPet={selectedPet}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3 px-4 py-3 shadow-sm">
            {selectedPet && (
              <img
                src={selectedPet.image}
                alt={selectedPet.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedPet?.name}
              </h2>
              <p className="text-gray-500">{selectedPet?.breed}</p>
            </div>
          </div>
        )}

        {/* User / Hospital Toggle */}
        {!isEditing && (
          <div className="px-4">
            <div className="flex bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab("User")}
                className={`w-1/2 py-2 text-center rounded-full text-sm font-medium transition-colors ${
                  activeTab === "User"
                    ? "bg-white shadow-sm text-gray-800"
                    : "bg-transparent text-gray-500"
                }`}
              >
                User
              </button>
              <button
                onClick={() => setActiveTab("Hospital")}
                className={`w-1/2 py-2 text-center rounded-full text-sm font-medium transition-colors ${
                  activeTab === "Hospital"
                    ? "bg-white shadow-sm text-gray-800"
                    : "bg-transparent text-gray-500"
                }`}
              >
                Hospital
              </button>
            </div>
          </div>
        )}

        {/* Details Section */}
        <div className="px-4">
          <h3 className="font-bold text-gray-800 mb-2">Detail</h3>
          <div className="p-4 border border-gray-200 rounded-lg min-h-[100px]">
            {isEditing ? (
              <textarea
                value={activeTab === "User" ? userDetails : hospitalDetails}
                onChange={(e) =>
                  activeTab === "User"
                    ? setUserDetails(e.target.value)
                    : setHospitalDetails(e.target.value)
                }
                className="w-full h-32 text-gray-700 bg-transparent focus:outline-none resize-none"
                placeholder={
                  activeTab === "User"
                    ? "Enter user details..."
                    : "Enter hospital details..."
                }
              />
            ) : (
              <p className="text-gray-700">
                {activeTab === "User"
                  ? userDetails || "No user details provided."
                  : hospitalDetails || "No hospital details provided."}
              </p>
            )}
          </div>
        </div>

        {/* Photo Section */}
        <div className="px-4">
          <h3 className="font-bold text-gray-800 mb-2">Photo</h3>
          <div className="grid grid-cols-3 gap-3">
            {isEditing && activeTab === "User" && (
              <>
                <button
                  onClick={handleAddPhotoClick}
                  className="flex items-center justify-center w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-lg"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
              </>
            )}
            {(activeTab === "User" ? userPhotos : hospitalPhotos).map(
              (photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.imageData}
                    alt={`Medical photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  {isEditing && activeTab === "User" && (
                    <button
                      onClick={() => handleRemovePhoto(photo)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-0.5"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Save Button */}
      {isEditing && (
        <footer className="p-4 border-t border-gray-100">
          <button
            onClick={handleSaveClick}
            disabled={loading}
            className="w-full bg-cyan-500 text-white font-semibold py-4 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save"}
          </button>
        </footer>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center flex flex-col items-center max-w-sm mx-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Saved!</h2>
            <p className="text-gray-600 mb-6">
              Your changes have been saved successfully.
            </p>
            <button
              onClick={() => router.push("/dashboard/booking/medical-history")}
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

export default MedicalHistoryPage;
