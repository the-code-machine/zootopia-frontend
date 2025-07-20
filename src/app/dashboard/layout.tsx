import Navigation from "@/components/sidebar/Sidebar";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      
      <div className="lg:ml-64 lg:mr-0 mx-0 mb-20 lg:mb-0">
        <main className="min-h-screen p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}