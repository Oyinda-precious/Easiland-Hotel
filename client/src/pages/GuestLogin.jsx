import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGuestAuth } from "../context/GuestAuthContext";
import { toast } from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const GuestLoginPage = () => {
  const { loginGuest, googleLoginGuest, guestUser } = useGuestAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  
  useEffect(() => {
    if (guestUser) navigate("/");
  }, [guestUser]);

  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginGuest(email, password);
    setLoading(false);

    if (result.success) {
      toast.success("Welcome back!");
      const redirect = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirect);
    } else if (result.needsVerification) {
     
      toast.error("Please verify your email first");
     
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/guest/resend-otp`, { email });
      setShowOTP(true);
      setCountdown(60);
    } else {
      toast.error(result.message);
    }
  };

 
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/guest/verify-otp`,
        { email, otp: otpString }
      );
      if (data.success) {
        localStorage.setItem("guestToken", data.token);
        localStorage.setItem("guestUser", JSON.stringify(data.user));
        toast.success("Email verified! Welcome!");
        const redirect = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Verification failed");
    }
    setOtpLoading(false);
  };

  
  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/guest/resend-otp`,
        { email }
      );
      if (data.success) {
        toast.success("New OTP sent to your email!");
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to resend OTP");
    }
    setResendLoading(false);
  };

 
  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLoginGuest(credentialResponse.credential);
    if (result.success) {
      toast.success("Welcome!");
      const redirect = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirect);
    } else {
      toast.error(result.message);
    }
  };

 
  if (showOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Verify your email</h1>
            <p className="text-gray-500 mt-2 text-sm">We sent a 6-digit code to</p>
            <p className="text-blue-600 font-medium text-sm">{email}</p>
          </div>

          <form onSubmit={handleVerifyOTP}>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 transition"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {otpLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="text-center mt-6">
            {countdown > 0 ? (
              <p className="text-gray-400 text-sm">
                Resend OTP in <span className="text-blue-600 font-medium">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-blue-600 text-sm hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <button
            onClick={() => setShowOTP(false)}
            className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to view your bookings and book rooms
          </p>
        </div>

      
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google login failed")}
            width="368"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Create one
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          Are you a hotel owner?{" "}
          <Link to="/owner/login" className="text-gray-500 hover:underline">
            Owner Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default GuestLoginPage;