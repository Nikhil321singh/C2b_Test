import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { CiBarcode } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import AppFooter from "../../components/AppFooter";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import { useNavigate } from "react-router";
import styles from "./SelectDeviceType.module.css";
import apple from "../../assets/apple-logo.png";
import poco from "../../assets/POCO.png";
import real from "../../assets/real-logo.png";
import vivo from "../../assets/Vivo-Logo.png";
import onepluse from "../../assets/oneplus-logo.png";
import mi from "../../assets/mi-logo.jpg";
import smasung from "../../assets/samsung-logo.png";
import laptop from "../../assets/laptop-logo.png";
import mobile from "../../assets/mobile-logo.png";
import watch from "../../assets/watch_logo.png";
import appleWatch from "../../assets/apple_watch.png";
import searchImage from "../../assets/mobileSearch.png";
import Scanner from "../../components/Scanner";
import sellPhones from "../../assets/sell_phones.jpg";
import how1 from "../../assets/how1.png";
import how2 from "../../assets/how2.png";
import how3 from "../../assets/how3.png";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { Link } from "react-router-dom";
import { useQuestionContext } from "../../components/QuestionContext";
import FromDatecom from "../../components/fromdate_todate_Com/FromDate";
import { toast } from "react-hot-toast";
import { ImCancelCircle } from "react-icons/im";
import Oppo from "../../assets/Oppo.png";
export const OrderStatusBox = ({ title, figures, background }) => {
  return (
    <div
      style={{ backgroundColor: background }}
      className={`text-center rounded-lg border-none text-white text-[0.8rem] flex-col items-center justify-center border-2 ${styles.order_box}`}
    >
      <div
        className={`flex flex-col items-center h-full ${styles.order_box_con}`}
      >
        <p className="font-semibold text-[1.1rem]">
          {figures !== undefined ? figures : 0}
        </p>
        <p>{title}</p>
      </div>
    </div>
  );
};

