import React from "react";
import { MdOutlineHome } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { IoBagAddOutline } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import styles from "../styles/AppFooter.module.css";
import { useNavigate } from "react-router";

const AppFooter = ({ days }) => {
  const show = true;
  const navigate = useNavigate();
  const currentDomain = window.location.origin;
  const handleHome = () => {
    navigate("/selectdevicetype");
  };
  const handleCategories = () => {
    navigate("/BrandList");
  };
  const handleOrders = () => {
    navigate(`/Orders/${days}`);
  };
  const handleSearch = () => {
    navigate(`/selectdevicetype`, { state: { openSearch: true } });
  };
 
  return (
    <div
      className={`${
        show ? "bottom-0" : "-bottom-[60px]"
      } bg-white flex border-2 py-2 justify-around w-full footer fixed ${
        styles.footer_wrap
      }`}
    >
      <div onClick={handleHome} className="flex flex-col items-center">
        <MdOutlineHome size={24} />
        <button className="text-sm">Home</button>
      </div>
      {currentDomain === import.meta.env.VITE_BUYBACK_URL && <div onClick={handleSearch} className="flex flex-col items-center">
        <CiSearch size={24} />
        <button className="text-sm">Search Products</button>
      </div>}
      {currentDomain !== import.meta.env.VITE_BUYBACK_URL && <div onClick={handleCategories} className="flex flex-col items-center">
        <BiCategory size={24} />
        <button className="text-sm">Categories</button>
      </div>}
      {currentDomain !== import.meta.env.VITE_BUYBACK_URL && <div onClick={handleOrders} className="flex flex-col items-center">
        <IoBagAddOutline size={24} />
        <button className="text-sm">Orders</button>
      </div>}
    </div>
  );
};

export default AppFooter;
