import Navigation from "@/components/sidebar/Sidebar";
import React from "react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=" flex">
      <Navigation />
      <div className=" bg-[#FAFAFA]"></div>
      {children}
    </div>
  );
}
