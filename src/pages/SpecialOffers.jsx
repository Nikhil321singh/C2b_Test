import React, { useEffect, useState } from "react";
import DevicePriceCards from "../components/DevicePriceCards";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuestionContext } from "../components/QuestionContext";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import { setOtpVerified } from "../store/slices/otpSlice";
import { useDispatch, useSelector } from "react-redux";
import User_Logo from "../assets/User_Logo.jpg";
import SummaryModal from "../components/SummaryModal";
import { CgSpinner } from "react-icons/cg";
import apple_watch from "../assets/apple_watch.png";
import toast from "react-hot-toast";
import { IoArrowBack } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";
export const CouponCard = ({ title, code, hanldePermanenet, isSelected }) => {
  return (
    <div
      className={`bg-gradient-to-br from-[#f4bdcd]   max-w-[400px]
       text-white rounded-md mx-4 px-2 py-4 ${
         isSelected ? "to-[#f70e4c]" : " to-[#dd6887]"
       }
      }
       `}
    >
      <div></div>
      <div
        className="flex items-center justify-between gap-1"
        onClick={hanldePermanenet}
      >
        <div className="rounded-full bg-white flex items-center justify-center border-2 h-[70px] w-[70px]">
          <img className="w-[75%]" src={GREST_LOGO} alt="" />
        </div>
        <div className="">
          <p className="font-bold  w-[80px] text-xl relative ]">{code}</p>
          <p className="text-sm pl-1 w-[160px] font-medium">{title}</p>
        </div>
        <div className="border-l-2 h-[80px]"></div>
        <div className="h-[80px] w-[80px] p-2 font-bold text-[20px] text-center">
          <p className="">Grab Offer</p>
        </div>
      </div>
    </div>
  );
};

