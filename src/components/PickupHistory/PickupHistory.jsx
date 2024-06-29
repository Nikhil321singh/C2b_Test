import { useEffect, useState, useRef } from "react";
import NavigateTable from "../NavigateTable/NavigateTable";
import styles from "./PickupHistory.module.css";
import ViewPickupTable from "../ViewPickupTable/ViewPickupTable";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import AdminNavbar from "../Admin_Navbar";
import SideMenu from "../SideMenu";
import ProfileBox from "../ProfileBox/ProfileBox";

const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
const userRole = LoggedInUser?.role;
const token = sessionStorage.getItem("authToken");

const downloadExcel = (pickupData) => {
  console.log("data down", pickupData);
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const formattedData = pickupData.map((item) => {
    return {
      "Lot Id": item._id,
      Date: new Date(item.createdAt).toLocaleDateString("en-GB"),
      Status: item.status,
      "Total Amount": item.totalAmount,
      "Total Devices": item.totalDevice,
    };
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "Pickedup_Devices_Lots_Data" + fileExtension);
};

const PickupHistory = () => {
  const [pickupData, setPickupData] = useState([]);
  const [showView, setShowView] = useState(false);
  const [viewRef, setViewRef] = useState("");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [sideMenu, setsideMenu] = useState(false);
  const [storeName, setStoreName] = useState(LoggedInUser?.storeName);
  const [region, setRegion] = useState(LoggedInUser?.region);
  const [storeData, setStoreData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [regionDrop, setRegionDrop] = useState(false);
  const [storeDrop, setStoreDrop] = useState(false);
  const [allStore, setAllStore] = useState([]);
  const firsttime = useRef(true);

  const getData = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pickupDevices/history?region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        console.log(response.data.data);
        setPickupData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
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

  useEffect(() => {
    if (!!storeName && !!region) {
      getData();
      getStore();
      firsttime.current = false;
    }
  }, [storeName, region]);

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

  const viewHandler = (refID) => {
    setViewRef(refID);
    setShowView(true);
  };

  return (
    <div>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER header">
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
      <NavigateTable />
      <button
        className={`${styles.bulkdown_button}`}
        onClick={() => downloadExcel(pickupData)}
      >
        <FaDownload /> Bulk Download
      </button>
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
      <div className="m-2 overflow-x-auto md:m-5">
        {showView && (
          <div className={styles.view_wrap}>
            <ViewPickupTable refNo={viewRef} setShowView={setShowView} />
          </div>
        )}
        <PickupTable pickupData={pickupData} viewHandler={viewHandler} />
      </div>
    </div>
  );
};

const PickupTable = ({ pickupData, viewHandler }) => {
  return (
    <table className="w-full border border-[#EC2752]">
      <thead className="bg-[#EC2752] text-white">
        <tr>
          <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
          <th className="p-2 text-sm md:p-3 md:text-base">Status</th>
          <th className="p-2 text-sm md:p-3 md:text-base">Date</th>
          <th className="p-2 text-sm md:p-3 md:text-base">Refrence No</th>
          <th className="p-2 text-sm md:p-3 md:text-base">Number Of Device</th>
          <th className="p-2 text-sm md:p-3 md:text-base">Amount</th>
        </tr>
      </thead>
      <tbody>
        {pickupData.map((val, index) => (
          <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              <button
                className={`${styles.view_btn}`}
                onClick={() => viewHandler(val?._id)}
              >
                View
              </button>
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
  );
};

export default PickupHistory;
