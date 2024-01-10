import React, { useEffect, useState } from "react";
import Grest_Logo from "../../assets/Grest_Logo.jpeg";
import User_Logo from "../../assets/User_Logo.jpeg";
import { FaArrowRight } from "react-icons/fa";
import styles from "./DeviceQuote.module.css";
import QuoteModal from "../../components/QuoteModal/QuoteModal";
import OTPModal from "../../components/OTPModal";
import ContOTP from "../../components/ContOTP/ContOTP";
import { useNavigate } from "react-router-dom";

const DeviceQuote = () => {
  const [userName, setUserName] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [continueOTPOpen, setContinueOTPOpen] = useState(false);

  const continueOTPHandler = () => {
    setContinueOTPOpen(!continueOTPOpen);
  };

  const [deviceModalInfo, selDeviceModalInfo] = useState(() => {
    const dataModel = JSON.parse(sessionStorage.getItem("dataModel"));
    return dataModel;
  });

  const navigate = useNavigate();
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);
  }, []);

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const toggleOTPModal = () => {
    setShowOTPModal(!showOTPModal);
  };

  const handleDetailSubmit = () => {
    console.log("clicked");
    setShowModal(!showModal);
    setShowOTPModal(!showOTPModal);
  };
  return (
    <div className={`bg-white min-h-screen ${styles.page_wrap}`}>
      {continueOTPOpen && <ContOTP setContinueOTPOpen={setContinueOTPOpen}/>}
      <div
        className={` flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER `}
      >
        <div className="flex items-center justify-between w-full ">
          <div className="flex ml-4 gap-2 flex-row-reverse items-center">
            <p className="mr-4 text-base  md:text-xl">{userName}</p>

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

      <div className="max-w-[900px]  md:mx-auto">
        <p className="text-xl font-medium mx-2 my-4">Device Quote Details</p>
        <div className={` ${styles.QuoteCardShadow} rounded-md p-2 mx-2`}>
          <div className="flex gap-4 items-center">
            <div>
              <img
                className="w-[50px]"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjX4AzMXjxyVKyfHZNlt877tnGHoEoDqOlA&usqp=CAU"
                alt=""
              />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-gray-700 font-medium">
                {`${deviceModalInfo.models?.name}(${deviceModalInfo.models?.config?.RAM}/${deviceModalInfo.models?.config?.storage})`}
              </p>
              <p className="text-[#EC2752] font-semibold">
                ₹{deviceModalInfo.models?.config?.price}
              </p>
            </div>
          </div>
          <QuoteModal show={showModal} handleClose={toggleModal}></QuoteModal>

          <div className=" mx-1 my-4 border-b-2 border-gray-400 border-dashed"></div>

          <div className="flex justify-between items-center">
            <p className="text-gray-700 text-[17px] underline font-medium">
              Device Report
            </p>
            <button
              className="text-[#EC2752] border-2 border-[#EC2752] text-sm font-medium p-2 rounded-md "
              onClick={toggleModal}
            >
              Save Quote
            </button>
          </div>
        </div>
      </div>

      <div className="border-t-2 flex flex-col gap-2 fixed bottom-0 w-full p-4">
        <div className="flex gap-1">
          <input type="checkbox" />
          <p className="font-medium">
            I agree to the
            <span className="text-[#EC2752] cursor-pointer">
              {" "}
              Terms & Conditions
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col w-1/2 text-xl font-medium">
            <p>₹{deviceModalInfo.models?.config?.price}</p>
            {/* <p className="text-[#EC2752] underline cursor-pointer">
              View Summary
            </p> */}
          </div>
          <div
            onClick={continueOTPHandler}
            className="bg-[#EC2752] rounded-lg cursor-pointer w-1/2 sm:max-w-[200px] flex justify-between px-2 text-white items-center"
          >
            <p className="font-medium p-2 ">Continue</p>
            <FaArrowRight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceQuote;
