'use client';
import { backend_url } from '@/config';
import React, { useState } from 'react';
import Cookie  from 'js-cookie' 
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LoginState {
  email: string;
  otp: string;
  step: 'email' | 'otp';
  isLoading: boolean;
}

const LoginComponent: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({
    email: '',
    otp: '',
    step: 'email',
    isLoading: false
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.email) return;

    setState(prev => ({ ...prev, isLoading: true }));
    const url = `${backend_url}/auth/send-otp`;
    const res = await axios.post(url, { email: state.email });
    if(res.data){
      setTimeout(() => {
      setState(prev => ({
        ...prev,
        step: 'otp',
        isLoading: false
      }));
    }, 1000);
    }
    // Simulate API call
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.otp) return;

    setState(prev => ({ ...prev, isLoading: true }));

    const url = `${backend_url}/auth/verify-otp`;
    const res = await axios.post(url, { email: state.email, otp: state.otp });
    if (res.data) {
      Cookie.set('auth_token', res.data.token);
      Cookie.set('refresh_token', res.data.refresh);
    }
    // Simulate OTP verification
    setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.success('Login successful!');
      router.push('/dashboard');
    }, 1000);
  };

  const handleBack = () => {
    setState(prev => ({
      ...prev,
      step: 'email',
      otp: ''
    }));
  };

  return (
    <>
      <div className="h-screen flex overflow-hidden">
        {/* Left Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center  bg-white px-8 md:px-0">
          <div className="w-full relative z-10 max-w-xl space-y-8 shadow-lg rounded-lg  py-16 px-12 bg-white">
            {/* Header */}
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Login
              </h1>
              <p className="text-gray-600 text-sm">
                {state.step === 'email'
                  ? 'Enter your email to continue'
                  : 'Enter the OTP sent to your email'
                }
              </p>
            </div>

            {/* Email Form */}
            {state.step === 'email' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email Address
                  </label> 
                  <input
                    id="email"
                    type="email"
                    required
                    value={state.email}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-foreground"
                    placeholder="Enter your email"
                    disabled={state.isLoading}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={state.isLoading || !state.email}
                  className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {state.isLoading ? 'Sending...' : 'Next'}
                </button>
              </div>
            )}

            {/* OTP Form */}
            {state.step === 'otp' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-foreground"
                  >
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={state.otp}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      otp: e.target.value.replace(/\D/g, '')
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-center text-2xl font-mono tracking-widest text-foreground"
                    placeholder="000000"
                    disabled={state.isLoading}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    OTP sent to {state.email}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleOtpSubmit}
                    disabled={state.isLoading || state.otp.length !== 6}
                    className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {state.isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                  >
                    Back to Email
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>By continuing, you agree to our Terms of Service</p>
            </div>
          </div>
          <img src="/login-bg.svg" alt="" className='absolute h-full z-0 top-0 left-0 md:w-1/2 w-full object-cover' />
        </div>

        {/* Right Panel - Image */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <img src="/image.png" alt="" className=' w-full h-full' />
        </div>
      </div>
    </>
  );
};

export default LoginComponent;