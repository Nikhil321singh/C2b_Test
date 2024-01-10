import axios from "axios";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { IoMdDownload } from "react-icons/io";

const ExportTableData = ({
  selecTime,
  currentTable,
  currentTableTotalCount,
}) => {
  const [data, setData] = useState([]);
  const [finalEndPoint, setFinalEndPoint] = useState("");
  const fetchData = async () => {
    try {
      let endpoint = "";
      if (currentTable === "prospect") {
        endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?page=${0}&limit=${currentTableTotalCount}&filter=${selecTime}`;
      } else {
        endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAllSelled?page=${0}&limit=${currentTableTotalCount}&filter=${selecTime}`;
      }
      const response = await axios.get(endpoint);
      setData(response.data.data);
      downloadExcel(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const downloadExcel = (apiData) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const formattedData = apiData.map((item) => {
      return {
        phoneNumber: item.phoneNumber,
        "User Email": item.userId?.email,
        "Customer Mobile No.": item.phoneNumber,
        "Customer Name": item.name,
        Product: item.modelId?.name,
        Price: item.actualPrice,
        "Prospect Id": item.userId?._id,
        "IMEI No.": item.documentId?.IMEI,
      };
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const dataFile = new Blob([excelBuffer], { type: fileType });
    saveAs(dataFile, "Table_Data" + fileExtension);
  };
  return (
    <div>
      <button onClick={fetchData}>
        <IoMdDownload size={22} />
      </button>
    </div>
  );
};

export default ExportTableData;
