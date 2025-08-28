"use client";
import BottomNavigation from "@/components/sidebar/Sidebar";
import Navigation from "@/components/sidebar/Sidebar";
import { usePathname } from "next/navigation";
import React from "react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const path = usePathname();
  return (
    <div className=" bg-[#FAFAFA]">
      {!path.includes("pet") &&
        !path.includes("appointment") &&
        !path.includes("vaccine-registration") &&
        !path.includes("medical-record")}

      {children}
    </div>
  );
}
