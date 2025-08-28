import Link from "next/link";
import React from "react";

export default function Header({ title }: { title: string }) {
  return (
    <div className="bg-white fixed top-0 px-4 w-full sm:max-w-3xl py-4 flex items-center justify-between  border-[#E7E7E7] border z-10">
      <Link href={"/dashboard"}>
        <svg
          width="18"
          height="17"
          viewBox="0 0 18 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7.5 1.35355C7.69526 1.15829 8.01184 1.15829 8.20711 1.35355C8.40237 1.54882 8.40237 1.8654 8.20711 2.06066L1.91421 8.35355H16.7071C16.9832 8.35355 17.2071 8.57741 17.2071 8.85355C17.2071 9.1297 16.9833 9.35355 16.7071 9.35355H1.91421L8.20711 15.6464C8.40237 15.8417 8.40237 16.1583 8.20711 16.3536C8.01184 16.5488 7.69526 16.5488 7.5 16.3536L0.707107 9.56066C0.316582 9.17014 0.316583 8.53697 0.707107 8.14645L7.5 1.35355Z"
            fill="#1B1B1C"
            stroke="black"
            stroke-width="0.5"
          />
        </svg>
      </Link>
      <h1 className="text-[20px] font-medium text-[#1B1B1C]">{title}</h1>
      <div></div>
    </div>
  );
}
