import React, { useEffect } from "react";
import { SignIn } from "@clerk/clerk-react";
import { useAppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const OwnerLogin = () => {
  const { isOwner, navigate, userLoading } = useAppContext();

  useEffect(() => {
    if (!userLoading && isOwner) {
      navigate("/owner");
    }
  }, [isOwner, userLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-playfair font-bold text-gray-800">
          Owner Portal
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Sign in to manage your hotel, rooms and bookings
        </p>
      </div>

      <SignIn
        routing="hash"
        afterSignInUrl="/owner"
        signUpUrl="/owner/login"
      />

      <p className="text-center text-xs text-gray-400 mt-6">
        Not a hotel owner?{" "}
        <Link to="/" className="text-gray-500 hover:underline">
          Go to Homepage
        </Link>
      </p>
    </div>
  );
};

export default OwnerLogin;