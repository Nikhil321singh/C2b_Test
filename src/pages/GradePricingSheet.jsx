import React, { useState } from "react";
import GradePricingTable from "../components/GradePricingTable";
import Footer from "../components/Footer";
import AdminNavbar from "../components/Admin_Navbar";
import SideMenu from "../components/SideMenu";
import Searchbar from "../components/Searchbar";

const GradePricingSheet = () => {
  const [sideMenu, setsideMenu] = useState(false);
  return (
    <div>
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <Searchbar />
      <div className="tableconatiner flex justify-center items-center">
        <GradePricingTable />
      </div>
      <Footer />
    </div>
  );
};

export default GradePricingSheet;
