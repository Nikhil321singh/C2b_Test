import React, { useState } from "react";
import styles from "./StoreListing.module.css";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";

const succTextColor = "text-green-500";
const failTextColor = "text-[#EC2752]";
const token = sessionStorage.getItem("authToken");
const initStoreForm = {
  storeName: "",
  region: "",
  email: "",
  uniqueId: "",
  contactNumber: "",
  address: "",
}

const StoreListing = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initStoreForm);
  const [errMsg, setErrMsg] = useState("");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setIsTableLoaded(true);
    const data = JSON.stringify({
      storeName: formData.storeName,
      uniqueId: formData.uniqueId,
      email: formData.email,
      contactNumber: formData.contactNumber,
      region: formData.region,
      address: formData.address,
    });
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/create`,
      headers: { Authorization: token },
      data: data,
    };
    axios
      .request(config)
      .then((response) => {
        setErrMsg("Successfully added new store");
        setSucBox(true);
        setIsTableLoaded(false);
        navigate("/storelistingtable");
      })
      .catch((error) => {
        setErrMsg("Failed to add store");
        setFailBox(true);
        setIsTableLoaded(false);
      });
  };

  return (
    <div className="min-h-screen  pb-8 bg-[#F5F4F9]">
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
      {(sucBox || failBox) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div
            className={`${styles.err_mod_box} ${
              sucBox ? succTextColor : failTextColor
            }`}
          >
            {sucBox ? (
              <IoIosCheckmarkCircle
                className={sucBox ? succTextColor : failTextColor}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={sucBox ? succTextColor : failTextColor}
                size={90}
              />
            )}
            <h6 className={sucBox ? succTextColor : failTextColor}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
                setFailBox(false);
              }}
              className={
                sucBox ? "bg-green-500 text-white" : "bg-[#EC2752] text-white"
              }
            >
              Okay
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
        }}
        className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
      >
        <div className="flex flex-col  w-[900px]">
          <div className="mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
            <p className="text-4xl font-bold">Store Listing</p>
            <p className="text-lg">All fields marked with * are required</p>
          </div>
          <div className="flex flex-wrap gap-2 ml-10 mb-10">
            <button
              onClick={() => navigate("/storelistingtable")}
              className="font-medium text-sm text-white p-3 rounded bg-[#EC2752]"
            >
              View Detail
            </button>
          </div>
          <form className="ml-10 flex flex-col gap-4" onSubmit={submitHandler}>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Store Name*</span>
              <input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="border-2 px-2 py-2 rounded-lg outline-none"
                type="text"
                required={true}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Unique Id*</span>
              <input
                id="uniqueId"
                name="uniqueId"
                value={formData.uniqueId}
                onChange={handleChange}
                className="border-2 px-2 py-2 rounded-lg  outline-none "
                type="text"
                required={true}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2 ">
              <span className="font-medium text-xl">Email*</span>
              <input
                id="email"
                name="email"
                minLength={6}
                value={formData.email}
                onChange={handleChange}
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="email"
                required={true}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Contact Number*</span>
              <input
                id="contactNumber"
                name="contactNumber"
                minLength={10}
                value={formData.contactNumber}
                onChange={handleChange}
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="number"
                required={true}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Region*</span>
              <input
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                required={true}
              />
            </div>
            <div className="flex flex-col w-[70%] gap-2">
              <span className="font-medium text-xl">Adddress*</span>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border-2 px-2 py-2 rounded-lg  outline-none"
                type="text"
                required={true}
              />
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className="font-medium text-sm text-white p-3 rounded bg-[#EC2752]"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreListing;
