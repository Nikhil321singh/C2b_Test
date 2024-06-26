import React, { useEffect, useState } from "react";
import OrdersCard from "../../components/OrdersCard/OrdersCard";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../SelectDeviceType/SelectDeviceType.module.css";
import { CiSearch } from "react-icons/ci";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { useQuestionContext } from "../../components/QuestionContext";
import OrederQuoteCreated from "../../components/OrderQuoteCreated/OrderQuoteCreated";

const OrdersCreated = ({ daysfilters, head }) => {
  return (
    <OrederQuoteCreated
      orderType={"orderData"}
      daysfilters={daysfilters}
      head={head}
    />
  );
};

export default OrdersCreated;
