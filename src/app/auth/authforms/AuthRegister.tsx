'use client'
import { Button, Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import axios from "axios";

const AuthRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:80/signup", { name, email });
      if (response.data.success) {
        setIsOtpSent(true);
        setMessage("OTP sent to your email."); 
      }
    } catch (error) {
      setMessage("Error sending OTP.");
    }
    setIsLoading(false);
  };
  
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:80/verify-otp", { email, otp });
      if (response.data.success) {
        setMessage("OTP verified successfully!");
        localStorage.setItem("email", email); // Store email in local storage
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
            {isLoading ? "Verifying OTP..." : "Otp verified Sucessfully Please Sign in"}
          </Button>
        )}

        {message && <p className="mt-2 text-red-600">{message}</p>}
      </form>
    </>
  );
};

export default AuthRegister;
