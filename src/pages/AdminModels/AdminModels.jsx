import styles from "./AdminModels.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa6";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setMobileID,
  setRam,
  setStorage,
} from "../../store/slices/newAdminGrade";

const getEvenRowClass = (index, selectmodel, selectstorage, selectram, val) => {
  if (index % 2 === 0) {
    if (
      selectmodel === val.modelId &&
      selectstorage === val?.storage &&
      selectram === val?.RAM
    ) {
      return "bg-[#eb869c]";
    }
    return "bg-gray-200";
  }
  return "";
};

const downloadExcel = (data) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const formattedData = data.map((item) => {
    return {
      "Brand Id": item.brandId,
      "Brand Name": item.brandName,
      "Model Id": item?.modelId,
      "Model Name": item.modelName,
      RAM: item.RAM,
      Storage: item.storage,
      Price: item.price,
    };
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "All_Models_Data" + fileExtension);
};

const getRowClass = (selectmodel, selectstorage, selectram, val) => {
  if (
    selectmodel === val.modelId &&
    selectstorage === val?.storage &&
    selectram === val?.RAM
  ) {
    return "bg-[#eb869c]";
  }
  return "";
};

const getTextColorClass = (isSuccess) =>
  isSuccess ? "text-green-500" : "text-[#EC2752]";
const grestTheme = "bg-[#EC2752] text-white";
const token = sessionStorage.getItem("authToken");
const errMsg = "";
const selectedModel = "";
const admincategory = sessionStorage.getItem("admincategory");

