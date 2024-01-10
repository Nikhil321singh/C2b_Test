import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import styles from "./QuoteModal.module.css";
import OtpInput from "otp-input-react";
import { auth } from "../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import PhoneInput from "react-phone-input-2";
const QuoteModal = ({ show, handleClose }) => {
  const showHideClassName = show
    ? `${styles.modal} ${styles.displayBlock}`
    : ` ${styles.displayNone}`;
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ph, setPh] = useState("");

  useEffect(() => {
    setShowOtp(false);
  }, [show]);

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

  function onSignup(event) {
    setShowOtp(!showOtp);
    setLoading(true);
    onCaptchVerify();

    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+91" + ph;

    console.log(formatPh);

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        // toast.success("OTP sended successfully!");
        console.log("OTP sent successfully!");
      })
      .catch((error) => {
        console.log(error);

        setLoading(false);
      });
  }

  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        // setUser(res.user);
        setLoading(false);
        // console.log("ho gya");
        setChange(!change);
        console.log("ho gya");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }
  return (
    <div className={showHideClassName}>
      <section
        className={`${styles.modalMain}  ${showOtp ? styles.smallHeight : ""}`}
      >
        {!showOtp ? (
          <div>
            <p className="display block font-medium text-xl">Save Quote</p>
            <div className="flex flex-col gap-2 mt-4 pb-4">
              <input
                className="outline-none border-2 p-2"
                type="text"
                placeholder="Quote Id"
              />
              <input
                className="outline-none border-2 p-2"
                type="text"
                placeholder="Name"
              />
              <input
                className="outline-none border-2 p-2"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                type="number"
                placeholder="Mobile"
              />
              <input
                className="outline-none border-2 p-2"
                type="email"
                placeholder="Email Id"
              />
              <p className="font-medium">Please select reason</p>
              <label className="flex items-center gap-2">
                <input type="radio" name="reason" />{" "}
                <span>Quote value is too low.</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="reason" />{" "}
                <span>Customer just wanted to know the device value.</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="reason" />{" "}
                <span>Customer will come later.</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="reason" />{" "}
                <span>Other, please specify below.</span>
              </label>
              <textarea
                className="outline-none border-2 p-2 h-[100px]"
                placeholder="Write here"
              />

              <button
                onClick={onSignup}
                className="text-white bg-[#EC2752] p-2 rounded-md"
              >
                Submit
              </button>
            </div>

            <div id="recaptcha"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="display block font-medium text-xl">
              Customer consent
            </p>
            <input
              type="number"
              placeholder="mobile number"
              className="outline-none border-2 p-2 rounded"
            />
            <div className="mt-4 flex flex-col gap-2">
              <p>Please enter the OTP</p>
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
            <button
              onClick={onOTPVerify}
              className="text-white mt-10 bg-[#EC2752] p-2 rounded-md"
            >
              Submit
            </button>
            <div id="recaptcha"></div>
          </div>
        )}
        <div>
          <IoCloseCircle
            onClick={handleClose}
            size={24}
            className="text-[#EC2752] absolute top-5 right-4"
          />
        </div>
      </section>
    </div>
  );
};

export default QuoteModal;
