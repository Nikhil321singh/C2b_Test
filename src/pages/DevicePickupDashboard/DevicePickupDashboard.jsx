import React, { useEffect, useRef, useState } from "react";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import NavigateTable from "../../components/NavigateTable/NavigateTable";
import PendingDevicesTable from "../../components/PendingDevicesTable/PendingDevicesTable";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import { BsCalendarDate } from "react-icons/bs";
import styles from "./DevicePickupDashboard.module.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import SideMenu from "../../components/SideMenu";
import AdminNavbar from "../../components/Admin_Navbar";
import ProfileBox from "../../components/ProfileBox/ProfileBox";

const DevicePickupDashboard = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [pendingTableData, setPendingTableData] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [devicesCount, setDevicesCount] = useState(0);
  const [devicesPrice, setDevicesPrice] = useState("0");
  const [dateValue, setDateValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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
    const token = sessionStorage.getItem("authToken");

    let config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/all?region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response?.data?.data[0]);
        if( response.data && response.data.data && response.data.data.length > 0){
          setPendingTableData(response.data.data[0].documents);
          setDevicesPrice(response.data.data[0].totalPrices.toString());
          setDevicesCount(response.data.data[0].count);
        }
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
      }/api/pendingDevices/search?rid=${searchValue}&date=${dateValue}&status=${statusValue}&region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };

    console.log(config);
    axios
      .request(config)
      .then((response) => {
        console.log(response.data);
        setPendingTableData([]);
        if (response.data.data.length === 0) {
          setDevicesPrice("0");
          setDevicesCount(0);
        } else {
          setPendingTableData(response.data.data[0].documents);
          setDevicesPrice(response.data.data[0].totalPrices.toString());
          setDevicesCount(response.data.data[0].count);
        }
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
  }, [statusValue, dateValue, storeName, region]);

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
    setSelectedStatus("");
    setDateValue("");
    getData();
  };

  const handleFilterClick = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const dateChangeHandler = (event) => {
    const formattedDate = new Date(event.target.value).toLocaleDateString(
      "en-GB"
    );
    setDateValue(formattedDate);
    console.log(dateValue);
  };

  const handleStatusUpdate = (event) => {
    setIsTableLoaded(true);
    const token = sessionStorage.getItem("authToken");
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    if (selectedIds.length === 0) {
      setIsTableLoaded(false);
      console.log("no device selected");
      setSelectedStatus("");
      setErrorMsg("No device selected");
      setFailMode(true);
      return;
    }

    const LDIds = pendingTableData
      .filter((obj) => selectedIds.includes(obj._id))
      .map((obj) => obj._id.toString());

    let data = JSON.stringify({
      deviceIDs: LDIds,
      newStatus: newStatus,
    });

    let data2 = JSON.stringify({
      deviceIDs: selectedIds,
      newStatus: newStatus,
    });

    console.log(data);

    let config;

    if (newStatus === "Available For Pickup" || newStatus === "On Hold") {
      config = {
        method: "post",
        url: `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/pendingDevices/update`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: data2,
      };
    } else {
      config = {
        method: "post",
        url: `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/pendingDevices/updatereq`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: data,
      };
    }

    axios
      .request(config)
      .then((response) => {
        //success at updating
        console.log(response.data);
        //re rendering the updated data
        getData();
        setSelectedIds([]);
        setSelectedData([]);
        setSelectedRows([]);
        if (newStatus === "Available For Pickup" || newStatus === "On Hold") {
          setErrorMsg("Successfully updated status to " + newStatus);
        } else {
          setErrorMsg(
            `Successfully created ${newStatus} lot on Outstanding, RefId: ${response.data.data._id}`
          );
        }
        setSuccessMod(true);
      })
      .catch((error) => {
        //failed updating data
        console.log(error);
        setIsTableLoaded(false);
        setErrorMsg("Failed to update status");
        setFailMode(true);
      });
    setSelectedStatus("");
  };

  const confHandler = () => {
    setIsTableLoaded(true);
    if (selectedIds.length === 0) {
      setIsTableLoaded(false);
      console.log("no device selected");
      setErrorMsg("No device selected");
      setFailMode(true);
      return;
    } else {
      setConfMod(true);
    }
  };

  const address = allStore.find((store) => store.storeName === storeName)?._id;
  let profile = JSON.parse(sessionStorage.getItem("profile"));
  let id = profile._id;

  console.log(address);
  console.log(id);

  const reqPickupHandler = () => {
    setConfMod(false);
    const token = sessionStorage.getItem("authToken");

    const statuschk = selectedIds.every((sId) =>
      pendingTableData.some(
        (device) =>
          device._id === sId && device.status === "Available For Pickup"
      )
    );

    if (!statuschk) {
      setIsTableLoaded(false);
      console.log("Some devices are not -Available for Pickup-");
      setErrorMsg("Some devices are not Available for Pickup");
      setFailMode(true);
      return;
    }
    const address = allStore.find(
      (store) => store.storeName === storeName
    )?._id;
    let profile = JSON.parse(sessionStorage.getItem("profile"));
    let id = profile._id;

    const LDIds = pendingTableData
      .filter((obj) => selectedIds.includes(obj._id)) // Filter objects based on array2
      .map((obj) => obj._id.toString()); // Map to leadData._id

    let data = JSON.stringify({
      deviceIDs: LDIds,
      storeid: address,
      userid: id,
    });
    console.log(data);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/pickupreq`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        //success at creating lot
        console.log(response.data);
        setSelectedIds([]);
        setSelectedData([]);
        setSelectedRows([]);
        getData();
        setErrorMsg(
          `Successfully created lot on Picked Up, RefId: ${response.data.data._id}`
        );
        setSuccessMod(true);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        //failed creating lot
        console.log(error);
        setErrorMsg(`Failed to create lot`);
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  const downloadExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const formattedData = pendingTableData.map((item) => {
      return {
        "Lead Id": item._id,
        Date: new Date(item.createdAt).toLocaleDateString("en-GB"),
        "Device Name": item.modelName,
        "IMEI No": item.modelId,
        "Model Id": item.modelId,
        Storage: item.storage,
        Price: item.price,
        Status: item.status,
        Location: item.location,
      };
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const dataFile = new Blob([excelBuffer], { type: fileType });
    saveAs(dataFile, "Pending_Devices_Data" + fileExtension);
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
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
              Do you want to send {" " + selectedIds.length + " "} devices for
              Pickup ?
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={reqPickupHandler}
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
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER header">
        {profile.role === "Technician" ? (
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
      <NavigateTable />

      <div className="flex flex-row justify-end items-center py-1 px-2 font-medium text-sm text-[#EC2752]">
        Total Device : {devicesCount} | Total Amount :{" "}
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(devicesPrice)}
      </div>

      <div className="px-2 flex flex-col gap-2">
        <div className="flex gap-2 items-center outline-none">
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
        <div className="flex gap-2 items-center outline-none">
          <div className="relative">
            <div
              className={`${styles.filter_button}`}
              onClick={handleFilterClick}
            >
              <p className="truncate">
                {statusValue === "" ? "Select Status" : statusValue}
              </p>
              <FaAngleDown
                size={17}
                className={`${showFilterDropdown && "rotate-180"}`}
              />
            </div>
            {showFilterDropdown && (
              <div className={`${styles.filter_drop}`}>
                <div
                  onClick={() => {
                    setStatusValue("Available For Pickup");
                    handleFilterClick();
                  }}
                  className={`${styles.filter_option}`}
                >
                  <p>Available for Pickup</p>
                </div>
                <div
                  onClick={() => {
                    setStatusValue("On Hold");
                    handleFilterClick();
                  }}
                  className={`${styles.filter_option}`}
                >
                  <p>On Hold</p>
                </div>
                <div
                  onClick={() => {
                    setStatusValue("Cancelled");
                    handleFilterClick();
                  }}
                  className={`${styles.filter_option}`}
                >
                  <p>Cancelled</p>
                </div>
                <div
                  onClick={() => {
                    setStatusValue("");
                    handleFilterClick();
                  }}
                  className={`${styles.filter_option}`}
                >
                  <p>Show All</p>
                </div>
              </div>
            )}
          </div>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={downloadExcel}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>
        <div className="flex gap-2 w-100 items-center outline-none">
          <div className="relative w-[45%]">
            <div
              className={`w-[100%] ${styles.filter_button}`}
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
              <div className={`w-[100%] ${styles.filter_drop}`}>
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
              className={`w-[100%] ${styles.filter_button}`}
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
              <div className={`w-[100%] ${styles.filter_drop}`}>
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
      <PendingDevicesTable
        pendingTableData={pendingTableData}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
        selectedData={selectedData}
        selectedRows={selectedRows}
      />

      <div className="mx-2 flex gap-2">
        <select
          className="border-2 w-1/2 outline-none border-[#EC2752] bg-[#EC2752] text-white text-[12px] px-4 py-2 rounded"
          value={selectedStatus}
          onChange={handleStatusUpdate}
        >
          <option value="">Status</option>
          <option value="Available For Pickup">Available For Pickup</option>
          <option value="On Hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          onClick={confHandler}
          className="border-2 w-1/2 border-[#EC2752] bg-[#EC2752] text-white text-[12px] px-4 py-2 rounded"
        >
          Request For Pickup
        </button>
      </div>
    </div>
  );
};

export default DevicePickupDashboard;
