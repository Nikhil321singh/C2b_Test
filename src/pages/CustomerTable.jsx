import React, { useEffect, useState } from "react";
import UserTable from "../components/UserTable";
import axios from "axios";
import Filter from "../components/Filter";
// import FilterItems from "../components/FilterItems";
import downArrow from "../assets/down.png";
import { useSelector } from "react-redux";
import useUserProfile from "../utils/useUserProfile";
import CustomerUploadExcel from "../components/CustomerUploadExcel";
import DownloadSample from "../components/DownloadSample";
import ExportTableData from "../components/ExportTableData";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DownloadFilter from "../components/Download_filter";
import { BeatLoader } from "react-spinners";
import AdminNavbar from "../components/Admin_Navbar";
import SideMenu from "../components/SideMenu";
const CustomerTable = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateDup, setFromDateDup] = useState(null);
  const [toDateDup, setToDateDup] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userEmailList, setUserEmailList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableDataDup, setTableDataDup] = useState([]);
  const [salesTableData, setSalesTableData] = useState([]);
  const [prospectTableData, setProspectTableData] = useState([]);
  // const userProfile = useSelector((state) => state.user.profile);
  const [currentProspectPage, setCurrentProspectPage] = useState(0);
  const [prospectPageSize, setProspectPageSize] = useState(10);
  const [maxProspectPages, setMaxProspectPages] = useState(0);
  const [currentSalesPage, setCurrentSalesPage] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [salesPageSize, setSalesPageSize] = useState(10);
  const [maxSalesPages, setMaxSalesPages] = useState(0);
  const [currentTable, setCurrentTable] = useState("prospect");
  const [currentTableTotalCount, setCurrentTableTotalCount] = useState(null);
  const [selecTime, setselecTime] = useState("");
  const [productName, setProductName] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [customerPhoneDup, setCustomerPhoneDup] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sideMenu, setsideMenu] = useState(false);
  const profile = useUserProfile();

  //save query params for sell and prospect
  const [saveparamProspect, setSaveparamProspect] = useState("");
  const [saveparamSell, setSaveparamSell] = useState("");

  const handleChange = (e) => {
    if (e.target.value === "sales") {
      setCurrentTable("sales");
      setTableData(salesTableData);
      setTableDataDup(salesTableData);
    } else {
      setCurrentTable("prospect");
      setTableData(prospectTableData);
      setTableDataDup(prospectTableData);
    }
  };

  const handleTime = (event) => {
    setselecTime(event.target.value);
  };

  const handleCustomerPhoneChange = (value) => {
    // Check if the phone number doesn't start with '+91'
    setCustomerPhone(value);
    if (value && !value.startsWith("+91")) {
      // Add '+91' to the phone number
      setCustomerPhoneDup(`+91${value}`);
    } else {
      // If it already starts with '+91', set as it is
      setCustomerPhoneDup(value);
    }
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/getAllUsers`)
      .then((res) => {
        setUserEmailList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    getData();
  }, [currentProspectPage, prospectPageSize, selecTime]);

  function getData() {
    const queryParams = new URLSearchParams();

    if (productName !== null) {
      queryParams.append("productName", productName);
    }

    if (selecTime != "") {
      queryParams.append("filter", selecTime);
    }

    if (customerId !== null) {
      queryParams.append("customerId", customerId);
    }
    if (customerPhone !== null) {
      // queryParams.append("customerPhone", customerPhone);
      queryParams.append("customerPhone", customerPhoneDup);
    }
    if (userEmail !== null) {
      queryParams.append("store", userEmail);
    }
    if (fromDate !== "") {
      // queryParams.append("startDate", fromDate);
      queryParams.append("startDate", fromDateDup);
    }
    if (toDate !== "") {
      // queryParams.append("endDate", toDate);
      queryParams.append("endDate", toDateDup);
    }

    setSaveparamProspect(queryParams.toString());
    const endpoint = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/prospects/findAll?page=${currentProspectPage}&limit=${prospectPageSize}&${queryParams.toString()}`;

    // axios
    //   .get(
    //     `${
    //       import.meta.env.VITE_REACT_APP_ENDPOINT
    //     }/api/prospects/findAll?page=${currentProspectPage}&limit=${prospectPageSize}&filter=${selecTime}`
    //   )
    axios
      .get(endpoint)
      .then((response) => {
        setMaxProspectPages(Math.ceil(response.data.totalCounts / 10));
        setProspectTableData(response.data.data);
        setTableData(response.data.data);
        setTableDataDup(response.data.data);
        setCurrentTableTotalCount(response.data.totalCounts);
        setLoading(false);
      })
      .catch((err) => {
        console.log("error", err);
        setLoading(false);
      });
  }

  useEffect(() => {
    getSalesData();
    setLoading(true);
  }, [currentSalesPage, salesPageSize, selecTime]);

  function getSalesData() {
    const queryParams = new URLSearchParams();

    if (productName !== null) {
      queryParams.append("productName", productName);
    }

    if (selecTime != null) {
      queryParams.append("filter", selecTime);
    }

    if (customerId !== null) {
      queryParams.append("customerId", customerId);
    }
    if (customerPhone !== null) {
      // queryParams.append("customerPhone", customerPhone);
      queryParams.append("customerPhone", customerPhoneDup);
    }
    if (userEmail !== null) {
      queryParams.append("store", userEmail);
    }
    if (fromDate !== "") {
      // queryParams.append("startDate", fromDate);
      queryParams.append("startDate", fromDateDup);
    }
    if (toDate !== "") {
      // queryParams.append("endDate", toDate);
      queryParams.append("endDate", toDateDup);
    }

    setSaveparamSell(queryParams.toString());

    const endpoint = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/prospects/findAllSelled?page${currentSalesPage}&limit=${salesPageSize}&${queryParams.toString()}`;
    // axios
    //   .get(
    //     `${
    //       import.meta.env.VITE_REACT_APP_ENDPOINT
    //     }/api/prospects/findAllSelled?page=${currentSalesPage}&limit=${salesPageSize}&filter=${selecTime}`
    //   )
    axios
      .get(endpoint)
      .then((response) => {
        setSalesTableData(response.data.data);
        setMaxSalesPages(Math.ceil(response.data.totalCounts / 10));
        setTableData(response.data.data);
        setTableDataDup(response.data.data);
        setCurrentTableTotalCount(response.data.totalCounts);
        setLoading(false);
      })
      .catch((err) => {
        console.log("error", err);
        setLoading(false);
      });
  }

  const handleCloseModal = () => {
    setShowUploadModal(false);
  };

  const handleFilterSearch = (e) => {
    e.preventDefault();
    console.log("table is ", currentTable);
    if (currentTable === "prospect") {
      getData();
    } else {
      console.log("table is ", currentTable);
      getSalesData();
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  // const handleFromDateChange = (date) => {
  //   setFromDate(date);
  //   console.log("from data", date);
  // };

  // const handleToDateChange = (date) => {
  //   setToDate(date);
  //   console.log("TO data", date);
  // };
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

  // const handleInputChange = (e) => {
  //   // You can add your custom input handling logic here
  //   console.log(e.target.value);
  // };
  return (
    <div>
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={loading} size={15} />
        </div>
      )}
      {/* <div className="flex items-center w-screen h-20 p-4 bg-white HEADER">
        <img
          src={downArrow}
          alt="arrow"
          className="h-5 md:h-8 w-12.5 transform rotate-90"
        />
        <div className="flex justify-between w-full">
          <span className="w-4/5 ml-4 text-xl md:text-3xl">
            Sales/Prospect Data
          </span>
          <p className="mr-4 text-xl md:text-3xl">{profile?.name}</p>
        </div>
      </div> */}
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <div className="flex justify-between p-4">
        <select
          onChange={handleChange}
          className="p-1 sm:p-3  text-base sm:text-xl rounded-lg text-[#EC2752] font-semibold  focus:outline-none"
          value={currentTable}
        >
          <option
            className="text-base font-semibold sm:text-xl"
            value="prospect"
          >
            Prospect
          </option>
          <option className="text-base font-semibold sm:text-xl" value="sales">
            Sales
          </option>
        </select>

        <select
          onChange={handleTime}
          className="rounded-lg text-[#EC2752] font-semibold p-1 sm:p-3  text-base sm:text-xl focus:outline-none"
          value={selecTime}
        >
          <option value="">Select duration</option>
          <option className="text-base font-semibold sm:text-xl" value="7 days">
            7 days
          </option>
          <option
            className="text-base font-semibold sm:text-xl"
            value="15 days"
          >
            15 days
          </option>
          <option
            className="text-base font-semibold sm:text-xl"
            value="1 month"
          >
            1 month
          </option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row">
        <div className="p-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="p-1 sm:p-3 bg-white text-base sm:text-xl rounded-lg text-[#EC2752] font-semibold  focus:outline-none"
          >
            Upload Excel
          </button>
        </div>
        <div className="p-4">
          <DownloadSample />
        </div>
        <div className="p-4 absolute right-36 top-[88px] sm:right-48 sm:top-24">
          <ExportTableData
            selecTime={selecTime}
            currentTable={currentTable}
            currentTableTotalCount={currentTableTotalCount}
          />
        </div>
      </div>
      {/* <div>
        <Filter data={tableData} setTableDataDup={setTableDataDup} />
      </div> */}
      {/* uncomment for new filters */}
      <div className="w-full p-4 mx-auto rounded-lg sm:1/2 md:w-2/3 lg:w-1/2">
        <button
          className="mb-4 text-2xl font-semibold cursor-pointer"
          onClick={toggleFilter}
        >
          Filter Data
          {isFilterOpen ? (
            <RiArrowUpSLine className="inline-block text-xl" />
          ) : (
            <RiArrowDownSLine className="inline-block text-xl" />
          )}
        </button>
        <form
          className={`grid  grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-4 ${
            isFilterOpen ? "" : "hidden"
          }`}
        >
          <div>
            <p className="block text-sm font-medium text-gray-600">
              Product Name
            </p>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 p-2 w-[150px] sm:w-[250px]  border rounded-md"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-600">
              Customer Id
            </p>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-600">
              Customer Mobile
            </p>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => handleCustomerPhoneChange(e.target.value)}
              className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-600">
              Store Filter
            </p>
            <select
              className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
              name=""
              id=""
              onChange={(e) =>
                setUserEmail(e.target.value === "" ? null : e.target.value)
              }
              value={userEmail || ""}
            >
              <option value="">Select store</option>
              {userEmailList.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-600">From Date</p>
            <DatePicker
              selected={fromDate}
              onChange={handleFromDateChange}
              // onChangeRaw={handleInputChange}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
              placeholderText="Select from date"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-600">To Date</p>
            <DatePicker
              selected={toDate}
              onChange={handleToDateChange}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
              placeholderText="Select to date"
            />
          </div>

          <button
            onClick={handleFilterSearch}
            className="bg-[#EC2752] relative top-5 font-bold text-white rounded-md p-2 h-[40px] w-1/2 focus:outline-none"
          >
            Search
          </button>
          <DownloadFilter
            saveparamProspect={saveparamProspect}
            saveparamSell={saveparamSell}
            currentTable={currentTable}
            currentTableTotalCount={currentTableTotalCount}
          />
        </form>
      </div>
      <UserTable data={tableDataDup} />

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
            <div className="modal-content ">
              <CustomerUploadExcel closeModal={handleCloseModal} />
            </div>
          </div>
        </div>
      )}

      {currentTable === "prospect" ? (
        <div className="flex justify-center my-4">
          <button
            onClick={() => setCurrentProspectPage(currentProspectPage - 1)}
            disabled={currentProspectPage === 0}
            className={`mx-2 px-4 py-2 rounded-lg ${
              currentProspectPage === 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#EC2752] text-white cursor-pointer"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentProspectPage(currentProspectPage + 1)}
            disabled={currentProspectPage === maxProspectPages - 1}
            className={`mx-2 px-4 py-2 rounded-lg ${
              currentProspectPage === maxProspectPages - 1
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#EC2752] text-white cursor-pointer"
            }`}
          >
            Next
          </button>
        </div>
      ) : (
        <div className="flex justify-center my-4">
          <button
            onClick={() => setCurrentSalesPage(currentSalesPage - 1)}
            disabled={currentSalesPage === 0}
            className={`mx-2 px-4 py-2 rounded-lg ${
              currentSalesPage === 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#EC2752] text-white cursor-pointer"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentSalesPage(currentSalesPage + 1)}
            disabled={currentSalesPage === maxSalesPages - 1}
            className={`mx-2 px-4 py-2 rounded-lg ${
              currentSalesPage === maxSalesPages - 1
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#EC2752] text-white cursor-pointer"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
