import React, { useEffect, useRef, useState } from "react";
import { useAnswerContext } from "../components/AnswerContext";
import useUserProfile from "../utils/useUserProfile";
import Price from "./Price";
import axios from "axios";
import OTPpage from "./OTP_page";
import { useDispatch, useSelector } from "react-redux";
import { setResponseData } from "../store/slices/responseSlice";

const InputNumber = () => {
  const token = sessionStorage.getItem("authToken");
  const id = JSON.parse(localStorage.getItem("dataModel"));
  const [number, setNumber] = useState("");
  const { filteredAnswers } = useAnswerContext();
  const [submitdata, setSubmitData] = useState({});
  const dispatch = useDispatch();
  const profile = useUserProfile();
  const [change, setChange] = useState(false);
  const isInitialMount = useRef(true);
  let otpVerification = useSelector((state) => state.otpVerification);
  console.log(otpVerification.otpVerified);
  const otpVerified = false;

  return otpVerification.otpVerified ? (
    <Price submitdata={submitdata} userToken={token} />
  ) : (
    <>
      <OTPpage
        setChange={setChange}
        change={change}
        setNumber={setNumber}
      ></OTPpage>
    </>
  );
};

export default InputNumber;