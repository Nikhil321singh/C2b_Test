import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import styles from "./QuoteModal.module.css";
import OtpInput from "otp-input-react";
import { useDispatch } from "react-redux";
import { setOtpVerified } from "../../store/slices/otpSlice";
import toast from "react-hot-toast";
import axios from "axios";
import { MdEdit } from "react-icons/md";

const Failerr = "Failed To Save Quote";
const quoteText = "Quote Saved Successfully";

const QuoteModal = ({ show, handleClose, setQuoteSaved, quoteId, bonusPrice }) => {
  const leadData = JSON.parse(sessionStorage.getItem("responsedatadata"));
  const ExactQuote = sessionStorage.getItem("ExactQuote");
  const showHideClassName = show ? `${styles.modal} ${styles.displayBlock}` : ` ${styles.displayNone}`;
  const userToken = sessionStorage.getItem("authToken");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ph, setPh] = useState("");
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(30);
  const [disableResend, setDisableResend] = useState(false);
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    setShowOtp(false);
  }, [show]);
  const handleNumberEdit = () => {
    setLoading(false);
    setShowOtp(false);
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
    const data = {
      lead_id: leadData.id,
      phoneNumber: ph,
      name: name,
      emailId: userEmail,
      reason: reason,
      bonusPrice: bonusPrice,
    };
    setUserData(data);
    console.log(data);
    if (ExactQuote === "true") {
      if (ExactQuote === "true") {
        axios
          .post(
            `${
              import.meta.env.VITE_REACT_APP_ENDPOINT
            }/api/leadSet/orderCreated`,
            data,
            { headers: { authorization: userToken } }
          )
          .then((res) => {
            console.log(res);
            toast.success(quoteText);
            setQuoteSaved(true);
            dispatch(setOtpVerified(true));
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .post(
            `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/leadSet/quickQoute`,
            userData,
            { headers: { authorization: userToken } }
          )
          .then((res) => {
            console.log(res);
            toast.success(quoteText);
            setQuoteSaved(true);
            dispatch(setOtpVerified(true));
          })
          .catch((err) => {
            console.log(err);
          });
      }
      setLoading(false);
    } else {
      axios
        .post(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/leadSet/quickQoute`,
          data,
          { headers: { authorization: userToken } }
        )
        .then((res) => {
          toast.success(quoteText);
          handleClose();
          setQuoteSaved(true);
        })
        .catch((err) => {
          toast.error(Failerr);
          handleClose();
        });
        setLoading(false);
    }
    handleClose();
  };

  const resendOTPDup = () => {
    setDisableResend(true);
  };

  const onOTPVerifyDup = () => {
    setLoading(true);
    if (ExactQuote === "true") {
      axios
        .post(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/leadSet/orderCreated`,
          userData,
          { headers: { authorization: userToken } }
        )
        .then((res) => {
          setLoading(false);
          setLoading(false);
          toast.success(quoteText);
          setQuoteSaved(true);
          dispatch(setOtpVerified(true));
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      axios
        .post(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/leadSet/quickQoute`,
          userData,
          { headers: { authorization: userToken } }
        )
        .then((res) => {
          setLoading(false);
          toast.success(quoteText);
          setQuoteSaved(true);
          dispatch(setOtpVerified(true));
        })
        .catch((err) => {
          setLoading(false);
        });
    }
    handleClose();
  };

  return (
    <>
      <div className={showHideClassName}>
        <section
          className={`${styles.modalMain}  ${
            showOtp ? styles.smallHeight : ""
          }`}
        >
          <OTPCOmp
            showOtp={showOtp}
            quoteId={quoteId}
            setName={setName}
            name={name}
            ph={ph}
            setPh={setPh}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            isOther={isOther}
            setIsOther={setIsOther}
            otherReason={otherReason}
            setReason={setReason}
            setOtherReason={setOtherReason}
            onSignupDup={onSignupDup}
            handleNumberEdit={handleNumberEdit}
            resendOTPDup={resendOTPDup}
            disableResend={disableResend}
            onOTPVerifyDup={onOTPVerifyDup}
            loading={loading}
            timer={timer}
          />
          <div>
            <IoCloseCircle
              onClick={() => {
                setName("");
                setUserEmail("");
                setPh("");
                setReason("");
                setOtherReason("");
                setIsOther(false);
                handleClose();
              }}
              size={24}
              className="text-[#EC2752] absolute top-5 right-4"
            />
          </div>
        </section>
        <div id="recaptcha"></div>
      </div>
    </>
  );
};

export default QuoteModal;

const OTPCOmp = ({
  showOtp,
  quoteId,
  setName,
  name,
  ph,
  setPh,
  userEmail,
  setUserEmail,
  isOther,
  setIsOther,
  otherReason,
  setReason,
  setOtherReason,
  onSignupDup,
  handleNumberEdit,
  resendOTPDup,
  disableResend,
  onOTPVerifyDup,
  loading,
  timer,
}) => {
  const [otp, setOtp] = useState("");
  return (
    <React.Fragment>
      {!showOtp ? (
        <div>
          <p className="block text-xl font-medium display">Save Quote</p>
          <div className="flex flex-col gap-2 pb-4 mt-4">
            <input
              className="p-2 border-2 outline-none"
              type="text"
              placeholder={quoteId}
              value={quoteId}
              disabled
            />
            <input
              className="p-2 border-2 outline-none"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="p-2 border-2 outline-none"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              type="number"
              placeholder="Mobile"
            />
            <input
              className="p-2 border-2 outline-none"
              type="email"
              placeholder="Email Id"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <p className="font-medium">Please select reason</p>
            <label className="flex items-center gap-2">
              <input
                onClick={() => {
                  setReason("Quote value is too low.");
                  setIsOther(false);
                }}
                type="radio"
                value={1}
                name="reason"
              />{" "}
              <span>Quote value is too low.</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                onClick={() => {
                  setReason("Customer just wanted to know the device value.");
                  setIsOther(false);
                }}
                type="radio"
                value={2}
                name="reason"
              />{" "}
              <span>Customer just wanted to know the device value.</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                onClick={() => {
                  setReason("Customer will come later.");
                  setIsOther(false);
                }}
                type="radio"
                value={3}
                name="reason"
              />{" "}
              <span>Customer will come later.</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                onClick={() => setIsOther(true)}
                type="radio"
                id="other"
                name="reason"
                value={4}
              />{" "}
              <span>Other, please specify below.</span>
            </label>
            {isOther && (
              <textarea
                value={otherReason}
                onChange={(e) => {
                  setOtherReason(e.target.value);
                  setReason(e.target.value);
                }}
                className="outline-none border-2 p-2 h-[100px]"
                placeholder="Please type your reason"
              />
            )}
            <button
              onClick={onSignupDup}
              className="text-white bg-[#EC2752] p-2 text-xl rounded-md"
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="block text-xl font-medium display">Customer consent</p>
          <div className="flex flex-col gap-2 mt-4 mb-2">
            <div className="flex tracking-tight">
              <p>Enter OTP sent to +91{ph}</p>
              <span
                className="text-sm font-medium text-left ml-[2px] text-[#ec2752] flex items-center tracking-tight"
                onClick={handleNumberEdit}
              >
                <MdEdit /> Edit no.
              </span>
            </div>
            <OtpInput
              value={otp}
              onChange={setOtp}
              OTPLength={6}
              otpType="number"
              disabled={false}
              autoFocus
              className=""
              inputStyles={{
                border: "1px solid black",
                borderRadius: "5px",
              }}
            ></OtpInput>
          </div>
          <div className="flex flex-row items-center justify-center text-sm font-medium">
            <span className="opacity-60">Didn't Receive OTP?</span>
            <button
              className="ml-2 text-[#EC2752]"
              onClick={resendOTPDup}
              disabled={disableResend}
            >
              {disableResend ? `Resend in ${timer}` : "Resend OTP"}
            </button>
          </div>
          <button
            onClick={onOTPVerifyDup}
            disabled={loading}
            className="text-white mt-8 bg-[#EC2752] p-2 text-xl rounded-md"
          >
            Submit Otp
          </button>
        </div>
      )}
    </React.Fragment>
  );
};
