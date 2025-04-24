import React, { useState, useEffect } from "react";
import styles from "./ContOTP.module.css";
import optImg from "../../assets/otpLogo.svg";
import OtpInput from "otp-input-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setOtpVerified } from "../../store/slices/otpSlice";
import LoadingSpinner from "../LoadingSpinner";
import { MdEdit } from "react-icons/md";
import ProfileBox from "../ProfileBox/ProfileBox";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import axios from "axios";
import { auth } from "../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { IoArrowBack } from "react-icons/io5";
const initOtp = {
  name: "",
  email: "",
  phone: "",
};
const buyBackUrl = import.meta.env.VITE_BUYBACK_URL;
const ContOTP = ({ setContinueOTPOpen }) => {
  const navigate = useNavigate();
  const deviceSelected = sessionStorage.getItem("DeviceType");
  console.log(deviceSelected);
  const [ph, setPh] = useState("");
  const [otpBoxOpen, setOtpBoxOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(30);
  const [disableResend, setDisableResend] = useState(false);
  const [otpData, setOtpData] = useState(initOtp);
  const [errMsg, setErrMsg] = useState("");
    const [firstTime, setFirstIme] = useState(true);

    const handleChange = (e) => {
      const { name, value } = e.target;
      let newValue = value;
      if (name === "name") {
        newValue = value.replace(/[^a-zA-Z\s]/g, ""); // allow only letters and spaces
      }
      setOtpData({
        ...otpData,
        [name]: newValue,
      });
    };
  const handleNumberEdit = () => {
    setLoading(false);
    setOtpBoxOpen(!otpBoxOpen);
  };

    function onCaptchVerify() {
      console.log(auth);
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
        size: "invisible",
        callback: (response) => {
        },
      });
    }

    function onSignup(event) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (otpData.name.length < 3) {
        setErrMsg("Please enter a name with at least 3 characters.");
        return;
      }

      if (otpData.email.length < 5) {
        setErrMsg("Please enter a valid email address (minimum 5 characters).");
        return;
      } else if (!emailRegex.test(otpData.email)) {
        setErrMsg("Invalid Email Format");
        return;
      }

      if (otpData.phone.length !== 10) {
        setErrMsg("Mobile: (Must have 10 Digits)");
        return;
      }
      setErrMsg("");
      setLoading(true);
      if (firstTime) {
        onCaptchVerify();
        setFirstIme(false);
      }

      const appVerifier = window.recaptchaVerifier;
      const formatPh = "+91" + ph;
      console.log(formatPh);

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
          const leadId = sessionStorage.getItem("LeadId");
      window.confirmationResult
        .confirm(otp)
        .then(async (res) => {
          console.log("ho gya");
             if (
               currentDomain === buyBackUrl
             ) {
               const response = await axios.post(
                 `${
                   import.meta.env.VITE_REACT_APP_ENDPOINT
                 }/api/questionnaires/customerDetail`,
                 {
                   name: otpData.name,
                   emailId: otpData.email,
                   phoneNumber: otpData.phone,
                   leadId,
                 }
               );
               console.log(response);
               if (response?.status === 200) {
                 navigate("/thankyou");
               } else {
                 setErrMsg("Failed to Save Details");
               }
               setLoading(false);
             } else if (
               currentDomain !== buyBackUrl
             ) {
               dispatch(setOtpVerified(true));
               navigate("/inputnumber");
             } else {
               setLoading(false);
             }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          if (err?.message?.includes("INVALID_CODE") || err?.code === "auth/invalid-verification-code") {
            toast.error("The OTP you entered is incorrect. Please try again.");
          } else {
            toast.error("Something went wrong. Please try again later.");
          }
        });
    }

    const resendOTP = () => {
      setDisableResend(true);

      const appVerifier = window.recaptchaVerifier;
      const formatPh = "+91" + ph;

      signInWithPhoneNumber(auth, formatPh, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          console.log("OTP resent successfully!");
        })
        .catch((error) => {
          console.log(error);
        });
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
      resendOTP={resendOTP}
      disableResend={disableResend}
      timer={timer}
      onOTPVerify={onOTPVerify}
      loading={loading}
      onSignup={onSignup}
    />
  );
};

export default ContOTP;

