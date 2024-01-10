import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { CiBarcode } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import AppFooter from "../../components/AppFooter";
import Grest_Logo from "../../assets/Grest_Logo.jpeg";
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router";
import styles from "./SelectDeviceType.module.css";
import User_Logo from "../../assets/User_Logo.jpeg";
import apple from "../../assets/apple-logo.png";
import onepluse from "../../assets/oneplus-logo.png";
import mi from "../../assets/mi-logo.jpg";
import smasung from "../../assets/samsung-logo.png";
import laptop from "../../assets/laptop-logo.png";
import mobile from "../../assets/mobile-logo.png";
import watch from "../../assets/watch_logo.png";
import searchImage from "../../assets/mobileSearch.png";
import { Scanner } from "../../components/Scanner";
import sellPhones from "../../assets/sell_phones.jpg";
import how1 from "../../assets/how1.png";
import how2 from "../../assets/how2.png";
import how3 from "../../assets/how3.png";

export const OrderStatusBox = ({ title, figures, background }) => {
  return (
    <div
      style={{ backgroundColor: background }}
      className={`text-center rounded-lg border-none text-white text-[0.8rem] flex-col items-center justify-center border-2 ${styles.order_box}`}
    >
      <div
        className={`flex flex-col items-center h-full ${styles.order_box_con}`}
      >
        <p className="font-semibold text-[1.1rem]">{figures}</p>
        <p>{title}</p>
      </div>
    </div>
  );
};

