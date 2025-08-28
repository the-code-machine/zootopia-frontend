import Navigation from "@/components/sidebar/Sidebar";
import React from "react";
import Home from "../page";
import HomePage from "@/components/screens/Home";
import axios from "axios";

import { backend_url } from "@/config";

export default async function page() {
  return <HomePage />;
}
