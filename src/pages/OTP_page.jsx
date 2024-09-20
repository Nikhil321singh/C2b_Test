import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtpVerified } from "../store/slices/otpSlice";
import { setLeadOTPData } from "../store/slices/responseSlice";
import { MainOtpUI } from "../components/ContOTP/ContOTP";

function OTPpage() {
  const initVal = useSelector((state) => state.responseData);
  const [ph, setPh] = useState(initVal.phone);
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(30);
  const [otpBoxOpen, setOtpBoxOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disableResend, setDisableResend] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [otpData, setOtpData] = useState({
    name: initVal.name,
    email: initVal.email,
    phone: initVal.phone,
  });

  const handleNumberEdit = () => {
    setLoading(false);
    setOtpBoxOpen(!otpBoxOpen);
  };

  const handleChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value,
    });
  };

  const onSignupDup = () => {
    const emailRegex1 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (otpData.name.length < 3) {
      setErrMsg("Name: (Size Must Be >= 3)");
      return;
    }
    if (otpData.email.length < 5) {
      setErrMsg("Email: (Size Must Be >= 5)");
      return;
    } else if (!emailRegex1.test(otpData.email)) {
      setErrMsg("Invalid Email Format");
      return;
    }
    if (otpData.phone.length !== 10) {
      setErrMsg("Mobile: (Must have 10 Digits)");
      return;
    }

    setErrMsg("");
    setLoading(false);
    setDisableResend(true);
    setOtpBoxOpen(true);
    setOtpData({
      ...otpData,
      phone: ph,
    });
  };

  const onOTPVerifyDup = () => {
    setLoading(true);
    if (otp === "123456") {
      localStorage.setItem("otpData", JSON.stringify(otpData));
      dispatch(setOtpVerified(true));
      dispatch(setLeadOTPData(otpData));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("otpData", JSON.stringify(otpData));
  }, [otpData]);

  const resendOTPDup = () => {
    setDisableResend(true);
  };

  useEffect(() => {
    let intrvll;
    if (disableResend && timer > 0) {
      intrvll = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setDisableResend(false);
    } else if (!disableResend) {
      setTimer(30);
    }
    return () => {
      clearInterval(intrvll);
    };
  }, [disableResend, timer]);

  return (
    <MainOtpUI
      otpBoxOpen={otpBoxOpen}
      handleNumberEdit={handleNumberEdit}
      ph={ph}
      errMsg={errMsg}
      otp={otp}
      timer={timer}
      onOTPVerifyDup={onOTPVerifyDup}
      loading={loading}
      onSignupDup={onSignupDup}
      setOtp={setOtp}
      otpData={otpData}
      handleChange={handleChange}
      setPh={setPh}
      setOtpData={setOtpData}
      resendOTPDup={resendOTPDup}
      disableResend={disableResend}
    />
  );
}

export default OTPpage;