export const DeviceTypeFilter = ({ selectedBtn, setSelectedBtn }) => {
  return (
    <div className={styles.select_button_wrap}>
      <div
        className={`flex px-1 overflow-x-auto scroll-smooth scrollbar-hide ${styles.select_button_box}`}
      >
        <div
          className={
            selectedBtn === "Mobiles"
              ? styles.button_checked
              : styles.button_unchecked
          }
          onClick={() => setSelectedBtn("Mobiles")}
        >
          <img src={mobile} />
          <span>Mobiles</span>
        </div>
        <div
          className={
            selectedBtn === "Laptops"
              ? styles.button_checked
              : styles.button_unchecked
          }
          onClick={() => setSelectedBtn("Laptops")}
        >
          <img src={laptop} />
          <span>Laptops</span>
        </div>
        <div
          className={
            selectedBtn === "Watches"
              ? styles.button_checked
              : styles.button_unchecked
          }
          onClick={() => setSelectedBtn("Watches")}
        >
          <img src={watch} />
          <span>Watches</span>
        </div>
        <div
          //className={`border-2 py-2 px-4  rounded-xl bg-white ${
          //  selectedBtn === "More" ? "border-[#EC2752]" : " "
          //} `}
          className={
            selectedBtn === "More"
              ? styles.button_checked
              : styles.button_unchecked
          }
          onClick={() => setSelectedBtn("More")}
        >
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export const TopSelling = () => {
  const topSell = [
    "Apple iPhone 6",
    "Apple iPhone 7",
    "Apple iPhone 7S",
    "Apple iPhone 6S",
    "Apple iPhone 6S",
  ];

  const carContainerRef = useRef(null);

  const scrollCars = (direction) => {
    const scrollAmount = 200; // Adjust the scroll amount as needed

    if (carContainerRef.current) {
      if (direction === 'left') {
        carContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else if (direction === 'right') {
        carContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={styles.topSell_wrap}>
      <button className={`translate-x-3 ${styles.scroll_button}`} onClick={() => scrollCars('left')}><IoIosArrowBack size={30}/></button>
      <div
        ref={carContainerRef}
        className={`flex flex-shrink-0 gap-4 px-1 overflow-x-auto scrollbar-hide scroll-smooth ${styles.topSell_box}`}
      >
        {topSell.map((item) => (
          <div key={item} className={styles.topSell_card}>
            <img src={mobile} />
            <p>{item}</p>
          </div>
        ))}
      </div>
      <button className={`-translate-x-3 ${styles.scroll_button}`} onClick={() => scrollCars('right')}><IoIosArrowForward size={30}/></button>
    </div>
  );
};

export const BrandList = () => {
  const [brandList, setBrandList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/brands/getBrands`)
      .then((res) => {
        setBrandList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleBrandClick = (brandItem) => {
    const detail = { brand: brandItem, models: {}, _id: brandItem._id };
    sessionStorage.setItem("dataModel", JSON.stringify(detail));
    navigate(`/selectdevice/${detail.brand?._id}`);
  };

  return (
    <div className={styles.topSell_wrap}>
      <div
        className={`flex gap-4 px-1 overflow-x-auto scroll-smooth scrollbar-hide ${styles.topSell_box}`}
      >
        <div
          onClick={() => handleBrandClick(brandList[0])}
          className={`flex-shrink-0 ${styles.brand_card}`}
        >
          <img className="mx-auto" src={apple} />
        </div>
        <div
          onClick={() => handleBrandClick(brandList[1])}
          className={`flex-shrink-0 ${styles.brand_card}`}
        >
          <img className="mx-auto" src={onepluse} />
        </div>
        <div
          onClick={() => handleBrandClick(brandList[0])}
          className={`flex-shrink-0 ${styles.brand_card}`}
        >
          <img className="mx-auto" src={mi} />
        </div>
        <div
          onClick={() => handleBrandClick(brandList[0])}
          className={`flex-shrink-0 ${styles.brand_card}`}
        >
          <img className="mx-auto" src={smasung} />
        </div>
        <div
          onClick={() => handleBrandClick(brandList[0])}
          className={`flex-shrink-0 ${styles.brand_card}`}
        >
          <p>More</p>
        </div>
      </div>
    </div>
  );
};

const SelectDeviceType = () => {
  const [selectedBtn, setSelectedBtn] = useState("Mobiles");
  const [userName, setUserName] = useState();
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [isScanOpen, setIsScanOpen] = useState(false);

  const navigate = useNavigate();

  const searchBoxSwitch = () => {
    setIsSearchBoxOpen(!isSearchBoxOpen);
  };
  const scanBoxSwitch = () => {
    setIsScanOpen(!isScanOpen);
  };

  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    console.log(LoggedInUser);
    setUserName(LoggedInUser?.name);
  }, []);

  return (
    <div className={`bg-[#f9f9f9d8] bg-white ${styles.home_page_wrap}`}>
      <div className="flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER ">
        <div className="flex items-center justify-between w-full ">
          <div className="flex ml-4 gap-2 flex-row-reverse items-center">
            <p className="mr-4 text-base  md:text-xl">{userName}</p>
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-[30px]"
              src={User_Logo}
              alt=""
            />
          </div>
          <img className="w-28 " src={Grest_Logo} alt="app logo" />
        </div>
      </div>

      {isSearchBoxOpen && (
        <div className={styles.search_page}>
          <div className={styles.search_box_wrap}>
            <div
              className={`flex items-center p-2 mb-1 ${styles.search_box}`}
            >
              <div className="flex items-center" onClick={searchBoxSwitch}>
                <IoClose size={20} className="inline ml-1" />
              </div>
              <input
                placeholder="Search Product with Name/IMEI"
                className="mx-2 w-full outline-none inline"
                type="text"
                value={productName}
                autoFocus={true}
              />
              <div className="flex items-center" onClick={scanBoxSwitch}>
                <CiBarcode size={20} className={"inline mr-1 text-[#EC2752]"} />
              </div>
            </div>
          </div>
          <div className="flex flex-col my-auto text-sm text-gray-500 font-medium">
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
        </div>
      )}

      {isScanOpen && (
        <div className={styles.search_page}>
          {/* {<div className="flex items-center fixed text-[#EC2752] left-0 top-2" onClick={scanBoxSwitch}>
          <IoClose size={30} className="inline ml-1" />
        </div>} */}
          <Scanner
            scanBoxSwitch={scanBoxSwitch}
            setProductName={setProductName}
          />
        </div>
      )}
      <div className={styles.des_main_wrap}>
        <div className={styles.des_lr_wrap}>
        <div className={styles.des_left_wrap}>
          <div className={`leading-[2.5rem] ${styles.heading_wrap}`}>
            <span className="block mr-2 text-[2rem] sm:inline">Our</span>
            <span className="text-[2.5rem] font-semibold">Products</span>
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
                className="mx-2 w-full outline-none inline"
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
          />
          <BrandList />
          <div className={`flex gap-3 ${styles.info_wrap}`}>
            <OrderStatusBox
              figures="1"
              title="Order Created"
              background="#0275F2"
            />
            <OrderStatusBox
              figures="0"
              title="Order Completed"
              background="#E94A4E"
            />
            <OrderStatusBox
              figures="74"
              title="Quotes Created"
              background="#FF963E"
            />
          </div>
          <p className={`${styles.topSell_head} text-lg font-bold text-[#EC2752]`}>Top Selling Models</p>
          <TopSelling />
        </div>
        <div className={styles.des_right_wrap}>
          <div className={styles.sellPhones_head}>
            <p className="font-black text-9xl">SELL</p>
            <span className="font-medium text-2xl">Used Products to Us</span>
          </div>
          <img className="w-[100%]" src={sellPhones} />
        </div>
        </div>
        <p className={`${styles.topSell_head} text-lg font-bold mt-2 text-[#EC2752]`}>How Grest Works?</p>
        <div className={`${styles.how_work_wrap}`}>
            <div className={`flex flex-col items-center`}>
              <img className={`w-[150px] mb-2`} src={how1}/>
              <p className="text-xl font-bold -mb-1">Add</p>
              <span className="text-base font-medium opacity-60">product details</span>
            </div>
            <div className={`flex flex-col items-center`}>
              <img className={`w-[150px] mb-2`} src={how2}/>
              <p className="text-xl font-bold -mb-1">Pickup</p>
              <span className="text-base font-medium opacity-60">your device</span>
            </div>
            <div className={`flex flex-col items-center`}>
              <img className={`w-[150px] mb-2`} src={how3}/>
              <p className="text-xl font-bold -mb-1">Transfer</p>
              <span className="text-base font-medium opacity-60">your money</span>
            </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default SelectDeviceType;
