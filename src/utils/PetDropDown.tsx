import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/lib/hooks";
import { Pet } from "@/redux/features/petSlice";

// Define a type for the "All" pet object, which won't have all Pet properties
type DisplayPet = Omit<Pet, "id"> & { id: number | string; imageUrl?: string };

interface PetDropDownProps {
  selectedPet: DisplayPet;
  setSelectedPet: React.Dispatch<React.SetStateAction<DisplayPet>>;
}

export default function PetDropDown({
  selectedPet,
  setSelectedPet,
}: PetDropDownProps) {
  // 1. Get pets from the Redux store
  const { pets: petsFromStore } = useAppSelector((state) => state.pet);

  // 2. Create the "All" pet object and combine with store pets
  const allPetOption: DisplayPet = {
    id: "all",
    name: "All",
    type: null,
  };
  const dropdownPets: DisplayPet[] = [
    allPetOption,
    ...petsFromStore.map((p) => ({ ...p, imageUrl: p.image })),
  ];

  // Local state only for dropdown open/close
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownOpen &&
        event.target instanceof HTMLElement &&
        !event.target.closest(".pet-dropdown")
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const selectPet = (pet: DisplayPet) => {
    setSelectedPet(pet);
    setDropdownOpen(false);
  };

  // Helper component to render pet images (single or multiple)
  const PetImageDisplay = ({
    pet,
    size = "w-8 h-8",
  }: {
    pet: DisplayPet;
    size?: string;
  }) => {
    if (pet.id === "all") {
      return (
        <div className={`flex items-center -space-x-3 ${size}`}>
          {petsFromStore.slice(0, 2).map((p, index) => (
            <img
              key={p.id}
              src={
                p.image ||
                `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${p.name.charAt(
                  0
                )}`
              }
              alt={p.name}
              className={`w-full h-full rounded-full object-cover border-2 border-white`}
              style={{ zIndex: petsFromStore.length - index }}
            />
          ))}
        </div>
      );
    }
    return (
      <img
        src={
          pet.imageUrl ||
          `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${pet.name.charAt(
            0
          )}`
        }
        alt={pet.name}
        className={`${size} rounded-full object-cover`}
      />
    );
  };

  return (
    <div className="px-4 py-2 pet-dropdown">
      <div className="relative">
        <div
          className="w-full flex justify-between rect-pet items-center cursor-pointer p-2"
          onClick={toggleDropdown}
        >
          <div className="flex space-x-4 items-center">
            <PetImageDisplay pet={selectedPet} size="w-6 h-6" />
            <span className="font-medium">{selectedPet.name}</span>
          </div>

          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 5.3335L8.06323 10.6668L4 5.3335L12 5.3335Z"
              fill="#1B1B1C"
            />
          </svg>
        </div>

        {dropdownOpen && (
          <div className="absolute z-[50] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {dropdownPets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectPet(pet)}
              >
                <div className="mr-5">
                  <PetImageDisplay pet={pet} />
                </div>
                <div>
                  <div className="font-medium">{pet.name}</div>
                  {pet.type && (
                    <div className="text-sm text-gray-500">{pet.type}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
