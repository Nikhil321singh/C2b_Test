import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./ViewOfferDetailTable.module.css";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";
import { BeatLoader } from "react-spinners";

const ViewOfferDetailTable = ({ searchValue }) => {
  const [data, setData] = useState([]);
  const [update, SetUpdate] = useState(false);
  const navigate = useNavigate();

  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [confBox, setConfBox] = useState(false);
  const [selectedOffId, setSelectedOffId] = useState();
  const [selectedOffName, setSelectedOffName] = useState();

  const handleEdit = (item) => {
    item.editoffer = true;
    sessionStorage.setItem("rowData", JSON.stringify(item));
    console.log("hello");
    // Navigate to edit page
    navigate("/offers");
  };

  const deleteConfHandler = (offerID, offerName) => {
    setSelectedOffId(offerID);
    setSelectedOffName(offerName);
    setConfBox(true);
  };

  const handleDelete = async (id) => {
    setIsTableLoaded(true);
    setConfBox(false);
    const userToken = sessionStorage.getItem("authToken");

    const res = await axios
      .delete(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/delete/${id}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((response) => {
        SetUpdate(!update);
        setErrMsg("Succesfully deleted offer - " + selectedOffName);
        setSucBox(true);
        setIsTableLoaded(false);
      })
      .catch(() => {
        setErrMsg("Failed to deleted offer");
        setFailBox(true);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    const userToken = sessionStorage.getItem("authToken");

    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/offer/getOfferList?search=${searchValue}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [update, searchValue]);
  return (
    <div>
      {(sucBox || failBox) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div
            className={`${styles.err_mod_box} ${
              sucBox ? "text-green-500" : "text-[#EC2752]"
            }`}
          >
            {sucBox ? (
              <IoIosCheckmarkCircle
                className={sucBox ? "text-green-500" : "text-[#EC2752]"}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={sucBox ? "text-green-500" : "text-[#EC2752]"}
                size={90}
              />
            )}
            <h6 className={sucBox ? "text-green-500" : "text-[#EC2752]"}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
                setFailBox(false);
              }}
              className={
                sucBox ? "bg-green-500 text-white" : "bg-[#EC2752] text-white"
              }
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div
            className={`${styles.err_mod_box} ${
              sucBox ? "text-green-500" : "text-[#EC2752]"
            }`}
          >
            {/* <IoIosCheckmarkCircle className={successMod ? "text-green-500" : "text-[#EC2752]"} size={90}/> */}
            <h6 className={sucBox ? "text-green-500" : "text-[#EC2752]"}>
              Confirmation!
            </h6>
            <p className="text-slate-500">
              Do you want to delete offer{" - " + selectedOffName + " "} ?
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => handleDelete(selectedOffId)}
                className={"bg-[#EC2752] text-white"}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false), setIsTableLoaded(false);
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
      <div className="m-2 overflow-x-auto md:m-5">
        <table className="w-full border border-[#EC2752]">
          <thead className="bg-[#EC2752] text-white">
            <tr>
              <th className="p-2 text-sm md:p-3 md:text-base">Offer Name</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Price</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Valid From</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Valid To</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Created By</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Warranty</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.offerName}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.price}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {new Date(item.validFrom).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {new Date(item.validTo).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.createdBy}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.warranty.toString()}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  <select
                    className=" bg-[#F5F4F9] font-medium rounded-lg w-[100px] outline-none"
                    onChange={(e) => {
                      if (e.target.value === "Edit") {
                        handleEdit(item);
                      }
                      if (e.target.value === "Delete")
                        deleteConfHandler(item._id, item.offerName);
                    }}
                  >
                    <option value="">Choose Action</option>

                    <option value="Edit">Edit</option>
                    <option value="Delete">Delete</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
          {/* <tbody>
            {data.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {new Date(val?.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.userId?.email}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.phoneNumber}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.userId?.name}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.modelId?.name}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {typeof val.price === "object"
                    ? val.price["$numberDecimal"]
                    : val.price}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?._id}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {val?.documentId?.IMEI}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  <p
                    onClick={() => handleDetailsClick(val)}
                    className="cursor-pointer "
                  >
                    Details
                  </p>
                </td>

                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  <p
                    onClick={() => handleImageModal(index)}
                    className="cursor-pointer"
                  >
                    Click to open
                  </p>
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  <FaFilePdf
                    size={32}
                    color="red"
                    onClick={() => hanldlejsx_pdf(index)}
                    className="cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody> */}
        </table>
      </div>
    </div>
  );
};

export default ViewOfferDetailTable;
