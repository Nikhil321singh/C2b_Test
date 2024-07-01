import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { BeatLoader } from "react-spinners";
import * as XLSX from "xlsx";
import styles from "../CompanyListingDetails/CompanyListingDetails.module.css";
import axios from "axios";
import LeadsCompletedTable from "../../components/LeadsCompletedTable/LeadsCompletedTable";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import DatePicker from "react-datepicker";
import { FaDownload } from "react-icons/fa";
import NavigateListing from "../../components/NavigateListing/NavigateListing";

const pageLimit = 10;
const userToken = sessionStorage.getItem("authToken");

const downloadExcelLeadsompleted = (apiData) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const formattedData = apiData.map((item) => {
    let questionsKeys = "";
    let index = 1;
    console.log(item?.QNA[0]);
    for (const group in item?.QNA[0]) {
      item?.QNA[0][group].forEach((qna) => {
        questionsKeys += `${index}. ${qna?.quetion} - ${qna?.key}\n`;
        index++;
      });
    }
    return {
      "Date Created": new Date(item?.createdAt).toLocaleDateString("en-IN"),
      phoneNumber: item.phoneNumber,
      "User Email": item.userId?.email,
      "Customer Mobile No.": item.phoneNumber,
      "Customer Name": item.name,
      Product: item.modelId?.name,
      Price: item.actualPrice,
      "Prospect Id": item.userId?._id,
      "IMEI No.": item.documentId?.IMEI,
      "Question/Ans": questionsKeys,
    };
  });

  const wsLeadsCompleted = XLSX.utils.json_to_sheet(formattedData);
  const wbLeadsCompleted = {
    Sheets: { data: wsLeadsCompleted },
    SheetNames: ["data"],
  };
  const excelBufferLeadsCompleted = XLSX.write(wbLeadsCompleted, {
    bookType: "xlsx",
    type: "array",
  });

  const dataFileLeadsCompleted = new Blob([excelBufferLeadsCompleted], {
    type: fileType,
  });
  saveAs(dataFileLeadsCompleted, "Leads_Completed" + fileExtension);
};

const LeadsCompleted = () => {
  const [loading, setLoading] = useState(false);
  const [sideMenu, setsideMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [maxPages, setMaxPages] = useState(0);
  const [productName, setProductName] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [userEmailList, setUserEmailList] = useState([]);
  const [fromDateDup, setFromDateDup] = useState("2023-01-01");
  const [toDateDup, setToDateDup] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  function getSalesData() {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (productName !== null) {
      queryParams.append("productName", productName);
    }
    if (customerId !== null) {
      queryParams.append("customerId", customerId);
    }
    if (customerPhone !== null) {
      queryParams.append("customerPhone", customerPhone);
    }
    if (userEmail !== null) {
      queryParams.append("store", userEmail);
    }
    const endpoint = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/prospects/findAllSelled?page=${currentPage}&limit=${pageLimit}&startDate=${fromDateDup}&endDate=${toDateDup}&${queryParams.toString()}`;
    axios
      .get(endpoint, {
        headers: { authorization: userToken },
      })
      .then((response) => {
        setMaxPages(Math.ceil(response.data.totalCounts / 10));
        setTableData(response.data.data);
        setTotalCount(response.data.totalCounts);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }

  useEffect(() => {
    getSalesData();
  }, [currentPage, pageLimit]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/getAllUsers`, {
        headers: { authorization: userToken },
      })
      .then((res) => {
        setUserEmailList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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
    }
  };

  const handleFilterSearch = (e) => {
    e.preventDefault();
    getSalesData();
  };
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  const handleCustomerPhoneChange = (value) => {
    setCustomerPhone(value);
  };

  return (
    <div>
      <SubLeadsCompleted
        loading={loading}
        setsideMenu={setsideMenu}
        sideMenu={sideMenu}
        totalCount={totalCount}
        toggleFilter={toggleFilter}
        isFilterOpen={isFilterOpen}
        productName={productName}
        setProductName={setProductName}
        customerId={customerId}
        setCustomerId={setCustomerId}
        customerPhone={customerPhone}
        handleCustomerPhoneChange={handleCustomerPhoneChange}
        setUserEmail={setUserEmail}
        userEmail={userEmail}
        userEmailList={userEmailList}
        fromDate={fromDate}
        handleFromDateChange={handleFromDateChange}
        toDate={toDate}
        handleToDateChange={handleToDateChange}
        handleFilterSearch={handleFilterSearch}
        tableData={tableData}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        maxPages={maxPages}
      />
    </div>
  );
};

const SubLeadsCompleted = ({
  loading,
  setsideMenu,
  sideMenu,
  toggleFilter,
  isFilterOpen,
  totalCount,
  productName,
  setProductName,
  customerId,
  setCustomerId,
  customerPhone,
  handleCustomerPhoneChange,
  setUserEmail,
  userEmail,
  userEmailList,
  fromDate,
  handleFromDateChange,
  toDate,
  handleToDateChange,
  handleFilterSearch,
  tableData,
  setCurrentPage,
  currentPage,
  maxPages,
}) => {
  const fetchDownloadData = () => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAllSelled?page=${0}&limit=${totalCount}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        downloadExcelLeadsompleted(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="overflow-y-hidden">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={loading} size={15} />
        </div>
      )}
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <NavigateListing />
      <div className="mt-2 ml-4">
        <button
          className={`${styles.bulkdown_button}`}
          onClick={fetchDownloadData}
        >
          <FaDownload /> Bulk Download
        </button>
      </div>
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
              value={customerPhone}
              type="text"
              className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
              onChange={(e) => handleCustomerPhoneChange(e.target.value)}
            />
          </div>
          <div>
            <p className="block text-sm text-gray-600 font-medium">
              Store Filter
            </p>
            <select
              className="mt-1  w-[150px] p-2 sm:w-[250px] border rounded-md"
              id=""
              name=""
              value={userEmail || ""}
              onChange={(e) =>
                setUserEmail(e.target.value === "" ? null : e.target.value)
              }
            >
              <option value="">Select store</option>
              {userEmailList.map((particularUser) => (
                <option key={particularUser._id} value={particularUser._id}>
                  {particularUser.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="block font-medium text-gray-600">From Date</p>
            <DatePicker
              selected={fromDate}
              onChange={handleFromDateChange}
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
        </form>
      </div>
      <LeadsCompletedTable data={tableData} />
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

export default LeadsCompleted;
