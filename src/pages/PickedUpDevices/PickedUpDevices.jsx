import React, { useEffect, useState, useRef } from "react";
import NavigateTable from "../../components/NavigateTable/NavigateTable";
import axios from "axios";
import styles from "./PickedUpDevices.module.css";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import ViewPickupTable from "../../components/ViewPickupTable/ViewPickupTable";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { BsCalendarDate } from "react-icons/bs";
import { BeatLoader } from "react-spinners";

const userRoles = ["Pickup", "Payroll"];

const PickedUpDevices = () => {
  const [userRole, setUserRole] = useState("");
  const [data, setData] = useState([]);
  const [showView, setShowView] = useState(false);
  const [viewRef, setViewRef] = useState("");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [tempId, setTempId] = useState();
  const [sideMenu, setsideMenu] = useState(false);
  const [errorMsg, setErrorMsg] = useState("successfully updated status");
  const [successMod, setSuccessMod] = useState(false);
  const [failMod, setFailMode] = useState(false);
  const [confMod, setConfMod] = useState(false);
  const [storeName, setStoreName] = useState();
  const [region, setRegion] = useState();
  const [storeData, setStoreData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [regionDrop, setRegionDrop] = useState(false);
  const [storeDrop, setStoreDrop] = useState(false);
  const [allStore, setAllStore] = useState([]);
  let firsttime = useRef(true);

  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setStoreName(LoggedInUser?.storeName);
    setRegion(LoggedInUser?.region);
    setUserRole(LoggedInUser?.role);
  }, []);

  useEffect(() => {
    if (failMod || successMod) {
      const timeoutId = setTimeout(() => {
        setFailMode(false);
        setSuccessMod(false);
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [failMod, successMod]);

  const getData = () => {
    setIsTableLoaded(true);
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    const token = sessionStorage.getItem("authToken");

    let config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/all?region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setErrorMsg(`Failed to load data`);
        setFailMode(true);
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
        console.log(response.data.result);
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
        console.log(error);
        setIsTableLoaded(false);
      });
  };

  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const token = sessionStorage.getItem("authToken");

    let config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/search?rid=${searchValue}&date=${dateValue}&region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    console.log(config);
    axios
      .request(config)
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
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

  const handleSearchClick = () => {
    getDataBySearch();
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
    console.log(dateValue);
  };

  const confHandler = (id) => {
    setTempId(id);
    setIsTableLoaded(true);
    setConfMod(true);
  };

  const statusUpdateHandler = (refID, newStatus) => {
    setIsTableLoaded(true);
    setConfMod(false);
    const token = sessionStorage.getItem("authToken");

    let data = JSON.stringify({
      refIDs: [refID],
      newStatus: newStatus,
    });

    console.log(data);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/update`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        getData();
        setErrorMsg(
          `Successfully updated the status of lot ${refID} to ${newStatus}`
        );
        if (newStatus === "Pickup Confirmed") {
          setErrorMsg(`Pickup Confirmed for lot ${refID}, check it on history`);
        }
        setSuccessMod(true);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setErrorMsg(
          `Failed to updated the status of lot ${refID} to ${newStatus}`
        );
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  const viewHandler = (refID) => {
    setViewRef(refID);
    setShowView(true);
  };

  return (
    <div className={`${styles.pickedup_page}`}>
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
      {(successMod || failMod) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div
            className={`${styles.err_mod_box} ${
              successMod ? "text-green-500" : "text-[#EC2752]"
            }`}
          >
            {successMod ? (
              <IoIosCheckmarkCircle
                className={successMod ? "text-green-500" : "text-[#EC2752]"}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={successMod ? "text-green-500" : "text-[#EC2752]"}
                size={90}
              />
            )}
            <h6 className={successMod ? "text-green-500" : "text-[#EC2752]"}>
              {successMod ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errorMsg}</p>
            <button
              onClick={() => {
                setSuccessMod(false);
                setFailMode(false);
              }}
              className={
                successMod
                  ? "bg-green-500 text-white"
                  : "bg-[#EC2752] text-white"
              }
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confMod && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div
            className={`${styles.err_mod_box} ${
              successMod ? "text-green-500" : "text-[#EC2752]"
            }`}
          >
            <h6 className={successMod ? "text-green-500" : "text-[#EC2752]"}>
              Confirmation!
            </h6>
            <p className="text-slate-500">
              Confirm Pickup for lot {" " + tempId + " "} ?
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => statusUpdateHandler(tempId, "Pickup Confirmed")}
                className={"bg-[#EC2752] text-white"}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfMod(false), setIsTableLoaded(false);
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
      <div className="flex flex-row m-2 gap-4"></div>
      <NavigateTable />
      <div className="m-2 flex flex-col gap-2">
        <div className="mt-[3px] flex gap-2 items-center outline-none">
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className="text-sm"
              type="text"
              placeholder="Search"
              value={searchValue}
            />
            <IoMdSearch onClick={handleSearchClick} size={34} />
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
        <div className="flex gap-2 w-100 items-center outline-none">
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
              <FaAngleDown
                size={17}
                className={`${storeDrop && "rotate-180"}`}
              />
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
      </div>
      <div className={`${styles.pd_cont}`}>
        <div className="m-2 overflow-x-auto md:m-5">
          {showView && (
            <div className={styles.view_wrap}>
              <ViewPickupTable refNo={viewRef} setShowView={setShowView} />
            </div>
          )}
          <table className="w-full border border-[#EC2752]">
            <thead className="bg-[#EC2752] text-white">
              <tr>
                <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
                <th className="p-2 text-sm md:p-3 md:text-base">Status</th>
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
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200" : ""}
                >
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {userRoles[userRole] === "Store" && (
                      <div className="flex flex-col gap-1">
                        <button
                          className={`${styles.view_btn}`}
                          onClick={() => viewHandler(val?._id)}
                        >
                          View
                        </button>
                      </div>
                    )}

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
                              onClick={() =>
                                statusUpdateHandler(
                                  val?._id,
                                  "Pending Pickup Confirmation"
                                )
                              }
                              className={`${styles.acpt_btn}`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                statusUpdateHandler(
                                  val?._id,
                                  "Payroll Approval Rejected"
                                )
                              }
                              className={`${styles.rjct_btn}`}
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {val?.status === "Payroll Approval Rejected" && (
                          <button
                            onClick={() =>
                              statusUpdateHandler(
                                val?._id,
                                "Pending Pickup Confirmation"
                              )
                            }
                            className={`${styles.acpt_btn}`}
                          >
                            Accept
                          </button>
                        )}

                        {val?.status === "Pending Pickup Confirmation" && (
                          <button
                            onClick={() =>
                              statusUpdateHandler(
                                val?._id,
                                "Payroll Approval Rejected"
                              )
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
                        {val?.status === "Pending Pickup Confirmation" && (
                          <button
                            onClick={() => confHandler(val?._id)}
                            className={`${styles.acpt_btn}`}
                          >
                            Pickup
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {val?.status}
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
    </div>
  );
};

export default PickedUpDevices;
