import React, { useEffect, useState, useRef } from "react";
import DevicePriceCards from "../components/DevicePriceCards";
import ContinueButton from "../components/ContinueButton";
import downArrow from "../assets/down.png";
import { useHref, useNavigate } from "react-router-dom";
import { useAnswerContext } from "../components/AnswerContext";
import { useQuestionContext } from "../components/QuestionContext";
import useUserProfile from "../utils/useUserProfile";
import PricePage from "./Price";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import axios from "axios";
import OTPpage from "./OTP_page";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { setResponseData } from "../store/slices/responseSlice";
const InputNumber = () => {
  const [number, setNumber] = useState("");
  const [error, setError] = useState(false);
  const [showPrice, setShowPrice] = useState(true); //it should be false
  const { filteredAnswers } = useAnswerContext();
  const [userToken, setUserToken] = useState("");
  const [mobileId, setMobileId] = useState("");
  const [submitdata, setSubmitData] = useState({});
  const [storage, setStorage] = useState("");
  const [ram, setRAM] = useState("");
  const { answers, setAnswers } = useQuestionContext();
  const dispatch = useDispatch();
  const profile = useUserProfile();
  const navigate = useNavigate();

  const [change, setChange] = useState(false);
  // const otpVerified = useSelector((state) => state.otpVerification.otpVerified);
  // const otpVerified = useSelector((state) => {
  //   // console.log("otpasdasdas", state);
  //   console.log("otpasdasdas", state.otpVerification.otpVerified);
  //   return state.otpVerification.otpVerified;
  // });
  // const isInitialMount = useRef(true);

  const otpVerified=true;

  useEffect(() => {
    // console.log("chal rha h tbhi data aa rhah")
    const token = sessionStorage.getItem("authToken");
    let id = localStorage.getItem("dataModel");

    //  console.log('Token:', token);
    //  console.log('ID:', id);

    id = JSON.parse(id);
    setMobileId(id?.models?._id);
    setStorage(id?.models?.config?.storage);
    setRAM(id?.models?.config?.RAM);
    setUserToken(token);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
      } else {
        try {
          setError(false);
          const data = {
            QNA: filteredAnswers,
            phoneNumber: number,
            modelId: mobileId,
            storage: storage,
            ram: ram,
            name: profile.name,
          };
          const response = await axios.post(
            `${
              import.meta.env.VITE_REACT_APP_ENDPOINT
            }/api/questionnaires/calculatePrice`,
            data,
            {
              headers: {
                Authorization: `${userToken}`,
              },
            }
          );
          console.log("submit data", response.data);
          setSubmitData(response.data.data);

          sessionStorage.setItem("LeadId", response.data.data.id);
          sessionStorage.setItem("phoneNumber", number);
          sessionStorage.setItem(
            "responsedatadata",
            JSON.stringify(response.data.data)
          );
          dispatch(setResponseData(response.data.data));
          //ye chiz dalni h redux m
          setShowPrice(true);
          console.log("value is from input number");
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchData();
  }, [change, dispatch]); // Dependencies array

  function handleback() {
    navigate("/deviceinfo");
  }

  //now taking from redux
  // const showPriceStatus = sessionStorage.getItem("otpverified");
  // return showPrice ? (
  // return showPriceStatus ? (
  return otpVerified ? (
    <PricePage submitdata={submitdata} userToken={userToken} />
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