const AdminModels = () => {
  const [data, setData] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectmodel, setSelectModel] = useState("");
  const [selectstorage, setSelectstorage] = useState("");
  const [selectram, setSelectram] = useState("");
  const [category, setCategory] = useState("Mobile");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [confBox, setConfBox] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleNext() {
    navigate("/adminhome");
  }
  const getData = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/brands/getAllBrandsModels?type=${category}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        const responseData = response.data.data;
        const allConfigurations = [];
        responseData.forEach((brand) => {
          brand.models.forEach((model) => {
            model.config.forEach((conf) => {
              const newConfig = {
                brandId: brand.brand._id,
                brandName: brand.brand.name,
                modelId: model._id,
                modelName: model.name,
                storage: conf.storage,
                RAM: conf.RAM,
                price: conf.price,
              };
              allConfigurations.push(newConfig);
            });
          });
        });
        setData(allConfigurations);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setIsTableLoaded(false);
      });
  };
  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/user/Dashboard/search/phones`,
      headers: { Authorization: token },
      data: JSON.stringify({
        name: searchValue,
        deviceType: admincategory,
      }),
    };
    axios
      .request(config)
      .then((response) => {
        const responseData = response.data;
        const allConfigurations = [];
        responseData.forEach((model) => {
          const brandName = model.name.split(" ")[0];
          model.config.forEach((conf) => {
            const newConfig = {
              brandId: model.brandId,
              modelId: model._id,
              brandName: brandName,
              modelName: model.name,
              storage: conf.storage,
              RAM: conf.RAM,
              price: conf.price,
            };
            allConfigurations.push(newConfig);
          });
        });
        setData(allConfigurations);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setIsTableLoaded(false);
      });
  };
  const selectHandler = (modelId, modelStorage, ram) => {
    setSelectModel(modelId);
    setSelectstorage(modelStorage);
    setSelectram(ram);
    dispatch(setMobileID(modelId));
    dispatch(setStorage(modelStorage));
    dispatch(setRam(ram));
  };
  const deleteHandler = (userID) => {
    setIsTableLoaded(true);
    setIsTableLoaded(false);
  };

  useEffect(() => {
    getData();
  }, [category]);

  useEffect(() => {
    sessionStorage.setItem("admincategory", "Mobile");
  }, []);

  const handleSearchClear = () => {
    setSearchValue("");
    getData();
  };

  return (
    <div className={`${styles.pickedup_page}`}>
     <ExtComps
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        sucBox={sucBox}
        setSucBox={setSucBox}
        setFailBox={setFailBox}
        failBox={failBox}
        confBox={confBox}
        deleteHandler={deleteHandler}
        setConfBox={setConfBox}
        selectedModel={selectedModel}
        setCategory={setCategory}
      />
      <div className="m-2 flex flex-col gap-2 items-center w-[100%]">
        <div className="flex gap-2 items-center justify-center outline-none mt-5 w-[100%]">
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className="text-sm"
              type="text"
              placeholder="Search Model"
              value={searchValue}
            />
            <IoMdSearch onClick={() => getDataBySearch()} />
          </div>
          <div className={styles.icons_box}>
            <IoRefresh onClick={handleSearchClear} className="" size={25} />
          </div>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={() => downloadExcel(data)}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>
      </div>
      <div className={`${styles.pd_cont}`}>
        <AdminModelsTable
          grestTheme1={grestTheme}
          data={data}
          selectmodel={selectmodel}
          selectstorage={selectstorage}
          selectram={selectram}
          selectHandler={selectHandler}
          deleteHandler={deleteHandler}
          category={category}
          handleNext={handleNext}
        />
      </div>
    </div>
  );
};

const ExtComps = ({
  isTableLoaded,
  setIsTableLoaded,
  sucBox,
  setSucBox,
  setFailBox,
  failBox,
  confBox,
  deleteHandler,
  setConfBox,
  selectedModel,
  setCategory,
}) => {
  const [sideMenu, setsideMenu] = useState(false);
  return <React.Fragment>
    <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="navbar">
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>
      </div>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
      {(sucBox || failBox) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            {sucBox ? (
              <IoIosCheckmarkCircle
                className={`${getTextColorClass(sucBox)}`}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={`${getTextColorClass(sucBox)}`}
                size={90}
              />
            )}
            <h6 className={`${getTextColorClass(sucBox)}`}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
                setFailBox(false);
              }}
              className={sucBox ? "bg-green-500 text-white" : grestTheme}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            <h6 className={`${getTextColorClass(sucBox)}`}>Confirmation!</h6>
            <p className="text-slate-500">
              {`Do you want to delete store - ${selectedModel} ?`} ?
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => deleteHandler(selectedModel)}
                className={grestTheme}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false);
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
      <div className="m-2 flex  gap-2 items-center w-[100%]">
        <div className="flex gap-2">
          <p className="font-medium">Select Category</p>
          <select
            className="bg-[#EC2752] text-white rounded-lg outline-none px-2 py-1"
            onChange={(e) => {
              setCategory(e.target.value);
              sessionStorage.setItem("admincategory", e.target.value);
            }}
          >
            <option
              className="bg-white text-[#EC2752] font-medium"
              value="Mobile"
            >
              Mobile
            </option>
            <option
              className="bg-white text-[#EC2752] font-medium"
              value="Watch"
            >
              Watch
            </option>
          </select>
        </div>
      </div>
  </React.Fragment>
}

const AdminModelsTable = ({
  grestTheme1,
  data,
  selectmodel,
  selectstorage,
  selectram,
  selectHandler,
  deleteHandler,
  category,
  handleNext,
}) => {
  return (
    <div className="m-2 overflow-x-auto md:m-5">
      <table className="w-full border border-[#EC2752]">
        <thead className={grestTheme1}>
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Brand</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Model Name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">RAM</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Storage</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Price</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((val, index) => (
            <tr
              key={index}
              className={`${getEvenRowClass(
                index,
                selectmodel,
                selectstorage,
                selectram,
                val
              )} ${getRowClass(selectmodel, selectstorage, selectram, val)}`}
            >
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <div className="flex flex-col gap-1">
                  <button
                    className={`${styles.view_btn}`}
                    onClick={() => {
                      selectHandler(val.modelId, val.storage, val?.RAM);
                    }}
                  >
                    Select
                  </button>
                  <button
                    className={`${styles.acpt_btn}`}
                    onClick={() => {
                      deleteHandler(val);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.brandName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.modelName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {category === "Mobile" ? val?.RAM : "-"}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {category === "Mobile" ? val?.storage : "-"}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mb-2">
        <button
          onClick={handleNext}
          className="text-center  mx-2 px-4 py-2 rounded-lg bg-[#EC2752] text-white cursor-pointer mt-3"
        >
          Next
        </button>
      </div>
    </div>
  );
};
export default AdminModels;
