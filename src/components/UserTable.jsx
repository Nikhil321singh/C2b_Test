import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerFormDetails from "./CustomerFormDetails";
import { IoCloseOutline } from "react-icons/io5";
import CustomerImageDetails from "./CustomerImageDetails";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { IoMdDownload } from "react-icons/io";
import { FaFilePdf } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";
import html2pdf from "html2pdf.js";
import PurchaseReceipt from "./Reciept";
import { BeatLoader } from "react-spinners";

const UserTable = ({ data }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [QNAData, setQNAData] = useState([]);
  const [dataIndex, setDataIndex] = useState(null);
  const [receiptIndex, setReceiptIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetailsClick = (value) => {
    setQNAData(value.QNA);
    setShowModal(true);
  };

  const handleImageModal = (index) => {
    setDataIndex(index);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowImageModal(false);
  };

  function hanldlejsx_pdf(index) {
    const dateString = data[index]?.updatedAt;
    const formattedDate = new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    setReceiptIndex(index);
    const printElement = ReactDOMServer.renderToString(
      <PurchaseReceipt
        phoneNumber={data[index]?.phoneNumber}
        imeiNumber={data[index]?.documentId?.IMEI}
        phoneName={data[index]?.modelId?.name}
        storage={data[index]?.storage}
        RAM={data[index]?.ram}
        formattedDate={formattedDate}
      />
    );
    html2pdf().from(printElement).save("purchase_receipt.pdf");
  }
  return (
    <div className="m-2 overflow-x-auto md:m-5">
      <table className="w-full border border-[#EC2752]">
        <thead className="bg-[#EC2752] text-white">
          <tr>
            {/* uncomment */}
            <th className="p-2 text-sm md:p-3 md:text-base">Date</th>
            <th className="p-2 text-sm md:p-3 md:text-base">User Email</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Customer Mobile</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Customer Name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Product</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Price</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Prospect Id</th>
            <th className="p-2 text-sm md:p-3 md:text-base">IMEI No.</th>
            <th className="p-2 text-sm md:p-3 md:text-base">More Details</th>
            {/* uncomment */}
            <th className="p-2 text-sm md:p-3 md:text-base">Images</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Reciept</th>
          </tr>
        </thead>
        <tbody>
          {data.map((val, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
              {/* uncomment */}
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
                {/* {typeof val.price === "object" ? " " : val.price} */}
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
              {/* uncomment */}
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
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
            <div className="modal-content ">
              <CustomerFormDetails
                QNAData={QNAData}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
            <div className="modal-content ">
              <CustomerImageDetails
                imageData={data[dataIndex]}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
