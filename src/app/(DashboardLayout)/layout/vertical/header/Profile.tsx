import { useState, useEffect } from "react";
import { Button, Dropdown } from "flowbite-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import axios from "axios";

const Profile = () => {
  const [name, setName] = useState(""); // State to store the user's name
  const router = useRouter(); // Initialize router for programmatic navigation

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const email = localStorage.getItem('email'); // Get email from local storage
        const response = await axios.get(`https://in-office-messaging-backend.vercel.app/getrecords?email=${email}`);
        const fetchedName = response.data.name;
        setName(fetchedName); // Set the fetched name in the state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserName(); // Fetch user's name on component mount
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage
    router.push("/auth/login"); // Redirect to signin page
  };

  return (
    <div className="relative group/menu flex items-center gap-4">
      <span className="text-dark font-medium">Hi {name}</span> {/* Display user's name */}
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src="/images/profile/user-1.jpg"
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <Dropdown.Item
          as={Link}
          href="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:user-circle-outline" height={20} />
          My Profile
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          href="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:letter-linear" height={20} />
          My Account
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          href="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:checklist-linear" height={20} />
          My Task
        </Dropdown.Item>
        <div className="p-3 pt-0">
          <Button
            size="sm"
            onClick={handleLogout} // Use onClick instead of as={Link}
            className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none"
          >
            Logout
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
