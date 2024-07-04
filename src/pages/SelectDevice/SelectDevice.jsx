import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import styles from "./SelectDevice.module.css";
import AppFooter from "../../components/AppFooter";
import apple_watch from "../../assets/apple_watch.png";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BeatLoader } from "react-spinners";
import { data } from "autoprefixer";

const DeviceType = sessionStorage.getItem("DeviceType");
console.log(DeviceType);
export const SeriesFilter = ({
  selectedBtn,
  setSelectedBtn,
  setSeriesType,
}) => {
  const categories = [
    { name: "All", apiType: "" },
    { name: "SE", apiType: "SE" },
    { name: "Series 6", apiType: "Series 6" },
    { name: "Series 7", apiType: "Series 7" },
    { name: "Series 8", apiType: "Series 8" },
    { name: "Series 9", apiType: "Series 9" },
    { name: "Ultra", apiType: "Ultra" },
    { name: "Ultra 2", apiType: "Ultra 2" },
  ];
  const catContainerRef = useRef(null);

  const scrollCategory = (direction) => {
    const scrollAmount = 200;

    if (catContainerRef.current) {
      if (direction === "right") {
        catContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      } else if (direction === "left") {
        catContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className={`${styles.select_button_wrap}`}>
      <button
        onClick={() => scrollCategory("left")}
        className={`translate-x-3 ${styles.scroll_button}`}
      >
        <IoIosArrowBack size={30} />
      </button>
      <div
        ref={catContainerRef}
        className={`flex flex-shrink-0 px-1 gap-4 overflow-x-auto scroll-smooth scrollbar-hide ${styles.select_button_box}`}
      >
        {categories.map((category, index) => (
          <div
            className={`${
              selectedBtn === category.name
                ? styles.button_checked
                : styles.button_unchecked
            } text-xs font-medium text-nowrap flex-grow flex-shrink-0 px-0 w-[70px]`}
            key={index}
            onClick={() => {
              setSelectedBtn(category.name);
              setSeriesType(category.apiType);
            }}
          >
            <p className="px-0 mx-0">{category.name}</p>
          </div>
        ))}
      </div>
      <button
        className={`-translate-x-3 ${styles.scroll_button}`}
        onClick={() => scrollCategory("right")}
      >
        <IoIosArrowForward size={30} />
      </button>
    </div>
  );
};

const SelectDevice = () => {
  const [modelInfo, setModelInfo] = useState();
  const userToken = sessionStorage.getItem("authToken");
  const Device = sessionStorage.getItem("DeviceType");
  const [selectedBtn, setSelectedBtn] = useState("All");
  const [seriesType, setSeriesType] = useState("");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const DummyImg =
    Device === "Mobile"
      ? "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
      : apple_watch;
  const { brandId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setIsTableLoaded(true);
    let config = {
      method: 'post',
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/brands/getSelectedBrandModels`,
      headers: { 
        'Authorization': `${userToken}`,
      },
      data : {
        "brandId": brandId,
        "deviceType": Device,
        "search": seriesType
      }
    };
    console.log(config)
    axios.request(config)
    .then((res) => {
      console.log("asd", res?.data);
      setModelInfo(res.data);
      setIsTableLoaded(false);
    })
    .catch((err) => {
      console.log(err);
      setIsTableLoaded(false);
    });
  }, [seriesType]);

  const handleDeviceClick = (model) => {
    const data = JSON.parse(sessionStorage.getItem("dataModel"));
    const updatedData = {
      ...data,
      models: model,
    };
    sessionStorage.setItem("dataModel", JSON.stringify(updatedData));
    sessionStorage.setItem("dataModelConfig", JSON.stringify(model));
    navigate("/selectmodel");
  };
  return (
    <div className="flex flex-col min-h-screen pb-16 bg-white">
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
        {isTableLoaded && (
          <div className="fixed top-0 left-0 z-100 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
            <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
          </div>
        )}
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
      <div className="ml-5">
        {Device === "Mobile" ? (
          <p className="text-2xl font-bold">Select Mobile Phone</p>
        ) : (
          <p className="text-2xl font-bold">Select Smartwatches</p>
        )}
      </div>
      {Device === "Watch" && brandId === "653cbbeae2eb1f468a1dd7ea" && (
        <SeriesFilter
          selectedBtn={selectedBtn}
          setSelectedBtn={setSelectedBtn}
          setSeriesType={setSeriesType}
        />
      )}
      <div
        className={` ${styles.cardsContainer} m-4 shrink flex flex-wrap justify-center gap-2 md:gap-8`}
      >
        {modelInfo && modelInfo.length === 0 && (
          <div className="mt-[50%] font-bold text-4xl">...comming soon...</div>
        )}
        {modelInfo &&
          modelInfo.map((model) => (
            <div
              key={model._id}
              className={`${styles.card} w-[30%] md:w-[20%] lg:w-[15%] xl:w-[16%] gap-2 flex flex-col items-center px-2 py-4 text-center`}
              onClick={() => handleDeviceClick(model)}
            >
              {model?.phonePhotos?.front && (
                <img
                  className="max-w-[90px] mb-2 h-[90px]"
                  src={
                    model?.phonePhotos?.front
                      ? model?.phonePhotos?.front
                      : DummyImg
                  }
                  alt=""
                />
              )}
              {!model?.phonePhotos?.front && model?.phonePhotos?.upFront && (
                <img
                  className="w-[38px] mb-2 h-[82px] mt-[2px]"
                  src={
                    model?.phonePhotos?.upFront
                      ? model?.phonePhotos?.upFront
                      : DummyImg
                  }
                  alt=""
                />
              )}

              {!model?.phonePhotos?.front && !model?.phonePhotos?.upFront && (
                <img className="w-[80px] mb-2 h-[90px]" src={DummyImg} alt="" />
              )}
              <p className="text-[11px] font-medium">{model.name}</p>
            </div>
          ))}
      </div>

      <AppFooter />
    </div>
  );
};

export default SelectDevice;
