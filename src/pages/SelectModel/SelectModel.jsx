import React, { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import unicorn from "../../assets/unicorn.png";
import FAQ from "../../components/FAQ";
import styles from "./SelectModel.module.css";
import User_Logo from "../../assets/User_Logo.jpg";
import { useNavigate } from "react-router";
import mobileLogo from "../../assets/mobile-logo.png";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { resetState } from "../../store/slices/QNAslice";
import store from "../../store/store";
import { useQuestionContext } from "../../components/QuestionContext";
import apple_watch from "../../assets/apple_watch.png";

const SelectModel = () => {
  const [userName, setUserName] = useState();
  const [modelData, setModelData] = useState();
  const { resetState } = useQuestionContext();
  const [phoneFrontPhoto, setPhoneFrontPhoto] = useState(() => {
    const phoneImg = JSON.parse(sessionStorage.getItem("dataModel"));
    return (
      phoneImg.models?.phonePhotos?.front ||
      phoneImg.models?.phonePhotos?.upFront
    );
  });
  const [selectedModalDetails, setSelectedModalDetails] = useState(() => {
    const modelConfigData = JSON.parse(
      sessionStorage.getItem("dataModelConfig")
    );
    return modelConfigData
      ? { ...modelConfigData, selectedConfig: modelConfigData.config[0] }
      : null;
  });

  //for making dummmy image
  const Device = sessionStorage.getItem("DeviceType");
  const Dummy_img =
    Device === "Mobile"
      ? "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
      : apple_watch;
  const [selectedConfig, setSelectedConfig] = useState(() => {
    const modelConfigData = JSON.parse(
      sessionStorage.getItem("dataModelConfig")
    );
    return modelConfigData ? modelConfigData.config[0] : null;
  });
  const [configData, setConfigData] = useState();

  const navigate = useNavigate();
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);

    const data = JSON.parse(sessionStorage.getItem("dataModel"));
    setModelData(data);
    const modelConfigData = JSON.parse(
      sessionStorage.getItem("dataModelConfig")
    );
    setConfigData(modelConfigData);

    setSelectedConfig(modelConfigData?.config[0]);
  }, []);

  const handleConfigClick = (configItem) => {
    setSelectedConfig(configItem);
    setSelectedModalDetails((prevDetails) => ({
      ...prevDetails,
      selectedConfig: configItem,
    }));
  };

  const handleExactValue = () => {
    const data = JSON.parse(sessionStorage.getItem("dataModel"));
    const updatedData = {
      ...data,
      models: {
        ...data.models,
        config: selectedConfig,
      },
    };
    sessionStorage.setItem("dataModel", JSON.stringify(updatedData));

    store.dispatch({ type: "RESET_STATE" });
    resetState();

    if (Device === "Mobile") {
      navigate("/device/Qestions");
    } else {
      navigate("/watchQs");
    }
  };

  const handleQuickQuote = () => {
    const data = JSON.parse(sessionStorage.getItem("dataModel"));
    const updatedData = {
      ...data,
      models: {
        ...data.models,
        config: selectedConfig,
      },
    };
    sessionStorage.setItem("dataModel", JSON.stringify(updatedData));
    store.dispatch({ type: "RESET_STATE" });
    resetState();
    if (Device === "Mobile") {
      navigate("/quickquote");
    } else {
      console.log("watch");
    }
  };

  return (
    <div className={`bg-white min-h-screen`}>
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="flex items-center justify-between w-full ">
          <ProfileBox />
          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-28 "
            src={Grest_Logo}
            alt="app logo"
          />
        </div>
      </div>

      <div className={styles.select_model_wrap}>
        {/* <div className={styles.mobile_card}>
          <img
            className=""
            src={
              phoneFrontPhoto
                ? phoneFrontPhoto
                : "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
            }
            alt=""
          />
        </div> */}
        <div className={`flex flex-col ${styles.product_details_wrap}`}>
          <div className={` ${styles.modelCard}`}>
            <div className={` ${styles.mobile_img_wrap}`}>
              <img
                className="max-w-[128px] max-h-[130px]"
                src={phoneFrontPhoto ? phoneFrontPhoto : Dummy_img}
                // src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjX4AzMXjxyVKyfHZNlt877tnGHoEoDqOlA&usqp=CAU"
                alt=""
              />
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xl font-medium">{modelData?.models?.name}</p>
              </div>

              <div>
                <p>Get Upto</p>
                <p className="font-bold text-2xl md:text-4xl text-[#EC2752]">
                  {selectedConfig?.price ? `₹${selectedConfig.price}` : "₹6000"}
                </p>
              </div>
              {Device !== "Watch" && (
                <div className="flex flex-wrap gap-2">
                  {configData?.config?.map((configItem, index) => (
                    <button
                      key={index}
                      className={
                        selectedConfig === configItem
                          ? styles.button_checked
                          : styles.button_unchecked
                      }
                      onClick={() => handleConfigClick(configItem)}
                    >
                      {configItem.RAM}/{configItem.storage}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={`px-2 gap-3 ${styles.button_wrap} ${
              Device === "Watch" && "justify-start"
            }`}
          >
            {Device === "Mobile" && (
              <button
                onClick={handleQuickQuote}
                className="border-2 border-[#EC2752] w-[48%] bg-white text-[#EC2752]  text-[12px]  px-4 py-2 rounded"
              >
                Quick Quote
              </button>
            )}
            <button
              onClick={handleExactValue}
              className={`border-2 border-[#EC2752] bg-[#EC2752] text-white text-[12px] px-4 py-2 rounded ${
                Device === "Watch" ? "w-full" : "w-[48%]"
              }`}
            >
              Get Exact Value
            </button>
          </div>
          <div className="bg-[#FBF3CD] mx-2 py-2 px-1 mt-1 rounded-lg text-[10px]">
            <p>
              This price stated above depends on the condition of your product
              and is not final. The final price offer will be quoted at the
              diagnosis by our experts.
            </p>
          </div>
          {/* <div className="my-2">
            <p className="mx-2 my-2 text-3xl font-medium">Product Details</p>

            {selectedModalDetails && (
              <div
                className={`${styles.table} font-medium border-2 w-[22rem] mx-2 sm:w-[500px] `}
              >
                <div className="flex p-1 bg-gray-200 border-2">
                  <p>Core</p>
                  <p className="w-1/2 text-gray-600">
                    {selectedModalDetails?.core}
                  </p>
                </div>
                <div className="flex p-1">
                  <p>Back Camera</p>
                  <p className="w-1/2 text-gray-600">
                    {selectedModalDetails?.back_camera}
                  </p>
                </div>
                <div className="flex p-1 bg-gray-200 border-2">
                  <p className={`w-1/2`}>Storage</p>
                  <p className="w-1/2 text-gray-600">
                    {selectedModalDetails?.selectedConfig?.storage}
                  </p>
                </div>
                <div className="flex p-1">
                  <p>Chipset</p>
                  <p className="w-1/2 text-gray-600">
                    {selectedModalDetails?.chipset}
                  </p>
                </div>
              </div>
            )}
          </div> */}
          <div className="mx-2 mt-2">
            <div className="text-[#EC2752] font-semibold text-2xl mb-2">
              FAQ's
            </div>
            <FAQ />
          </div>
        </div>
      </div>
      {/* coupons */}

      {/* <div className=" bg-gradient-to-br from-[#f6cbd7] to-[#dd6887]  max-w-[400px] text-white rounded-md mx-4 px-2 py-4 ">
        <div></div>
        <div className="flex items-center justify-between gap-1">
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
      </div> */}
    </div>
  );
};

export default SelectModel;
