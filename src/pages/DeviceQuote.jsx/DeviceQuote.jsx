import React, { useEffect, useState } from "react";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import styles from "./DeviceQuote.module.css";
import QuoteModal from "../../components/QuoteModal/QuoteModal";
import ContOTP from "../../components/ContOTP/ContOTP";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DeviceReport from "../../components/DeviceReport/DeviceReport";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import apple_watch from "../../assets/apple_watch.png";


const DeviceQuote = () => {
  const Device = sessionStorage.getItem("DeviceType");
  const DummyImg = Device === "Mobile"
    ? "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
    : apple_watch;
  const phoneImg = JSON.parse(sessionStorage.getItem("dataModel"));
  const phoneFrontPhoto = phoneImg?.models?.phonePhotos?.front || phoneImg?.models?.phonePhotos?.upFront;
  const exactQuoteValue = sessionStorage.getItem("ExactQuote");
  const dataModel = JSON.parse(sessionStorage.getItem("dataModel"));
  const deviceModalInfo = dataModel;
  const [showModal, setShowModal] = useState(false);
  const [continueOTPOpen, setContinueOTPOpen] = useState(false);
  const [showDeviceReport, setShowDeviceReport] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [quoteId, setQuoteId] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const Price = useSelector((state) => state.responseData.price);
  const uniqueCode = useSelector((state) => state.responseData.uniqueCode);

  useEffect(() => {
    setQuoteId(uniqueCode);
  }, [uniqueCode]);

  const continueOTPHandler = () => {
    setContinueOTPOpen(!continueOTPOpen);
  };

  const showDeviceReportHandler = () => {
    setShowDeviceReport(!showDeviceReport);
  };

  const navigate = useNavigate();
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className={`bg-white min-h-screen ${styles.page_wrap}`}>
      {continueOTPOpen && <ContOTP setContinueOTPOpen={setContinueOTPOpen} />}
      {showDeviceReport && (
        <DeviceReport setShowDeviceReport={setShowDeviceReport} quoteSaved={quoteSaved}/>
      )}
      <div
        className={` flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER `}
      >
        <div className="flex items-center justify-between w-full pr-2">
          <ProfileBox />

          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-28 "
            src={Grest_Logo}
            alt="app logo"
          />
        </div>
      </div>

      <div className="max-w-[900px]  md:mx-auto">
        <p className="mx-2 my-4 text-xl font-medium">Device Quote Details</p>
        <div className={` ${styles.QuoteCardShadow} rounded-md p-2 mx-2`}>
          <div className="flex items-center gap-4">
            <div>
              <img
                className="w-[50px]"
                src={phoneFrontPhoto ? phoneFrontPhoto : DummyImg}
                alt=""
              />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="font-medium text-gray-700">
                {`${deviceModalInfo.models?.name}${deviceModalInfo.models?.type === "Mobile" ?
                " (" + deviceModalInfo.models?.config?.RAM + "/" + deviceModalInfo.models?.config?.storage + ")" : "" }`}
              </p>
              <p className="text-[#EC2752] font-semibold">₹{Price}</p>
            </div>
          </div>
          <QuoteModal
            show={showModal}
            handleClose={toggleModal}
            setQuoteSaved={setQuoteSaved}
            quoteId={quoteId}
          ></QuoteModal>

          <div className="mx-1 my-4 border-b-2 border-gray-400 border-dashed "></div>

          <div className="flex items-center justify-between">
            <p
              className="text-gray-700 text-[17px] underline font-medium"
              onClick={showDeviceReportHandler}
            >
              Device Report
            </p>
            {quoteSaved === false && (
              <button
                className="text-[#EC2752] border-2 border-[#EC2752] text-sm font-medium p-2 rounded-md "
                onClick={toggleModal}
              >
                Save Quote
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 flex flex-col w-full gap-2 p-4 border-t-2">
        {quoteSaved === false && exactQuoteValue === "true" && (
          <div className="flex gap-1">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={() => setTermsChecked(!termsChecked)}
            />
            <p className="font-medium">
              I agree to the
              <span className="text-[#EC2752] cursor-pointer">
                {" "}
                Terms & Conditions
              </span>
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col w-1/2 text-xl font-medium">
            <p>₹{Price}</p>
          </div>
          {quoteSaved === false && exactQuoteValue === "true" && (
            <div
              onClick={termsChecked ? continueOTPHandler : undefined}
              className={`${
                termsChecked ? "bg-[#EC2752]" : "bg-gray-400 cursor-not-allowed"
              } py-1 rounded-lg cursor-pointer w-1/2 sm:max-w-[200px]  flex justify-between px-2 text-white items-center`}
            >
              <p className="font-medium mx-auto text-xl p-[6px] ">Continue</p>
            </div>
          )}
          {quoteSaved === false && exactQuoteValue === "false" && (
            <div
              onClick={() => navigate("/device/Qestions")}
              className="bg-[#EC2752] rounded-lg cursor-pointer w-1/2 sm:max-w-[200px] flex justify-between px-2 text-white items-center"
            >
              <p className="p-2 mx-auto text-lg font-medium ">
                Get Exact Value
              </p>
            </div>
          )}
          {quoteSaved === true && (
            <div
              onClick={() => navigate("/selectdevicetype")}
              className="bg-[#EC2752] rounded-lg cursor-pointer w-1/2 sm:max-w-[200px] flex justify-between px-2 text-white items-center"
            >
              <p className="p-2 mx-auto text-lg font-medium ">Return To Home</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceQuote;
