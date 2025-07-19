"use client";
import React, { useState } from "react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "verification">("email");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Email for verification:", email);
    setIsLoading(false);
    setShowSuccess(true);

    // Move to verification step after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setStep("verification");
    }, 1500);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setVerificationError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");

    if (code.length !== 6) {
      setVerificationError("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);

    // Simulate API call for verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For testing - accept 123456 as valid code
    if (code === "123456") {
      console.log("Verification successful!");
      // Here you would typically redirect to dashboard
      alert("Login successful! 🎉");
    } else {
      setVerificationError("Invalid verification code. Please try again.");
    }

    setIsVerifying(false);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setVerificationCode(["", "", "", "", "", ""]);
    setVerificationError("");
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    // Simulate resend API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Resending code to:", email);
    setIsLoading(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex ">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {step === "email" ? (
            <>
              {/* Logo/Brand */}
              <div className="">
                <div className="flex items-center">
                  <div className="text-2xl font-bold ">
                    <img src="/logo2.png" alt="Logo" />
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight  text-gray-900">
                  Log In to your account
                </h2>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleChange}
                      placeholder="Registered Email"
                      className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                  {email && !isEmailValid && (
                    <p className="mt-2 text-sm text-red-600">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!isEmailValid || isLoading}
                    className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </div>

                {/* Success Message */}
                {showSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Verification code sent to {email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <div>
                  <button
                    type="button"
                    className="flex w-full justify-center items-center gap-3 rounded-md bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>

              {/* Register Link */}
              <p className="mt-10 text-center text-sm text-gray-500">
                Do not have an account?{" "}
                <a
                  href="#"
                  className="font-semibold leading-6 text-pink-500 hover:text-pink-400"
                >
                  Register
                </a>
              </p>
            </>
          ) : (
            <>
              {/* Logo/Brand */}
              <div className="mb-8">
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    <img src="/logo2.png" alt="Logo" className=""/>
                  </div>
                </div>
              </div>

              {/* Verification Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Enter Verification Code
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a 6-digit code to
                </p>
                <p className="font-medium text-pink-500">{email}</p>
              </div>

              {/* Verification Form */}
              <form className="space-y-6" onSubmit={handleVerificationSubmit}>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900 text-center mb-4">
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-3">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        required
                      />
                    ))}
                  </div>
                  {verificationError && (
                    <p className="mt-2 text-sm text-red-600 text-center">
                      {verificationError}
                    </p>
                  )}
                </div>

                {/* Test Code Hint */}
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm text-center text-blue-800">
                    💡 <strong>For testing:</strong> Use code{" "}
                    <span className="font-mono font-bold">123456</span>
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={
                      verificationCode.join("").length !== 6 || isVerifying
                    }
                    className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Verifying...
                      </div>
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                </div>

                {/* Success Message */}
                {showSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Code resent successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    ← Back to Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="flex-1 rounded-md bg-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-400 disabled:opacity-50"
                  >
                    {isLoading ? "Resending..." : "Resend Code"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Professional Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <img
            src="/image.png"
            alt="Professional workspace"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
