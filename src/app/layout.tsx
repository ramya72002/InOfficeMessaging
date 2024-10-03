'use client'
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Import useRouter and usePathname
import { Inter } from "next/font/google";
import 'simplebar-react/dist/simplebar.min.css';
import "./css/globals.css";
import { Flowbite } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); // Get the router object
  const pathname = usePathname(); // Get the current path

  // Redirect from "/" to "/login"
  useEffect(() => {
    if (pathname === "/") {
      router.push("/auth/login");
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Flowbite theme={{ theme: customTheme }}>
          {children}
        </Flowbite>
      </body>
    </html>
  );
}
