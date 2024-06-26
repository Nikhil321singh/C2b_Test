import { useState, useEffect } from "react";
import styles from "./ContOTP.module.css";
import optImg from "../../assets/otpLogo.svg";
import OtpInput from "otp-input-react";

import { useNavigate } from "react-router-dom";

import { auth } from "../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setOtpVerified } from "../../store/slices/otpSlice";
import LoadingSpinner from "../LoadingSpinner";
import { MdEdit } from "react-icons/md";

const ContOTP = (props) => {
  const navigate = useNavigate();

  const deviceSelected = sessionStorage.getItem("DeviceType");
  console.log(deviceSelected);

  const [ph, setPh] = useState("");
  const [otpBoxOpen, setOtpBoxOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  //for resend otp
  const [timer, setTimer] = useState(30);
  const [disableResend, setDisableResend] = useState(false);
  const [firstTime, setFirstIme] = useState(true);
  const [otpData, setOtpData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value,
    });
  };

  const continueOTPHandler = () => {
    props.setContinueOTPOpen(false);
  };

  function onCaptchVerify() {
    console.log(auth);
    // For Firebase version 9 and above
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // ...
      },
    });
  }

  //on submit phone number
  function onSignup(event) {
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
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        console.log("ho gya");
        dispatch(setOtpVerified(true));
        navigate("/inputnumber");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  const handleNumberEdit = () => {
    setLoading(false);
    setOtpBoxOpen(!otpBoxOpen);
  };

  //resend otp
  const resendOTP = () => {
    // Start the countdown timer
    setDisableResend(true);

    const appVerifier = window.recaptchaVerifier;
    const formatPh = "+91" + ph;

    // Resend the OTP without changing the loading state
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
    let interval;
    if (disableResend && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (!disableResend) {
      setTimer(30);
    } else if (timer === 0) {
      setDisableResend(false);
    }
    return () => {
      clearInterval(interval);
    };
  }, [disableResend, timer]);

  const onSignupDup = () => {
    setLoading(true);
    const formatPh = "+" + ph;
    console.log(formatPh);
    setLoading(false);
    setOtpBoxOpen(true);
    setDisableResend(true);
    console.log("OTP sent successfully!");
  };

  const resendOTPDup = () => {
    setDisableResend(true);
    const formatPh = "+" + ph;
    console.log("OTP resent successfully! to - " + { formatPh });
  };

  const onOTPVerifyDup = () => {
    setLoading(true);
    console.log(otp);

    if (otp === "123456") {
      console.log("ho gya");
      dispatch(setOtpVerified(true));
      navigate("/inputnumber");
    } else {
      console.log("wrong otp");
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("otpData", JSON.stringify(otpData));
  }, [otpData]);

  console.log(ph);
  return (
    <div className={`${styles.contopt_page} z-20`}>
      <div className={` ${styles.optbox_wrap}`}>
        <div className={`${styles.optimg_wrap}`}>
          <img onClick={continueOTPHandler} src={optImg} />
        </div>
        <div className={`${styles.opt_heading} `}>
          <p className={`font-bold text-2xl`}>OTP Verificaiton</p>
          {otpBoxOpen ? (
            <div className={`flex ${styles.Editresponsive}`}>
              <span className="flex flex-col items-center justify-center text-sm font-medium opacity-60">
                OTP sent to
              </span>
              <span
                className="text-sm font-medium text-left ml-[2px] text-[#ec2752] flex items-center"
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
            <span className="flex flex-col items-center justify-center text-sm font-medium opacity-60">
              We will send you a one-time Password to this number.
            </span>
          )}
        </div>

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
                border: "2px solid #EC2752",
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
                placeholder="Enter Name"
                value={otpData.name}
                onChange={handleChange}
                className="border-2 border-[#EC2752] py-1 rounded-lg pl-[12px]"
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email"
                value={otpData.email}
                onChange={handleChange}
                className="border-2 border-[#EC2752] py-1 rounded-lg pl-[12px]"
              />
            </div>
            {/* <div>
              <PhoneInput
                inputProps={{
                  required: true,
                }}
                className="w-[85%] border-2 border-[#EC2752] py-1 rounded-lg"
                specialLabel=""
                country={"in"}
                areaCodes={91}
                value={ph}
                onChange={setPh}
                placeholder="Enter Phone Number"
                inputStyle={{
                  // width: "85%",
                  // borderBottom: "2px solid #EC2752",
                  border: "none",
                }}
              />
            </div> */}
            <div className="w-[100%] flex flex-row">
              <div className="flex   border-[#EC2752] rounded-lg border-2  w-[85%] flex-row justify-start">
                <span className="px-3 py-1 text-gray-600 bg-gray-200 rounded-lg">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={ph}
                  maxlength="10"
                  onChange={(e) => {
                    setPh(e.target.value);
                    setOtpData({
                      ...otpData,
                      ["phone"]: e.target.value,
                    });
                  }}
                  className=""
                  placeholder="Enter your Mobile"
                />
              </div>
            </div>
          </div>
        )}

        {otpBoxOpen && (
          <div className={styles.resend_otp_wrap}>
            <div className="flex flex-row gap-2  w-[300px] justify-center  text-sm font-medium">
              <span className="opacity-60 min-w-[132px] ">
                Didn't Receive OTP?
              </span>
              <button
                className=" text-left  min-w-[100px]"
                onClick={resendOTPDup}
                disabled={disableResend}
              >
                {disableResend ? `Resend in ${timer}` : "Resend OTP"}
              </button>
            </div>
            {/* <div className="flex  flex-row gap-2  w-[300px] justify-center text-sm font-medium">
              <span className=" opacity-60 min-w-[132px]">
                Edit Phone Number?
              </span>
              <button
                className=" text-left min-w-[100px]"
                onClick={handleNumberEdit}
              >
                Edit Number
              </button>
            </div> */}
          </div>
        )}

        <div className={`${styles.otp_button_wrap}`}>
          {otpBoxOpen ? (
            <>
              <button
                onClick={onOTPVerifyDup}
                className={`${loading && "opacity-[.8]"}`}
                disabled={loading}
              >
                {loading && (
                  <div className={`${styles.spinner} -ml-4`}>
                    <LoadingSpinner />
                  </div>
                )}
                {loading ? (
                  <span className="-ml-4">Loading</span>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>
              <div id="recaptcha"></div>
            </>
          ) : (
            <>
              <button
                onClick={onSignupDup}
                className={`${loading && "opacity-[.8]"}`}
                disabled={loading}
              >
                {loading && (
                  <div className={`${styles.spinner} -ml-4`}>
                    <LoadingSpinner />
                  </div>
                )}
                {loading ? (
                  <span className="-ml-4">Loading</span>
                ) : (
                  <span>Get OTP</span>
                )}
              </button>
              <div id="recaptcha"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContOTP;
