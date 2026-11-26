import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./NavigateTable.module.css";

const NavigateTable = () => {
  const [selected, setSelected] = useState("pending");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/devicepickupdashboard") {
      setSelected("pending");
    } else if (location.pathname === "/pickedupdevices") {
      setSelected("pickedup");
    } else if (location.pathname === "/pickuphistory") {
      setSelected("pickupHistory");
    } else {
      setSelected("outstanding");
    }
  }, []);

  const handleTable = (tableName) => {
    setSelected(tableName);
    if (tableName === "pending") {
      navigate("/devicepickupdashboard");
    } else if (tableName === "pickedup") {
      navigate("/pickedupdevices");
    } else if (tableName === "pickupHistory") {
      navigate("/pickuphistory");
    } else {
      navigate("/outstanding");
    }
  };

  return (
    <div className={`${styles.navigation_wrap}`}>
      <button
        onClick={() => handleTable("pending")}
        className={`${
          selected === "pending" ? styles.button_sel : styles.button_unsel
        }`}
      >
        Pending
      </button>
      {/* "Picked Up" is hidden: payment requests are now handled on
          Customer Payouts > Store Requests. /pickedupdevices still opens by
          its link for older pickup lots. */}
      <button
        onClick={() => handleTable("pickupHistory")}
        className={`${
          selected === "pickupHistory" ? styles.button_sel : styles.button_unsel
        }`}
      >
        History
      </button>
    </div>
  );
};

export default NavigateTable;
