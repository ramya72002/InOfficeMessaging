'use client'
import { Button, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AuthLogin = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Automatically sign in if email is stored in localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      handleSignin();
    }
  }, []);

  const handleSignin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent default form submission if called from the form
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:80/signin", { email });
      if (response.status === 200) {
        localStorage.setItem("email", email);
        router.push("/dashboard"); // Redirect to the dashboard
      }
    } catch (error) {
      setErrorMessage("Invalid email. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSignin}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email" />
          </div>
          <TextInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sizing="md"
            className="form-control"
            required
          />
        </div>

        <div className="flex justify-between my-5">
          <Link href="/forgot-password" className="text-primary text-sm font-medium">
            Forgot Email?
          </Link>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        <Button type="submit" color="primary" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
