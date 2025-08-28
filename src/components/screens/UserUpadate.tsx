"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  Camera,
  Mail,
  Phone,
  User,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserEmail,
  updateUserPhone,
  UserProfile,
} from "@/redux/features/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import axiosClient from "@/utils/axiosClient";
import Header from "@/utils/Header";

const UserProfileUpdatePage = () => {
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state) => state.user.profile);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef<any>(null);

  // Initialize form with user data when available
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setEmail(userProfile.email || "");
      setPhone(userProfile.phone || "");
      setState(userProfile.state || "");
    }
  }, [userProfile]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Update redux store
    if (email !== userProfile?.email) {
      dispatch(updateUserEmail(email));
    }

    if (phone !== userProfile?.phone) {
      dispatch(updateUserPhone(phone));
    }

    // Here you would normally handle API calls for other fields
    const payload = {
      firstName,
      lastName,
      email,
      phone,
      state,
    };
    const res = await axiosClient.put("/auth/profile", payload);
    if (res.data) {
      // Show success popup
      setShowSuccessPopup(true);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handleImageClick = () => {
    setShowImageOptions(true);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setProfileImage(e.target.result);
        setShowImageOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setProfileImage(null);
    setShowImageOptions(false);
  };

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  return (
    <div className="min-h-screen  pb-20">
      {/* Header */}
      <Header title="User Profile" />

      {/* Form content */}
      <div className="px-4 py-6 pt-20">
        <form onSubmit={handleSubmit}>
          {/* Profile image section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="h-40 w-40 rounded-full bg-[#F2FFFF] flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleImageClick}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-24 w-24 text-[#46D3E0]" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200"
                onClick={handleImageClick}
              >
                <Plus className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* First Name */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your first name"
              className="w-full px-4 py-4  rect"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your last name"
              className="w-full px-4 py-4 rect"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-4 rect pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-4 py-4 rect pl-12"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* State Selection */}
          <div className="mb-8">
            <label className="block text-lg font-medium mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-4 rect pl-12 appearance-none bg-white"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select your state
                </option>
                {states.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full  bg-primary text-white py-4 rounded-lg text-lg font-medium shadow-md"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Image Selection Modal */}
      {showImageOptions && (
        <div className="fixed inset-0   bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Select Profile Image</h3>
              <button onClick={() => setShowImageOptions(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={triggerFileInput}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-200 rounded-lg"
              >
                <Camera className="h-5 w-5 text-[#46D3E0]" />
                <span>Upload from device</span>
              </button>

              {profileImage && (
                <button
                  onClick={removeImage}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-200 rounded-lg text-red-500"
                >
                  <X className="h-5 w-5" />
                  <span>Remove current image</span>
                </button>
              )}

              <button
                onClick={() => setShowImageOptions(false)}
                className="w-full py-3 px-4 bg-gray-100 rounded-lg text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-end">
              <button onClick={closeSuccessPopup}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-[#46D3E0] bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-[#ffff]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Profile Updated!</h3>
              <p className="text-gray-600 mb-4">
                Your profile information has been successfully updated.
              </p>
              <button
                onClick={closeSuccessPopup}
                className="w-full  bg-primary text-white py-3 rounded-lg font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileUpdatePage;
