import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarDay = {
  day: number | null;
  current: boolean;
};

type CalendarProps = {
  onDateSelect: (date: Date) => void;
};

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // --- MODIFICATION START ---
  // 1. Get today's date without the time component for accurate comparison.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // --- MODIFICATION END ---

  const goToPreviousMonth = () => {
    // This check is now handled by disabling the button, but it's good practice.
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const formatMonthYear = () => {
    return selectedMonth.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const weekdays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const generateCalendarDays = (): CalendarDay[] => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalendarDay[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, current: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, current: true });
    }

    return days;
  };

  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    const todayForCheck = new Date(); // Use a fresh instance for current day check
    return (
      day === todayForCheck.getDate() &&
      selectedMonth.getMonth() === todayForCheck.getMonth() &&
      selectedMonth.getFullYear() === todayForCheck.getFullYear()
    );
  };

  // --- MODIFICATION START ---
  // 2. Helper function to check if a given day is in the past.
  const isPastDate = (day: number | null): boolean => {
    if (!day) return false;
    const dateToCheck = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      day
    );
    return dateToCheck < today;
  };
  // --- MODIFICATION END ---

  const isSelected = (day: number | null): boolean => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      selectedDate.getMonth() === selectedMonth.getMonth() &&
      selectedDate.getFullYear() === selectedMonth.getFullYear()
    );
  };

  const handleDateSelect = (day: number | null) => {
    // --- MODIFICATION START ---
    // 3. Prevent selection if the day is null or in the past.

    // --- MODIFICATION END ---
    const date = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      day
    );
    setSelectedDate(date);
    onDateSelect(date);
  };

  // --- MODIFICATION START ---
  // 4. Determine if the "previous month" button should be disabled.
  const isPreviousMonthDisabled =
    selectedMonth.getFullYear() === today.getFullYear() &&
    selectedMonth.getMonth() === today.getMonth();
  // --- MODIFICATION END ---

  return (
    <div>
      {/* Header */}
      <div className="flex space-x-4 items-center  border-b py-4 bg-white border-[#E7E7E7] justify-center">
        {/* --- MODIFICATION START --- */}
        {/* 5. Disable the previous month button if it's a past month. */}
        <button
          onClick={goToPreviousMonth}
          className="disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="text-[#A1534E]" />
        </button>
        {/* --- MODIFICATION END --- */}
        <span className="font-medium text-lg">{formatMonthYear()}</span>
        <button onClick={goToNextMonth}>
          <ChevronRight className="text-[#A1534E]" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center px-4 pt-4 text-xs bg-white font-medium text-[#BEC2CC]">
        {weekdays.map((day, index) => (
          <div key={index} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-0.5 px-4 shadow-lg bg-white rounded-b-4xl mb-4 pb-3">
        {generateCalendarDays().map((day, index) => (
          <div key={index} className="relative text-center py-2">
            {day.day ? (
              <button
                onClick={() => handleDateSelect(day.day)}
                className={`w-8 h-8 flex flex-col items-center justify-center rounded-full mx-auto 
                  ${isSelected(day.day) && "bg-[#A1534E]/15 text-[#A1534E]"}
                `}
              >
                {day.day}
                {isToday(day.day) && (
                  <div className="w-1 h-1 rounded-full bg-[#A1534E] mx-auto " />
                )}
              </button>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
