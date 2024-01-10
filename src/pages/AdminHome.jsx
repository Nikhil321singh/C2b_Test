import React, { useState } from "react";

import AdminPhone_list from "../components/Phone_select_admin";
import AdminQuestionTable from "../components/AdminQuestionTable";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminNavbar from "../components/Admin_Navbar";
import SideMenu from "../components/SideMenu";

import Searchbar from "../components/Searchbar";
import Footer from "../components/Footer";

const AdminHome = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const navigate = useNavigate();
  const adminAnswer = useSelector((state) => state.adminAnswer);

  const handleNext = () => {
    console.log("clicked");
    console.log(adminAnswer);
    navigate("/adminfinalgrade");
  };
  return (
    <div className="flex flex-col mainconatiner">
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <Searchbar />

      <div className="phoneselect w-[90vw] h-[50vh] my-[5vh] mx-[5vw] bg-slate-300 rounded-[12px] overflow-auto ">
        <AdminPhone_list />
      </div>

      <div className="flex justify-start mx-auto flex-wrap gap-2 mb-2 w-[90%]">
        <button className="text-center  px-4 py-2 rounded-lg bg-[#EC2752] text-white cursor-pointer">
          Add New Listing
        </button>
        <button className="text-center   px-4 py-2 rounded-lg bg-[#EC2752] text-white cursor-pointer">
          Edit/Delete
        </button>
      </div>

      <div className="tableconatiner flex justify-center items-center">
        <AdminQuestionTable />
      </div>
      <div className="flex justify-center mb-2">
        <button
          onClick={handleNext}
          className="text-center  mx-2 px-4 py-2 rounded-lg bg-[#EC2752] text-white cursor-pointer"
        >
          Next
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default AdminHome;
