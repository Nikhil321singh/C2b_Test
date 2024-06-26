import React, { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import styles from "./QuotesCreatedAdmin.module.css";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import { IoRefresh } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavigateListing from "../../components/NavigateListing/NavigateListing";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import QuotesCreatedAdminTable from "../../components/QuotesCreatedAdminTable/QuotesCreatedAdminTable";
import * as XLSX from "xlsx";

const QuotesCreatedAdmin = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [maxPages, setMaxPages] = useState(0);
  const [tableData, setTableData] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [downloadData, setDownloadData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [saveparam, setSaveparam] = useState("");
  const [allStore, setAllStore] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [storeDrop, setStoreDrop] = useState(false);
  const [userName, setUserName] = useState();
  const [storeId, setStoreId] = useState("");
  const [region, setRegion] = useState("");
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [fromDateDup, setFromDateDup] = useState("2023-01-01");
  const [toDateDup, setToDateDup] = useState(new Date().toISOString().split("T")[0]);
  const getTableData = () => {
    setIsTableLoaded(true);

    const userToken = sessionStorage.getItem("authToken");

    const queryParams = new URLSearchParams();
    if (searchValue !== null) {
      queryParams.append("search", searchValue);
    }

    if (storeId !== null) {
      queryParams.append("store", storeId);
    }

    setSaveparam(queryParams.toString());

    const endPoint = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/prospects/findAll/quotecreated?fromdate=${fromDateDup}&todate=${toDateDup}&search${searchValue}&store=${storeId}`;

    axios
      .get(endPoint, {
        headers: {
          authorization: `${userToken}`,
        },
      })
      .then((res) => {
        setMaxPages(Math.ceil(res.data.data.quoteData.count / 10));
        setTotalCount(res.data.data.quoteData.count);
        console.log("resaaa", res.data.data.quoteData.data);
        setTableData(res.data.data.quoteData.data);
        setIsTableLoaded(false);
      })
      .catch((err) => {
        console.log("error", err);
        setIsTableLoaded(false);
      });
  };

  const getStore = () => {
    setIsTableLoaded(true);
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    const token = sessionStorage.getItem("authToken");
    setUserName(LoggedInUser?.name);

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
        const allData = response.data.result;
        const storeNamesArray = response.data.result.map((store) => ({
          storeName: store.storeName,
          _id: store._id,
        }));
        const uniqueRegionsArray = [
          ...new Set(response.data.result.map((store) => store.region)),
        ];
        console.log(storeNamesArray);
        setAllStore(allData);
        setStoreData(storeNamesArray);
        setRegionData(uniqueRegionsArray);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    getTableData();
  }, [storeId, fromDateDup, toDateDup]);

  useEffect(() => {
    getStore();
  }, []);

  const handleSearchClick = () => {
    getTableData();
  };

  const handleSearchClear = useCallback(() => {
    setSearchValue("");
    setStoreId("");
    setStoreName("");
    setToDate("");
    setToDateDup("");
    setFromDate("");
    setFromDateDup("");
    getTableData();
  }, []);

  const downloadExcelQuotesAdminCreated = (apiData) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const formattedData = apiData.map((item) => {
      let questionsKeys = "";
      let index = 1;
      console.log(item?.lead?.QNA[0]);
      for (let group in item?.lead?.QNA[0]) {
        item.lead.QNA[0][group].forEach((qna) => {
          questionsKeys += `${index}. ${qna?.quetion} - ${qna?.key}\n`;
          index++;
        });
      }
      return {
        "Date Created": new Date(item.createdAt).toLocaleDateString("en-IN"),
        "User Name": item.user?.name,
        "Product Name": item.lead?.model?.name,
        "Final Price Offered to Custoemr": item.lead?.price,
        "Unique Id": item.lead?.uniqueCode,
        "Customer Name": item.lead?.name,
        "Phone Number": item.lead?.phoneNumber,
        "Email Id": item.lead?.emailId,
        "Question/Ans": questionsKeys,
      };
    });

    const quotesAdminData = XLSX.utils.json_to_sheet(formattedData);
    const quotesAdminRes = {
      Sheets: { data: quotesAdminData },
      SheetNames: ["data"],
    };
    const excelAdminBuffer = XLSX.write(quotesAdminRes, {
      bookType: "xlsx",
      type: "array",
    });

    const dataAdminQuotesCreatedFile = new Blob([excelAdminBuffer], {
      type: fileType,
    });
    saveAs(dataAdminQuotesCreatedFile, "Quotes_Created" + fileExtension);
  };

  const fetchDownloadData = () => {
    const userToken = sessionStorage.getItem("authToken");
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll/quotecreated`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        setDownloadData(res.data.data.quoteData.data);
        downloadExcelQuotesAdminCreated(res.data.data.quoteData.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleStoreChange = (value) => {
    setStoreDrop(false);
    const filteredStores = allStore.filter((store) => store._id === value._id);
    const newRegion = filteredStores[0].region;
    setRegion(newRegion);
    setStoreName(value.storeName);
    setStoreId(value._id);
  };

  const handleFromDateChange = (date) => {
    if (date !== null) {
      setFromDate(date);
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      setFromDateDup(formattedDate);
    }
    console.log("from", date);
  };
  const handleToDateChange = (date) => {
    if (date !== null) {
      setToDate(date);
      const formattedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      setToDateDup(formattedDate);
    }
    console.log("to", date);
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

      <NavigateListing />
      <div className="flex gap-2 mx-2 items-center justify-center outline-none mt-5 w-[100%]">
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className="text-sm"
            type="text"
            placeholder="Search..."
            value={searchValue}
          />
          <IoMdSearch onClick={handleSearchClick} size={25} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} className="" size={25} />
        </div>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={fetchDownloadData}
        >
          <FaDownload /> Bulk Download
        </button>

        <div className="[bg-[#F5F4F9]">
          <DatePicker
            selected={fromDate}
            onChange={handleFromDateChange}
            dateFormat="yyyy-MM-dd"
            className={` mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md`}
            placeholderText="Select from date"
          />
        </div>
        <div>
          <DatePicker
            selected={toDate}
            onChange={handleToDateChange}
            dateFormat="yyyy-MM-dd"
            className="mt-1 p-[6px] w-[150px] sm:w-[250px] border rounded-md"
            placeholderText="Select to date"
          />
        </div>

        <div className="relative w-[250px]">
          <div
            className={`${styles.filter_button}`}
            onClick={() => {
              setStoreDrop(!storeDrop);
            }}
          >
            <p className="truncate">
              {storeName === "" ? "Select Store" : storeName}
            </p>
            <FaAngleDown size={17} className={`${storeDrop && "rotate-180"}`} />
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
      </div>
      <QuotesCreatedAdminTable
        tableData={tableData}
        currentPage={currentPage}
      />
    </div>
  );
};

export default QuotesCreatedAdmin;
