'use client'
import { Button, Label, TextInput, Select } from "flowbite-react";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const PROVIDERS = {
  "AT&T": { "sms": "txt.att.net", "mms": "mms.att.net", "mms_support": true },
  "Boost Mobile": { "sms": "sms.myboostmobile.com", "mms": "myboostmobile.com", "mms_support": true },
  "C-Spire": { "sms": "cspire1.com", "mms_support": false },
  "Cricket Wireless": { "sms": "sms.cricketwireless.net", "mms": "mms.cricketwireless.net", "mms_support": true },
  "Consumer Cellular": { "sms": "mailmymobile.net", "mms_support": false },
  "Google Project Fi": { "sms": "msg.fi.google.com", "mms_support": true },
  "Metro PCS": { "sms": "mymetropcs.com", "mms_support": true },
  "Mint Mobile": { "sms": "mailmymobile.net", "mms_support": false },
  "Page Plus": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
  "Republic Wireless": { "sms": "text.republicwireless.com", "mms_support": false },
  "Sprint": { "sms": "messaging.sprintpcs.com", "mms": "pm.sprint.com", "mms_support": true },
  "Straight Talk": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
  "T-Mobile": { "sms": "tmomail.net", "mms_support": true },
  "Ting": { "sms": "message.ting.com", "mms_support": false },
  "Tracfone": { "sms": "", "mms": "mmst5.tracfone.com", "mms_support": true },
  "U.S. Cellular": { "sms": "email.uscc.net", "mms": "mms.uscc.net", "mms_support": true },
  "Verizon": { "sms": "vtext.com", "mms": "vzwpix.com", "mms_support": true },
  "Virgin Mobile": { "sms": "vmobl.com", "mms": "vmpix.com", "mms_support": true },
  "Xfinity Mobile": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
};

const AuthRegister = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !companyName || !phone || !provider) {
      setMessage("All fields are required!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("https://in-office-messaging-backend.vercel.app/signup", {
        name,
        email,
        company_name: companyName,
        phone,
        provider,
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
    if (!otp) {
      setMessage("OTP is required!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("https://in-office-messaging-backend.vercel.app/verify-otp", { email, otp });
      if (response.data.success) {
        setMessage("OTP verified successfully!");
        localStorage.setItem("email", email);
        router.push("/auth/login");
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
            disabled={isOtpSent}
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
            disabled={isOtpSent}
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="companyName" value="Company Name" />
          </div>
          <TextInput
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            sizing="md"
            className="form-control"
            disabled={isOtpSent}
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="phone" value="Phone Number" />
          </div>
          <TextInput
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sizing="md"
            className="form-control"
            disabled={isOtpSent}
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="provider" value="Provider" />
          </div>
          <Select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            disabled={isOtpSent}
          >
            <option value="">Select a Provider</option>
            {Object.keys(PROVIDERS).map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </Select>
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
