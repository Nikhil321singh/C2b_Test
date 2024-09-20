import React, { useState, useEffect } from "react";
import styles from "../components/ContOTP/ContOTP.module.css";
import optImg from "../assets/otpLogo.svg";
import OtpInput from "otp-input-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setOtpVerified } from "../store/slices/otpSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import { MdEdit } from "react-icons/md";
import ProfileBox from "../components/ProfileBox/ProfileBox";
import Grest_Logo from "../assets/Grest_Logo.jpg";
import { setLeadOTPData } from "../store/slices/responseSlice";
import { MainOtpUI } from "../components/ContOTP/ContOTP";

function OTPpage({ setChange, change, setNumber }) {
  const initVal = useSelector( state => state.responseData);
  const navigate = useNavigate();
  const [ph, setPh] = useState(initVal.phone);
  const [otpBoxOpen, setOtpBoxOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(30);
  const [disableResend, setDisableResend] = useState(false);
  const [otpData, setOtpData] = useState({
    name: initVal.name,
    email: initVal.email,
    phone: initVal.phone,
  });
  const [errMsg, setErrMsg] = useState("");
  const handleChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value,
    });
  };
  const handleNumberEdit = () => {
    setLoading(false);
    setOtpBoxOpen(!otpBoxOpen);
  };
  const onSignupDup = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(otpData.name.length < 3){
      setErrMsg("Name: (Size Must Be >= 3)");
      return;
    }

    if (otpData.email.length < 5) {
      setErrMsg("Email: (Size Must Be >= 5)");
      return;
    } else if (!emailRegex.test(otpData.email)) {
      setErrMsg("Invalid Email Format");
      return;
    }

    if(otpData.phone.length !== 10){
      setErrMsg("Mobile: (Must have 10 Digits)");
      return;
    }
    setErrMsg("");
    setLoading(true);
    const formatPh = "+" + ph;
    console.log(formatPh);
    setLoading(false);
    setOtpBoxOpen(true);
    setDisableResend(true);
    setOtpData({
      ...otpData,
      phone: ph,
    });
  };
  const resendOTPDup = () => {
    setDisableResend(true);
  };
  const onOTPVerifyDup = () => {
    setLoading(true);
    if (otp === "123456") {
        console.log("ho gya");
        localStorage.setItem("otpData", JSON.stringify(otpData));
        dispatch(setOtpVerified(true));
        dispatch(setLeadOTPData(otpData));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intrvl;
    if (disableResend && timer > 0) {
      intrvl = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setDisableResend(false);
    } else if (!disableResend) {
      setTimer(30);
    }
    return () => {
      clearInterval(intrvl);
    };
  }, [disableResend, timer]);

  useEffect(() => {
    localStorage.setItem("otpData", JSON.stringify(otpData));
  }, [otpData]);

  return (
    <MainOtpUI
      otpBoxOpen={otpBoxOpen}
      handleNumberEdit={handleNumberEdit}
      ph={ph}
      errMsg={errMsg}
      otp={otp}
      setOtp={setOtp}
      otpData={otpData}
      handleChange={handleChange}
      setPh={setPh}
      setOtpData={setOtpData}
      resendOTPDup={resendOTPDup}
      disableResend={disableResend}
      timer={timer}
      onOTPVerifyDup={onOTPVerifyDup}
      loading={loading}
      onSignupDup={onSignupDup}
    />
  );
}

export default OTPpage;