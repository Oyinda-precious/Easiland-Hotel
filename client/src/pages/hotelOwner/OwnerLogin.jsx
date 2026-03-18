import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const OwnerLogin = () => {
  const { isOwner, navigate, userLoading, setOwnerUser, setIsOwner, axios } =
    useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as owner, redirect
  useEffect(() => {
    if (!userLoading && isOwner) {
      navigate("/owner");
    }
  }, [isOwner, userLoading]);

  // Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        email,
        password,
      });
      if (data.success) {
        if (data.user.role !== "hotelOwner") {
          toast.error("You are not registered as a hotel owner");
          return;
        }
        localStorage.setItem("ownerToken", data.token);
        localStorage.setItem("ownerUser", JSON.stringify(data.user));
        setOwnerUser(data.user);
        setIsOwner(true);
        toast.success("Welcome back!");
        navigate("/owner");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post("/api/auth/google", {
        token: credentialResponse.credential,
      });
      if (data.success) {
        if (data.user.role !== "hotelOwner") {
          toast.error("You are not registered as a hotel owner");
          return;
        }
        localStorage.setItem("ownerToken", data.token);
        localStorage.setItem("ownerUser", JSON.stringify(data.user));
        setOwnerUser(data.user);
        setIsOwner(true);
        toast.success("Welcome!");
        navigate("/owner");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-gray-800">
            Owner Portal
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to manage your hotel, rooms and bookings
          </p>
        </div>

        {/* Google Login */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google login failed")}
            width="368"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
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

        <p className="text-center text-xs text-gray-400 mt-6">
          Not a hotel owner?{" "}
          <Link to="/" className="text-gray-500 hover:underline">
            Go to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OwnerLogin;