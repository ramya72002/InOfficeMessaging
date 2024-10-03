'use client'
import { Button, Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import axios from "axios";
import router, { useRouter } from "next/navigation";

const AuthRegister = () => {
  const router=useRouter()
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");  // Add companyName state
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://in-office-messaging-backend.vercel.app/signup", { 
        name, 
        email, 
        company_name: companyName  // Pass company name in signup request
      });
      if (response.data.success) {
        setIsOtpSent(true);
        setMessage("OTP sent to your email."); 
      }
    } catch (error) {
      setMessage("Email Already Registered");
    }
    setIsLoading(false);
  };
  
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://in-office-messaging-backend.vercel.app/verify-otp", { email, otp });
      if (response.data.success) {
        setMessage("OTP verified successfully!");
        localStorage.setItem("email", email); // Store email in local storage
        router.push('/auth/login')
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Error during OTP verification.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <form>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="name" value="Name" />
          </div>
          <TextInput
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sizing="md"
            className="form-control"
            disabled={isOtpSent} // Disable if OTP is sent
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email Address" />
          </div>
          <TextInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sizing="md"
            className="form-control"
            disabled={isOtpSent} // Disable if OTP is sent
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="companyName" value="Company Name" />
          </div>
          <TextInput
            id="companyName"
            type="text"
            value={companyName}  // Bind company name state
            onChange={(e) => setCompanyName(e.target.value)}
            sizing="md"
            className="form-control"
            disabled={isOtpSent} // Disable if OTP is sent
          />
        </div>

        {isOtpSent ? (
          <div className="mb-4">
            <div className="mb-2 block">
              <Label htmlFor="otp" value="Enter OTP" />
            </div>
            <TextInput
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sizing="md"
              className="form-control"
              maxLength={6}
            />
          </div>
        ) : null}

        {!isOtpSent ? (
          <Button
            color="primary"
            className="w-full"
            onClick={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Verify Email"}
          </Button>
        ) : (
          <Button
            color="primary"
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? "Verifying OTP..." : "Sign Up"}
          </Button>
        )}

        {message && <p className="mt-2 text-red-600">{message}</p>}
      </form>
    </>
  );
};

export default AuthRegister;
