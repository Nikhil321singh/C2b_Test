import React, { useEffect, useState, useRef } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import StoreWiseTable from "../../components/StoreWiseTable/StoreWiseTable";
import axios from "axios";
import styles from "./StoreWiseReport.module.css";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { BeatLoader } from "react-spinners";
import DatePicker from "react-datepicker";
import { IoMdSearch } from "react-icons/io";
import { IoRefresh } from "react-icons/io5";

const StoreWiseReport = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [maxPages, setMaxPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [tableData, setTableData] = useState();
  const [isSelled, setIsSelled] = useState("true");
  const [totalCount, setTotalCount] = useState(0);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const pageLimit = 10;
  const [storeName, setStoreName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [region, setRegion] = useState("");
  const [storeData, setStoreData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [regionDrop, setRegionDrop] = useState(false);
  const [storeDrop, setStoreDrop] = useState(false);
  const [entireStore, setEntireStore] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [fromDateDup, setFromDateDup] = useState("2023-01-01");
  const [toDate, setToDate] = useState("");
  const [toDateDup, setToDateDup] = useState(new Date().toISOString().split("T")[0]);
  const [grestRec, setGrestRec] = useState("");
  const [grestDrop, setGrestDrop] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [techId, setTechId] = useState("");
  const [techName, setTechName] = useState("");
  const [techDrop, setTechDrop] = useState(false);
  const [deviceCategory, setDeviceCategory] = useState("Mobile");

  const fetchStoreData = () => {
    const userToken = sessionStorage.getItem("authToken");
    setIsTableLoaded(true);
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?page=${currentPage}&limit=${pageLimit}&is_selled=${isSelled}&store=${storeId}&rid=${searchValue}&grestRec=${grestRec}&endDate=${toDateDup}&startDate=${fromDateDup}&userId=${techId}&deviceType=${deviceCategory}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        setMaxPages(Math.ceil(res.data.totalCounts / 10));
        setTableData(res.data.data);
        setTotalCount(res.data.totalCounts);
        setIsTableLoaded(false);
      })
      .catch((err) => {
        console.log(err);
        setIsTableLoaded(false);
      });
  };

  const getStore = () => {
    setIsTableLoaded(true);
    const token = sessionStorage.getItem("authToken");

    let config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    };

    axios
      .request(config)
      .then((response) => {
        const allStoreData = response.data.result;
        console.log(response.data.result);
        const storeArr = response.data.result.map((store) => ({
          storeName: store.storeName,
          _id: store._id,
        }));
        const regionsUniqueArray = [
          ...new Set(response.data.result.map((store) => store.region)),
        ];
        setStoreData(storeArr);
        setEntireStore(allStoreData);
        setIsTableLoaded(false);
        setRegionalData(regionsUniqueArray);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
      });
  };

  const getTechnicians = () => {
    setIsTableLoaded(true);
    const token = sessionStorage.getItem("authToken");

    let config = {
      method: "get",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/all`,
      headers: { Authorization: token },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response.data.data);
        const allStoresData = response.data.data;
        const userNamesArray = allStoresData.map((user) => ({
          userName: user?.name || user?.firstName,
          _id: user._id,
        }));
        setAllUser(userNamesArray);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    getStore();
    getTechnicians();
  }, []);

  const downloadExcelStoreWise = (apiData) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const formattedData = apiData.map((item) => {
      return {
        "Purchase Date": new Date(item.createdAt).toLocaleDateString("en-IN"),
        Technicians: item.userId?.firstName,
        "IMEI No.": item.documentId?.IMEI,
        "Product Details": item.modelId?.name,
        Location: item.store?.storeName,
        "Price Offered To Customer": item.price,
        "Unique ID": item.uniqueCode,
      };
    });

    const wsStoreWise = XLSX.utils.json_to_sheet(formattedData);
    const wbStoreWise = { Sheets: { data: wsStoreWise }, SheetNames: ["data"] };
    const excelBufferStoreWise = XLSX.write(wbStoreWise, {
      bookType: "xlsx",
      type: "array",
    });

    const dataFileStoreWise = new Blob([excelBufferStoreWise], {
      type: fileType,
    });
    saveAs(dataFileStoreWise, "StoreWise_Report" + fileExtension);
  };

  const fetchDownloadDataStoreWise = () => {
    const userToken = sessionStorage.getItem("authToken");
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?page=${0}&limit=${totalCount}&is_selled=${isSelled}&deviceType=${deviceCategory}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        downloadExcelStoreWise(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchStoreData();
  }, [
    currentPage,
    pageLimit,
    grestRec,
    fromDateDup,
    toDateDup,
    techId,
    deviceCategory,
  ]);

  useEffect(() => {
    if (!!storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const handleSearchClick = () => {
    fetchStoreData();
  };

  const handleRegionChange = (value) => {
    setRegionDrop(false);
    setStoreName("");
    const filteredStores = entireStore.filter(
      (store) => store.region === value
    );
    const storeNamesArray = filteredStores.map((store) => ({
      storeName: store.storeName,
      _id: store._id,
    }));
    setStoreData(storeNamesArray);
    setRegion(value);
  };

  const handleStoreChange = (value) => {
    setStoreDrop(false);
    const filteredStores = entireStore.filter(
      (store) => store._id === value._id
    );
    const newRegion = filteredStores[0].region;
    setRegion(newRegion);
    setStoreName(value.storeName);
    setStoreId(value._id);
  };

  const handleTechChange = (value) => {
    setTechName(value.userName);
    setTechId(value._id);
    setTechDrop(false);
  };

  const handleGrestRecChange = (value) => {
    setGrestRec(value);
    setGrestDrop(false);
  };

  const handleFromDateChange = (date) => {
    if (date === null) {
      setFromDate("");
    } else {
      setFromDate(date);
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const today = new Date();
      const formattedToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      if (toDate === "") {
        setToDateDup(formattedToday);
      }
      setFromDateDup(formattedDate);
      console.log(formattedDate + " to " + formattedToday);
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

      if (fromDate === "") {
        const fromDateOneYearBefore = new Date(date);
        fromDateOneYearBefore.setFullYear(
          fromDateOneYearBefore.getFullYear() - 1
        );

        const formattedFromDate = new Date(
          fromDateOneYearBefore.getTime() -
            fromDateOneYearBefore.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];
        setFromDateDup(formattedFromDate);
      }
    }
  };

  const handleSearchClear = () => {
    setStoreName("");
    setStoreId("");
    setRegion("");
    setSearchValue("");
    setFromDate("");
    setFromDateDup("");
    setToDate("");
    setToDateDup("");
    setGrestRec("");
    setTechId("");
    setTechName("");
  };
  const handleDeviceCategory = (e) => {
    setDeviceCategory(e.target.value);
  };
  return (
    <div>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <div className="flex flex-row gap-2 items-center justify-center">
        <div className="flex gap-2">
          <p className="font-medium">Select Category</p>
          <select
            name=""
            id=""
            className="bg-[#EC2752] text-white rounded-lg outline-none px-2 py-1"
            onChange={handleDeviceCategory}
          >
            <option
              className="bg-white text-[#EC2752] font-medium"
              value="Mobile"
            >
              Mobile
            </option>
            <option
              className="bg-white text-[#EC2752] hover:bg-[#EC2752] font-medium"
              value="Watch"
            >
              Watch
            </option>
          </select>
        </div>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className="text-sm"
            type="text"
            placeholder="Search Store Name/Email/Id/Region"
            value={searchValue}
          />
          <IoMdSearch onClick={handleSearchClick} size={25} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} className="" size={25} />
        </div>
        <div>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={fetchDownloadDataStoreWise}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>
      </div>
      <div className="flex flex-row w-100 gap-2 items-center justify-center">
        <div className="flex flex-row px-5 gap-2 w-[100%] justify-center items-center">
          <div className="relative w-[15%]">
            <div
              className={`${styles.filter_button}`}
              onClick={() => {
                setTechDrop(!techDrop);
              }}
            >
              <p className="truncate">
                {techName === "" ? "Select Technician" : techName}
              </p>
              <FaAngleDown
                size={17}
                className={`${techDrop && "rotate-180"}`}
              />
            </div>
            {techDrop && (
              <div className={`${styles.filter_drop}`}>
                <div
                  onClick={() => {
                    setTechName(""), setTechId(""), setTechDrop(false);
                  }}
                  className={`${styles.filter_option}`}
                >
                  <p className="truncate">Show All</p>
                </div>
                {allUser.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleTechChange(item)}
                    className={`${styles.filter_option}`}
                  >
                    <p className="truncate">{item.userName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-[15%]">
            <div
              className={`${styles.filter_button}`}
              onClick={() => {
                setGrestDrop(!grestDrop);
              }}
            >
              <p className="truncate">
                {grestRec === ""
                  ? "Grest Received ?"
                  : "Grest Rec. " + grestRec}
              </p>
              <FaAngleDown
                size={17}
                className={`${grestDrop && "rotate-180"}`}
              />
            </div>
            {grestDrop && (
              <div className={`${styles.filter_drop}`}>
                <div
                  onClick={() => handleGrestRecChange("")}
                  className={`${styles.filter_option}`}
                >
                  <p className="truncate">Show All</p>
                </div>
                <div
                  onClick={() => handleGrestRecChange("yes")}
                  className={`${styles.filter_option}`}
                >
                  <p className="truncate">Yes</p>
                </div>
                <div
                  onClick={() => handleGrestRecChange("no")}
                  className={`${styles.filter_option}`}
                >
                  <p className="truncate">No</p>
                </div>
              </div>
            )}
          </div>
          <div className="relative w-[20%]">
            <div
              className={`${styles.filter_button}`}
              onClick={() => {
                setRegionDrop(!regionDrop);
              }}
            >
              <p className="truncate">
                {region === "" ? "Select Region" : region}
              </p>
              <FaAngleDown
                size={17}
                className={`${regionDrop && "rotate-180"}`}
              />
            </div>
            {regionDrop && (
              <div className={`${styles.filter_drop}`}>
                {regionalData.map((item) => (
                  <div
                    key={item}
                    onClick={() => handleRegionChange(item)}
                    className={`${styles.filter_option}`}
                  >
                    <p className="truncate">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative w-[35%]">
            <div
              className={`${styles.filter_button}`}
              onClick={() => {
                setStoreDrop(!storeDrop);
              }}
            >
              <p className="truncate">
                {storeName === "" ? "Select Store" : storeName}
              </p>
              <FaAngleDown
                size={17}
                className={`${storeDrop && "rotate-180"}`}
              />
            </div>
            {storeDrop && (
              <div
                className={`overflow-y-scroll max-h-[200px] ${styles.filter_drop}`}
              >
                {storeData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleStoreChange(item)}
                    className={`${styles.filter_option}`}
                  >
                    <p className="truncate">{item.storeName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-[15%]">
            <DatePicker
              selected={fromDate}
              onChange={handleFromDateChange}
              dateFormat="yyyy-MM-dd"
              className="outline-none p-2 w-[100%] border rounded-md text-sm text-center"
              placeholderText="Select from date"
            />
          </div>
          <div className="w-[15%]">
            <DatePicker
              selected={toDate}
              onChange={handleToDateChange}
              dateFormat="yyyy-MM-dd"
              className="outline-none p-2 w-[100%] border rounded-md text-sm text-center"
              placeholderText="Select to date"
            />
          </div>
        </div>
      </div>
      <div className="max-w-full min-h-screen">
        <StoreWiseTable currentPage={currentPage} tableData={tableData} />
      </div>
      <div className="flex justify-center mt-0 mb-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 0
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-[#EC2752] text-white cursor-pointer"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === maxPages - 1}
          className={`mx-2 px-4 py-2 rounded-lg ${
            currentPage === maxPages - 1
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-[#EC2752] text-white cursor-pointer"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StoreWiseReport;
