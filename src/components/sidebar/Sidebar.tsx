"use client";
import React, { useState } from "react";
import { Home, Calendar, FileText, User, Heart } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "booking", label: "Booking", icon: Calendar, href: "/booking" },
  { id: "blog", label: "Blog", icon: FileText, href: "/blog" },
  { id: "my", label: "My", icon: User, href: "/my" },
];

interface NavigationProps {
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
}

export default function Navigation({
  activeItem = "home",
  onItemClick,
}: NavigationProps) {
  const [currentActive, setCurrentActive] = useState(activeItem);

  const handleItemClick = (item: NavItem) => {
    setCurrentActive(item.id);
    onItemClick?.(item);
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:flex-col lg:z-50 bg-white shadow-lg">
        {/* Logo/Header */}
        <div className="p-6  shadow">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Heart size={32} className="text-red-500" />
            Vet Dashboard
          </h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentActive === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left cursor-pointer hover:text-black transition-all duration-200 hover:bg-opacity-80 group ${
                  isActive ? " text-black" : " text-[#D1D1D6] "
                }`}
              >
                <IconComponent
                  size={20}
                  className={`transition-all duration-200 ${
                    isActive ? "text-primary" : "group-hover:scale-110"
                  }`}
                />
                <span
                  className={`font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer/User Section */}
        <div className="p-4  border-t border-[#D1D1D6] ">
          <div className="flex items-center gap-3 p-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User size={16} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Dr. Smith</p>
              <p className="text-xs opacity-60 truncate">Veterinarian</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#D1D1D6] bg-white shadow-lg ">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => {
            const isActive = currentActive === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-0 flex-1 transition-all duration-200 group ${
                  isActive
                    ? "transform scale-105 text-black "
                    : " text-[#D1D1D6]"
                }`}
              >
                <IconComponent
                  size={20}
                  className={`mb-1 transition-all duration-200 ${
                    isActive
                      ? "text-primary scale-110"
                      : "group-hover:scale-105"
                  }`}
                />
                <span
                  className={`text-xs font-medium truncate w-full text-center ${
                    isActive ? "font-semibold" : ""
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
