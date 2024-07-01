import React, { useEffect, useRef, useState } from "react";
import NavigateTable from "../../components/NavigateTable/NavigateTable";
import axios from "axios";
import styles from "./OutStandingDevices.module.css";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import ViewPickupTable from "../../components/ViewPickupTable/ViewPickupTable";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import { BsCalendarDate } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";

const succTextColor = "text-green-500";
const failTextColor = "text-[#EC2752]";
const token = sessionStorage.getItem("authToken");
const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
const userRole = LoggedInUser?.role || "";
const PayrollRej = "Payroll Approval Rejected";

const downloadExcel = (dataDown) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const formattedData = dataDown.map((item) => {
    return {
      "Lot Id": item._id,
      "Date Created": new Date(item.createdAt).toLocaleDateString("en-GB"),
      "Last Update": new Date(item.updatedAt).toLocaleDateString("en-GB"),
      Status: item.status,
      "Requested Status": item.request,
      "Total Amount": item.totalAmount,
      "Total Devices": item.totalDevice,
    };
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "Outstanding_Devices_Lots_Data" + fileExtension);
};

const OutStandingDevices = () => {
  const [data, setData] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [tempId, setTempId] = useState();
  const [errorMsg, setErrorMsg] = useState("successfully updated status");
  const [successMod, setSuccessMod] = useState(false);
  const [failMod, setFailMode] = useState(false);
  const [confMod, setConfMod] = useState(false);
  const [storeName, setStoreName] = useState(LoggedInUser?.storeName);
  const [region, setRegion] = useState(LoggedInUser?.region);
  const [storeData, setStoreData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [allStore, setAllStore] = useState([]);
  const firsttime = useRef(true);

  useEffect(() => {
    if (failMod || successMod) {
      const timeoutId = setTimeout(() => {
        setFailMode(false);
        setSuccessMod(false);
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
    return () => {};
  }, [failMod, successMod]);

  const getData = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/outstanding/all?region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        setData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(`Failed to load data`);
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  const getStore = () => {
    setIsTableLoaded(true);
    const config = {
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
        const storeNamesArray = response.data.result.map(
          (store) => store.storeName
        );
        const uniqueRegionsArray = [
          ...new Set(response.data.result.map((store) => store.region)),
        ];
        setAllStore(allData);
        setStoreData(storeNamesArray);
        setRegionData(uniqueRegionsArray);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setIsTableLoaded(false);
      });
  };

  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/outstanding/search?rid=${searchValue}&date=${dateValue}&region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        setData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(`Failed to load data`);
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    if (firsttime.current && !!storeName && !!region) {
      getData();
      getStore();
      firsttime.current = false;
    } else if (!firsttime.current && !!storeName && !!region) {
      getDataBySearch();
    }
  }, [dateValue, storeName, region]);

  const confHandler = (id) => {
    setTempId(id);
    setIsTableLoaded(true);
    setConfMod(true);
  };

  return (
    <div className={`${styles.pickedup_page}`}>
      <ExtComps
        successMod={successMod}
        errorMsg={errorMsg}
        setSuccessMod={setSuccessMod}
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        failMod={failMod}
        setFailMode={setFailMode}
        confMod={confMod}
        setConfMod={setConfMod}
        setErrorMsg={setErrorMsg}
        getData={getData}
        tempId={tempId}
        setTempId={setTempId}
      />
      <div className="flex flex-row m-2 gap-4"></div>
      <NavigateTable />
      <OutstandingFilter
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        getDataBySearch={getDataBySearch}
        setDateValue={setDateValue}
        dateValue={dateValue}
        setRegion={setRegion}
        region={region}
        regionData={regionData}
        storeName={storeName}
        setStoreName={setStoreName}
        allStore={allStore}
        setStoreData={setStoreData}
        storeData={storeData}
        getData={getData}
      />
      <OutstandingTable
        data={data}
        confHandler={confHandler}
        setIsTableLoaded={setIsTableLoaded}
        getData={getData}
        setErrorMsg={setErrorMsg}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    </div>
  );
};

export default OutStandingDevices;

const ExtComps = ({
  successMod,
  errorMsg,
  setSuccessMod,
  isTableLoaded,
  setIsTableLoaded,
  failMod,
  setFailMode,
  confMod,
  setConfMod,
  setErrorMsg,
  getData,
  tempId,
  setTempId,
}) => {
  const [sideMenu, setsideMenu] = useState(false);

  const forwardReqHandler = (refID, newStatus) => {
    setIsTableLoaded(true);
    setConfMod(false);
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/outstanding/forwardreq`,
      headers: {
        Authorization: token,
      },
      data: JSON.stringify({
        refIDs: refID,
        newStatus: newStatus,
      }),
    };
    axios
      .request(config)
      .then((response) => {
        getData();
        setTempId();
        setErrorMsg(`Successfully forwarded lot ${refID} to pending devices`);
        setSuccessMod(true);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(`Failed to forward the request`);
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  return (
    <React.Fragment>
      <div className="flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER ">
        {userRole === "Technician" ? (
          <div className="flex items-center justify-between w-full ">
            <ProfileBox />
            <img className="w-28 " src={Grest_Logo} alt="app logo" />
          </div>
        ) : (
          <div className="navbar">
            <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
            <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
          </div>
        )}
      </div>
      {successMod && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle className={succTextColor} size={90} />
            <h6 className={succTextColor}>Success!</h6>
            <p className="text-slate-500">{errorMsg}</p>
            <button
              onClick={() => {
                setSuccessMod(false);
              }}
              className={"bg-green-500 text-white"}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failMod && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <IoIosCloseCircle className={failTextColor} size={90} />
            <h6 className={failTextColor}>Error!</h6>
            <p className="text-slate-500">{errorMsg}</p>
            <button
              onClick={() => {
                setFailMode(false);
              }}
              className={"bg-[#EC2752] text-white"}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confMod && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <h6 className={failTextColor}>Confirmation!</h6>
            <p className="text-slate-500">
              {`Do you want to update status of Lot - ${tempId} ?`}
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => forwardReqHandler(tempId, "Request Forwarded")}
                className={"bg-[#EC2752] text-white"}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfMod(false);
                  setIsTableLoaded(false);
                }}
                className="bg-white text-[#EC2752]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
    </React.Fragment>
  );
};

const OutstandingFilter = ({
  setSearchValue,
  searchValue,
  getDataBySearch,
  setDateValue,
  dateValue,
  setRegion,
  region,
  regionData,
  storeName,
  setStoreName,
  allStore,
  setStoreData,
  storeData,
  getData,
}) => {
  const [regionDrop, setRegionDrop] = useState(false);
  const [storeDrop, setStoreDrop] = useState(false);

  const handleRegionChange = (value) => {
    setRegionDrop(false);
    setStoreName("");
    const filteredStores = allStore.filter((store) => store.region === value);
    const storeNamesArray = filteredStores.map((store) => store.storeName);
    setStoreData(storeNamesArray);
    setRegion(value);
  };

  const handleStoreChange = (value) => {
    setStoreDrop(false);
    const filteredStores = allStore.filter(
      (store) => store.storeName === value
    );
    const newRegion = filteredStores[0].region;
    setRegion(newRegion);
    setStoreName(value);
  };

  const handleSearchClear = () => {
    setSearchValue("");
    setDateValue("");
    getData();
  };

  const dateChangeHandler = (event) => {
    const formattedDate = new Date(event.target.value).toLocaleDateString(
      "en-GB"
    );
    setDateValue(formattedDate);
  };

  return (
    <React.Fragment>
      <button
        className={`${styles.bulkdown_button}`}
        onClick={() => downloadExcel(data)}
      >
        <FaDownload /> Bulk Download
      </button>
      <div className="m-2 flex flex-col gap-2">
        <div className="flex gap-2 items-center outline-none">
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className="text-sm"
              type="text"
              placeholder="Search"
              value={searchValue}
            />
            <IoMdSearch onClick={() => getDataBySearch()} size={34} />
          </div>
          <div className={styles.icons_box}>
            <IoRefresh onClick={handleSearchClear} className="" size={25} />
          </div>
          <div
            className={`flex flex-row justify-center items-center ${styles.date_picker_wrap}`}
          >
            <input
              type="date"
              id="datepicker"
              style={{ color: "#EC2752" }}
              className=""
              value={dateValue}
              onChange={dateChangeHandler}
            />
            <div
              className={styles.date_box}
              onClick={() => document.getElementById("datepicker").showPicker()}
            >
              <p>{dateValue ? dateValue : "DD/MM/YYYY"}</p>
              <BsCalendarDate size={25} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex m-2 gap-2 w-100 items-center outline-none">
        <div className="relative w-[45%]">
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
              {regionData.map((item) => (
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
        <div className="relative w-[70%]">
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
            <div className={`${styles.filter_drop}`}>
              {storeData.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleStoreChange(item)}
                  className={`${styles.filter_option}`}
                >
                  <p className="truncate">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const OutstandingTable = ({
  data,
  confHandler,
  setIsTableLoaded,
  getData,
  setErrorMsg,
  setSuccessMod,
  setFailMode,
}) => {
  const [showView, setShowView] = useState(false);
  const [viewRef, setViewRef] = useState("");

  const viewHandler = (refID) => {
    setViewRef(refID);
    setShowView(true);
  };

  const statusUpdateHandler = (refID, newStatus) => {
    setIsTableLoaded(true);
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/outstanding/update`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        refIDs: [refID],
        newStatus: newStatus,
      }),
    };
    axios
      .request(config)
      .then((response) => {
        getData();
        setErrorMsg(
          `Successfully updated the status of lot ${refID} to ${newStatus}`
        );
        setSuccessMod(true);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(
          `Failed to updated the status of lot ${refID} to ${newStatus}`
        );
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  return (
    <div className={`${styles.pd_cont}`}>
      <div className="m-2 overflow-x-auto md:m-5">
        {showView && (
          <div className={styles.view_wrap}>
            <ViewPickupTable
              refNo={viewRef}
              setShowView={setShowView}
              fromOutStand={true}
            />
          </div>
        )}
        <table className="w-full border border-[#EC2752]">
          <thead className="bg-[#EC2752] text-white">
            <tr>
              <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Status</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Request</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Date</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Refrence No</th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                Number Of Device
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {(userRole === "Super Admin" ||
                    userRole === "Admin Manager") && (
                    <div className="flex flex-col gap-1">
                      <button
                        className={`${styles.view_btn}`}
                        onClick={() => viewHandler(val?._id)}
                      >
                        View
                      </button>
                      {val?.status === "Pending Payroll Approval" && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => confHandler(val?._id)}
                            className={`${styles.acpt_btn}`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              statusUpdateHandler(val?._id, PayrollRej)
                            }
                            className={`${styles.rjct_btn}`}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {val?.status === PayrollRej && (
                        <button
                          onClick={() => confHandler(val?._id)}
                          className={`${styles.acpt_btn}`}
                        >
                          Accept
                        </button>
                      )}

                      {val?.status === "Pending Pickup Confirmation" && (
                        <button
                          onClick={() =>
                            statusUpdateHandler(val?._id, PayrollRej)
                          }
                          className={`${styles.rjct_btn}`}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                  {userRole === "Technician" && (
                    <div className="flex flex-col gap-1">
                      <button
                        className={`${styles.view_btn}`}
                        onClick={() => viewHandler(val?._id)}
                      >
                        View
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.status}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.request}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {new Date(val.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?._id}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.totalDevice}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.totalAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
