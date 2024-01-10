import React, { useEffect, useRef, useState } from "react";
import useUserProfile from "../utils/useUserProfile";
import DevicePriceCards from "../components/DevicePriceCards";
import downArrow from "../assets/down.png";
import { useNavigate } from "react-router-dom";
import ContinueButton from "../components/ContinueButton";
import axios from "axios";
import { useQuestionContext } from "../components/QuestionContext";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import { setOtpVerified } from "../store/slices/otpSlice";
import { useDispatch } from "react-redux";
import User_Logo from "../assets/User_Logo.jpeg";
import { FaArrowRight } from "react-icons/fa";
import unicorn from "../assets/unicorn.png";
import SummaryModal from "../components/SummaryModal";
import { CgSpinner } from "react-icons/cg";
const SpecialOffers = () => {
  const [userName, setUserName] = useState();
  const [dataModel, setDataModel] = useState({});
  const [discount, setDiscount] = useState(0);
  const [discountData, setDiscountData] = useState([]);
  const [discountAvailable, setDiscountAvailable] = useState(0);
  const [radioBtnClicked, setRadioBtnClicked] = useState(null);
  const [dataModelInfo, setDataModelInfo] = useState();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //for table state even is page is refersh

  const storedDisableBtn = sessionStorage.getItem("disableBtn");
  const initialDisableBtn = storedDisableBtn
    ? JSON.parse(storedDisableBtn)
    : false;

  const [disableBtn, setDisableBtn] = useState(initialDisableBtn);

  //this for meeage even if page is refersh state is managed

  const storedMessage = sessionStorage.getItem("myMessageKey");
  const initialMessage = storedMessage || "";
  const [message, setMessage] = useState(initialMessage);

  const [phonePrice, setPhonePrice] = useState(
    localStorage.getItem("ItemPrice")
  );
  const [actualPhonePrice, setActualPhonePrice] = useState(
    localStorage.getItem("ItemPrice")
  );

  const dispatch = useDispatch(false);
  const profile = useUserProfile();
  const { setAnswers } = useQuestionContext();
  // const phonePrice = localStorage.getItem("ItemPrice");
  const leadId = sessionStorage.getItem("LeadId");
  const for_price = JSON.parse(sessionStorage.getItem("responsedatadata"));
  //for arrow key use
  const [disable, setDisable] = useState(true);
  //sue this in down api

  const navigate = useNavigate();

  const handleViewSummary = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);

    const dataInfo = JSON.parse(sessionStorage.getItem("dataModel"));
    setDataModelInfo(dataInfo);
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("dataModel");

    setDataModel(JSON.parse(data));

    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/discounts/findByLeadId?leadId=${leadId}`
      )
      .then((res) => {
        setDiscountData(res.data.data);
        // setDiscountAvailable(res.data.data[0].discount);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleBack() {
    if (disable) {
      navigate("/inputnumber");
    }
  }

  const handleOffer = () => {
    console.log("applied");

    const finalPayload = {
      leadId: leadId,
      discount: radioBtnClicked,
    };
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/discounts/applyDiscount`,
        finalPayload
      )
      .then((res) => {
        const newPrice = res.data.data.price + discountAvailable;
        localStorage.setItem("ItemPrice", newPrice);
        setPhonePrice(newPrice);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //for navigate hom e
  const navigateHome = () => {
    if (disableBtn) {
      setTimeout(() => {
        navigate("/selectPhone");
        sessionStorage.setItem("disableBtn", JSON.stringify(false));
        sessionStorage.setItem("myMessageKey", "");
      }, 30000);
      // sessionStorage.setItem("otpverified", "");
      dispatch(setOtpVerified(false));
    } else {
      console.log("clicked");
    }
  };
  //call to chek is used alredy click it or not
  // navigateHome();

  const handleSubmit = () => {
    setIsLoading(true);
    setDisable(false);
    const userToken = sessionStorage.getItem("authToken");
    const LeadId = sessionStorage.getItem("LeadId");
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/item-purchased`,
        { id: 122222 },
        {
          headers: {
            Authorization: `${userToken}`,
          },
        }
      )
      .then((response) => {
        setAnswers([]);
        sessionStorage.setItem("myMessageKey", response.data.message);
        setMessage(response.data.message);

        sessionStorage.setItem("disableBtn", JSON.stringify(true));
        setDisableBtn(true);

        navigate("/productsold");
        // navigateHome();
      })
      .catch((err) => {
        console.log(err);
        setDisable(true);
        setIsLoading(false);
        // remove this after api integration
        navigate("/productsold");
      });
  };

  const handleNewSubmit = () => {
    navigate("/");
  };

  console.log(discountData);

  return (
    <div className="bg-white min-h-screen overflow-y-auto">
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
      {/* older card */}
      <div className="w-[90%] md:w-[70%] mx-auto mt-4  ">
        <p className="mb-2 font-medium text-lg">
          The best price for your phone is:
        </p>
        <DevicePriceCards
          model={dataModelInfo?.models?.name}
          price={20000}
          ram={dataModelInfo?.models?.config?.RAM}
          storage={dataModelInfo?.models?.config?.storage}
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="mx-4">
          <p className="font-medium">Special Offers & Benefits</p>
          <p className="text-[#EC2752] font-medium">
            We have something to make you happier!
          </p>
        </div>
        <div className=" bg-gradient-to-br from-[#f4bdcd] to-[#dd6887]  max-w-[400px] text-white rounded-md mx-4 px-2 py-4 ">
          <div></div>
          <div className="flex justify-between items-center gap-1">
            <div className="rounded-full bg-white flex items-center justify-center border-2 h-[70px] w-[70px]">
              <img className="w-[75%]" src={unicorn} alt="" />
            </div>
            <div className="">
              <p className="font-bold  w-[80px] text-xl relative ]">GRU250</p>
              <p className="text-sm pl-1 w-[160px] font-medium">
                Unlock a ₹250 Bonus on Your Old Mobile Phone Trade-In!
              </p>
            </div>
            <div className="border-l-2 h-[80px]"></div>
            <div className="h-[80px] w-[80px] p-2 font-bold text-[20px] text-center">
              <p className="">Grab Offer</p>
            </div>
          </div>
        </div>
        <div className=" bg-gradient-to-br from-[#f4bdcd] to-[#dd6887]  max-w-[400px] text-white rounded-md mx-4 px-2 py-4 ">
          <div></div>
          <div className="flex justify-between items-center gap-1">
            <div className="rounded-full bg-white flex items-center justify-center border-2 h-[70px] w-[70px]">
              <img className="w-[75%]" src={unicorn} alt="" />
            </div>
            <div className="">
              <p className="font-bold  w-[80px] text-xl relative ]">GRU500</p>
              <p className="text-sm pl-1 w-[160px] font-medium">
                Unlock a ₹500 Bonus on Your Old Mobile Phone Trade-In!
              </p>
            </div>
            <div className="border-l-2 h-[80px]"></div>
            <div className="h-[80px] w-[80px] p-2 font-bold text-[20px] text-center">
              <p className="">Grab Offer</p>
            </div>
          </div>
        </div>
      </div>
      {/* 
      <div className="w-[90%] md:w-[70%] mx-auto mt-4  ">
        {discountData ? (
          <div className=" bg-white  rounded-lg p-[20px] ">
            <p className="text-lg">Special Offers & Benefits</p>
            <p className="text-[#EC2752]">
              We have something to make you happier!
            </p>
            <div className="flex gap-4 mt-2">
              {discountData.map((val) => (
                <div
                  className="border-2 flex gap-1 rounded-lg w-[200px] shadow-md p-2"
                  key={val._id}
                >
                  <div>
                    <input
                      type="radio"
                      name="gift"
                      value={val.discount}
                      onChange={(e) => setRadioBtnClicked(e.target.value)}
                    />
                  </div>
                  <div>
                    <h1>{val.discription}</h1>
                    <h2>Get ₹{val.discount} extra for Amazon</h2>
                    <div>
                      <p>You Get</p>
                      <p>₹{parseFloat(for_price.price) + val.discount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleOffer}
              className="mt-2 border-2 py-1 px-2 rounded text-white bg-[#EC2752]"
            >
              Apply Offer
            </button>
          </div>
        ) : (
          <spam>waiting for upcoming offer</spam>
        )}
      </div>
 */}

      {/* success message on selling */}
      {/* {message && <h3 className="mt-4 text-xl text-center">{message}</h3>} */}
      {/* {!disableBtn ? (
        <div onClick={handleSubmit}>
          <ContinueButton buttonName="Sell Now" />
        </div>
      ) : (
        <></>
      )} */}
      <div className="border-t-2 bg-white flex flex-col gap-2 fixed bottom-0 w-full  p-4 ">
        <div className="flex justify-between text-lg font-medium">
          <p className="text-xl">₹20000</p>
          <p
            onClick={handleViewSummary}
            className="text-[#EC2752] cursor-pointer"
          >
            View Summary
          </p>
        </div>
        <div
          onClick={handleSubmit}
          className="bg-[#EC2752] px-2 rounded-lg cursor-pointer flex justify-between  text-white items-center"
        >
          {isLoading && <CgSpinner size={20} className="mt-1 animate-spin" />}
          <p className="font-medium p-2 w-full">Sell Now</p>
          <FaArrowRight />
        </div>
      </div>
      <SummaryModal show={showModal} onClose={handleCloseModal} />
    </div>
  );
};

export default SpecialOffers;