//cupon card dynamic created discount
export const DynamicCouponCard = ({
  discount,
  hanldePermanenet,
  isSelected,
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-[#f4bdcd]   max-w-[400px]
       text-white rounded-md mx-4 px-2 py-4 ${
         isSelected === discount ? "to-[#f70e4c]" : " to-[#dd6887]"
       }
      }
       `}
    >
      <div></div>
      <div
        className="flex items-center justify-between gap-1"
        onClick={hanldePermanenet}
      >
        <div className="rounded-full bg-white flex items-center justify-center border-2 h-[70px] w-[70px]">
          <img className="w-[75%]" src={GREST_LOGO} alt="" />
        </div>
        <div className="">
          <p className="font-bold  w-[80px] text-xl relative ]">{`GRU${discount}`}</p>

          <p className="text-sm pl-1 w-[160px] font-medium">{`Unlock a ${discount} Bonus on Your Old Mobile Phone Trade-In!`}</p>
        </div>
        <div className="border-l-2 h-[80px]"></div>
        <div className="h-[80px] w-[80px] p-2 font-bold text-[20px] text-center">
          <p className="">Grab Offer</p>
        </div>
      </div>
    </div>
  );
};

async function hanldlejsx_pdf(leadData, setReceipt) {
    try {
console.log("store is", leadData?.store?.storeName);
  console.log("store is", leadData?.emailId);
    toast.success("Please wait, Creating Receipt to be sent!", {
      icon: <FaExclamationTriangle color="gold" />, // gold/yellow color
    });
  const dateString = leadData?.updatedAt;
  const formattedDate = new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const COMPANY_EMAIL = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_COMPANY_BUYBACK_EMAIL : import.meta.env.VITE_COMPANY_EMAIL;
  const WEBSITE_SHORT_NAME = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_BUYBACK_SHORT_NAME : import.meta.env.VITE_WEBSITE_SHORT_NAME;
    const maskEmail = (email) => {
    const [namee, domain] = email.split("@");
    const visibleLength = Math.ceil(namee?.length * 0.25);
    const maskedName = namee?.slice(0, namee?.length - visibleLength);
    const visibleName = namee?.slice(namee?.length - visibleLength);
    return `${maskedName.replace(/./g, "x")}${visibleName}@${domain}`;
  };
  const maskPhoneNumber = (phNumber) => {
    const visibleLength = Math.ceil(phNumber?.length * 0.25);
    const maskedSection = phNumber?.slice(
      0,
      phNumber.length - visibleLength
    );
    const visibleSection = phNumber?.slice(
      phNumber?.length - visibleLength
    );
    return `${maskedSection.replace(/./g, "x")}${visibleSection}`;
  };

      const userToken = sessionStorage.getItem("authToken");
      const payload = {
      maskedPhoneNumber: maskPhoneNumber(leadData?.phoneNumber),
      aadharNumber: leadData?.aadharNumber,
      uniqueCode: leadData.uniqueCode,
      maskedEmail: maskEmail(leadData?.emailId),
      name: leadData.name,
      courtJurisdiction:import.meta.env.VITE_COURT_ADDRESS,
      imeiNumber: leadData.documentId.IMEI,
      companyGstin:import.meta.env.VITE_COMPANY_GSTIN,
      phoneName: leadData.modelId.name,
      type: leadData?.modelId?.type,
      storeName: leadData.store.storeName,
      companyContact:import.meta.env.VITE_COMPANY_CONTACT,
      region: leadData.store.region,
      companyEmail:COMPANY_EMAIL,
      address: leadData.store.address,
      companyName:import.meta.env.VITE_COMPANY_NAME,
      storage: leadData?.storage,
      websiteShortName:WEBSITE_SHORT_NAME,
      RAM: leadData?.ram,
      formattedDate: formattedDate,
      logoUrl:import.meta.env.VITE_LOGO_ENDPOINT,
      price: leadData.price,
      companyAddress:import.meta.env.VITE_COMPANY_ADDRESS,
    };

  const { data } = await axios.post( import.meta.env.VITE_REACT_APP_ENDPOINT + "/api/receipt/generate", payload, {
      headers: {
        "Content-Type": "application/json",
        authorization: userToken
      },
    });
    // 📥 Trigger download
// 📥 Trigger download using Blob for better compatibility
    const response = await fetch(data.url);
    const blob = await response.blob();

    // Create a File object
    const file = new File([blob], "purchase_receipt.pdf", { type: "application/pdf" });

    // Set the file using the provided setter
    setReceipt(file);

    } catch (error) {
        console.error("Error generating or downloading PDF:", error);
  }
}

const SpecialOffers = () => {
  const storedDisableBtn = sessionStorage.getItem("disableBtn");
  const initialDisableBtn = storedDisableBtn
    ? JSON.parse(storedDisableBtn)
    : false;
  const discountAvailable = 0;
  const userToken = sessionStorage.getItem("authToken");
  const [discountData, setDiscountData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const responseData = useSelector((state) => state.responseData);
  const Price = useSelector((state) => state.responseData.price);
  const [isSelected, setIsSelected] = useState(null);
  const [extraBonus, setExtraBonus] = useState(0);
  const [disableBtn, setDisableBtn] = useState(initialDisableBtn);
  const [phonePrice, setPhonePrice] = useState(Price + responseData.bonus);
  const [receipt, setReceipt] = useState(null);
  const dispatch = useDispatch(false);
  const { setAnswers } = useQuestionContext();
  const leadId = sessionStorage.getItem("LeadId");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setOtpVerified(false));
  }, []);
  useEffect(() => {
    const getLeadData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/prospects/findLeadById?id=${leadId}`,
          {
            headers: { Authorization: userToken },
          }
        );
        hanldlejsx_pdf(data.data, setReceipt);
      } catch (err) {
        console.log(err);
      }
    };
    getLeadData()
    }, []);
  const handleViewSummary = () => {
    const bonus = Number(phonePrice) - Number(Price);
    setExtraBonus(bonus);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/discounts/findByLeadId?leadId=${leadId}`,
        { headers: { authorization: userToken } }
      )
      .then((res) => {
        setDiscountData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleOffer = (number) => {
    const finalPayload = {
      leadId: leadId,
      discount: number,
    };
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/discounts/applyDiscount`,
        finalPayload,
        { headers: { authorization: userToken } }
      )
      .then((res) => {
        const newPrice = res.data.data.price + discountAvailable;
        console.log("dasd", res.data.data);
        localStorage.setItem("ItemPrice", newPrice);
        setPhonePrice(newPrice);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const navigateHome = () => {
    if (disableBtn) {
      setTimeout(() => {
        navigate("/selectPhone");
        sessionStorage.setItem("disableBtn", JSON.stringify(false));
        sessionStorage.setItem("myMessageKey", "");
      }, 30000);
    } else {
      console.log("clicked");
    }
  };


  const handleSubmit = () => {
    if (!receipt) {
      toast.error("Please wait purchase receipt is being created");
      return;
    }
    setIsLoading(true);
    const userIdToken = sessionStorage.getItem("authToken");
    const LeadId = sessionStorage.getItem("LeadId");
    const formData = new FormData();
    formData.append("id", LeadId);
    formData.append("bonusPrice", responseData.bonus);
    formData.append("file", receipt);
    axios
      .post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/questionnaires/item-purchased`,
        formData,
        { headers: { Authorization: userIdToken, "Content-Type": "multipart/form-data" } }
      )
      .then((response) => {
        setAnswers([]);
        sessionStorage.setItem("messageReceived", response.data.message);
        sessionStorage.setItem("disableBtn", JSON.stringify(true));
        setDisableBtn(true);
        navigate("/productsold");
        navigateHome();
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const hanldePermanenet = (code) => {
    if (isSelected === code) {
      setIsSelected("0");
    } else {
      setIsSelected(code);
    }
  };

  useEffect(() => {
    if (isSelected === "0") {
      handleOffer(0.00001);
    }
    if (isSelected === "GRU250") {
      handleOffer(250);
    } else if (isSelected === "GRU500") {
      handleOffer(500);
    } else {
      handleOffer(isSelected);
    }
  }, [isSelected]);

  return (
    <div className="min-h-screen mb-10 overflow-y-auto bg-white">
      <SubSpecialOffers
        navigate={navigate}
        phonePrice={phonePrice}
        Price={Price}
        hanldePermanenet={hanldePermanenet}
        isSelected={isSelected}
        discountData={discountData}
        handleViewSummary={handleViewSummary}
        handleSubmit={handleSubmit}
        receipt={receipt}
        isLoading={isLoading}
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        extraBonus={extraBonus}
      />
    </div>
  );
};

const SubSpecialOffers = ({
  phonePrice,
  Price,
  hanldePermanenet,
  isSelected,
  discountData,
  handleViewSummary,
  receipt,
  handleSubmit,
  isLoading,
  showModal,
  handleCloseModal,
  extraBonus,
}) => {
  const navigate = useNavigate();
  const Device = sessionStorage.getItem("DeviceType");
  const DummyImg =
    Device === "CTG1"
      ? "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
      : apple_watch;
  const phoneImg = JSON.parse(sessionStorage.getItem("dataModel"));
  const phoneFrontPhoto =
    phoneImg?.models?.phonePhotos?.front ||
    phoneImg?.models?.phonePhotos?.upFront;
  const dataModelInfo = JSON.parse(sessionStorage.getItem("dataModel"));
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  return (
    <div>
    <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER header">
      <div className="flex items-center justify-between w-full pr-4">
        <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => navigate(-1)}
          className="text-xs ml-2 flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full"
          >
        <IoArrowBack
          size={24}
        />
        </button>
        <img
          onClick={() => navigate("/selectdevicetype")}
          className="w-40"
          src={GREST_LOGO}
          alt="app logo"
        />
        </div>
          <p className=" text-base md:text-xl">{LoggedInUser?.name}</p>
          <img className="w-[30px]" src={User_Logo} alt="" />
      </div>
    </div>
      <div className="w-[90%] md:w-[70%] mx-auto mt-4  ">
        <p className="mb-2 text-lg font-medium">
          The best price for your phone is:
        </p>
        <DevicePriceCards
          phonePhoto={phoneFrontPhoto ? phoneFrontPhoto : DummyImg}
          model={dataModelInfo?.models?.name}
          price={phonePrice}
          ram={dataModelInfo?.models?.config?.RAM}
          storage={dataModelInfo?.models?.config?.storage}
          type={dataModelInfo?.models?.type}
        />
      </div>
      <div className="fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2 ">
        <div className="flex justify-between text-lg font-medium">
          <p className="text-xl">₹{Number(phonePrice)}</p>
          <p
            onClick={handleViewSummary}
            className="text-primary cursor-pointer"
          >
            View Summary
          </p>
        </div>
        <div
          onClick={receipt ? handleSubmit : null} // Prevent click if receipt is missing
          className={`bg-primary relative text-center py-1 px-2 rounded-lg flex justify-between text-white items-center 
            ${!receipt ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"}
          `}
        >
          {isLoading && (
            <CgSpinner
              size={20}
              className="absolute left-[30%] top-[8px] mt-1 animate-spin"
            />
          )}
          <p className="w-full p-1 text-xl font-medium">Sell Now</p>
        </div>
      </div>
      <SummaryModal
        show={showModal}
        price={Price}
        sellingPrice={phonePrice}
        onClose={handleCloseModal}
        bonus={extraBonus}
      />
    </div>
  );
};

export default SpecialOffers;
