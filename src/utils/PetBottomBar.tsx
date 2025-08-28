import { Pet } from "@/redux/features/petSlice";
import { useAppSelector } from "@/redux/lib/hooks";
import React from "react";

interface PetBottomBarProps {
  selectedPet: Pet | null;
  onSelectPet: (pet: Pet) => void;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

const PetBottomBar: React.FC<PetBottomBarProps> = ({
  selectedPet,
  onSelectPet,
  showModal,
  setShowModal,
}) => {
  const { pets } = useAppSelector((state) => state.pet);
  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const handlePetSelection = (pet: Pet) => {
    onSelectPet(pet);
    setShowModal(false);
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
    <div>
      {/* Button to open modal */}
      <button
        onClick={() => setShowModal(true)}
        className={`w-full p-3 text-left rect-pet focus:ring-2 flex justify-between items-center ${
          selectedPet ? "text-[#1B1B1C] font-semibold" : ""
        } `}
      >
        <div className=" flex space-x-1 justify-center items-center">
          <img
            src={selectedPet?.image}
            alt=""
            className=" rounded-full w-5 h-5"
          />
          <span>{selectedPet ? `${selectedPet.name}` : "Select pet"}</span>
        </div>

        <span>
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
              d="M12 5.3335L8.06323 10.6668L4 5.3335L12 5.3335Z"
              fill="#1B1B1C"
            />
          </svg>
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed md:mx-auto md:max-w-3xl inset-0 bg-black/30 z-50 flex items-end"
          onClick={handleBackdropClick}
        >
          <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-hidden">
            <div className="p-8 max-h-[36rem] overflow-y-auto">
              {pets.map((pet) => {
                const isSelected = selectedPet?.id === pet.id;

                return (
                  <div
                    key={pet.id ?? "unregistered"}
                    onClick={() => handlePetSelection(pet)}
                    className={`p-4 rounded mb-3 cursor-pointer transition-colors min-h-24
                      ${
                        isSelected
                          ? "border-primary bg-primary/10 border"
                          : "border-gray-200 border"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-lg font-semibold ${
                            pet.id ? "text-[#3BB8AF]" : "text-[#6C6C70]"
                          }`}
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
                        {pet.is_neutered && " (Neutering)"} |{" "}
                        {formatAge(pet.birthday)} |{" "}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetBottomBar;
