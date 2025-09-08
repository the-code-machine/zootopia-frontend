import axiosClient from "@/utils/axiosClient";
import React from "react";
import MedicalHistoryPage from "./Medical";
import axios from "axios";
import { backend_url } from "@/config";

export default function page() {
  return <MedicalHistoryPage />;
}
