"use client";
import React from "react";
import Image from "next/image";
import Logo from "/public/images/logos/nvislogo.png";
import Link from "next/link";

const FullLogo = () => {
  return (
    <Link href={"/"}>
      <Image
        src={Logo}
        alt="logo"
        width={200}
        height={300}
        className="block dark:hidden rtl:scale-x-[-1]"
      />
    </Link>
  );
};

export default FullLogo;