export const MainOtpUI = ({
  otpBoxOpen,
  handleNumberEdit,
  ph,
  errMsg,
  otp,
  setOtp,
  otpData,
  handleChange,
  setPh,
  setOtpData,
  resendOTP,
  disableResend,
  timer,
  onOTPVerify,
  loading,
  onSignup,
}) => {
  const navigate = useNavigate();
  return (
    <div className={`${styles.contopt_page}`} style={{ zIndex: 9999 }}>
      <div className="absolute top-4 md:top-0 bg-white flex items-center justify-between w-full pr-2 py-2 rounded-md">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-xs ml-2 flex items-center justify-center text-white bg-[--primary-color] hover:cursor-pointer p-2 rounded-full"
            >
              <IoArrowBack
                size={24}
              />
            </button>
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-[150px] max-w-[150px] object-contain cursor-pointer ml-2"
              src={GREST_LOGO}
              alt="app logo"
              />
          </div>
        <ProfileBox />
      </div>
      <div className={` ${styles.optbox_wrap}`}>
        <div className={`${styles.optimg_wrap}`}>
          <img  src={optImg} />
        </div>
        <div className={`${styles.opt_heading} `}>
          <p className={`font-bold text-2xl`}>OTP Verificaiton</p>
          {otpBoxOpen ? (
            <div className={`flex ${styles.Editresponsive}`}>
              <span className="flex flex-col items-center justify-center text-sm font-medium opacity-60">
                OTP sent to
              </span>
              <span
                className="text-sm font-medium text-left ml-[2px] text-primary flex items-center"
                onClick={handleNumberEdit}
              >
                <span className="text-sm font-medium opacity-60 text-[#000000]">
                  {" "}
                  +91-{ph}
                </span>
                <MdEdit /> Edit no.
              </span>
            </div>
          ) : (
            <span
              className={`flex flex-col items-center justify-center text-sm font-medium ${
                errMsg ? "text-red-500" : "opacity-60"
              } min-h-[40px]`}
            >
              {errMsg
                ? errMsg
                : "We will send you a one-time Password to this number."}
            </span>
          )}
        </div>
        <OTPComp
          otpBoxOpen={otpBoxOpen}
          otp={otp}
          setOtp={setOtp}
          otpData={otpData}
          handleChange={handleChange}
          errMsg={errMsg}
          ph={ph}
          setPh={setPh}
          setOtpData={setOtpData}
        />
        {otpBoxOpen && (
          <div className={styles.resend_otp_wrap}>
            <div className="flex flex-row gap-2  w-[300px] justify-center  text-sm font-medium">
              <span className="opacity-60 min-w-[132px] ">
                Didn't Receive OTP?
              </span>
              <button
                className=" text-left  min-w-[100px]"
                onClick={resendOTP}
                disabled={disableResend}
              >
                {disableResend ? `Resend in ${timer}` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        <div className={`${styles.otp_button_wrap}`}>
          {otpBoxOpen ? (
            <>
              <ActionButton
                onClick={onOTPVerify}
                loading={loading}
                disabled={!otp}
              >
                Verify OTP
              </ActionButton>
              <div id="recaptcha"></div>
            </>
          ) : (
            <>
              <ActionButton onClick={onSignup} loading={loading}>
                Get OTP
              </ActionButton>
              <div id="recaptcha"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, loading, disabled, children }) => (
  <button
    onClick={onClick}
    className={`${loading || disabled ? "opacity-[.8]" : ""}`}
    disabled={loading || disabled}
  >
    {loading ? (
      <>
        <div className={`${styles.spinner} -ml-4`}>
          <LoadingSpinner />
        </div>
        <span className="-ml-4">Loading</span>
      </>
    ) : (
      <span>{children}</span>
    )}
  </button>
);

const OTPComp = ({
  otpBoxOpen,
  otp,
  setOtp,
  otpData,
  errMsg,
  handleChange,
  ph,
  setPh,
  setOtpData,
}) => {
  return (
    <React.Fragment>
      {otpBoxOpen ? (
        <div className={`${styles.otp_field_wrap}`}>
          <OtpInput
            value={otp}
            onChange={setOtp}
            OTPLength={6}
            otpType="number"
            disabled={false}
            autoFocus
            inputStyles={{
              border: "2px solid var(--primary-color)",
              borderRadius: ".55rem",
              outline: "none",
              marginRight: "10px",
            }}
            className={styles.otp_field}
          />
        </div>
      ) : (
        <div className={`${styles.form_fields_wrap}`}>
          <div>
            <input
              id="name"
              name="name"
              placeholder="Enter Name *"
              value={otpData?.name}
              onChange={handleChange}
              className="border-2 border-primary py-1 rounded-lg pl-[12px]"
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter Email *"
              value={otpData?.email}
              onChange={handleChange}
              className="border-2 border-primary py-1 rounded-lg pl-[12px]"
            />
          </div>
          <div className="w-[100%] flex flex-row">
            <div className="flex   border-primary rounded-lg border-2  w-[85%] flex-row justify-start">
              <span className="px-3 py-1 text-gray-600 bg-gray-200 rounded-lg">
                +91
              </span>
              <input
                type="tel"
                id="phone"
                value={ph}
                maxLength="10"
                onChange={(e) => {
                  setPh(e.target.value);
                  setOtpData({
                    ...otpData,
                    ["phone"]: e.target.value,
                  });
                }}
                className=""
                placeholder="Enter your Mobile *"
              />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
