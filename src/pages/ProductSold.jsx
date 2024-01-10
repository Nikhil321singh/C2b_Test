import React, { useEffect, useState } from "react";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import User_Logo from "../assets/User_Logo.jpeg";
import { useNavigate } from "react-router-dom";
import { GiReturnArrow } from "react-icons/gi";
import { BsCartCheckFill } from "react-icons/bs";
const ProductSold = () => {
  const [userName, setUserName] = useState();

  const navigate = useNavigate();
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/selectdevicetype");
    }, 30000);

    return () => clearInterval(timeout);
  }, [navigate]);

  const handleReturn = () => {
    navigate("/selectdevicetype");
  };
  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="flex items-center justify-between w-full ">
          <div className="flex flex-row-reverse items-center gap-2 ml-4">
            <p className="mr-4 text-base md:text-xl">{userName}</p>

            <img className="w-[30px]" src={User_Logo} alt="" />
          </div>

          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-28 "
            src={Grest_Logo}
            alt="app logo"
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 h-[70vh]">
        <BsCartCheckFill size={84} color="#EC2752" />
        <p className="font-medium text-2xl">Item Sold Successfully</p>
      </div>
      <div className="fixed bottom-0 w-full ">
        <div
          onClick={handleReturn}
          className=" bg-[#EC2752] p-4 mx-2 text-lg rounded-lg cursor-pointer flex justify-between  text-white items-center"
        >
          <p className="font-medium flex-1 mx-4">Return to Home</p>
          <GiReturnArrow />
        </div>
      </div>
    </div>
  );
};

export default ProductSold;
