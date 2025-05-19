import React, { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { setLeadOTPData, setResponseData } from "../../store/slices/responseSlice";
import { useDispatch } from "react-redux";
import watch from "../../assets/apple_watch.png";
import { setOtpVerified } from "../../store/slices/otpSlice";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";

const currentDomain = window.location.origin;
import axios from "axios";
import toast from "react-hot-toast";
const quoteSaved = "Quote Saved";
export const DeleteModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed z-50 flex items-center justify-center w-full h-full mx-2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-50"></div>
      <div className="bg-white border border-gray-300 p-6 w-96 max-w-[90%] mx-auto rounded-md z-10">
        <p className="mb-4 text-lg font-semibold">Do you want to delete?</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="bg-primary text-white px-4 py-2 rounded mr-2"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="border border-primary text-primary px-4 py-2 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

async function handlejsx_pdf(item) {
  try {
    console.log("store is", item);
    toast.success("Please wait, Receipt will be downloaded shortly!", {
      icon: <FaExclamationTriangle color="gold" />, // gold/yellow color
    });
    const dateString = item.updatedAt;
    const formattedDate = new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const COMPANY_EMAIL = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_COMPANY_BUYBACK_EMAIL : import.meta.env.VITE_COMPANY_EMAIL;
    const WEBSITE_SHORT_NAME = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_BUYBACK_SHORT_NAME : import.meta.env.VITE_WEBSITE_SHORT_NAME;
  const maskPhoneNumber = (phNumber) => {
    const visibleLength = Math.ceil(phNumber?.length * 0.25);
    const visibleSection = phNumber?.slice(
      phNumber?.length - visibleLength
    );
    const maskedSection = phNumber?.slice(
      0,
      phNumber.length - visibleLength
    );
    return `${maskedSection.replace(/./g, "x")}${visibleSection}`;
  };

  const maskEmail = (email) => {
    const [namee, domain] = email.split("@");
    const visibleLength = Math.ceil(namee?.length * 0.25);
    const visibleName = namee?.slice(namee?.length - visibleLength);
    const maskedName = namee?.slice(0, namee?.length - visibleLength);
    return `${maskedName.replace(/./g, "x")}${visibleName}@${domain}`;
  };

    const payload = {
      companyContact:import.meta.env.VITE_COMPANY_CONTACT,
      maskedPhoneNumber: maskPhoneNumber(item?.phoneNumber),
      logoUrl:import.meta.env.VITE_LOGO_ENDPOINT,
      aadharNumber: item?.aadharNumber,
      uniqueCode: item.uniqueCode,
      maskedEmail: maskEmail(item?.emailId),
      companyName:import.meta.env.VITE_COMPANY_NAME,
      websiteShortName:WEBSITE_SHORT_NAME,
      name: item.name,
      imeiNumber: item.doc.IMEI,
      phoneName: item.model.name,
      type: item?.model?.type,
      companyAddress:import.meta.env.VITE_COMPANY_ADDRESS,
      storeName: item.store.storeName,
      region: item.store.region,
      address: item.store.address,
      storage: item.model.config?.storage,
      RAM: item.model.config?.RAM,
      formattedDate: formattedDate,
      price: item.price,
      companyGstin:import.meta.env.VITE_COMPANY_GSTIN,
      companyEmail:COMPANY_EMAIL,
      courtJurisdiction:import.meta.env.VITE_COURT_ADDRESS,
    };

    // 🔁 Make API call to backend to generate and upload PDF
    const { data } = await axios.post( import.meta.env.VITE_REACT_APP_ENDPOINT + "/api/receipt/generate", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    // 📥 Trigger download
// 📥 Trigger download using Blob for better compatibility
    const response = await fetch(data.url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "purchase_receipt.pdf"; // Suggested filename
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl); // Cleanup
  } catch (error) {
    console.error("Error generating or downloading PDF:", error);
  }
}

const OrdersCard = ({
  allData,
  itemData,
  title,
  customerName,
  customerMobile,
  customerEmail,
  deviceName,
  savedBy,
  deviceRam,
  deviceStorage,
  price,
  quoteId,
  dateTime,
  phonePhoto,
  handleDelete,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deviceSelected = sessionStorage.getItem("DeviceType");

  const formatDateTime = (dateTimeString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return new Intl.DateTimeFormat("en-IN", options).format(
      new Date(dateTimeString)
    );
  };

  useEffect(() => {
    console.log("card");
  }, []);

  const isExpired = () => {
    const createdDate = new Date(dateTime);
    const currentDate = new Date();
    const timeDiff = currentDate - createdDate;
    const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const threeDays = 6 * oneDay; // 6 days in milliseconds

    if (title === quoteSaved) {
      return timeDiff > oneDay;
    } else if (title === "Order Saved") {
      return timeDiff > threeDays;
    } else {
      return false;
    }
  };
  const handleInitiate = () => {
    if (isExpired()) {
      return;
    }
    if (title === quoteSaved) {
      const detail = {
        models: itemData.lead?.model,
        phoneNumber: customerMobile,
        status: quoteSaved,
        customerName: customerName,
      };
      sessionStorage.setItem("dataModel", JSON.stringify(detail));
      const responseData = {
        grade: "",
        id: itemData.lead_id,
        price: price,
        uniqueCode: quoteId,
        bonus: 0,
      };
      dispatch(setResponseData(responseData));
      sessionStorage.setItem("LeadId", itemData?.lead_id);
      sessionStorage.setItem("responsedatadata", JSON.stringify(responseData));
      navigate("/device/Qestions");
    } else {
      const otpData = {
        name: customerName,
        email: customerEmail,
        phone: customerMobile,
      };
      localStorage.setItem("otpData", JSON.stringify(otpData));
      const detail = {
        models: itemData.lead?.model,
        customerName: customerName,
      };
      sessionStorage.setItem("dataModel", JSON.stringify(detail));
      const responseData = {
        grade: "",
        id: itemData.lead_id,
        price: Number(itemData.lead?.price) - Number(itemData.lead?.bonusPrice),
        uniqueCode: quoteId,
        bonus: Number(itemData.lead?.bonusPrice),
      };

      dispatch(setResponseData(responseData));
      dispatch(setLeadOTPData(otpData));
      dispatch(setOtpVerified(false));
      sessionStorage.setItem("otpData", JSON.stringify(otpData));
      sessionStorage.setItem("LeadId", itemData?.lead_id);
      sessionStorage.setItem("responsedatadata", JSON.stringify(responseData));
      navigate("/inputnumber");
    }
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteModal(false);
    handleDelete(itemData._id);
  };

  const handleDeleteCancelled = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="p-2 mx-2 bg-white rounded-lg relative">
      {isExpired() && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 bg-white">
          <div className="text-black text-2xl font-bold border-4 border-primary px-4 py-2 rounded-md">
            Expired
          </div>
        </div>
      )}
      <div className="flex items-center justify-between p-2 border-b-2 border-gray-300 border-dashed">
        <div className="flex items-center py-1 px-2 text-white bg-primary rounded-xl">
          <p className="text-sm font-medium">{title}</p>
        </div>
        {title === "Order Completed" && (
            <div onClick={() => handlejsx_pdf(allData)} className="flex items-center h-full px-4 text-white bg-[#EC2752] rounded-xl cursor-pointer">
              <FaDownload size={15} />
            </div>
          )}
        <div className="">
          <p className="text-sm font-medium text-gray-400">
            {formatDateTime(dateTime)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 border-b-2 border-gray-300 border-dashed">
        <div className="w-[20%]">
          <img
            className="w-[100%] h-[60px]"
            src={deviceSelected === "Watch" ? watch : phonePhoto}
            alt="device image"
          />
        </div>
        <div className="font-medium w-[78%]">
          <p className="text-black text-wrap">
            {deviceName}
            {deviceSelected === "CTG1" && `(${deviceRam}/${deviceStorage})`}
          </p>
          <p className="text-primary">₹{price}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between p-2 text-sm font-medium">
        <div className="w-1/2 ">
          <p className="text-gray-400">Customer Name</p>
          <p>{customerName}</p>
        </div>
        <div className="w-1/2">
          <p className="text-gray-400">Customer Mobile</p>
          <p>{customerMobile}</p>
        </div>
        <div className="w-1/2 mt-2">
          <p className="text-gray-400">Quote Id</p>
          <p>{quoteId}</p>
        </div>
        <div className="w-1/2 mt-2">
          <p className="text-gray-400">Saved By</p>
          <p>{savedBy}</p>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onCancel={handleDeleteCancelled}
          onConfirm={handleDeleteConfirmed}
        />
      )}
      {title !== "Order Completed" && !isExpired() && (
        <div className="flex items-center justify-between gap-2 p-2 font-medium">
          <div
            onClick={handleDeleteConfirmation}
            className="px-3 py-2 border-2 rounded-lg"
          >
            <button>
              <RiDeleteBin6Line size={20} />
            </button>
          </div>
          <div className="w-[80%] text-center bg-primary py-2 rounded-lg">
            <button onClick={handleInitiate} className="text-white ">
              Initiate Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersCard;
