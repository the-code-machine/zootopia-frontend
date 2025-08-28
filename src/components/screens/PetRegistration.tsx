"use client";
import React, {
  useState,
  useRef,
  useMemo,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
} from "react";
import { ArrowLeft, Search, Plus, X, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/utils/Header";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { registerPet } from "@/redux/features/petSlice";
import toast from "react-hot-toast";
import axiosClient from "@/utils/axiosClient";

// #region Interface Definitions
interface Errors {
  petName?: string;
  breed?: string;
  birthday?: string;
}

interface Breed {
  id: number;
  name: string;
  type: "Dog" | "Cat";
}
// #endregion

const PetRegistrationPage: React.FC = () => {
  const { loading } = useAppSelector((state) => state.pet);
  const dispatch = useAppDispatch();
  const [petType, setPetType] = useState<"Dog" | "Cat">("Dog");
  const [petName, setPetName] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [is_neutered, setis_neutered] = useState<boolean>(false);
  const [breed, setBreed] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [petImage, setPetImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState<boolean>(false);
  const [showBreedModal, setShowBreedModal] = useState<boolean>(false);
  const [breedSearchQuery, setBreedSearchQuery] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for API-fetched breeds
  const [allBreeds, setAllBreeds] = useState<Breed[]>([]);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(true);

  // Fetch breeds from the API on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      setIsLoadingBreeds(true);
      try {
        const response = await axiosClient.get("/admin/breeds");
        setAllBreeds(response.data.data);
      } catch (error) {
        console.error("Failed to fetch breeds:", error);
        toast.error("Could not load breeds.");
      } finally {
        setIsLoadingBreeds(false);
      }
    };
    fetchBreeds();
  }, []);

  // Filter breeds based on selected pet type and search query
  const filteredBreeds = useMemo(() => {
    const currentBreeds = allBreeds.filter((b) => b.type === petType);
    if (!breedSearchQuery.trim()) return currentBreeds;
    return currentBreeds.filter((b) =>
      b.name.toLowerCase().includes(breedSearchQuery.toLowerCase())
    );
  }, [breedSearchQuery, allBreeds, petType]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!petName.trim()) newErrors.petName = "Pet name is required";
    if (!petImage) {
      toast.error("Please add an image!");
      return false;
    }
    if (!breed.trim()) newErrors.breed = "Breed selection is required";
    if (!birthday.trim()) newErrors.birthday = "Birthday is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = (): boolean => {
    return Boolean(
      petName.trim() && breed.trim() && birthday.trim() && petImage
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const petData = {
      type: petType,
      name: petName,
      gender,
      is_neutered: is_neutered,
      breed,
      birthday,
      image: petImage,
    };

    const result = await dispatch(registerPet(petData));

    if (registerPet.fulfilled.match(result)) {
      setShowSuccessPopup(true);
    } else {
      toast.error((result.payload as string) || "Registration failed.");
    }
  };

  const closeSuccessPopup = () => {
    window.location.href = "/dashboard";
    setShowSuccessPopup(false);
  };

  const handleImageClick = () => setShowImageOptions(true);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setPetImage(event.target.result);
          setShowImageOptions(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeImage = () => {
    setPetImage(null);
    setShowImageOptions(false);
  };

  const handleBreedClick = () => {
    setShowBreedModal(true);
    setBreedSearchQuery("");
  };

  const selectBreed = (selectedBreed: string) => {
    setBreed(selectedBreed);
    setShowBreedModal(false);
    setBreedSearchQuery("");
    if (errors.breed) setErrors((prev) => ({ ...prev, breed: "" }));
  };

  const handleInputChange = (field: keyof Errors, value: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "petName") setPetName(value);
    else if (field === "birthday") setBirthday(value);
  };

  const formatBirthdayInput = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += "-" + digits.slice(2, 4);
    if (digits.length > 4) formatted += "-" + digits.slice(4, 8);
    return formatted;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header title="Register Pet" />

      {/* Form content */}
      <div className="px-4 py-6 pt-20">
        <form onSubmit={handleSubmit}>
          {/* Pet image section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="h-40 w-40 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleImageClick}
              >
                {petImage ? (
                  <img
                    src={petImage}
                    alt="Selected pet"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src="/pet-res.png"
                    alt="Dog and cat illustration"
                    className="h-full w-full"
                  />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-100"
                onClick={handleImageClick}
              >
                <Plus className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Pet type */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2">
              <button
                type="button"
                className={`py-4 px-4 border rounded-l-lg text-lg ${
                  petType === "Dog"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300"
                }`}
                onClick={() => {
                  setPetType("Dog");
                  setBreed("");
                }}
              >
                Dog
              </button>
              <button
                type="button"
                className={`py-4 px-4 border rounded-r-lg text-lg ${
                  petType === "Cat"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300"
                }`}
                onClick={() => {
                  setPetType("Cat");
                  setBreed("");
                }}
              >
                Cat
              </button>
            </div>
          </div>

          {/* Pet name */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Please Enter 8 Characters Or Less"
              className={`w-full p-3 border rounded-lg ${
                errors.petName ? "border-red-500" : "border-gray-300"
              }`}
              value={petName}
              onChange={(e) => handleInputChange("petName", e.target.value)}
            />
            {errors.petName && (
              <p className="text-red-500 text-sm mt-1">{errors.petName}</p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2">
              <button
                type="button"
                className={`py-4 px-4 border rounded-l-lg text-lg ${
                  gender === "Male"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300"
                }`}
                onClick={() => setGender("Male")}
              >
                Male
              </button>
              <button
                type="button"
                className={`py-4 px-4 border rounded-r-lg text-lg ${
                  gender === "Female"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300"
                }`}
                onClick={() => setGender("Female")}
              >
                Female
              </button>
            </div>
          </div>

          {/* Neutered checkbox */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="neutered"
              checked={is_neutered}
              onChange={() => setis_neutered(!is_neutered)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="neutered" className="ml-2 text-sm">
              Neutered Or Not
            </label>
          </div>

          {/* Breed */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Breed <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select a breed"
                className={`w-full p-3 border rounded-lg cursor-pointer ${
                  errors.breed ? "border-red-500" : "border-gray-300"
                }`}
                value={breed}
                onClick={handleBreedClick}
                readOnly
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            {errors.breed && (
              <p className="text-red-500 text-sm mt-1">{errors.breed}</p>
            )}
          </div>

          {/* Birthday */}
          <div className="mb-8">
            <label className="block text-sm mb-2">
              Birthday <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="MM-DD-YYYY"
              className={`w-full p-3 border rounded-lg ${
                errors.birthday ? "border-red-500" : "border-gray-300"
              }`}
              value={birthday}
              onChange={(e) => {
                const formatted = formatBirthdayInput(e.target.value);
                handleInputChange("birthday", formatted);
              }}
              maxLength={10}
            />
            {errors.birthday && (
              <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="mt-8">
            <button
              type="submit"
              className={`w-full py-4 rounded-lg text-lg font-medium shadow-md ${
                isFormComplete()
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
              disabled={!isFormComplete() || loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Register Pet"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Breed Selection Modal */}
      {showBreedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Choosing a pet breed</h3>
              <button onClick={() => setShowBreedModal(false)}>
                <X />
              </button>
            </div>
            <div className="p-4 relative">
              <svg
                className="absolute left-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.2745 13.2743C13.4911 13.0577 13.4911 12.7065 13.2745 12.4898L10.1925 9.40782C11.0949 8.30407 11.5386 6.89567 11.4318 5.47393C11.325 4.0522 10.6758 2.72592 9.61854 1.76941C8.56127 0.812901 7.1768 0.299353 5.75151 0.33499C4.32621 0.370627 2.96914 0.952721 1.96099 1.96087C0.952843 2.96902 0.370749 4.32609 0.335112 5.75139C0.299475 7.17668 0.813023 8.56115 1.76953 9.61842C2.72604 10.6757 4.05232 11.3249 5.47406 11.4317C6.89579 11.5385 8.30419 11.0948 9.40794 10.1923L12.4899 13.2743C12.7066 13.491 13.0578 13.491 13.2745 13.2743ZM5.89929 10.3377C5.02143 10.3377 4.16329 10.0774 3.43338 9.58967C2.70346 9.10195 2.13457 8.40875 1.79863 7.59772C1.46268 6.78668 1.37479 5.89424 1.54605 5.03325C1.71731 4.17226 2.14004 3.38139 2.76078 2.76066C3.38152 2.13992 4.17239 1.71719 5.03338 1.54593C5.89436 1.37467 6.7868 1.46256 7.59784 1.7985C8.40887 2.13445 9.10208 2.70334 9.58979 3.43325C10.0775 4.16317 10.3378 5.02131 10.3378 5.89917C10.3365 7.07593 9.86844 8.20412 9.03634 9.03622C8.20424 9.86832 7.07605 10.3364 5.89929 10.3377Z"
                  fill="#8E8E93"
                />
              </svg>

              <input
                type="text"
                placeholder="Search Here"
                className="w-full pl-10 pr-4 py-4 bg-gray-100 rounded-lg border-none outline-none text-gray-700"
                value={breedSearchQuery}
                onChange={(e) => setBreedSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {isLoadingBreeds ? (
                <Loader2 className="animate-spin mx-auto mt-8" />
              ) : filteredBreeds.length > 0 ? (
                <div className="space-y-2">
                  {filteredBreeds.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => selectBreed(b.name)}
                      className="w-full text-left py-3 px-2 hover:bg-gray-100 rounded-lg"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No breeds found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Selection Modal */}
      {showImageOptions && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
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

              {petImage && (
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-end">
              <button onClick={closeSuccessPopup}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-white"
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
              <h3 className="text-xl font-medium mb-2">
                Registration Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Your pet has been successfully registered.
              </p>
              <button
                onClick={closeSuccessPopup}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium"
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

export default PetRegistrationPage;
