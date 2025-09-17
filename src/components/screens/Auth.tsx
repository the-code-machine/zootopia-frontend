"use client";
import { backend_url } from "@/config";
import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LoginState {
  email: string;
  otp: string;
  step: "email" | "otp";
  isLoading: boolean;
}

const LoginComponent: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({
    email: "",
    otp: "",
    step: "email",
    isLoading: false,
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.email) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const url = `${backend_url}/auth/send-otp`;
      const res = await axios.post(url, { email: state.email });
      if (res.data) {
        setState((prev) => ({ ...prev, step: "otp", isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to send OTP", error);
      toast.error("Failed to send verification code.");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.otp) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // Uncomment the following lines to enable API call
      const url = `${backend_url}/auth/verify-otp`;
      const res = await axios.post(url, { email: state.email, otp: state.otp });
      if (res.data) {
        Cookies.set("auth_token", res.data.token, {
          sameSite: "None",
          secure: true,
        });
        Cookies.set("refresh_token", res.data.refresh, {
          sameSite: "None",
          secure: true,
        });

        toast.success("Login successful!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      toast.error("Invalid verification code. Please try again.");
      setState((prev) => ({ ...prev, isLoading: false, otp: "" }));
    }
  };

  const handleBack = () => {
    setState((prev) => ({
      ...prev,
      step: "email",
      otp: "",
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#edebd7] w-full">
      <div className="w-full max-w-sm rounded-xl  p-8 bg-white ">
        <h1 className="sm:text-xl text-2xl font-normal text-center text-gray-700">
          Zootopia Animal Wellness Center
        </h1>

        {state.step === "email" && (
          <>
            <div className="mt-8">
              <h2 className="text-[18px] font-bold">Sign in</h2>
              <p className="mt-2 text-[13px] text-gray-600">
                Enter your email and we'll send you a verification code
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="mt-3 space-y-5">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={state.email}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="peer w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-900 focus:border-blue-500 "
                  placeholder="Email"
                  disabled={state.isLoading}
                />
                {/* The placeholder acts as the label as in the image */}
              </div>

              <button
                type="submit"
                disabled={state.isLoading || !state.email}
                className="w-full rounded-md bg-[#005BD3] py-3 px-3 font-semibold text-white text-sm transition hover:bg-[#0045A3] focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:cursor-not-allowed "
              >
                {state.isLoading ? "Sending..." : "Continue"}
              </button>
            </form>

            <div className="mt-6 flex justify-start gap-4 text-sm">
              <a
                href="https://www.zootopia.com.ph/89981845806/policies/40314372398.html?locale=en"
                className="font-medium text-[#005BD3]  hover:underline"
              >
                Privacy policy
              </a>
              <a
                href="https://www.zootopia.com.ph/89981845806/policies/42022076718.html?locale=en"
                className="font-medium text-[#005BD3]  hover:underline"
              >
                Terms of service
              </a>
            </div>
          </>
        )}

        {state.step === "otp" && (
          <>
            <div className="mt-8">
              <h2 className="text-xl font-bold">Enter code</h2>
              <p className="mt-2 text-sm text-gray-600">
                Sent to{" "}
                <strong className="font-medium text-gray-800">
                  {state.email}
                </strong>
                .
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="mt-3 space-y-4">
              <div>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={state.otp}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      otp: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-2 py-2  text-md tracking-widest text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="6-digit code"
                  disabled={state.isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={state.isLoading || state.otp.length !== 6}
                className="w-full rounded-md bg-[#005BD3] py-3 px- font-semibold text-sm text-white transition hover:bg-[#0045A3] focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:cursor-not-allowed "
              >
                {state.isLoading ? "Verifying..." : "Verify"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full py-2  text-sm font-medium text-[#005BD3]  cursor-pointer hover:underline text-left"
              >
                Sign in with a different email
              </button>
            </form>
            <div className="mt-1 flex justify-start gap-4 text-sm">
              <a
                href="https://www.zootopia.com.ph/89981845806/policies/40314372398.html?locale=en"
                className="font-medium text-[#005BD3]  hover:underline"
              >
                Privacy policy
              </a>
              <a
                href="https://www.zootopia.com.ph/89981845806/policies/42022076718.html?locale=en"
                className="font-medium text-[#005BD3]  hover:underline"
              >
                Terms of service
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;
