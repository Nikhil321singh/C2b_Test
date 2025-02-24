import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtpVerified } from "../store/slices/otpSlice";
import { setLeadOTPData } from "../store/slices/responseSlice";
import { MainOtpUI } from "../components/ContOTP/ContOTP";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

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
    const [firstTime, setFirstIme] = useState(true);
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

  useEffect(() => {
    localStorage.setItem("otpData", JSON.stringify(otpData));
  }, [otpData]);

    function onCaptchVerify() {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
        size: "invisible",
        callback: (response) => {
          //abc
        },
      });
    }

    function onSignup(event) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (otpData.phone.length !== 10) {
         setErrMsg("Mobile: (Must have 10 Digits)");
         return;
       }

      if (otpData.email.length < 5) {
        setErrMsg("Email: (Size Must Be >= 5)");
        return;
      } else if (!emailRegex.test(otpData.email)) {
        setErrMsg("Invalid Email Format");
        return;
      }

      if (otpData.name.length < 3) {
        setErrMsg("Name: (Size Must Be >= 3)");
        return;
      }

      setLoading(true);
      setErrMsg("");
      if (firstTime) {
        onCaptchVerify();
        setFirstIme(false);
      }

      const formatPh = "+91" + ph;
      const appVerifier = window.recaptchaVerifier;
      console.log(formatPh);
      localStorage.setItem("otpData", JSON.stringify(otpData));
      signInWithPhoneNumber(auth, formatPh, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          setLoading(false);
          setOtpBoxOpen(true);
          setDisableResend(true);
          console.log("OTP sent successfully!");
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });

      setOtpData({
        ...otpData,
        phone: ph,
      });
    }

    function onOTPVerify() {
      setLoading(true);
      window.confirmationResult
        .confirm(otp)
        .then(async (res) => {
          localStorage.setItem("otpData", JSON.stringify(otpData));
          dispatch(setOtpVerified(true));
          dispatch(setLeadOTPData(otpData));
          console.log("ho gya");
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }

    const resendOTP = () => {
      setDisableResend(true);

      const formatPh = "+91" + ph;
      const appVerifier = window.recaptchaVerifier;

      signInWithPhoneNumber(auth, formatPh, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          console.log("OTP resent successfully!");
        })
        .catch((error) => {
          console.log(error);
          console.log(error + "");
        });
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
      onOTPVerify={onOTPVerify}
      loading={loading}
      onSignup={onSignup}
      setOtp={setOtp}
      otpData={otpData}
      handleChange={handleChange}
      setPh={setPh}
      setOtpData={setOtpData}
      resendOTP={resendOTP}
      disableResend={disableResend}
    />
  );
}

export default OTPpage;
