import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import styles from "./SelectDevice.module.css";
import AppFooter from "../../components/AppFooter";
import apple_watch from "../../assets/apple_watch.png";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BeatLoader } from "react-spinners";
import { CiSearch, CiBarcode } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import searchImage from "../../assets/mobileSearch.png";

const data = JSON.parse(sessionStorage.getItem("dataModel"));

const DeviceType = sessionStorage.getItem("DeviceType");
console.log(DeviceType);

export const SeriesFilter = ({
  selectedBtn,
  setSelectedBtn,
  setSeriesType,
  seriesList
}) => {
  const categories = [
    { name: "All", seriesKey: "" },
    { name: "SE", seriesKey: "SE" },
    { name: "Series 6", seriesKey: "Series 6" },
    { name: "Series 7", seriesKey: "Series 7" },
    { name: "Series 8", seriesKey: "Series 8" },
    { name: "Series 9", seriesKey: "Series 9" },
    { name: "Ultra", seriesKey: "Ultra" },
    { name: "Ultra 2", seriesKey: "Ultra 2" },
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
        {seriesList.map((category, index) => (
          <div
            className={`${
              selectedBtn === category.name
                ? styles.button_checked
                : styles.button_unchecked
            } text-xs font-medium text-nowrap flex-shrink-0 px-0`}
            key={index}
            onClick={() => {
              setSelectedBtn(category.name);
              setSeriesType(category.seriesKey);
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
  const [modelInfo, setModelInfo] = useState([]);
  const userToken = sessionStorage.getItem("authToken");
  const Device = sessionStorage.getItem("DeviceType");
  const [selectedBtn, setSelectedBtn] = useState("All");
  const [seriesType, setSeriesType] = useState("");
  const [seriesList, setSeriesList] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);
  const [hideProject, setIsHideProject] = useState(true);

  const [imei, setImei] = useState("");
  const [modelsL, setModel] = useState([]);
  const DummyImg =
    Device === "Mobile"
      ? "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
      : apple_watch;
  const { brandId } = useParams();
  const navigate = useNavigate();

  const searchBoxSwitch = () => {
    setModel([]);
    setIsSearchBoxOpen(!isSearchBoxOpen);
    setIsHideProject(!hideProject);
  };

  useEffect(() => {
    setIsTableLoaded(true);
    const config = {
      method: "post",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/brands/getSelectedBrandModels`,
      headers: {
        Authorization: `${userToken}`,
      },
      data: {
        brandId: brandId,
        deviceType: Device,
        series: seriesType,
      },
    };
    console.log(config);
    axios
      .request(config)
      .then((res) => {
        console.log("asd", res?.data);
        setModelInfo(res.data.models);
        setSeriesList(res.data.seriesList);
        setIsTableLoaded(false);
      })
      .catch((err) => {
        console.log(err);
        setIsTableLoaded(false);
      });
  }, [seriesType]);

  const handleDeviceClick = (model) => {
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
        <div className="flex items-center justify-between w-full pr-2">
          <ProfileBox />
          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-40"
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
      {seriesList.length > 1 && <SeriesFilter
          selectedBtn={selectedBtn}
          setSelectedBtn={setSelectedBtn}
          setSeriesType={setSeriesType}
          seriesList={seriesList}
        />}
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
      {hideProject && (
        <div>
          <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
            {isTableLoaded && (
              <div className="fixed top-0 left-0 z-100 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                <BeatLoader
                  color={"#EC2752"}
                  loading={isTableLoaded}
                  size={15}
                />
              </div>
            )}
            <div className="flex items-center justify-between w-full pr-2">
              <ProfileBox />
              <img
                onClick={() => navigate("/selectdevicetype")}
                className="w-40"
                src={Grest_Logo}
                alt="app logo"
              />
            </div>
          </div>
          <div className="flex items-center ml-5 mt-5 mr-5">
            <div className="flex-grow">
              {Device === "Mobile" ? (
                <p className="text-2xl font-bold">Select Mobile Phone</p>
              ) : (
                <p className="text-2xl font-bold">Select Smartwatches</p>
              )}
            </div>
            <div className={styles.search_box_wrap} onClick={searchBoxSwitch}>
              <div
                className={`flex items-center p-2 mb-1 w-[100%] ${styles.search_box}`}
              >
                <div className="flex items-center">
                  <CiSearch size={20} className="inline ml-1" />
                </div>
                <input
                  placeholder="Search Products"
                  className="inline w-full mx-2 outline-none"
                  type="text"
                />
                <div className="flex items-center">
                  <CiBarcode size={20} className="inline mr-1 text-[#EC2752]" />
                </div>
              </div>
            </div>
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
              <div className="mt-[50%] font-bold text-4xl">
                ...coming soon...
              </div>
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
                  {!model?.phonePhotos?.front &&
                    model?.phonePhotos?.upFront && (
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

                  {!model?.phonePhotos?.front &&
                    !model?.phonePhotos?.upFront && (
                      <img
                        className="w-[80px] mb-2 h-[90px]"
                        src={DummyImg}
                        alt=""
                      />
                    )}
                  <p className="text-[11px] font-medium">{model.name}</p>
                </div>
              ))}
          </div>
        </div>
      )}
      <AppFooter />
    </div>
  );
};

export default SelectDevice;

const SearchBox = ({
  isSearchBoxOpen,
  searchBoxSwitch,
  setImei,
  imei,
  modelsL,
}) => {
  console.log("SearchBox Rendered", { isSearchBoxOpen, imei, modelsL });

  const [isScanOpen, setIsScanOpen] = useState(false);

  const handleDeviceClick = (model) => {
    const detail = { models: model };
    sessionStorage.setItem("dataModel", JSON.stringify(detail));
    sessionStorage.setItem("DeviceType", model.type);
    sessionStorage.setItem("dataModelConfig", JSON.stringify(model));
    navigate("/selectmodel");
    addPhoneView(model._id);
  };

  return (
    <React.Fragment>
      {isSearchBoxOpen && (
        <div className={`${styles.search_page} min-h-screen`}>
          <div className={styles.search_box_wrap}>
            <div className={`flex items-center p-2 mb-1 ${styles.search_box}`}>
              <div className="flex items-center" onClick={searchBoxSwitch}>
                <IoClose size={20} className="inline ml-1" />
              </div>
              <input
                placeholder="Search Product with Name/IMEI"
                className="inline w-full mx-2 outline-none"
                type="text"
                onChange={(e) => setImei(e.target.value)}
                value={imei}
                autoFocus={true}
              />
              <div
                className="flex items-center"
                onClick={() => setIsScanOpen(!isScanOpen)}
              >
                <CiBarcode size={20} className={"inline mr-1 text-[#EC2752]"} />
              </div>
            </div>
          </div>
          {imei.length > 0 && modelsL.length > 0 ? (
            <div
              className={`mx-auto mt-4 justify-center w-full flex flex-wrap gap-2 max-h-screen overflow-y-scroll pb-[15vh]`}
            >
              {modelsL.map((model) => (
                <div
                  key={model._id}
                  className={`w-[30%] h-auto gap-2 flex flex-col items-center px-2 py-4 text-center`}
                  style={{ boxShadow: "0 0 10px 0 rgb(0 0 0 / 0.1)" }}
                  onClick={() => handleDeviceClick(model)}
                >
                  <img className="w-[50px] mb-2" src={model.imgSrc} alt="" />
                  <p className="text-[11px] font-medium">{model.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col my-auto text-sm font-medium text-gray-500">
              <img className="w-[250px] mx-auto" src={searchImage} />
              <div>
                Dial <span className="text-[#EC2752]">*#06#</span> on customer's
                old device and
              </div>
              <div>
                Scan the IMEI using the{" "}
                <CiBarcode className="inline text-[#EC2752]" size={20} /> on top
                right.
              </div>
            </div>
          )}
        </div>
      )}
      {isScanOpen && (
        <div className={styles.search_page}>
          <Scanner
            scanBoxSwitch={() => setIsScanOpen(!isScanOpen)}
            setImei={setImei}
          />
        </div>
      )}
    </React.Fragment>
  );
};