export const DeviceTypeFilter = ({
  selectedBtn,
  setSelectedBtn,
  setDeviceType,
}) => {
  const categories = [
    { name: "Mobiles", image: mobile, apiType: "Mobile" },
    { name: "Laptops", image: laptop, apiType: "Laptop" },
    { name: "Watches", image: watch, apiType: "Watch" },
    { name: "More", image: null },
  ];

  const categoryContainerRef = useRef(null);

  const scrollCategory = (direction) => {
    const scrollAmount = 200;

    if (categoryContainerRef.current) {
      if (direction === "left") {
        categoryContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else if (direction === "right") {
        categoryContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };
  return (
    <div className={styles.select_button_wrap}>
      <button
        className={`translate-x-3 ${styles.scroll_button}`}
        onClick={() => scrollCategory("left")}
      >
        <IoIosArrowBack size={30} />
      </button>
      <div
        ref={categoryContainerRef}
        className={`flex flex-shrink-0 gap-4 px-1 overflow-x-auto scrollbar-hide scroll-smooth ${styles.select_button_box}`}
      >
        {categories.map((category, index) => (
          <div
            key={index}
            className={
              selectedBtn === category.name
                ? styles.button_checked
                : styles.button_unchecked
            }
            onClick={() => {
              setSelectedBtn(category.name);
              setDeviceType(category.apiType);
            }}
          >
            {category.image && <img src={category.image} alt={category.name} />}
            <span>{category.name}</span>
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

export const TopSelling = ({ topModels }) => {
  const carContainerRef = useRef(null);
  const navigate = useNavigate();
  const scrollCars = (direction) => {
    const scrollAmount = 200; // Adjust the scroll amount as needed

    if (carContainerRef.current) {
      if (direction === "left") {
        carContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else if (direction === "right") {
        carContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const handleTopDeviceClick = (item) => {
    const detail = { models: item };
    sessionStorage.setItem("dataModel", JSON.stringify(detail));

    sessionStorage.setItem("dataModelConfig", JSON.stringify(item));
    navigate("/selectmodel");
  };

  return (
    <div className={styles.topSell_wrap}>
      <button
        className={`translate-x-3 ${styles.scroll_button}`}
        onClick={() => scrollCars("left")}
      >
        <IoIosArrowBack size={30} />
      </button>
      <div
        ref={carContainerRef}
        className={`flex flex-shrink-0 gap-4 px-1 overflow-x-auto scrollbar-hide scroll-smooth ${styles.topSell_box}`}
      >
        {topModels.map((item) => (
          <div
            onClick={() => handleTopDeviceClick(item)}
            key={item._id}
            className={styles.topSell_card}
          >
            <img
              src={
                item?.phonePhotos?.front
                  ? item?.phonePhotos?.front
                  : item.type === "Mobile"
                  ? mobile
                  : appleWatch
              }
            />
            <p>{item?.name}</p>
          </div>
        ))}
      </div>
      <button
        className={`-translate-x-3 ${styles.scroll_button}`}
        onClick={() => scrollCars("right")}
      >
        <IoIosArrowForward size={30} />
      </button>
    </div>
  );
};

export const BrandList = ({ deviceType }) => {
  const [brandList, setBrandList] = useState([]);
  const [popout, setPopout] = useState(false);
  const [userToken, setUserToken] = useState(
    sessionStorage.getItem("authToken")
  );
  const navigate = useNavigate();

  const brandContainerRef = useRef(null);

  const scrollBrand = (direction) => {
    const scrollAmount = 200;

    if (brandContainerRef.current) {
      if (direction === "left") {
        brandContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else if (direction === "right") {
        brandContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/brands/getBrands`,

        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        setBrandList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDeviceClick = () => {
    setPopout(true);
  };
  const hanldeclose = () => {
    setPopout(false);
  };

  const handleBrandClick = (brandItem) => {
    console.log("adasdasasfdafadf", deviceType);
    if (deviceType == "Laptop" || deviceType == undefined) {
      handleDeviceClick();
    } else if (deviceType == "Watch" && brandItem.name != "Apple") {
      handleDeviceClick();
    } else if (
      brandItem.name === "Apple" ||
      brandItem.name === "OnePlus" ||
      brandItem.name === "POCO" ||
      brandItem.name === "Realme" ||
      brandItem.name === "Xiaomi" ||
      brandItem.name === "Samsung" ||
      brandItem.name === "Vivo" ||
      brandItem.name === "OPPO"
    ) {
      const detail = { brand: brandItem, models: {}, _id: brandItem._id };
      sessionStorage.setItem("dataModel", JSON.stringify(detail));
      navigate(`/selectdevice/${detail.brand?._id}`);
    } else {
      handleDeviceClick();
    }
  };
  const extraBrands = [{ name: "More" }];

  // Concatenate the extra brands with the dynamically fetched brandList
  const allBrands = [...brandList, ...extraBrands];
  return (
    <>
      {popout && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full bg-[#0e0e0d4d] z-10"
            onClick={hanldeclose}
          ></div>
          <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-[270px]  w-[270px] bg-white rounded-md ease-in-out duration-300 z-20">
            <div className="text h-[270px]   w-[270px] flex items-center justify-center flex-col relative">
              <ImCancelCircle
                className="absolute top-[7px] right-3"
                size={25}
                onClick={hanldeclose}
              />
              <div className="text-4xl font-bold text-[#EC2752] p text-center">
                Coming
              </div>
              <div className="text-4xl font-bold text-[#EC2752] p text-center">
                Soon !
              </div>
            </div>
          </div>
        </>
      )}
      <div className={styles.topSell_wrap}>
        <button
          className={`translate-x-3 ${styles.scroll_button}`}
          onClick={() => scrollBrand("left")}
        >
          <IoIosArrowBack size={30} />
        </button>
        <div
          ref={brandContainerRef}
          className={`flex flex-shrink-0 gap-4 px-1 overflow-x-auto  scroll-smooth scrollbar-hide ${styles.topSell_box}`}
        >
          {allBrands.map((brandItem, index) => (
            <div
              key={index}
              onClick={() => handleBrandClick(brandItem)}
              className={`flex-shrink-0 ${styles.brand_card}`}
            >
              {brandItem.name === "Apple" ? (
                <img className="mx-auto" src={apple} alt={brandItem.name} />
              ) : brandItem.name === "OnePlus" ? (
                <img className="mx-auto" src={onepluse} alt={brandItem.name} />
              ) : brandItem.name === "POCO" ? (
                <img className="mx-auto" src={poco} alt={brandItem.name} />
              ) : brandItem.name === "Realme" ? (
                <img className="mx-auto" src={real} alt={brandItem.name} />
              ) : brandItem.name === "Xiaomi" ? (
                <img className="mx-auto" src={mi} alt={brandItem.name} />
              ) : brandItem.name === "Samsung" ? (
                <img className="mx-auto" src={smasung} alt={brandItem.name} />
              ) : brandItem.name === "Vivo" ? (
                <img className="mx-auto" src={vivo} alt={brandItem.name} />
              ) : brandItem.name === "OPPO" ? (
                <img className="mx-auto" src={Oppo} alt={brandItem.name} />
              ) : brandItem.logo ? (
                <img
                  className="mx-auto"
                  src={brandItem.logo}
                  alt={brandItem.name}
                />
              ) : (
                <p>{brandItem.name}</p>
              )}
            </div>
          ))}
        </div>
        <button
          className={`-translate-x-3 ${styles.scroll_button}`}
          onClick={() => scrollBrand("right")}
        >
          <IoIosArrowForward size={30} />
        </button>
      </div>
    </>
  );
};

const SelectDeviceType = () => {
  const Device = sessionStorage.getItem("DeviceType");
  const selBtn =
    Device === "Mobile"
      ? "Mobiles"
      : Device === "Laptop"
      ? "Laptops"
      : Device === "Watch"
      ? "Watches"
      : "More";
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { fromDateDup, setFromDateDup, toDateDup, setToDateDup, Emptydate } =
    useQuestionContext();
  const [showFromdate, setshowFromdate] = useState(false);
  const [selectedBtn, setSelectedBtn] = useState(selBtn);
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [days, setDays] = useState("today");
  const [orderSaled, setOrderSaled] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [deviceType, setDeviceType] = useState(Device);
  const [cutomSearch, setCustomSearch] = useState(false);
  const navigate = useNavigate();

  const [topModels, setTopmodels] = useState([]);

  const searchBoxSwitch = () => {
    setModel([]);
    setIsSearchBoxOpen(!isSearchBoxOpen);
  };
  const scanBoxSwitch = () => {
    setIsScanOpen(!isScanOpen);
  };

  //for search the custom date picker
  function searchCustom() {
    if (fromDateDup != "" && toDateDup != "") {
      setCustomSearch(!cutomSearch);
    } else {
      toast.error("Enter both date field");
    }
  }
  //for hanlding iemi

  const [imei, setImei] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("");
  const [data, setData] = useState(null);
  const [modelsL, setModel] = useState([]);

  const handleInputChange = (e) => {
    setImei(e.target.value);
  };

  //for take date for search
  const handleFromDateChange = (date, e) => {
    if (date === null) {
      setFromDate("");
    } else {
      setFromDate(date);
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      setFromDateDup(formattedDate);
      console.log("TO data", formattedDate);
    }
  };

  const handleToDateChange = (date) => {
    if (date === null) {
      setToDate("");
    } else {
      setToDate(date);
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      setToDateDup(formattedDate);
      console.log("TO data", formattedDate);
    }
  };

  function searchDevice(val) {
    axios
      .get(
        `https://alpha.imeicheck.com/api/modelBrandName?imei=${val}&format=json`
      )
      .then((response) => {
        const brand = response.data.object.brand;
        const model = response.data.object.name;
        setData(`${brand} ${model}`);
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error}`);
      });
  }
  //for seach models
  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    if (data) {
      axios
        .post(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/user/Dashboard/search/phones`,
          { name: data },
          {
            headers: {
              authorization: `${authToken}`,
            },
          }
        )
        .then((response) => {
          setModel(response.data);
        })
        .catch((error) => {
          console.error(`Error fetching data: ${error}`);
        });
    }
  }, [data]);

  //check emi lenght for api  call to get modela name
  useEffect(() => {
    const nonNumeric = /\D/;
    if (imei.length >= 15 && !nonNumeric.test(imei)) {
      searchDevice(imei);
    } else if (nonNumeric.test(imei)) {
      // Call search phone API directly
      if (imei.length == 0) {
        setModel([]);
        return;
      }
      const authToken = sessionStorage.getItem("authToken");
      axios
        .post(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/user/Dashboard/search/phones`,
          { name: imei },
          {
            headers: {
              authorization: `${authToken}`,
            },
          }
        )
        .then((response) => {
          setModel(response.data);
          setFlag(false);
        })
        .catch((error) => {
          console.log("no result");
          setModel([]);
          setFlag(true);
          console.error(`Error fetching data: ${error}`);
        });
    }
  }, [imei]);

  useEffect(() => {
    sessionStorage.setItem("DeviceType", deviceType);
  }, [deviceType]);

  useEffect(() => {
    const fetchData = async () => {
      const authToken = sessionStorage.getItem("authToken");
      try {
        const response2 = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/user/Dashboard/order/saled?time=${days}&fromdate=${fromDateDup}&todate=${toDateDup}&datareq=${deviceType}`,
          {
            headers: {
              authorization: `${authToken}`,
            },
          }
        );
        setOrderSaled(response2.data.count);

        //new count api for both order createdd && quote createdd

        const response1 = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/leadSet/getCount?time=${days}&fromdate=${fromDateDup}&todate=${toDateDup}&datareq=${deviceType}`,
          {
            headers: {
              authorization: `${authToken}`,
            },
          }
        );
        setQuoteCount(response1?.data?.data?.quoteData?.count);
        setOrderCount(response1?.data?.data?.orderData?.count);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [days, cutomSearch, deviceType]);

  useEffect(() => {
    const fetchtop = async () => {
      const authToken = sessionStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/user/Dashboard/get/top/sellingModels?time=${days}&deviceType=${deviceType}`,
          {
            headers: {
              authorization: `${authToken}`,
            },
          }
        );

        setTopmodels(response.data);
        console.log("top", response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchtop();
  }, [days, deviceType]);

  const addPhoneView = async (modelId) => {
    const authToken = sessionStorage.getItem("authToken");
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/user/Dashboard/add/PhoneView?time=${days}`,
        {
          modelId: modelId,
        },
        {
          headers: {
            authorization: `${authToken}`,
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error adding phone view: ", error);
    }
  };

  const handleDeviceClick = (model) => {
    const detail = { models: model };
    sessionStorage.setItem("dataModel", JSON.stringify(detail));
    sessionStorage.setItem("DeviceType", model.type);
    sessionStorage.setItem("dataModelConfig", JSON.stringify(model));
    navigate("/selectmodel");
    addPhoneView(model._id);
  };

  const handlepick = (e) => {
    if (e.target.value === "Custom") {
      console.log("customr daba h ");
      setshowFromdate(true);
    } else {
      console.log("days", e.target.value);
      setDays(e.target.value);
      setshowFromdate(false);
    }
  };

  return (
    <div className={`bg-[#f9f9f9d8] bg-white ${styles.home_page_wrap}`}>
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="flex items-center justify-between w-full ">
          <ProfileBox />
          <img className="w-28 " src={Grest_Logo} alt="app logo" />
        </div>
      </div>

      {isSearchBoxOpen && (
        <div className={`${styles.search_page} min-h-screen  `}>
          <div className={styles.search_box_wrap}>
            <div className={`flex items-center p-2 mb-1 ${styles.search_box}`}>
              <div className="flex items-center" onClick={searchBoxSwitch}>
                <IoClose size={20} className="inline ml-1" />
              </div>
              <input
                placeholder="Search Product with Name/IMEI"
                className="inline w-full mx-2 outline-none"
                type="text"
                onChange={handleInputChange}
                value={imei}
                autoFocus={true}
              />
              <div className="flex items-center" onClick={scanBoxSwitch}>
                <CiBarcode size={20} className={"inline mr-1 text-[#EC2752]"} />
              </div>
            </div>
          </div>
          {flag && (
            <div>
              <p className="mt-4 font-medium">No Device Found</p>
            </div>
          )}
          {imei.length > 0 && modelsL.length > 0 ? (
            <div
              className={`   mx-auto mt-4 justify-center  w-full  flex flex-wrap gap-2  max-h-screen overflow-y-scroll pb-[15vh] `}
            >
              {modelsL &&
                modelsL.map((model) => (
                  <div
                    key={model._id}
                    className={` ${
                      modelsL.length < 3 ? "min-w-[30%] max-w-[30%]" : "w-[30%]"
                    }  h-auto  gap-2 flex flex-col items-center px-2 py-4  text-center`}
                    style={{ boxShadow: "0 0 10px 0 rgb(0 0 0 / 0.1)" }}
                    onClick={() => handleDeviceClick(model)}
                  >
                    <img
                      className="w-[50px] mb-2"
                      src={
                        model?.phonePhotos?.front
                          ? model?.phonePhotos?.front
                          : model?.type === "Watch"
                          ? appleWatch
                          : "https://grest-c2b-images.s3.ap-south-1.amazonaws.com/gresTest/1705473080031front.jpg"
                      }
                      alt=""
                    />
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
          <Scanner scanBoxSwitch={scanBoxSwitch} setImei={setImei} />
        </div>
      )}
      <div className={styles.des_main_wrap}>
        <div className={styles.des_lr_wrap}>
          <div className={styles.des_left_wrap}>
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
            <DeviceTypeFilter
              selectedBtn={selectedBtn}
              setSelectedBtn={setSelectedBtn}
              setDeviceType={setDeviceType}
            />
            <BrandList deviceType={deviceType} />
            <div className="ml-3">
              <select
                name=""
                id=""
                onChange={(e) => {
                  handlepick(e);
                }}
                className="p-2 border-2 rounded-lg shadow-md outline-none "
              >
                <option value="today">Today</option>
                <option value="7days">7 Days</option>
                <option value="lastmonth">Last Month</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* //from date to date */}

            <div className={`flex gap-2 justify-between ${styles.info_wrap}`}>
              <Link className="w-[33%]" to={`/orderscreated/${days}`}>
                <OrderStatusBox
                  figures={orderCount}
                  title="Order Created"
                  background="#0275F2"
                />
              </Link>
              <Link className="w-[33%]" to={`/orderscompleted/${days}`}>
                <OrderStatusBox
                  figures={orderSaled}
                  title="Order Completed"
                  background="#E94A4E"
                />
              </Link>
              <Link className="w-[33%]" to={`/quotescreated/${days}`}>
                <OrderStatusBox
                  figures={quoteCount}
                  title="Quotes Created"
                  background="#FF963E"
                />
              </Link>
            </div>
            <p
              className={`${styles.topSell_head} text-lg font-bold text-[#EC2752]`}
            >
              Top Selling Models
            </p>
            <TopSelling topModels={topModels} />
          </div>
          <div className={styles.des_right_wrap}>
            <div className={styles.sellPhones_head}>
              <p className="font-black text-9xl">SELL</p>
              <span className="text-2xl font-medium">Used Products to Us</span>
            </div>
            <img className="w-[100%]" src={sellPhones} />
          </div>
        </div>
        <p
          className={`${styles.topSell_head} text-lg font-bold mt-2 text-[#EC2752]`}
        >
          How GREST Works?
        </p>
        <div className="flex gap-2 mt-4 mb-[px] pb-[80px] justify-between mx-2">
          <div className="flex flex-col min-w-[30%]  items-center  ">
            <img className={`w-[50px] mb-2`} src={how1} />
            <p className="-mb-1 text-base font-bold">Add</p>
            <p className="text-base font-medium opacity-60">product details</p>
          </div>
          <div className="flex flex-col min-w-[30%] items-center  ">
            <img className={`w-[50px] mb-2`} src={how2} />
            <p className="-mb-1 text-base font-bold">Exchange</p>
            <p className="text-base font-medium opacity-60">your device</p>
          </div>
          <div className="flex flex-col min-w-[30%] items-center  ">
            <img className={`w-[50px] mb-2`} src={how3} />
            <p className="-mb-1 text-base font-bold">Transfer</p>
            <p className="text-base font-medium opacity-60">your money</p>
          </div>
        </div>
      </div>

      {!isSearchBoxOpen && <AppFooter days={days} />}
      <FromDatecom
        showFromdate={showFromdate}
        toDate={toDate}
        handleToDateChange={handleToDateChange}
        fromDate={fromDate}
        handleFromDateChange={handleFromDateChange}
        setshowFromdate={setshowFromdate}
        searchCustom={searchCustom}
      ></FromDatecom>
    </div>
  );
};

export default SelectDeviceType;
