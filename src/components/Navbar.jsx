

import React from "react";
import { FaUser } from "react-icons/fa";
import { HiSun } from "react-icons/hi";
import { RiSettings3Fill } from "react-icons/ri";

const Navbar = () => {
  return (
    <>
      <nav className="nav flex items-center justify-between px-6 md:px-16 h-[80px] border-b border-gray-800 bg-[#09090B]">
        <div className="logo">
          <h3 className="text-[22px] md:text-[26px] font-[700] sp-text">
            CodeCreator
          </h3>
        </div>

        <div className="icons flex items-center gap-3">
          <div className="icon"><HiSun /></div>
          <div className="icon"><FaUser /></div>
          <div className="icon"><RiSettings3Fill /></div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
